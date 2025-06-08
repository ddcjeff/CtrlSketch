<template>
  <div 
    class="layers-panel" 
    v-if="visible"
    :class="{ 'collapsed': collapsed }"
  >
    <div class="panel-header">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-bold text-primary-300 flex items-center">
          <span class="mr-2">📚</span> Layers
        </h3>
        <button 
          @click="toggleCollapsed" 
          class="collapse-button"
          :title="collapsed ? 'Expand Panel' : 'Collapse Panel'"
        >
          <span class="icon">{{ collapsed ? '⟩' : '⟨' }}</span>
        </button>
      </div>
      <div class="flex space-x-2 mt-4 mb-2">
        <button 
          @click="$emit('add-layer')" 
          class="action-button bg-primary-600 hover:bg-primary-500"
          title="Add New Layer"
        >
          <span class="icon">+</span>
        </button>
        <button 
          @click="$emit('delete-layer', selectedLayerIndex)" 
          class="action-button bg-red-600 hover:bg-red-500"
          :disabled="layers.length <= 1"
          :class="{'opacity-50 cursor-not-allowed': layers.length <= 1}"
          title="Delete Selected Layer"
        >
          <span class="icon">−</span>
        </button>
      </div>
    </div>
    
    <div class="layer-list">
      <div 
        v-for="(layer, index) in layers" 
        :key="index" 
        class="layer-item"
        :class="{
          'selected': selectedLayerIndex === index, 
          'frozen': layer.frozen,
          'hidden': !layer.visible
        }"
        @click="selectLayer(index)"
        draggable="true"
        @dragstart="dragStart($event, index)"
        @dragover.prevent
        @dragenter.prevent="dragEnter($event, index)"
        @dragleave="dragLeave($event)"
        @drop="drop($event, index)"
        :data-index="index"
      >
        <div class="layer-controls">
          <!-- Visibility toggle -->
          <button 
            @click.stop="toggleVisibility(index)" 
            class="layer-button"
            :title="layer.visible ? 'Hide Layer' : 'Show Layer'"
          >
            <span v-if="layer.visible" class="icon text-green-400">👁️</span>
            <span v-else class="icon text-red-500 opacity-50">👁️‍🗨️</span>
          </button>
          
          <!-- Lock/Freeze toggle -->
          <button 
            @click.stop="toggleFreeze(index)" 
            class="layer-button"
            :title="layer.frozen ? 'Unlock Layer' : 'Lock Layer'"
          >
            <span v-if="layer.frozen" class="icon text-yellow-400">🔒</span>
            <span v-else class="icon text-gray-500">🔓</span>
          </button>
          
          <!-- Opacity control -->
          <button 
            @click.stop="showOpacitySlider(index)" 
            class="layer-button"
            :title="'Layer Opacity: ' + (layer.opacity || 100) + '%'"
          >
            <span class="icon" :class="{'text-primary-400': layer.opacity < 100, 'text-gray-400': layer.opacity === 100 || !layer.opacity}">
              {{ getOpacityIcon(layer.opacity) }}
            </span>
          </button>
          
          <!-- Opacity slider (shown when clicked) -->
          <div 
            v-if="activeOpacityLayer === index" 
            class="opacity-slider-container" 
            @click.stop
            @mousedown.stop
            @touchstart.stop
            @dragstart.prevent
          >
            <div class="opacity-slider-header">
              <span class="opacity-slider-title">Layer Opacity</span>
              <button @click="closeOpacitySlider" class="opacity-close-button">×</button>
            </div>
            <div class="opacity-slider-content">
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                :value="layer.opacity || 100" 
                @input="updateLayerOpacity(index, $event.target.value)"
                @mousedown.stop
                @touchstart.stop
                @dragstart.prevent
                class="opacity-slider"
              />
              <div class="opacity-value-container">
                <button 
                  @click.stop="setQuickOpacity(index, 25)" 
                  class="opacity-preset-button"
                  :class="{'active': (layer.opacity || 100) === 25}"
                >25%</button>
                <button 
                  @click.stop="setQuickOpacity(index, 50)" 
                  class="opacity-preset-button"
                  :class="{'active': (layer.opacity || 100) === 50}"
                >50%</button>
                <button 
                  @click.stop="setQuickOpacity(index, 75)" 
                  class="opacity-preset-button"
                  :class="{'active': (layer.opacity || 100) === 75}"
                >75%</button>
                <button 
                  @click.stop="setQuickOpacity(index, 100)" 
                  class="opacity-preset-button"
                  :class="{'active': (layer.opacity || 100) === 100}"
                >100%</button>
              </div>
              <div class="opacity-value">{{ layer.opacity || 100 }}%</div>
            </div>
          </div>
        </div>
        
        <div class="layer-name">
          <span v-if="editingLayerIndex === index">
            <input 
              ref="layerNameInput"
              v-model="editLayerName" 
              @blur="saveLayerName(index)"
              @keyup.enter="saveLayerName(index)"
              @keyup.esc="cancelEditLayerName()"
              class="layer-name-input"
              type="text"
            />
          </span>
          <span v-else @dblclick="startEditLayerName(index)">
            {{ layer.name }}
          </span>
        </div>
        
        <div class="layer-actions">
          <!-- Move Up -->
          <button 
            @click.stop="$emit('move-layer', {index, direction: 'up'})" 
            class="layer-button"
            :disabled="index === 0"
            :class="{'opacity-50 cursor-not-allowed': index === 0}"
            title="Move Layer Up"
          >
            <span class="icon">↑</span>
          </button>
          
          <!-- Move Down -->
          <button 
            @click.stop="$emit('move-layer', {index, direction: 'down'})" 
            class="layer-button"
            :disabled="index === layers.length - 1"
            :class="{'opacity-50 cursor-not-allowed': index === layers.length - 1}"
            title="Move Layer Down"
          >
            <span class="icon">↓</span>
          </button>
          
          <!-- More options -->
          <button 
            @click.stop="toggleLayerMenu(index)" 
            class="layer-button"
            title="More Options"
          >
            <span class="icon">⋮</span>
          </button>
          
          <!-- Layer menu -->
          <div 
            v-if="layerMenuIndex === index" 
            class="layer-menu"
            @click.stop
          >
            <button @click="$emit('duplicate-layer', index)" class="menu-item">
              Duplicate Layer
            </button>
            <button @click="$emit('merge-down', index)" class="menu-item" :disabled="index === layers.length - 1">
              Merge Down
            </button>
            <button @click="$emit('clear-layer', index)" class="menu-item">
              Clear Layer
            </button>
            <div class="menu-divider"></div>
            <button @click="startEditLayerName(index)" class="menu-item">
              Rename Layer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Layers',
  props: {
    visible: Boolean,
    layers: Array,
    selectedLayerIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      layerMenuIndex: null,
      editingLayerIndex: null,
      editLayerName: '',
      activeOpacityLayer: null,
      collapsed: false,
      draggedLayerIndex: null,
      dropTargetIndex: null
    };
  },
  emits: [
    'select-layer', 
    'toggle-layer-visibility', 
    'toggle-layer-freeze',
    'add-layer',
    'delete-layer',
    'move-layer',
    'duplicate-layer',
    'merge-down',
    'clear-layer',
    'rename-layer',
    'update-layers',
    'update-layer-opacity'
  ],
  methods: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    selectLayer(index) {
      this.$emit('select-layer', index);
      // Close any open menus
      this.layerMenuIndex = null;
    },
    toggleVisibility(index) {
      console.log('Layer component: Toggle visibility for layer', index, 'current state:', this.layers[index].visible);
      
      // Create a copy of the layer with the visibility toggled
      const updatedLayer = { ...this.layers[index], visible: !this.layers[index].visible };
      
      // Create a copy of all layers
      const updatedLayers = [...this.layers];
      
      // Replace the layer at the specified index
      updatedLayers[index] = updatedLayer;
      
      // Emit an event to update all layers
      this.$emit('update-layers', updatedLayers);
    },
    toggleFreeze(index) {
      console.log('Layer component: Toggle freeze for layer', index, 'current state:', this.layers[index].frozen);
      
      // Create a copy of the layer with the frozen state toggled
      const updatedLayer = { ...this.layers[index], frozen: !this.layers[index].frozen };
      
      // Create a copy of all layers
      const updatedLayers = [...this.layers];
      
      // Replace the layer at the specified index
      updatedLayers[index] = updatedLayer;
      
      // Emit an event to update all layers
      this.$emit('update-layers', updatedLayers);
    },
    toggleLayerMenu(index) {
      if (this.layerMenuIndex === index) {
        this.layerMenuIndex = null;
      } else {
        this.layerMenuIndex = index;
      }
    },
    startEditLayerName(index) {
      this.editingLayerIndex = index;
      this.editLayerName = this.layers[index].name;
      this.layerMenuIndex = null; // Close menu if open
      
      // Focus the input after it's rendered
      this.$nextTick(() => {
        if (this.$refs.layerNameInput) {
          this.$refs.layerNameInput.focus();
        }
      });
    },
    saveLayerName(index) {
      if (this.editLayerName.trim()) {
        this.$emit('rename-layer', { index, name: this.editLayerName.trim() });
      }
      this.editingLayerIndex = null;
    },
    cancelEditLayerName() {
      this.editingLayerIndex = null;
    },
    
    // Opacity-related methods
    showOpacitySlider(index) {
      // Toggle the opacity slider
      this.activeOpacityLayer = this.activeOpacityLayer === index ? null : index;
      
      // Initialize opacity if not set
      if (this.layers[index] && !this.layers[index].opacity) {
        // Create a copy of the layer
        const updatedLayers = [...this.layers];
        updatedLayers[index] = { ...updatedLayers[index], opacity: 100 };
        this.$emit('update-layers', updatedLayers);
      }
      
      // Close any open layer menus
      this.layerMenuIndex = null;
    },
    
    closeOpacitySlider() {
      this.activeOpacityLayer = null;
    },
    
    setQuickOpacity(index, value) {
      this.updateLayerOpacity(index, value);
    },
    
    getOpacityIcon(opacity) {
      if (!opacity || opacity === 100) return '🔍';
      if (opacity >= 75) return '🔍';
      if (opacity >= 50) return '🔅';
      return '🔆';
    },
    
    updateLayerOpacity(index, newOpacity) {
      // Parse the opacity value as an integer
      const opacityValue = parseInt(newOpacity);
      
      // Create a copy of all layers
      const updatedLayers = [...this.layers];
      
      // Create a copy of the layer with the updated opacity
      updatedLayers[index] = { 
        ...updatedLayers[index], 
        opacity: opacityValue 
      };
      
      // If opacity is 0, we still want to keep the layer visible in the UI
      // but with 0 opacity (transparent) when rendered
      if (opacityValue === 0) {
        console.log('Setting layer opacity to 0 (transparent but still visible in UI)');
      }
      
      // Update all layers
      this.$emit('update-layers', updatedLayers);
      
      // Emit the specific opacity update event
      this.$emit('update-layer-opacity', { 
        index, 
        opacity: opacityValue 
      });
    },
    
    // Drag and drop methods
    dragStart(event, index) {
      // Don't start dragging if we're interacting with the opacity slider
      if (this.activeOpacityLayer !== null) {
        event.preventDefault();
        return false;
      }
      
      this.draggedLayerIndex = index;
      event.dataTransfer.effectAllowed = 'move';
      // Set data for Firefox compatibility
      event.dataTransfer.setData('text/plain', index);
      
      // Add a class to the dragged element
      event.target.classList.add('dragging');
    },
    
    dragEnter(event, index) {
      // Don't allow dropping on itself
      if (index === this.draggedLayerIndex) return;
      
      this.dropTargetIndex = index;
      
      // Add visual indicator for drop target
      const layerItems = document.querySelectorAll('.layer-item');
      layerItems.forEach(item => item.classList.remove('drop-target'));
      event.currentTarget.classList.add('drop-target');
    },
    
    dragLeave(event) {
      event.currentTarget.classList.remove('drop-target');
    },
    
    drop(event, dropIndex) {
      event.preventDefault();
      
      // Remove visual styles
      const layerItems = document.querySelectorAll('.layer-item');
      layerItems.forEach(item => {
        item.classList.remove('dragging');
        item.classList.remove('drop-target');
      });
      
      // Don't do anything if dropping onto the same item
      if (this.draggedLayerIndex === dropIndex) return;
      
      // Create a copy of the layers array
      const updatedLayers = [...this.layers];
      
      // Remove the dragged layer from its original position
      const [draggedLayer] = updatedLayers.splice(this.draggedLayerIndex, 1);
      
      // Insert the dragged layer at the drop position
      updatedLayers.splice(dropIndex, 0, draggedLayer);
      
      // Update the layers
      this.$emit('update-layers', updatedLayers);
      
      // If the selected layer was moved, update the selected layer index
      if (this.selectedLayerIndex === this.draggedLayerIndex) {
        this.$emit('select-layer', dropIndex);
      } else if (
        // If the selected layer was in the range affected by the move, update its index
        (this.draggedLayerIndex < this.selectedLayerIndex && this.selectedLayerIndex <= dropIndex) ||
        (dropIndex <= this.selectedLayerIndex && this.selectedLayerIndex < this.draggedLayerIndex)
      ) {
        const newSelectedIndex = this.draggedLayerIndex < dropIndex 
          ? this.selectedLayerIndex - 1 
          : this.selectedLayerIndex + 1;
        this.$emit('select-layer', newSelectedIndex);
      }
      
      // Reset drag state
      this.draggedLayerIndex = null;
      this.dropTargetIndex = null;
    }
  },
  // Close layer menu and opacity slider when clicking outside
  mounted() {
    this.handleOutsideClick = () => {
      this.layerMenuIndex = null;
      this.activeOpacityLayer = null;
    };
    
    document.addEventListener('click', this.handleOutsideClick);
    document.addEventListener('mousedown', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    document.removeEventListener('mousedown', this.handleOutsideClick);
  }
};
</script>

