<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-4 w-[800px] max-h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-white text-lg font-medium">Select a Part</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
      </div>
      
      <!-- Search and filters -->
      <div class="flex gap-2 mb-4">
        <div class="flex-1">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search parts..." 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          />
        </div>
        
        <div class="w-48">
          <select 
            v-model="selectedCategory" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          >
            <option value="">All Categories</option>
            <option v-for="(category, index) in categories" :key="'cat-' + index" :value="category">{{ category }}</option>
          </select>
        </div>
        
        <div class="w-48">
          <select 
            v-model="selectedType" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
            :disabled="!selectedCategory"
          >
            <option value="">All Types</option>
            <option v-for="(type, index) in types" :key="'type-' + index" :value="type">{{ type }}</option>
          </select>
        </div>
      </div>
      
      <!-- Parts table -->
      <div class="flex-1 overflow-y-auto mb-4">
        <table class="min-w-full bg-gray-900 text-gray-300 border border-gray-700 rounded-md">
          <thead class="sticky top-0 bg-gray-800">
            <tr>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Part Number
              </th>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Category
              </th>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Type
              </th>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Description
              </th>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="py-4 px-3 text-center text-gray-500">
                Loading parts...
              </td>
            </tr>
            <tr v-else-if="filteredParts.length === 0">
              <td colspan="5" class="py-4 px-3 text-center text-gray-500">
                No parts found matching your criteria.
              </td>
            </tr>
            <tr 
              v-for="(part, index) in filteredParts" 
              :key="index" 
              class="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
              @click="selectPart(part)"
            >
              <td class="py-2 px-3 text-sm">{{ part.partNumber }}</td>
              <td class="py-2 px-3 text-sm">{{ part.category }}</td>
              <td class="py-2 px-3 text-sm">{{ part.type }}</td>
              <td class="py-2 px-3 text-sm">{{ part.description }}</td>
              <td class="py-2 px-3 text-sm">
                <button 
                  @click.stop="selectPart(part)" 
                  class="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                >
                  Select
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Selected part preview -->
      <div v-if="selectedPart" class="border border-gray-700 rounded-md p-3 mb-4 bg-gray-900">
        <h4 class="text-white font-medium mb-2">Selected Part</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-400">Part Number:</span> 
            <span class="text-white">{{ selectedPart.partNumber }}</span>
          </div>
          <div>
            <span class="text-gray-400">Manufacturer:</span> 
            <span class="text-white">{{ selectedPart.manufacturer }}</span>
          </div>
          <div>
            <span class="text-gray-400">Category:</span> 
            <span class="text-white">{{ selectedPart.category }}</span>
          </div>
          <div>
            <span class="text-gray-400">Type:</span> 
            <span class="text-white">{{ selectedPart.type }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-400">Description:</span> 
            <span class="text-white">{{ selectedPart.description }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-400">Haystack Tags:</span> 
            <span class="text-white">{{ selectedPart.haystackTag }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button @click="$emit('close')" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
          Cancel
        </button>
        <button 
          @click="confirmSelection" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          :disabled="!selectedPart"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { loadPartsFromDatabase, getPartCategories, getPartTypes } from '../utils/makeShapePart';

export default {
  name: 'PartSelector',
  data() {
    return {
      loading: true,
      parts: [],
      categories: [],
      types: [],
      searchQuery: '',
      selectedCategory: '',
      selectedType: '',
      selectedPart: null
    };
  },
  computed: {
    filteredParts() {
      let result = [...this.parts];
      
      // Apply category filter
      if (this.selectedCategory) {
        result = result.filter(part => part.category === this.selectedCategory);
      }
      
      // Apply type filter
      if (this.selectedType) {
        result = result.filter(part => part.type === this.selectedType);
      }
      
      // Apply search query
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(part => 
          part.partNumber.toLowerCase().includes(query) ||
          part.description.toLowerCase().includes(query) ||
          part.manufacturer.toLowerCase().includes(query)
        );
      }
      
      return result;
    }
  },
  async mounted() {
    try {
      // Load categories
      this.categories = await getPartCategories();
      
      // Load all parts
      this.parts = await loadPartsFromDatabase();
      
      this.loading = false;
    } catch (error) {
      console.error('Error loading part data:', error);
      this.loading = false;
    }
  },
  watch: {
    async selectedCategory(newCategory) {
      if (newCategory) {
        this.types = await getPartTypes(newCategory);
        this.selectedType = '';
      } else {
        this.types = [];
        this.selectedType = '';
      }
    }
  },
  methods: {
    selectPart(part) {
      this.selectedPart = part;
    },
    confirmSelection() {
      if (this.selectedPart) {
        // Convert to part properties format
        const partProperties = {
          name: this.selectedPart.description || this.selectedPart.partNumber,
          partNumber: this.selectedPart.partNumber,
          haystackTag: this.selectedPart.haystackTag,
          quantity: 1,
          description: this.selectedPart.description,
          pointType: '',
          pdfPath: this.selectedPart.pdfPath || ''
        };
        
        this.$emit('select', partProperties);
      }
    }
  }
};
</script>