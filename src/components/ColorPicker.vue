<template>
  <div class="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden" 
       :style="{ left: position.x + 'px', top: position.y + 'px', width: '280px' }"
       ref="colorPickerPanel">
    <div class="flex justify-between items-center p-2 bg-gray-900 cursor-move"
         @mousedown.stop="startDrag">
      <div class="text-gray-400 font-medium text-xs uppercase tracking-wider">Color Picker</div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
    </div>
    
    <div class="p-3">
      <!-- Color preview -->
      <div class="flex items-center mb-4">
        <div class="w-16 h-16 rounded-md border border-gray-600 mr-3" :style="{ backgroundColor: currentColor }"></div>
        <div>
          <div class="text-gray-300 text-sm mb-1">Current Color</div>
          <div class="text-white font-mono">{{ currentColor.toUpperCase() }}</div>
        </div>
      </div>
      
      <!-- Color input -->
      <div class="mb-4">
        <label class="block text-gray-400 text-xs mb-1">Select Color</label>
        <input type="color" 
               v-model="currentColor" 
               class="w-full h-10 rounded-md bg-transparent cursor-pointer" />
      </div>
      
      <!-- Preset colors -->
      <div class="mb-4">
        <label class="block text-gray-400 text-xs mb-2">Preset Colors</label>
        <div class="grid grid-cols-8 gap-1">
          <div v-for="color in presetColors" 
               :key="color" 
               class="w-8 h-8 rounded-md cursor-pointer border border-gray-600 hover:border-white"
               :style="{ backgroundColor: color }"
               @click="currentColor = color"></div>
        </div>
      </div>
      
      <!-- RGB inputs -->
      <div class="grid grid-cols-3 gap-2 mb-4">
        <div>
          <label class="block text-gray-400 text-xs mb-1">Red</label>
          <input type="number" 
                 v-model.number="red" 
                 min="0" 
                 max="255" 
                 class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">Green</label>
          <input type="number" 
                 v-model.number="green" 
                 min="0" 
                 max="255" 
                 class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>
        <div>
          <label class="block text-gray-400 text-xs mb-1">Blue</label>
          <input type="number" 
                 v-model.number="blue" 
                 min="0" 
                 max="255" 
                 class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white" />
        </div>
      </div>
      
      <!-- Buttons -->
      <div class="flex justify-end gap-2">
        <button @click="copyToClipboard" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
          Copy Hex
        </button>
        <button @click="applyColor" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    initialPosition: {
      type: Object,
      default: () => ({ x: 100, y: 100 })
    },
    initialColor: {
      type: String,
      default: '#000000'
    }
  },
  data() {
    return {
      currentColor: this.initialColor,
      position: this.initialPosition,
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      presetColors: [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF',
        '#C0C0C0', '#808080', '#800000', '#808000', '#008000', '#800080', '#008080', '#000080'
      ]
    };
  },
  computed: {
    red: {
      get() {
        return parseInt(this.currentColor.slice(1, 3), 16);
      },
      set(value) {
        value = Math.max(0, Math.min(255, value));
        const r = value.toString(16).padStart(2, '0');
        const g = this.currentColor.slice(3, 5);
        const b = this.currentColor.slice(5, 7);
        this.currentColor = `#${r}${g}${b}`;
      }
    },
    green: {
      get() {
        return parseInt(this.currentColor.slice(3, 5), 16);
      },
      set(value) {
        value = Math.max(0, Math.min(255, value));
        const r = this.currentColor.slice(1, 3);
        const g = value.toString(16).padStart(2, '0');
        const b = this.currentColor.slice(5, 7);
        this.currentColor = `#${r}${g}${b}`;
      }
    },
    blue: {
      get() {
        return parseInt(this.currentColor.slice(5, 7), 16);
      },
      set(value) {
        value = Math.max(0, Math.min(255, value));
        const r = this.currentColor.slice(1, 3);
        const g = this.currentColor.slice(3, 5);
        const b = value.toString(16).padStart(2, '0');
        this.currentColor = `#${r}${g}${b}`;
      }
    }
  },
  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.currentColor.toUpperCase())
        .then(() => {
          this.$emit('notification', {
            type: 'success',
            message: 'Color copied to clipboard',
            duration: 2000
          });
        })
        .catch(err => {
          console.error('Failed to copy color: ', err);
          this.$emit('notification', {
            type: 'error',
            message: 'Failed to copy color',
            duration: 2000
          });
        });
    },
    applyColor() {
      this.$emit('color-selected', this.currentColor);
      this.$emit('notification', {
        type: 'success',
        message: 'Color applied',
        duration: 2000
      });
    },
    
    // Dragging functionality
    startDrag(event) {
      this.isDragging = true;
      
      const rect = this.$refs.colorPickerPanel.getBoundingClientRect();
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

<style scoped>
input[type="color"] {
  -webkit-appearance: none;
  appearance: none;
  border: none;
}
input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}
input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>