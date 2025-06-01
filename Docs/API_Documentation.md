# CtrlSketch API Documentation

## Overview

This document provides detailed information about the CtrlSketch application's internal API, component structure, and key methods for developers who need to maintain or extend the application.

## Core Components

### App.vue

The main application component that orchestrates all functionality and manages the application state.

#### Props
None (root component)

#### Events
None (root component)

#### Key Methods

##### `handleMenu({ type, value })`
Processes menu actions from the MenuBar component.

- **Parameters:**
  - `type` (String): The category of menu action (e.g., 'file', 'help', 'tab')
  - `value` (String): The specific action to perform (e.g., 'new', 'open', 'save')

- **Description:**
  Handles various menu actions including file operations, help options, and tab switching.

##### `handleRibbonAction({ type, value })`
Processes actions triggered from the Ribbon component.

- **Parameters:**
  - `type` (String): The category of ribbon action (e.g., 'tool', 'style', 'clipboard')
  - `value` (String/Object): The specific action or value to apply

- **Description:**
  Central handler for ribbon interactions including tool selection, style changes, clipboard operations, view settings, and history navigation.

##### `addHistory(shapes)`
Adds a snapshot to the undo/redo history stack.

- **Parameters:**
  - `shapes` (Array): The current state of shapes to save in history

- **Description:**
  Creates a history entry for undo/redo operations, managing the history stack and index.

##### `undo()`
Reverts to the previous state in the history stack.

- **Description:**
  Restores the previous state from history, updating the canvas with the previous set of shapes.

##### `redo()`
Advances to the next state in the history stack if available.

- **Description:**
  Restores the next state from history if available, updating the canvas with the next set of shapes.

##### `exportAsPDF()`
Exports the current canvas as a PDF document.

- **Description:**
  Creates a PDF document from the current canvas content and triggers a download.

##### `exportAsPNG()`
Exports the current canvas as a PNG image.

- **Description:**
  Creates a PNG image from the current canvas content and triggers a download.

##### `exportAsSVG()`
Exports the current canvas as an SVG file.

- **Description:**
  Creates an SVG representation of the current canvas content and triggers a download.

##### `saveFile()`
Saves the current project state to a file.

- **Description:**
  Serializes the current project state (shapes, layers, etc.) to a JSON file and triggers a download.

##### `openFile()`
Opens a saved project file.

- **Description:**
  Loads a previously saved project file, restoring shapes, layers, and other project settings.

### CanvasWorkspace.vue

The core drawing component that handles rendering, user interactions, and shape manipulation.

#### Props

- `tool` (String): The currently selected drawing tool
- `styles` (Object): The current drawing styles (stroke, fill, etc.)
- `gridSize` (Number): The size of the grid cells
- `gridOpacity` (Number): The opacity of the grid
- `snapToGrid` (Boolean): Whether to snap shapes to the grid
- `shapes` (Array): The shapes to render on the canvas
- `selectedShapes` (Array): The currently selected shapes
- `activeLayer` (Object): The currently active layer
- `visibleLayers` (Array): The layers that are currently visible
- `showRulers` (Boolean): Whether to show rulers

#### Events

- `shape-added`: Emitted when a new shape is added to the canvas
- `shape-updated`: Emitted when a shape is modified
- `shape-deleted`: Emitted when a shape is deleted
- `shapes-selected`: Emitted when shapes are selected
- `undo-requested`: Emitted when an undo operation is requested
- `redo-requested`: Emitted when a redo operation is requested
- `toggle-snap-grid`: Emitted when snap-to-grid is toggled
- `tool-change`: Emitted when the tool is changed

#### Key Methods

##### `drawShape(ctx, shape)`
Renders a shape on the canvas.

- **Parameters:**
  - `ctx` (CanvasRenderingContext2D): The canvas rendering context
  - `shape` (Object): The shape to draw

- **Description:**
  Draws a shape on the canvas based on its type (rectangle, ellipse, line, etc.) and applies the appropriate styles.

##### `handleMouseDown(event)`
Processes mouse down events on the canvas.

- **Parameters:**
  - `event` (MouseEvent): The mouse event

- **Description:**
  Initiates drawing, selection, or manipulation operations based on the current tool and cursor position.

##### `handleMouseMove(event)`
Processes mouse move events on the canvas.

- **Parameters:**
  - `event` (MouseEvent): The mouse event

- **Description:**
  Updates drawing or manipulation operations as the mouse moves, providing real-time feedback.

##### `handleMouseUp(event)`
Processes mouse up events on the canvas.

- **Parameters:**
  - `event` (MouseEvent): The mouse event

- **Description:**
  Completes drawing or manipulation operations, finalizing shapes or selections.

##### `snapToGridPoint(x, y)`
Adjusts coordinates to align with the grid.

- **Parameters:**
  - `x` (Number): The x-coordinate
  - `y` (Number): The y-coordinate

- **Returns:**
  - Object: `{ x, y }` with adjusted coordinates

- **Description:**
  If snap-to-grid is enabled, adjusts the coordinates to align with the nearest grid point.

##### `zoomCanvas(factor)`
Adjusts the zoom level of the canvas.

- **Parameters:**
  - `factor` (Number): The zoom factor to apply

- **Description:**
  Changes the zoom level of the canvas, adjusting the view accordingly.

##### `resetZoom()`
Resets the canvas zoom to the default level.

