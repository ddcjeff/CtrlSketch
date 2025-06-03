// PartsImporter.js
// A tool to import parts data from CSV files

function parseCSV(csvText) {
  // Simple CSV parser that handles quoted values and commas within quotes
  const rows = [];
  let currentRow = [];
  let currentValue = '';
  let insideQuotes = false;
  
  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Double quotes inside quotes - add a single quote to the value
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quotes mode
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of value
      currentRow.push(currentValue.trim());
      currentValue = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      // End of row
      if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue.trim());
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      }
      // Skip \r\n combinations
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
    } else {
      // Add to current value
      currentValue += char;
    }
  }
  
  // Handle last value and row
  if (currentValue || currentRow.length > 0) {
    currentRow.push(currentValue.trim());
    rows.push(currentRow);
  }
  
  return rows;
}

function convertCSVToPartObjects(csvData) {
  if (!csvData || csvData.length < 2) {
    throw new Error('CSV data must have a header row and at least one data row');
  }
  
  // Extract header row
  const headers = csvData[0];
  
  // Convert remaining rows to objects
  const parts = [];
  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i];
    if (row.length < headers.length) continue; // Skip invalid rows
    
    const part = {};
    for (let j = 0; j < headers.length; j++) {
      part[headers[j]] = row[j];
    }
    parts.push(part);
  }
  
  return parts;
}

function mapToPredefinedSchema(parts) {
  // Map to the expected schema in PartsPlus
  return parts.map(part => {
    const mappedPart = {
      ItemNumber: part.ItemNumber || part.Item_Number || part.ID || '',
      PartNumber: part.PartNumber || part.Part_Number || part.Part || '',
      Manufacturer: part.Manufacturer || part.Brand || '',
      Supplier: part.Supplier || part.Vendor || '',
      Class: part.Class || part.Category || '',
      SubClass: part.SubClass || part.Sub_Class || part.Subcategory || '',
      ListPrice: part.ListPrice || part.List_Price || part.Price || '0',
      Discount: part.Discount || '0',
      CostPrice: part.CostPrice || part.Cost_Price || part.Cost || '0',
      Description: part.Description || part.Desc || '',
      ProductCut: part.ProductCut || part.Product_Cut || part.Datasheet || ''
    };
    
    // If ItemNumber is missing, generate a random one
    if (!mappedPart.ItemNumber) {
      mappedPart.ItemNumber = Math.floor(Math.random() * 100000).toString();
    }
    
    return mappedPart;
  });
}

