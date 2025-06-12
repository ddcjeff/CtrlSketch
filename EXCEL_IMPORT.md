# Excel Import Functionality

This guide explains how to use the Excel import feature in CtrlSketch.

## Importing Excel Tables

1. Click on the "Insert" tab in the ribbon menu
2. Click on the "Excel Table" button
3. Select an Excel (.xlsx) file from your computer
4. The Excel table will be added to your canvas

## Working with Excel Tables

Once you've added an Excel table to your canvas, you can:

- **Move** the table by selecting it and dragging
- **Resize** the table by dragging the handles
- **Edit** the table data by double-clicking on it
- **Export** the table data back to Excel using the export button in the table header

## Excel Table Features

The Excel table component provides several features:

- **Sheet Selection**: If your Excel file has multiple sheets, you can select which one to display
- **Editing**: Double-click to open the editor where you can modify cells, add rows and columns
- **Formatting**: Basic formatting is preserved from the original Excel file
- **Export**: Export the table back to Excel with your changes

## Troubleshooting

If you encounter issues with Excel tables:

1. Make sure your Excel file is in .xlsx format
2. Check that the file isn't password protected
3. If the table appears blank, try clicking on it and using the sheet selector
4. For very large Excel files, consider splitting them into smaller files for better performance

## Technical Details

The Excel import functionality uses the SheetJS library to parse Excel files. The data is rendered as an HTML table within a special shape type on the canvas.