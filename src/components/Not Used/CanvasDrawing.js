// src/components/CanvasDrawing.js
export function initDrawing(ctx) {
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
    }
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });

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
    } else if (this.currentShape.type === 'selection') {
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 1 / this.zoom;
      ctx.strokeRect(this.currentShape.x, this.currentShape.y, this.currentShape.width, this.currentShape.height);
    } else if (this.currentShape.type === 'pen') {
      this.currentShape.points.push([this.currentShape.x + this.currentShape.width, this.currentShape.y + this.currentShape.height]);
      ctx.moveTo(this.currentShape.points[0][0], this.currentShape.points[0][1]);
      for (let i = 1; i < this.currentShape.points.length; i++) {
        ctx.lineTo(this.currentShape.points[i][0], this.currentShape.points[i][1]);
      }
    }
    ctx.fill();
    ctx.stroke();
  }

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
}

export function handleDrawingMouseDown() {
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
}

export function handleDrawingMouseMove(snappedX, snappedY) {
  if (this.tool === 'pen') {
    this.currentShape.points.push([snappedX, snappedY]);
  } else {
    this.currentShape.width = snappedX - this.startX;
    this.currentShape.height = snappedY - this.startY;
  }
}

export function handleDrawingMouseUp() {
  this.shapes.push({ ...this.currentShape });
  this.currentShape = null;
  this.isDrawing = false;
}