<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Splash Screen -->
    <SplashScreen
      v-if="store.showSplashScreen"
      :version="store.appVersion"
      :license-number="store.licenseNumber"
      :duration="10000"
      @splash-complete="store.showSplashScreen = false"
    />

    <div v-show="!store.showSplashScreen">
      <!-- Menu Bar -->
      <MenuBar @menu="handleMenuAction" data-glossy-target="menuBar" />
      <Ribbon
        :active-tab="store.activeTab"
        @ribbon-action="handleRibbonAction"
        :grid-size="store.gridSize"
        :grid-opacity="Math.round(store.gridOpacity * 100)"
        :grid-type="store.gridType"
        :grid-color="store.gridColor"
        :show-layers="store.showLayers"
        :show-shape-library="store.showShapeLibrary"
        data-glossy-target="ribbon"
      />
      


      <div class="flex flex-1 overflow-hidden h-[calc(100vh-7rem)] relative">
        <!-- Shape Library Panel -->
        <div
          v-if="store.showShapeLibrary"
          class="fixed w-64 bg-gray-800 border border-gray-700 overflow-hidden z-50 shadow-xl rounded-md"
          style="height: 80vh; max-height: 600px;"
          :style="{ left: store.shapeLibraryPosition.x + 'px', top: store.shapeLibraryPosition.y + 'px' }"
          ref="shapeLibraryPanel"
        >
          <div
            class="p-2 bg-gray-900 flex justify-between items-center cursor-move"
            @mousedown="store.startDragShapeLibrary"
            @touchstart="store.startDragShapeLibrary"
          >
            <h3 class="text-white font-medium">Shape Library</h3>
            <div class="flex items-center">
              <button @click="store.toggleShapeLibrary" class="text-gray-400 hover:text-white ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div class="overflow-y-auto" style="height: calc(100% - 40px);">
            <ShapeLibrary
              :selected-shapes="store.selectedShapesObjects"
              @notification="showNotification"
              @shape-drag-start="store.handleShapeDragStart"
              @add-shape="store.handleAddShape"
            />
          </div>
        </div>

        <main class="flex-1 relative">
          <CanvasWorkspace
            ref="canvas"
            :tool="store.currentTool"
            :styles="store.currentStyles"
            :grid-size="store.gridSize"
            :grid-opacity="store.gridOpacity"
            :grid-type="store.gridType"
            :grid-color="store.gridColor"
            :snap-to-grid="store.snapToGrid"
            :shapes="store.visibleShapes"
            :selected-shapes="store.selectedShapesObjects"
            :active-layer="store.activeLayer"
            :visible-layers="store.visibleLayers"
            :show-rulers="store.showRulers"
            :auto-save-status="store.autoSaveStatus"
            :auto-save-message="store.autoSaveMessage"
            @shape-added="handleShapeAdded"
            @shape-updated="handleShapeUpdated"
            @shape-deleted="handleShapeDeleted"
            @import-file="store.importFile"
            @add-shape="handleShapeAdded"
            @shapes-selected="store.selectShapes($event.map(s => s.id))"
            @undo-requested="store.undo"
            @redo-requested="store.redo"
            @toggle-snap-grid="store.toggleSnapToGrid"
            @make-shape-part="handleMakeShapePart"
            @tool-change="store.setTool($event)"
            @update:tool="store.setTool($event)"
            @show-notification="showNotification"
            @drop="store.handleCanvasDrop"
            class="w-full h-full"
          />

          <!-- Status Bar -->
          <div
            class="absolute bottom-0 left-0 right-0 h-8 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-gray-300 text-xs z-30"
          >
            <div class="mr-4">Status: Ready</div>
            <div class="mr-4">Snap to Grid: {{ store.snapToGrid ? 'On' : 'Off' }}</div>
          </div>

          <!-- Draggable Page Tabs -->
          <div
            v-if="store.showPageTabs"
            ref="pageTabsPanel"
            class="fixed z-50 bg-gray-800 border border-gray-700 p-2 rounded-md shadow-lg"
            :style="{ left: store.pageTabsPosition.x + 'px', top: store.pageTabsPosition.y + 'px', minWidth: '120px' }"
          >
            <div
              class="flex justify-between items-center mb-2 cursor-move bg-gray-900 rounded-lg p-1 px-2"
              @mousedown.stop="store.startDragPageTabs"
            >
              <div class="text-gray-400 font-medium text-xs uppercase tracking-wider">Pages</div>
              <button @click="store.togglePageTabs" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="page in store.pages"
                :key="page.id"
                class="flex items-center px-3 py-2 rounded-md cursor-pointer text-sm font-medium border-l-4"
                :class="[
                  store.activePageId === page.id
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-yellow-400'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-transparent',
                ]"
                @click="store.setActivePage(page.id)"
                @contextmenu.prevent="store.showPageContextMenu($event, page)"
              >
                <span v-if="store.activePageId === page.id" class="mr-1">▶</span>
                <span>{{ page.name }}</span>
                <span v-if="page.type === 'background'" class="ml-1 text-xs bg-blue-800 px-1 rounded">BG</span>
              </div>
              <button
                @click="store.showAddPageDialog = true"
                class="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer hover:bg-gray-700 text-center font-bold"
              >
                + Add Page
              </button>
            </div>
          </div>

          <!-- Page Context Menu -->
          <div
            v-if="store.contextMenuPage"
            class="fixed z-50 bg-gray-800 border border-gray-700 rounded shadow-lg py-1"
            :style="{ top: store.contextMenuPosition.y + 'px', left: store.contextMenuPosition.x + 'px' }"
          >
            <div
              class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              @click="store.renamePage(store.contextMenuPage.id, prompt('Enter new name:', store.contextMenuPage.name)); store.closeContextMenu()"
            >
              Rename
            </div>
            <div
              class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              @click="store.togglePageType(store.contextMenuPage.id); store.closeContextMenu()"
            >
              {{ store.contextMenuPage.type === 'foreground' ? 'Set as Background' : 'Set as Foreground' }}
            </div>
            <div
              class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              @click="store.duplicatePage(store.contextMenuPage.id); store.closeContextMenu()"
            >
              Duplicate
            </div>
            <div
              class="px-4 py-2 hover:bg-gray-700 cursor-pointer text-white text-sm"
              :class="{ 'opacity-50 cursor-not-allowed': store.pages.length <= 1 }"
              @click="store.deletePage(store.contextMenuPage.id); store.closeContextMenu()"
            >
              Delete
            </div>
          </div>

          <!-- Side panels -->
          <div class="absolute top-4 right-4 flex flex-col gap-4">
            <StylePanel
              v-if="store.selectedShapes.length > 0"
              :selected-shapes="store.selectedShapesObjects"
              :layers="store.layers"
              @shape-updated="store.updateShape($event)"
              class="bg-gray-900 rounded-lg shadow-lg border border-gray-800 w-64"
            />
            <Layers
              v-if="store.showLayers"
              :visible="store.showLayers"
              :layers="store.layers"
              :selectedLayerIndex="store.selectedLayerIndex"
              @select-layer="(index) => store.activeLayerId = store.layers[index].id"
              @toggle-layer-visibility="store.toggleLayerVisibility"
              @toggle-layer-freeze="store.toggleLayerFreeze"
              @update-layers="store.updateLayers"
              @add-layer="store.addLayer"
              @delete-layer="store.deleteLayer"
              @move-layer="store.moveLayer"
              @duplicate-layer="store.duplicateLayer"
              @merge-down="store.mergeLayerDown"
              @clear-layer="store.clearLayer"
              @rename-layer="store.renameLayer"
              @update-layer-opacity="store.updateLayerOpacity"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- Notification Manager -->
    <NotificationManager ref="notificationManager" />

    <!-- Calculator -->
    <Calculator
      v-if="store.showCalculator"
      :initial-position="store.calculatorPosition"
      @close="store.toggleCalculator"
    />

    <!-- Color Picker -->
    <ColorPicker
      v-if="store.showColorPicker"
      :initial-position="store.colorPickerPosition"
      :initial-color="store.currentStyles.fill"
      @close="store.toggleColorPicker"
      @color-selected="store.applySelectedColor"
      @notification="showNotification"
    />

    <!-- Part Properties Dialog -->
    <PartPropertiesDialog
      :show="store.showPartPropertiesDialog"
      :initial-properties="store.partPropertiesData"
      @confirm="store.applyPartProperties"
      @cancel="store.showPartPropertiesDialog = false"
    />

    <!-- BOM Generator -->
    <BOMGenerator
      v-if="store.showBOMGenerator"
      :initial-position="store.bomGeneratorPosition"
      :pages="store.pages"
      :shapes="store.shapes"
      @close="store.toggleBOMGenerator"
      @notification="showNotification"
    />
    
    <!-- Keyboard Shortcuts Panel -->
    <KeyboardShortcutsPanel
      :show="store.showKeyboardShortcuts"
      @close="store.toggleKeyboardShortcuts"
    />

    <!-- Add Page Dialog -->
    <AddPageDialog
      :show="store.showAddPageDialog"
      :initial-data="{ name: 'New Page', type: 'foreground', backgroundPageId: '', description: '', drawingType: 'default' }"
      :background-pages="store.pages.filter((page) => page.type === 'background')"
      :is-dark-theme="false"
      @close="store.showAddPageDialog = false"
      @add="store.addPage"
    />

    <!-- Page Manager Dialog -->
    <PageManagerDialog
      :show="store.showPageManagerDialog"
      :pages="store.pages"
      :active-page="store.activePageId"
      :is-dark-theme="false"
      @close="store.showPageManagerDialog = false"
      @add-page="store.showAddPageDialog = true"
      @update-page="store.updatePage"
      @move-page="store.movePage"
      @delete-page="store.deletePage"
    />

    <!-- Rename Page Dialog -->
    <div
      v-if="store.showRenameDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-80 shadow-xl" @click.stop>
        <h3 class="text-lg font-medium text-white mb-4">Rename Page</h3>
        <div class="mb-4">
          <label for="pageName" class="block text-sm font-medium text-gray-300 mb-1">Page Name</label>
          <input
            type="text"
            id="pageName"
            v-model="store.renameData.name"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            @keyup.enter="confirmRename"
          />
        </div>
        <div class="flex justify-end gap-2">
          <button
            class="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
            @click="store.showRenameDialog = false"
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

    <!-- Drag Helper -->
    <DragHelper ref="dragHelper" />
  </div>
