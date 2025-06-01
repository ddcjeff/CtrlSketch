<!-- src/components/ShapesPanel.vue -->
<template>
  <div class="shapes-panel" :class="{ 'dark-theme': isDarkTheme }">
    <div class="panel-header">
      <h3>Shapes</h3>
      <div class="panel-tabs">
        <button
          class="panel-tab"
          :class="{ 'active': activeTab === 'list' }"
          @click="activeTab = 'list'"
        >
          List
        </button>
        <button
          class="panel-tab"
          :class="{ 'active': activeTab === 'properties' }"
          @click="activeTab = 'properties'"
          :disabled="!selectedShape"
        >
          Properties
        </button>
      </div>
    </div>
    <div class="panel-content">
      <!-- Shapes List Tab -->
      <div v-if="activeTab === 'list'">
        <div v-if="shapes.length === 0" class="no-shapes">
          No shapes on this page
        </div>
        <div v-else class="shapes-list">
          <div
            v-for="shape in shapes"
            :key="shape.id"
            class="shape-item"
            :class="{ 'selected': selectedShapeId === shape.id }"
            @click="selectShape(shape)"
          >
            <div class="shape-icon">
              <i :class="getShapeIcon(shape.type)"></i>
            </div>
            <div class="shape-info">
              <div class="shape-name">{{ getShapeName(shape) }}</div>
              <div class="shape-type">{{ formatShapeType(shape.type) }}</div>
            </div>
            <div class="shape-actions">
              <button @click.stop="deleteShape(shape)" class="delete-btn" title="Delete shape">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Properties Tab -->
      <div v-if="activeTab === 'properties' && selectedShape" class="properties-tab">

        <!-- Shape Properties Section -->
        <div v-if="selectedShape" class="shape-properties">
          <h4>Properties</h4>
          <div class="property-group">
            <div class="property-row">
              <label>Type:</label>
              <span>{{ formatShapeType(selectedShape.type) }}</span>
            </div>

            <!-- Position properties -->
            <div class="property-row" v-if="hasPosition(selectedShape)">
              <label>Position:</label>
              <div class="position-inputs">
                <div class="input-group">
                  <label>X:</label>
                  <input type="number" v-model.number="selectedShape.x" @change="updateShape" />
                </div>
                <div class="input-group">
                  <label>Y:</label>
                  <input type="number" v-model.number="selectedShape.y" @change="updateShape" />
                </div>
              </div>
            </div>

            <!-- Size properties -->
            <div class="property-row" v-if="hasSize(selectedShape)">
              <label>Size:</label>
              <div class="position-inputs">
                <div class="input-group">
                  <label>W:</label>
                  <input type="number" v-model.number="selectedShape.width" @change="updateShape" />
                </div>
                <div class="input-group">
                  <label>H:</label>
                  <input type="number" v-model.number="selectedShape.height" @change="updateShape" />
                </div>
              </div>
            </div>

            <!-- Radius for circles -->
            <div class="property-row" v-if="selectedShape.type === 'circle'">
              <label>Radius:</label>
              <input type="number" v-model.number="selectedShape.radius" @change="updateShape" />
            </div>

            <!-- Line endpoints -->
            <div class="property-row" v-if="hasEndpoints(selectedShape)">
              <label>Start:</label>
              <div class="position-inputs">
                <div class="input-group">
                  <label>X1:</label>
                  <input type="number" v-model.number="selectedShape.x1" @change="updateShape" />
                </div>
                <div class="input-group">
                  <label>Y1:</label>
                  <input type="number" v-model.number="selectedShape.y1" @change="updateShape" />
                </div>
              </div>
            </div>

            <div class="property-row" v-if="hasEndpoints(selectedShape)">
              <label>End:</label>
              <div class="position-inputs">
                <div class="input-group">
                  <label>X2:</label>
                  <input type="number" v-model.number="selectedShape.x2" @change="updateShape" />
                </div>
                <div class="input-group">
                  <label>Y2:</label>
                  <input type="number" v-model.number="selectedShape.y2" @change="updateShape" />
                </div>
              </div>
            </div>

            <!-- Style properties -->
            <div class="property-row">
              <label>Stroke:</label>
              <input type="color" v-model="selectedShape.strokeColor" @change="updateShape" />
            </div>

            <div class="property-row">
              <label>Fill:</label>
              <input type="color" v-model="selectedShape.fillColor" @change="updateShape" />
            </div>

            <div class="property-row">
              <label>Line Width:</label>
              <input type="number" v-model.number="selectedShape.lineWidth" min="1" max="20" @change="updateShape" />
            </div>

            <!-- Text properties -->
            <div class="property-row" v-if="selectedShape.type === 'text'">
              <label>Text:</label>
              <textarea v-model="selectedShape.text" @change="updateShape"></textarea>
            </div>

            <div class="property-row" v-if="selectedShape.type === 'text'">
              <label>Font Size:</label>
              <input type="number" v-model.number="selectedShape.fontSize" min="8" max="72" @change="updateShape" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShapesPanel',
  props: {
    shapes: {
      type: Array,
      default: () => []
    },
    selectedShape: {
      type: Object,
      default: null
    },
    isDarkTheme: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    selectedShapeId() {
      return this.selectedShape ? this.selectedShape.id : null;
    }
  },
  methods: {
    selectShape(shape) {
      this.$emit('select-shape', shape);
    },
    deleteShape(shape) {
      if (confirm(`Are you sure you want to delete this ${this.formatShapeType(shape.type)}?`)) {
        this.$emit('delete-shape', shape);
      }
    },
    updateShape() {
      // Emit an event to update the shape in the parent component
      this.$emit('update-shape', this.selectedShape);
    },
    hasPosition(shape) {
      return shape && (shape.type === 'rectangle' || shape.type === 'circle' ||
             shape.type === 'text' || shape.type === 'image');
    },
    hasSize(shape) {
      return shape && (shape.type === 'rectangle' || shape.type === 'image' ||
             shape.type === 'text');
    },
    hasEndpoints(shape) {
      return shape && (shape.type === 'line' || shape.type === 'arrow');
    },
    getShapeIcon(type) {
      const icons = {
        'rectangle': 'fas fa-square',
        'circle': 'fas fa-circle',
        'line': 'fas fa-minus',
        'arrow': 'fas fa-arrow-right',
        'text': 'fas fa-font',
        'image': 'fas fa-image',
        'group': 'fas fa-object-group'
      };
      return icons[type] || 'fas fa-shapes';
    },
    getShapeName(shape) {
      if (shape.text) {
        return shape.text.substring(0, 15) + (shape.text.length > 15 ? '...' : '');
      }
      return `${this.formatShapeType(shape.type)} ${shape.id.toString().slice(-4)}`;
    },
    formatShapeType(type) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
  }
};
</script>

