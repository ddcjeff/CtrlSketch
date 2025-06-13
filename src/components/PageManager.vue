<!-- src/components/PageManager.vue -->
<template>
  <div 
    class="page-manager" 
    :class="{ 
      'dark-theme': isDarkTheme, 
      'vertical': tabPosition === 'right',
      'pinned': isPinned,
      'draggable': !isPinned
    }"
    :style="positionStyle"
    @mousedown="startDrag"
  >
    <div class="page-manager-header">
      <div class="drag-handle" @mousedown.stop="startDrag">
        <span class="drag-icon">≡</span>
      </div>
      <div class="position-controls">
        <button class="position-btn" @click="togglePin" :title="isPinned ? 'Unpin' : 'Pin'">
          <span class="pin-icon">{{ isPinned ? '📌' : '📍' }}</span>
        </button>
        <button class="position-btn" @click="resetPosition" title="Reset Position">
          <span class="reset-icon">↺</span>
        </button>
      </div>
    </div>
    <div class="page-tabs" :class="{ 'vertical-tabs': tabPosition === 'right', 'inline-tabs': tabPosition !== 'right' }">
      <div
        v-for="page in pages"
        :key="page.id"
        class="tab-item"
        :class="{ 
          'active': page.id === activePageId,
          'vertical-tab': tabPosition === 'right',
          'inline-tab': tabPosition !== 'right'
        }"
        @click="selectPage(page.id)"
        @contextmenu.prevent="showContextMenu($event, page)"
      >
        <span class="page-name">{{ page.name }}</span>
        <span v-if="page.type === 'background'" class="page-type-badge">BG</span>
      </div>
      <button 
        class="add-tab-button" 
        :class="{ 'vertical-add-button': tabPosition === 'right' }"
        @click="addPage" 
        title="Add New Page"
      >+</button>
    </div>
    
    <!-- Context Menu -->
    <div v-if="showContextMenuFor" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-item" @click="renamePage(showContextMenuFor)">
        <span class="context-menu-icon">✏️</span> Rename
      </div>
      <div class="context-menu-item" @click="togglePageType(showContextMenuFor)">
        <span class="context-menu-icon">🔄</span> 
        {{ showContextMenuFor.type === 'foreground' ? 'Set as Background' : 'Set as Foreground' }}
      </div>
      <div class="context-menu-item" @click="duplicatePage(showContextMenuFor)">
        <span class="context-menu-icon">📋</span> Duplicate
      </div>
      <div class="context-menu-item" @click="deletePage(showContextMenuFor.id)" 
           :class="{ 'disabled': pages.length <= 1 }">
        <span class="context-menu-icon">🗑️</span> Delete
      </div>
    </div>
    
    <!-- Add Page Dialog -->
    <AddPageDialog
      :show="showAddPageDialog"
      :initial-data="newPageData"
      :background-pages="backgroundPages"
      :is-dark-theme="isDarkTheme"
      @close="showAddPageDialog = false"
      @add="confirmAddPage"
    />
    
    <!-- Rename Dialog -->
    <div v-if="showRenameDialog" class="rename-dialog-overlay" @click="showRenameDialog = false">
      <div class="rename-dialog" @click.stop>
        <div class="dialog-header">
          <h3>Rename Page</h3>
          <button class="close-button" @click="showRenameDialog = false">×</button>
        </div>
        <div class="dialog-content">
          <div class="form-group">
            <label for="newPageName">New Name:</label>
            <input
              type="text"
              id="newPageName"
              v-model="renameData.name"
              class="form-control"
              @keyup.enter="confirmRename"
            />
          </div>
        </div>
        <div class="dialog-footer">
          <button class="cancel-button" @click="showRenameDialog = false">Cancel</button>
          <button class="ok-button" @click="confirmRename">Rename</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AddPageDialog from './AddPageDialog.vue';