</template>

<script>
import { useCanvasStore } from './stores/canvasStore.js';
import { makeShapePart } from './utils/makeShapePart.js';
import MenuBar from './components/MenuBar.vue';
import Ribbon from './components/Ribbon.vue';
import CanvasWorkspace from './components/CanvasWorkspace.vue';
import Layers from './components/Layers.vue';
import StylePanel from './components/StylePanel.vue';
import SplashScreen from './components/SplashScreen.vue';
import NotificationManager from './components/NotificationManager.vue';
import PageManagerDialog from './components/PageManagerDialog.vue';
import AddPageDialog from './components/AddPageDialog.vue';
import Calculator from './components/Calculator.vue';
import ColorPicker from './components/ColorPicker.vue';
import ShapeLibrary from './components/ShapeLibrary.vue';
import PartPropertiesDialog from './components/PartPropertiesDialog.vue';
import BOMGenerator from './components/BOMGenerator.vue';
import KeyboardShortcutsPanel from './components/KeyboardShortcutsPanel.vue';
import DragHelper from './components/DragHelper.vue';

export default {
  components: {
    MenuBar,
    Ribbon,
    CanvasWorkspace,
    Layers,
    StylePanel,
    SplashScreen,
    NotificationManager,
    PageManagerDialog,
    AddPageDialog,
    Calculator,
    ColorPicker,
    ShapeLibrary,
    PartPropertiesDialog,
    BOMGenerator,
    KeyboardShortcutsPanel,
    DragHelper
  },
  data() {
    return {
      shapes: [],
      activeLayer: { id: 'default', name: 'Default', visible: true, frozen: false },
      visibleLayers: [{ id: 'default', visible: true, frozen: false, opacity: 100 }]
    };
  },
  setup() {
    const store = useCanvasStore();
    store.initializeApp();
    return { store };
  },
  mounted() {
    window.addEventListener('keydown', this.handleGlobalKeyDown);
    document.addEventListener('keydown', this.handleDeleteKey);
    
    // Always set the default tool to 'select' when the application starts
    this.store.setTool('select');
    
    const savedData = this.store.loadAutoSavedData();
    if (savedData) {
      this.showNotification({
        type: 'info',
        message: 'Auto-saved data found',
        details: `Would you like to restore your work from ${Math.round((new Date() - savedData.timestamp) / 60000)} minute(s) ago?`,
        duration: 15000,
        actions: [
          { label: 'Restore', callback: () => this.store.restoreAutoSavedData(savedData.data) },
          { label: 'Ignore', callback: () => {} },
        ],
      });
    }
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleGlobalKeyDown);
    document.removeEventListener('keydown', this.handleDeleteKey);
    if (this.store.autoSaveTimer) clearInterval(this.store.autoSaveTimer);
  },
  methods: {
    handleMenuAction({ type, value }) {
  console.log('Menu action:', type, value);
  if (type === 'tab') {
    this.store.setActiveTab(value);
  } else if (type === 'file') {
    // Map menu action values to the correct function names
    const functionMap = {
      'new': 'clearCanvas',
      'open': 'openFile',
      'save': 'saveFile',
      'saveAs': 'saveFileAs',
      'exportPdf': 'exportAsPDF',
      'exportPng': 'exportAsPNG',
      'exportSvg': 'exportAsSVG'
    };
    
    const functionName = functionMap[value];
    if (!functionName) {
      console.error(`No function mapping found for menu action: ${value}`);
      return;
    }
    
    if (['exportAsPDF', 'exportAsPNG'].includes(functionName)) {
      this.store[functionName](this.$refs.canvas?.$refs.canvas);
    } else {
      this.store[functionName]();
    }
  } else if (type === 'help') {
    if (value === 'keyboardShortcuts') {
      this.store.toggleKeyboardShortcuts();
    } else if (value === 'about') {
      this.store.toggleSplashScreen();
    } else if (value === 'userGuide') {
      window.open('/docs/User_Guide.md', '_blank');
    } else if (value === 'docs') {
      window.open('/docs/Documentation.md', '_blank');
    } else if (value === 'support') {
      window.open('https://support.hicksoft.com', '_blank');
    } else if (value === 'liveChat') {
      console.log('Open Live Chat');
    }
  }
},
    
    handleRibbonAction({ type, value }) {
      console.log('Ribbon action:', type, value);
      switch (type) {
        case 'tool':
          console.log('Setting tool to:', value);
          this.store.setTool(value);
          break;
        case 'style':
          this.store.updateStyles(value);
          break;
        case 'insert':
          if (value === 'page') this.store.showAddPageDialog = true;
          else if (value === 'layers') this.store.toggleLayersPanel();
          break;
        case 'clipboard':
          console.log('Clipboard action:', value);
          if (value === 'cut') this.store.cutShapes();
          else if (value === 'copy') this.store.copyShapes();
          else if (value === 'paste') this.store.pasteShapes();
          break;
        case 'import':
          // Pass the file type string directly to importFile
          // The function will handle creating a file input
          this.store.importFile(value);
          break;
        case 'view':
          if (value === 'grid') this.store.toggleGrid();
          else if (value === 'zoomIn') this.zoomCanvas(1.2);
          else if (value === 'zoomOut') this.zoomCanvas(0.8);
          else if (value === 'layers') this.store.toggleLayersPanel();
          else if (value === 'pages') this.store.togglePageTabs();
          else if (value === 'shapeLibrary') this.store.toggleShapeLibrary();
          else if (value === 'rulers') this.store.toggleRulers();
          else if (value === 'snapToGrid') this.store.toggleSnapToGrid();
          else this.store.updateGridSettings(value);
          break;
        case 'history':
          if (value === 'undo') this.store.undo();
          else if (value === 'redo') this.store.redo();
          break;
        case 'arrange':
          if (value === 'group') this.$refs.canvas.groupSelectedShapes();
          else if (value === 'ungroup') this.$refs.canvas.ungroupSelectedShapes();
          break;
        case 'tools':
          if (value === 'pageManager') this.store.showPageManagerDialog = true;
          else if (value === 'layerManager') this.store.toggleLayersPanel();
          else if (value === 'calculator') this.store.toggleCalculator();
          else if (value === 'colorPicker') this.store.toggleColorPicker();
          else if (value === 'bomGenerator') this.store.toggleBOMGenerator();
          else if (value === 'makeShapePart') this.handleMakeShapePart(this.store.getSelectedShapes());
          break;
        case 'ai':
          console.log('AI shape suggestion');
          break;
      }
    },
    handleGlobalKeyDown(e) {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA' ||
          document.activeElement.isContentEditable)
      )
        return;
        
      // Handle ESC key globally to ensure it always works
      if (e.key === 'Escape' || e.code === 'Escape') {
        console.log('Global ESC key handler - forcing select tool');
        this.store.setTool('select');
        e.preventDefault();
        return;
      }
        
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        this.store.undo();
        e.preventDefault();
      } else if ((e.ctrlKey && e.shiftKey && (e.key === 'Z' || e.key === 'z')) || (e.ctrlKey && e.key === 'y')) {
        this.store.redo();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === 'a') {
        this.store.selectShapes(this.store.shapes.map((s) => s.id));
        e.preventDefault();
      } else if (e.ctrlKey && e.key === 'x') {
        this.store.cutShapes();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === 'c') {
        this.store.copyShapes();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === 'v') {
        this.store.pasteShapes();
        e.preventDefault();
      } else if (e.ctrlKey && e.key === '0') {
        this.zoomCanvas(1 / (this.$refs.canvas?.zoom || 1));
        e.preventDefault();
      } else if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        this.zoomCanvas(1.1);
        e.preventDefault();
      } else if (e.ctrlKey && e.key === '-') {
        this.zoomCanvas(0.9);
        e.preventDefault();
      } else if (e.key === 'g' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        this.store.toggleSnapToGrid();
        e.preventDefault();
      } else if (e.key === 'F1') {
        this.store.toggleKeyboardShortcuts();
        e.preventDefault();
      }
    },
    handleDeleteKey(e) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (this.store.selectedShapes.length > 0) {
          this.store.deleteShapes(this.store.selectedShapes);
          e.preventDefault();
        }
      }
    },
    
    handleMakeShapePart(shapes) {
      if (!shapes || shapes.length === 0) {
        this.showNotification({
          type: 'warning',
          message: 'No shape selected',
          details: 'Please select a shape to make it a part.',
          duration: 3000
        });
        return;
      }
      
      if (shapes.length > 1) {
        this.showNotification({
          type: 'warning',
          message: 'Multiple shapes selected',
          details: 'Please select only one shape to make it a part.',
          duration: 3000
        });
        return;
      }
      
      const shape = shapes[0];
      
      // Check if the shape already has part properties
      if (shape.partProperties) {
        // If it does, show the dialog with the existing properties
        this.store.togglePartPropertiesDialog(shape.partProperties);
        
        this.showNotification({
          type: 'info',
          message: 'Edit part properties',
          details: 'You can modify the existing part properties.',
          duration: 3000
        });
      } else {
        // Initialize default part properties
        const defaultProperties = {
          name: shape.name || 'Unnamed Part',
          haystackTag: '',
          partNumber: '',
          quantity: 1,
          description: '',
          pointType: '',
          pdfPath: ''
        };
        
        // Show the part properties dialog
        this.store.togglePartPropertiesDialog(defaultProperties);
        
        this.showNotification({
          type: 'info',
          message: 'Assigning part properties',
          details: 'Please fill in the part details in the dialog.',
          duration: 3000
        });
      }
    },

    zoomCanvas(factor) {
      if (this.$refs.canvas) {
        this.$refs.canvas.zoomTarget *= factor;
        this.$refs.canvas.zoomTarget = Math.min(Math.max(this.$refs.canvas.zoomTarget, 0.3), 4);
      }
    },
    showNotification(notification) {
      this.$refs.notificationManager?.addNotification(notification);
    },
    confirmRename() {
      if (!this.store.renameData.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      this.store.renamePage(this.store.renameData.id, this.store.renameData.name);
      this.store.showRenameDialog = false;
    },
    
handleShapeAdded(newShape) {
  console.log('Shape added:', newShape);
  if (newShape) {
    if (Array.isArray(newShape)) {
      const shapeCopies = newShape.map(shape => {
        const copy = JSON.parse(JSON.stringify(shape));
        
        // Ensure ID is a proper string ID
        if (!copy.id) {
          copy.id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        } else if (typeof copy.id === 'number') {
          // Convert numeric IDs to string IDs
          copy.id = `shape-numeric-${copy.id}`;
          console.log(`Converting numeric ID ${shape.id} to string ID ${copy.id}`);
        }
        
        if (!copy.layerId) {
          copy.layerId = this.store.activeLayerId || 'default';
        }
        return copy;
      });
      
      // Add shapes one by one to avoid batch issues
      shapeCopies.forEach(shape => {
        console.log('Adding shape with ID:', shape.id);
        this.store.addShape(shape);
      });
      
      // Select all the shapes
      this.store.selectShapes(shapeCopies.map(s => s.id));
      console.log('Added shapes to store:', shapeCopies);
    } else {
      const shapeCopy = JSON.parse(JSON.stringify(newShape));
      
      // Ensure ID is a proper string ID
      if (!shapeCopy.id) {
        shapeCopy.id = `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      } else if (typeof shapeCopy.id === 'number') {
        // Convert numeric IDs to string IDs
        const numericId = shapeCopy.id;
        shapeCopy.id = `shape-numeric-${numericId}`;
        console.log(`Converting numeric ID ${numericId} to string ID ${shapeCopy.id}`);
      }
      
      if (!shapeCopy.layerId) {
        shapeCopy.layerId = this.store.activeLayerId || 'default';
      }
      
      console.log('Adding single shape with ID:', shapeCopy.id);
      this.store.addShape(shapeCopy);
      this.store.selectShapes([shapeCopy.id]);
      console.log('Added shape to store:', shapeCopy);
    }
    console.log('Store shapes after add:', this.store.shapes.length);
  }
},    
    handleShapeUpdated(shapes) {
      console.log('Shape updated event received with', shapes.length, 'shapes');
      
      // The CanvasWorkspace component emits an array of all shapes, with updated shapes
      if (Array.isArray(shapes)) {
        // Find the shapes that were updated (those in the selectedShapes array)
        const selectedIds = this.store.selectedShapes;
        console.log('Selected shape IDs:', selectedIds);
        
        const updatedShapes = shapes.filter(shape => selectedIds.includes(shape.id));
        console.log('Found', updatedShapes.length, 'shapes to update');
        
        // Update each shape in the store
        updatedShapes.forEach(shape => {
          if (shape && shape.id) {
            console.log('Updating shape in store:', shape.id, 'position:', shape.x, shape.y);
            
            // Ensure the shape has valid fill and stroke values
            if (!shape.fill || shape.fill === '') {
              shape.fill = '#3B82F6'; // Default blue
            }
            
            if (!shape.stroke || shape.stroke === '') {
              shape.stroke = '#000000'; // Default black
            }
            
            this.store.updateShape(shape);
          }
        });
      }
    },
    
    handleShapeDeleted(remainingShapes) {
      console.log('Shape deleted, remaining shapes:', remainingShapes);
      // The CanvasWorkspace component emits the remaining shapes after deletion
      // We need to determine which shapes were deleted by comparing with the current shapes
      
      // Get the current shape IDs
      const currentShapeIds = this.store.shapes.map(shape => shape.id);
      
      // Get the remaining shape IDs
      const remainingShapeIds = remainingShapes.map(shape => shape.id);
      
      // Find the deleted shape IDs (those in current but not in remaining)
      const deletedShapeIds = currentShapeIds.filter(id => !remainingShapeIds.includes(id));
      
      console.log('Deleted shape IDs:', deletedShapeIds);
      
      // Delete the shapes from the store
      if (deletedShapeIds.length > 0) {
        this.store.deleteShapes(deletedShapeIds);
      }
    }
  }
}
</script>

<style>
html,
body {
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