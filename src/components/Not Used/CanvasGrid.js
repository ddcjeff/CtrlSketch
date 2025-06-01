export function renderGrid(ctx) {
  if (this.gridSize) {
    const step = this.gridSize;
    ctx.strokeStyle = `rgba(0, 0, 0, ${this.gridOpacity})`;
    ctx.lineWidth = 1 / this.zoom;
    // Start grid at canvas origin (0,0)
    for (let x = 0; x <= this.canvasWidth; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
      ctx.stroke();
    }
    for (let y = 0; y <= this.canvasHeight; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
      ctx.stroke();
    }
  }
}

export function snapCoordinate(coord) {
  if (this.snapToGrid && this.gridSize) {
    return Math.round(coord / this.gridSize) * this.gridSize;
  }
  return coord;
}