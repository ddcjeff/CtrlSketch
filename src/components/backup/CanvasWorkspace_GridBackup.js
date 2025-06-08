/**
 * Backup of the original grid implementation from CanvasWorkspace.vue
 * Created as a safety measure before implementing custom grid systems
 */

// Original grid-related props
const gridProps = `
  props: {
    gridSize: Number,
    gridOpacity: Number,
    snapToGrid: Boolean,
  }
`;

// Original grid drawing implementation
const gridDrawingCode = `
  // Draw grid if enabled
  if (this.gridSize) {
    const step = this.gridSize;
    ctx.strokeStyle = \`rgba(0, 0, 0, \${this.gridOpacity})\`;
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
`;

// Original snap to grid implementation
const snapToGridCode = `
  snapCoordinate(coord) {
    if (this.snapToGrid && this.gridSize) {
      return Math.round(coord / this.gridSize) * this.gridSize;
    }
    return coord;
  }
`;

// Original grid-related watchers
const gridWatchers = `
  gridSize() {
    this.staticCanvasDirty = true;
    this.render();
  },
  gridOpacity() {
    this.staticCanvasDirty = true;
    this.render();
  }
`;

// Export the backup code
export default {
  gridProps,
  gridDrawingCode,
  snapToGridCode,
  gridWatchers
};