export default {
  components: { AddPageDialog },
  name: 'PageManager',
  props: {
    isDarkTheme: { type: Boolean, default: false },
    tabPosition: { type: String, default: 'top' }, // 'top', 'bottom', or 'right'
    pages: { type: Array, default: () => [] }
  },
  data() {
    return {
      activePageId: '',
      showAddPageDialog: false,
      showRenameDialog: false,
      showContextMenuFor: null,
      contextMenuStyle: {
        top: '0px',
        left: '0px'
      },
      newPageData: {
        name: '',
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default',
        shapes: []
      },
      renameData: {
        id: '',
        name: ''
      },
      // Draggable position properties
      position: {
        x: 10,
        y: 10
      },
      isDragging: false,
      dragOffset: {
        x: 0,
        y: 0
      },
      isPinned: false,
      savedPositions: {
        top: { x: 10, y: 10 },
        right: { x: window.innerWidth - 200, y: 10 },
        bottom: { x: 10, y: window.innerHeight - 100 },
        left: { x: 10, y: 10 }
      }
    };
  },
  computed: {
    activePage() {
      return this.pages.find(page => page.id === this.activePageId) || this.pages[0];
    },
    backgroundPages() {
      return this.pages.filter(page => page.type === 'background');
    },
    visibleShapes() {
      // Get shapes from active page
      const activePageShapes = this.activePage?.shapes || [];
      
      // If active page is foreground and has a background page, merge with background shapes
      if (this.activePage?.type === 'foreground' && this.activePage?.backgroundPageId) {
        const backgroundPage = this.pages.find(page => page.id === this.activePage.backgroundPageId);
        if (backgroundPage) {
          return [...backgroundPage.shapes, ...activePageShapes];
        }
      }
      
      return activePageShapes;
    },
    positionStyle() {
      return {
        position: 'absolute',
        top: `${this.position.y}px`,
        left: `${this.position.x}px`,
        zIndex: 1000
      };
    }
  },
  mounted() {
    // Close context menu when clicking outside
    document.addEventListener('click', this.closeContextMenu);
    document.addEventListener('keydown', this.handleKeyDown);
    
    // Add drag event listeners
    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
    window.addEventListener('resize', this.handleResize);
    
    // Initialize active page if pages exist
    if (this.pages.length > 0 && !this.activePageId) {
      this.activePageId = this.pages[0].id;
      this.$emit('active-page-changed', this.activePage);
    }
    
    // Set initial position based on tab position
    this.setPositionForTabPosition();
    
    // Load saved position if available
    this.loadSavedPosition();
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeContextMenu);
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
    window.removeEventListener('resize', this.handleResize);
  },
  watch: {
    pages: {
      handler(newPages) {
        console.log('Pages changed in PageManager:', newPages.length);
        // Set active page if none is selected
        if (newPages.length > 0 && !this.activePageId) {
          this.activePageId = newPages[0].id;
          this.$emit('active-page-changed', this.activePage);
        }
      },
      immediate: true
    }
  },
  methods: {
    // Draggable methods
    startDrag(event) {
      if (this.isPinned) return;
      
      this.isDragging = true;
      this.dragOffset = {
        x: event.clientX - this.position.x,
        y: event.clientY - this.position.y
      };
      
      // Prevent text selection during drag
      event.preventDefault();
    },
    
    onDrag(event) {
      if (!this.isDragging) return;
      
      // Calculate new position
      const newX = event.clientX - this.dragOffset.x;
      const newY = event.clientY - this.dragOffset.y;
      
      // Apply constraints to keep within window
      this.position = {
        x: Math.max(0, Math.min(window.innerWidth - 200, newX)),
        y: Math.max(0, Math.min(window.innerHeight - 100, newY))
      };
      
      // Save position to localStorage
      this.savePosition();
    },
    
    stopDrag() {
      this.isDragging = false;
    },
    
    togglePin() {
      this.isPinned = !this.isPinned;
      localStorage.setItem('pageManagerPinned', this.isPinned.toString());
    },
    
    resetPosition() {
      this.setPositionForTabPosition();
      this.savePosition();
    },
    
    setPositionForTabPosition() {
      // Set position based on tab position
      if (this.tabPosition === 'right') {
        this.position = { ...this.savedPositions.right };
      } else if (this.tabPosition === 'bottom') {
        this.position = { ...this.savedPositions.bottom };
      } else {
        this.position = { ...this.savedPositions.top };
      }
    },
    
    savePosition() {
      localStorage.setItem('pageManagerPosition', JSON.stringify(this.position));
    },
    
    loadSavedPosition() {
      // Load position from localStorage
      const savedPosition = localStorage.getItem('pageManagerPosition');
      if (savedPosition) {
        try {
          this.position = JSON.parse(savedPosition);
        } catch (e) {
          console.error('Error loading saved position:', e);
        }
      }
      
      // Load pinned state
      const isPinned = localStorage.getItem('pageManagerPinned');
      if (isPinned !== null) {
        this.isPinned = isPinned === 'true';
      }
    },
    
    handleResize() {
      // Ensure the page manager stays within the window after resize
      this.position = {
        x: Math.min(window.innerWidth - 200, this.position.x),
        y: Math.min(window.innerHeight - 100, this.position.y)
      };
      this.savePosition();
    },
    
    addPage() {
      this.newPageData = {
        name: `Page ${this.pages.length + 1}`,
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default',
        shapes: []
      };
      this.showAddPageDialog = true;
    },
    confirmAddPage(pageData) {
      if (!pageData.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      
      const newPage = {
        ...pageData,
        id: `page-${Date.now()}`,
        shapes: []
      };
      
      this.pages.push(newPage);
      this.selectPage(newPage.id);
      this.$emit('pages-updated', this.pages);
      this.$emit('active-page-changed', this.activePage);
    },
    selectPage(pageId) {
      this.activePageId = pageId;
      this.$emit('active-page-changed', this.activePage);
    },
    deletePage(pageId) {
      if (this.pages.length <= 1) {
        alert('Cannot delete the last page');
        return;
      }
      
      // Check if any foreground pages use this as background
      if (this.pages.find(p => p.id === pageId)?.type === 'background') {
        const usedBy = this.pages.filter(p => p.backgroundPageId === pageId);
        if (usedBy.length > 0) {
          const pageNames = usedBy.map(p => p.name).join(', ');
          alert(`Cannot delete this background page because it's used by: ${pageNames}`);
          return;
        }
      }
      
      const index = this.pages.findIndex(page => page.id === pageId);
      if (index !== -1) {
        this.pages.splice(index, 1);
        
        // If we deleted the active page, select another one
        if (pageId === this.activePageId) {
          this.activePageId = this.pages[0]?.id || '';
        }
        
        this.$emit('pages-updated', this.pages);
        this.$emit('active-page-changed', this.activePage);
      }
      
      this.closeContextMenu();
    },
    renamePage(page) {
      this.renameData = {
        id: page.id,
        name: page.name
      };
      this.showRenameDialog = true;
      this.closeContextMenu();
    },
    confirmRename() {
      if (!this.renameData.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      
      const page = this.pages.find(p => p.id === this.renameData.id);
      if (page) {
        page.name = this.renameData.name;
        this.$emit('pages-updated', this.pages);
      }
      
      this.showRenameDialog = false;
    },
    togglePageType(page) {
      // If changing from background to foreground, check if it's used by any pages
      if (page.type === 'background') {
        const usedBy = this.pages.filter(p => p.backgroundPageId === page.id);
        if (usedBy.length > 0) {
          const pageNames = usedBy.map(p => p.name).join(', ');
          alert(`Cannot change this background page because it's used by: ${pageNames}`);
          return;
        }
      }
      
      page.type = page.type === 'foreground' ? 'background' : 'foreground';
      
      // If changed to foreground, clear any background page it might have had
      if (page.type === 'foreground') {
        page.backgroundPageId = '';
      }
      
      this.$emit('pages-updated', this.pages);
      this.closeContextMenu();
    },
    duplicatePage(page) {
      const newPage = {
        ...JSON.parse(JSON.stringify(page)),
        id: `page-${Date.now()}`,
        name: `${page.name} (Copy)`
      };
      
      this.pages.push(newPage);
      this.selectPage(newPage.id);
      this.$emit('pages-updated', this.pages);
      this.closeContextMenu();
    },
    showContextMenu(event, page) {
      event.preventDefault();
      this.showContextMenuFor = page;
      this.contextMenuStyle = {
        top: `${event.clientY}px`,
        left: `${event.clientX}px`
      };
    },
    closeContextMenu() {
      this.showContextMenuFor = null;
    },
    handleKeyDown(e) {
      // Close dialogs on escape
      if (e.key === 'Escape') {
        this.showAddPageDialog = false;
        this.showRenameDialog = false;
        this.showContextMenuFor = null;
      }
    },
    updatePageShapes(pageId, shapes) {
      const page = this.pages.find(p => p.id === pageId);
      if (page) {
        page.shapes = shapes;
        this.$emit('pages-updated', this.pages);
      }
    }
  }
};
</script>

<style scoped>
.page-manager {
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Arial, sans-serif;
  background: rgba(30, 30, 30, 0.9);
  border-radius: 4px;
  border: 1px solid #4A4A4A;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: box-shadow 0.2s;
}
.page-manager.draggable {
  cursor: move;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}
.page-manager.pinned {
  cursor: default;
}
.page-manager.vertical {
  flex-direction: row;
}
.page-manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #2D2D2D;
  border-bottom: 1px solid #4A4A4A;
}
.drag-handle {
  cursor: move;
  padding: 2px 4px;
  color: #AAAAAA;
  font-size: 14px;
}
.position-controls {
  display: flex;
  gap: 4px;
}
.position-btn {
  background: none;
  border: none;
  color: #AAAAAA;
  cursor: pointer;
  font-size: 12px;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}
