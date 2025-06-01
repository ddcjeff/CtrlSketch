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
      />
      
      <div class="flex flex-1 overflow-hidden">
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
            @show-notification="showNotification"
            class="w-full h-full"
          />
          
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
    NotificationManager
  },
  mounted() {
    console.log('CtrlSketch initialized');
    
    // Initialize with empty canvas
    this.initializeEmptyCanvas();
    
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
    
    // Initialize auto-save
    this.initAutoSave();
    
    // Try to load auto-saved data
    this.loadAutoSavedData();
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
      currentStyles: { lineWidth: 2, stroke: '#000000', fill: '#00000000', lineStyle: 'solid' },
      textStyles: { lineWidth: 1, stroke: '#00000000', fill: '#000000', lineStyle: 'solid' },
      activeTab: 'Home',
      gridSize: 20,
      gridOpacity: 0.5,
      showRulers: true,
      snapToGrid: false,
      showLayers: false,
      selectedLayerIndex: 0,
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
      localStorageKey: 'ctrlsketch_autosave_'
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
    handleRibbonAction({ type, value }) {
      console.log(`Ribbon action: ${type} - ${value}`);
      if (type === 'tool') {
        this.currentTool = value;
        if (value === 'text') {
          this.currentStyles = { ...this.currentStyles, ...this.textStyles };
        }
      } else if (type === 'style') {
        this.currentStyles = { ...this.currentStyles, ...value };
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
      
      // Set up auto-save timer
      this.autoSaveTimer = setInterval(() => {
        this.performAutoSave();
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
                  fill: rect.getAttribute('fill') || '#00000000',
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
    getVisibleShapes() {
      const visibleLayers = this.layers
        .filter(layer => layer.visible)
        .map(layer => ({
          id: layer.id,
          opacity: layer.opacity || 100
        }));
      const visibleLayerIds = visibleLayers.map(layer => layer.id);
      console.log('Visible layer IDs:', visibleLayerIds);
      return this.shapes.filter(shape => {
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
        this.shapes = shapesToAdd;
        const snapshot = JSON.stringify(shapesToAdd, (key, value) => {
          if (key === 'image' && value instanceof HTMLImageElement) {
            return { src: value.src }; // Serialize image src
          }
          return value;
        });
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(snapshot);
        this.historyIndex = this.history.length - 1;
        console.log(`Added history state with ${shapesToAdd.length} shapes`);
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
    updateHistory(shapes) {
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
          stroke: '#00000000',
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
          fill: '#00000000',
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
          fill: '#00000000',
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