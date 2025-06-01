```vue
<template>
  <div class="shape-menu" :class="{ 'dark-theme': isDarkTheme, 'open': isOpen }">
    <div class="menu-header">
      <h3>Shape Libraries</h3>
      <button class="close-button" @click="$emit('toggle-shape-menu')">
        <span class="icon">✖</span>
      </button>
    </div>

    <div class="library-controls" :class="{ 'dark-theme': isDarkTheme }">
      <select v-model="selectedLibrary">
        <option v-for="(shapes, name) in shapeLibraries" :key="name" :value="name">{{ name }}</option>
      </select>
      <input v-model="newLibraryName" placeholder="Library name..." :class="{ 'dark-theme': isDarkTheme }" />
      <button @click="addLibrary" :disabled="!newLibraryName.trim()" title="Add Library">➕</button>
      <button @click="renameLibrary(selectedLibrary, newLibraryName)" :disabled="!newLibraryName.trim()" title="Rename Library">✏️</button>
      <button @click="deleteLibrary(selectedLibrary)" title="Delete Library">🗑️</button>
      <input type="file" ref="fileInput" style="display: none;" accept=".png,.json" @change="handleFileImport" />
      <button @click="$refs.fileInput.click()" title="Import Shape">📥</button>
      <button @click="resetLibrary" title="Reset Library">🔄</button>
    </div>

    <div class="shape-list">
      <div v-if="!shapeLibraries[selectedLibrary]?.length">No shapes in this library yet.</div>
      <div class="custom-shape-controls">
        <button @click="addCustomShape">Add Custom Shape</button>
      </div>
      <div
        v-for="shape in shapeLibraries[selectedLibrary]"
        :key="shape.id"
        class="shape-button"
        draggable="true"
        @dragstart="handleDragStart($event, shape)"
      >
        <img v-if="shape.type === 'image'" :src="shape.attrs.href" class="shape-icon" alt="Shape Icon" />
        <span v-else class="icon">{{ shape.icon }}</span>
        <span class="label">{{ shape.label }}</span>
        <select @change="moveShape(shape, $event.target.value)" title="Move to Library">
          <option value="" disabled selected>Move...</option>
          <option v-for="(shapes, name) in shapeLibraries" :key="name" :value="name">{{ name }}</option>
        </select>
        <button @click="renameShape(shape)" title="Rename">✏️</button>
        <button @click="deleteShape(shape)" title="Delete">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isDarkTheme: { type: Boolean, required: true },
    isOpen: { type: Boolean, required: true },
    activeTool: { type: String, required: true }
  },
  data() {
    return {
      customShapeName: "",
      shapeLibraries: {
        HVAC: [],
        Controllers: [],
        Sensors: [],
        Valves: [],
        Utility: [],
        "Input Wiring": [],
        "Output Wiring": [],
        Connectors: []
      },
      selectedLibrary: 'HVAC',
      newLibraryName: ''
    };
  },
  mounted() {
    // Load shape libraries from localStorage
    try {
      const savedLibraries = localStorage.getItem("shapeLibraries");
      if (savedLibraries) {
        const parsed = JSON.parse(savedLibraries);
        // Validate entries to remove invalid shapes like "reg"
        for (const lib in parsed) {
          parsed[lib] = parsed[lib].filter(shape =>
            shape && shape.id && shape.name && shape.label && shape.type && shape.attrs
          );
        }
        this.shapeLibraries = parsed;
        if (!Object.keys(this.shapeLibraries).includes(this.selectedLibrary)) {
          this.selectedLibrary = Object.keys(this.shapeLibraries)[0] || '';
        }
      }
    } catch (error) {
      console.error('Error loading shape libraries:', error);
      this.resetLibrary();
    }
  },
  methods: {
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        let newShape;
        if (file.type.startsWith('image/png')) {
          newShape = {
            id: uniqueId,
            name: file.name.replace(/\.[^/.]+$/, ""),
            label: file.name.replace(/\.[^/.]+$/, ""),
            icon: "🖼️",
            type: 'image',
            attrs: {
              href: e.target.result,
              width: 100,
              height: 100,
              x: 0,
              y: 0,
              "pointer-events": "all"
            }
          };
        } else if (file.type === 'application/json') {
          try {
            const jsonData = JSON.parse(e.target.result);
            if (!jsonData.type || !jsonData.attrs) throw new Error('Invalid shape JSON');
            newShape = {
              id: uniqueId,
              name: file.name.replace(/\.[^/.]+$/, ""),
              label: file.name.replace(/\.[^/.]+$/, ""),
              icon: "📄",
              type: jsonData.type,
              attrs: { ...jsonData.attrs, "pointer-events": "all" }
            };
          } catch (error) {
            console.error('Invalid JSON file:', error);
            this.$emit('update:status-message', 'Error: Invalid JSON shape file');
            return;
          }
        }
        if (newShape) {
          if (!this.shapeLibraries[this.selectedLibrary]) {
            this.shapeLibraries[this.selectedLibrary] = [];
          }
          this.shapeLibraries[this.selectedLibrary].push(newShape);
          this.saveShapeLibraries();
          this.$emit('update:status-message', `Imported shape: ${newShape.name}`);
        }
        event.target.value = '';
      };
      if (file.type.startsWith('image/png')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    },
    addCustomShape() {
      const name = prompt("Name your custom shape:");
      if (!name || !this.selectedLibrary) return;
      const uniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
      const newShape = {
        id: uniqueId,
        name,
        label: name,
        icon: "⬛",
        type: 'rect',
        attrs: { x: 0, y: 0, width: 100, height: 60, fill: 'none', stroke: '#000', 'stroke-width': 2, "pointer-events": "all" }
      };
      if (!this.shapeLibraries[this.selectedLibrary]) {
        this.shapeLibraries[this.selectedLibrary] = [];
      }
      this.shapeLibraries[this.selectedLibrary].push(newShape);
      this.saveShapeLibraries();
      this.$emit('update:status-message', `Added custom shape: ${name}`);
    },
    renameShape(shape) {
      const newName = prompt("New name for shape:", shape.name);
      if (newName) {
        shape.name = newName;
        shape.label = newName;
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Renamed shape to: ${newName}`);
      }
    },
    deleteShape(shape) {
      const lib = this.shapeLibraries[this.selectedLibrary];
      const index = lib.findIndex(s => s.id === shape.id);
      if (index !== -1 && confirm(`Delete shape "${shape.name}"?`)) {
        lib.splice(index, 1);
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Deleted shape: ${shape.name}`);
      }
    },
    moveShape(shape, targetLibrary) {
      if (!targetLibrary || targetLibrary === this.selectedLibrary) return;
      const sourceLib = this.shapeLibraries[this.selectedLibrary];
      const targetLib = this.shapeLibraries[targetLibrary];
      const index = sourceLib.findIndex(s => s.id === shape.id);
      if (index !== -1) {
        const [movedShape] = sourceLib.splice(index, 1);
        if (!targetLib) this.shapeLibraries[targetLibrary] = [];
        this.shapeLibraries[targetLibrary].push(movedShape);
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Moved shape "${shape.name}" to ${targetLibrary}`);
      }
    },
    handleDragStart(event, shape) {
      const dragData = {
        id: shape.id,
        name: shape.name,
        type: shape.type,
        attrs: { ...shape.attrs }
      };
      event.dataTransfer.setData('application/json', JSON.stringify(dragData));
    },
    saveShapeLibraries() {
      try {
        localStorage.setItem("shapeLibraries", JSON.stringify(this.shapeLibraries));
      } catch (error) {
        console.error('Error saving shape libraries:', error);
        this.$emit('update:status-message', 'Error saving shape libraries');
      }
    },
    resetLibrary() {
      if (confirm('Reset all shape libraries? This will clear all custom shapes.')) {
        this.shapeLibraries = {
          HVAC: [],
          Controllers: [],
          Sensors: [],
          Valves: [],
          Utility: [],
          "Input Wiring": [],
          "Output Wiring": [],
          Connectors: []
        };
        this.selectedLibrary = 'HVAC';
        localStorage.removeItem("shapeLibraries");
        this.$emit('update:status-message', 'Shape libraries reset');
      }
    },
    addLibrary() {
      const name = this.newLibraryName.trim();
      if (name && !this.shapeLibraries[name]) {
        this.shapeLibraries[name] = [];
        this.selectedLibrary = name;
        this.newLibraryName = '';
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Added library: ${name}`);
      }
    },
    renameLibrary(oldName, newName) {
      newName = newName.trim();
      if (newName && newName !== oldName && !this.shapeLibraries[newName]) {
        this.shapeLibraries[newName] = this.shapeLibraries[oldName];
        delete this.shapeLibraries[oldName];
        if (this.selectedLibrary === oldName) this.selectedLibrary = newName;
        this.newLibraryName = '';
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Renamed library to: ${newName}`);
      }
    },
    deleteLibrary(name) {
      if (confirm(`Delete library "${name}"?`)) {
        delete this.shapeLibraries[name];
        if (this.selectedLibrary === name) {
          this.selectedLibrary = Object.keys(this.shapeLibraries)[0] || '';
        }
        this.saveShapeLibraries();
        this.$emit('update:status-message', `Deleted library: ${name}`);
      }
    }
  }
};
</script>

