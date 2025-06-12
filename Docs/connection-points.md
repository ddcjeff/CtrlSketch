# Connection Points and Smart Snapping in CtrlSketch

## Overview
CtrlSketch provides powerful snapping capabilities to help you create precise diagrams. This includes both dedicated connection points and intelligent line endpoint snapping.

## Connection Points

### Adding Connection Points
1. Click on the "Draw" tab in the ribbon
2. Click on the "Connection Point" button (with the ✛ icon)
3. Click on a shape to add a connection point to it, or click on an empty area of the canvas to add a standalone connection point

### Using Connection Points
- When drawing lines with the Line, Flex Line, or Pen tools, the line endpoints will automatically snap to connection points when "Snap to Objects" is enabled
- This makes it easy to create precise connections between shapes
- Connection points appear as orange crosses (✛) inside white circles for high visibility during editing
- They have an aggressive snap radius of 40 pixels, making them easy to connect to

## Line Endpoint Snapping

### How Line Endpoint Snapping Works
- Line endpoints automatically snap to other line endpoints when "Snap to Objects" is enabled
- This makes it easy to create connected line segments and complex paths
- Line endpoints have a snap radius of 15 pixels (1.5x the standard snap radius)
- When snapping to a line endpoint, a blue indicator appears to show the snap point

### Supported Line Types
- Regular lines
- Polylines (first and last points)
- Paths (first and last segments)
- Flex lines

## Snapping Priority System
CtrlSketch uses a three-tier priority system for snapping:

1. **Connection Points** (Highest Priority)
   - Orange indicator
   - 40 pixel snap radius (2x standard)
   - Checked first in the snapping algorithm

2. **Line Endpoints** (Medium Priority)
   - Blue indicator
   - 15 pixel snap radius (1.5x standard)
   - Checked second in the snapping algorithm

3. **Other Snap Points** (Standard Priority)
   - Green indicator
   - 10 pixel snap radius (standard)
   - Includes shape corners, midpoints, and centers

### Toggling Snap to Objects
- Press the 'o' key on your keyboard to toggle snap to objects on/off
- Click on the "View" tab in the ribbon and click the "Snap to Objects" button
- The status bar at the bottom shows whether "Snap to Objects" is ON or OFF

## Technical Details
- Connection points are stored as special shapes with type 'connection-point'
- They have a 'printable: false' property so they won't appear when printing
- When attached to a shape, they store the parent shape's ID
- Line endpoints are automatically detected and prioritized during the snapping process
- Visual indicators use different colors to help identify the type of snap point

These features are similar to professional CAD and diagramming tools, allowing you to create precise technical diagrams with clean connections between shapes and lines.