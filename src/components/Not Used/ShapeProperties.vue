<!-- src/components/ShapeProperties.vue -->
<template>
  <div v-if="selectedShape" class="shape-properties" :style="propertiesPanelStyle">
    <h4>Shape Properties</h4>
    <div class="property-group">
      <label>Stroke Color:</label>
      <div class="color-with-transparent">
        <input type="color"
               :value="selectedShape.strokeColor && selectedShape.strokeColor !== 'transparent' ? selectedShape.strokeColor : '#000000'"
               @input="updateShapeProperty('strokeColor', $event.target.value)" />
        <label class="transparent-option">
          <input type="checkbox"
                 :checked="selectedShape.strokeColor === 'transparent'"
                 @change="updateShapeProperty('strokeColor', $event.target.checked ? 'transparent' : '#000000')" />
          T
        </label>
      </div>
    </div>
    <div class="property-group">
      <label>Fill Color:</label>
      <div class="color-with-transparent">
        <input type="color"
               :value="selectedShape.fillColor && selectedShape.fillColor !== 'transparent' ? selectedShape.fillColor : '#ffffff'"
               @input="updateShapeProperty('fillColor', $event.target.value)" />
        <label class="transparent-option">
          <input type="checkbox"
                 :checked="selectedShape.fillColor === 'transparent'"
                 @change="updateShapeProperty('fillColor', $event.target.checked ? 'transparent' : '#ffffff')" />
          T
        </label>
      </div>
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Text:</label>
      <div class="text-edit-container">
        <input :value="selectedShape.text" @input="updateShapeProperty('text', $event.target.value)" />
        <button class="edit-text-button" @click="$emit('edit-text', selectedShape)">Edit</button>
      </div>
    </div>
    <div class="property-group" v-if="selectedShape.type === 'line' || selectedShape.type === 'arrow'">
      <label>Line Width:</label>
      <input type="number" min="1" max="20" :value="selectedShape.lineWidth" @input="updateShapeProperty('lineWidth', parseInt($event.target.value))" />
    </div>
    <div class="property-group" v-if="selectedShape.type === 'rectangle' || selectedShape.type === 'circle'">
      <label>Line Width:</label>
      <input type="number" min="1" max="20" :value="selectedShape.lineWidth" @input="updateShapeProperty('lineWidth', parseInt($event.target.value))" />
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Font Size:</label>
      <input type="number" min="8" max="72" :value="selectedShape.fontSize" @input="updateShapeProperty('fontSize', parseInt($event.target.value))" />
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Font Type:</label>
      <select :value="selectedShape.fontType" @change="updateShapeProperty('fontType', $event.target.value)">
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Font Style:</label>
      <select :value="selectedShape.fontStyle" @change="updateShapeProperty('fontStyle', $event.target.value)">
        <option value="normal">Normal</option>
        <option value="bold">Bold</option>
        <option value="italic">Italic</option>
      </select>
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Text Decoration:</label>
      <select :value="selectedShape.textDecoration || 'none'" @change="updateShapeProperty('textDecoration', $event.target.value)">
        <option value="none">None</option>
        <option value="underline">Underline</option>
      </select>
    </div>
    <div class="property-group" v-if="selectedShape.type === 'text'">
      <label>Text Color:</label>
      <input type="color"
             :value="selectedShape.textColor || '#000000'"
             @input="updateShapeProperty('textColor', $event.target.value)" />
    </div>
    <button @click="$emit('close')" class="close-properties">Close</button>
  </div>
</template>

<script>
import { executeCommand } from '@/utils/commandManager';