- **Description:**
  Restores the default zoom level (1.0) and centers the canvas view.

##### `groupSelectedShapes()`
Groups the currently selected shapes.

- **Description:**
  Creates a group from the currently selected shapes, allowing them to be manipulated as a single entity.

##### `ungroupSelectedShapes()`
Ungroups the selected shape group.

- **Description:**
  Breaks a group back into its constituent shapes, allowing individual manipulation.

### Ribbon.vue

The ribbon interface component that provides access to tools and commands.

#### Props

- `activeTab` (String): The currently active ribbon tab
- `gridSize` (Number): The current grid size
- `gridOpacity` (Number): The current grid opacity
- `showLayers` (Boolean): Whether the layers panel is visible

#### Events

- `ribbon-action`: Emitted when a ribbon action is triggered, with payload `{ type, value }`

#### Key Methods

None (primarily a template-driven component)

### Layers.vue

The component that manages layer operations and the layers panel UI.

#### Props

- `visible` (Boolean): Whether the layers panel is visible
- `layers` (Array): The layers in the project
- `selectedLayerIndex` (Number): The index of the currently selected layer

#### Events

- `select-layer`: Emitted when a layer is selected
- `toggle-layer-visibility`: Emitted when a layer's visibility is toggled
- `toggle-layer-freeze`: Emitted when a layer's frozen state is toggled
- `update-layers`: Emitted when layers are updated
- `add-layer`: Emitted when a new layer is added
- `delete-layer`: Emitted when a layer is deleted
- `move-layer`: Emitted when a layer is moved
- `duplicate-layer`: Emitted when a layer is duplicated
- `merge-down`: Emitted when a layer is merged with the one below it
- `clear-layer`: Emitted when a layer is cleared
- `rename-layer`: Emitted when a layer is renamed
- `update-layer-opacity`: Emitted when a layer's opacity is changed

#### Key Methods

##### `selectLayer(index)`
Selects a layer.

- **Parameters:**
  - `index` (Number): The index of the layer to select

- **Description:**
  Updates the selected layer and emits the appropriate event.

##### `toggleLayerVisibility(index)`
Toggles a layer's visibility.

- **Parameters:**
  - `index` (Number): The index of the layer to toggle

- **Description:**
  Toggles the visibility of the specified layer and emits the appropriate event.

## Data Structures

### Shape Object

Represents a shape on the canvas.

```javascript
{
  id: Number,        // Unique identifier
  type: String,      // 'rectangle', 'ellipse', 'line', 'path', 'text', etc.
  x: Number,         // X-coordinate
  y: Number,         // Y-coordinate
  width: Number,     // Width (for rectangles, ellipses)
  height: Number,    // Height (for rectangles, ellipses)
  points: Array,     // Array of points (for paths, polylines)
  text: String,      // Text content (for text shapes)
  fontSize: Number,  // Font size (for text shapes)
  fontFamily: String,// Font family (for text shapes)
  stroke: String,    // Stroke color
  fill: String,      // Fill color
  lineWidth: Number, // Line width
  lineStyle: String, // 'solid', 'dashed', 'dotted'
  layerId: Number,   // ID of the layer this shape belongs to
  rotation: Number,  // Rotation angle in degrees
  opacity: Number,   // Opacity (0-100)
  isGroup: Boolean,  // Whether this is a group of shapes
  children: Array    // Child shapes if this is a group
}
```

### Layer Object

Represents a layer in the project.

```javascript
{
  id: Number,        // Unique identifier
  name: String,      // Layer name
  visible: Boolean,  // Whether the layer is visible
  frozen: Boolean,   // Whether the layer is frozen (locked)
  opacity: Number,   // Layer opacity (0-100)
  shapes: Array      // Shapes in this layer
}
```

## Integration Points

### File Import/Export

The application supports importing and exporting files in various formats:

- **JSON/CSP**: Native format for saving and loading projects
- **PDF**: Export for printing and sharing
- **PNG**: Export for image use
- **SVG**: Export for vector graphics use

### Keyboard Shortcuts

The application supports various keyboard shortcuts:

- **Ctrl+Z**: Undo
- **Ctrl+Y/Ctrl+Shift+Z**: Redo
- **Ctrl+A**: Select all shapes
- **Delete/Backspace**: Delete selected shapes
- **G**: Toggle snap to grid
- **Ctrl+X**: Cut selected shapes
- **Ctrl+C**: Copy selected shapes
- **Ctrl+V**: Paste shapes
- **Ctrl+0**: Reset zoom
- **Ctrl++/Ctrl+=**: Zoom in
- **Ctrl+-**: Zoom out

## Extending the Application

### Adding a New Tool

To add a new drawing tool:

1. Add the tool button to the appropriate section in `Ribbon.vue`
2. Add a case for the new tool in the `handleRibbonAction` method in `App.vue`
3. Implement the tool's behavior in the mouse event handlers in `CanvasWorkspace.vue`

### Adding a New Shape Type

To add a new shape type:

1. Add a new case in the `drawShape` method in `CanvasWorkspace.vue`
2. Implement the shape creation logic in the appropriate mouse event handlers
3. Add any necessary properties to the shape object structure

### Adding a New Export Format

To add a new export format:

1. Add a new menu item in `MenuBar.vue`
2. Add a case for the new format in the `handleMenu` method in `App.vue`
3. Implement the export logic in a new method in `App.vue`