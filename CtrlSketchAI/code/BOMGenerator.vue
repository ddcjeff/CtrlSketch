<template>
  <div class="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden" 
       :style="{ left: position.x + 'px', top: position.y + 'px', width: '600px' }"
       ref="bomPanel">
    <div class="flex justify-between items-center p-2 bg-gray-900 cursor-move"
         @mousedown.stop="startDrag">
      <div class="text-gray-400 font-medium text-xs uppercase tracking-wider">Bill of Materials</div>
      <div class="flex items-center">
        <button @click="exportBOM" class="text-gray-400 hover:text-white text-sm mr-2">
          <span class="mr-1">📥</span> Export
        </button>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
      </div>
    </div>
    
    <div class="p-3">
      <!-- BOM Settings -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-white font-medium">BOM Settings</h3>
          <div class="flex items-center">
            <label class="text-gray-400 text-sm mr-2">Page:</label>
            <select 
              v-model="selectedPageId" 
              class="bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1"
            >
              <option value="all">All Pages</option>
              <option v-for="page in pages" :key="page.id" :value="page.id">{{ page.name }}</option>
            </select>
          </div>
        </div>
        
        <div class="flex gap-2 mb-2">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includePartNumbers" 
              v-model="includePartNumbers"
              class="mr-1"
            />
            <label for="includePartNumbers" class="text-gray-300 text-sm">Part Numbers</label>
          </div>
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includeQuantities" 
              v-model="includeQuantities"
              class="mr-1"
            />
            <label for="includeQuantities" class="text-gray-300 text-sm">Quantities</label>
          </div>
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includeHaystackTags" 
              v-model="includeHaystackTags"
              class="mr-1"
            />
            <label for="includeHaystackTags" class="text-gray-300 text-sm">Haystack Tags</label>
          </div>
          <div class="flex items-center">
            <input 
              type="checkbox" 
              id="includePointTypes" 
              v-model="includePointTypes"
              class="mr-1"
            />
            <label for="includePointTypes" class="text-gray-300 text-sm">Point Types</label>
          </div>
        </div>
      </div>
      
      <!-- BOM Table -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-gray-900 text-gray-300 border border-gray-700 rounded-md">
          <thead>
            <tr class="bg-gray-800">
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Part Name
              </th>
              <th v-if="includePartNumbers" class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Part Number
              </th>
              <th v-if="includeQuantities" class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Quantity
              </th>
              <th v-if="includeHaystackTags" class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Haystack Tag
              </th>
              <th v-if="includePointTypes" class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Point Type
              </th>
              <th class="py-2 px-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bomItems.length === 0">
              <td :colspan="getColumnCount()" class="py-4 px-3 text-center text-gray-500">
                No parts found. Add shapes with part properties to generate a BOM.
              </td>
            </tr>
            <tr v-for="(item, index) in bomItems" :key="index" class="border-b border-gray-700 hover:bg-gray-800">
              <td class="py-2 px-3 text-sm">{{ item.name }}</td>
              <td v-if="includePartNumbers" class="py-2 px-3 text-sm">{{ item.partNumber }}</td>
              <td v-if="includeQuantities" class="py-2 px-3 text-sm">{{ item.quantity }}</td>
              <td v-if="includeHaystackTags" class="py-2 px-3 text-sm">{{ item.haystackTag }}</td>
              <td v-if="includePointTypes" class="py-2 px-3 text-sm">{{ item.pointType }}</td>
              <td class="py-2 px-3 text-sm">{{ item.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Summary -->
      <div class="mt-4 text-gray-300 text-sm">
        <div>Total Parts: {{ getTotalParts() }}</div>
        <div>Total Unique Parts: {{ bomItems.length }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BOMGenerator',
  props: {
    initialPosition: {
      type: Object,
      default: () => ({ x: 100, y: 100 })
    },
    pages: {
      type: Array,
      default: () => []
    },
    shapes: {
      type: Array,
      default: () => []
    },
    currentPageId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      position: this.initialPosition,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      
      // BOM settings
      selectedPageId: this.currentPageId || 'all',
      includePartNumbers: true,
      includeQuantities: true,
      includeHaystackTags: true,
      includePointTypes: true
    };
  },
  computed: {
    /**
     * Generate the BOM items based on the selected page and settings
     */
    bomItems() {
      // Get all shapes with part properties
      let shapesWithParts = [];
      
      if (this.selectedPageId === 'all') {
        // Get shapes from all pages
        shapesWithParts = this.shapes.filter(shape => shape.partProperties);
      } else {
        // Get shapes from the selected page
        const pageShapes = this.shapes.filter(shape => {
          // Check if the shape is on the selected page
          // This depends on your data structure - adjust as needed
          return shape.pageId === this.selectedPageId && shape.partProperties;
        });
        
        shapesWithParts = pageShapes;
      }
      
      // Group by part number and aggregate quantities
      const partMap = new Map();
      
      shapesWithParts.forEach(shape => {
        const partProps = shape.partProperties;
        const partKey = partProps.partNumber || partProps.name;
        
        if (partMap.has(partKey)) {
          // Update existing part
          const existingPart = partMap.get(partKey);
          existingPart.quantity += partProps.quantity || 1;
        } else {
          // Add new part
          partMap.set(partKey, {
            name: partProps.name || 'Unnamed Part',
            partNumber: partProps.partNumber || '',
            quantity: partProps.quantity || 1,
            haystackTag: partProps.haystackTag || '',
            pointType: partProps.pointType || '',
            description: partProps.description || '',
            pdfPath: partProps.pdfPath || ''
          });
        }
      });
      
      // Convert map to array
      return Array.from(partMap.values());
    }
  },
  methods: {
    /**
     * Get the total number of columns in the BOM table
     */
    getColumnCount() {
      let count = 2; // Name and Description are always included
      if (this.includePartNumbers) count++;
      if (this.includeQuantities) count++;
      if (this.includeHaystackTags) count++;
      if (this.includePointTypes) count++;
      return count;
    },
    
    /**
     * Get the total number of parts (sum of quantities)
     */
    getTotalParts() {
      return this.bomItems.reduce((total, item) => total + item.quantity, 0);
    },
    
    /**
     * Export the BOM as a CSV file
     */
    exportBOM() {
      // Create CSV header
      let headers = ['Part Name'];
      if (this.includePartNumbers) headers.push('Part Number');
      if (this.includeQuantities) headers.push('Quantity');
      if (this.includeHaystackTags) headers.push('Haystack Tag');
      if (this.includePointTypes) headers.push('Point Type');
      headers.push('Description');
      
      // Create CSV rows
      const rows = [headers];
      
      this.bomItems.forEach(item => {
        let row = [item.name];
        if (this.includePartNumbers) row.push(item.partNumber);
        if (this.includeQuantities) row.push(item.quantity);
        if (this.includeHaystackTags) row.push(item.haystackTag);
        if (this.includePointTypes) row.push(item.pointType);
        row.push(item.description);
        
        rows.push(row);
      });
      
      // Convert to CSV string
      const csvContent = rows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma
        const cellStr = String(cell || '');
        return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
      }).join(',')).join('\n');
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const pageName = this.selectedPageId === 'all' ? 'All_Pages' : 
                       this.pages.find(p => p.id === this.selectedPageId)?.name || 'Page';
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `BOM_${pageName.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      this.$emit('notification', {
        type: 'success',
        message: 'BOM exported as CSV',
        duration: 3000
      });
    },
    
    // Dragging functionality
    startDrag(event) {
      this.isDragging = true;
      
      const rect = this.$refs.bomPanel.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      
      event.preventDefault();
    },
    
    onDrag(event) {
      if (this.isDragging) {
        this.position = {
          x: event.clientX - this.dragOffset.x,
          y: event.clientY - this.dragOffset.y
        };
      }
    },
    
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
};
</script>