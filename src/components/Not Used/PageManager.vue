<!-- src/components/PageManager.vue -->
<template>
  <div class="page-manager" :class="{ 'dark-theme': isDarkTheme }">
    <div class="page-manager-header">
      <h3>Pages</h3>
      <div class="page-controls">
        <button title="Add Page" @click="addPage" class="control-button" style="background-color: #4CAF50; color: white; font-weight: bold;">
          + Add Page
        </button>
        <button title="Delete Page" @click="deletePage" :disabled="pages.length <= 1" class="control-button" style="background-color: #f44336; color: white; font-weight: bold;">
          - Delete
        </button>
      </div>
    </div>
    <div class="page-tabs">
      <div
        v-for="page in pages"
        :key="page.id"
        class="page-tab"
        :class="{ 'active': page.id === activePageId }"
        @click="selectPage(page.id)"
        @contextmenu.prevent="showPageContextMenu(page.id)"
      >
        <span class="page-name">{{ page.name }}</span>
        <span v-if="page.type === 'background'" class="page-type-badge">BG</span>
      </div>
    </div>
    <div class="page-properties" v-if="activePage">
      <h4>Page Properties</h4>
      <div class="property-group">
        <label for="pageName">Page Name:</label>
        <input
          type="text"
          id="pageName"
          v-model="activePage.name"
          @change="updatePage(activePage)"
        />
      </div>
      <div class="property-group">
        <label for="pageType">Page Type:</label>
        <select
          id="pageType"
          v-model="activePage.type"
          @change="updatePage(activePage)"
        >
          <option value="foreground">Foreground</option>
          <option value="background">Background</option>
        </select>
      </div>
      <div class="property-group" v-if="activePage.type === 'foreground'">
        <label for="backgroundPage">Background Page:</label>
        <select
          id="backgroundPage"
          v-model="activePage.backgroundPageId"
          @change="updatePage(activePage)"
        >
          <option value="">None</option>
          <option
            v-for="page in backgroundPages"
            :key="page.id"
            :value="page.id"
          >
            {{ page.name }}
          </option>
        </select>
      </div>
      <div class="property-group">
        <label for="pageDescription">Description:</label>
        <textarea
          id="pageDescription"
          v-model="activePage.description"
          @change="updatePage(activePage)"
          rows="3"
        ></textarea>
      </div>
      <div class="property-group">
        <label for="drawingType">Drawing Type:</label>
        <select
          id="drawingType"
          v-model="activePage.drawingType"
          @change="updatePage(activePage)"
        >
          <option value="default">Default</option>
          <option value="schematic">Schematic</option>
          <option value="layout">Layout</option>
        </select>
      </div>
    </div>
    <AddPageDialog
      :show="showAddPageDialog"
      :initial-data="newPageData"
      :background-pages="backgroundPages"
      :is-dark-theme="isDarkTheme"
      @close="showAddPageDialog = false"
      @add="confirmAddPage"
    />
  </div>
</template>

<script>
import { usePageStore } from '@/store/pages';
import AddPageDialog from './AddPageDialog.vue';

