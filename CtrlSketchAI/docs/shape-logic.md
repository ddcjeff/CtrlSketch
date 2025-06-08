
# CtrlSketch Shape Logic

Shapes are interactive components on the canvas. Each shape:
- Has a unique tag
- Stores its x/y position
- Emits events when moved or selected
- Can be added to the BOM based on its metadata

Dragging uses mouse events captured in Vue components and updates the central canvas store in real-time.