export default {
  props: {
    selectedShape: { type: Object, default: null },
    shapes: { type: Array, default: () => [] },
    isDarkTheme: { type: Boolean, required: true }
  },
  emits: ['update:shapes', 'update:status-message', 'close', 'edit-text'],
  computed: {
    propertiesPanelStyle() {
      if (!this.selectedShape) return {};

      // Get the canvas element to calculate position
      const canvas = document.querySelector('.drawing-canvas');
      if (!canvas) return { top: '10px', right: '10px' };

      const rect = canvas.getBoundingClientRect();
      const canvasContainer = document.querySelector('.canvas-container');
      const scrollOffset = canvasContainer ? {
        left: canvasContainer.scrollLeft,
        top: canvasContainer.scrollTop
      } : { left: 0, top: 0 };

      // Calculate position based on shape type
      let x, y;

      if (this.selectedShape.type === 'rectangle' || this.selectedShape.type === 'image') {
        // For rectangles, position near the top-right corner
        x = this.selectedShape.x + this.selectedShape.width;
        y = this.selectedShape.y;
      } else if (this.selectedShape.type === 'circle') {
        // For circles, position to the right of the circle
        x = this.selectedShape.x + this.selectedShape.radius;
        y = this.selectedShape.y - this.selectedShape.radius;
      } else if (this.selectedShape.type === 'line' || this.selectedShape.type === 'arrow') {
        // For lines, position near the end point
        x = Math.max(this.selectedShape.x1, this.selectedShape.x2);
        y = Math.min(this.selectedShape.y1, this.selectedShape.y2);
      } else if (this.selectedShape.type === 'text') {
        // For text, position above the text
        x = this.selectedShape.x;
        y = this.selectedShape.y - 30;
      } else {
        // Default position
        x = this.selectedShape.x || 0;
        y = this.selectedShape.y || 0;
      }

      // Convert to screen coordinates
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      const screenX = (x * scaleX) - scrollOffset.left;
      const screenY = (y * scaleY) - scrollOffset.top;

      // Ensure the panel stays within the viewport
      const panelWidth = 250; // Width of the panel
      const panelHeight = 400; // Approximate height of the panel

      // Adjust position to keep panel in view
      let left = screenX;
      let top = screenY;

      // If panel would go off the right edge, position it to the left of the shape
      if (left + panelWidth > rect.width) {
        left = Math.max(0, left - panelWidth);
      }

      // If panel would go off the top edge, position it below the shape
      if (top < 0) {
        top = Math.min(rect.height - panelHeight, top + 50);
      }

      return {
        left: `${left}px`,
        top: `${top}px`
      };
    }
  },
  methods: {
    updateShapeProperty(property, value) {
      if (!this.selectedShape) return;
      const originalShape = { ...this.selectedShape };
      const updatedShape = { ...this.selectedShape, [property]: value };
      executeCommand(this, {
        execute: () => {
          const index = this.shapes.findIndex(s => s.id === this.selectedShape.id);
          if (index !== -1) {
            const updatedShapes = [...this.shapes];
            updatedShapes[index] = updatedShape;
            this.$emit('update:shapes', updatedShapes);
            this.$emit('update:status-message', `Updated ${this.selectedShape.type} properties`);
          }
        },
        undo: () => {
          const index = this.shapes.findIndex(s => s.id === originalShape.id);
          if (index !== -1) {
            const updatedShapes = [...this.shapes];
            updatedShapes[index] = originalShape;
            this.$emit('update:shapes', updatedShapes);
            this.$emit('update:status-message', `Undid ${this.selectedShape.type} property changes`);
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.shape-properties {
  position: absolute;
  width: 250px;
  background-color: #f8f8f8;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  /* Position will be set dynamically */
}

h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 16px;
  border-bottom: 1px solid #ddd;
  padding-bottom: 8px;
}

.property-group {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.property-group label {
  font-weight: bold;
  color: #555;
  flex: 1;
}

.property-group input,
.property-group select {
  flex: 1;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

.color-with-transparent {
  display: flex;
  align-items: center;
  flex: 1;
}

.color-with-transparent input[type="color"] {
  flex: 1;
  height: 30px;
}

.transparent-option {
  margin-left: 5px;
  background: #eee;
  padding: 3px 6px;
  border-radius: 3px;
  cursor: pointer;
  font-weight: bold;
}

.close-properties {
  width: 100%;
  padding: 8px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-top: 10px;
}

.close-properties:hover {
  background-color: #3a80d2;
}

.text-edit-container {
  display: flex;
  flex: 1;
}

.text-edit-container input {
  flex: 1;
  margin-right: 5px;
}

.edit-text-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0 8px;
  cursor: pointer;
}
</style>
