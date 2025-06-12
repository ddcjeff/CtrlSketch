import supabase from './supabase';

/**
 * Service for handling parts data from Supabase
 */
export const partsService = {
  /**
   * Fetch all parts from the database
   * @returns {Promise<Array>} Array of parts
   */
  async getAllParts() {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*');
      
      if (error) {
        console.error('Error fetching parts:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllParts:', error);
      return [];
    }
  },
  
  /**
   * Fetch parts with filters
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Filtered array of parts
   */
  async getFilteredParts(filters = {}) {
    try {
      let query = supabase
        .from('parts')
        .select('*');
      
      // Apply filters
      if (filters.manufacturer) {
        query = query.eq('Manufacturer', filters.manufacturer);
      }
      
      if (filters.category) {
        query = query.eq('Class', filters.category);
      }
      
      if (filters.subClass) {
        query = query.eq('SubClass', filters.subClass);
      }
      
      if (filters.search) {
        query = query.or(`Description.ilike.%${filters.search}%,PartNumber.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching filtered parts:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getFilteredParts:', error);
      return [];
    }
  },
  
  /**
   * Get unique values for a specific column
   * @param {string} column - Column name
   * @returns {Promise<Array>} Array of unique values
   */
  async getUniqueValues(column) {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(column)
        .order(column);
      
      if (error) {
        console.error(`Error fetching unique ${column}:`, error);
        throw error;
      }
      
      // Extract unique values
      const uniqueValues = [...new Set(data.map(item => item[column]))].filter(Boolean);
      return uniqueValues;
    } catch (error) {
      console.error(`Error in getUniqueValues for ${column}:`, error);
      return [];
    }
  }
};

export default partsService;