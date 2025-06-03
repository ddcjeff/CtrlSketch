# CtrlSketch Pro User Manual

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Interface Overview](#user-interface-overview)
4. [File Operations](#file-operations)
5. [Drawing Tools](#drawing-tools)
6. [Styling and Formatting](#styling-and-formatting)
7. [Working with Parts](#working-with-parts)
8. [Multi-Page Documents](#multi-page-documents)
9. [Bill of Materials (BOM)](#bill-of-materials-bom)
10. [Connection and Wiring Features](#connection-and-wiring-features)
11. [Advanced Features](#advanced-features)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
13. [Troubleshooting](#troubleshooting)
14. [Tips and Best Practices](#tips-and-best-practices)

---

## Introduction

CtrlSketch Pro is a powerful drawing and diagramming application designed specifically for creating technical diagrams, schematics, and engineering drawings. With its intuitive interface and specialized features, CtrlSketch Pro helps you create professional-quality technical documentation efficiently.

### Key Features

- Comprehensive shape creation and manipulation tools
- Technical parts library with customizable properties
- Multi-page document system with tabbed navigation
- Bill of Materials (BOM) generation
- Connection and wiring features for creating circuit diagrams
- Line styling options including thickness, styles, and arrow types
- Dark mode support for extended working sessions
- Cloud-based database for parts management

---

## Getting Started

### System Requirements

- Windows 10/11, macOS 10.14+, or Linux
- 4GB RAM minimum (8GB recommended)
- 500MB free disk space
- Internet connection for cloud features

### Installation

1. Download the installer from the official website
2. Run the installer and follow the on-screen instructions
3. Launch CtrlSketch Pro from your applications folder or Start menu

### First-Time Setup

When you first launch CtrlSketch Pro, you'll be guided through a brief setup process:

1. Choose your preferred theme (Light or Dark)
2. Set your default file location
3. Configure autosave settings
4. Connect to your database (if applicable)

---

## User Interface Overview

### Main Window Components

![Main Interface](main-interface.png)

1. **Menu Bar** - Contains all application commands
2. **Main Toolbar** - Quick access to common tools and operations
3. **Drawing Canvas** - Your working area for creating diagrams
4. **Properties Panel** - Shows properties of selected elements
5. **Page Tabs** - Navigation between document pages
6. **Status Bar** - Shows current tool, cursor position, and zoom level

### Dark Mode

CtrlSketch Pro offers a dark mode option that reduces eye strain during extended use:

- Toggle dark mode via the View menu or by pressing Ctrl+Shift+D
- All interface elements and dialogs automatically adapt to dark mode
- Your drawings remain visually consistent in both modes

---

## File Operations

### Creating a New Document

1. Click File > New or press Ctrl+N
2. Select a template or start with a blank document
3. Set document properties (size, orientation, units)
4. Click Create

### Opening Existing Documents

1. Click File > Open or press Ctrl+O
2. Browse to find your .CSP file
3. Select the file and click Open

### Saving Your Work

- **Save**: Click File > Save or press Ctrl+S to save to the current file
- **Save As**: Click File > Save As or press Ctrl+Shift+S to save to a new file
- **Autosave**: Documents are automatically saved every 5 minutes (configurable in settings)

### Export Options

CtrlSketch Pro supports exporting your diagrams in various formats:

- **PDF**: For high-quality print documents
- **PNG/JPG**: For web or presentation use
- **SVG**: For scalable graphics
- **CSV**: For Bill of Materials data

### File Management Tips

- Use descriptive filenames for easier identification
- Regular backups are recommended for important projects
- The Recent Files list (File > Recent Files) provides quick access to your latest projects

---

## Drawing Tools

### Selection Tool

The selection tool allows you to select, move, resize, and edit elements:

1. Click the selection tool in the toolbar or press S
2. Click on an element to select it
3. Use the handles to resize or rotate
4. Hold Shift to maintain aspect ratio while resizing
5. Hold Ctrl to select multiple elements

### Shape Tools

CtrlSketch Pro includes several basic shape tools:

- **Rectangle**: Click and drag to create a rectangle
- **Ellipse**: Click and drag to create an ellipse
- **Line**: Click and drag to create a straight line
- **Arrow**: Click and drag to create an arrow

### Text Tool

1. Select the text tool from the toolbar or press T
2. Click on the canvas where you want to add text
3. Type your text
4. Use the properties panel to format your text (font, size, alignment)

### Freehand Drawing

1. Select the freehand tool from the toolbar or press F
2. Click and drag on the canvas to draw
3. Release the mouse button to complete the drawing

### Part Tools

Specialized part tools allow you to add technical components to your diagram:

1. Select the part tool from the toolbar
2. Choose the part type from the dropdown menu
3. Click on the canvas to place the part
4. Use the properties panel to configure the part's properties

### Connection Tool

The connection tool creates wired connections between parts:

1. Select the connection tool from the toolbar or press C
2. Click on a connection point of the first part
3. Drag to a connection point on another part
4. Release to create the connection

---

## Styling and Formatting

### Color Controls

- **Stroke Color**: Sets the outline color of elements
- **Fill Color**: Sets the interior color of shapes
- **Text Color**: Sets the color of text elements

### Line Styling

#### Line Thickness

1. Select an element or choose a drawing tool
2. Open the line style options
3. Use one of the preset thickness buttons (1, 2, 3, 5, 8, or 10px)
4. For precise control, use the thickness slider (1-10px)

#### Line Styles

CtrlSketch Pro offers three line styles:

1. **Solid** - A continuous, unbroken line (default)
2. **Dashed** - A line made up of short dashes
3. **Dotted** - A line made up of small dots

#### Arrow Styles

Six arrow styles are available for line ends:

1. **None** - No arrowhead
2. **Simple** - A basic arrow with two lines
3. **Triangle** - An outlined triangular arrowhead
4. **Filled Triangle** - A solid triangular arrowhead
5. **Diamond** - A diamond-shaped arrowhead
6. **Circle** - A circular endpoint

### Alignment and Distribution

For precise positioning of multiple elements:

1. Select two or more elements
2. Use the alignment tools in the toolbar:
   - Align Left, Center, or Right
   - Align Top, Middle, or Bottom
   - Distribute Horizontally or Vertically

### Grid and Snap Settings

1. Toggle grid visibility via View > Show Grid or Ctrl+G
2. Adjust grid spacing in File > Preferences > Grid
3. Enable/disable snap to grid via View > Snap to Grid or Ctrl+Shift+G

---

## Working with Parts

### Part Properties

Each part in CtrlSketch Pro has customizable properties:

- **Tag**: Unique identifier for the part
- **Part Number**: Manufacturer's part number
- **Config**: Configuration details
- **Manufacturer**: Company that produces the part
- **Point Type**: Type of connection points (AI, BI, BO, AO, UI, UO)
- **Description**: Detailed information about the part
- **Installation Status**: Current status of the part

### Creating Custom Parts

1. Draw a shape or group of shapes
2. Right-click and select "Convert to Part"
3. Fill in the part properties in the dialog
4. Click Convert

### Parts Library

CtrlSketch Pro includes a library of common technical parts:

1. Open the Parts panel via View > Parts Library or press Ctrl+P
2. Browse categories or search for specific parts
3. Drag and drop parts onto your canvas
4. Customize properties as needed

### Parts Plus Management Interface

The Parts Plus interface provides advanced parts management:

1. Access via Tools > Parts Plus or press Ctrl+Shift+P
2. Use the search function to find parts
3. Add new parts with the "+" button
4. Edit existing parts by selecting and modifying properties
5. Delete parts with the trash icon (use with caution)

---

## Multi-Page Documents

### Adding New Pages

1. Click the "+" tab or use Document > Add Page
2. Name your new page
3. Set page properties (size, orientation)
4. Click Create

### Page Navigation

- Click on page tabs to switch between pages
- Use Ctrl+Page Up/Down to move between pages
- Right-click tab for page options (rename, duplicate, delete)

### Page Management

- **Reordering**: Drag and drop tabs to reorder pages
- **Renaming**: Double-click tab or right-click and select Rename
- **Deleting**: Right-click tab and select Delete

### Master Pages

Master pages contain content that appears on multiple pages:

1. Create a master page via Document > Add Master Page
2. Add elements that should appear on all pages
3. Assign the master page to other pages via Page Properties

---

## Bill of Materials (BOM)

### Generating a BOM

1. Select Tools > Generate BOM or press Ctrl+B
2. Choose which pages to include
3. Select BOM format options
4. Click Generate

### BOM Display

The BOM Display shows all parts in your document with their properties:

- Filter by page or part type
- Sort by any column
- Edit properties directly in the table

### Exporting BOM Data

1. In the BOM Display, click Export
2. Choose CSV or Excel format
3. Select export options
4. Choose file location and name
5. Click Save

### BOM Templates

CtrlSketch Pro allows you to save and reuse BOM formats:

1. Configure your BOM display as desired
2. Click Save Template
3. Name your template
4. Load templates via the Template dropdown in BOM settings

---

## Connection and Wiring Features

### Creating Connections

1. Select the connection tool from the toolbar
2. Click on a connector point of one element
3. Drag to a connector point on another element
4. Release to create the connection

### Connection Types

- **Simple**: Direct line between connection points
- **Orthogonal**: Right-angle connections (horizontal and vertical segments only)
- **Bezier**: Curved connections with control points

### Connector Points

Elements have predefined connector points for attaching connections:

- Hover near an element edge to see available connector points
- Blue dots indicate input connectors
- Green dots indicate output connectors
- Purple dots indicate bidirectional connectors

### Styling Connections

1. Select a connection
2. Use the properties panel to adjust:
   - Line thickness
   - Line style (solid, dashed, dotted)
   - Arrow style
   - Color

### Connection Labels

1. Double-click on a connection to add a label
2. Type your label text
3. Use the handles to position the label along the connection

---

## Advanced Features

### Layers

Layers help organize complex diagrams:

1. Access the Layers panel via View > Layers or press L
2. Create new layers with the "+" button
3. Rename layers by double-clicking their names
4. Reorder layers by dragging
5. Toggle visibility with the eye icon
6. Lock layers with the lock icon

### Groups

Grouping elements keeps related items together:

1. Select multiple elements
2. Right-click and select Group or press Ctrl+G
3. Move, resize, or rotate the group as a single unit
4. Ungroup with right-click > Ungroup or Ctrl+Shift+G

### Templates

Save time by creating and using templates:

1. Create a document with the elements you use frequently
2. Save as a template via File > Save As Template
3. Access templates via File > New > From Template

### Image Import

1. Select File > Import > Image or press Ctrl+I
2. Browse and select your image file
3. Click to place the image on the canvas
4. Resize as needed

---

## Keyboard Shortcuts

### File Operations
- **Ctrl+N**: New document
- **Ctrl+O**: Open document
- **Ctrl+S**: Save
- **Ctrl+Shift+S**: Save As
- **Ctrl+P**: Print
- **Ctrl+W**: Close document
- **Ctrl+Q**: Exit application

### Editing
- **Ctrl+Z**: Undo
- **Ctrl+Y**: Redo
- **Ctrl+X**: Cut
- **Ctrl+C**: Copy
- **Ctrl+V**: Paste
- **Delete**: Delete selected element
- **Ctrl+A**: Select all
- **Ctrl+D**: Duplicate selected element

### View
- **Ctrl++**: Zoom in
- **Ctrl+-**: Zoom out
- **Ctrl+0**: Zoom to fit
- **Ctrl+1**: Zoom to 100%
- **Ctrl+G**: Toggle grid
- **Ctrl+Shift+G**: Toggle snap to grid
- **Ctrl+Shift+D**: Toggle dark mode

### Tools
- **S**: Selection tool
- **R**: Rectangle tool
- **E**: Ellipse tool
- **L**: Line tool
- **A**: Arrow tool
- **T**: Text tool
- **F**: Freehand tool
- **P**: Part tool
- **C**: Connection tool

### Formatting
- **Ctrl+L**: Open line style options
- **Ctrl+[**: Decrease line thickness
- **Ctrl+]**: Increase line thickness
- **Ctrl+Shift+A**: Cycle through arrow styles

---

## Troubleshooting

### Common Issues and Solutions

#### Application Won't Start
- Verify your system meets the minimum requirements
- Check for updates to your operating system
- Try reinstalling the application

#### File Won't Open
- Ensure the file is a valid .CSP format
- Check if the file is locked by another application
- Try opening a backup copy

#### Elements Won't Select
- Check if you're on a locked layer
- Verify the element isn't part of a group
- Try zooming in for better precision

#### Connections Not Attaching
- Ensure you're clicking on valid connector points
- Check that both elements have compatible connector types
- Try moving elements closer together

#### BOM Missing Parts
- Verify part properties are properly set
- Check if parts are on hidden layers
- Ensure parts are actual part elements (not regular shapes)

### Error Reporting

If you encounter an error:

1. Note the steps that led to the error
2. Take a screenshot if possible
3. Check the Help > Troubleshooting Guide for solutions
4. Contact support with detailed information if the issue persists

---

## Tips and Best Practices

### Efficient Workflow

- Use templates for recurring diagram types
- Customize the toolbar with your most-used tools
- Learn keyboard shortcuts for common operations
- Save frequently and use version numbering

### Drawing Organization

- Use layers to separate different parts of complex diagrams
- Group related elements
- Name pages and elements clearly
- Use a consistent color scheme

### Technical Diagrams

- Maintain consistent scale throughout your diagram
- Use appropriate line styles to indicate different connection types
- Include a legend explaining symbols and conventions
- Follow industry standards for your diagram type

### Parts Management

- Create a standardized naming convention for parts
- Keep your parts database organized
- Use descriptive tags that reflect part function
- Include detailed descriptions for better documentation

### Exporting and Sharing

- Choose the appropriate export format for your needs
- Set proper resolution for image exports
- Use PDF for documents that will be printed
- Include the BOM when sharing with colleagues

---

Thank you for choosing CtrlSketch Pro. We hope this manual helps you create professional technical diagrams with ease. For additional support, visit our website or contact our support team.