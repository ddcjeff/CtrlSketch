
<template>
  <div class="shape-menu" :class="{ 'dark-theme': isDarkTheme, 'open': isOpen }">
    <div class="menu-header">
      <h3>Shape Libraries</h3>
      <button class="close-button" @click="$emit('toggle-shape-menu')">
        <span class="icon">✖</span>
      </button>
    </div>

    <div class="library-controls" :class="{ 'dark-theme': isDarkTheme }">
    <div class="import-controls">
      <input type="file" @change="importShapeFile" accept=".json,.png" />
    </div>
      <select v-model="selectedLibrary">
        <option v-for="(shapes, name) in shapeLibraries" :key="name" :value="name">{{ name }}</option>
      </select>
      <input v-model="newLibraryName" :placeholder="'Library name...'" :class="{ 'dark-theme': isDarkTheme }" />
      <button @click="addLibrary" :disabled="!newLibraryName.trim()" title="Add Library">➕</button>
      <button @click="renameLibrary(selectedLibrary, newLibraryName)" :disabled="!newLibraryName.trim()" title="Rename Library">✏️</button>
      <button @click="deleteLibrary(selectedLibrary)" title="Delete Library">🗑️</button>
    </div>

    <div class="shape-list">
      <div v-if="!shapeLibraries[selectedLibrary]?.length">No shapes in this library yet.</div>
      <div
        v-for="shape in shapeLibraries[selectedLibrary]"
        :key="shape.name"
        class="shape-button"
      >
        <span class="icon">{{ shape.icon }}</span>
        <span class="label">{{ shape.label }}</span>
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
  methods: {

    importShapeFile(event) {
      const file = event.target.files[0];
      if (!file || !this.selectedLibrary) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (file.name.endsWith(".json")) {
          try {
            const shapeData = JSON.parse(reader.result);
            const shapes = Array.isArray(shapeData) ? shapeData : [shapeData];
            shapes.forEach(shape => this.shapeLibraries[this.selectedLibrary].push(shape));
            this.saveShapeLibraries();
          } catch {
            alert("Invalid JSON shape file.");
          }
        } else if (file.name.endsWith(".png")) {
          const name = prompt("Enter name for imported image shape:");
          if (!name) return;
          const newShape = {
            name,
            label: name,
            icon: "🖼️",
            data: {
              image: reader.result,
              type: "image"
            }
          };
          this.shapeLibraries[this.selectedLibrary].push(newShape);
          this.saveShapeLibraries();
        }
      };
      reader.readAsDataURL(file);
    },

    addLibrary() {
      const name = this.newLibraryName.trim();
      if (name && !this.shapeLibraries[name]) {
        Object.assign(this.shapeLibraries, { [name]: [] });
        this.selectedLibrary = name;
        this.newLibraryName = '';
      }
    },
    renameLibrary(oldName, newName) {
      newName = newName.trim();
      if (newName && newName !== oldName && !this.shapeLibraries[newName]) {
        Object.assign(this.shapeLibraries, { [newName]: this.shapeLibraries[oldName] });
        delete this.shapeLibraries[oldName];
        if (this.selectedLibrary === oldName) {
          this.selectedLibrary = newName;
        }
        this.newLibraryName = '';
      }
    },
    deleteLibrary(name) {
      if (confirm(`Delete library "${name}"?`)) {
        delete this.shapeLibraries[name];
        if (this.selectedLibrary === name) {
          this.selectedLibrary = Object.keys(this.shapeLibraries)[0] || '';
        }
      }
    }
  }
};
</script>

<style scoped>
.import-controls {
  margin-top: 10px;
}
.shape-menu {
  position: fixed;
  top: 180px;
  left: -220px;
  width: 200px;
  height: calc(100% - 180px);
  background-color: #f5f5f5;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 10px;
  transition: left 0.3s ease;
}
.shape-menu.open {
  left: 0;
}
.dark-theme .shape-menu {
  background-color: #252525;
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
.library-controls input {
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
}
</style>

<style scoped>
.dark-theme select,
.dark-theme input {
  background-color: #333;
  color: #eee;
  border: 1px solid #666;
}
.dark-theme .shape-button {
  background-color: #2a2a2a;
  border-color: #555;
  color: #eee;
}
.dark-theme .library-controls button {
  background-color: #444;
  color: #eee;
  border: 1px solid #555;
}
.dark-theme .library-controls button:disabled {
  background-color: #222;
  color: #888;
  border-color: #444;
}
</style>

<style scoped>
.dark-theme select,
.dark-theme input,
.dark-theme .category-label,
.dark-theme .label,
.dark-theme .icon {
  color: #eee !important;
}
</style>

<style scoped>
.dark-theme input,
.dark-theme select {
  background-color: #2b2b2b;
  color: #f0f0f0;
  border: 1px solid #555;
}

.dark-theme input::placeholder {
  color: #aaa;
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

.dark-theme .shape-menu {
  background-color: #1e1e1e;
  color: #f0f0f0;
}
</style>

<style scoped>
.dark-theme .close-button {
  color: #ccc;
}
.dark-theme .close-button:hover {
  color: #fff;
}
</style>
