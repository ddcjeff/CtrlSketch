# Shape Library and BOM Implementation

This document outlines the implementation of the Shape Library and Bill of Materials (BOM) features in CtrlSketch Beta1. It serves as a reference for the current state of implementation and future development plans.

## Table of Contents

1. [Shape Library](#shape-library)
   - [Core Functionality](#core-functionality)
   - [Import/Export Features](#importexport-features)
   - [Part Properties Integration](#part-properties-integration)
2. [Bill of Materials (BOM)](#bill-of-materials-bom)
   - [BOM Generator Component](#bom-generator-component)
   - [CSV Export](#csv-export)
3. [Parts Plus Integration](#parts-plus-integration)
   - [Current Status](#current-status)
   - [Planned Features](#planned-features)
4. [Implementation Details](#implementation-details)
   - [Component Structure](#component-structure)
   - [Data Flow](#data-flow)
5. [Future Enhancements](#future-enhancements)

## Shape Library

### Core Functionality

The Shape Library provides a centralized repository for storing and organizing reusable shapes. Key features include:

- **Library Management**: Create, rename, and delete libraries to organize shapes by category
- **Shape Organization**: Drag-and-drop interface for managing shapes within libraries
- **Search Functionality**: Filter shapes by name or description
- **Thumbnail Previews**: Visual representation of each shape in the library
- **Drag-and-Drop Canvas Integration**: Easily add shapes to the canvas by dragging from the library

### Import/Export Features

The library supports importing and exporting shapes in various formats:

- **Image Import**: Support for PNG, JPG, JPEG formats
- **SVG Import**: Direct import of SVG files with preserved vector data
- **JSON Import**: Comprehensive support for importing shapes from JSON files, including:
  - Single shape objects
  - Arrays of shapes
  - Complete library exports (with libraries and shapes)
- **Library Export**: Export the current library or all libraries to JSON format
- **Validation and Normalization**: Robust handling of various shape formats during import

### Part Properties Integration

Each shape in the library can have associated part properties:

- **Property Fields**:
  - Part Name
  - Haystack Tag
  - Part Number
  - Quantity
  - Description
  - Point Type (AI, BI, AO, BO, UI, UO)
  - PDF Cut Sheet Path
- **Visual Indicators**: Shapes with part properties are marked with a blue dot
- **Property Editing**: Dialog for editing part properties
- **Property Inheritance**: When dragging a shape to the canvas, its properties are preserved

## Bill of Materials (BOM)

### BOM Generator Component

The BOM Generator creates a comprehensive list of parts used in the project:

- **Page Filtering**: Generate BOMs for the current page or all pages
- **Customizable Columns**: Toggle visibility of part numbers, quantities, Haystack tags, and point types
- **Aggregation**: Parts with the same part number are combined with quantities summed
- **Summary Statistics**: Display total parts and unique parts count
- **Draggable Interface**: Flexible positioning of the BOM panel

### CSV Export

The BOM can be exported as a CSV file for use in other applications:

- **Customizable Export**: Only selected columns are included in the export
- **Proper Formatting**: CSV follows standard format with proper escaping of special characters
- **Naming Convention**: Exported files include the page name for easy identification

## Parts Plus Integration

### Current Status

The foundation for Parts Plus integration has been laid:

- **Part Properties Structure**: The data structure for part properties is in place
- **BOM Generation**: Basic BOM generation from part properties is implemented
- **CSV Export**: Export functionality for the BOM is ready

### Planned Features

The following features are planned for the Parts Plus integration:

- **Parts Database Connection**: Integration with Supabase or CSV-based parts database
- **Parts Browser**: Interface for searching and selecting parts from the database
- **Automatic Property Population**: Auto-fill part properties from the database
- **Two-way Synchronization**: Keep shapes and database parts in sync
- **Enhanced BOM**: Include additional part information from the database

## Implementation Details

### Component Structure

The implementation consists of the following key components:

- **ShapeLibrary.vue**: Main component for the shape library interface
- **PartPropertiesDialog.vue**: Dialog for editing part properties
- **BOMGenerator.vue**: Component for generating and exporting BOMs

### Data Flow

The data flow between components is as follows:

1. **Shape Library → Canvas**: Shapes are dragged from the library to the canvas
2. **Canvas → Part Properties**: When a shape with part properties is added, the properties are applied
3. **Canvas → BOM Generator**: The BOM generator collects shapes with part properties from the canvas
4. **BOM Generator → CSV**: The BOM data is exported as a CSV file

## Future Enhancements

Planned enhancements for future development:

- **Visio Format Support**: Add support for importing Visio .vss/.vssx files
- **Parts Database Integration**: Connect to the Parts Plus database
- **Advanced BOM Features**: Add filtering, sorting, and grouping options
- **PDF Export**: Export the BOM as a formatted PDF
- **Batch Operations**: Apply part properties to multiple shapes at once
- **Version Control**: Track changes to the shape library and BOM
- **Cloud Synchronization**: Share libraries and BOMs across devices