.position-btn:hover {
  color: #FFFFFF;
}
.page-tabs {
  display: flex;
  background: transparent;
  padding: 0;
  gap: 2px;
  z-index: 50;
  position: relative;
}
.inline-tabs {
  flex-direction: row;
  align-items: center;
  height: 28px;
  overflow-x: auto;
}
.vertical-tabs {
  flex-direction: column;
  align-items: flex-start;
  height: auto;
  overflow-y: auto;
  max-height: 80vh;
  background: rgba(30, 30, 30, 0.9);
  padding: 4px;
  border-radius: 4px 0 0 4px;
  border-left: 1px solid #4A4A4A;
  border-top: 1px solid #4A4A4A;
  border-bottom: 1px solid #4A4A4A;
  box-shadow: -2px 2px 5px rgba(0, 0, 0, 0.3);
}
.inline-tab {
  padding: 0 8px;
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #CCCCCC;
  transition: all 0.2s;
  white-space: nowrap;
  height: 22px;
  position: relative;
}
.vertical-tab {
  padding: 6px 8px;
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  border-radius: 3px 0 0 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #FFFFFF;
  transition: all 0.2s;
  white-space: nowrap;
  height: 32px;
  position: relative;
  width: 140px;
  margin-bottom: 4px;
  border-right: none;
  box-shadow: -1px 1px 3px rgba(0, 0, 0, 0.2);
}
.inline-tab:hover, .vertical-tab:hover {
  background: #4A4A4A;
}
.inline-tab.active {
  background: #0078D4;
  border-color: #0078D4;
  color: #FFFFFF;
  font-weight: 500;
  z-index: 1;
}
.vertical-tab.active {
  background: #0078D4;
  border-color: #0078D4;
  color: #FFFFFF;
  font-weight: 500;
  z-index: 1;
}
.page-type-badge {
  background: #0078D4;
  color: #FFFFFF;
  padding: 1px 4px;
  border-radius: 2px;
  font-size: 9px;
  margin-left: 2px;
}
.add-tab-button {
  width: 22px;
  height: 22px;
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  border-radius: 3px;
  color: #CCCCCC;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 2px;
}
.vertical-add-button {
  width: 140px;
  height: 32px;
  border-radius: 3px 0 0 3px;
  border-right: none;
  margin-left: 0;
  box-shadow: -1px 1px 3px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  color: #FFFFFF;
}
.add-tab-button:hover {
  background: #4A4A4A;
  color: #FFFFFF;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: #2D2D2D;
  border: 1px solid #3C3C3C;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 9998; /* Just below the dialog but above everything else */
  min-width: 180px;
}
.context-menu-item {
  padding: 8px 12px;
  cursor: pointer;
  color: #CCCCCC;
  font-size: 13px;
  display: flex;
  align-items: center;
  transition: background 0.2s;
}
.context-menu-item:hover {
  background: #3C3C3C;
}
.context-menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.context-menu-icon {
  margin-right: 8px;
  font-size: 14px;
}

