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
  async loadFromCSV(csvPath = '/data/parts.csv') {
    try {
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV file: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      return parseCSV(csvText);
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
    }
  }
};

export default csvPartsService;