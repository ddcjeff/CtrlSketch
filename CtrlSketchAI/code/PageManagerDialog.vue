<!-- src/components/PageManagerDialog.vue -->
<template>
  <div v-if="show" class="page-manager-dialog-overlay" @click.self="$emit('close')">
    <div class="page-manager-dialog" :class="{ 'dark-theme': isDarkTheme }">
      <div class="dialog-header">
        <h3>Page Manager</h3>
        <button class="close-button" @click="$emit('close')">×</button>
      </div>
      <div class="dialog-content">
        <div class="page-list">
          <div class="page-list-header">
            <div class="page-name-col">Page Name</div>
            <div class="page-type-col">Type</div>
            <div class="page-bg-col">Background</div>
            <div class="page-actions-col">Actions</div>
          </div>
          <div 
            v-for="page in pages" 
            :key="page.id" 
            class="page-list-item"
            :class="{ 'active': page.id === activePage }"
          >
            <div class="page-name-col">
              <span v-if="editingPage !== page.id">{{ page.name }}</span>
              <input 
                v-else
                type="text"
                v-model="editName"
                @keyup.enter="saveName(page.id)"
                @blur="saveName(page.id)"
                ref="nameInput"
                class="form-control"
              />
            </div>
            <div class="page-type-col">
              <select 
                v-model="page.type" 
                class="form-control"
                @change="updatePage(page)"
              >
                <option value="foreground">Foreground</option>
                <option value="background">Background</option>
              </select>
            </div>
            <div class="page-bg-col">
              <select 
                v-if="page.type === 'foreground'"
                v-model="page.backgroundPageId" 
                class="form-control"
                @change="updatePage(page)"
              >
                <option value="">None</option>
                <option 
                  v-for="bgPage in backgroundPages" 
                  :key="bgPage.id" 
                  :value="bgPage.id"
                >
                  {{ bgPage.name }}
                </option>
              </select>
              <span v-else>-</span>
            </div>
            <div class="page-actions-col">
              <button 
                class="action-button" 
                title="Edit Name"
                @click="startEditing(page)"
              >
                ✏️
              </button>
              <button 
                class="action-button" 
                title="Move Up"
                @click="movePage(page, -1)"
                :disabled="isFirstPage(page)"
              >
                ⬆️
              </button>
              <button 
                class="action-button" 
                title="Move Down"
                @click="movePage(page, 1)"
                :disabled="isLastPage(page)"
              >
                ⬇️
              </button>
              <button 
                class="action-button" 
                title="Delete"
                @click="deletePage(page)"
                :disabled="pages.length <= 1 || isPageUsedAsBackground(page)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
        <div class="add-page-section">
          <button class="add-page-button" @click="$emit('add-page')">
            Add New Page
          </button>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="ok-button" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageManagerDialog',
  props: {
    show: { type: Boolean, default: false },
    pages: { type: Array, default: () => [] },
    activePage: { type: String, default: '' },
    isDarkTheme: { type: Boolean, default: false }
  },
  data() {
    return {
      editingPage: null,
      editName: ''
    };
  },
  computed: {
    backgroundPages() {
      return this.pages.filter(page => page.type === 'background');
    }
  },
  methods: {
    startEditing(page) {
      this.editingPage = page.id;
      this.editName = page.name;
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
        }
      });
    },
    saveName(pageId) {
      if (!this.editName.trim()) {
        this.editName = 'Untitled Page';
      }
      
      const page = this.pages.find(p => p.id === pageId);
      if (page) {
        page.name = this.editName.trim();
        this.$emit('update-page', page);
      }
      
      this.editingPage = null;
    },
    updatePage(page) {
      this.$emit('update-page', page);
    },
    movePage(page, direction) {
      this.$emit('move-page', { pageId: page.id, direction });
    },
    deletePage(page) {
      if (confirm(`Are you sure you want to delete the page "${page.name}"?`)) {
        this.$emit('delete-page', page.id);
      }
    },
    isFirstPage(page) {
      const index = this.pages.findIndex(p => p.id === page.id);
      return index === 0;
    },
    isLastPage(page) {
      const index = this.pages.findIndex(p => p.id === page.id);
      return index === this.pages.length - 1;
    },
    isPageUsedAsBackground(page) {
      if (page.type !== 'background') return false;
      return this.pages.some(p => p.backgroundPageId === page.id);
    }
  }
};
</script>

<style scoped>
.page-manager-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}
.page-manager-dialog {
  background: #2D2D2D;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  width: 700px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  color: #CCCCCC;
  animation: slideUp 0.2s ease-out;
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
  font-size: 18px;
  font-weight: 600;
}
.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999999;
  transition: color 0.2s;
}
.close-button:hover {
  color: #FFFFFF;
}
.dialog-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #3C3C3C;
  gap: 8px;
}
.page-list {
  border: 1px solid #3C3C3C;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}
.page-list-header {
  display: flex;
  background: #1E1E1E;
  padding: 8px;
  font-weight: 600;
  border-bottom: 1px solid #3C3C3C;
}
.page-list-item {
  display: flex;
  padding: 8px;
  border-bottom: 1px solid #3C3C3C;
  align-items: center;
}
.page-list-item:last-child {
  border-bottom: none;
}
.page-list-item.active {
  background: #0078D4;
  color: #FFFFFF;
}
.page-name-col {
  flex: 2;
  padding-right: 8px;
}
.page-type-col {
  flex: 1;
  padding-right: 8px;
}
.page-bg-col {
  flex: 1;
  padding-right: 8px;
}
.page-actions-col {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.form-control {
  width: 100%;
  padding: 4px 8px;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  font-size: 14px;
  background: #333333;
  color: #FFFFFF;
}
.action-button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 2px;
  border-radius: 4px;
  transition: background 0.2s;
}
.action-button:hover {
  background: rgba(255, 255, 255, 0.1);
}
.action-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.add-page-section {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
.add-page-button {
  background: #0078D4;
  border: 1px solid #005EA2;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.add-page-button:hover {
  background: #005EA2;
}
.ok-button {
  background: #0078D4;
  border: 1px solid #005EA2;
  color: #FFFFFF;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
.ok-button:hover {
  background: #005EA2;
}

/* Light Theme */
.page-manager-dialog:not(.dark-theme) {
  background: #FFFFFF;
  color: #333333;
}
.dialog-header:not(.dark-theme) {
  border-bottom: 1px solid #D1D1D1;
}
.dialog-footer:not(.dark-theme) {
  border-top: 1px solid #D1D1D1;
}
.close-button:not(.dark-theme) {
  color: #666666;
}
.close-button:hover:not(.dark-theme) {
  color: #000000;
}
.page-list:not(.dark-theme) {
  border-color: #D1D1D1;
}
.page-list-header:not(.dark-theme) {
  background: #F5F5F5;
  border-bottom: 1px solid #D1D1D1;
}
.page-list-item:not(.dark-theme) {
  border-bottom: 1px solid #D1D1D1;
}
.form-control:not(.dark-theme) {
  background: #FFFFFF;
  border-color: #CCCCCC;
  color: #333333;
}
.action-button:hover:not(.dark-theme) {
  background: rgba(0, 0, 0, 0.05);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>