<style scoped>
.shapes-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-left: 1px solid #ddd;
  color: #333;
}

.dark-theme {
  background-color: #2d2d2d;
  border-left: 1px solid #444;
  color: #eee;
}

.panel-header {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  background-color: #e8e8e8;
}

.dark-theme .panel-header {
  border-bottom: 1px solid #444;
  background-color: #333;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.no-shapes {
  padding: 20px;
  text-align: center;
  color: #888;
  font-style: italic;
}

.shapes-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.shape-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.shape-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark-theme .shape-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.shape-item.selected {
  background-color: rgba(0, 120, 215, 0.1);
}

.dark-theme .shape-item.selected {
  background-color: rgba(0, 120, 215, 0.2);
}

.shape-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  color: #555;
}

.dark-theme .shape-icon {
  color: #aaa;
}

.shape-info {
  flex: 1;
  overflow: hidden;
}

.shape-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shape-type {
  font-size: 11px;
  color: #777;
}

.dark-theme .shape-type {
  color: #999;
}

.shape-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.shape-item:hover .shape-actions {
  opacity: 1;
}

.delete-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  padding: 4px;
  font-size: 12px;
}

.delete-btn:hover {
  color: #f44336;
}

/* Shape Properties Styles */
.shape-properties {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.dark-theme .shape-properties {
  border-top: 1px solid #444;
}

.shape-properties h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  padding: 0 8px;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 8px;
}

.property-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.property-row > label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.dark-theme .property-row > label {
  color: #aaa;
}

.position-inputs {
  display: flex;
  gap: 8px;
}

.input-group {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-group label {
  font-size: 11px;
  color: #888;
}

.dark-theme .input-group label {
  color: #999;
}

input[type="number"],
input[type="text"],
input[type="color"],
textarea {
  padding: 4px 6px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background-color: #fff;
  font-size: 12px;
}

.dark-theme input[type="number"],
.dark-theme input[type="text"],
.dark-theme input[type="color"],
.dark-theme textarea {
  background-color: #3a3a3a;
  border-color: #555;
  color: #eee;
}

input[type="number"] {
  width: 100%;
}

input[type="color"] {
  height: 24px;
  width: 100%;
  padding: 0;
  cursor: pointer;
}

textarea {
  min-height: 60px;
  resize: vertical;
  width: 100%;
}
</style>
