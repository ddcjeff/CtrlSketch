<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Splash Screen -->
    <SplashScreen 
      v-if="showSplashScreen" 
      :version="appVersion" 
      :license-number="licenseNumber"
      :duration="10000"
      @splash-complete="showSplashScreen = false"
    />
    
    <div v-show="!showSplashScreen">
      <MenuBar @menu="handleMenu" />
      <Ribbon 
        :active-tab="activeTab" 
        @ribbon-action="handleRibbonAction" 
        :grid-size="gridSize" 
        :grid-opacity="gridOpacity"
        :show-layers="showLayers"
        :show-shape-library="showShapeLibrary"
      />
      
      <!-- We're only using bottom tabs now -->
      
      <div class="flex flex-1 overflow-hidden h-[calc(100vh-7rem)] relative">
        <!-- Shape Library Panel - Draggable panel -->
        <div v-if="showShapeLibrary" 
          class="fixed w-64 bg-gray-800 border border-gray-700 overflow-hidden z-50 shadow-xl rounded-md"
          style="height: 80vh; max-height: 600px;"
          :style="{ left: shapeLibraryPosition.x + 'px', top: shapeLibraryPosition.y + 'px' }"
          ref="shapeLibraryPanel"
        >
          <div class="p-2 bg-gray-900 flex justify-between items-center cursor-move" 
               @mousedown="startDragShapeLibrary"
               @touchstart="startDragShapeLibrary">
            <h3 class="text-white font-medium">Shape Library</h3>
            <div class="flex items-center">
              <button @click="toggleShapeLibrary" class="text-gray-400 hover:text-white ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div class="overflow-y-auto" style="height: calc(100% - 40px);">
            <ShapeLibrary 
              :selected-shapes="selectedShapes"
              @notification="showNotification"
              @shape-drag-start="handleShapeDragStart"
              @add-shape="handleAddShape"
            />
          </div>
        </div>
        

        
        <main class="flex-1 relative">
          <CanvasWorkspace
            ref="canvas"
            :tool="currentTool"
            :styles="currentStyles"
            :grid-size="gridSize"
            :grid-opacity="gridOpacity"
            :snap-to-grid="snapToGrid"
            :shapes="getVisibleShapes()"
            :selected-shapes="selectedShapes"
            :active-layer="layers[selectedLayerIndex]"
            :visible-layers="layers.filter(layer => layer.visible)"
            :show-rulers="showRulers"
            :auto-save-status="autoSaveStatus"
            :auto-save-message="autoSaveMessage"
            @shape-added="addHistory"
            @shape-updated="updateHistory"
            @shape-deleted="deleteHistory"
            @shapes-selected="updateSelectedShapes"
            @undo-requested="undo"
            @redo-requested="redo"
            @toggle-snap-grid="toggleSnapToGrid"
            @tool-change="handleToolChange"
            @update:tool="currentTool = $event"
            @show-notification="showNotification"
            @drop="handleCanvasDrop"
            class="w-full h-full"
          />
          
          <!-- Status Bar -->
          <div class="absolute bottom-0 left-0 right-0 h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-gray-300 text-xs z-30">
            <div class="mr-4">Status: Ready</div>
            <div class="mr-4">Snap to Grid: {{ snapToGrid ? 'On' : 'Off' }}</div>
          </div>
          
          <!-- Draggable Page Tabs -->
          <div v-if="showPageTabs" 
               ref="pageTabsPanel"
               class="fixed z-50 bg-gray-800 border border-gray-700 p-2 rounded-md shadow-lg" 
               :style="{ left: pageTabsPosition.x + 'px', top: pageTabsPosition.y + 'px', minWidth: '120px' }">
            <div class="flex justify-between items-center mb-2 cursor-move bg-gray-900 rounded-lg p-1 px-2"
                 @mousedown.stop="startDrag">
              <div class="text-gray-400 font-medium text-xs uppercase tracking-wider">Pages</div>
              <button @click="showPageTabs = false" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
            <div class="flex flex-col gap-2">
              <div v-for="page in pages" :key="page.id" 
                   class="flex items-center px-3 py-2 rounded-md cursor-pointer text-sm font-medium border-l-4"
                   :class="[
                     currentPage && currentPage.id === page.id 
                       ? 'bg-blue-600 hover:bg-blue-700 text-white border-yellow-400' 
                       : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-transparent'
                   ]"
                   @click="handlePageChange(page)"
                   @contextmenu.prevent="showPageContextMenu($event, page)">
                <span v-if="currentPage && currentPage.id === page.id" class="mr-1">▶</span>
                <span>{{ page.name }}</span>
                <span v-if="page.type === 'background'" class="ml-1 text-xs bg-blue-800 px-1 rounded">BG</span>
              </div>
              <button @click="showAddPageDialog = true" 
                      class="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer hover:bg-gray-700 text-center font-bold">
                + Add Page
              </button>
            </div>
          </div>
          
          <!-- Page Context Menu -->
          <div v-if="contextMenuPage" class="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1"
               :style="{ top: contextMenuPosition.y + 'px', left: contextMenuPosition.x + 'px' }">
            <div class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                 @click="renamePage(contextMenuPage)">
              Rename
            </div>
            <div class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                 @click="togglePageType(contextMenuPage)">
              {{ contextMenuPage.type === 'foreground' ? 'Set as Background' : 'Set as Foreground' }}
            </div>
            <div class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                 @click="duplicatePage(contextMenuPage)">
              Duplicate
            </div>
            <div class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
                 @click="deletePage(contextMenuPage.id)"
                 :class="{ 'opacity-50 cursor-not-allowed': pages.length <= 1 }">
              Delete
            </div>
          </div>
          
          <!-- Side panels -->
          <div class="absolute top-4 right-4 flex flex-col gap-4">
            <StylePanel 
              v-if="selectedShapes.length > 0" 
              :selected-shapes="selectedShapes" 
              :layers="layers"
              @shape-updated="updateShape"
              class="bg-gray-900 rounded-lg shadow-lg border border-gray-800 w-64"
            />
            
            <Layers 
              v-if="showLayers" 
              :visible="showLayers" 
              :layers="layers"
              :selectedLayerIndex="selectedLayerIndex"
              @select-layer="selectLayer"
              @toggle-layer-visibility="toggleLayerVisibility"
              @toggle-layer-freeze="toggleLayerFreeze"
              @update-layers="updateLayers"
              @add-layer="addLayer"
              @delete-layer="deleteLayer"
              @move-layer="moveLayer"
              @duplicate-layer="duplicateLayer"
              @merge-down="mergeLayerDown"
              @clear-layer="clearLayer"
              @rename-layer="renameLayer"
              @update-layer-opacity="updateLayerOpacity"
            />
          </div>
        </main>
      </div>
    </div>
    
    <!-- Notification Manager -->
    <NotificationManager ref="notificationManager" />
    
    <!-- Calculator -->
    <Calculator 
      v-if="showCalculator" 
      :initial-position="calculatorPosition"
      @close="showCalculator = false"
    />
    
    <!-- Color Picker -->
    <ColorPicker 
      v-if="showColorPicker" 
      :initial-position="colorPickerPosition"
      :initial-color="currentStyles.fill"
      @close="showColorPicker = false"
      @color-selected="applySelectedColor"
      @notification="showNotification"
    />
    
    <!-- Part Properties Dialog -->
    <PartPropertiesDialog
      :show="showPartPropertiesDialog"
      :initial-properties="partPropertiesData"
      @confirm="applyPartProperties"
      @cancel="showPartPropertiesDialog = false"
    />
    
    <!-- BOM Generator -->
    <BOMGenerator
      v-if="showBOMGenerator"
      :initial-position="bomGeneratorPosition"
      :pages="pages"
      :shapes="shapes"
      :current-page-id="currentPageId"
      @close="showBOMGenerator = false"
      @notification="showNotification"
    />
    
    <!-- Add Page Dialog -->
    <AddPageDialog
      :show="showAddPageDialog"
      :initial-data="{ name: '', type: 'foreground', backgroundPageId: '', description: '', drawingType: 'default' }"
      :background-pages="pages.filter(page => page.type === 'background')"
      :is-dark-theme="false"
      @close="showAddPageDialog = false"
      @add="addPage"
    />
    
    <!-- Page Manager Dialog -->
    <PageManagerDialog
      :show="showPageManagerDialog"
      :pages="pages"
      :active-page="currentPage ? currentPage.id : ''"
      :is-dark-theme="false"
      @close="showPageManagerDialog = false"
      @add-page="showAddPageDialog = true"
      @update-page="updatePage"
      @move-page="movePage"
      @delete-page="deletePage"
    />
    
    <!-- Rename Page Dialog -->
    <div v-if="showRenameDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-6 w-80 shadow-xl" @click.stop>
        <h3 class="text-lg font-medium text-white mb-4">Rename Page</h3>
        <div class="mb-4">
          <label for="pageName" class="block text-sm font-medium text-gray-300 mb-1">Page Name</label>
          <input 
            type="text" 
            id="pageName" 
            v-model="renameData.name" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="confirmRename"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button 
            class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            @click="showRenameDialog = false"
          >
            Cancel
          </button>
          <button 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            @click="confirmRename"
          >
            Rename
          </button>
        </div>
      </div>
    </div>
    
    <!-- Drag Helper component -->
    <DragHelper ref="dragHelper" />
  </div>
</template>

<script>
import MenuBar from './components/MenuBar.vue'
import Ribbon from './components/Ribbon.vue'
import ToolFlyout from './components/ToolFlyout.vue'
import CanvasWorkspace from './components/CanvasWorkspace.vue'
import Layers from './components/Layers.vue'
import StylePanel from './components/StylePanel.vue'
import SplashScreen from './components/SplashScreen.vue'
import NotificationManager from './components/NotificationManager.vue'
import PageManager from './components/PageManager.vue'
import AddPageDialog from './components/AddPageDialog.vue'
import PageManagerDialog from './components/PageManagerDialog.vue'
import Calculator from './components/Calculator.vue'
import ColorPicker from './components/ColorPicker.vue'
import ShapeLibrary from './components/ShapeLibraryNew.vue'
import PartPropertiesDialog from './components/PartPropertiesDialog.vue'
import BOMGenerator from './components/BOMGenerator.vue'
import DragHelper from './components/DragHelper.vue'
import jsPDF from 'jspdf'
import { version } from '../package.json'

