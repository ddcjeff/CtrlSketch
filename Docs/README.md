# CtrlSketch Pro - Line Styling Implementation

This package contains the components and code needed to implement comprehensive line styling in your CtrlSketch application.

## Components

### 1. LineStylePicker
Allows users to choose between solid, dashed, and dotted line styles for shapes and drawings.

### 2. LineThicknessPicker
Enables users to set line thickness with both preset buttons and a slider control (range 1-10px).

### 3. ArrowStylePicker
Provides options for different arrow styles (none, simple, triangle, filled-triangle, diamond, circle) with visual representations.

## Type Definitions

The `drawing-types.ts` file contains the TypeScript type definitions needed for the line styling features:

```typescript
export type LineStyle = 'solid' | 'dashed' | 'dotted';
export type ArrowStyle = 'none' | 'simple' | 'triangle' | 'filled-triangle' | 'diamond' | 'circle';
```

## Installation

1. Copy the component files to your project's components directory
2. Add the type definitions to your types file
3. Update your element rendering to use these styles
4. Integrate the style pickers into your toolbar or properties panel

## Implementation Notes

### Adding Line Styles to Elements

When creating elements, include the line style properties:

```javascript
const newElement = {
  // other properties...
  strokeWidth: lineWidth,
  lineStyle: lineStyle,
  // For arrows and connections:
  arrowStyle: arrowStyle
};
```

### Rendering Line Styles

For rectangles and ellipses, use CSS border styles:

```javascript
// For rectangle or ellipse
let borderStyle = 'solid';
if (lineStyle === 'dashed') {
  borderStyle = 'dashed';
} else if (lineStyle === 'dotted') {
  borderStyle = 'dotted';
}

// Then in the style object:
border: `${strokeWidth}px ${borderStyle} ${strokeColor}`
```

For lines, arrows, and freehand drawings, use SVG's strokeDasharray:

```javascript
strokeDasharray={
  lineStyle === 'dashed' ? `${strokeWidth * 3} ${strokeWidth * 2}` : 
  lineStyle === 'dotted' ? `${strokeWidth} ${strokeWidth * 2}` : 
  undefined
}
```

### Arrow Styles

Arrow styles are implemented using SVG paths with different shapes based on the selected style:

- simple: A simple arrow with two lines
- triangle: An outlined triangular arrowhead
- filled-triangle: A solid triangular arrowhead
- diamond: A diamond-shaped arrowhead
- circle: A circular endpoint
- none: No arrowhead, just a straight line

## Styling

The CSS file includes styles for all these components to match your application's UI and support dark mode.