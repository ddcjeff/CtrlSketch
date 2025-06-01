// src/components/CanvasSelection.js
export function handleSelectionMouseDown(e, x, y) {
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

export function handleSelectionMouseMove(x, y, snappedX, snappedY) {
  if (this.isDragging) {
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
}

export function handleSelectionMouseUp() {
  if (this.isDragging) {
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
}

export function deleteSelected() {
  this.shapes = this.shapes.filter(shape => !this.selectedShapes.includes(shape));
  this.selectedShapes = [];
}

export function getShapeAt(x, y) {
  return this.shapes.find(shape => {
    if (shape.type === 'text') {
      return x >= shape.x && x <= shape.x + 100 && y >= shape.y && y <= shape.y + 20;
    }
    return x >= shape.x && x <= shape.x + shape.width &&
           y >= shape.y && y <= shape.y + shape.height;
  });
}

export function getHandleAt(x, y) {
  if (!this.selectedShapes.length) return null;
  const shape = this.selectedShapes[0];
  const handles = [
    { type: 'resize', corner: 'bottom-right', x: shape.x + shape.width, y: shape.y + shape.height },
    { type: 'rotate', x: shape.x + shape.width / 2, y: shape.y - 20 }
  ];
  return handles.find(h => Math.hypot(x - h.x, y - h.y) < 10 / this.zoom);
}