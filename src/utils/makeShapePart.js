// makeShapePart.js
// Utility to promote a shape to a part with BOM properties

import { useBomStore } from '../../Haystack/bomStore';

/**
 * Promotes a shape to a part by adding part properties
 * @param {Object} shape - The shape object to promote
 * @param {Object} partProperties - Optional initial part properties
 * @returns {Object} - The updated shape with part properties
 */
export function makeShapePart(shape, partProperties = null) {
  if (!shape) {
    console.error('Cannot make a part: No shape provided');
    return null;
  }

  console.log('Making shape a part:', shape.id);

  // Initialize default part properties if none provided
  const defaultProperties = {
    name: shape.name || 'Unnamed Part',
    haystackTag: '',
    partNumber: '',
    quantity: 1,
    description: '',
    pointType: '',
    pdfPath: ''
  };

  // Use provided properties or defaults
  const properties = partProperties || defaultProperties;

  // Update the shape with part properties
  shape.partProperties = { ...properties };

  // Add to BOM store
  const bomStore = useBomStore();
  bomStore.addPart({
    id: shape.id,
    pageId: shape.pageId,
    ...shape.partProperties
  });

  console.log('Shape promoted to part:', shape);
  return shape;
}

/**
 * Loads part data from the CSV database and returns matching parts
 * @param {Object} filters - Optional filters to apply (category, type, etc.)
 * @returns {Promise<Array>} - Array of matching parts
 */
export async function loadPartsFromDatabase(filters = {}) {
  try {
    // In a real implementation, this would fetch from an API
    // For now, we'll use a simple fetch to the CSV file
    const response = await fetch('/Haystack/PartList_Haystack.csv');
    const csvText = await response.text();
    
    // Parse CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    
    const parts = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const part = {};
      
      headers.forEach((header, index) => {
        part[header.trim()] = values[index]?.trim() || '';
      });
      
      // Parse haystack tags
      try {
        if (part.haystack && part.haystack.trim()) {
          // Handle different formats of haystack tags
          let haystackStr = part.haystack.trim();
          
          // Try to normalize the format
          if (haystackStr.startsWith('{') && haystackStr.endsWith('}')) {
            // Replace single quotes with double quotes for JSON parsing
            haystackStr = haystackStr.replace(/'/g, '"');
            
            // Handle unquoted keys (common in Haystack)
            haystackStr = haystackStr.replace(/(\w+):/g, '"$1":');
            
            try {
              part.haystackObj = JSON.parse(haystackStr);
            } catch (jsonError) {
              // If JSON parsing fails, create a simple object with the raw string
              part.haystackObj = { raw: part.haystack };
            }
          } else {
            // If not in object format, store as a simple tag
            part.haystackObj = { tag: part.haystack };
          }
        } else {
          part.haystackObj = {};
        }
      } catch (e) {
        console.warn('Error parsing haystack tags for part:', part.part_number, '- Using empty object');
        part.haystackObj = {};
      }
      
      // Apply filters
      let matchesFilters = true;
      Object.entries(filters).forEach(([key, value]) => {
        if (value && part[key] && !part[key].toLowerCase().includes(value.toLowerCase())) {
          matchesFilters = false;
        }
        
        // Special case for haystack tags
        if (key === 'haystackTag' && value && part.haystackObj) {
          // Check if the value exists in any of the haystack object keys or values
          const haystack = part.haystackObj;
          const searchValue = value.toLowerCase();
          
          // Check in keys
          const keyExists = Object.keys(haystack).some(tag => 
            tag.toLowerCase().includes(searchValue)
          );
          
          // Check in values
          const valueExists = Object.values(haystack).some(val => 
            typeof val === 'string' && val.toLowerCase().includes(searchValue)
          );
          
          // Check in raw haystack string
          const rawExists = part.haystack.toLowerCase().includes(searchValue);
          
          if (!(keyExists || valueExists || rawExists)) {
            matchesFilters = false;
          }
        }
      });
      
      if (matchesFilters) {
        parts.push({
          id: part.item_id || `part-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: part.description || part.part_number,
          partNumber: part.part_number,
          manufacturer: part.manufacturer,
          category: part.category,
          type: part.type,
          description: part.description,
          haystackTag: part.haystack,
          pdfPath: part.cut_sheet
        });
      }
    }
    
    return parts;
  } catch (error) {
    console.error('Error loading parts from database:', error);
    return [];
  }
}

/**
 * Gets unique categories from the parts database
 * @returns {Promise<Array>} - Array of unique categories
 */
export async function getPartCategories() {
  try {
    const parts = await loadPartsFromDatabase();
    const categories = [...new Set(parts.map(part => part.category))].filter(Boolean);
    return categories.sort();
  } catch (error) {
    console.error('Error getting part categories:', error);
    return [];
  }
}

/**
 * Gets unique types for a specific category
 * @param {string} category - The category to filter by
 * @returns {Promise<Array>} - Array of unique types for the category
 */
export async function getPartTypes(category) {
  try {
    const parts = await loadPartsFromDatabase({ category });
    const types = [...new Set(parts.map(part => part.type))].filter(Boolean);
    return types.sort();
  } catch (error) {
    console.error('Error getting part types:', error);
    return [];
  }
}