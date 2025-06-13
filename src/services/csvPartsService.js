/**
 * Service for loading parts data from a local CSV file
 */

// Helper function to parse CSV data
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(header => header.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines
    
    // Handle quoted values with commas inside them
    let row = [];
    let inQuote = false;
    let currentValue = '';
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        row.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Add the last value
    row.push(currentValue.trim());
    
    // If simple splitting didn't work, fall back to regular split
    if (row.length !== headers.length) {
      row = lines[i].split(',');
    }
    
    const entry = {};
    
    for (let j = 0; j < headers.length && j < row.length; j++) {
      let value = row[j] ? row[j].trim() : '';
      
      // Remove quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      
      entry[headers[j]] = value;
    }
    
    // Map Haystack CSV fields to the expected format
    const mappedEntry = {
      ItemNumber: entry.item_id || '',
      PartNumber: entry.part_number || '',
      Manufacturer: entry.manufacturer || '',
      Supplier: entry.brand || '',
      Class: entry.category || '',
      SubClass: entry.type || '',
      Description: entry.description || '',
      ProductCut: entry.cut_sheet || '',
      HaystackTag: entry.haystack || '',
      ImageUrl: entry.image_url || ''
    };
    
    // If no image URL is provided but part number exists, try to generate one
    if (!mappedEntry.ImageUrl && mappedEntry.PartNumber) {
      // Try to find an image based on part number
      const partNumber = mappedEntry.PartNumber.replace(/[\/\\:*?"<>|]/g, '-');
      mappedEntry.ImageUrl = `/images/parts/${partNumber}.jpg`;
    }
    
    data.push(mappedEntry);
  }
  
  return data;
}

export const csvPartsService = {
  /**
   * Load parts data from a CSV file
   * @param {string} csvPath - Path to the CSV file
   * @returns {Promise<Array>} Array of parts
   */
  async loadFromCSV(csvPath = '/data/PartList_Haystack.csv') {
    try {
      console.log('Loading CSV from path:', csvPath);
      const response = await fetch(csvPath);
      if (!response.ok) {
        console.error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log('CSV text loaded, length:', csvText.length);
      console.log('First 100 chars:', csvText.substring(0, 100));
      
      const parsedData = parseCSV(csvText);
      console.log('Parsed CSV data, count:', parsedData.length);
      if (parsedData.length > 0) {
        console.log('First item:', JSON.stringify(parsedData[0]));
      }
      
      return parsedData;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      // Return sample data as fallback
      return [
        {
          ItemNumber: '98950',
          PartNumber: 'F-1200',
          Manufacturer: 'ONICON',
          Supplier: 'ALPS',
          Class: 'FLOW',
          SubClass: 'SINGLE TURBINE',
          Description: 'Turbine flow meter for chilled water systems',
          ProductCut: 'C:\\Work\\CutSheets\\F-1200-Catalog-Sheet.pdf',
          HaystackTag: '{id:98950, flow:true, sensor:true}'
        },
        {
          ItemNumber: '98951',
          PartNumber: 'VG1240+843',
          Manufacturer: 'Johnson Controls',
          Supplier: 'National Supply',
          Class: 'VALVE',
          SubClass: '2-WAY CONTROL',
          Description: '2-Way control valve 1/2"',
          ProductCut: '',
          HaystackTag: '{id:98951, valve:true, water:true}'
        }
      ];
    }
  }
};

export default csvPartsService;