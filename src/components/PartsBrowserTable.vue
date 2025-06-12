<template>
  <div class="parts-browser-table">
    <!-- Skeleton loading layout (shown while loading) -->
    <div v-if="loading" class="skeleton-content">
      <div class="filter-bar">
        <div class="skeleton skeleton-filter"></div>
        <div class="skeleton skeleton-filter"></div>
        <div class="skeleton skeleton-filter"></div>
        <div class="skeleton skeleton-button"></div>
      </div>
      
      <div class="table-container">
        <div class="skeleton skeleton-table-header"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
        <div class="skeleton skeleton-table-row"></div>
      </div>
    </div>
    
    <!-- Real content (shown after loading) -->
    <div v-else class="real-content">
      <div class="filter-bar">
        <div class="filter-group">
          <label for="class-filter">Category</label>
          <select id="class-filter" v-model="filters.class">
            <option value="">All Categories</option>
            <option v-for="className in uniqueClasses" :key="className" :value="className">
              {{ className }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="subclass-filter">Type</label>
          <select id="subclass-filter" v-model="filters.subClass">
            <option value="">All Types</option>
            <option v-for="subClass in uniqueSubClasses" :key="subClass" :value="subClass">
              {{ subClass }}
            </option>
          </select>
        </div>
        
        <div class="filter-group">
          <label for="manufacturer-filter">Manufacturer</label>
          <select id="manufacturer-filter" v-model="filters.manufacturer">
            <option value="">All Manufacturers</option>
            <option v-for="manufacturer in uniqueManufacturers" :key="manufacturer" :value="manufacturer">
              {{ manufacturer }}
            </option>
          </select>
        </div>
        

        
        <div class="button-group">
          <button @click="applyFilters" class="btn btn-primary">Apply Filters</button>
          <button @click="resetFilters" class="btn">Reset Filters</button>
        </div>
      </div>
      
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Item #</th>
              <th>Part Number</th>
              <th>Manufacturer</th>
              <th>Supplier</th>
              <th>Category</th>
              <th>Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="part in filteredParts" :key="part.ItemNumber">
              <td>{{ part.ItemNumber }}</td>
              <td>{{ part.PartNumber }}</td>
              <td>{{ part.Manufacturer }}</td>
              <td>{{ part.Supplier }}</td>
              <td>{{ part.Class }}</td>
              <td>{{ part.SubClass }}</td>
              <td>{{ part.Description || '-' }}</td>
              <td>
                <button @click="selectPart(part)" class="action-btn">Select</button>
              </td>
            </tr>
            <tr v-if="filteredParts.length === 0">
              <td colspan="8" class="no-results">No parts found matching the current filters.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import partsService from '../services/partsService';
import csvPartsService from '../services/csvPartsService';

export default {
  name: 'PartsBrowserTable',
  props: {
    selectedCategory: {
      type: String,
      default: 'all'
    }
  },
  data() {
    return {
      loading: true,
      partsData: [],
      filters: {
        class: '',
        subClass: '',
        manufacturer: ''
      },
      filteredParts: [],
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
      if (this.filters.class) {
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
      
      if (this.filters.class) {
        filteredParts = filteredParts.filter(part => part.Class === this.filters.class);
      }
      
      if (this.filters.subClass) {
        filteredParts = filteredParts.filter(part => part.SubClass === this.filters.subClass);
      }
      
      const manufacturers = filteredParts.map(part => part.Manufacturer);
      return [...new Set(manufacturers)].filter(Boolean).sort();
    }
  },
  watch: {
    selectedCategory: {
      immediate: true,
      handler(newCategory) {
        this.applyFilters();
      }
    },
    'filters.class': function(newClass) {
      console.log('Class filter changed to:', newClass);
      // Reset subClass filter when class changes
      this.filters.subClass = '';
      this.applyFilters();
    }
  },
  mounted() {
    // Simulate loading data from an API
    setTimeout(() => {
      this.loadPartsData();
      this.loading = false;
      this.applyFilters();
    }, 1000);
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
              Description: 'Turbine flow meter for chilled water systems',
              ProductCut: 'C:\\Work\\CutSheets\\F-1200-Catalog-Sheet.pdf'
            },
            {
              ItemNumber: '98951',
              PartNumber: 'VG1240+843',
              Manufacturer: 'Johnson Controls',
              Supplier: 'National Supply',
              Class: 'VALVE',
              SubClass: '2-WAY CONTROL',
              Description: '2-Way control valve 1/2"',
              ProductCut: ''
            },
            {
              ItemNumber: '98952',
              PartNumber: 'TS-9100',
              Manufacturer: 'Johnson Controls',
              Supplier: 'HVAC Supply Inc',
              Class: 'SENSORS',
              SubClass: 'TEMPERATURE',
              Description: 'Temperature sensor 10K NTC',
              ProductCut: ''
            },
            {
              ItemNumber: '98953',
              PartNumber: 'CP-8901',
              Manufacturer: 'Siemens',
              Supplier: 'Controls Depot',
              Class: 'CONTROLLER',
              SubClass: 'VAV',
              Description: 'VAV Box Controller with integrated actuator',
              ProductCut: ''
            },
            {
              ItemNumber: '98954',
              PartNumber: 'P100',
              Manufacturer: 'Honeywell',
              Supplier: 'HVAC Supply Inc',
              Class: 'SENSORS',
              SubClass: 'PRESSURE',
              Description: 'Differential pressure transmitter',
              ProductCut: ''
            },
            {
              ItemNumber: '98955',
              PartNumber: 'M9106-AGC-2',
              Manufacturer: 'Johnson Controls',
              Supplier: 'National Supply',
              Class: 'ACTUATOR',
              SubClass: 'DAMPER',
              Description: 'Electric damper actuator, 24V, 0-10V control',
              ProductCut: ''
            },
            // Add more sample parts here
            {
              ItemNumber: '98956',
              PartNumber: 'T775-SENS',
              Manufacturer: 'Honeywell',
              Supplier: 'Controls Depot',
              Class: 'CONTROLLER',
              SubClass: 'STANDALONE',
              Description: 'Electronic standalone temperature controller',
              ProductCut: ''
            },
            {
              ItemNumber: '98957',
              PartNumber: 'VFD-15',
              Manufacturer: 'ABB',
              Supplier: 'Electrical Supply Co',
              Class: 'DRIVE',
              SubClass: 'VFD',
              Description: '15HP Variable Frequency Drive',
              ProductCut: ''
            }
          ];
        }
        
        // Apply initial filters
        this.applyFilters();
        this.loading = false;
      } catch (error) {
        console.error('Error loading parts data:', error);
        this.loading = false;
      }
    },
    
    applyFilters() {
      console.log('Applying filters:', this.filters);
      this.filteredParts = this.partsData.filter(part => {
        // Class filter
        if (this.filters.class && part.Class !== this.filters.class) {
          return false;
        }
        
        // Subclass filter
        if (this.filters.subClass && part.SubClass !== this.filters.subClass) {
          return false;
        }
        
        // Manufacturer filter
        if (this.filters.manufacturer && part.Manufacturer !== this.filters.manufacturer) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Filtered to ${this.filteredParts.length} parts`);
    },
    
    resetFilters() {
      this.filters = {
        class: '',
        subClass: '',
        manufacturer: ''
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
    }
  }
};
</script>

<style scoped>
/* Skeleton loading animation */
@keyframes pulse {
  0% {
    background-color: rgba(200, 200, 200, 0.5);
  }
  50% {
    background-color: rgba(200, 200, 200, 0.8);
  }
  100% {
    background-color: rgba(200, 200, 200, 0.5);
  }
}

.skeleton {
  animation: pulse 1.5s infinite;
  border-radius: 4px;
}

/* Skeleton elements */
.skeleton-filter {
  height: 35px;
  width: 120px;
  margin-right: 15px;
}

.skeleton-button {
  height: 35px;
  width: 100px;
  margin-left: auto;
}

.skeleton-table-header {
  height: 40px;
  margin-bottom: 10px;
}

.skeleton-table-row {
  height: 30px;
  margin-bottom: 6px;
}

/* Main content styling */
.parts-browser-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: 4px;
  overflow: hidden;
}

.filter-bar {
  background-color: #f0f0f0;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}

.table-container {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: auto;
  background-color: white;
  max-height: calc(100vh - 200px); /* Adjust this value as needed */
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-size: 12px;
  margin-bottom: 4px;
  color: #666;
}

.filter-group select {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
}

.button-group {
  display: flex;
  margin-left: auto;
  gap: 10px;
}

.btn {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border: 1px solid #999;
  border-radius: 4px;
  cursor: pointer;
}

.btn:hover {
  background-color: #e0e0e0;
}

.btn-primary {
  background-color: #1e90ff;
  color: white;
  border-color: #0066cc;
}

.btn-primary:hover {
  background-color: #0066cc;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  font-weight: normal;
  position: sticky;
  top: 0;
  z-index: 1;
}

tr:hover {
  background-color: #f5f5f5;
}

.action-btn {
  padding: 4px 8px;
  background-color: #1e90ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-btn:hover {
  background-color: #0066cc;
}

.no-results {
  text-align: center;
  padding: 20px;
  color: #666;
}
</style>