// src/components/CanvasZoom.js
export function centerCanvas() {
  const wrapper = this.$refs.wrapper;
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;
  this.offsetX = (width - this.canvasWidth * this.zoom) / 2;
  this.offsetY = (height - this.canvasHeight * this.zoom) / 2;
  this.panTargetX = this.offsetX;
  this.panTargetY = this.offsetY;
}

export function handleZoomWheel(e) {
  const rect = this.$refs.wrapper.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  if (e.ctrlKey) {
    const delta = e.deltaY * -0.0012;
    const newZoom = Math.min(Math.max(this.zoomTarget + delta, 0.3), 4);
    const wx = (centerX - this.offsetX) / this.zoom;
    const wy = (centerY - this.offsetY) / this.zoom;
    this.zoomTarget = newZoom;
    this.panTargetX = centerX - wx * newZoom;
    this.panTargetY = centerY - wy * newZoom;
  } else if (e.shiftKey) {
    this.panTargetX += e.deltaY * 0.3;
  } else {
    this.panTargetY += e.deltaY * 0.3;
  }
}

export function resetZoom() {
  this.zoomTarget = 1;
  this.centerCanvas();
}