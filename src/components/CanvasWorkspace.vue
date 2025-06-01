<template>
  <div ref="wrapper" class="wrapper" @dblclick="resetZoom">
    <canvas
      ref="canvas"
      class="styled-canvas"
      :width="canvasWidth"
      :height="canvasHeight"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @keydown="handleKeyDown"
      tabindex="0"
    ></canvas>
    <Rulers
      v-if="showRulers"
      :show-rulers="showRulers"
      :canvas-width="canvasWidth"
      :canvas-height="canvasHeight"
      :zoom-level="zoom"
      :offset-x="offsetX"
      :offset-y="offsetY"
    />
    <div class="status-bar">
      <div class="status-item"><strong>Zoom:</strong> {{ Math.round(zoom * 100) }}%</div>
      <div class="status-item"><strong>X:</strong> {{ Math.round(cursorX) }}</div>
      <div class="status-item"><strong>Y:</strong> {{ Math.round(cursorY) }}</div>
      <div class="status-item"><strong>Selected:</strong> {{ localSelectedShapes.length }}</div>
      <div class="status-item" :class="{ 'status-active': snapToGrid }">
        <strong>Snap to Grid:</strong> {{ snapToGrid ? 'ON' : 'OFF' }}
      </div>
      
      <!-- Auto-save status -->
      <div v-if="autoSaveStatus" class="status-item auto-save-status" :class="{
        'status-saving': autoSaveStatus === 'saving',
        'status-saved': autoSaveStatus === 'saved',
        'status-error': autoSaveStatus === 'error'
      }">
        <svg v-if="autoSaveStatus === 'saving'" class="animate-spin -ml-1 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else-if="autoSaveStatus === 'saved'" class="mr-1 h-3 w-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <svg v-else-if="autoSaveStatus === 'error'" class="mr-1 h-3 w-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        <span>{{ autoSaveMessage }}</span>
      </div>
      
      <div class="flex-grow"></div>
      <button 
        @click="toggleDebugOverlay" 
        class="debug-button" 
        :class="{ 'debug-active': showDebugOverlay }"
      >
        {{ showDebugOverlay ? 'Hide Debug' : 'Debug' }}
      </button>
    </div>
  </div>
</template>

<script>
import Rulers from './Rulers.vue'

