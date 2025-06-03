# CtrlSketch Multi-Page Functionality

## Overview

The multi-page functionality in CtrlSketch allows users to create and manage multiple pages within a single document. This feature is particularly useful for complex drawings that need to be organized into separate views or layers, while maintaining relationships between them.

## Key Features

- Create multiple pages with different content
- Designate pages as foreground or background
- Display background pages behind foreground pages
- Easily navigate between pages using tabs
- Manage pages (add, delete, rename, arrange)

## Page Types

### Foreground Pages
- Standard pages that contain visible content
- Can have an optional background page displayed behind them
- Ideal for main drawing content

### Background Pages
- Special pages that can be displayed behind foreground pages
- Useful for common elements that should appear across multiple pages
- Perfect for templates, grids, or reference elements

## Using Multi-Page Functionality

### Creating Pages

There are two ways to create a new page:

1. **Using the Insert Menu:**
   - Click on the "Insert" tab in the ribbon
   - Click the "Page" button
   - Fill in the page details in the dialog that appears

2. **Using the Tab Bar:**
   - Click the "+" button at the end of the tab bar
   - Fill in the page details in the dialog that appears

### Page Dialog Options

When creating a new page, you can specify:

- **Page Name:** A descriptive name for the page
- **Page Type:** Choose between "Foreground" or "Background"
- **Background Page:** (For foreground pages only) Select a background page to display behind this page
- **Description:** Add notes or details about the page's purpose
- **Drawing Type:** Select a specialized drawing mode (Default, Schematic, or Layout)

### Managing Pages

Right-click on any page tab to access the context menu with these options:

- **Rename:** Change the page name
- **Set as Background/Foreground:** Toggle the page type
- **Duplicate:** Create a copy of the page with all its content
- **Delete:** Remove the page (not available if it's the last page)

### Tab Navigation

- Click on any folder tab to switch to that page
- All tabs are displayed in a scrollable bar at the bottom of the canvas
- Tabs are styled like folder tabs for easy identification
- Background pages are marked with a "BG" indicator

## Technical Implementation

The multi-page system consists of three main components:

1. **PageManager.vue:** Manages the overall page system, including the tab interface and context menus
2. **AddPageDialog.vue:** Provides the interface for creating and editing pages
3. **App.vue integration:** Connects the page system with the main application state

## Best Practices

### Organizing Your Document

- Use meaningful page names that describe the content
- Create background pages for elements that need to appear on multiple pages
- Group related content on the same page

### Working with Background Pages

- Place common elements like borders, title blocks, or reference grids on background pages
- Remember that changes to background pages affect all foreground pages using them
- Background pages cannot use other background pages

### Performance Considerations

- Complex documents with many pages may require more system resources
- Consider splitting very large projects into separate files

## Keyboard Shortcuts

- **Tab Navigation:** Use Ctrl+Page Up/Page Down to move between pages (when implemented)
- **Context Menu:** Right-click on any tab to access page management options

## Troubleshooting

### Common Issues

- **Cannot delete a background page:** Background pages that are used by foreground pages cannot be deleted or changed to foreground type until all references are removed
- **Missing content after switching pages:** Make sure your work is saved to the current page before switching

## Future Enhancements

Planned improvements to the multi-page system include:

- Drag-and-drop tab reordering
- Page thumbnails in the tab bar
- Page groups for better organization
- Import/export of individual pages
- Page-specific settings and properties

---

*This documentation is part of the CtrlSketch application. For more information, see the complete User Guide.*