function PartsImporter() {
  // Create UI for the importer
  const importerContainer = document.createElement('div');
  importerContainer.className = 'parts-importer';
  importerContainer.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    background-color: white;
    border: 1px solid #ccc;
    padding: 20px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    z-index: 1000;
  `;
  
  // Create header
  const header = document.createElement('h2');
  header.textContent = 'Import Parts from CSV';
  header.style.margin = '0 0 20px 0';
  
  // Create tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.style.cssText = `
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #ccc;
  `;
  
  const fileTab = document.createElement('div');
  fileTab.textContent = 'Upload CSV File';
  fileTab.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
    background-color: #f0f0f0;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    margin-right: 5px;
  `;
  
  const pasteTab = document.createElement('div');
  pasteTab.textContent = 'Paste CSV Data';
  pasteTab.style.cssText = `
    padding: 10px 15px;
    cursor: pointer;
    background-color: #e0e0e0;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  `;
  
  tabsContainer.appendChild(fileTab);
  tabsContainer.appendChild(pasteTab);
  
  // Create file input section
  const fileSection = document.createElement('div');
  
  // Create file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.csv';
  fileInput.style.marginBottom = '20px';
  fileInput.style.display = 'block';
  
  fileSection.appendChild(fileInput);
  
  // Create paste input section
  const pasteSection = document.createElement('div');
  pasteSection.style.display = 'none';
  
  // Create paste textarea
  const pasteTextarea = document.createElement('textarea');
  pasteTextarea.placeholder = 'Paste your CSV data here. Include headers in the first row.';
  pasteTextarea.style.cssText = `
    width: 100%;
    height: 150px;
    margin-bottom: 20px;
    padding: 10px;
    font-family: monospace;
    border: 1px solid #ccc;
    border-radius: 4px;
  `;
  
  const pasteHint = document.createElement('div');
  pasteHint.innerHTML = 'Example format:<br><code>ItemNumber,PartNumber,Manufacturer,Class,SubClass,ListPrice<br>1001,ABC123,Honeywell,VALVE,CONTROL,150.00</code>';
  pasteHint.style.cssText = `
    font-size: 12px;
    color: #666;
    margin-bottom: 10px;
    background: #f9f9f9;
    padding: 10px;
    border-radius: 4px;
    border-left: 3px solid #2196F3;
  `;
  
  const processPasteButton = document.createElement('button');
  processPasteButton.textContent = 'Process Pasted Data';
  processPasteButton.style.cssText = `
    padding: 8px 16px;
    background-color: #2196F3;
    color: white;
    border: none;
    cursor: pointer;
    margin-bottom: 20px;
    border-radius: 4px;
  `;
  
  pasteSection.appendChild(pasteHint);
  pasteSection.appendChild(pasteTextarea);
  pasteSection.appendChild(processPasteButton);
  
  // Create preview area
  const previewArea = document.createElement('div');
  previewArea.style.cssText = `
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #eee;
    padding: 10px;
    margin-bottom: 20px;
    display: none;
  `;
  
  // Create buttons container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.justifyContent = 'space-between';
  
  // Create import button
  const importButton = document.createElement('button');
  importButton.textContent = 'Import';
  importButton.disabled = true;
  importButton.style.cssText = `
    padding: 8px 16px;
    background-color: #4CAF50;
    color: white;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    border-radius: 4px;
  `;
  
  // Create cancel button
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.style.cssText = `
    padding: 8px 16px;
    background-color: #f44336;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 4px;
  `;
  
  // Add status text
  const statusText = document.createElement('div');
  statusText.style.marginTop = '10px';
  statusText.style.color = '#666';
  
  // Add elements to container
  importerContainer.appendChild(header);
  importerContainer.appendChild(tabsContainer);
  importerContainer.appendChild(fileSection);
  importerContainer.appendChild(pasteSection);
  importerContainer.appendChild(previewArea);
  buttonsContainer.appendChild(cancelButton);
  buttonsContainer.appendChild(importButton);
  importerContainer.appendChild(buttonsContainer);
  importerContainer.appendChild(statusText);
  
  // Store parsed parts
  let parsedParts = [];
  
  // Tab switching
  fileTab.addEventListener('click', function() {
    fileTab.style.backgroundColor = '#f0f0f0';
    pasteTab.style.backgroundColor = '#e0e0e0';
    fileSection.style.display = 'block';
    pasteSection.style.display = 'none';
  });
  
  pasteTab.addEventListener('click', function() {
    fileTab.style.backgroundColor = '#e0e0e0';
    pasteTab.style.backgroundColor = '#f0f0f0';
    fileSection.style.display = 'none';
    pasteSection.style.display = 'block';
  });
  
  // Function to process CSV data and show preview
  const processCSVData = (csvText) => {
    try {
      console.log("Processing CSV data:", csvText.substring(0, 100) + "...");
      
      // Parse the CSV data
      const csvData = parseCSV(csvText);
      console.log("Parsed CSV rows:", csvData.length);
      
      if (csvData.length < 2) {
        throw new Error("CSV data must have a header row and at least one data row");
      }
      
      // Convert to objects and map to schema
      parsedParts = mapToPredefinedSchema(convertCSVToPartObjects(csvData));
      console.log("Processed parts:", parsedParts.length);
      
      // Show preview
      previewArea.style.display = 'block';
      previewArea.innerHTML = `
        <strong>Found ${parsedParts.length} parts in the CSV data.</strong><br>
        <table style="width:100%; border-collapse: collapse; margin-top: 10px;">
          <tr>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">ItemNumber</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">PartNumber</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">Manufacturer</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">Class</th>
            <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 4px;">SubClass</th>
          </tr>
          ${parsedParts.slice(0, 5).map(part => `
            <tr>
              <td style="border-bottom: 1px solid #eee; padding: 4px;">${part.ItemNumber || '-'}</td>
              <td style="border-bottom: 1px solid #eee; padding: 4px;">${part.PartNumber || '-'}</td>
              <td style="border-bottom: 1px solid #eee; padding: 4px;">${part.Manufacturer || '-'}</td>
              <td style="border-bottom: 1px solid #eee; padding: 4px;">${part.Class || '-'}</td>
              <td style="border-bottom: 1px solid #eee; padding: 4px;">${part.SubClass || '-'}</td>
            </tr>
          `).join('')}
        </table>
        ${parsedParts.length > 5 ? `<div style="margin-top: 10px;">(Showing 5 of ${parsedParts.length} parts)</div>` : ''}
      `;
      
      // Enable import button
      importButton.disabled = false;
      importButton.style.opacity = '1';
      
      statusText.textContent = 'CSV data processed successfully. Click Import to load parts.';
      statusText.style.color = 'green';
      
      return true;
    } catch (error) {
      console.error("Error processing CSV data:", error);
      statusText.textContent = `Error processing CSV data: ${error.message}`;
      statusText.style.color = 'red';
      previewArea.style.display = 'none';
      importButton.disabled = true;
      importButton.style.opacity = '0.6';
      
      return false;
    }
  };
  
  // Handle Paste button click
  processPasteButton.addEventListener('click', function() {
    const csvText = pasteTextarea.value.trim();
    if (!csvText) {
      statusText.textContent = 'Please paste CSV data first.';
      statusText.style.color = 'red';
      return;
    }
    
    processCSVData(csvText);
  });
  
  // Handle paste in textarea (auto-detect ctrl+v)
  pasteTextarea.addEventListener('paste', function(event) {
    // We don't process immediately to allow the paste to complete
    setTimeout(() => {
      statusText.textContent = 'CSV data pasted. Click "Process Pasted Data" to process.';
      statusText.style.color = '#666';
    }, 100);
  });
  
  // Handle file selection
  fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if it's a CSV file
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      statusText.textContent = 'Please select a CSV file.';
      statusText.style.color = 'red';
      return;
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = function(e) {
      const csvText = e.target.result;
      processCSVData(csvText);
    };
    reader.readAsText(file);
  });
  
  // Handle import button click
  importButton.addEventListener('click', function() {
    if (parsedParts.length === 0) return;
    
    try {
      // Find PartsPlus component instance
      const partsPlus = window.partsPlus;
      if (!partsPlus) {
        statusText.textContent = 'PartsPlus component not found. Make sure it is initialized first.';
        statusText.style.color = 'red';
        return;
      }
      
      // Update parts in PartsPlus
      partsPlus.updateParts(parsedParts);
      
      statusText.textContent = `Successfully imported ${parsedParts.length} parts.`;
      statusText.style.color = 'green';
      
      // Close importer after 2 seconds
      setTimeout(() => {
        document.body.removeChild(importerContainer);
      }, 2000);
    } catch (error) {
      statusText.textContent = `Error importing parts: ${error.message}`;
      statusText.style.color = 'red';
    }
  });
  
  // Handle cancel button click
  cancelButton.addEventListener('click', function() {
    document.body.removeChild(importerContainer);
  });
  
  // Add to document
  document.body.appendChild(importerContainer);
}

// Create global reference for easier accessibility
window.PartsImporter = PartsImporter;