export default {
  name: "CanvasZoomGrid",
  components: { Rulers },
  props: {
    tool: String,
    styles: Object,
    gridSize: Number,
    gridOpacity: Number,
    showRulers: Boolean,
    snapToGrid: Boolean,
    shapes: {
      type: Array,
      default: () => []
    },
    selectedShapes: {
      type: Array,
      default: () => []
    },
    activeLayer: {
      type: Object,
      default: () => ({ name: 'Default', visible: true, frozen: false })
    },
    visibleLayers: {
      type: Array,
      default: () => []
    },
    autoSaveStatus: {
      type: String,
      default: null
    },
    autoSaveMessage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      ctx: null,
      zoom: 1,
      zoomTarget: 1,
      offsetX: 0,
      offsetY: 0,
      panTargetX: 0,
      panTargetY: 0,
      canvasWidth: 1632,
      canvasHeight: 1056,
      isDrawing: false,
      isDragging: false,
      isResizing: false,
      isRotating: false,
      startX: 0,
      startY: 0,
      currentShape: null,
      resizeHandle: null,
      selectionStart: null,
      lastGridSize: 0,
      lastGridOpacity: 0,
      lastZoom: 1,
      cursorX: 0,
      cursorY: 0,
      clipboard: [],
      localSelectedShapes: [],
      _renderRequested: false,
      imageCache: new Map(), // Cache images by shape ID
      
      // Canvas caching
      staticCanvas: null,
      staticCtx: null,
      staticCanvasDirty: true,
      lastCanvasWidth: 0,
      lastCanvasHeight: 0,
      animationFrameId: null,
      
      // Shape caching
      shapeCache: new Map(), // Cache rendered shapes by ID + timestamp
      shapeCacheEnabled: true,
      shapeCacheMaxAge: 5000, // 5 seconds
      
      // Performance metrics
      performanceMetrics: {
        lastRenderTime: 0,
        averageRenderTime: 0,
        renderCount: 0,
        shapesRendered: 0,
        shapesSkipped: 0,
        shapesCached: 0,
        slowRenders: 0,
        peakRenderTime: 0
      },
      showDebugOverlay: false,
      debugInfo: {
        position: { x: 10, y: 10 },
        size: { width: 400, height: 400 },
        isDragging: false,
        dragStart: { x: 0, y: 0 }
      }
    };
  },
  watch: {
    selectedShapes: {
      immediate: true,
      handler(newVal) {
        console.log('selectedShapes prop changed:', newVal.length);
        this.localSelectedShapes = [...newVal];
        this.render();
      }
    },
    shapes: {
      immediate: true,
      handler(newVal, oldVal) {
        console.log('Shapes prop changed, updating canvas:', newVal.length);
        newVal.forEach(shape => {
          if (shape.type === 'image') {
            console.log('Image shape:', { id: shape.id, layerId: shape.layerId, src: shape.src, imageExists: !!shape.image });
            if (shape.src && !shape.image) {
              this.reloadImage(shape);
            }
          }
        });
        if (oldVal) {
          // Process all shapes, not just images
          newVal.forEach((shape) => {
            const oldShape = oldVal.find(s => s.id === shape.id);
            
            // For all shapes, ensure _layerOpacity is not set
            // This will force the renderer to use the layer's opacity
            if (shape._layerOpacity !== undefined) {
              delete shape._layerOpacity;
            }
            
            // Special handling for images
            if (shape.type === 'image' && oldShape) {
              // Always preserve the image object when the shape exists in both old and new arrays
              if (oldShape.image) {
                console.log('Preserving image for shape:', { id: shape.id, oldLayer: oldShape.layerId, newLayer: shape.layerId });
                shape.image = oldShape.image;
              }
              
              // If layer changed and no image, reload it
              if (oldShape.layerId !== shape.layerId && !oldShape.image) {
                console.log('Layer changed for image without image object:', { id: shape.id, oldLayer: oldShape.layerId, newLayer: shape.layerId });
                this.reloadImage(shape);
              }
            }
          });
        }
        this.render();
      }
    },
    visibleLayers: {
      immediate: true,
      handler(newVal) {
        console.log('visibleLayers changed:', newVal.map(l => ({ id: l.id, visible: l.visible })));
        this.render();
      }
    },
    gridSize() {
      this.staticCanvasDirty = true;
      this.render();
    },
    gridOpacity() {
      this.staticCanvasDirty = true;
      this.render();
    },
    zoom() {
      this.staticCanvasDirty = true;
    },
    offsetX() {
      this.staticCanvasDirty = true;
    },
    offsetY() {
      this.staticCanvasDirty = true;
    }
  },
  mounted() {
    try {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.error('Canvas element not found');
        return;
      }
      this.ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!this.ctx) {
        console.error('Failed to get 2D context');
        return;
      }
      
      // Initialize static canvas for caching background and grid
      this.staticCanvas = document.createElement('canvas');
      this.staticCanvas.width = canvas.width;
      this.staticCanvas.height = canvas.height;
      this.staticCtx = this.staticCanvas.getContext('2d', { willReadFrequently: true });
      
      canvas.focus();
      setTimeout(() => {
        this.centerCanvas('reset');
      }, 100);
      window.addEventListener("resize", this.centerCanvas);
      canvas.addEventListener("keydown", this.handleKeyDown, true);
      document.addEventListener("keydown", this.handleKeyDown);
      canvas.addEventListener("click", () => {
        canvas.focus();
      });
      this.animate();
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.centerCanvas);
    document.removeEventListener("keydown", this.handleKeyDown);
    const canvas = this.$refs.canvas;
    if (canvas) {
      canvas.removeEventListener("keydown", this.handleKeyDown, true);
    }
    
    // Cancel any pending animation frames
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    // Clean up static canvas
    this.staticCanvas = null;
    this.staticCtx = null;
    
    // Clean up shape cache
    this.shapeCache.clear();
  },
  methods: {
    /**
     * Loads or reloads an image for a shape with improved error handling
     * @param {Object} shape - The shape object containing image data
     * @param {boolean} [showErrorNotification=true] - Whether to show error notifications to the user
     */
    reloadImage(shape, showErrorNotification = true) {
      if (!shape.src) {
        console.error('No source for image shape:', shape);
        if (showErrorNotification) {
          this.$emit('show-notification', {
            type: 'error',
            message: 'Image loading failed: Missing source URL',
            details: `Shape ID: ${shape.id}`,
            duration: 5000
          });
        }
        
        // Mark the shape as having an error
        const updatedShapes = this.shapes.map(s => 
          s.id === shape.id ? { ...s, imageError: 'missing-source' } : s
        );
        this.$emit('shape-updated', updatedShapes);
        return;
      }
      
      // First check if we already have this image in the cache
      if (this.imageCache.has(shape.id)) {
        console.log('Using cached image for shape:', shape.id);
        shape.image = this.imageCache.get(shape.id);
        
        // Update the shape in the shapes array and clear any previous errors
        const updatedShapes = this.shapes.map(s => 
          s.id === shape.id ? { ...s, image: shape.image, imageError: null } : s
        );
        this.$emit('shape-updated', updatedShapes);
        this.render();
        return;
      }
      
      // If not in cache, load the image
      console.log('Loading image for shape:', { id: shape.id, src: shape.src });
      
      // Update shape to show loading state
      const loadingShapes = this.shapes.map(s => 
        s.id === shape.id ? { ...s, isLoading: true, imageError: null } : s
      );
      this.$emit('shape-updated', loadingShapes);
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let retries = 3;
      let timeoutId = null;
      
      // Set a timeout to detect stalled image loads
      const setLoadTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.warn('Image load timeout for shape:', shape.id);
          if (retries > 0) {
            retryLoad();
          } else {
            handleMaxRetriesReached('timeout');
          }
        }, 10000); // 10 second timeout
      };
      
      const retryLoad = () => {
        retries--;
        console.log(`Retrying image load (${retries} left):`, shape.id);
        
        // Show retry notification
        if (showErrorNotification) {
          this.$emit('show-notification', {
            type: 'warning',
            message: `Retrying image load (${retries} attempts left)`,
            details: shape.src.substring(0, 50) + (shape.src.length > 50 ? '...' : ''),
            duration: 3000
          });
        }
        
        setTimeout(() => {
          setLoadTimeout();
          img.src = shape.src + (shape.src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
        }, 800);
      };
      
      const handleMaxRetriesReached = (reason) => {
        clearTimeout(timeoutId);
        console.error(`Max retries reached for image (${reason}):`, shape.id);
        
        // Update shape to show error state
        const errorShapes = this.shapes.map(s => 
          s.id === shape.id ? { ...s, isLoading: false, imageError: reason } : s
        );
        this.$emit('shape-updated', errorShapes);
        
        if (showErrorNotification) {
          this.$emit('show-notification', {
            type: 'error',
            message: 'Failed to load image after multiple attempts',
            details: 'The image might be unavailable or the URL might be incorrect',
            duration: 7000,
            actions: [
              {
                label: 'Retry',
                callback: () => this.reloadImage(shape, true)
              },
              {
                label: 'Edit URL',
                callback: () => {
                  const newUrl = prompt('Enter new image URL:', shape.src);
                  if (newUrl && newUrl !== shape.src) {
                    const updatedShapes = this.shapes.map(s => 
                      s.id === shape.id ? { ...s, src: newUrl, imageError: null } : s
                    );
                    this.$emit('shape-updated', updatedShapes);
                    this.reloadImage({...shape, src: newUrl}, true);
                  }
                }
              }
            ]
          });
        }
        
        this.render();
      };
      
      const loadImage = () => {
        setLoadTimeout();
        
        img.onload = () => {
          clearTimeout(timeoutId);
          console.log('PNG image loaded successfully:', shape.id);
          this.imageCache.set(shape.id, img);
          
          // Update the shape in the shapes array
          const updatedShapes = this.shapes.map(s => 
            s.id === shape.id ? { ...s, image: img, isLoading: false, imageError: null } : s
          );
          this.$emit('shape-updated', updatedShapes);
          this.render();
        };
        
        img.onerror = (err) => {
          clearTimeout(timeoutId);
          console.error('Failed to load PNG image:', err, shape);
          
          if (retries > 0) {
            retryLoad();
          } else {
            handleMaxRetriesReached('error');
          }
        };
        
        // Set the source last to trigger loading
        img.src = shape.src;
      };
      
      loadImage();
    },
    centerCanvas() {
      const wrapper = this.$refs.wrapper;
      if (!wrapper) return;
      if (arguments[0] === 'reset') {
        this.zoomTarget = 1;
      }
      this.panTargetX = 0;
      this.panTargetY = 0;
    },
    handleWheel(e) {
      if (e.ctrlKey) {
        const rect = this.$refs.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
        const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
        const mouseCanvasX = (mouseX - centerX) / this.zoom;
        const mouseCanvasY = (mouseY - centerY) / this.zoom;
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(this.zoom + delta, 0.3), 4);
        const zoomRatio = newZoom / this.zoom;
        const offsetChangeX = mouseX - (mouseX - centerX) * zoomRatio - centerX;
        const offsetChangeY = mouseY - (mouseY - centerY) * zoomRatio - centerY;
        this.panTargetX += offsetChangeX * 0.5;
        this.panTargetY += offsetChangeY * 0.5;
        this.zoomTarget = newZoom;
      } else if (e.shiftKey) {
        this.panTargetX += e.deltaY * 0.5;
      } else {
        this.panTargetY += e.deltaY * 0.5;
      }
      e.preventDefault();
    },
    resetZoom() {
      this.centerCanvas('reset');
    },
    /**
     * Draws a placeholder for an image based on its state
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {Object} shape - The image shape
     * @param {string} state - The state of the image ('empty', 'loading', 'error')
     */
    drawImagePlaceholder(ctx, shape, state) {
      // Base placeholder
      ctx.fillStyle = state === 'error' ? '#FEE2E2' : '#E5E7EB';
      ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      
      // Border
      ctx.strokeStyle = state === 'error' ? '#EF4444' : 
                        state === 'loading' ? '#3B82F6' : '#9CA3AF';
      ctx.lineWidth = 2 / this.zoom;
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      
      // Draw image icon
      const centerX = shape.x + shape.width / 2;
      const centerY = shape.y + shape.height / 2;
      const iconSize = Math.min(40, Math.min(shape.width, shape.height) / 2) / this.zoom;
      
      ctx.strokeStyle = state === 'error' ? '#DC2626' : 
                        state === 'loading' ? '#2563EB' : '#6B7280';
      ctx.fillStyle = state === 'error' ? '#FCA5A5' : 
                      state === 'loading' ? '#BFDBFE' : '#D1D5DB';
      
      // Draw image frame icon
      ctx.beginPath();
      ctx.rect(centerX - iconSize / 2, centerY - iconSize / 2, iconSize, iconSize);
      ctx.fill();
      ctx.stroke();
      
      // Draw sun/mountain inside frame
      ctx.beginPath();
      ctx.arc(centerX - iconSize / 4, centerY - iconSize / 4, iconSize / 8, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw mountain
      ctx.beginPath();
      ctx.moveTo(centerX - iconSize / 3, centerY + iconSize / 3);
      ctx.lineTo(centerX, centerY - iconSize / 6);
      ctx.lineTo(centerX + iconSize / 3, centerY + iconSize / 3);
      ctx.closePath();
      ctx.fill();
    },
    snapCoordinate(coord) {
      if (this.snapToGrid && this.gridSize) {
        return Math.round(coord / this.gridSize) * this.gridSize;
      }
      return coord;
    },
    handleMouseDown(e) {
      this.$refs.canvas.focus();
      
      // Check if we're interacting with the debug overlay
      if (this.showDebugOverlay) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Simple hit test directly here
        const { x: overlayX, y: overlayY } = this.debugInfo.position;
        const { width, height } = this.debugInfo.size;
        const headerHeight = 30;
        
        // Check if point is within overlay bounds
        if (
          x >= overlayX && 
          x <= overlayX + width && 
          y >= overlayY && 
          y <= overlayY + height
        ) {
          // If clicking on the header, start dragging
          if (y <= overlayY + headerHeight) {
            this.debugInfo.isDragging = true;
            this.debugInfo.dragStart = {
              x: x - this.debugInfo.position.x,
              y: y - this.debugInfo.position.y
            };
          }
          
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      
      // Normal mouse handling
      const rect = this.$refs.canvas.getBoundingClientRect();
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      this.startX = x;
      this.startY = y;
      const snappedX = this.snapCoordinate(x);
      const snappedY = this.snapCoordinate(y);
      console.log('Mouse down at:', x, y, 'Snapped:', snappedX, snappedY);
      if (this.tool) {
        this.isDrawing = true;
        this.currentShape = {
          id: Date.now(),
          type: this.tool,
          x: snappedX,
          y: snappedY,
          width: 0,
          height: 0,
          text: this.tool === 'text' ? 'Text' : '',
          points: this.tool === 'pen' ? [[snappedX, snappedY]] : null,
          rotation: 0,
          lineStyle: 'solid',
          ...(this.tool === 'text' ? {
            fontFamily: 'Arial, sans-serif',
            fontSize: 20,
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            fill: '#000000',
            stroke: '#00000000'
          } : {}),
          ...this.styles,
          layerId: this.activeLayer ? this.activeLayer.id : undefined
        };
        console.log('Started drawing:', this.tool);
        return;
      }
      if (this.localSelectedShapes.length > 0) {
        const handle = this.getHandleAt(x, y);
        if (handle) {
          console.log('Handle found:', handle.type, handle.corner);
          if (handle.type === 'resize' && !this.activeLayer.frozen) {
            this.isResizing = true;
            this.resizeHandle = handle;
          } else if (handle.type === 'rotate' && !this.activeLayer.frozen) {
            this.isRotating = true;
          }
          return;
        }
      }
      const shape = this.getShapeAt(x, y);
      console.log('Shape found:', shape ? shape.type : 'none');
      if (shape) {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        if (shapeLayer && !shapeLayer.frozen) {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            const shapeIndex = this.localSelectedShapes.findIndex(s => s.id === shape.id);
            if (shapeIndex !== -1) {
              console.log('Shape removed from selection:', shape.type);
              this.localSelectedShapes.splice(shapeIndex, 1);
            } else {
              this.localSelectedShapes.push(shape);
              console.log('Shape added to selection:', shape.type);
            }
          } else {
            this.localSelectedShapes = [shape];
            console.log('Shape selected:', shape.type);
          }
          this.$emit('shapes-selected', [...this.localSelectedShapes]);
          if (this.localSelectedShapes.some(s => s.id === shape.id)) {
            this.isDragging = true;
          }
          this.render();
        }
        return;
      }
      if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
        this.localSelectedShapes = [];
        this.$emit('shapes-selected', []);
        console.log('Selection cleared');
      } else {
        console.log('Modifier key pressed, keeping existing selection');
      }
      this.selectionStart = { x, y };
      this.currentShape = {
        type: 'selection',
        x: x,
        y: y,
        width: 0,
        height: 0
      };
      console.log('Started selection rectangle with shift:', e.shiftKey);
    },
    handleMouseMove(e) {
      // Get canvas-relative coordinates
      const rect = this.$refs.canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;
      
      // Check if we're dragging the debug overlay
      if (this.debugInfo.isDragging) {
        // Update position
        this.debugInfo.position = {
          x: canvasX - this.debugInfo.dragStart.x,
          y: canvasY - this.debugInfo.dragStart.y
        };
        
        // Keep overlay within canvas bounds
        this.debugInfo.position.x = Math.max(0, Math.min(this.debugInfo.position.x, 
          this.canvasWidth - this.debugInfo.size.width));
        this.debugInfo.position.y = Math.max(0, Math.min(this.debugInfo.position.y, 
          this.canvasHeight - this.debugInfo.size.height));
        
        this.render();
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      
      // Also check if mouse is over the debug overlay even if not dragging
      if (this.showDebugOverlay) {
        // Simple hit test directly here
        const { x: overlayX, y: overlayY } = this.debugInfo.position;
        const { width, height } = this.debugInfo.size;
        
        // Check if point is within overlay bounds
        if (
          canvasX >= overlayX && 
          canvasX <= overlayX + width && 
          canvasY >= overlayY && 
          canvasY <= overlayY + height
        ) {
          // Just update cursor position but don't do other processing
          const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
          const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
          this.cursorX = (e.clientX - rect.left - centerX) / this.zoom;
          this.cursorY = (e.clientY - rect.top - centerY) / this.zoom;
          return;
        }
      }
      
      // Normal mouse handling
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      this.cursorX = x;
      this.cursorY = y;
      const snappedX = this.snapCoordinate(x);
      const snappedY = this.snapCoordinate(y);
      if (this.isDrawing && this.currentShape) {
        if (this.tool === 'pen') {
          const lastPoint = this.currentShape.points[this.currentShape.points.length - 1];
          const distance = Math.sqrt(
            Math.pow(snappedX - lastPoint[0], 2) + 
            Math.pow(snappedY - lastPoint[1], 2)
          );
          if (distance > 2) {
            this.currentShape.points.push([snappedX, snappedY]);
          }
        } else {
          this.currentShape.width = snappedX - this.currentShape.x;
          this.currentShape.height = snappedY - this.currentShape.y;
        }
      } else if (this.isDragging && this.localSelectedShapes.length > 0) {
        const dx = snappedX - this.startX;
        const dy = snappedY - this.startY;
        if (dx !== 0 || dy !== 0) {
          this.localSelectedShapes.forEach(shape => {
            const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
            if (!shapeLayer || !shapeLayer.frozen) {
              shape.x += dx;
              shape.y += dy;
            }
          });
          this.startX = snappedX;
          this.startY = snappedY;
          const updatedShapes = this.shapes.map(s => {
            const movedShape = this.localSelectedShapes.find(ls => ls.id === s.id);
            return movedShape || s;
          });
          this.$emit('shape-updated', updatedShapes);
        }
      } else if (this.isResizing && this.localSelectedShapes.length > 0 && this.resizeHandle && !this.activeLayer.frozen) {
        const shape = this.localSelectedShapes[0];
        const corner = this.resizeHandle.corner;
        if (corner === 'bottom-right') {
          shape.width = Math.max(10, snappedX - shape.x);
          shape.height = Math.max(10, snappedY - shape.y);
        } else if (corner === 'top-left') {
          const newWidth = Math.max(10, shape.x + shape.width - snappedX);
          const newHeight = Math.max(10, shape.y + shape.height - snappedY);
          shape.x = shape.x + shape.width - newWidth;
          shape.y = shape.y + shape.height - newHeight;
          shape.width = newWidth;
          shape.height = newHeight;
        } else if (corner === 'top-right') {
          shape.width = Math.max(10, snappedX - shape.x);
          const newHeight = Math.max(10, shape.y + shape.height - snappedY);
          shape.y = shape.y + shape.height - newHeight;
          shape.height = newHeight;
        } else if (corner === 'bottom-left') {
          const newWidth = Math.max(10, shape.x + shape.width - snappedX);
          shape.x = shape.x + shape.width - newWidth;
          shape.width = newWidth;
          shape.height = Math.max(10, snappedY - shape.y);
        } else if (corner === 'top-middle') {
          const newHeight = Math.max(10, shape.y + shape.height - snappedY);
          shape.y = shape.y + shape.height - newHeight;
          shape.height = newHeight;
        } else if (corner === 'bottom-middle') {
          shape.height = Math.max(10, snappedY - shape.y);
        } else if (corner === 'left-middle') {
          const newWidth = Math.max(10, shape.x + shape.width - snappedX);
          shape.x = shape.x + shape.width - newWidth;
          shape.width = newWidth;
        } else if (corner === 'right-middle') {
          shape.width = Math.max(10, snappedX - shape.x);
        }
        const updatedShapes = this.shapes.map(s => s.id === shape.id ? { ...s, x: shape.x, y: shape.y, width: shape.width, height: shape.height } : s);
        this.$emit('shape-updated', updatedShapes);
      } else if (this.isRotating && this.localSelectedShapes.length > 0 && !this.activeLayer.frozen) {
        const shape = this.localSelectedShapes[0];
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        shape.rotation = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
        const updatedShapes = this.shapes.map(s => s.id === shape.id ? { ...s, rotation: shape.rotation } : s);
        this.$emit('shape-updated', updatedShapes);
      } else if (this.selectionStart) {
        this.currentShape = {
          type: 'selection',
          x: Math.min(this.startX, x),
          y: Math.min(this.startY, y),
          width: Math.abs(x - this.startX),
          height: Math.abs(y - this.startY)
        };
        console.log('Selection rectangle:', this.currentShape);
      }
      this.render();
    },
    handleMouseUp(e) {
      // Check if we're finishing dragging the debug overlay
      if (this.debugInfo.isDragging) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Stop dragging
        this.debugInfo.isDragging = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      
      // Check if mouse is over the debug overlay
      if (this.showDebugOverlay) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Simple hit test directly here
        const { x: overlayX, y: overlayY } = this.debugInfo.position;
        const { width, height } = this.debugInfo.size;
        
        // Check if point is within overlay bounds
        if (
          canvasX >= overlayX && 
          canvasX <= overlayX + width && 
          canvasY >= overlayY && 
          canvasY <= overlayY + height
        ) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      
      if (this.isDrawing && this.currentShape) {
        if (Math.abs(this.currentShape.width) > 5 || Math.abs(this.currentShape.height) > 5 || 
            this.currentShape.type === 'text' || this.currentShape.type === 'pen') {
          if (this.currentShape.width < 0) {
            this.currentShape.x += this.currentShape.width;
            this.currentShape.width = Math.abs(this.currentShape.width);
          }
          if (this.currentShape.height < 0) {
            this.currentShape.y += this.currentShape.height;
            this.currentShape.height = Math.abs(this.currentShape.height);
          }
          const newShape = { ...this.currentShape };
          const updatedShapes = [...this.shapes, newShape];
          this.$emit('shape-added', updatedShapes);
        }
        this.currentShape = null;
        this.isDrawing = false;
      } else if (this.isDragging) {
        this.isDragging = false;
        const updatedShapes = this.shapes.map(s => {
          const movedShape = this.localSelectedShapes.find(ls => ls.id === s.id);
          return movedShape || s;
        });
        this.$emit('shape-updated', updatedShapes);
      } else if (this.isResizing) {
        this.isResizing = false;
        this.resizeHandle = null;
        const shape = this.localSelectedShapes[0];
        const updatedShapes = this.shapes.map(s => s.id === shape.id ? { ...s, x: shape.x, y: shape.y, width: shape.width, height: shape.height } : s);
        this.$emit('shape-updated', updatedShapes);
      } else if (this.isRotating) {
        this.isRotating = false;
        const shape = this.localSelectedShapes[0];
        const updatedShapes = this.shapes.map(s => s.id === shape.id ? { ...s, rotation: shape.rotation } : s);
        this.$emit('shape-updated', updatedShapes);
      } else if (this.selectionStart) {
        if (!this.currentShape) {
          console.error('Selection rectangle is active but currentShape is null');
          this.selectionStart = null;
          return;
        }
        console.log('Selection rectangle completed');
        let selX = this.currentShape.x;
        let selY = this.currentShape.y;
        let selWidth = this.currentShape.width;
        let selHeight = this.currentShape.height;
        if (selWidth < 0) {
          selX += selWidth;
          selWidth = Math.abs(selWidth);
        }
        if (selHeight < 0) {
          selY += selHeight;
          selHeight = Math.abs(selHeight);
        }
        if (selWidth > 5 && selHeight > 5) {
          const newSelection = this.shapes.filter(shape => {
            const shapeLeft = shape.x;
            const shapeRight = shape.x + (shape.width || 0);
            const shapeTop = shape.y;
            const shapeBottom = shape.y + (shape.height || 0);
            const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
            return !(
              shapeRight < selX ||
              shapeLeft > selX + selWidth ||
              shapeBottom < selY ||
              shapeTop > selY + selHeight ||
              (shapeLayer && shapeLayer.frozen)
            );
          });
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            const existingIds = this.localSelectedShapes.map(shape => shape.id);
            newSelection.forEach(shape => {
              if (!existingIds.includes(shape.id)) {
                this.localSelectedShapes.push(shape);
              }
            });
          } else {
            this.localSelectedShapes = newSelection;
          }
          this.$emit('shapes-selected', [...this.localSelectedShapes]);
        }
        this.currentShape = null;
        this.selectionStart = null;
      }
      this.render();
    },
    handleClick(e) {
      this.$refs.canvas.focus();
      if (this.isDragging || this.isResizing || this.isRotating || this.isDrawing || this.debugInfo.isDragging) {
        return;
      }
      
      // Check if we're clicking on the debug overlay
      if (this.showDebugOverlay) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Hit test against debug overlay
        const hit = this.hitTestDebugOverlay(canvasX, canvasY);
        if (hit && hit.hit) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      
      const rect = this.$refs.canvas.getBoundingClientRect();
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      console.log('Click at:', x, y);
      const shape = this.getShapeAt(x, y);
      console.log('Shape found on click:', shape ? shape.type : 'none');
      if (shape) {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        if (shapeLayer && !shapeLayer.frozen) {
          if (e.shiftKey || e.ctrlKey || e.metaKey) {
            const shapeIndex = this.localSelectedShapes.findIndex(s => s.id === shape.id);
            if (shapeIndex !== -1) {
              console.log('Shape removed from selection on click:', shape.type);
              this.localSelectedShapes.splice(shapeIndex, 1);
            } else {
              this.localSelectedShapes.push(shape);
              console.log('Shape added to selection on click:', shape.type);
            }
          } else {
            this.localSelectedShapes = [shape];
            console.log('Shape selected on click:', shape.type);
          }
          this.$emit('shapes-selected', [...this.localSelectedShapes]);
          this.render();
        }
      }
    },
    handleDoubleClick(e) {
      // Check if we're double-clicking on the debug overlay
      if (this.showDebugOverlay) {
        // Get canvas-relative coordinates
        const rect = this.$refs.canvas.getBoundingClientRect();
        const canvasX = e.clientX - rect.left;
        const canvasY = e.clientY - rect.top;
        
        // Hit test against debug overlay
        const hit = this.hitTestDebugOverlay(canvasX, canvasY);
        if (hit && hit.hit) {
          e.stopPropagation();
          e.preventDefault();
          return;
        }
      }
      
      const rect = this.$refs.canvas.getBoundingClientRect();
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      const shape = this.getShapeAt(x, y);
      if (shape && shape.type === 'text') {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        if (shapeLayer && !shapeLayer.frozen) {
          const newText = prompt('Enter text:', shape.text);
          if (newText !== null) {
            shape.text = newText;
            this.localSelectedShapes = [shape];
            this.$emit('shapes-selected', [shape]);
            const updatedShapes = this.shapes.map(s => s.id === shape.id ? { ...s, text: newText } : s);
            this.$emit('shape-updated', updatedShapes);
          }
        }
      } else if (shape) {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        if (shapeLayer && !shapeLayer.frozen) {
          this.localSelectedShapes = [shape];
          this.$emit('shapes-selected', [shape]);
        }
      } else {
        this.resetZoom();
      }
      this.render();
    },
    handleKeyDown(e) {
      console.log('Key pressed:', e.key, 'Code:', e.code, 'Ctrl:', e.ctrlKey, 'Shift:', e.shiftKey);
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        console.log('Ctrl+Z detected - emitting undo-requested');
        this.$emit('undo-requested');
        e.preventDefault();
        return;
      }
      if ((e.ctrlKey && e.shiftKey && (e.key === 'Z' || e.key === 'z')) || 
          (e.ctrlKey && e.key === 'y')) {
        console.log('Ctrl+Shift+Z or Ctrl+Y detected - emitting redo-requested');
        this.$emit('redo-requested');
        e.preventDefault();
        return;
      }
      if (e.key === 'Escape' || e.code === 'Escape') {
        console.log('ESC key pressed - current states:', {
          isDrawing: this.isDrawing,
          isDragging: this.isDragging,
          isResizing: this.isResizing,
          isRotating: this.isRotating,
          hasSelectionStart: !!this.selectionStart,
          selectedShapesCount: this.selectedShapes.length
        });
        let actionTaken = false;
        if (this.isDrawing || this.tool) {
          this.isDrawing = false;
          this.currentShape = null;
          this.$emit('tool-change', null);
          console.log('Drawing canceled, tool deactivated');
          actionTaken = true;
        }
        if (this.isDragging) {
          this.isDragging = false;
          console.log('Dragging canceled');
          actionTaken = true;
        }
        if (this.isResizing) {
          this.isResizing = false;
          this.resizeHandle = null;
          console.log('Resizing canceled');
          actionTaken = true;
        }
        if (this.isRotating) {
          this.isRotating = false;
          console.log('Rotation canceled');
          actionTaken = true;
        }
        if (this.selectionStart) {
          this.selectionStart = null;
          this.currentShape = null;
          console.log('Selection rectangle canceled');
          actionTaken = true;
        }
        if (!actionTaken && this.selectedShapes.length > 0) {
          this.selectedShapes = [];
          this.$emit('shapes-selected', []);
          console.log('Selection cleared');
        }
        this.render();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === '0') {
        this.resetZoom();
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && (e.key === '+' || e.key === '=')) {
        this.zoomTarget = Math.min(this.zoom + 0.1, 4);
        e.preventDefault();
        return;
      }
      if (e.ctrlKey && e.key === '-') {
        this.zoomTarget = Math.max(this.zoom - 0.1, 0.3);
        e.preventDefault();
        return;
      }
    },
    deleteSelected() {
      const filteredShapes = this.shapes.filter(shape => {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        return !this.localSelectedShapes.includes(shape) || (shapeLayer && shapeLayer.frozen);
      });
      this.$emit('shape-deleted', filteredShapes);
      this.localSelectedShapes = this.localSelectedShapes.filter(shape => {
        const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
        return shapeLayer && shapeLayer.frozen;
      });
      this.$emit('shapes-selected', []);
    },
    getShapeAt(x, y) {
      console.log('Checking for shape at', x, y, 'with', this.shapes.length, 'shapes');
      this.shapes.forEach((shape, index) => {
        console.log(`Shape ${index}:`, shape.type, shape.id, 'at', shape.x, shape.y, shape.width, shape.height);
      });
      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
        const buffer = 20 / this.zoom;
        if (shape.type === 'text') {
          const width = shape.width || 100;
          const height = shape.height || 30;
          if (x >= shape.x - buffer && x <= shape.x + width + buffer && 
              y >= shape.y - buffer && y <= shape.y + height + buffer) {
            return shape;
          }
          continue;
        }
        if (shape.type === 'circle') {
          const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
          const distance = Math.sqrt((x - shape.x) ** 2 + (y - shape.y) ** 2);
          if (distance <= radius + buffer) {
            return shape;
          }
          continue;
        }
        if (shape.type === 'ellipse') {
          const centerX = shape.x + shape.width / 2;
          const centerY = shape.y + shape.height / 2;
          const rx = Math.abs(shape.width / 2) + buffer;
          const ry = Math.abs(shape.height / 2) + buffer;
          const normalizedX = (x - centerX) / rx;
          const normalizedY = (y - centerY) / ry;
          if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
            return shape;
          }
          continue;
        }
        if (shape.type === 'line' || shape.type === 'arrow') {
          const x1 = shape.x;
          const y1 = shape.y;
          const x2 = shape.x + shape.width;
          const y2 = shape.y + shape.height;
          const lineLength = Math.sqrt(shape.width ** 2 + shape.height ** 2);
          if (lineLength === 0) continue;
          const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / lineLength;
          if (distance <= buffer) {
            const t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength ** 2);
            if (t >= -0.1 && t <= 1.1) {
              return shape;
            }
          }
          continue;
        }
        if (shape.type === 'pen' && shape.points && shape.points.length > 1) {
          for (let j = 1; j < shape.points.length; j++) {
            const x1 = shape.points[j-1][0];
            const y1 = shape.points[j-1][1];
            const x2 = shape.points[j][0];
            const y2 = shape.points[j][1];
            const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            if (lineLength === 0) continue;
            const distance = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / lineLength;
            if (distance <= buffer) {
              const t = ((x - x1) * (x2 - x1) + (y - y1) * (y2 - y1)) / (lineLength ** 2);
              if (t >= 0 && t <= 1) {
                return shape;
              }
            }
          }
          continue;
        }
        if (x >= shape.x - buffer && 
            x <= shape.x + shape.width + buffer && 
            y >= shape.y - buffer && 
            y <= shape.y + shape.height + buffer) {
          return shape;
        }
      }
      return null;
    },
    /**
     * Draws a debug overlay with performance metrics
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    /**
     * Draws the debug overlay on the canvas
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     */
    drawDebugOverlay(ctx) {
      if (!this.showDebugOverlay) return;
      
      try {
        // Save context state
        ctx.save();
        
        // Reset transform to draw in screen space
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Get debug overlay position and size
        const { x, y } = this.debugInfo.position;
        const { width, height } = this.debugInfo.size;
        const headerHeight = 30;
        
        // Draw semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x, y, width, height);
        
        // Draw border
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
        
        // Draw drag handle/header
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x, y, width, headerHeight);
        
        // Draw title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('🔍 DEBUG INFORMATION (drag to move)', x + 10, y + 20);
        
        // Draw performance metrics
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '14px monospace';
        
        const metrics = [
          `Render time: ${this.performanceMetrics.lastRenderTime.toFixed(2)}ms`,
          `Average: ${this.performanceMetrics.averageRenderTime.toFixed(2)}ms`,
          `Peak: ${this.performanceMetrics.peakRenderTime.toFixed(2)}ms`,
          `Slow renders: ${this.performanceMetrics.slowRenders}`,
          `Render count: ${this.performanceMetrics.renderCount}`,
          `Shapes rendered: ${this.performanceMetrics.shapesRendered}`,
          `Shapes skipped: ${this.performanceMetrics.shapesSkipped}`,
          `Shapes from cache: ${this.performanceMetrics.shapesCached}`,
          `Cache size: ${this.shapeCache.size} items`,
          `Image cache size: ${this.imageCache.size} items`,
          `Zoom: ${(this.zoom * 100).toFixed(0)}%`,
          `Canvas: ${this.canvasWidth}x${this.canvasHeight}`,
          `Offset: ${Math.round(this.offsetX)}, ${Math.round(this.offsetY)}`,
          `Total shapes: ${this.shapes.length}`,
          `Selected shapes: ${this.localSelectedShapes.length}`,
          `Current tool: ${this.tool || 'none'}`,
          `Cursor: ${Math.round(this.cursorX)}, ${Math.round(this.cursorY)}`,
          `Grid size: ${this.gridSize}`,
          `Snap to grid: ${this.snapToGrid ? 'ON' : 'OFF'}`
        ];
        
        metrics.forEach((text, index) => {
          ctx.fillText(text, x + 10, y + headerHeight + 20 + index * 20);
        });
        
        // Restore context state
        ctx.restore();
      } catch (error) {
        console.error('Error drawing debug overlay:', error);
      }
    },
    
    /**
     * Checks if a point is inside the debug overlay
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     * @returns {Object|null} - Returns an object with hit information or null if not hit
     */
    hitTestDebugOverlay(x, y) {
      if (!this.showDebugOverlay) return null;
      
      const { x: overlayX, y: overlayY } = this.debugInfo.position;
      const { width, height } = this.debugInfo.size;
      const headerHeight = 30;
      
      // Check if point is within overlay bounds
      if (
        x >= overlayX && 
        x <= overlayX + width && 
        y >= overlayY && 
        y <= overlayY + height
      ) {
        // Check if point is in header (draggable area)
        const isInHeader = y <= overlayY + headerHeight;
        
        return {
          hit: true,
          inHeader: isInHeader
        };
      }
      
      return null;
    },
    
    /**
     * Starts dragging the debug overlay
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    startDraggingDebugOverlay(x, y) {
      this.debugInfo.isDragging = true;
      this.debugInfo.dragStart = {
        x: x - this.debugInfo.position.x,
        y: y - this.debugInfo.position.y
      };
    },
    
    /**
     * Updates the position of the debug overlay while dragging
     * @param {number} x - The x coordinate
     * @param {number} y - The y coordinate
     */
    dragDebugOverlay(x, y) {
      if (!this.debugInfo.isDragging) return;
      
      this.debugInfo.position = {
        x: x - this.debugInfo.dragStart.x,
        y: y - this.debugInfo.dragStart.y
      };
      
      // Keep overlay within canvas bounds
      this.debugInfo.position.x = Math.max(0, Math.min(this.debugInfo.position.x, 
        this.canvasWidth - this.debugInfo.size.width));
      this.debugInfo.position.y = Math.max(0, Math.min(this.debugInfo.position.y, 
        this.canvasHeight - this.debugInfo.size.height));
      
      this.render();
    },
    
    /**
     * Stops dragging the debug overlay
     */
    stopDraggingDebugOverlay() {
      this.debugInfo.isDragging = false;
    },
    
    /**
     * Toggles the debug overlay
     */
    toggleDebugOverlay(e) {
      console.log('Debug button clicked!');
      
      // Prevent the event from creating shapes
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      // Toggle debug overlay
      this.showDebugOverlay = !this.showDebugOverlay;
      
      console.log('Debug overlay toggled:', this.showDebugOverlay);
      
      // Reset any active drawing or selection
      this.isDrawing = false;
      this.isDragging = false;
      this.isResizing = false;
      this.isRotating = false;
      this.selectionStart = null;
      this.currentShape = null; // Clear any in-progress shape
      
      // If we're hiding the debug overlay, make sure we're not in a dragging state
      if (!this.showDebugOverlay) {
        this.debugInfo.isDragging = false;
      }
      
      // Force a render to show/hide the overlay
      this.render();
    },
    
    /**
     * Legacy method for backward compatibility
     */
    debugInfo(e) {
      // Prevent the event from creating shapes
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      // Toggle debug overlay
      this.showDebugOverlay = !this.showDebugOverlay;
      
      console.log('Debug overlay toggled:', this.showDebugOverlay);
      
      // Reset any active drawing or selection
      this.isDrawing = false;
      this.isDragging = false;
      this.isResizing = false;
      this.isRotating = false;
      this.selectionStart = null;
      this.currentShape = null; // Clear any in-progress shape
      
      // If we're hiding the debug overlay, make sure we're not in a dragging state
      if (!this.showDebugOverlay) {
        this.debugInfo.isDragging = false;
      }
      
      // Force a render to show/hide the overlay
      this.render();
      
      // Log debug info to console
      console.log('=== DEBUG INFO ===');
      console.log('Canvas state:', {
        zoom: this.zoom,
        offsetX: this.offsetX,
        offsetY: this.offsetY,
        canvasWidth: this.canvasWidth,
        canvasHeight: this.canvasHeight
      });
      console.log('Interaction state:', {
        isDrawing: this.isDrawing,
        isDragging: this.isDragging,
        isResizing: this.isResizing,
        isRotating: this.isRotating,
        hasSelectionStart: !!this.selectionStart,
        selectedShapesCount: this.localSelectedShapes.length,
        currentTool: this.tool
      });
      console.log('Performance metrics:', this.performanceMetrics);
      console.log('Cache info:', {
        shapeCacheSize: this.shapeCache.size,
        imageCacheSize: this.imageCache.size
      });
      console.log('Shapes:', this.shapes);
      console.log('Selected shapes:', this.localSelectedShapes);
      console.log('Visible layers:', this.visibleLayers);
      console.log('Image cache:', Array.from(this.imageCache.keys()));
      if (this.shapes.length === 0) {
        this.createTestShapes();
        return;
      }
      this.localSelectedShapes = [...this.shapes];
      this.$emit('shapes-selected', [...this.localSelectedShapes]);
      console.log('Selected all shapes for debugging');
      this.render();
      this.$refs.canvas.focus();
      console.log('Canvas focused');
    },
    createTestShapes() {
      const testShapes = [
        {
          id: Date.now() + 1,
          type: 'rectangle',
          x: 100,
          y: 100,
          width: 100,
          height: 80,
          rotation: 0,
          lineWidth: 2,
          stroke: '#000000',
          fill: '#ff0000'
        },
        {
          id: Date.now() + 2,
          type: 'circle',
          x: 300,
          y: 150,
          width: 50,
          height: 50,
          rotation: 0,
          lineWidth: 2,
          stroke: '#000000',
          fill: '#0000ff'
        },
        {
          id: Date.now() + 3,
          type: 'rectangle',
          x: 200,
          y: 250,
          width: 120,
          height: 60,
          rotation: 0,
          lineWidth: 2,
          stroke: '#000000',
          fill: '#00ff00'
        }
      ];
      this.$emit('shape-added', [...this.shapes, ...testShapes]);
      console.log('Created test shapes:', testShapes.length);
    },
    groupSelectedShapes() {
      if (this.localSelectedShapes.length < 2) {
        console.log('Need at least 2 shapes to create a group');
        return;
      }
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      this.localSelectedShapes.forEach(shape => {
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + shape.width);
        maxY = Math.max(maxY, shape.y + shape.height);
      });
      const groupShape = {
        id: Date.now(),
        type: 'group',
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0,
        lineWidth: 1,
        stroke: '#000000',
        fill: '#00000000',
        children: this.localSelectedShapes.map(shape => {
          const childCopy = { ...shape };
          childCopy.originalX = childCopy.x;
          childCopy.originalY = childCopy.y;
          childCopy.x = childCopy.x - minX;
          childCopy.y = childCopy.y - minY;
          return childCopy;
        })
      };
      const selectedIds = this.localSelectedShapes.map(shape => shape.id);
      const remainingShapes = this.shapes.filter(shape => !selectedIds.includes(shape.id));
      const updatedShapes = [...remainingShapes, groupShape];
      this.localSelectedShapes = [groupShape];
      this.$emit('shapes-selected', [groupShape]);
      this.$emit('shape-updated', updatedShapes);
      console.log('Created group with', groupShape.children.length, 'shapes');
    },
    ungroupSelectedShapes() {
      if (this.localSelectedShapes.length === 0) {
        console.log('No shapes selected to ungroup');
        return;
      }
      let updatedShapes = [...this.shapes];
      let hasUngroup = false;
      this.localSelectedShapes.forEach(selectedShape => {
        if (selectedShape.type === 'group' && selectedShape.children) {
          hasUngroup = true;
          updatedShapes = updatedShapes.filter(shape => shape.id !== selectedShape.id);
          const extractedChildren = selectedShape.children.map(child => {
            const childCopy = { ...child };
            childCopy.x = selectedShape.x + childCopy.x;
            childCopy.y = selectedShape.y + childCopy.y;
            childCopy.id = Date.now() + Math.floor(Math.random() * 1000);
            return childCopy;
          });
          updatedShapes = [...updatedShapes, ...extractedChildren];
          console.log('Ungrouped', extractedChildren.length, 'shapes');
        }
      });
      if (!hasUngroup) {
        console.log('No groups found in selection');
        return;
      }
      this.localSelectedShapes = [];
      this.$emit('shapes-selected', []);
      this.$emit('shape-updated', updatedShapes);
    },
    getHandleAt(x, y) {
      if (!this.localSelectedShapes.length) return null;
      const shape = this.localSelectedShapes[0];
      const handles = [
        { type: 'resize', corner: 'top-left', x: shape.x, y: shape.y },
        { type: 'resize', corner: 'top-right', x: shape.x + shape.width, y: shape.y },
        { type: 'resize', corner: 'bottom-left', x: shape.x, y: shape.y + shape.height },
        { type: 'resize', corner: 'bottom-right', x: shape.x + shape.width, y: shape.y + shape.height },
        { type: 'resize', corner: 'top-middle', x: shape.x + shape.width/2, y: shape.y },
        { type: 'resize', corner: 'bottom-middle', x: shape.x + shape.width/2, y: shape.y + shape.height },
        { type: 'resize', corner: 'left-middle', x: shape.x, y: shape.y + shape.height/2 },
        { type: 'resize', corner: 'right-middle', x: shape.x + shape.width, y: shape.y + shape.height/2 },
        { type: 'rotate', x: shape.x + shape.width / 2, y: shape.y - 20 / this.zoom }
      ];
      const hitRadius = 15 / this.zoom;
      return handles.find(h => Math.hypot(x - h.x, y - h.y) < hitRadius);
    },
    render() {
      const startTime = performance.now();
      const ctx = this.ctx;
      if (!ctx) return;
      if (this._renderRequested) return;
      this._renderRequested = true;
      
      // Use requestAnimationFrame for smoother rendering
      this.animationFrameId = requestAnimationFrame(() => {
        this._renderRequested = false;
        
        // Check if static canvas needs to be updated
        if (this.staticCanvasDirty || 
            this.lastGridSize !== this.gridSize || 
            this.lastGridOpacity !== this.gridOpacity ||
            this.lastCanvasWidth !== this.canvasWidth ||
            this.lastCanvasHeight !== this.canvasHeight ||
            this.lastZoom !== this.zoom) {
          
          // Update static canvas
          this._renderStaticElements();
          
          // Update tracking variables
          this.lastGridSize = this.gridSize;
          this.lastGridOpacity = this.gridOpacity;
          this.lastCanvasWidth = this.canvasWidth;
          this.lastCanvasHeight = this.canvasHeight;
          this.lastZoom = this.zoom;
          this.staticCanvasDirty = false;
        }
        
        // Perform the main render
        this._performRender(ctx);
        
        const renderTime = performance.now() - startTime;
        if (renderTime > 50) {
          console.log(`Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      });
    },
    
    /**
     * Renders static elements (background and grid) to the static canvas
     */
    _renderStaticElements() {
      if (!this.staticCtx || !this.staticCanvas) return;
      
      // Resize static canvas if needed
      if (this.staticCanvas.width !== this.canvasWidth || this.staticCanvas.height !== this.canvasHeight) {
        this.staticCanvas.width = this.canvasWidth;
        this.staticCanvas.height = this.canvasHeight;
      }
      
      const ctx = this.staticCtx;
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Save context state
      ctx.save();
      
      // Draw background
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Apply zoom and offset
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      ctx.translate(centerX, centerY);
      ctx.scale(this.zoom, this.zoom);
      
      // Draw canvas background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Draw canvas border
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1 / this.zoom;
      ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Draw grid if enabled
      if (this.gridSize) {
        const step = this.gridSize;
        ctx.strokeStyle = `rgba(0, 0, 0, ${this.gridOpacity})`;
        ctx.lineWidth = 0.5 / this.zoom;
        
        // Draw vertical grid lines
        for (let x = 0; x <= this.canvasWidth; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, this.canvasHeight);
          ctx.stroke();
        }
        
        // Draw horizontal grid lines
        for (let y = 0; y <= this.canvasHeight; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(this.canvasWidth, y);
          ctx.stroke();
        }
      }
      
      // Restore context state
      ctx.restore();
    },
    _performRender(ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Draw the static canvas (background and grid)
      if (this.staticCanvas) {
        ctx.drawImage(this.staticCanvas, 0, 0);
      } else {
        // Fallback if static canvas isn't available
        ctx.fillStyle = '#333333';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      }
      
      // Save context state for drawing shapes
      ctx.save();
      
      // Apply zoom and offset for drawing shapes
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      ctx.translate(centerX, centerY);
      ctx.scale(this.zoom, this.zoom);
      const shapesByType = {
        rectangle: [],
        circle: [],
        line: [],
        ellipse: [],
        arrow: [],
        text: [],
        image: [],
        pen: [],
        group: []
      };
      this.shapes.forEach(shape => {
        if (shapesByType[shape.type]) {
          shapesByType[shape.type].push(shape);
        } else {
          console.warn('Unknown shape type:', shape.type);
        }
      });
      // Clean up old entries from shape cache
      this.cleanupShapeCache();
      
      // Track performance
      const startTime = performance.now();
      let shapesRendered = 0;
      let shapesSkipped = 0;
      let shapesCached = 0;
      
      Object.entries(shapesByType).forEach(([type, shapes]) => {
        if (shapes.length === 0) return;
        shapes.forEach(shape => {
          // Skip shapes on invisible layers
          const shapeLayer = this.visibleLayers.find(layer => layer.id === shape.layerId);
          if (!shapeLayer || !shapeLayer.visible) {
            shapesSkipped++;
            return;
          }
          
          // Skip shapes outside the viewport
          if (!this.isShapeVisible(shape)) {
            shapesSkipped++;
            return;
          }
          
          shapesRendered++;
          ctx.save();
          
          // Apply layer opacity if available
          if (shape._layerOpacity !== undefined) {
            ctx.globalAlpha = shape._layerOpacity / 100;
          } else if (shapeLayer && shapeLayer.opacity !== undefined) {
            // Convert opacity from percentage (0-100) to decimal (0-1)
            ctx.globalAlpha = shapeLayer.opacity / 100;
          }
          
          // Check if shape is in cache or should be cached
          let usedCache = false;
          
          if (this.shouldCacheShape(shape)) {
            // Try to find in cache first
            const cacheKey = this.getShapeCacheKey(shape);
            const cachedShape = this.shapeCache.get(cacheKey);
            
            if (cachedShape) {
              // Use cached version
              ctx.translate(shape.x, shape.y);
              if (shape.rotation) {
                ctx.translate(shape.width / 2, shape.height / 2);
                ctx.rotate(shape.rotation);
                ctx.translate(-shape.width / 2, -shape.height / 2);
              }
              
              // Draw the cached canvas
              ctx.drawImage(cachedShape.canvas, -20, -20); // Adjust for padding
              usedCache = true;
              shapesCached++;
            } else {
              // Cache the shape for future use
              this.cacheShape(shape, ctx);
            }
          }
          
          // If not using cache, draw normally
          if (!usedCache) {
            if (shape.rotation) {
              ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
              ctx.rotate(shape.rotation);
              ctx.translate(-(shape.x + shape.width / 2), -(shape.y + shape.height / 2));
            }
            ctx.beginPath();
            ctx.lineWidth = shape.lineWidth / this.zoom;
            ctx.strokeStyle = shape.stroke === 'transparent' ? '#00000000' : shape.stroke;
            ctx.fillStyle = shape.fill === 'transparent' ? '#00000000' : shape.fill;
            if (shape.lineStyle) {
              this.applyLineStyle(ctx, shape.lineStyle, shape.lineWidth / this.zoom);
            }
          }
          if (type === 'rectangle') {
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
          } else if (type === 'circle') {
            const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
            ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
          } else if (type === 'line') {
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
          } else if (type === 'ellipse') {
            ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.abs(shape.width / 2), Math.abs(shape.height / 2), 0, 0, 2 * Math.PI);
          } else if (type === 'arrow') {
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
            const angle = Math.atan2(shape.height, shape.width);
            const headSize = 15 / this.zoom;
            ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
            ctx.lineTo(
              shape.x + shape.width - headSize * Math.cos(angle - Math.PI / 6),
              shape.y + shape.height - headSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(shape.x + shape.width, shape.y + shape.height);
            ctx.lineTo(
              shape.x + shape.width - headSize * Math.cos(angle + Math.PI / 6),
              shape.y + shape.height - headSize * Math.sin(angle + Math.PI / 6)
            );
          } else if (type === 'text') {
            const fontSize = shape.fontSize || 20;
            const fontFamily = shape.fontFamily || 'Arial, sans-serif';
            const fontWeight = shape.fontWeight || 'normal';
            const fontStyle = shape.fontStyle || 'normal';
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textAlign = shape.textAlign || 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = shape.fill && shape.fill !== 'transparent' ? shape.fill : '#000000';
            ctx.fillText(shape.text, shape.x, shape.y);
            if (shape.textDecoration === 'underline') {
              const textWidth = ctx.measureText(shape.text).width;
              const underlineY = shape.y + fontSize * 1.1;
              ctx.beginPath();
              let startX = shape.x;
              if (shape.textAlign === 'center') {
                startX = shape.x - textWidth / 2;
              } else if (shape.textAlign === 'right') {
                startX = shape.x - textWidth;
              }
              const oldStrokeStyle = ctx.strokeStyle;
              ctx.strokeStyle = ctx.fillStyle;
              ctx.moveTo(startX, underlineY);
              ctx.lineTo(startX + textWidth, underlineY);
              ctx.lineWidth = fontSize * 0.05;
              ctx.stroke();
              ctx.strokeStyle = oldStrokeStyle;
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
          } else if (type === 'image') {
            console.log('Rendering image shape:', {
              id: shape.id,
              layerId: shape.layerId,
              src: shape.src,
              hasImage: !!shape.image,
              isImageElement: shape.image instanceof HTMLImageElement,
              isComplete: shape.image?.complete,
              isLoading: shape.isLoading,
              imageError: shape.imageError
            });
            
            // Successfully loaded image case
            if (shape.image instanceof HTMLImageElement && shape.image.complete) {
              try {
                ctx.drawImage(shape.image, shape.x, shape.y, shape.width, shape.height);
                console.log('PNG image drawn successfully:', shape.id);
              } catch (error) {
                console.error('Failed to draw PNG image:', error, shape);
                this.drawImagePlaceholder(ctx, shape, 'error');
              }
            } 
            // Loading state
            else if (shape.isLoading) {
              this.drawImagePlaceholder(ctx, shape, 'loading');
              
              // Draw loading animation
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;
              const radius = Math.min(20, Math.min(shape.width, shape.height) / 4) / this.zoom;
              
              ctx.save();
              ctx.fillStyle = '#4B5563';
              ctx.strokeStyle = '#6B7280';
              ctx.lineWidth = 2 / this.zoom;
              
              // Draw spinning loading indicator
              const now = Date.now();
              const angle = (now % 2000) / 2000 * Math.PI * 2;
              
              for (let i = 0; i < 8; i++) {
                const segmentAngle = angle + (i * Math.PI / 4);
                const opacity = 0.3 + (i % 8) * 0.1;
                
                ctx.beginPath();
                ctx.globalAlpha = opacity;
                ctx.arc(
                  centerX, 
                  centerY, 
                  radius, 
                  segmentAngle, 
                  segmentAngle + Math.PI / 8
                );
                ctx.arc(
                  centerX, 
                  centerY, 
                  radius / 2, 
                  segmentAngle + Math.PI / 8, 
                  segmentAngle, 
                  true
                );
                ctx.closePath();
                ctx.fill();
              }
              
              ctx.restore();
              
              // Request animation frame to keep the spinner moving
              requestAnimationFrame(() => this.render());
            } 
            // Error state
            else if (shape.imageError) {
              this.drawImagePlaceholder(ctx, shape, 'error');
              
              // Draw error icon and message
              const centerX = shape.x + shape.width / 2;
              const centerY = shape.y + shape.height / 2;
              
              ctx.save();
              
              // Draw error icon (exclamation mark in a triangle)
              ctx.fillStyle = '#EF4444';
              ctx.strokeStyle = '#B91C1C';
              ctx.lineWidth = 2 / this.zoom;
              
              // Triangle
              const iconSize = Math.min(30, Math.min(shape.width, shape.height) / 3) / this.zoom;
              ctx.beginPath();
              ctx.moveTo(centerX, centerY - iconSize);
              ctx.lineTo(centerX + iconSize, centerY + iconSize / 1.5);
              ctx.lineTo(centerX - iconSize, centerY + iconSize / 1.5);
              ctx.closePath();
              ctx.fill();
              ctx.stroke();
              
              // Exclamation mark
              ctx.fillStyle = 'white';
              ctx.font = `bold ${iconSize}px Arial`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('!', centerX, centerY);
              
              // Error message
              ctx.font = `${12 / this.zoom}px Arial`;
              ctx.fillStyle = 'white';
              ctx.strokeStyle = 'black';
              ctx.lineWidth = 3 / this.zoom;
              
              let errorMessage = 'Failed to load image';
              if (shape.imageError === 'missing-source') {
                errorMessage = 'Missing image source URL';
              } else if (shape.imageError === 'timeout') {
                errorMessage = 'Image load timed out';
              }
              
              // Draw text with outline for better visibility
              ctx.strokeText(errorMessage, centerX, centerY + iconSize + 15 / this.zoom);
              ctx.fillText(errorMessage, centerX, centerY + iconSize + 15 / this.zoom);
              
              ctx.restore();
            } 
            // No image yet, try to load it
            else {
              console.warn('Invalid or unloaded PNG image for shape:', shape);
              this.drawImagePlaceholder(ctx, shape, 'empty');
              
              if (shape.src) {
                this.reloadImage(shape, false); // Don't show notification on auto-reload
              } else {
                console.error('No valid PNG image source for shape:', shape);
              }
            }
          } else if (type === 'pen') {
            if (shape.points && shape.points.length > 0) {
              ctx.beginPath();
              ctx.moveTo(shape.points[0][0], shape.points[0][1]);
              for (let i = 1; i < shape.points.length; i++) {
                ctx.lineTo(shape.points[i][0], shape.points[i][1]);
              }
              ctx.stroke();
            }
          } else if (type === 'group') {
            ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
            ctx.rect(shape.x, shape.y, shape.width, shape.height);
            ctx.stroke();
            ctx.setLineDash([]);
            if (shape.children && shape.children.length > 0) {
              shape.children.forEach(child => {
                ctx.save();
                if (child.rotation) {
                  ctx.translate(shape.x + child.x + child.width / 2, shape.y + child.y + child.height / 2);
                  ctx.rotate(child.rotation);
                  ctx.translate(-(shape.x + child.x + child.width / 2), -(shape.y + child.y + child.height / 2));
                }
                ctx.beginPath();
                ctx.lineWidth = child.lineWidth / this.zoom;
                ctx.strokeStyle = child.stroke === 'transparent' ? '#00000000' : child.stroke;
                ctx.fillStyle = child.fill === 'transparent' ? '#00000000' : child.fill;
                if (child.lineStyle) {
                  this.applyLineStyle(ctx, child.lineStyle, child.lineWidth / this.zoom);
                }
                if (child.type === 'rectangle') {
                  ctx.rect(shape.x + child.x, shape.y + child.y, child.width, child.height);
                } else if (child.type === 'circle') {
                  const radius = Math.sqrt(child.width ** 2 + child.height ** 2);
                  ctx.arc(shape.x + child.x, shape.y + child.y, radius, 0, 2 * Math.PI);
                } else if (child.type === 'line') {
                  ctx.moveTo(shape.x + child.x, shape.y + child.y);
                  ctx.lineTo(shape.x + child.x + child.width, shape.y + child.y + child.height);
                } else if (child.type === 'ellipse') {
                  ctx.ellipse(
                    shape.x + child.x + child.width / 2, 
                    shape.y + child.y + child.height / 2, 
                    Math.abs(child.width / 2), 
                    Math.abs(child.height / 2), 
                    0, 0, 2 * Math.PI
                  );
                } else if (child.type === 'arrow') {
                  ctx.moveTo(shape.x + child.x, shape.y + child.y);
                  ctx.lineTo(shape.x + child.x + child.width, shape.y + child.y + child.height);
                  const angle = Math.atan2(child.height, child.width);
                  const headSize = 15 / this.zoom;
                  ctx.moveTo(shape.x + child.x + child.width, shape.y + child.y + child.height);
                  ctx.lineTo(
                    shape.x + child.x + child.width - headSize * Math.cos(angle - Math.PI / 6),
                    shape.y + child.y + child.height - headSize * Math.sin(angle - Math.PI / 6)
                  );
                  ctx.moveTo(shape.x + child.x + child.width, shape.y + child.y + child.height);
                  ctx.lineTo(
                    shape.x + child.x + child.width - headSize * Math.cos(angle + Math.PI / 6),
                    shape.y + child.y + child.height - headSize * Math.sin(angle + Math.PI / 6)
                  );
                } else if (child.type === 'text') {
                  ctx.font = `${20 / this.zoom}px Arial`;
                  ctx.fillText(child.text, shape.x + child.x, shape.y + child.y + 20 / this.zoom);
                } else if (child.type === 'pen' && child.points && child.points.length > 0) {
                  ctx.beginPath();
                  ctx.moveTo(shape.x + child.points[0][0], shape.y + child.points[0][1]);
                  for (let i = 1; i < child.points.length; i++) {
                    ctx.lineTo(shape.x + child.points[i][0], shape.y + child.points[i][1]);
                  }
                  ctx.stroke();
                }
                ctx.fill();
                ctx.stroke();
                ctx.restore();
              });
            }
          }
          if (type !== 'pen') {
            ctx.fill();
            ctx.stroke();
          }
          ctx.restore();
        });
      });
      if (this.currentShape) {
        ctx.beginPath();
        if (this.currentShape.type === 'selection') {
          ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
          ctx.strokeStyle = '#2196F3';
          ctx.fillStyle = 'rgba(33, 150, 243, 0.1)';
          ctx.lineWidth = 1.5 / this.zoom;
          ctx.fillRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
          ctx.strokeRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
          ctx.setLineDash([]);
        } else {
          ctx.lineWidth = this.currentShape.lineWidth / this.zoom;
          ctx.strokeStyle = this.currentShape.stroke === 'transparent' ? '#00000000' : this.currentShape.stroke;
          ctx.fillStyle = this.currentShape.fill === 'transparent' ? '#00000000' : this.currentShape.fill;
          if (this.currentShape.lineStyle) {
            this.applyLineStyle(ctx, this.currentShape.lineStyle, this.currentShape.lineWidth / this.zoom);
          }
          if (this.currentShape.type === 'rectangle') {
            ctx.rect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
          } else if (this.currentShape.type === 'circle') {
            const radius = Math.sqrt(this.currentShape.width ** 2 + this.currentShape.height ** 2);
            ctx.arc(this.currentShape.x, this.currentShape.y, radius, 0, 2 * Math.PI);
          } else if (this.currentShape.type === 'line') {
            ctx.moveTo(this.currentShape.x, this.currentShape.y);
            ctx.lineTo(this.currentShape.x + this.currentShape.width, this.currentShape.y + this.currentShape.height);
          } else if (this.currentShape.type === 'ellipse') {
            ctx.ellipse(this.currentShape.x + this.currentShape.width / 2, this.currentShape.y + this.currentShape.height / 2, Math.abs(this.currentShape.width / 2), Math.abs(this.currentShape.height / 2), 0, 0, 2 * Math.PI);
          } else if (this.currentShape.type === 'arrow') {
            ctx.moveTo(this.currentShape.x, this.currentShape.y);
            ctx.lineTo(this.currentShape.x + this.currentShape.width, this.currentShape.y + this.currentShape.height);
            const angle = Math.atan2(this.currentShape.height, this.currentShape.width);
            const headSize = 15 / this.zoom;
            ctx.moveTo(this.currentShape.x + this.currentShape.width, this.currentShape.y + this.currentShape.height);
            ctx.lineTo(
              this.currentShape.x + this.currentShape.width - headSize * Math.cos(angle - Math.PI / 6),
              this.currentShape.y + this.currentShape.height - headSize * Math.sin(angle - Math.PI / 6)
            );
            ctx.moveTo(this.currentShape.x + this.currentShape.width, this.currentShape.y + this.currentShape.height);
            ctx.lineTo(
              this.currentShape.x + this.currentShape.width - headSize * Math.cos(angle + Math.PI / 6),
              this.currentShape.y + this.currentShape.height - headSize * Math.sin(angle + Math.PI / 6)
            );
          } else if (this.currentShape.type === 'text') {
            const fontSize = this.currentShape.fontSize || 20;
            const fontFamily = this.currentShape.fontFamily || 'Arial, sans-serif';
            const fontWeight = this.currentShape.fontWeight || 'normal';
            const fontStyle = this.currentShape.fontStyle || 'normal';
            ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
            ctx.textAlign = this.currentShape.textAlign || 'left';
            ctx.textBaseline = 'top';
            ctx.fillStyle = this.currentShape.fill && this.currentShape.fill !== 'transparent' ? this.currentShape.fill : '#000000';
            ctx.fillText(this.currentShape.text, this.currentShape.x, this.currentShape.y);
            if (this.currentShape.textDecoration === 'underline') {
              const textWidth = ctx.measureText(this.currentShape.text).width;
              const underlineY = this.currentShape.y + fontSize * 1.1;
              ctx.beginPath();
              let startX = this.currentShape.x;
              if (this.currentShape.textAlign === 'center') {
                startX = this.currentShape.x - textWidth / 2;
              } else if (this.currentShape.textAlign === 'right') {
                startX = this.currentShape.x - textWidth;
              }
              const oldStrokeStyle = ctx.strokeStyle;
              ctx.strokeStyle = ctx.fillStyle;
              ctx.moveTo(startX, underlineY);
              ctx.lineTo(startX + textWidth, underlineY);
              ctx.lineWidth = fontSize * 0.05;
              ctx.stroke();
              ctx.strokeStyle = oldStrokeStyle;
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
          } else if (this.currentShape.type === 'pen') {
            if (this.currentShape.points && this.currentShape.points.length > 0) {
              console.log('Rendering current pen with points:', this.currentShape.points.length);
              ctx.moveTo(this.currentShape.points[0][0], this.currentShape.points[0][1]);
              for (let i = 1; i < this.currentShape.points.length; i++) {
                ctx.lineTo(this.currentShape.points[i][0], this.currentShape.points[i][1]);
              }
              ctx.stroke();
            }
          }
          if (this.currentShape.type !== 'selection' && this.currentShape.type !== 'pen') {
            ctx.fill();
            ctx.stroke();
          }
        }
      }
      // Draw enhanced selection indicators for selected shapes
      this.localSelectedShapes.forEach(shape => {
        ctx.save();
        
        // Draw a more visible selection outline with glow effect
        // First draw a wider, semi-transparent stroke for the glow effect
        ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.3)';
        ctx.lineWidth = 6 / this.zoom;
        ctx.strokeRect(shape.x - 2 / this.zoom, shape.y - 2 / this.zoom, 
                      shape.width + 4 / this.zoom, shape.height + 4 / this.zoom);
        
        // Then draw the main selection outline
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2.5 / this.zoom;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        ctx.setLineDash([]);
        
        // Draw more visible resize handles
        const handleSize = 14 / this.zoom;
        const halfHandle = handleSize / 2;
        
        // Draw handle backgrounds with shadow effect
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#0D47A1'; // Darker blue for better contrast
        ctx.lineWidth = 1.5 / this.zoom;
        
        // Top-left handle
        ctx.beginPath();
        ctx.rect(shape.x - halfHandle, shape.y - halfHandle, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
        
        // Top-right handle
        ctx.beginPath();
        ctx.rect(shape.x + shape.width - halfHandle, shape.y - halfHandle, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
        
        // Bottom-left handle
        ctx.beginPath();
        ctx.rect(shape.x - halfHandle, shape.y + shape.height - halfHandle, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
        
        // Bottom-right handle
        ctx.beginPath();
        ctx.rect(shape.x + shape.width - halfHandle, shape.y + shape.height - halfHandle, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
        
        // Draw rotation handle with improved visibility
        ctx.fillStyle = '#FF9800'; // Orange
        ctx.strokeStyle = '#E65100'; // Darker orange for contrast
        ctx.lineWidth = 1.5 / this.zoom;
        ctx.beginPath();
        ctx.arc(shape.x + shape.width / 2, shape.y - 25 / this.zoom, 8 / this.zoom, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw a line connecting the rotation handle to the shape
        ctx.beginPath();
        ctx.moveTo(shape.x + shape.width / 2, shape.y);
        ctx.lineTo(shape.x + shape.width / 2, shape.y - 17 / this.zoom);
        ctx.stroke();
        
        ctx.restore();
      });
      ctx.restore();
      
      // Update performance metrics
      const renderTime = performance.now() - startTime;
      
      // Update metrics
      this.performanceMetrics.lastRenderTime = renderTime;
      this.performanceMetrics.renderCount++;
      this.performanceMetrics.shapesRendered = shapesRendered;
      this.performanceMetrics.shapesSkipped = shapesSkipped;
      this.performanceMetrics.shapesCached = shapesCached;
      
      // Calculate running average
      this.performanceMetrics.averageRenderTime = 
        (this.performanceMetrics.averageRenderTime * (this.performanceMetrics.renderCount - 1) + renderTime) / 
        this.performanceMetrics.renderCount;
      
      // Track peak render time
      if (renderTime > this.performanceMetrics.peakRenderTime) {
        this.performanceMetrics.peakRenderTime = renderTime;
      }
      
      // Count slow renders
      if (renderTime > 20) {
        this.performanceMetrics.slowRenders++;
        console.log(`Render stats: ${renderTime.toFixed(2)}ms, ${shapesRendered} shapes rendered, ${shapesSkipped} skipped, ${shapesCached} from cache`);
      }
      
      // Draw debug overlay if enabled
      if (this.showDebugOverlay) {
        console.log('Drawing debug overlay at:', this.debugInfo.position);
        
        // Draw directly here to ensure it works
        try {
          // Save context state
          ctx.save();
          
          // Reset transform to draw in screen space
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          
          // Get debug overlay position and size
          const x = this.debugInfo.position.x;
          const y = this.debugInfo.position.y;
          const width = this.debugInfo.size.width;
          const height = this.debugInfo.size.height;
          const headerHeight = 30;
          
          // Draw semi-transparent background
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(x, y, width, height);
          
          // Draw border
          ctx.strokeStyle = '#4CAF50';
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);
          
          // Draw drag handle/header
          ctx.fillStyle = '#4CAF50';
          ctx.fillRect(x, y, width, headerHeight);
          
          // Draw title
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 16px monospace';
          ctx.fillText('🔍 DEBUG INFORMATION (drag to move)', x + 10, y + 20);
          
          // Draw performance metrics
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px monospace';
          
          const metrics = [
            `Render time: ${this.performanceMetrics.lastRenderTime.toFixed(2)}ms`,
            `Average: ${this.performanceMetrics.averageRenderTime.toFixed(2)}ms`,
            `Peak: ${this.performanceMetrics.peakRenderTime.toFixed(2)}ms`,
            `Slow renders: ${this.performanceMetrics.slowRenders}`,
            `Render count: ${this.performanceMetrics.renderCount}`,
            `Shapes rendered: ${this.performanceMetrics.shapesRendered}`,
            `Shapes skipped: ${this.performanceMetrics.shapesSkipped}`,
            `Shapes from cache: ${this.performanceMetrics.shapesCached}`,
            `Cache size: ${this.shapeCache.size} items`,
            `Image cache size: ${this.imageCache.size} items`,
            `Zoom: ${(this.zoom * 100).toFixed(0)}%`,
            `Canvas: ${this.canvasWidth}x${this.canvasHeight}`,
            `Offset: ${Math.round(this.offsetX)}, ${Math.round(this.offsetY)}`,
            `Total shapes: ${this.shapes.length}`,
            `Selected shapes: ${this.localSelectedShapes.length}`,
            `Current tool: ${this.tool || 'none'}`,
            `Cursor: ${Math.round(this.cursorX)}, ${Math.round(this.cursorY)}`,
            `Grid size: ${this.gridSize}`,
            `Snap to grid: ${this.snapToGrid ? 'ON' : 'OFF'}`
          ];
          
          metrics.forEach((text, index) => {
            ctx.fillText(text, x + 10, y + headerHeight + 20 + index * 20);
          });
          
          // Restore context state
          ctx.restore();
        } catch (error) {
          console.error('Error drawing debug overlay:', error);
        }
      }
    },
    animate() {
      const zoomDiff = this.zoomTarget - this.zoom;
      const offsetXDiff = this.panTargetX - this.offsetX;
      const offsetYDiff = this.panTargetY - this.offsetY;
      if (Math.abs(zoomDiff) > 0.0001) {
        this.zoom += zoomDiff * 0.15;
      } else {
        this.zoom = this.zoomTarget;
      }
      if (Math.abs(offsetXDiff) > 0.1) {
        this.offsetX += offsetXDiff * 0.2;
      } else {
        this.offsetX = this.panTargetX;
      }
      if (Math.abs(offsetYDiff) > 0.1) {
        this.offsetY += offsetYDiff * 0.2;
      } else {
        this.offsetY = this.panTargetY;
      }
      const needsRender = 
        Math.abs(zoomDiff) > 0.0001 || 
        Math.abs(offsetXDiff) > 0.1 || 
        Math.abs(offsetYDiff) > 0.1 ||
        this.gridSize !== this.lastGridSize || 
        this.gridOpacity !== this.lastGridOpacity;
      if (needsRender) {
        this.lastGridSize = this.gridSize;
        this.lastGridOpacity = this.gridOpacity;
        this.lastZoom = this.zoom;
        this.render();
      }
      requestAnimationFrame(this.animate.bind(this));
    },
    
    /**
     * Determines if a shape should be cached based on its complexity
     * @param {Object} shape - The shape to evaluate
     * @returns {boolean} - Whether the shape should be cached
     */
    shouldCacheShape(shape) {
      if (!this.shapeCacheEnabled) return false;
      
      return (
        // Complex pen strokes with many points
        (shape.type === 'pen' && shape.points && shape.points.length > 50) ||
        
        // Text with special formatting or long content
        (shape.type === 'text' && shape.text && 
          (shape.text.length > 20 || 
           shape.fontWeight === 'bold' || 
           shape.fontStyle === 'italic' || 
           shape.textDecoration === 'underline')) ||
        
        // Images are always cached
        shape.type === 'image' ||
        
        // Shapes with rotation are good candidates for caching
        (shape.rotation && shape.rotation !== 0)
      );
    },
    
    /**
     * Creates a cache key for a shape
     * @param {Object} shape - The shape to create a key for
     * @returns {string} - The cache key
     */
    getShapeCacheKey(shape) {
      // Include properties that would affect rendering
      return `${shape.id}_${shape.type}_${shape.width}_${shape.height}_${shape.rotation || 0}_${Date.now()}`;
    },
    
    /**
     * Caches a complex shape to improve rendering performance
     * @param {Object} shape - The shape to cache
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @returns {string|null} - The cache key if successful, null otherwise
     */
    cacheShape(shape, ctx) {
      if (!shape.id || !this.shouldCacheShape(shape)) return null;
      
      try {
        // Create a small canvas just for this shape
        const cacheCanvas = document.createElement('canvas');
        const padding = 20; // Add padding for rotation/effects
        cacheCanvas.width = shape.width + padding * 2;
        cacheCanvas.height = shape.height + padding * 2;
        
        const cacheCtx = cacheCanvas.getContext('2d', { willReadFrequently: true });
        if (!cacheCtx) return null;
        
        // Draw the shape on the cache canvas
        cacheCtx.save();
        cacheCtx.translate(padding, padding);
        
        // Draw shape based on type
        if (shape.type === 'rectangle') {
          cacheCtx.beginPath();
          cacheCtx.rect(0, 0, shape.width, shape.height);
          if (shape.fill && shape.fill !== 'transparent') {
            cacheCtx.fillStyle = shape.fill;
            cacheCtx.fill();
          }
          if (shape.stroke && shape.stroke !== 'transparent') {
            cacheCtx.strokeStyle = shape.stroke;
            cacheCtx.lineWidth = shape.lineWidth || 1;
            this.applyLineStyle(cacheCtx, shape.lineStyle, shape.lineWidth || 1);
            cacheCtx.stroke();
          }
        } else if (shape.type === 'circle') {
          const radius = Math.min(shape.width, shape.height) / 2;
          cacheCtx.beginPath();
          cacheCtx.arc(shape.width / 2, shape.height / 2, radius, 0, Math.PI * 2);
          if (shape.fill && shape.fill !== 'transparent') {
            cacheCtx.fillStyle = shape.fill;
            cacheCtx.fill();
          }
          if (shape.stroke && shape.stroke !== 'transparent') {
            cacheCtx.strokeStyle = shape.stroke;
            cacheCtx.lineWidth = shape.lineWidth || 1;
            this.applyLineStyle(cacheCtx, shape.lineStyle, shape.lineWidth || 1);
            cacheCtx.stroke();
          }
        } else if (shape.type === 'text') {
          const fontSize = shape.fontSize || 20;
          const fontFamily = shape.fontFamily || 'Arial, sans-serif';
          const fontWeight = shape.fontWeight || 'normal';
          const fontStyle = shape.fontStyle || 'normal';
          cacheCtx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          cacheCtx.textAlign = shape.textAlign || 'left';
          cacheCtx.textBaseline = 'top';
          cacheCtx.fillStyle = shape.fill && shape.fill !== 'transparent' ? shape.fill : '#000000';
          cacheCtx.fillText(shape.text, 0, 0);
          
          if (shape.textDecoration === 'underline') {
            const textWidth = cacheCtx.measureText(shape.text).width;
            const underlineY = fontSize * 1.1;
            cacheCtx.beginPath();
            let startX = 0;
            if (shape.textAlign === 'center') {
              startX = -textWidth / 2;
            } else if (shape.textAlign === 'right') {
              startX = -textWidth;
            }
            cacheCtx.strokeStyle = cacheCtx.fillStyle;
            cacheCtx.moveTo(startX, underlineY);
            cacheCtx.lineTo(startX + textWidth, underlineY);
            cacheCtx.lineWidth = fontSize * 0.05;
            cacheCtx.stroke();
          }
        } else if (shape.type === 'image' && shape.image) {
          cacheCtx.drawImage(shape.image, 0, 0, shape.width, shape.height);
        } else if (shape.type === 'pen' && shape.points && shape.points.length > 0) {
          cacheCtx.beginPath();
          cacheCtx.moveTo(shape.points[0][0], shape.points[0][1]);
          for (let i = 1; i < shape.points.length; i++) {
            cacheCtx.lineTo(shape.points[i][0], shape.points[i][1]);
          }
          cacheCtx.strokeStyle = shape.stroke || '#000000';
          cacheCtx.lineWidth = shape.lineWidth || 1;
          cacheCtx.lineCap = 'round';
          cacheCtx.lineJoin = 'round';
          this.applyLineStyle(cacheCtx, shape.lineStyle, shape.lineWidth || 1);
          cacheCtx.stroke();
        }
        
        cacheCtx.restore();
        
        // Store in cache with timestamp
        const cacheKey = this.getShapeCacheKey(shape);
        this.shapeCache.set(cacheKey, {
          canvas: cacheCanvas,
          timestamp: Date.now()
        });
        
        return cacheKey;
      } catch (error) {
        console.error('Error caching shape:', error);
        return null;
      }
    },
    
    /**
     * Cleans up old entries from the shape cache
     */
    cleanupShapeCache() {
      const now = Date.now();
      for (const [key, entry] of this.shapeCache.entries()) {
        if (now - entry.timestamp > this.shapeCacheMaxAge) {
          this.shapeCache.delete(key);
        }
      }
    },
    
    /**
     * Determines if a shape is visible in the current viewport
     * @param {Object} shape - The shape to check
     * @returns {boolean} - Whether the shape is visible
     */
    isShapeVisible(shape) {
      // Calculate viewport bounds in world coordinates
      const viewportLeft = -this.offsetX / this.zoom;
      const viewportTop = -this.offsetY / this.zoom;
      const viewportRight = viewportLeft + this.canvasWidth / this.zoom;
      const viewportBottom = viewportTop + this.canvasHeight / this.zoom;
      
      // Add padding to prevent popping at edges (100px in world coordinates)
      const padding = 100 / this.zoom;
      
      // Check if shape is in viewport
      return !(
        shape.x + shape.width + padding < viewportLeft ||
        shape.x - padding > viewportRight ||
        shape.y + shape.height + padding < viewportTop ||
        shape.y - padding > viewportBottom
      );
    },
    applyLineStyle(ctx, style, lineWidth) {
      ctx.setLineDash([]);
      switch (style) {
        case 'dashed':
          const dashSize = Math.max(lineWidth * 3, 6);
          const dashGap = Math.max(lineWidth * 2, 4);
          ctx.setLineDash([dashSize, dashGap]);
          break;
        case 'dotted':
          const dotSize = Math.max(lineWidth, 2);
          const dotGap = Math.max(lineWidth * 2, 4);
          ctx.setLineDash([dotSize, dotGap]);
          break;
        case 'dash-dot':
          const dashDotSize = Math.max(lineWidth * 3, 6);
          const dashDotGap = Math.max(lineWidth, 2);
          const dot = Math.max(lineWidth, 2);
          const endGap = Math.max(lineWidth * 2, 4);
          ctx.setLineDash([dashDotSize, dashDotGap, dot, endGap]);
          break;
        case 'solid':
        default:
          ctx.setLineDash([]);
          break;
      }
    }
  }
};
</script>

<style scoped>
.wrapper {
  position: fixed;
  top: 130px;
  left: 0;
  width: 100vw;
  height: calc(100vh - 130px);
  background-color: #333333;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  margin: 0;
  padding: 0;
}

.styled-canvas {
  display: block;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #555;
}

.status-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 36px;
  background-color: #2c2c2c;
  border-top: 1px solid #555;
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
  z-index: 100;
}

.status-item {
  margin-right: 30px;
  text-shadow: 1px 1px 1px rgba(0,0,0,0.3);
  padding: 0 8px;
  border-radius: 4px;
  background-color: rgba(255,255,255,0.1);
  height: 28px;
  display: flex;
  align-items: center;
}

.status-item strong {
  margin-right: 5px;
  color: #8cddff;
}

.status-active {
  background-color: rgba(76, 175, 80, 0.3) !important;
  border: 1px solid #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
  font-weight: bold;
}

.auto-save-status {
  display: flex;
  align-items: center;
  font-size: 0.85em;
  transition: all 0.3s ease;
}

.status-saving {
  background-color: rgba(59, 130, 246, 0.3) !important;
  border: 1px solid #3B82F6;
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
}

.status-saved {
  background-color: rgba(16, 185, 129, 0.3) !important;
  border: 1px solid #10B981;
  box-shadow: 0 0 5px rgba(16, 185, 129, 0.5);
}

.status-error {
  background-color: rgba(239, 68, 68, 0.3) !important;
  border: 1px solid #EF4444;
  box-shadow: 0 0 5px rgba(239, 68, 68, 0.5);
}

.debug-button {
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  margin-left: auto;
  cursor: pointer;
  font-weight: bold;
}

.debug-button:hover {
  background-color: #d32f2f;
}

.debug-active {
  background-color: #4CAF50 !important;
}

.debug-active:hover {
  background-color: #388E3C !important;
}
</style>