export default {
  components: {
    MenuBar,
    Ribbon,
    ToolFlyout,
    CanvasWorkspace,
    Layers,
    StylePanel,
    SplashScreen,
    NotificationManager,
    PageManager,
    AddPageDialog,
    PageManagerDialog,
    Calculator,
    ColorPicker,
    ShapeLibrary,
    PartPropertiesDialog,
    BOMGenerator,
    DragHelper
  },
  mounted() {
    console.log('CtrlSketch initialized');
    
    // Initialize with empty canvas
    this.initializeEmptyCanvas();
    
    // Make sure document is not marked as modified on startup
    this.documentModified = false;
    
    // Explicitly clear auto-save status and message
    this.autoSaveStatus = null;
    this.autoSaveMessage = '';
    
    // Ensure the canvas is properly initialized
    this.$nextTick(() => {
      if (this.$refs.canvas) {
        console.log('Canvas reference found in App.vue');
        
        // Make sure the canvas is in select mode
        this.currentTool = 'select';
        // Don't try to set the tool directly, it's a prop
        // this.$refs.canvas.tool = 'select';
        
        // Force a render
        setTimeout(() => {
          if (this.$refs.canvas) {
            this.$refs.canvas.render();
          }
        }, 500);
      } else {
        console.warn('Canvas reference not found in App.vue');
      }
    });
    
    // Removed tip notification
    
    // Disable auto-save initially, will be enabled after a short delay
    const originalAutoSaveEnabled = this.autoSaveEnabled;
    this.autoSaveEnabled = false;
    
    this.history = [JSON.stringify(this.shapes)];
    this.historyIndex = 0;
    window.addEventListener('keydown', this.handleGlobalKeyDown);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log('Direct Delete key handler, selected shapes:', this.selectedShapes.length);
        if (this.selectedShapes.length > 0) {
          this.deleteSelected();
          e.preventDefault();
        }
      }
    });
    
    // Initialize with a default page
    this.$nextTick(() => {
      this.initializeDefaultPage();
      console.log('App mounted, pages count:', this.pages.length);
      
      // Disable auto-save data loading on startup
      // this.loadAutoSavedData();
      
      // Re-enable auto-save after a delay to prevent startup messages
      setTimeout(() => {
        this.autoSaveEnabled = originalAutoSaveEnabled;
        this.initAutoSave();
        console.log('Auto-save re-enabled after startup');
      }, 2000);
    });
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeyDown);
    
    // Clear auto-save timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
  },
  data() {
    return {
      currentTool: null,
      currentStyles: { lineWidth: 2, stroke: '#000000', fill: '#000000', lineStyle: 'solid' },
      textStyles: { lineWidth: 1, stroke: '#000000', fill: '#000000', lineStyle: 'solid' },
      activeTab: 'Home',
      gridSize: 20,
      gridOpacity: 0.5,
      showRulers: false,
      snapToGrid: false,
      showLayers: false,
      selectedLayerIndex: 0,
      draggedShapeData: null, // Store shape data during drag operations
      layers: [
        { 
          id: 0,
          name: 'Layer 1', 
          visible: true, 
          frozen: false,
          opacity: 100,
          shapes: [] 
        }
      ],
      history: [],
      historyIndex: -1,
      shapes: [],
      selectedShapes: [],
      clipboard: [],
      _skipHistoryAdd: false,
      _lastUndoTime: 0,
      _lastRedoTime: 0,
      showSplashScreen: true,
      appVersion: version || '1.0.0',
      licenseNumber: 'CS-2023-0001',
      
      // Auto-save related properties
      autoSaveEnabled: true,
      autoSaveInterval: 60000, // 1 minute
      autoSaveTimer: null,
      lastAutoSave: null,
      autoSaveStatus: null, // 'saving', 'saved', 'error'
      autoSaveMessage: '',
      autoSaveIndicatorTimeout: null,
      localStorageKey: 'ctrlsketch_autosave_',
      
      // Document properties
      documentName: 'Untitled',
      documentModified: false,
      
      // Page management
      tabPosition: 'bottom', // Only using bottom tabs
      showAddPageDialog: false,
      showPageManagerDialog: false,
      currentPage: null,
      pages: [],
      contextMenuPage: null,
      contextMenuPosition: { layerId: 'default', x: 0, y: 0 },
      showRenameDialog: false,
      renameData: { id: '', name: '' },
      
      // Page tabs panel
      showPageTabs: false, // Hidden by default
      pageTabsPosition: { layerId: 'default', x: 0, y: 0 }, // Will be set to center when shown
      isDragging: false,
      dragOffset: { layerId: 'default', x: 0, y: 0 },
      
      // Utility tools
      showCalculator: false,
      calculatorPosition: { layerId: 'default', x: 400, y: 200 },
      showColorPicker: false,
      colorPickerPosition: { layerId: 'default', x: 400, y: 200 },
      
      // Shape Library - hidden by default
      showShapeLibrary: false, // Set to false to hide the Shape Library panel initially
      shapeLibraryPosition: { layerId: 'default', x: 12, y: 12 },
      isDraggingShapeLibrary: false,
      dragOffset: { layerId: 'default', x: 0, y: 0 },
      
      // Part Properties
      showPartPropertiesDialog: false,
      partPropertiesData: {
        name: '',
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      },
      pendingShapeData: null,
      
      // BOM Generator
      showBOMGenerator: false,
      bomGeneratorPosition: { layerId: 'default', x: 200, y: 100 }
    };
  },
  methods: {
    handleMenu({ type, value }) {
      console.log(`Menu action: ${type} - ${value}`);
      if (type === 'file') {
        switch (value) {
          case 'new':
            this.clearCanvas();
            break;
          case 'open':
            this.openFile();
            break;
          case 'save':
            this.saveFile();
            break;
          case 'saveAs':
            this.saveFileAs();
            break;
          case 'exportPdf':
            this.exportAsPDF();
            break;
          case 'exportPng':
            this.exportAsPNG();
            break;
          case 'exportSvg':
            this.exportAsSVG();
            break;
          case 'exportJson':
            this.exportAsJSON();
            break;
        }
      } else if (type === 'help') {
        switch (value) {
          case 'about':
            console.log('Show About dialog');
            this.toggleSplashScreen();
            break;
          case 'docs':
            console.log('Open Documentation');
            break;
          case 'support':
            console.log('Open Support page');
            break;
          case 'liveChat':
            console.log('Open Live Chat');
            break;
        }
      } else if (type === 'tab') {
        this.activeTab = value;
      }
    },
    getVisibleShapes() {
      // If we're using the page manager, get shapes from the active page
      if (this.$refs.pageManager) {
        return this.$refs.pageManager.visibleShapes || [];
      }
      
      // Otherwise, use the layer-based approach
      const visibleLayers = this.layers
        .filter(layer => layer.visible)
        .map(layer => ({
          id: layer.id,
          opacity: layer.opacity || 100
        }));
      const visibleLayerIds = visibleLayers.map(layer => layer.id);
      
      return this.shapes.filter(shape => {
        if (shape.layerId === undefined) return true;
        return visibleLayerIds.includes(shape.layerId);
      });
    },
    
    // Page management methods
    handlePageChange(page) {
      console.log('Attempting to switch to page:', page.name);
      
      if (this.currentPage && this.currentPage.id === page.id) {
        console.log('Already on this page');
        return; // Already on this page
      }
      
      // Save current shapes to the current page
      if (this.currentPage) {
        this.currentPage.shapes = [...this.shapes];
        console.log('Saved shapes to current page:', this.currentPage.name);
      }
      
      // Switch to the new page
      this.currentPage = page;
      
      // Load shapes from the new active page
      if (page) {
        // Get shapes from the page
        const pageShapes = page.shapes || [];
        console.log('Loading shapes from page:', page.name, pageShapes.length);
        
        // If it's a foreground page with a background, merge with background shapes
        let allShapes = [...pageShapes];
        if (page.type === 'foreground' && page.backgroundPageId) {
          const bgPage = this.pages.find(p => p.id === page.backgroundPageId);
          if (bgPage) {
            allShapes = [...bgPage.shapes, ...pageShapes];
            console.log('Merged with background page:', bgPage.name);
          }
        }
        
        // Update the canvas with the shapes
        this.shapes = allShapes;
        this.selectedShapes = [];
        
        console.log(`Switched to page: ${page.name}`);
      }
    },
    
    handlePagesUpdated(pages) {
      this.pages = pages;
      console.log('Pages updated:', pages.length);
      
      // Mark document as modified
      this.documentModified = true;
      
      // We'll use the existing auto-save mechanism if it exists
      if (typeof this.performAutoSave === 'function') {
        this.performAutoSave();
      }
    },
    
    // Page management methods
    addPage(pageData) {
      const newPage = {
        id: Date.now().toString(),
        name: pageData.name || 'New Page',
        type: pageData.type || 'foreground',
        backgroundPageId: pageData.backgroundPageId || '',
        description: pageData.description || '',
        drawingType: pageData.drawingType || 'default',
        shapes: []
      };
      
      this.pages.push(newPage);
      this.currentPage = newPage;
      this.showAddPageDialog = false;
      
      console.log('Added new page:', newPage.name);
      
      // Update the page manager
      if (this.$refs.pageManager) {
        this.$refs.pageManager.selectPage(newPage.id);
      }
    },
    
    updatePage(updatedPage) {
      const index = this.pages.findIndex(p => p.id === updatedPage.id);
      if (index !== -1) {
        this.pages[index] = { ...this.pages[index], ...updatedPage };
        console.log('Updated page:', updatedPage.name);
      }
    },
    
    movePage({ pageId, direction }) {
      const index = this.pages.findIndex(p => p.id === pageId);
      if (index === -1) return;
      
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= this.pages.length) return;
      
      // Swap pages
      const temp = this.pages[index];
      this.pages[index] = this.pages[newIndex];
      this.pages[newIndex] = temp;
      
      console.log(`Moved page ${this.pages[newIndex].name} ${direction > 0 ? 'down' : 'up'}`);
    },
    
    deletePage(pageId) {
      const index = this.pages.findIndex(p => p.id === pageId);
      if (index === -1) return;
      
      const pageName = this.pages[index].name;
      this.pages.splice(index, 1);
      
      // If we deleted the current page, select another one
      if (this.currentPage && this.currentPage.id === pageId) {
        this.currentPage = this.pages.length > 0 ? this.pages[0] : null;
        
        // Update the page manager
        if (this.$refs.pageManager && this.currentPage) {
          this.$refs.pageManager.selectPage(this.currentPage.id);
        }
      }
      
      console.log('Deleted page:', pageName);
    },
    
    initializeDefaultPage() {
      // Create a default page if none exists
      if (this.pages.length === 0) {
        const defaultPage = {
          id: 'page_' + Date.now().toString(),
          name: 'Page 1',
          type: 'foreground',
          backgroundPageId: '',
          description: 'Default page',
          drawingType: 'default',
          shapes: [...this.shapes] // Copy current shapes to the page
        };
        
        this.pages.push(defaultPage);
        this.currentPage = defaultPage;
        console.log('Created default page:', defaultPage.name);
        
        // Create a background page as well
        const bgPage = {
          id: 'page_bg_' + Date.now().toString(),
          name: 'Background',
          type: 'background',
          backgroundPageId: '',
          description: 'Default background page',
          drawingType: 'default',
          shapes: []
        };
        
        this.pages.push(bgPage);
        console.log('Created background page:', bgPage.name);
        
        // Log the pages to verify they were created
        console.log('Pages after initialization:', this.pages.length);
        this.pages.forEach(page => console.log(`- ${page.name} (${page.type})`));
      }
    },
    
    // Page context menu methods
    showPageContextMenu(event, page) {
      this.contextMenuPage = page;
      this.contextMenuPosition = {
        layerId: 'default', x: event.clientX,
        y: event.clientY
      };
      
      // Close context menu when clicking outside
      document.addEventListener('click', this.closeContextMenu);
    },
    
    closeContextMenu() {
      this.contextMenuPage = null;
      document.removeEventListener('click', this.closeContextMenu);
    },
    
    renamePage(page) {
      this.renameData = {
        id: page.id,
        name: page.name
      };
      this.showRenameDialog = true;
      this.closeContextMenu();
    },
    
    togglePageType(page) {
      // If changing from background to foreground, check if it's used by any pages
      if (page.type === 'background') {
        const usedBy = this.pages.filter(p => p.backgroundPageId === page.id);
        if (usedBy.length > 0) {
          const pageNames = usedBy.map(p => p.name).join(', ');
          alert(`Cannot change this background page because it's used by: ${pageNames}`);
          this.closeContextMenu();
          return;
        }
      }
      
      page.type = page.type === 'foreground' ? 'background' : 'foreground';
      this.closeContextMenu();
    },
    
    duplicatePage(page) {
      const newPage = {
        ...JSON.parse(JSON.stringify(page)),
        id: 'page_' + Date.now().toString(),
        name: `${page.name} (Copy)`,
      };
      
      this.pages.push(newPage);
      this.currentPage = newPage;
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
        console.log('Renamed page to:', page.name);
      }
      
      this.showRenameDialog = false;
    },
    
    // Draggable panel methods
    startDrag(event) {
      console.log('Start drag called');
      this.isDragging = true;
      
      // Calculate the offset from the mouse position to the panel's top-left corner
      const rect = this.$refs.pageTabsPanel.getBoundingClientRect();
      this.dragOffset = {
        layerId: 'default', x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      // Add event listeners for dragging
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      
      // Prevent default to avoid text selection during drag
      event.preventDefault();
      
      console.log('Drag started at:', event.clientX, event.clientY);
      console.log('Panel position:', this.pageTabsPosition);
      console.log('Drag offset:', this.dragOffset);
    },
    
    onDrag(event) {
      if (this.isDragging) {
        // Update the panel position based on mouse position and offset
        const newX = event.clientX - this.dragOffset.x;
        const newY = event.clientY - this.dragOffset.y;
        
        this.pageTabsPosition = {
          layerId: 'default', x: newX,
          y: newY
        };
        
        console.log('Dragging to:', newX, newY);
      }
    },
    
    stopDrag() {
      if (this.isDragging) {
        console.log('Drag stopped at position:', this.pageTabsPosition);
        this.isDragging = false;
        
        // Remove event listeners
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDrag);
      }
    },
    
    togglePageTabs() {
      // If we're showing the panel, position it in the center of the screen
      if (!this.showPageTabs) {
        // Calculate center position
        const centerX = Math.max(window.innerWidth / 2 - 150, 0); // 300px wide panel, centered
        const centerY = Math.max(window.innerHeight / 2 - 200, 0); // Reasonable top position
        
        this.pageTabsPosition = { layerId: 'default', x: centerX, y: centerY };
        console.log('Positioning pages panel at center:', this.pageTabsPosition);
      }
      
      this.showPageTabs = !this.showPageTabs;
    },
    
    saveCurrentShapesToPage() {
      if (this.currentPage && this.$refs.pageManager) {
        // Save current shapes to the current page
        this.$refs.pageManager.updatePageShapes(this.currentPage.id, [...this.shapes]);
      }
    },
    
    toggleTabPosition() {
      this.tabPosition = this.tabPosition === 'top' ? 'bottom' : 'top';
    },
    
    handleRibbonAction({ type, value }) {
      console.log(`Ribbon action: ${type} - ${value}`);
      if (type === 'tool') {
        this.currentTool = value;
        if (value === 'text') {
          this.currentStyles = { ...this.currentStyles, ...this.textStyles };
        }
      } else if (type === 'style') {
        this.currentStyles = { ...this.currentStyles, ...value };
      } else if (type === 'insert') {
        if (value === 'page') {
          // Open the add page dialog through the page manager
          if (this.$refs.pageManager) {
            this.$refs.pageManager.addPage();
          }
        } else if (value === 'layers') {
          this.showLayers = !this.showLayers;
        } else {
          console.log(`Insert action: ${value}`);
        }
      } else if (type === 'clipboard') {
        console.log(`Clipboard action: ${value}`);
        if (value === 'cut' && this.selectedShapes.length > 0) {
          this.clipboard = this.selectedShapes.map(shape => ({...shape}));
          console.log('Cut', this.clipboard.length, 'shapes to clipboard');
          this.deleteSelected();
        } else if (value === 'copy' && this.selectedShapes.length > 0) {
          this.clipboard = this.selectedShapes.map(shape => ({...shape}));
          console.log('Copied', this.clipboard.length, 'shapes to clipboard');
        } else if (value === 'paste' && this.clipboard && this.clipboard.length > 0) {
          const newShapes = this.clipboard.map(shape => {
            const newShape = {...shape};
            newShape.id = Date.now() + Math.random();
            newShape.x += 20;
            newShape.y += 20;
            return newShape;
          });
          this.shapes.push(...newShapes);
          this.selectedShapes = newShapes;
          this.addHistory(this.shapes);
          console.log('Pasted', newShapes.length, 'shapes');
        }
      } else if (type === 'insert') {
        if (value === 'layers') {
          this.showLayers = !this.showLayers;
        } else {
          console.log(`Insert action: ${value}`);
        }
      } else if (type === 'import') {
        this.importFile(value);
      } else if (type === 'view') {
        if (value === 'grid') {
          this.gridSize = this.gridSize ? 0 : 20;
        } else if (value === 'zoomIn') {
          this.zoomCanvas(1.2);
        } else if (value === 'zoomOut') {
          this.zoomCanvas(0.8);
        } else if (value === 'layers') {
          this.showLayers = !this.showLayers;
          console.log('Toggling layers panel:', this.showLayers ? 'shown' : 'hidden');
        } else if (value === 'pages') {
          this.togglePageTabs();
          console.log('Toggling pages panel:', this.showPageTabs ? 'shown' : 'hidden');
        } else if (value === 'shapeLibrary') {
          this.toggleShapeLibrary();
          console.log('Toggling shape library panel:', this.showShapeLibrary ? 'shown' : 'hidden');
          // Force a re-render to ensure the panel is visible
          this.$forceUpdate();
        } else if (value.gridSize) {
          this.gridSize = Number(value.gridSize);
        } else if (value.gridOpacity) {
          this.gridOpacity = Number(value.gridOpacity) / 100;
        } else if (value === 'rulers') {
          this.showRulers = !this.showRulers;
        } else if (value === 'snapToGrid') {
          this.snapToGrid = !this.snapToGrid;
        }
      } else if (type === 'history') {
        if (value === 'undo') this.undo();
        else if (value === 'redo') this.redo();
      } else if (type === 'edit') {
        if (value === 'undo') this.undo();
        else if (value === 'redo') this.redo();
      } else if (type === 'ai') {
        console.log('AI shape suggestion');
      } else if (type === 'arrange') {
        if (value === 'group') {
          this.$refs.canvas.groupSelectedShapes();
        } else if (value === 'ungroup') {
          this.$refs.canvas.ungroupSelectedShapes();
        }
      } else if (type === 'tools') {
        if (value === 'pageManager') {
          this.showPageManagerDialog = true;
        } else if (value === 'layerManager') {
          this.showLayers = !this.showLayers;
        } else if (value === 'calculator') {
          this.showCalculator = !this.showCalculator;
          console.log('Calculator toggled:', this.showCalculator ? 'shown' : 'hidden');
        } else if (value === 'colorPicker') {
          this.showColorPicker = !this.showColorPicker;
          console.log('Color Picker toggled:', this.showColorPicker ? 'shown' : 'hidden');
        } else if (value === 'bomGenerator') {
          this.toggleBOMGenerator();
        } else {
          console.log(`Tool action: ${value}`);
        }
      }
    },
    handleToolChange(tool) {
      console.log('Tool changed to:', tool);
      this.currentTool = tool;
    },
    handleGlobalKeyDown(e) {
      console.log('Global key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
      if (document.activeElement && 
          (document.activeElement.tagName === 'INPUT' || 
           document.activeElement.tagName === 'TEXTAREA' || 
           document.activeElement.isContentEditable)) {
        return;
      }
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        this.undo();
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey && e.shiftKey && (e.key === 'Z' || e.key === 'z')) || 
          (e.ctrlKey && e.key === 'y')) {
        this.redo();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'a') {
        this.selectedShapes = [...this.shapes];
        e.preventDefault();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace')) {
        console.log('Delete key pressed, selected shapes:', this.selectedShapes.length);
        if (this.selectedShapes.length > 0) {
          console.log('Deleting shapes...');
          this.deleteSelected();
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'g' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.toggleSnapToGrid();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'x' && this.selectedShapes.length > 0) {
        this.clipboard = this.selectedShapes.map(shape => ({...shape}));
        console.log('Cut', this.clipboard.length, 'shapes to clipboard');
        this.deleteSelected();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'c' && this.selectedShapes.length > 0) {
        this.clipboard = this.selectedShapes.map(shape => ({...shape}));
        console.log('Copied', this.clipboard.length, 'shapes to clipboard');
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === 'v' && this.clipboard && this.clipboard.length > 0) {
        const newShapes = this.clipboard.map(shape => {
          const newShape = {...shape};
          newShape.id = Date.now() + Math.random();
          newShape.x += 20;
          newShape.y += 20;
          return newShape;
        });
        this.shapes.push(...newShapes);
        this.selectedShapes = newShapes;
        this.addHistory(this.shapes);
        console.log('Pasted', newShapes.length, 'shapes');
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === '0') {
        const canvasComponent = this.$refs.canvas;
        if (canvasComponent) {
          canvasComponent.resetZoom();
        }
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        const canvasComponent = this.$refs.canvas;
        if (canvasComponent) {
          canvasComponent.zoomTarget = Math.min(canvasComponent.zoom + 0.1, 4);
        }
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === '-') {
        const canvasComponent = this.$refs.canvas;
        if (canvasComponent) {
          canvasComponent.zoomTarget = Math.max(canvasComponent.zoom - 0.1, 0.3);
        }
        e.preventDefault();
        return;
      }
    },
    clearCanvas() {
      this.shapes = [];
      this.selectedShapes = [];
      this.history = [];
      this.historyIndex = -1;
      this.addHistory({ shapes: [] });
    },
    openFile() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csp';
      input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            this.shapes = data.shapes || [];
            this.addHistory(this.shapes);
          } catch (error) {
            console.error('Error opening file:', error);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },
    saveFile() {
      const data = { shapes: this.shapes };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `canvas.csp`;
      link.click();
      URL.revokeObjectURL(url);
    },
    saveFileAs() {
      const data = { shapes: this.shapes };
      const filename = prompt('Enter filename (without extension):', 'canvas') || 'canvas';
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.csp`;
      link.click();
      URL.revokeObjectURL(url);
    },
    exportAsPDF() {
      const canvas = this.$refs.canvas.$refs.canvas;
      if (!canvas) {
        console.error('Canvas not found');
        return;
      }
      const dataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const a4Width = 297;
      const a4Height = 210;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const aspectRatio = canvasWidth / canvasHeight;
      let imgWidth = a4Width;
      let imgHeight = imgWidth / aspectRatio;
      if (imgHeight > a4Height) {
        imgHeight = a4Height;
        imgWidth = imgHeight * aspectRatio;
      }
      const xOffset = (a4Width - imgWidth) / 2;
      const yOffset = (a4Height - imgHeight) / 2;
      pdf.addImage(dataURL, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
      pdf.save('canvas.pdf');
    },
    exportAsPNG() {
      const canvas = this.$refs.canvas.$refs.canvas;
      if (!canvas) return;
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas.png';
      link.click();
    },
    exportAsSVG() {
      const svg = `<svg width="${this.canvasWidth}" height="${this.canvasHeight}" xmlns="http://www.w3.org/2000/svg">
        ${this.shapes.map(shape => {
          if (shape.type === 'rectangle') {
            return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" stroke="${shape.stroke}" fill="${shape.fill}" stroke-width="${shape.lineWidth}"/>`;
          } else if (shape.type === 'circle') {
            const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
            return `<circle cx="${shape.x}" cy="${shape.y}" r="${radius}" stroke="${shape.stroke}" fill="${shape.fill}" stroke-width="${shape.lineWidth}"/>`;
          }
          return '';
        }).join('')}
      </svg>`;
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'canvas.svg';
      link.click();
      URL.revokeObjectURL(url);
    },
    exportAsJSON() {
      const data = { shapes: this.shapes };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'canvas.json';
      link.click();
      URL.revokeObjectURL(url);
    },
    
    /**
     * Initialize auto-save functionality
     */
    initAutoSave() {
      if (!this.autoSaveEnabled) return;
      
      // Clear any existing timer
      if (this.autoSaveTimer) {
        clearInterval(this.autoSaveTimer);
      }
      
      // Set up auto-save timer - but don't trigger immediately on startup
      this.autoSaveTimer = setInterval(() => {
        // Only auto-save if document has been modified
        if (this.documentModified) {
          this.performAutoSave();
        }
      }, this.autoSaveInterval);
      
      console.log(`Auto-save initialized with interval of ${this.autoSaveInterval / 1000} seconds`);
    },
    
    /**
     * Perform auto-save operation
     */
    performAutoSave() {
      if (!this.autoSaveEnabled) return;
      
      try {
        // Update status
        this.autoSaveStatus = 'saving';
        this.autoSaveMessage = 'Saving...';
        
        // Clear any existing timeout for hiding the indicator
        if (this.autoSaveIndicatorTimeout) {
          clearTimeout(this.autoSaveIndicatorTimeout);
        }
        
        // Create save data
        const saveData = {
          version: this.appVersion,
          timestamp: new Date().toISOString(),
          documentName: this.documentName,
          shapes: this.shapes,
          layers: this.layers,
          selectedLayerIndex: this.selectedLayerIndex,
          gridSize: this.gridSize,
          gridOpacity: this.gridOpacity,
          showRulers: this.showRulers,
          snapToGrid: this.snapToGrid
        };
        
        // Save to localStorage
        localStorage.setItem(
          this.localStorageKey + (this.documentName || 'untitled').replace(/\s+/g, '_').toLowerCase(),
          JSON.stringify(saveData)
        );
        
        // Update status
        this.lastAutoSave = new Date();
        this.autoSaveStatus = 'saved';
        this.autoSaveMessage = `Saved at ${this.lastAutoSave.toLocaleTimeString()}`;
        
        // Clear status after a delay
        this.autoSaveIndicatorTimeout = setTimeout(() => {
          this.autoSaveStatus = null;
          this.autoSaveMessage = '';
        }, 3000);
        
        console.log('Auto-save completed at', this.lastAutoSave);
      } catch (error) {
        console.error('Auto-save failed:', error);
        
        // Update status
        this.autoSaveStatus = 'error';
        this.autoSaveMessage = 'Save failed!';
        
        // Show notification
        this.showNotification({
          type: 'error',
          message: 'Auto-save failed',
          details: error.message || 'An error occurred while trying to save your work',
          duration: 8000,
          actions: [
            {
              label: 'Try Again',
              callback: () => this.performAutoSave()
            },
            {
              label: 'Save Manually',
              callback: () => this.saveFile()
            }
          ]
        });
        
        // Clear status after a longer delay
        this.autoSaveIndicatorTimeout = setTimeout(() => {
          this.autoSaveStatus = null;
          this.autoSaveMessage = '';
        }, 5000);
      }
    },
    
    /**
     * Load auto-saved data from localStorage
     */
    loadAutoSavedData() {
      try {
        const key = this.localStorageKey + (this.documentName || 'untitled').replace(/\s+/g, '_').toLowerCase();
        const savedData = localStorage.getItem(key);
        
        if (!savedData) {
          console.log('No auto-saved data found');
          return;
        }
        
        const data = JSON.parse(savedData);
        const saveTime = new Date(data.timestamp);
        const minutesAgo = Math.round((new Date() - saveTime) / 60000);
        
        // Show notification about auto-saved data
        this.showNotification({
          type: 'info',
          message: 'Auto-saved data found',
          details: `Would you like to restore your work from ${minutesAgo} minute${minutesAgo !== 1 ? 's' : ''} ago?`,
          duration: 15000,
          actions: [
            {
              label: 'Restore',
              callback: () => {
                this.restoreAutoSavedData(data);
              }
            },
            {
              label: 'Ignore',
              callback: () => {
                console.log('Auto-saved data ignored');
              }
            }
          ]
        });
        
      } catch (error) {
        console.error('Failed to load auto-saved data:', error);
      }
    },
    
    /**
     * Restore auto-saved data
     * @param {Object} data - The auto-saved data to restore
     */
    restoreAutoSavedData(data) {
      try {
        // Restore document properties
        if (data.documentName) {
          this.documentName = data.documentName;
        }
        
        // Restore shapes
        if (data.shapes && Array.isArray(data.shapes)) {
          this.shapes = data.shapes;
        }
        
        // Restore layers
        if (data.layers && Array.isArray(data.layers)) {
          this.layers = data.layers;
        }
        
        // Restore selected layer
        if (data.selectedLayerIndex !== undefined) {
          this.selectedLayerIndex = data.selectedLayerIndex;
        }
        
        // Restore grid settings
        if (data.gridSize !== undefined) {
          this.gridSize = data.gridSize;
        }
        
        if (data.gridOpacity !== undefined) {
          this.gridOpacity = data.gridOpacity;
        }
        
        if (data.showRulers !== undefined) {
          this.showRulers = data.showRulers;
        }
        
        if (data.snapToGrid !== undefined) {
          this.snapToGrid = data.snapToGrid;
        }
        
        // Reset history
        this.history = [JSON.stringify(this.shapes)];
        this.historyIndex = 0;
        
        // Show success notification
        this.showNotification({
          type: 'success',
          message: 'Auto-saved data restored',
          details: `Your work from ${new Date(data.timestamp).toLocaleString()} has been restored`,
          duration: 5000
        });
        
        console.log('Auto-saved data restored from', new Date(data.timestamp));
      } catch (error) {
        console.error('Failed to restore auto-saved data:', error);
        
        this.showNotification({
          type: 'error',
          message: 'Failed to restore auto-saved data',
          details: error.message || 'An error occurred while trying to restore your work',
          duration: 8000
        });
      }
    },
    
    /**
     * Show a notification
     * @param {Object} notification - The notification object
     */
    showNotification(notification) {
      if (this.$refs.notificationManager) {
        this.$refs.notificationManager.addNotification(notification);
      } else {
        console.error('Notification manager not available', notification);
      }
    },
    
    applySelectedColor(color) {
      // Update the current style with the selected color
      this.currentStyles = {
        ...this.currentStyles,
        fill: color
      };
      
      // If shapes are selected, apply the color to them
      if (this.selectedShapes.length > 0) {
        this.selectedShapes.forEach(shape => {
          shape.fill = color;
        });
        
        // Update the canvas
        this.updateHistory();
      }
      
      console.log('Applied color:', color);
    },
    
    /**
     * Handle shape drag start from the library
     */
    handleShapeDragStart(shape) {
      console.log('Shape drag started:', shape);
      
      // Store the shape data for later use
      this.draggedShapeData = shape;
      
      // Set the current tool to select to ensure shapes can be moved after being added
      this.currentTool = 'select';
      
      // Notify the user
      this.showNotification({
        type: 'info',
        message: `Drag "${shape.name || 'shape'}" to the canvas and drop it to add`,
        duration: 3000
      });
      
      // Make sure the canvas is visible and ready to receive the drop
      if (this.$refs.canvas) {
        this.$refs.canvas.$el.classList.add('drag-target');
      }
    },
    
    /**
     * Handle adding a shape from the library by clicking
     */
    handleAddShape(shapeData) {
      console.log('Adding shape to canvas:', shapeData);
      
      // Make sure we're in select mode
      this.currentTool = 'select';
      
      // Make sure the canvas is in select mode and properly initialized
      if (this.$refs.canvas) {
        console.log('Canvas reference found in handleAddShape');
        // Don't try to set the tool directly, it's a prop
        // this.$refs.canvas.tool = 'select';
        
        // Reset any stuck mouse states
        this.$refs.canvas.isDragging = false;
        this.$refs.canvas.isResizing = false;
        this.$refs.canvas.isRotating = false;
        this.$refs.canvas.isDrawing = false;
        
        // Force a render to ensure the canvas is ready
        this.$refs.canvas.render();
      } else {
        console.warn('Canvas reference not found in handleAddShape');
      }
      
      // Store the shape data
      this.pendingShapeData = shapeData.data || shapeData.shapeData;
      
      if (!this.pendingShapeData) {
        console.error('No valid shape data found:', shapeData);
        this.showNotification({
          type: 'error',
          message: 'Invalid shape data',
          duration: 3000
        });
        return;
      }
      
      // If the shape has part properties, show the dialog to confirm or modify them
      if (shapeData.partProperties) {
        this.partPropertiesData = { ...shapeData.partProperties };
        this.showPartPropertiesDialog = true;
      } else {
        // If no part properties, create a new shape directly in the center of the canvas
        try {
          // Make sure the canvas is initialized
          if (!this.$refs.canvas) {
            console.error('Canvas reference not found');
            this.showNotification({
              type: 'error',
              message: 'Could not add shape to canvas - canvas not found',
              duration: 3000
            });
            return;
          }
          
          // Get canvas dimensions
          let centerX = 400; // Default fallback
          let centerY = 300; // Default fallback
          
          try {
            if (this.$refs.canvas.$el) {
              const canvasRect = this.$refs.canvas.$el.getBoundingClientRect();
              console.log('Canvas rect:', canvasRect);
              centerX = canvasRect.width / 2;
              centerY = canvasRect.height / 2;
            }
          } catch (e) {
            console.warn('Error getting canvas dimensions, using defaults:', e);
          }
          
          console.log('Adding shape at center:', centerX, centerY);
          
          // Create a new shape with a unique ID and default values
          const newShape = {
            id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: this.pendingShapeData.type || 'rect',
            x: centerX,
            y: centerY,
            width: this.pendingShapeData.width || 100,
            height: this.pendingShapeData.height || 100,
            fill: '#3B82F6',  // Default blue fill
            stroke: '#2563EB', // Default blue stroke
            strokeWidth: 2,
            layerId: this.layers[this.selectedLayerIndex].id
          };
          
          // Copy all properties from pendingShapeData to the new shape
          Object.keys(this.pendingShapeData).forEach(key => {
            if (key !== 'id') { // Don't override the ID
              // Ensure color values are never empty strings
              if ((key === 'fill' || key === 'stroke') && 
                  (this.pendingShapeData[key] === '' || this.pendingShapeData[key] === undefined)) {
                // Skip empty color values, keep the defaults
                console.log(`Skipping empty ${key} value`);
              } else {
                newShape[key] = this.pendingShapeData[key];
              }
            }
          });
          
          // Final check to ensure fill and stroke are valid hex colors
          if (!newShape.fill || newShape.fill === '') {
            newShape.fill = '#3B82F6'; // Default blue
          }
          
          if (!newShape.stroke || newShape.stroke === '') {
            newShape.stroke = '#2563EB'; // Default blue
          }
          
          // Add the shape to the current layer
          if (this.layers[this.selectedLayerIndex]) {
            if (!this.layers[this.selectedLayerIndex].shapes) {
              this.layers[this.selectedLayerIndex].shapes = [];
            }
            
            this.layers[this.selectedLayerIndex].shapes.push(newShape);
            
            // Update the canvas
            this.$nextTick(() => {
              // Log the shape and all shapes for debugging
              console.log('New shape added:', newShape);
              console.log('All shapes:', this.getAllShapes());
              console.log('Current layer shapes:', this.layers[this.selectedLayerIndex].shapes);
              
              // Force a re-render of the canvas
              if (this.$refs.canvas && this.$refs.canvas.render) {
                console.log('Calling canvas render method');
                this.$refs.canvas.render();
              } else {
                console.error('Canvas render method not found');
              }
              
              this.addHistory(this.getAllShapes());
              
              // Select the new shape
              this.selectedShapes = [newShape];
              
              this.showNotification({
                type: 'success',
                message: 'Shape added to canvas',
                duration: 2000
              });
            });
          } else {
            console.error('No active layer found');
            this.showNotification({
              type: 'error',
              message: 'Could not add shape - no active layer',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Error adding shape to canvas:', error);
          this.showNotification({
            type: 'error',
            message: 'Error adding shape to canvas',
            duration: 3000
          });
        }
      }
    },
    
    /**
     * Handle canvas drop event for library shapes
     */
    handleCanvasDrop(event) {
      try {
        console.log('Canvas drop event received', event);
        
        // Make sure we're in select mode
        this.currentTool = 'select';
        
        // Remove the drag target class
        if (this.$refs.canvas) {
          this.$refs.canvas.$el.classList.remove('drag-target');
          // Don't try to set the tool directly, it's a prop
          // this.$refs.canvas.tool = 'select';
        }
        
        // Try to get data from dataTransfer
        let parsedData = null;
        try {
          // Try application/json format first
          let data = event.dataTransfer.getData('application/json');
          
          // If that fails, try text/plain format
          if (!data) {
            data = event.dataTransfer.getData('text/plain');
          }
          
          if (data) {
            parsedData = JSON.parse(data);
            console.log('Parsed drop data:', parsedData);
          } else {
            console.warn('No data found in drop event');
          }
        } catch (e) {
          console.warn('Could not parse drop data:', e);
        }
        
        // If we have data from dataTransfer, use it
        if (parsedData && parsedData.type === 'library-shape') {
          console.log('Library shape dropped from dataTransfer:', parsedData);
          
          // Store the shape data
          this.pendingShapeData = parsedData.shapeData;
          
          // If the shape has part properties, show the dialog to confirm or modify them
          if (parsedData.partProperties) {
            this.partPropertiesData = { ...parsedData.partProperties };
            this.showPartPropertiesDialog = true;
          } else {
            // If no part properties, create a new shape directly at the drop position
            this.createShapeFromLibrary(event, null);
          }
        } 
        // If we don't have data from dataTransfer, use the stored draggedShapeData
        else if (this.draggedShapeData) {
          console.log('Using stored draggedShapeData:', this.draggedShapeData);
          
          // Store the shape data
          this.pendingShapeData = this.draggedShapeData.data || this.draggedShapeData.shapeData;
          
          // If the shape has part properties, show the dialog to confirm or modify them
          if (this.draggedShapeData.partProperties) {
            this.partPropertiesData = { ...this.draggedShapeData.partProperties };
            this.showPartPropertiesDialog = true;
          } else {
            // If no part properties, create a new shape directly at the drop position
            this.createShapeFromLibrary(event, null);
          }
          
          // Clear the stored data
          this.draggedShapeData = null;
        } else {
          console.warn('No shape data found for drop');
          return;
        }
      } catch (error) {
        console.error('Error handling drop:', error);
      }
    },
    
    /**
     * Apply part properties to a dropped shape
     */
    applyPartProperties(properties) {
      this.showPartPropertiesDialog = false;
      
      // Create the shape with the properties
      this.createShapeFromLibrary({ clientX: 400, clientY: 300 }, properties);
      
      this.$emit('notification', {
        type: 'success',
        message: 'Part properties applied',
        duration: 2000
      });
    },
    
    /**
     * Create a new shape from library data
     */
    createShapeFromLibrary(event, partProperties) {
      if (!this.pendingShapeData) {
        console.error('No pending shape data available');
        return;
      }
      
      // IMPORTANT: Always set the current tool to select after adding a shape
      this.currentTool = 'select';
      
      // Make sure the canvas is in select mode and properly initialized
      if (this.$refs.canvas) {
        console.log('Canvas reference found in createShapeFromLibrary');
        // Don't try to set the tool directly, it's a prop
        // this.$refs.canvas.tool = 'select';
        
        // Reset any stuck mouse states
        this.$refs.canvas.isDragging = false;
        this.$refs.canvas.isResizing = false;
        this.$refs.canvas.isRotating = false;
        this.$refs.canvas.isDrawing = false;
        
        // Force a render to ensure the canvas is ready
        this.$refs.canvas.render();
      } else {
        console.warn('Canvas reference not found in createShapeFromLibrary');
        
        // Try to initialize the canvas after a short delay
        setTimeout(() => {
          if (this.$refs.canvas) {
            console.log('Canvas reference found after delay');
            // Don't try to set the tool directly, it's a prop
            // this.$refs.canvas.tool = 'select';
            this.$refs.canvas.render();
          }
        }, 500);
      }
      
      console.log('Creating shape from library data:', this.pendingShapeData);
      
      // Calculate position based on drop location or center of screen
      try {
        const canvasRect = this.$refs.canvas.$el.getBoundingClientRect();
        console.log('Canvas rect:', canvasRect);
        
        // Get drop coordinates, or use center of canvas if not available
        let x, y;
        
        // Check if we have canvas coordinates from the drop event
        if (event && event.canvasX !== undefined && event.canvasY !== undefined) {
          // Use the canvas coordinates directly
          x = event.canvasX;
          y = event.canvasY;
          console.log('Using canvas coordinates from drop event:', x, y);
        } else if (event && event.clientX && event.clientY) {
          // Convert screen coordinates to canvas coordinates
          const canvasComponent = this.$refs.canvas;
          if (canvasComponent && typeof canvasComponent.zoom !== 'undefined') {
            // Get the canvas offset and zoom
            const centerX = (canvasComponent.canvasWidth - canvasComponent.canvasWidth * canvasComponent.zoom) / 2 + canvasComponent.offsetX;
            const centerY = (canvasComponent.canvasHeight - canvasComponent.canvasHeight * canvasComponent.zoom) / 2 + canvasComponent.offsetY;
            
            // Convert screen coordinates to canvas coordinates
            x = (event.clientX - canvasRect.left - centerX) / canvasComponent.zoom;
            y = (event.clientY - canvasRect.top - centerY) / canvasComponent.zoom;
            console.log('Drop position (canvas coordinates):', x, y);
          } else {
            // Fallback if canvas component is not available
            x = event.clientX - canvasRect.left;
            y = event.clientY - canvasRect.top;
            console.log('Drop position (screen coordinates):', x, y);
          }
        } else {
          // Use center of canvas if no event coordinates
          x = canvasRect.width / 2;
          y = canvasRect.height / 2;
          console.log('Using center position:', x, y);
        }
        
        // Create a new shape based on the library shape type
        let newShape;
      
      if (this.pendingShapeData.type === 'rect') {
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'rectangle',
          x,
          y,
          width: this.pendingShapeData.width || 100,
          height: this.pendingShapeData.height || 100,
          fill: this.pendingShapeData.fill || this.currentStyles.fill || '#3B82F6',
          stroke: this.currentStyles.stroke || '#2563EB',
          strokeWidth: this.currentStyles.strokeWidth || 2,
          rotation: 0,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      } else if (this.pendingShapeData.type === 'circle') {
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'circle',
          x,
          y,
          width: this.pendingShapeData.radius ? this.pendingShapeData.radius * 2 : 100,
          height: this.pendingShapeData.radius ? this.pendingShapeData.radius * 2 : 100,
          radius: this.pendingShapeData.radius || 50,
          fill: this.pendingShapeData.fill || this.currentStyles.fill || '#3B82F6',
          stroke: this.currentStyles.stroke || '#2563EB',
          strokeWidth: this.currentStyles.strokeWidth || 2,
          rotation: 0,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      } else if (this.pendingShapeData.type === 'polygon') {
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'polygon',
          x,
          y,
          width: this.pendingShapeData.width || 100,
          height: this.pendingShapeData.height || 100,
          points: this.pendingShapeData.points || [],
          fill: this.pendingShapeData.fill || this.currentStyles.fill || '#3B82F6',
          stroke: this.currentStyles.stroke || '#2563EB',
          strokeWidth: this.currentStyles.strokeWidth || 2,
          rotation: 0,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      } else if (this.pendingShapeData.type === 'group' && this.pendingShapeData.shapes) {
        // For groups, we need to create a new group with all the shapes
        const shapes = this.pendingShapeData.shapes.map(shape => {
          const newShape = { ...shape };
          newShape.id = 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
          // Adjust position relative to drop point
          newShape.x = x + (shape.x - this.pendingShapeData.shapes[0].x);
          newShape.y = y + (shape.y - this.pendingShapeData.shapes[0].y);
          newShape.layerId = this.layers[this.selectedLayerIndex].id;
          
          // Ensure shape has valid colors
          if (!newShape.fill || newShape.fill === '') {
            newShape.fill = '#3B82F6';
          }
          if (!newShape.stroke || newShape.stroke === '') {
            newShape.stroke = '#2563EB';
          }
          
          return newShape;
        });
        
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'group',
          x,
          y,
          shapes,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      } else if (this.pendingShapeData.type === 'svg' && this.pendingShapeData.content) {
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'svg',
          x,
          y,
          width: this.pendingShapeData.width || 100,
          height: this.pendingShapeData.height || 100,
          content: this.pendingShapeData.content,
          fill: '#FFFFFF',
          stroke: '#2563EB',
          strokeWidth: 1,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      } else if (this.pendingShapeData.type === 'image' && this.pendingShapeData.src) {
        newShape = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
          type: 'image',
          x,
          y,
          width: this.pendingShapeData.width || 100,
          height: this.pendingShapeData.height || 100,
          src: this.pendingShapeData.src,
          fill: '#FFFFFF',
          stroke: '#2563EB',
          strokeWidth: 1,
          layerId: this.layers[this.selectedLayerIndex].id
        };
      }
      
      // Add part properties if provided
      if (newShape && partProperties) {
        newShape.partProperties = { ...partProperties };
      }
      
      // Add the shape to the canvas
      if (newShape) {
        // Make sure the shape has a layerId property
        newShape.layerId = this.layers[this.selectedLayerIndex].id;
        
        // Add the shape to the current layer
        if (!this.layers[this.selectedLayerIndex].shapes) {
          this.layers[this.selectedLayerIndex].shapes = [];
        }
        
        this.layers[this.selectedLayerIndex].shapes.push(newShape);
        
        // Update the selected shapes
        this.selectedShapes = [newShape];
        
        // Add to history
        this.addHistory(this.getAllShapes());
        
        // Force a re-render of the canvas and set up for manipulation
        this.$nextTick(() => {
          console.log('Setting up for shape manipulation after adding shape');
          
          // Set the current tool to select to allow for immediate manipulation
          this.currentTool = 'select';
          
          // Ensure the shape is selected in the canvas component
          if (this.$refs.canvas) {
            console.log('Selecting the newly added shape for manipulation');
            
            // Make sure the canvas is in select mode
            this.$refs.canvas.tool = 'select';
            
            // Force a render first
            this.$refs.canvas.render();
            
            // Wait a moment to ensure the render is complete
            setTimeout(() => {
              // Then select the shape
              this.$refs.canvas.localSelectedShapes = [newShape];
              this.$refs.canvas.$emit('shapes-selected', [newShape]);
              
              // Force another render to show the selection
              this.$refs.canvas.render();
              
              // Show a notification about the shape being added
              this.showNotification({
                type: 'success',
                message: 'Shape added to canvas - you can now move, resize, or rotate it',
                duration: 3000
              });
            }, 100);
          }
        });
        
        console.log('Shape created from library:', newShape);
      } else {
        console.error('Failed to create shape from library data');
        this.showNotification({
          type: 'error',
          message: 'Failed to create shape',
          duration: 3000
        });
      }
      
      // Clear the pending shape data
      this.pendingShapeData = null;
      } catch (error) {
        console.error('Error creating shape from library:', error);
        this.showNotification({
          type: 'error',
          message: 'Error creating shape',
          duration: 3000
        });
      }
    },
    
    /**
     * Toggle the shape library panel
     */
    toggleShapeLibrary() {
      // If we're showing the panel, position it properly
      if (!this.showShapeLibrary) {
        // Position in the center of the screen for better visibility
        const centerX = Math.max(window.innerWidth / 2 - 150, 0);
        const centerY = Math.max(window.innerHeight / 2 - 300, 0);
        
        this.shapeLibraryPosition = { layerId: 'default', x: centerX, y: centerY };
        console.log('Positioning shape library panel at center:', this.shapeLibraryPosition);
      }
      
      this.showShapeLibrary = !this.showShapeLibrary;
      console.log('Shape library toggled:', this.showShapeLibrary ? 'shown' : 'hidden');
      
      // Force a re-render to ensure the component is properly initialized
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    
    /**
     * Start dragging the Shape Library panel
     */
    startDragShapeLibrary(event) {
      // Handle both mouse and touch events
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      // For mouse events, only handle left button
      if (event.type === 'mousedown' && event.button !== 0) return;
      
      this.isDraggingShapeLibrary = true;
      this.dragOffset.x = clientX - this.shapeLibraryPosition.x;
      this.dragOffset.y = clientY - this.shapeLibraryPosition.y;
      
      console.log('Start dragging shape library at:', clientX, clientY);
      console.log('Offset:', this.dragOffset);
      
      // Add event listeners for drag and end
      if (event.type === 'mousedown') {
        document.addEventListener('mousemove', this.dragShapeLibrary);
        document.addEventListener('mouseup', this.endDragShapeLibrary);
      } else {
        document.addEventListener('touchmove', this.dragShapeLibrary);
        document.addEventListener('touchend', this.endDragShapeLibrary);
      }
      
      // Prevent text selection during drag
      event.preventDefault();
    },
    
    /**
     * Handle dragging the Shape Library panel
     */
    dragShapeLibrary(event) {
      if (!this.isDraggingShapeLibrary) return;
      
      // Handle both mouse and touch events
      const clientX = event.clientX || (event.touches && event.touches[0].clientX);
      const clientY = event.clientY || (event.touches && event.touches[0].clientY);
      
      if (!clientX || !clientY) return;
      
      // Calculate new position
      const newX = clientX - this.dragOffset.x;
      const newY = clientY - this.dragOffset.y;
      
      // Ensure the panel stays within the viewport
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      
      this.shapeLibraryPosition.x = Math.max(0, Math.min(newX, maxX));
      this.shapeLibraryPosition.y = Math.max(0, Math.min(newY, maxY));
      
      event.preventDefault();
    },
    
    /**
     * End dragging the Shape Library panel
     */
    endDragShapeLibrary(event) {
      if (!this.isDraggingShapeLibrary) return;
      
      this.isDraggingShapeLibrary = false;
      
      console.log('End dragging shape library at:', this.shapeLibraryPosition);
      
      // Remove event listeners
      document.removeEventListener('mousemove', this.dragShapeLibrary);
      document.removeEventListener('mouseup', this.endDragShapeLibrary);
      document.removeEventListener('touchmove', this.dragShapeLibrary);
      document.removeEventListener('touchend', this.endDragShapeLibrary);
      
      if (event) event.preventDefault();
    },
    
    /**
     * Start dragging the Pages panel
     */
    startDragPages(event) {
      // Only handle left mouse button
      if (event.button !== 0) return;
      
      this.isDragging = true;
      this.dragOffset.x = event.clientX - this.pageTabsPosition.x;
      this.dragOffset.y = event.clientY - this.pageTabsPosition.y;
      
      // Add event listeners for drag and end
      document.addEventListener('mousemove', this.dragPages);
      document.addEventListener('mouseup', this.endDragPages);
      
      // Prevent text selection during drag
      event.preventDefault();
    },
    
    /**
     * Handle dragging the Pages panel
     */
    dragPages(event) {
      if (!this.isDragging) return;
      
      this.pageTabsPosition.x = event.clientX - this.dragOffset.x;
      this.pageTabsPosition.y = event.clientY - this.dragOffset.y;
    },
    
    /**
     * End dragging the Pages panel
     */
    endDragPages() {
      this.isDragging = false;
      
      // Remove event listeners
      document.removeEventListener('mousemove', this.dragPages);
      document.removeEventListener('mouseup', this.endDragPages);
    },
    
    /**
     * Toggle the BOM generator
     */
    toggleBOMGenerator() {
      this.showBOMGenerator = !this.showBOMGenerator;
      console.log('BOM generator toggled:', this.showBOMGenerator ? 'shown' : 'hidden');
    },
    importFile(type) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = type === 'svg' ? '.svg' : type === 'png' ? '.png' : '.json';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (type === 'png') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const newShape = {
                id: Date.now(),
                type: 'image',
                x: 0,
                y: 0,
                width: img.width / 2,
                height: img.height / 2,
                image: img,
                ...this.currentStyles,
                layerId: this.layers[this.selectedLayerIndex].id
              };
              this.shapes = [...this.shapes, newShape];
              this.addHistory(this.shapes);
              console.log('Imported PNG shape:', newShape);
            };
            img.onerror = () => {
              console.error('Failed to load image');
            };
            img.src = event.target.result;
          };
          reader.readAsDataURL(file);
        } else if (type === 'json') {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target.result);
              if (data.shapes) {
                const newShapes = data.shapes.map(shape => ({
                  ...shape,
                  id: Date.now() + Math.random(),
                  layerId: this.layers[this.selectedLayerIndex].id
                }));
                this.shapes = [...newShapes];
                this.addHistory(this.shapes);
                console.log('Imported JSON shapes:', newShapes.length);
              }
            } catch (error) {
              console.error('Error importing JSON:', error);
            }
          };
          reader.readAsText(file);
        } else if (type === 'svg') {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(event.target.result, 'image/svg+xml');
              const rects = svgDoc.getElementsByTagName('rect');
              const newShapes = [];
              for (let rect of rects) {
                newShapes.push({
                  id: Date.now() + Math.random(),
                  type: 'rectangle',
                  x: parseFloat(rect.getAttribute('x') || 0),
                  y: parseFloat(rect.getAttribute('y') || 0),
                  width: parseFloat(rect.getAttribute('width') || 100),
                  height: parseFloat(rect.getAttribute('height') || 100),
                  stroke: rect.getAttribute('stroke') || '#000000',
                  fill: rect.getAttribute('fill') || '#000000',
                  lineWidth: parseFloat(rect.getAttribute('stroke-width') || 2),
                  layerId: this.layers[this.selectedLayerIndex].id
                });
              }
              this.shapes = [...this.shapes, ...newShapes];
              this.addHistory(this.shapes);
              console.log('Imported SVG shapes:', newShapes.length);
            } catch (error) {
              console.error('Error importing SVG:', error);
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    },
    selectLayer(index) {
      console.log('Selected layer:', index);
      this.selectedLayerIndex = index;
    },
    toggleLayerVisibility(index) {
      console.log('Toggling visibility for layer', index, 'from', this.layers[index].visible, 'to', !this.layers[index].visible);
      this.$set(this.layers[index], 'visible', !this.layers[index].visible);
    },
    toggleLayerFreeze(index) {
      console.log('Toggling freeze for layer', index, 'from', this.layers[index].frozen, 'to', !this.layers[index].frozen);
      this.$set(this.layers[index], 'frozen', !this.layers[index].frozen);
    },
    addLayer() {
      const newLayerNumber = this.layers.length + 1;
      const maxId = Math.max(...this.layers.map(layer => layer.id), -1);
      const newId = maxId + 1;
      const newLayer = {
        id: newId,
        name: `Layer ${newLayerNumber}`,
        visible: true,
        frozen: false,
        opacity: 100,
        shapes: []
      };
      this.layers.push(newLayer);
      this.selectedLayerIndex = this.layers.length - 1;
    },
    deleteLayer(index) {
      if (this.layers.length <= 1) return;
      this.layers.splice(index, 1);
      if (this.selectedLayerIndex >= this.layers.length) {
        this.selectedLayerIndex = this.layers.length - 1;
      }
    },
    moveLayer({ index, direction }) {
      if (direction === 'up' && index > 0) {
        const temp = this.layers[index - 1];
        this.$set(this.layers, index - 1, this.layers[index]);
        this.$set(this.layers, index, temp);
        if (this.selectedLayerIndex === index) {
          this.selectedLayerIndex--;
        } else if (this.selectedLayerIndex === index - 1) {
          this.selectedLayerIndex++;
        }
      } else if (direction === 'down' && index < this.layers.length - 1) {
        const temp = this.layers[index + 1];
        this.$set(this.layers, index + 1, this.layers[index]);
        this.$set(this.layers, index, temp);
        if (this.selectedLayerIndex === index) {
          this.selectedLayerIndex++;
        } else if (this.selectedLayerIndex === index + 1) {
          this.selectedLayerIndex--;
        }
      }
    },
    duplicateLayer(index) {
      const originalLayer = this.layers[index];
      const newLayer = JSON.parse(JSON.stringify(originalLayer));
      newLayer.name = `${originalLayer.name} (Copy)`;
      this.layers.splice(index + 1, 0, newLayer);
      this.selectedLayerIndex = index + 1;
    },
    mergeLayerDown(index) {
      if (index >= this.layers.length - 1) return;
      const upperLayer = this.layers[index];
      const lowerLayer = this.layers[index + 1];
      if (upperLayer.shapes && upperLayer.shapes.length) {
        lowerLayer.shapes = [...lowerLayer.shapes, ...upperLayer.shapes];
      }
      this.layers.splice(index, 1);
      if (this.selectedLayerIndex === index) {
        this.selectedLayerIndex = index;
      } else if (this.selectedLayerIndex > index) {
        this.selectedLayerIndex--;
      }
    },
    clearLayer(index) {
      this.layers[index].shapes = [];
    },
    renameLayer({ index, name }) {
      this.layers[index].name = name;
    },
    updateLayerOpacity({ index, opacity }) {
      console.log(`Updating layer ${index} opacity to ${opacity}%`);
      this.layers[index].opacity = opacity;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    updateLayers(updatedLayers) {
      console.log('App: Updating layers', updatedLayers);
      this.layers = updatedLayers;
      this.$nextTick(() => {
        this.$forceUpdate();
      });
    },
    /**
     * Get all shapes from all layers
     */
    getAllShapes() {
      console.log('Getting all shapes from all layers');
      
      // Collect shapes from all layers
      let allShapes = [];
      
      this.layers.forEach(layer => {
        if (layer.shapes && Array.isArray(layer.shapes)) {
          // Make sure each shape has a layerId
          const shapesWithLayerId = layer.shapes.map(shape => ({
            ...shape,
            layerId: layer.id
          }));
          
          allShapes = [...allShapes, ...shapesWithLayerId];
        }
      });
      
      console.log(`Found ${allShapes.length} shapes in all layers`);
      return allShapes;
    },
    
    /**
     * Get only shapes from visible layers
     */
    getVisibleShapes() {
      const visibleLayers = this.layers
        .filter(layer => layer.visible)
        .map(layer => ({
          id: layer.id,
          opacity: layer.opacity || 100
        }));
      const visibleLayerIds = visibleLayers.map(layer => layer.id);
      console.log('Visible layer IDs:', visibleLayerIds);
      
      // Get all shapes first
      const allShapes = this.getAllShapes();
      
      // Then filter to only visible layers
      return allShapes.filter(shape => {
        if (shape.layerId === undefined) return true;
        return visibleLayerIds.includes(shape.layerId);
      }).map(shape => {
        const shapeCopy = { ...shape };
        if (shapeCopy.layerId !== undefined) {
          const layer = visibleLayers.find(l => l.id === shapeCopy.layerId);
          if (layer && layer.opacity < 100) {
            shapeCopy._layerOpacity = layer.opacity / 100;
          }
        }
        return shapeCopy;
      });
    },
    addHistory(shapes) {
      if (this._skipHistoryAdd) return;
      try {
        let shapesToAdd;
        if (Array.isArray(shapes)) {
          shapesToAdd = shapes;
        } else if (shapes && shapes.shapes) {
          shapesToAdd = shapes.shapes;
        } else {
          console.error('Invalid shapes passed to addHistory:', shapes);
          return;
        }
        
        // Update the shapes in the appropriate layers
        this.updateLayersWithShapes(shapesToAdd);
        
        // Create a snapshot for history
        const snapshot = JSON.stringify(shapesToAdd, (key, value) => {
          if (key === 'image' && value instanceof HTMLImageElement) {
            return { src: value.src }; // Serialize image src
          }
          return value;
        });
        
        // Update history
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snapshot);
        this.historyIndex = this.history.length - 1;
        console.log(`Added history state with ${shapesToAdd.length} shapes`);
        
        // Limit history size
        const MAX_HISTORY = 30;
        if (this.history.length > MAX_HISTORY) {
          this.history = this.history.slice(-MAX_HISTORY);
          this.historyIndex = this.history.length - 1;
        }
        
        // Mark document as modified and trigger auto-save
        this.documentModified = true;
        
        // Trigger auto-save after a short delay to avoid too frequent saves
        if (this.autoSaveEnabled) {
          clearTimeout(this._autoSaveDebounceTimer);
          this._autoSaveDebounceTimer = setTimeout(() => {
            this.performAutoSave();
          }, 5000); // Wait 5 seconds after last edit before saving
        }
      } catch (error) {
        console.error('Error adding to history:', error);
      }
    },
    
    /**
     * Update the layers with the given shapes
     * This ensures shapes are properly stored in their respective layers
     */
    updateLayersWithShapes(shapes) {
      console.log('Updating layers with shapes:', shapes.length);
      
      // First, clear all shapes from all layers
      this.layers.forEach(layer => {
        layer.shapes = [];
      });
      
      // Then, add each shape to its respective layer
      shapes.forEach(shape => {
        // Skip shapes with type 'select' as they are temporary selection rectangles
        if (shape.type === 'select') {
          console.log('Skipping selection rectangle:', shape.id);
          return;
        }
        
        // Ensure shape has a valid layerId
        if (!shape.layerId) {
          console.warn('Shape has no layerId, adding to selected layer:', shape);
          shape.layerId = this.layers[this.selectedLayerIndex].id;
        }
        
        // Fix any 'layer' property (old format) by converting to layerId
        if (shape.layer && !shape.layerId) {
          console.warn('Converting shape.layer to shape.layerId:', shape);
          shape.layerId = shape.layer;
          delete shape.layer;
        }
        
        // Ensure shape has valid coordinates
        if (shape.x === undefined || shape.y === undefined) {
          console.warn('Shape missing coordinates, setting defaults:', shape);
          shape.x = shape.x || 0;
          shape.y = shape.y || 0;
        }
        
        // Ensure shape has valid dimensions
        if ((shape.width === undefined || shape.width === null) && 
            shape.type !== 'pen' && shape.type !== 'line' && shape.type !== 'arrow') {
          console.warn('Shape missing width, setting default:', shape);
          shape.width = 100;
        }
        
        if ((shape.height === undefined || shape.height === null) && 
            shape.type !== 'pen' && shape.type !== 'line' && shape.type !== 'arrow') {
          console.warn('Shape missing height, setting default:', shape);
          shape.height = 100;
        }
        
        // Add shape to its layer
        const layerIndex = this.layers.findIndex(layer => layer.id === shape.layerId);
        if (layerIndex !== -1) {
          if (!this.layers[layerIndex].shapes) {
            this.layers[layerIndex].shapes = [];
          }
          this.layers[layerIndex].shapes.push(shape);
        } else {
          console.warn('Layer not found for shape:', shape);
          // Add to selected layer as fallback
          if (!this.layers[this.selectedLayerIndex].shapes) {
            this.layers[this.selectedLayerIndex].shapes = [];
          }
          shape.layerId = this.layers[this.selectedLayerIndex].id;
          this.layers[this.selectedLayerIndex].shapes.push(shape);
        }
      });
      
      // Update the main shapes array for backward compatibility
      // Filter out any selection rectangles
      this.shapes = shapes.filter(shape => shape.type !== 'select');
    },
    updateHistory(shapes) {
      console.log('updateHistory called with shapes:', shapes ? shapes.length : 'none');
      
      // Make sure we have a valid shapes array
      if (!shapes || !Array.isArray(shapes)) {
        console.warn('Invalid shapes array in updateHistory');
        return;
      }
      
      // Create a new shapes array to ensure reactivity
      this.shapes = [...shapes];
      
      // Add to history
      this.addHistory(shapes);
    },
    deleteHistory(shapes) {
      this.addHistory(shapes);
    },
    undo() {
      if (Date.now() - (this._lastUndoTime || 0) < 100) return;
      this._lastUndoTime = Date.now();
      if (this.historyIndex <= 0) {
        console.log('At earliest history state');
        return;
      }
      try {
        this._skipHistoryAdd = true;
        this.historyIndex--;
        const snapshot = this.history[this.historyIndex];
        this.shapes = JSON.parse(snapshot, (key, value) => {
          if (key === 'image' && value && value.src) {
            const img = new Image();
            img.src = value.src;
            return img;
          }
          return value;
        });
        this.selectedShapes = [];
      } catch (error) {
        console.error('Undo error:', error);
      } finally {
        this._skipHistoryAdd = false;
      }
    },
    redo() {
      if (Date.now() - (this._lastRedoTime || 0) < 100) return;
      this._lastRedoTime = Date.now();
      if (this.historyIndex >= this.history.length - 1) {
        console.log('At latest history state');
        return;
      }
      try {
        this._skipHistoryAdd = true;
        this.historyIndex++;
        const snapshot = this.history[this.historyIndex];
        this.shapes = JSON.parse(snapshot, (key, value) => {
          if (key === 'image' && value && value.src) {
            const img = new Image();
            img.src = value.src;
            return img;
          }
          return value;
        });
        this.selectedShapes = [];
      } catch (error) {
        console.error('Redo error:', error);
      } finally {
        this._skipHistoryAdd = false;
      }
    },
    toggleSnapToGrid() {
      this.snapToGrid = !this.snapToGrid;
      console.log('Snap to grid toggled:', this.snapToGrid);
    },
    toggleSplashScreen() {
      this.showSplashScreen = true;
      console.log('Showing splash screen');
    },
    deleteSelected() {
      if (this.selectedShapes.length === 0) return;
      console.log('Deleting', this.selectedShapes.length, 'shapes');
      const selectedIds = this.selectedShapes.map(shape => shape.id);
      const newShapes = this.shapes.filter(shape => !selectedIds.includes(shape.id));
      this.shapes = newShapes;
      this.selectedShapes = [];
      this.addHistory(newShapes);
      console.log('Shapes after deletion:', this.shapes.length, 'Current history index:', this.historyIndex);
    },
    updateShape(shape) {
      console.log('Updating shape:', shape);
      const index = this.shapes.findIndex(s => s.id === shape.id);
      if (index !== -1) {
        // Preserve image property if it exists
        const existingShape = this.shapes[index];
        this.shapes[index] = {
          ...shape,
          image: shape.image || existingShape.image // Retain original image
        };
        const selectedIndex = this.selectedShapes.findIndex(s => s.id === shape.id);
        if (selectedIndex !== -1) {
          this.selectedShapes[selectedIndex] = { ...this.shapes[index] };
        }
        this.addHistory(this.shapes);
        this.$nextTick(() => {
          this.selectedShapes = [...this.selectedShapes];
        });
      }
    },
    updateSelectedShapes(shapes) {
      console.log('Selected shapes updated:', shapes.length);
      this.selectedShapes = shapes.slice();
      if (shapes.length > 0) {
        console.log('Selected shape IDs:', shapes.map(s => s.id));
        
        // Show a notification about Alt+D shortcut
        this.showNotification({
          type: 'info',
          message: 'Tip: Press Alt+D to drag selected shape to library',
          duration: 5000
        });
      }
    },
    zoomCanvas(factor) {
      const canvas = this.$refs.canvas;
      if (canvas) {
        canvas.zoomTarget *= factor;
        canvas.zoomTarget = Math.min(Math.max(canvas.zoomTarget, 0.3), 4);
      }
    },
    /**
     * Initialize an empty canvas with default layers
     */
    initializeEmptyCanvas() {
      // Create default layers
      this.layers = [
        { 
          id: 0,
          name: 'Layer 1', 
          visible: true, 
          frozen: false,
          opacity: 100,
          shapes: [] 
        }
      ];
      
      // Start with empty shapes array
      this.shapes = [];
      
      // No selected shapes
      this.selectedShapes = [];
      
      console.log('Initialized empty canvas');
    },
    
    /**
     * Create test shapes for development/testing
     * This method is kept for reference but not used in production
     */
    createTestShapes() {
      this.layers = [
        { 
          id: 0,
          name: 'Text Layer', 
          visible: true, 
          frozen: false,
          opacity: 100,
          shapes: [] 
        },
        { 
          id: 1,
          name: 'Shapes Layer', 
          visible: true, 
          frozen: false,
          opacity: 100,
          shapes: [] 
        }
      ];
      this.shapes = [
        {
          id: Date.now() + 1,
          type: 'text',
          x: 100,
          y: 100,
          width: 200,
          height: 30,
          rotation: 0,
          fontFamily: 'Arial, sans-serif',
          fontSize: 24,
          fontWeight: 'bold',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          fill: '#000000',
          stroke: '#000000',
          lineStyle: 'solid',
          layerId: 0
        },
        {
          id: Date.now() + 2,
          type: 'rectangle',
          x: 100,
          y: 150,
          width: 100,
          height: 80,
          rotation: 0,
          lineWidth: 2,
          stroke: '#000000',
          fill: '#000000',
          lineStyle: 'dashed',
          layerId: 1
        },
        {
          id: Date.now() + 3,
          type: 'circle',
          x: 300,
          y: 200,
          width: 50,
          height: 50,
          rotation: 0,
          lineWidth: 2,
          stroke: '#000000',
          fill: '#000000',
          lineStyle: 'dotted',
          layerId: 1
        }
      ];
      console.log('Created test shapes:', this.shapes.length);
      this.selectedShapes = [...this.shapes];
      console.log('Selected all test shapes');
    }
  }
}
</script>

<style>
html, body {
  @apply bg-gray-900 text-gray-100;
  height: 100%;
  overflow: hidden;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-gray-800;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
</style>