/* Rename Dialog */
.rename-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.rename-dialog {
  background: #2D2D2D;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  width: 320px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  color: #CCCCCC;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #3C3C3C;
}
.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #999999;
  transition: color 0.2s;
}
.close-button:hover {
  color: #FFFFFF;
}
.dialog-content {
  padding: 16px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #3C3C3C;
  gap: 8px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  font-size: 14px;
  background: #333333;
  color: #FFFFFF;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-control:focus {
  border-color: #0078D4;
  box-shadow: 0 0 4px rgba(0, 120, 212, 0.3);
  outline: none;
}
.cancel-button, .ok-button {
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-button {
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  color: #CCCCCC;
}
.cancel-button:hover {
  background: #4A4A4A;
}
.ok-button {
  background: #0078D4;
  border: 1px solid #005EA2;
  color: #FFFFFF;
}
.ok-button:hover {
  background: #005EA2;
}

/* Light Theme Styles */
.page-manager:not(.dark-theme) .page-tabs {
  background: #F3F3F3;
  border-top-color: #D1D1D1;
}
.page-manager:not(.dark-theme) .folder-tabs {
  background: #FFFFFF;
}
.page-manager:not(.dark-theme) .folder-tab {
  background: #E0E0E0;
  border-color: #CCCCCC;
  color: #333333;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}
.page-manager:not(.dark-theme) .folder-tab:hover {
  background: #D5D5D5;
}
.page-manager:not(.dark-theme) .folder-tab.active {
  background: #FFFFFF;
  border-color: #0078D4;
  color: #000000;
}
.page-manager:not(.dark-theme) .folder-tab::before {
  box-shadow: 5px 5px 0 5px #E0E0E0;
}
.page-manager:not(.dark-theme) .folder-tab::after {
  box-shadow: -5px 5px 0 5px #E0E0E0;
}
.page-manager:not(.dark-theme) .folder-tab.active::before {
  box-shadow: 5px 5px 0 5px #FFFFFF;
}
.page-manager:not(.dark-theme) .folder-tab.active::after {
  box-shadow: -5px 5px 0 5px #FFFFFF;
}
.page-manager:not(.dark-theme) .add-tab-button {
  background: #E0E0E0;
  border-color: #CCCCCC;
  color: #333333;
}
.page-manager:not(.dark-theme) .add-tab-button:hover {
  background: #D5D5D5;
  color: #000000;
}
.page-manager:not(.dark-theme) .context-menu {
  background: #FFFFFF;
  border-color: #D1D1D1;
}
.page-manager:not(.dark-theme) .context-menu-item {
  color: #333333;
}
.page-manager:not(.dark-theme) .context-menu-item:hover {
  background: #F5F5F5;
}
.page-manager:not(.dark-theme) .rename-dialog {
  background: #FFFFFF;
  color: #333333;
}
.page-manager:not(.dark-theme) .dialog-header {
  border-bottom-color: #D1D1D1;
}
.page-manager:not(.dark-theme) .dialog-footer {
  border-top-color: #D1D1D1;
}
.page-manager:not(.dark-theme) .close-button {
  color: #666666;
}
.page-manager:not(.dark-theme) .close-button:hover {
  color: #000000;
}
.page-manager:not(.dark-theme) .form-control {
  background: #FFFFFF;
  border-color: #CCCCCC;
  color: #333333;
}
.page-manager:not(.dark-theme) .cancel-button {
  background: #F5F5F5;
  border-color: #D1D1D1;
  color: #333333;
}
.page-manager:not(.dark-theme) .cancel-button:hover {
  background: #E5E5E5;
}
</style>