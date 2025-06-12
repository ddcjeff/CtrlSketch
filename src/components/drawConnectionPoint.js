/**
 * Draw a connection point
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {Object} shape - The connection point shape
 */
export function drawConnectionPoint(ctx, shape) {
  const { x, y, color = '#FF6600' } = shape;
  
  // Save context state
  ctx.save();
  
  // Draw a cross (plus sign)
  const size = 8; // Size of the cross
  
  // Draw outer circle for better visibility
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fill();
  
  // Draw the cross
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size);
  ctx.lineTo(x, y + size);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Restore context state
  ctx.restore();
}