<style scoped>
.layers-panel {
  position: fixed;
  right: 0;
  top: 130px;
  width: 320px;
  background: linear-gradient(to bottom, #1f2937, #111827);
  border-left: 1px solid #374151;
  padding: 16px;
  z-index: 50;
  height: calc(100vh - 130px);
  overflow-y: auto;
  color: white;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
}

/* Add a class to make the panel semi-transparent when hovering over it */
.layers-panel:hover {
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

/* Collapsed state */
.layers-panel.collapsed {
  width: 40px;
  padding: 8px 4px;
}

.layers-panel.collapsed .panel-header h3,
.layers-panel.collapsed .layer-list,
.layers-panel.collapsed .flex.space-x-2 {
  display: none;
}

.collapse-button {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapse-button:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.panel-header {
  border-bottom: 1px solid #374151;
  padding-bottom: 12px;
  margin-bottom: 12px;
}

.action-button {
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  color: white;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 6px;
  background-color: rgba(55, 65, 81, 0.5);
  transition: all 0.2s;
  position: relative;
}

.layer-item:hover {
  background-color: rgba(75, 85, 99, 0.7);
}

.layer-item.selected {
  background-color: rgba(59, 130, 246, 0.3);
  border: 1px solid #3b82f6;
}

.layer-item.frozen {
  opacity: 0.7;
  background-color: rgba(55, 65, 81, 0.3);
  border: 1px dashed #9ca3af;
}

.layer-item.hidden {
  opacity: 0.5;
  background-color: rgba(55, 65, 81, 0.2);
  border: 1px dotted #9ca3af;
  text-decoration: line-through;
}

/* Drag and drop styles */
.layer-item.dragging {
  opacity: 0.6;
  border: 2px dashed #3b82f6;
  transform: scale(0.98);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.layer-item.drop-target {
  border: 2px solid #10b981;
  background-color: rgba(16, 185, 129, 0.2);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
}

/* Opacity slider styles */
.opacity-slider-container {
  position: absolute;
  right: 40px;
  top: 0;
  background-color: rgba(31, 41, 55, 0.95);
  border: 1px solid #4b5563;
  border-radius: 8px;
  z-index: 100; /* Higher z-index to ensure it's above other elements */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  width: 220px;
  animation: fadeIn 0.2s ease-out;
  user-select: none; /* Prevent text selection */
  pointer-events: auto; /* Ensure it captures all pointer events */
  touch-action: none; /* Prevent touch actions from propagating */
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.opacity-slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #4b5563;
}

.opacity-slider-title {
  font-weight: 600;
  color: #e5e7eb;
  font-size: 14px;
}

.opacity-close-button {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.opacity-close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.opacity-slider-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.opacity-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  border-radius: 4px;
  outline: none;
}

.opacity-slider::-moz-range-track {
  height: 8px;
  background: linear-gradient(to right, #3b82f6, #60a5fa);
  border-radius: 4px;
}

.opacity-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.opacity-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.opacity-value-container {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.opacity-preset-button {
  flex: 1;
  background-color: #374151;
  border: 1px solid #4b5563;
  color: #e5e7eb;
  padding: 4px 0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.opacity-preset-button:hover {
  background-color: #4b5563;
}

.opacity-preset-button.active {
  background-color: #3b82f6;
  border-color: #60a5fa;
  color: white;
}

.opacity-value {
  font-size: 14px;
  color: #e5e7eb;
  text-align: center;
  font-weight: 600;
}

.layer-controls {
  display: flex;
  margin-right: 10px;
}

.layer-name {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-name-input {
  background-color: #1f2937;
  border: 1px solid #4b5563;
  border-radius: 4px;
  padding: 2px 6px;
  color: white;
  width: 100%;
}

.layer-actions {
  display: flex;
  position: relative;
}

.layer-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  margin-left: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.layer-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon {
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layer-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #1f2937;
  border: 1px solid #4b5563;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 10;
  min-width: 180px;
  padding: 6px 0;
}

.menu-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-divider {
  height: 1px;
  background-color: #4b5563;
  margin: 6px 0;
}
</style>