<style scoped>
.shape-menu {
  position: fixed;
  top: 100px;
  left: 0;
  width: 220px;
  height: calc(100% - 100px);
  background-color: #f5f5f5;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 10px;
  overflow-y: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}
.shape-menu.open {
  transform: translateX(0);
}
.dark-theme .shape-menu {
  background-color: #1e1e1e;
  color: #f0f0f0;
}
.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #d1d1d1;
}
.menu-header h3 {
  margin: 0;
  font-size: 16px;
}
.library-controls {
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.library-controls input, .library-controls select {
  padding: 4px;
  font-size: 13px;
}
.library-controls button {
  padding: 4px;
  font-size: 14px;
  cursor: pointer;
}
.shape-list {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.shape-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  cursor: grab;
}
.shape-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.dark-theme select, .dark-theme input {
  background-color: #2b2b2b;
  color: #f0f0f0;
  border: 1px solid #555;
}
.dark-theme input::placeholder {
  color: #aaa;
}
.dark-theme .shape-button {
  background-color: #2a2a2a;
  border-color: #555;
  color: #eee;
}
.dark-theme .library-controls button {
  background-color: #3a3a3a;
  color: #f0f0f0;
  border: 1px solid #666;
}
.dark-theme .library-controls button:hover {
  background-color: #555;
  color: #fff;
}
.dark-theme .library-controls button:disabled {
  background-color: #222;
  color: #888;
  border-color: #444;
}
.dark-theme select, .dark-theme input, .dark-theme .label, .dark-theme .icon {
  color: #eee;
}
.dark-theme .close-button {
  color: #ccc;
}
.dark-theme .close-button:hover {
  color: #fff;
}
</style>
```
