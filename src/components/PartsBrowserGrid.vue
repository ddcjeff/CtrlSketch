<template>
  <div class="parts-browser-grid">
    <div class="search-bar">
      <input 
        type="text" 
        class="search-input" 
        placeholder="Search parts by name, ID, or description..." 
        v-model="searchQuery"
        @input="applyFilters"
      >
    </div>
    
    <div class="filter-panel">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Category</label>
          <select class="filter-select" v-model="filters.class" @change="applyFilters">
            <option value="all">All Categories</option>
            <option v-for="className in uniqueClasses" :key="className" :value="className">
              {{ className }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Type</label>
          <select class="filter-select" v-model="filters.subClass" @change="applyFilters">
            <option value="all">All Types</option>
            <option v-for="subClass in uniqueSubClasses" :key="subClass" :value="subClass">
              {{ subClass }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label class="filter-label">Manufacturer</label>
          <select class="filter-select" v-model="filters.manufacturer" @change="applyFilters">
            <option value="all">All Manufacturers</option>
            <option v-for="manufacturer in uniqueManufacturers" :key="manufacturer" :value="manufacturer">
              {{ manufacturer }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="filter-buttons">
        <button class="filter-btn reset-btn" @click="resetFilters">Reset Filters</button>
      </div>
    </div>
    
    <div class="parts-count">
      Showing {{ filteredParts.length }} of {{ partsData.length }} parts
    </div>
    
    <div class="parts-grid">
      <div v-for="part in filteredParts" :key="part.ItemNumber" class="part-card">
        <div class="part-image">
          <img v-if="part.ImageUrl" :src="part.ImageUrl" :alt="part.Description" class="part-img" />
          <span v-else class="part-icon">{{ getPartIcon(part.Class) }}</span>
        </div>
        <div class="part-details">
          <div class="part-name">{{ part.Description }}</div>
          <div class="part-id">{{ part.PartNumber }}</div>
          <div class="part-manufacturer">{{ part.Manufacturer }}</div>
          <div class="part-specs">
            <span class="part-spec">{{ part.Class }}</span>
            <span class="part-spec">{{ part.SubClass }}</span>
            <span class="part-spec">${{ part.ListPrice }}</span>
          </div>
          <div class="part-actions">
            <button @click="selectPart(part)" class="bom-btn">Select Part</button>
            <button @click="viewDetails(part)" class="details-btn">Details</button>
          </div>
        </div>
      </div>
      
      <div v-if="filteredParts.length === 0" class="no-results">
        No parts found matching the current filters.
      </div>
    </div>
  </div>
</template>

<script>
import partsService from '../services/partsService';
import csvPartsService from '../services/csvPartsService';

export default {
  name: 'PartsBrowserGrid',
  data() {
    return {
      searchQuery: '',
      partsData: [],
      filteredParts: [],
      filters: {
        class: 'all',
        subClass: 'all',
        manufacturer: 'all'
      },
      loading: true,
      useSupabase: false, // Set to true to use Supabase, false to use local data
      useCSV: true, // Set to true to use local CSV file
      csvPath: '/data/PartList_Haystack.csv' // Path to the CSV file relative to the public folder
    };
  },
  computed: {
    uniqueClasses() {
      const classes = this.partsData.map(part => part.Class);
      return [...new Set(classes)].filter(Boolean).sort();
    },
    uniqueSubClasses() {
      // If a class is selected, only show subclasses for that class
      if (this.filters.class !== 'all') {
        const filteredParts = this.partsData.filter(part => part.Class === this.filters.class);
        const subClasses = filteredParts.map(part => part.SubClass);
        return [...new Set(subClasses)].filter(Boolean).sort();
      } else {
        // Otherwise show all subclasses
        const subClasses = this.partsData.map(part => part.SubClass);
        return [...new Set(subClasses)].filter(Boolean).sort();
      }
    },
    uniqueManufacturers() {
      // If a class or subclass is selected, only show manufacturers for those filters
      let filteredParts = this.partsData;
      
      if (this.filters.class !== 'all') {
        filteredParts = filteredParts.filter(part => part.Class === this.filters.class);
      }
      
      if (this.filters.subClass !== 'all') {
        filteredParts = filteredParts.filter(part => part.SubClass === this.filters.subClass);
      }
      
      const manufacturers = filteredParts.map(part => part.Manufacturer);
      return [...new Set(manufacturers)].filter(Boolean).sort();
    }
  },
  watch: {
    'filters.class': function(newClass) {
      console.log('Class filter changed to:', newClass);
      // Reset subClass filter when class changes
      this.filters.subClass = 'all';
      this.applyFilters();
    }
  },
  mounted() {
    this.loadPartsData();
    this.applyFilters();
  },
  methods: {
    async loadPartsData() {
      this.loading = true;
      
      try {
        if (this.useSupabase) {
          // Load data from Supabase
          const data = await partsService.getAllParts();
          this.partsData = data;
        } else if (this.useCSV) {
          // Load data from CSV file
          const data = await csvPartsService.loadFromCSV(this.csvPath);
          this.partsData = data;
        } else {
          // Use sample data for demonstration
          this.partsData = [
        {
          ItemNumber: '98950',
          PartNumber: 'F-1200',
          Manufacturer: 'ONICON',
          Supplier: 'ALPS',
          Class: 'FLOW',
          SubClass: 'SINGLE TURBINE',
          ListPrice: '50',
          Discount: '1',
          CostPrice: '50',
          Description: 'Turbine flow meter for chilled water systems',
          ProductCut: 'C:\\Work\\CutSheets\\F-1200-Catalog-Sheet.pdf',
          Rating: '4'
        },
        {
          ItemNumber: '98951',
          PartNumber: 'VG1240+843',
          Manufacturer: 'Johnson Controls',
          Supplier: 'National Supply',
          Class: 'VALVE',
          SubClass: '2-WAY CONTROL',
          ListPrice: '120',
          Discount: '0.1',
          CostPrice: '108',
          Description: '2-Way control valve 1/2"',
          ProductCut: '',
          Rating: '5'
        },
        {
          ItemNumber: '98952',
          PartNumber: 'TS-9100',
          Manufacturer: 'Johnson Controls',
          Supplier: 'HVAC Supply Inc',
          Class: 'SENSORS',
          SubClass: 'TEMPERATURE',
          ListPrice: '35',
          Discount: '0',
          CostPrice: '35',
          Description: 'Temperature sensor 10K NTC',
          ProductCut: '',
          Rating: '3'
        },
        {
          ItemNumber: '98953',
          PartNumber: 'CP-8901',
          Manufacturer: 'Siemens',
          Supplier: 'Controls Depot',
          Class: 'CONTROLLER',
          SubClass: 'VAV',
          ListPrice: '210',
          Discount: '0.15',
          CostPrice: '178.5',
          Description: 'VAV Box Controller with integrated actuator',
          ProductCut: '',
          Rating: '4'
        },
        {
          ItemNumber: '98954',
          PartNumber: 'P100',
          Manufacturer: 'Honeywell',
          Supplier: 'HVAC Supply Inc',
          Class: 'SENSORS',
          SubClass: 'PRESSURE',
          ListPrice: '85',
          Discount: '0.05',
          CostPrice: '80.75',
          Description: 'Differential pressure transmitter',
          ProductCut: '',
          Rating: '4'
        },
        {
          ItemNumber: '98955',
          PartNumber: 'M9106-AGC-2',
          Manufacturer: 'Johnson Controls',
          Supplier: 'National Supply',
          Class: 'ACTUATOR',
          SubClass: 'DAMPER',
          ListPrice: '145',
          Discount: '0.12',
          CostPrice: '127.6',
          Description: 'Electric damper actuator, 24V, 0-10V control',
          ProductCut: '',
          Rating: '5'
        }
      ];
        }
        
        this.loading = false;
        this.applyFilters();
      } catch (error) {
        console.error('Error loading parts data:', error);
        this.loading = false;
      }
    },
    
    getPartIcon(category) {
      const icons = {
        'SENSORS': '🌡️',
        'VALVE': '🔧',
        'CONTROLLER': '🧠',
        'ACTUATOR': '⚙️',
        'FLOW': '📊',
        'PUMP': '💧',
        'FAN': '💨',
        'COIL': '🔄',
        'DAMPER': '🚪'
      };
      
      return icons[category] || '📦';
    },
    
    applyFilters() {
      this.filteredParts = this.partsData.filter(part => {
        // Search query filter
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          const searchFields = [
            part.Description,
            part.PartNumber,
            part.ItemNumber,
            part.Manufacturer,
            part.Class,
            part.SubClass
          ].map(field => (field || '').toLowerCase());
          
          if (!searchFields.some(field => field.includes(query))) {
            return false;
          }
        }
        
        // Class filter
        if (this.filters.class !== 'all' && part.Class !== this.filters.class) {
          return false;
        }
        
        // Sub-Category filter
        if (this.filters.subClass !== 'all' && part.SubClass !== this.filters.subClass) {
          return false;
        }
        
        // Manufacturer filter
        if (this.filters.manufacturer !== 'all' && part.Manufacturer !== this.filters.manufacturer) {
          return false;
        }
        
        return true;
      });
    },
    
    resetFilters() {
      this.searchQuery = '';
      this.filters = {
        class: 'all',
        subClass: 'all',
        manufacturer: 'all'
      };
      this.applyFilters();
    },
    
    selectPart(part) {
      // Convert part data to the format expected by the part properties dialog
      const partProperties = {
        name: part.Description,
        partNumber: part.PartNumber,
        manufacturer: part.Manufacturer,
        quantity: 1,
        description: `${part.Class} - ${part.SubClass}`,
        pointType: '',
        haystackTag: `{id:${part.ItemNumber}, ${part.Class.toLowerCase()}:true}`,
        pdfPath: part.ProductCut || ''
      };
      
      this.$emit('select', partProperties);
    },
    
    viewDetails(part) {
      // In a real app, this would show a modal with more details
      alert(`Part Details: ${part.Description}\nManufacturer: ${part.Manufacturer}\nPrice: $${part.ListPrice}`);
    }
  }
};
</script>

<style scoped>
.parts-browser-grid {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  padding: 1rem;
  background-color: #f8fafc;
  color: #1e293b;
  height: 100%;
  overflow-y: auto;
}

.search-bar {
  display: flex;
  margin-bottom: 1rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
}

.filter-panel {
  background-color: #ffffff;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #475569;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  background-color: white;
}

.filter-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 500;
  cursor: pointer;
}

.reset-btn {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.parts-count {
  margin-bottom: 1rem;
  color: #64748b;
  font-size: 0.875rem;
}

.parts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
  max-height: calc(100vh - 300px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.part-card {
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}

.part-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.part-image {
  height: 140px;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.part-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.part-icon {
  font-size: 4rem;
}

.part-details {
  padding: 1rem;
}

.part-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.part-id {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

.part-manufacturer {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.part-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.part-spec {
  background-color: #f1f5f9;
  color: #475569;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.part-actions {
  display: flex;
  gap: 0.5rem;
}

.part-actions button {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.25rem;
  text-align: center;
  cursor: pointer;
}

.bom-btn {
  background-color: #2563eb;
  color: white;
  border: none;
}

.details-btn {
  background-color: #f8fafc;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: #64748b;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>