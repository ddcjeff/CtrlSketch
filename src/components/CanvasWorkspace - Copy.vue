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
      @dblclick="handleDoubleClick"
      @keydown.delete="deleteSelected"
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
    snapToGrid: Boolean
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
      canvasWidth: 1632, // 17 inches * 96 DPI
      canvasHeight: 1056, // 11 inches * 96 DPI
      shapes: [],
      selectedShapes: [],
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
      lastZoom: 1
    };
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
      canvas.focus();
      
      // Initialize canvas with proper centering
      // Use setTimeout to ensure the wrapper has been properly rendered
      setTimeout(() => {
        this.centerCanvas('reset');
      }, 100);
      
      window.addEventListener("resize", this.centerCanvas);
      document.addEventListener("keydown", this.handleKeyDown);
      this.animate();
    } catch (error) {
      console.error('Error initializing canvas:', error);
    }
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.centerCanvas);
    document.removeEventListener("keydown", this.handleKeyDown);
  },
  methods: {
    centerCanvas() {
      // Set initial offset to center the canvas
      const wrapper = this.$refs.wrapper;
      if (!wrapper) return; // Safety check
      
      // Reset zoom to 1 when centering (for double-click reset)
      if (arguments[0] === 'reset') {
        this.zoom = 1;
        this.zoomTarget = 1;
      }
      
      // Reset offset to 0 to center the canvas
      this.offsetX = 0;
      this.offsetY = 0;
      
      // Update pan targets to match
      this.panTargetX = this.offsetX;
      this.panTargetY = this.offsetY;
      
      // Force immediate render
      this.render();
    },
    handleWheel(e) {
      if (e.ctrlKey) {
        // Get mouse position relative to canvas
        const rect = this.$refs.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Calculate new zoom level with improved sensitivity
        const delta = e.deltaY * -0.001;
        const newZoom = Math.min(Math.max(this.zoom + delta, 0.3), 4);
        
        // Apply zoom immediately for better responsiveness
        this.zoom = newZoom;
        this.zoomTarget = newZoom;
        
        // Force immediate render
        this.render();
      } else if (e.shiftKey) {
        // Horizontal pan
        this.offsetX += e.deltaY * 0.5;
        this.panTargetX = this.offsetX;
        this.render();
      } else {
        // Vertical pan
        this.offsetY += e.deltaY * 0.5;
        this.panTargetY = this.offsetY;
        this.render();
      }
      
      // Always prevent default to avoid page scrolling
      e.preventDefault();
    },
    resetZoom() {
      // Call centerCanvas with 'reset' argument to reset zoom and center
      this.centerCanvas('reset');
    },
    snapCoordinate(coord) {
      if (this.snapToGrid && this.gridSize) {
        return Math.round(coord / this.gridSize) * this.gridSize;
      }
      return coord;
    },
    handleMouseDown(e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      
      // Calculate the position to center the drawing area
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      
      // Calculate coordinates in canvas space
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      
      this.startX = this.snapCoordinate(x);
      this.startY = this.snapCoordinate(y);

      if (this.tool) {
        this.isDrawing = true;
        this.currentShape = {
          type: this.tool,
          x: this.startX,
          y: this.startY,
          width: 0,
          height: 0,
          text: this.tool === 'text' ? 'Text' : '',
          points: this.tool === 'pen' ? [[this.startX, this.startY]] : null,
          rotation: 0,
          ...this.styles
        };
      } else {
        const handle = this.getHandleAt(x, y);
        if (handle) {
          if (handle.type === 'resize') {
            this.isResizing = true;
            this.resizeHandle = handle;
          } else if (handle.type === 'rotate') {
            this.isRotating = true;
          }
          return;
        }
        const shape = this.getShapeAt(x, y);
        if (shape) {
          if (!e.shiftKey) this.selectedShapes = [];
          if (!this.selectedShapes.includes(shape)) {
            this.selectedShapes.push(shape);
          }
          this.isDragging = true;
          return;
        }
        this.selectedShapes = [];
        this.selectionStart = { x, y };
      }
    },
    handleMouseMove(e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      
      // Calculate the position to center the drawing area
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      
      // Calculate coordinates in canvas space
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      
      const snappedX = this.snapCoordinate(x);
      const snappedY = this.snapCoordinate(y);

      if (this.isDrawing) {
        if (this.tool === 'pen') {
          this.currentShape.points.push([snappedX, snappedY]);
        } else {
          this.currentShape.width = snappedX - this.startX;
          this.currentShape.height = snappedY - this.startY;
        }
      } else if (this.isDragging) {
        const dx = snappedX - this.startX;
        const dy = snappedY - this.startY;
        this.selectedShapes.forEach(shape => {
          shape.x += dx;
          shape.y += dy;
        });
        this.startX = snappedX;
        this.startY = snappedY;
      } else if (this.isResizing) {
        const shape = this.selectedShapes[0];
        if (this.resizeHandle.corner === 'bottom-right') {
          shape.width = snappedX - shape.x;
          shape.height = snappedY - shape.y;
        }
      } else if (this.isRotating) {
        const shape = this.selectedShapes[0];
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        shape.rotation = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
      } else if (this.selectionStart) {
        this.currentShape = {
          type: 'selection',
          x: Math.min(this.startX, snappedX),
          y: Math.min(this.startY, snappedY),
          width: Math.abs(snappedX - this.startX),
          height: Math.abs(snappedY - this.startY)
        };
      }
      this.render();
    },
    handleMouseUp() {
      if (this.isDrawing) {
        this.shapes.push({ ...this.currentShape });
        this.currentShape = null;
        this.isDrawing = false;
        this.$emit('shape-added', this.shapes.slice());
      } else if (this.isDragging) {
        this.isDragging = false;
      } else if (this.isResizing) {
        this.isResizing = false;
        this.resizeHandle = null;
      } else if (this.isRotating) {
        this.isRotating = false;
      } else if (this.selectionStart) {
        this.selectedShapes = this.shapes.filter(shape =>
          shape.x >= this.currentShape.x &&
          shape.x + shape.width <= this.currentShape.x + this.currentShape.width &&
          shape.y >= this.currentShape.y &&
          shape.y + shape.height <= this.currentShape.y + this.currentShape.height
        );
        this.currentShape = null;
        this.selectionStart = null;
      }
      this.render();
    },
    handleDoubleClick(e) {
      const rect = this.$refs.canvas.getBoundingClientRect();
      
      // Calculate the position to center the drawing area
      const centerX = (this.canvasWidth - this.canvasWidth * this.zoom) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - this.canvasHeight * this.zoom) / 2 + this.offsetY;
      
      // Calculate coordinates in canvas space
      const x = (e.clientX - rect.left - centerX) / this.zoom;
      const y = (e.clientY - rect.top - centerY) / this.zoom;
      
      const shape = this.getShapeAt(x, y);
      if (shape && shape.type === 'text') {
        const newText = prompt('Enter text:', shape.text);
        if (newText) {
          shape.text = newText;
          this.$emit('shape-updated', this.shapes.slice());
          this.render();
        }
      } else {
        // Reset zoom and center the canvas
        this.resetZoom();
      }
    },
    handleKeyDown(e) {
      if (e.key === 'Delete' && this.selectedShapes.length) {
        this.deleteSelected();
        this.$emit('shape-deleted', this.shapes.slice());
        this.render();
      }
    },
    deleteSelected() {
      this.shapes = this.shapes.filter(shape => !this.selectedShapes.includes(shape));
      this.selectedShapes = [];
    },
    getShapeAt(x, y) {
      return this.shapes.find(shape => {
        if (shape.type === 'text') {
          return x >= shape.x && x <= shape.x + 100 && y >= shape.y && y <= shape.y + 20;
        }
        return x >= shape.x && x <= shape.x + shape.width &&
               y >= shape.y && y <= shape.y + shape.height;
      });
    },
    getHandleAt(x, y) {
      if (!this.selectedShapes.length) return null;
      const shape = this.selectedShapes[0];
      const handles = [
        { type: 'resize', corner: 'bottom-right', x: shape.x + shape.width, y: shape.y + shape.height },
        { type: 'rotate', x: shape.x + shape.width / 2, y: shape.y - 20 }
      ];
      return handles.find(h => Math.hypot(x - h.x, y - h.y) < 10 / this.zoom);
    },
    render() {
      const ctx = this.ctx;
      if (!ctx) return;
      
      // Clear the entire canvas
      ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Save the current state
      ctx.save();
      
      // Fill canvas with dark background color
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Calculate the size of the drawing area based on zoom
      const drawingWidth = this.canvasWidth * this.zoom;
      const drawingHeight = this.canvasHeight * this.zoom;
      
      // Calculate the position to center the drawing area
      const centerX = (this.canvasWidth - drawingWidth) / 2 + this.offsetX;
      const centerY = (this.canvasHeight - drawingHeight) / 2 + this.offsetY;
      
      // Apply transformations
      ctx.translate(centerX, centerY);
      ctx.scale(this.zoom, this.zoom);
      
      // Draw white canvas background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Draw canvas border
      ctx.strokeStyle = '#999999';
      ctx.lineWidth = 1 / this.zoom;
      ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);
      
      // Grid rendering
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

      // Shapes rendering
      this.shapes.forEach(shape => {
        ctx.save();
        if (shape.rotation) {
          ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
          ctx.rotate(shape.rotation);
          ctx.translate(-(shape.x + shape.width / 2), -(shape.y + shape.height / 2));
        }
        ctx.beginPath();
        ctx.lineWidth = shape.lineWidth / this.zoom;
        ctx.strokeStyle = shape.stroke;
        ctx.fillStyle = shape.fill;
        if (shape.type === 'rectangle') {
          ctx.rect(shape.x, shape.y, shape.width, shape.height);
        } else if (shape.type === 'circle') {
          const radius = Math.sqrt(shape.width ** 2 + shape.height ** 2);
          ctx.arc(shape.x, shape.y, radius, 0, 2 * Math.PI);
        } else if (shape.type === 'line') {
          ctx.moveTo(shape.x, shape.y);
          ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        } else if (shape.type === 'ellipse') {
          ctx.ellipse(shape.x + shape.width / 2, shape.y + shape.height / 2, Math.abs(shape.width / 2), Math.abs(shape.height / 2), 0, 0, 2 * Math.PI);
        } else if (shape.type === 'arrow') {
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
        } else if (shape.type === 'text') {
          ctx.font = `${20 / this.zoom}px Arial`;
          ctx.fillText(shape.text, shape.x, shape.y + 20 / this.zoom);
        } else if (shape.type === 'image') {
          if (shape.image) {
            ctx.drawImage(shape.image, shape.x, shape.y, shape.width, shape.height);
          }
        } else if (shape.type === 'pen') {
          if (shape.points && shape.points.length > 1) {
            ctx.moveTo(shape.points[0][0], shape.points[0][1]);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i][0], shape.points[i][1]);
            }
          }
        }
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      });

      // Current shape rendering
      if (this.currentShape) {
        ctx.beginPath();
        ctx.lineWidth = this.currentShape.lineWidth / this.zoom;
        ctx.strokeStyle = this.currentShape.stroke;
        ctx.fillStyle = this.currentShape.fill;
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
          ctx.font = `${20 / this.zoom}px Arial`;
          ctx.fillText(this.currentShape.text, this.currentShape.x, this.currentShape.y + 20 / this.zoom);
        } else if (this.currentShape.type === 'pen') {
          if (this.currentShape.points && this.currentShape.points.length > 1) {
            ctx.moveTo(this.currentShape.points[0][0], this.currentShape.points[0][1]);
            for (let i = 1; i < this.currentShape.points.length; i++) {
              ctx.lineTo(this.currentShape.points[i][0], this.currentShape.points[i][1]);
            }
          }
        } else if (this.currentShape.type === 'selection') {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 1 / this.zoom;
          ctx.strokeRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
        }
        ctx.fill();
        ctx.stroke();
      }

      // Selection handles
      this.selectedShapes.forEach(shape => {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2 / this.zoom;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        ctx.fillStyle = 'blue';
        ctx.fillRect(shape.x + shape.width - 5 / this.zoom, shape.y + shape.height - 5 / this.zoom, 10 / this.zoom, 10 / this.zoom);
        ctx.beginPath();
        ctx.arc(shape.x + shape.width / 2, shape.y - 20 / this.zoom, 5 / this.zoom, 0, 2 * Math.PI);
        ctx.fill();
      });

      // We already drew the canvas border earlier, no need to draw it again

      ctx.restore();
    },
    animate() {
      // Check if we need to update any values
      const zoomDiff = this.zoomTarget - this.zoom;
      const offsetXDiff = this.panTargetX - this.offsetX;
      const offsetYDiff = this.panTargetY - this.offsetY;
      
      // Only apply smooth transitions for small adjustments
      // For wheel events we already apply changes immediately
      if (Math.abs(zoomDiff) > 0.001) {
        this.zoom += zoomDiff * 0.2;
      }
      
      if (Math.abs(offsetXDiff) > 0.1) {
        this.offsetX += offsetXDiff * 0.2;
      }
      
      if (Math.abs(offsetYDiff) > 0.1) {
        this.offsetY += offsetYDiff * 0.2;
      }
      
      // Render if any values changed or grid settings changed
      const needsRender = 
        Math.abs(zoomDiff) > 0.001 || 
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
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.styled-canvas {
  display: block;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #555;
}
</style>