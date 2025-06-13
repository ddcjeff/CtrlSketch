<template>
  <div class="parts-browser">
    <div class="parts-browser-header">
      <div class="title">HVAC Parts Browser</div>
      <div class="view-toggle">
        <button 
          @click="viewMode = 'grid'" 
          :class="['view-btn', viewMode === 'grid' ? 'active' : '']"
          title="Grid View"
        >
          <span class="icon">◫</span>
        </button>
        <button 
          @click="viewMode = 'table'" 
          :class="['view-btn', viewMode === 'table' ? 'active' : '']"
          title="Table View"
        >
          <span class="icon">≡</span>
        </button>
      </div>
    </div>
    
    <div class="parts-browser-content">
      <div class="sidebar">
        <div class="sidebar-title">Categories</div>
        <ul class="category-list">
          <li 
            v-for="category in categories" 
            :key="category.value"
            :class="['category-item', selectedCategory === category.value ? 'active' : '']"
            @click="selectCategory(category.value)"
          >
            {{ category.label }}
          </li>
        </ul>
      </div>
      
      <div class="main-content">
        <PartsBrowserGrid 
          v-if="viewMode === 'grid'" 
          :key="'grid-' + selectedCategory"
          @select="selectPart"
        />
        <PartsBrowserTable 
          v-else 
          :key="'table-' + selectedCategory"
          :selectedCategory="selectedCategory"
          @select="selectPart"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PartsBrowserGrid from './PartsBrowserGrid.vue';
import PartsBrowserTable from './PartsBrowserTable.vue';

export default {
  name: 'PartsBrowser',
  components: {
    PartsBrowserGrid,
    PartsBrowserTable
  },
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      viewMode: 'grid', // 'grid' or 'table'
      selectedCategory: 'all',
      categories: [
        { value: 'all', label: 'All Parts' },
        { value: 'VALVE', label: 'Valves' },
        { value: 'FLOW', label: 'Flow Sensors' },
        { value: 'SENSORS', label: 'Sensors' },
        { value: 'CONTROLLER', label: 'Controllers' },
        { value: 'ACTUATOR', label: 'Actuators' },
        { value: 'PUMP', label: 'Pumps' },
        { value: 'FAN', label: 'Fans' },
        { value: 'COIL', label: 'Coils' },
        { value: 'DAMPER', label: 'Dampers' }
      ]
    };
  },
  methods: {
    selectCategory(category) {
      this.selectedCategory = category;
    },
    selectPart(partProperties) {
      console.log('PartsBrowser selectPart called with:', partProperties);
      
      // Make a deep copy to avoid reference issues
      const partToEmit = JSON.parse(JSON.stringify(partProperties));
      
      console.log('PartsBrowser emitting part:', partToEmit);
      this.$emit('select', partToEmit);
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
.parts-browser {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f0f0f0;
  color: #333;
  overflow: hidden;
}

.parts-browser-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
}

.title {
  font-weight: bold;
  font-size: 1.25rem;
}

.view-toggle {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.view-btn.active {
  background-color: #1e90ff;
  color: white;
  border-color: #0066cc;
}

.icon {
  font-size: 1.25rem;
}

.parts-browser-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  padding: 1rem;
  overflow-y: auto;
}

.sidebar-title {
  font-weight: bold;
  margin-bottom: 1rem;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.category-item:hover {
  background-color: #e0e0e0;
}

.category-item.active {
  background-color: #1e90ff;
  color: white;
}

.main-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>