export default {
  components: { AddPageDialog },
  name: 'PageManager',
  props: {
    isDarkTheme: { type: Boolean, default: false }
  },
  setup() {
    const pageStore = usePageStore();
    return { pageStore };
  },
  data() {
    return {
      showAddPageDialog: false,
      newPageData: {
        name: '',
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default',
        layers: []
      },
      showPropertiesForPageId: null
    };
  },
  computed: {
    pages() {
      return this.pageStore.pages;
    },
    activePageId() {
      return this.pageStore.activePageId;
    },
    activePage() {
      return this.pageStore.activePage;
    },
    backgroundPages() {
      return this.pages.filter(page => page.type === 'background');
    }
  },
  methods: {
    addPage() {
      this.newPageData = {
        name: `Page ${this.pages.length + 1}`,
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default',
        layers: []
      };
      this.showAddPageDialog = true;
    },
    confirmAddPage(pageData) {
      if (!pageData.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      this.pageStore.addPage(pageData);
      this.showAddPageDialog = false;
    },
    deletePage() {
      if (this.pages.length <= 1) {
        alert('Cannot delete the last page');
        return;
      }
      this.pageStore.deletePage(this.activePageId);
    },
    selectPage(pageId) {
      this.pageStore.selectPage(pageId);
    },
    updatePage(page) {
      if (!page.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      this.pageStore.updatePage(page);
    },
    showPageContextMenu(pageId) {
      this.selectPage(pageId);
      this.showPropertiesForPageId = pageId;
      this.$emit('show-page-properties', pageId);
    }
  }
};
</script>

<style scoped>
.page-manager {
  width: 260px;
  background: #252526;
  border-left: 1px solid #3C3C3C;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #CCCCCC;
}
:deep(.dark-theme) {
  background: #252526;
  border-left: 1px solid #3C3C3C;
  color: #CCCCCC;
}
.page-manager-header {
  padding: 12px;
  border-bottom: 1px solid #3C3C3C;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
:deep(.dark-theme) .page-manager-header {
  border-bottom: 1px solid #3C3C3C;
}
.page-manager-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
.page-controls {
  display: flex;
  gap: 6px;
}
.control-button {
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 12px;
  color: #FFFFFF;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  transform: scale(1);
}
.control-button:hover {
  background: #4A4A4A;
  border-color: #5A5A5A;
  transform: scale(1.05);
}
.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: scale(1);
}
:deep(.dark-theme) .control-button {
  background: #3C3C3C;
  border-color: #4A4A4A;
  color: #FFFFFF;
}
:deep(.dark-theme) .control-button:hover {
  background: #4A4A4A;
  border-color: #5A5A5A;
}
.page-tabs {
  padding: 8px;
  border-bottom: 1px solid #3C3C3C;
  overflow-y: auto;
  max-height: 150px;
}
:deep(.dark-theme) .page-tabs {
  border-bottom: 1px solid #3C3C3C;
}
.page-tab {
  padding: 6px 12px;
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #CCCCCC;
  margin-bottom: 4px;
  transition: background 0.2s, border-color 0.2s;
}
.page-tab:hover {
  background: #4A4A4A;
}
:deep(.dark-theme) .page-tab {
  background: #3C3C3C;
  border-color: #4A4A4A;
  color: #CCCCCC;
}
.page-tab.active {
  background: #1E1E1E;
  border-color: #0078D4;
  color: #FFFFFF;
  font-weight: 600;
}
:deep(.dark-theme) .page-tab.active {
  background: #1E1E1E;
  border-color: #0078D4;
}
.page-type-badge {
  background: #0078D4;
  color: #FFFFFF;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
}
.page-properties {
  padding: 12px;
  overflow-y: auto;
}
.page-properties h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #3C3C3C;
  padding-bottom: 6px;
}
:deep(.dark-theme) .page-properties h4 {
  border-bottom-color: #3C3C3C;
}
.property-group {
  margin-bottom: 12px;
}
.property-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 13px;
  font-weight: 500;
}
.property-group input,
.property-group select,
.property-group textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  font-size: 13px;
  background: #333333;
  color: #FFFFFF;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.property-group input:focus,
.property-group select:focus,
.property-group textarea:focus {
  border-color: #0078D4;
  box-shadow: 0 0 4px rgba(0, 120, 212, 0.3);
  outline: none;
}
:deep(.dark-theme) .property-group input,
:deep(.dark-theme) .property-group select,
:deep(.dark-theme) .property-group textarea {
  background: #333333;
  border-color: #4A4A4A;
  color: #FFFFFF;
}
.page-manager:not(.dark-theme) {
  background: #F3F3F3;
  border-left: 1px solid #D1D1D1;
  color: #333333;
}
.page-manager-header:not(.dark-theme) {
  border-bottom: 1px solid #D1D1D1;
}
.control-button:not(.dark-theme) {
  background: #E0E0E0;
  border-color: #CCCCCC;
  color: #333333;
}
.control-button:hover:not(.dark-theme) {
  background: #D5D5D5;
}
.page-tabs:not(.dark-theme) {
  border-bottom: 1px solid #D1D1D1;
}
.page-tab:not(.dark-theme) {
  background: #E0E0E0;
  border-color: #CCCCCC;
  color: #333333;
}
.page-tab:hover:not(.dark-theme) {
  background: #D5D5D5;
}
.page-tab.active:not(.dark-theme) {
  background: #FFFFFF;
  border-color: #0078D4;
  color: #000000;
}
.page-properties h4:not(.dark-theme) {
  border-bottom-color: #D1D1D1;
}
.property-group input:not(.dark-theme),
.property-group select:not(.dark-theme),
.property-group textarea:not(.dark-theme) {
  background: #FFFFFF;
  border-color: #CCCCCC;
  color: #333333;
}
</style>
