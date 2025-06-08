<template>
  <div class="shape-library bg-gray-800 p-2 flex flex-col h-full" @dragover.prevent @drop.prevent="handleDrop">
    <!-- Header with library selector -->
    <div class="flex justify-between items-center p-2 bg-gray-900 rounded-md mb-2">
      <div class="flex items-center flex-1">
        <select v-model="currentLibraryId" class="bg-gray-800 text-white text-sm rounded-md border border-gray-700 px-2 py-1 mr-2 flex-1">
          <option v-for="lib in libraries" :key="lib.id" :value="lib.id">{{ lib.name }}</option>
        </select>
        <button @click="showLibraryActions = !showLibraryActions" class="text-gray-400 hover:text-white p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      <!-- Library actions dropdown -->
      <div v-if="showLibraryActions" class="absolute right-4 top-16 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
        <div class="py-1">
          <button @click="createNewLibrary" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Create New Library
          </button>
          <button @click="renameLibrary" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Rename Library
          </button>
          <button @click="deleteLibrary" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 text-red-400">
            Delete Library
          </button>
        </div>
      </div>
    </div>
    
    <!-- Search and actions bar -->
    <div class="p-2 bg-gray-850 border border-gray-700 rounded-md flex items-center mb-2">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Search shapes..." 
        class="flex-1 bg-gray-700 text-white text-sm rounded-md border border-gray-600 px-2 py-1"
      />
      <button @click="showShapeActions = !showShapeActions" class="ml-2 text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
      
      <!-- Shape actions dropdown -->
      <div v-if="showShapeActions" class="absolute right-4 top-28 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
        <div class="py-1">
          <button @click="importShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Import Shape
          </button>
          <button @click="addSelectedAsShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Add Selected as Shape
          </button>
          <button @click="exportLibrary" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Export Library
          </button>
          <button @click="exportAllLibraries" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Export All Libraries
          </button>
        </div>
      </div>
    </div>
    
    <!-- Shapes grid -->
    <div class="flex-1 overflow-y-auto bg-gray-850 border border-gray-700 rounded-md p-2">
      <div v-if="filteredShapes.length === 0" class="text-gray-400 text-center py-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p>No shapes found in this library.</p>
        <button @click="showShapeActions = true" class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm">
          Add Shapes
        </button>
      </div>
      <div v-else class="grid grid-cols-2 gap-3">
        <div 
          v-for="shape in filteredShapes" 
          :key="shape.id" 
          class="shape-item bg-gray-800 border border-gray-700 rounded-md p-2 cursor-move hover:border-blue-500 relative"
          draggable="true"
          @dragstart="onDragStart($event, shape)"
          @click="addShapeToCanvas(shape)"
          @contextmenu.prevent="openShapeContextMenu($event, shape)"
        >
          <div class="aspect-w-1 aspect-h-1 bg-gray-900 rounded-md mb-2 flex items-center justify-center overflow-hidden">
            <img v-if="shape.thumbnail" :src="shape.thumbnail" :alt="shape.name" class="max-w-full max-h-full object-contain" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div class="text-sm text-white truncate text-center font-medium">{{ shape.name }}</div>
          
          <!-- Part indicator if it has properties -->
          <div v-if="shape.partProperties" class="absolute top-2 right-2 bg-blue-500 rounded-full w-3 h-3"></div>
        </div>
      </div>
    </div>
    
    <!-- Shape context menu -->
    <div v-if="showContextMenu" class="fixed bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50" :style="contextMenuStyle">
      <div class="py-1">
        <button @click="editShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
          Edit Shape
        </button>
        <button @click="editPartProperties" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
          Edit Part Properties
        </button>
        <button @click="duplicateShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
          Duplicate
        </button>
        <button @click="moveShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
          Move to Library
        </button>
        <button @click="renameShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
          Rename
        </button>
        <button @click="deleteShape" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 text-red-400">
          Delete
        </button>
      </div>
    </div>
    
    <!-- Dialogs -->
    <div v-if="showNewLibraryDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-4 w-80">
        <h3 class="text-white text-lg font-medium mb-4">Create New Library</h3>
        <input 
          type="text" 
          v-model="newLibraryName" 
          placeholder="Library name" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 mb-4"
          ref="newLibraryInput"
        />
        <div class="flex justify-end">
          <button @click="cancelNewLibrary" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
            Cancel
          </button>
          <button @click="confirmNewLibrary" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Create
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showRenameDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-4 w-80">
        <h3 class="text-white text-lg font-medium mb-4">{{ renameDialogTitle }}</h3>
        <input 
          type="text" 
          v-model="renameValue" 
          :placeholder="renameDialogPlaceholder" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 mb-4"
          ref="renameInput"
        />
        <div class="flex justify-end">
          <button @click="cancelRename" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
            Cancel
          </button>
          <button @click="confirmRename" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Rename
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showMoveDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-4 w-80">
        <h3 class="text-white text-lg font-medium mb-4">Move Shape to Library</h3>
        <select 
          v-model="targetLibraryId" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2 mb-4"
        >
          <option v-for="lib in libraries.filter(l => l.id !== currentLibraryId)" :key="lib.id" :value="lib.id">
            {{ lib.name }}
          </option>
        </select>
        <div class="flex justify-end">
          <button @click="cancelMove" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
            Cancel
          </button>
          <button @click="confirmMove" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Move
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="showPartPropertiesDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 rounded-lg p-4 w-96 max-h-[90vh] overflow-y-auto">
        <h3 class="text-white text-lg font-medium mb-4">Part Properties</h3>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Part Name</label>
          <input 
            type="text" 
            v-model="partProperties.name" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          />
        </div>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Haystack Tag</label>
          <input 
            type="text" 
            v-model="partProperties.haystackTag" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          />
        </div>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Part Number</label>
          <input 
            type="text" 
            v-model="partProperties.partNumber" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          />
        </div>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Quantity</label>
          <input 
            type="number" 
            v-model.number="partProperties.quantity" 
            min="1"
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          />
        </div>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Description</label>
          <textarea 
            v-model="partProperties.description" 
            rows="3"
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          ></textarea>
        </div>
        
        <div class="mb-3">
          <label class="block text-gray-400 text-sm mb-1">Point Type</label>
          <select 
            v-model="partProperties.pointType" 
            class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
          >
            <option value="">Select Point Type</option>
            <option value="AI">AI - Analog Input</option>
            <option value="BI">BI - Binary Input</option>
            <option value="AO">AO - Analog Output</option>
            <option value="BO">BO - Binary Output</option>
            <option value="UI">UI - Universal Input</option>
            <option value="UO">UO - Universal Output</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-gray-400 text-sm mb-1">PDF Cut Sheet Path</label>
          <div class="flex">
            <input 
              type="text" 
              v-model="partProperties.pdfPath" 
              class="flex-1 bg-gray-700 text-white rounded-l-md border border-gray-600 px-3 py-2"
              readonly
            />
            <button @click="browsePdf" class="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-r-md">
              Browse
            </button>
          </div>
        </div>
        
        <div class="flex justify-end">
          <button @click="cancelPartProperties" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
            Cancel
          </button>
          <button @click="confirmPartProperties" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
            Save
          </button>
        </div>
      </div>
    </div>
    
    <input 
      type="file" 
      ref="fileInput" 
      style="display: none" 
      accept=".svg,.png,.jpg,.jpeg,.json"
      @change="handleFileImport"
    />
    
    <input 
      type="file" 
      ref="pdfInput" 
      style="display: none" 
      accept=".pdf"
      @change="handlePdfSelect"
    />
  </div>
</template>

<script>
export default {
  name: 'ShapeLibrary',
  props: {
    selectedShapes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      libraries: [
        { id: 'default', name: 'Default Library' },
        { id: 'hvac', name: 'HVAC Components' },
        { id: 'electrical', name: 'Electrical Symbols' }
      ],
      shapes: [
        { 
          id: 'shape1', 
          libraryId: 'default', 
          name: 'Rectangle', 
          data: { type: 'rect', width: 100, height: 50, fill: '#3B82F6' },
          thumbnail: null
        },
        { 
          id: 'shape2', 
          libraryId: 'default', 
          name: 'Circle', 
          data: { type: 'circle', radius: 40, fill: '#10B981' },
          thumbnail: null
        },
        { 
          id: 'shape3', 
          libraryId: 'default', 
          name: 'Triangle', 
          data: { type: 'polygon', points: '0,60 60,0 120,60', fill: '#F59E0B' },
          thumbnail: null
        },
        { 
          id: 'shape4', 
          libraryId: 'default', 
          name: 'Star', 
          data: { type: 'polygon', points: '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35', fill: '#EC4899' },
          thumbnail: null
        },
        { 
          id: 'shape5', 
          libraryId: 'hvac', 
          name: 'VAV Box', 
          data: { type: 'group', shapes: [] },
          thumbnail: null,
          partProperties: {
            name: 'VAV Box',
            haystackTag: 'equip vav',
            partNumber: 'VAV-100',
            quantity: 1,
            description: 'Variable Air Volume terminal unit',
            pointType: 'AO',
            pdfPath: ''
          }
        },
        { 
          id: 'shape6', 
          libraryId: 'hvac', 
          name: 'AHU', 
          data: { type: 'group', shapes: [] },
          thumbnail: null,
          partProperties: {
            name: 'Air Handling Unit',
            haystackTag: 'equip ahu',
            partNumber: 'AHU-200',
            quantity: 1,
            description: 'Air Handling Unit with cooling and heating',
            pointType: 'AI',
            pdfPath: ''
          }
        },
        { 
          id: 'shape7', 
          libraryId: 'electrical', 
          name: 'Switch', 
          data: { type: 'group', shapes: [] },
          thumbnail: null,
          partProperties: {
            name: 'Electrical Switch',
            partNumber: 'SW-100',
            quantity: 1,
            description: 'Standard electrical switch',
            pdfPath: ''
          }
        },
        { 
          id: 'shape8', 
          libraryId: 'electrical', 
          name: 'Outlet', 
          data: { type: 'group', shapes: [] },
          thumbnail: null,
          partProperties: {
            name: 'Electrical Outlet',
            partNumber: 'OUT-100',
            quantity: 1,
            description: 'Standard electrical outlet',
            pdfPath: ''
          }
        }
      ],
      currentLibraryId: 'default',
      searchQuery: '',
      
      // UI state
      showLibraryActions: false,
      showShapeActions: false,
      showContextMenu: false,
      contextMenuPosition: { x: 0, y: 0 },
      selectedShapeId: null,
      
      // Dialogs
      showNewLibraryDialog: false,
      newLibraryName: '',
      
      showRenameDialog: false,
      renameType: '', // 'library' or 'shape'
      renameId: null,
      renameValue: '',
      renameDialogTitle: '',
      renameDialogPlaceholder: '',
      
      showMoveDialog: false,
      targetLibraryId: '',
      
      showPartPropertiesDialog: false,
      partProperties: {
        name: '',
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      }
    };
  },
  computed: {
    filteredShapes() {
      return this.shapes.filter(shape => {
        // Filter by current library
        if (shape.libraryId !== this.currentLibraryId) return false;
        
        // Filter by search query
        if (this.searchQuery.trim() === '') return true;
        
        const query = this.searchQuery.toLowerCase();
        return shape.name.toLowerCase().includes(query) || 
               (shape.partProperties && shape.partProperties.description.toLowerCase().includes(query));
      });
    },
    contextMenuStyle() {
      return {
        left: `${this.contextMenuPosition.x}px`,
        top: `${this.contextMenuPosition.y}px`
      };
    }
  },
  mounted() {
    // Close context menus when clicking outside
    document.addEventListener('click', this.closeMenus);
    
    // Load libraries and shapes from localStorage if available
    this.loadData();
    
    // Ensure we have default shapes
    this.ensureDefaultShapes();
    
    // Generate thumbnails for all shapes
    this.generateThumbnails();
    
    // Log the shapes for debugging
    console.log('Shape Library loaded with', this.shapes.length, 'shapes');
    this.shapes.forEach(shape => {
      console.log(`- ${shape.name} (${shape.id}): ${shape.thumbnail ? 'Has thumbnail' : 'No thumbnail'}`);
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenus);
  },
  methods: {
    // Library management
    createNewLibrary() {
      this.showLibraryActions = false;
      this.showNewLibraryDialog = true;
      this.$nextTick(() => {
        this.$refs.newLibraryInput.focus();
      });
    },
    
    cancelNewLibrary() {
      this.showNewLibraryDialog = false;
      this.newLibraryName = '';
    },
    
    confirmNewLibrary() {
      if (!this.newLibraryName.trim()) return;
      
      const newId = 'lib_' + Date.now();
      this.libraries.push({
        id: newId,
        name: this.newLibraryName.trim()
      });
      
      this.currentLibraryId = newId;
      this.showNewLibraryDialog = false;
      this.newLibraryName = '';
      this.saveData();
      
      this.$emit('notification', {
        type: 'success',
        message: `Library "${this.newLibraryName.trim()}" created`,
        duration: 3000
      });
    },
    
    renameLibrary() {
      this.showLibraryActions = false;
      this.renameType = 'library';
      this.renameId = this.currentLibraryId;
      this.renameValue = this.libraries.find(lib => lib.id === this.currentLibraryId).name;
      this.renameDialogTitle = 'Rename Library';
      this.renameDialogPlaceholder = 'Library name';
      this.showRenameDialog = true;
      
      this.$nextTick(() => {
        this.$refs.renameInput.focus();
      });
    },
    
    deleteLibrary() {
      this.showLibraryActions = false;
      
      if (this.libraries.length <= 1) {
        this.$emit('notification', {
          type: 'error',
          message: 'Cannot delete the last library',
          duration: 3000
        });
        return;
      }
      
      const libraryName = this.libraries.find(lib => lib.id === this.currentLibraryId).name;
      
      if (confirm(`Are you sure you want to delete the library "${libraryName}"? All shapes in this library will be deleted.`)) {
        // Remove all shapes in this library
        this.shapes = this.shapes.filter(shape => shape.libraryId !== this.currentLibraryId);
        
        // Remove the library
        this.libraries = this.libraries.filter(lib => lib.id !== this.currentLibraryId);
        
        // Switch to the first available library
        this.currentLibraryId = this.libraries[0].id;
        
        this.saveData();
        
        this.$emit('notification', {
          type: 'success',
          message: `Library "${libraryName}" deleted`,
          duration: 3000
        });
      }
    },
    
    // Shape management
    importShape() {
      this.showShapeActions = false;
      this.$refs.fileInput.click();
    },
    
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = 'shape_' + Date.now();
        const name = file.name.split('.')[0];
        
        // For SVG files, we can use the content directly
        if (file.type === 'image/svg+xml') {
          this.shapes.push({
            id,
            libraryId: this.currentLibraryId,
            name,
            data: { type: 'svg', content: e.target.result },
            thumbnail: e.target.result
          });
          
          this.saveData();
          this.$emit('notification', {
            type: 'success',
            message: `Shape "${name}" imported`,
            duration: 3000
          });
        } 
        // For images, we'll use them as thumbnails and create image shapes
        else if (file.type.startsWith('image/')) {
          this.shapes.push({
            id,
            libraryId: this.currentLibraryId,
            name,
            data: { type: 'image', src: e.target.result },
            thumbnail: e.target.result
          });
          
          this.saveData();
          this.$emit('notification', {
            type: 'success',
            message: `Shape "${name}" imported`,
            duration: 3000
          });
        }
        // For JSON files, parse the content and import shapes
        else if (file.name.endsWith('.json')) {
          try {
            const jsonData = JSON.parse(e.target.result);
            this.importJsonShapes(jsonData, name);
          } catch (error) {
            console.error('Error parsing JSON file:', error);
            this.$emit('notification', {
              type: 'error',
              message: `Failed to parse JSON file: ${error.message}`,
              duration: 3000
            });
          }
        }
      };
      
      if (file.type === 'image/svg+xml' || file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.name.endsWith('.json')) {
        reader.readAsText(file);
      }
      
      // Reset the input
      event.target.value = '';
    },
    
    /**
     * Import shapes from JSON data
     */
    importJsonShapes(jsonData, baseName) {
      // Handle different JSON formats
      
      // Case 1: Array of shapes
      if (Array.isArray(jsonData)) {
        if (jsonData.length === 0) {
          this.$emit('notification', {
            type: 'error',
            message: 'JSON file contains no shapes',
            duration: 3000
          });
          return;
        }
        
        // Import each shape in the array
        let importCount = 0;
        jsonData.forEach((shape, index) => {
          if (this.isValidShapeData(shape)) {
            const id = 'shape_' + Date.now() + '_' + index;
            const name = shape.name || `${baseName}_${index + 1}`;
            
            this.shapes.push({
              id,
              libraryId: this.currentLibraryId,
              name,
              data: this.normalizeShapeData(shape),
              thumbnail: null, // Will be generated later
              partProperties: shape.partProperties || null
            });
            
            importCount++;
          }
        });
        
        if (importCount > 0) {
          this.saveData();
          this.generateThumbnails();
          
          this.$emit('notification', {
            type: 'success',
            message: `Imported ${importCount} shapes from JSON file`,
            duration: 3000
          });
        } else {
          this.$emit('notification', {
            type: 'error',
            message: 'No valid shapes found in JSON file',
            duration: 3000
          });
        }
      }
      // Case 2: Single shape object
      else if (typeof jsonData === 'object' && jsonData !== null) {
        if (this.isValidShapeData(jsonData)) {
          const id = 'shape_' + Date.now();
          const name = jsonData.name || baseName;
          
          this.shapes.push({
            id,
            libraryId: this.currentLibraryId,
            name,
            data: this.normalizeShapeData(jsonData),
            thumbnail: null, // Will be generated later
            partProperties: jsonData.partProperties || null
          });
          
          this.saveData();
          this.generateThumbnails();
          
          this.$emit('notification', {
            type: 'success',
            message: `Shape "${name}" imported from JSON`,
            duration: 3000
          });
        } else {
          this.$emit('notification', {
            type: 'error',
            message: 'Invalid shape data in JSON file',
            duration: 3000
          });
        }
      }
      // Case 3: Library export format (contains libraries and shapes)
      else if (typeof jsonData === 'object' && jsonData !== null && 
               Array.isArray(jsonData.libraries) && Array.isArray(jsonData.shapes)) {
        
        // Import libraries
        let newLibraries = [];
        jsonData.libraries.forEach(lib => {
          // Check if library already exists
          const existingLib = this.libraries.find(l => l.id === lib.id);
          if (!existingLib) {
            newLibraries.push(lib);
          }
        });
        
        if (newLibraries.length > 0) {
          this.libraries = [...this.libraries, ...newLibraries];
        }
        
        // Import shapes
        let importCount = 0;
        jsonData.shapes.forEach((shape, index) => {
          // Check if shape already exists
          const existingShape = this.shapes.find(s => s.id === shape.id);
          if (!existingShape && this.isValidShapeData(shape.data)) {
            this.shapes.push({
              id: shape.id || 'shape_' + Date.now() + '_' + index,
              libraryId: shape.libraryId,
              name: shape.name,
              data: this.normalizeShapeData(shape.data),
              thumbnail: shape.thumbnail || null,
              partProperties: shape.partProperties || null
            });
            
            importCount++;
          }
        });
        
        if (importCount > 0 || newLibraries.length > 0) {
          this.saveData();
          this.generateThumbnails();
          
          this.$emit('notification', {
            type: 'success',
            message: `Imported ${newLibraries.length} libraries and ${importCount} shapes`,
            duration: 3000
          });
        } else {
          this.$emit('notification', {
            type: 'warning',
            message: 'No new libraries or shapes found in JSON file',
            duration: 3000
          });
        }
      } else {
        this.$emit('notification', {
          type: 'error',
          message: 'Unsupported JSON format',
          duration: 3000
        });
      }
    },
    
    /**
     * Check if the shape data is valid
     */
    isValidShapeData(shape) {
      // Basic validation - shape must have a type
      if (!shape || typeof shape !== 'object') return false;
      
      // For basic shapes
      if (shape.type) {
        return true;
      }
      
      // For group shapes
      if (Array.isArray(shape.shapes) && shape.shapes.length > 0) {
        return true;
      }
      
      return false;
    },
    
    /**
     * Normalize shape data to our internal format
     */
    normalizeShapeData(shape) {
      // Clone to avoid modifying the original
      const normalizedShape = JSON.parse(JSON.stringify(shape));
      
      // Handle different shape formats
      if (normalizedShape.type === 'rectangle' || normalizedShape.type === 'rect') {
        return {
          type: 'rect',
          width: normalizedShape.width || 100,
          height: normalizedShape.height || 50,
          fill: normalizedShape.fill || '#3B82F6'
        };
      } else if (normalizedShape.type === 'circle') {
        return {
          type: 'circle',
          radius: normalizedShape.radius || 40,
          fill: normalizedShape.fill || '#10B981'
        };
      } else if (normalizedShape.type === 'ellipse') {
        return {
          type: 'ellipse',
          radiusX: normalizedShape.radiusX || normalizedShape.rx || 50,
          radiusY: normalizedShape.radiusY || normalizedShape.ry || 30,
          fill: normalizedShape.fill || '#8B5CF6'
        };
      } else if (normalizedShape.type === 'line') {
        return {
          type: 'line',
          points: normalizedShape.points || [0, 0, 100, 0],
          stroke: normalizedShape.stroke || '#000000',
          strokeWidth: normalizedShape.strokeWidth || 2
        };
      } else if (normalizedShape.type === 'path') {
        return {
          type: 'path',
          d: normalizedShape.d || '',
          fill: normalizedShape.fill || 'none',
          stroke: normalizedShape.stroke || '#000000',
          strokeWidth: normalizedShape.strokeWidth || 2
        };
      } else if (normalizedShape.type === 'text') {
        return {
          type: 'text',
          text: normalizedShape.text || 'Text',
          fontSize: normalizedShape.fontSize || 16,
          fontFamily: normalizedShape.fontFamily || 'Arial',
          fill: normalizedShape.fill || '#000000'
        };
      } else if (normalizedShape.type === 'image') {
        return {
          type: 'image',
          src: normalizedShape.src || '',
          width: normalizedShape.width || 100,
          height: normalizedShape.height || 100
        };
      } else if (normalizedShape.type === 'svg') {
        return {
          type: 'svg',
          content: normalizedShape.content || '',
          width: normalizedShape.width || 100,
          height: normalizedShape.height || 100
        };
      } else if (Array.isArray(normalizedShape.shapes)) {
        // Group of shapes
        return {
          type: 'group',
          shapes: normalizedShape.shapes.map(s => this.normalizeShapeData(s))
        };
      }
      
      // Default fallback
      return normalizedShape;
    },
    
    /**
     * Export the current library to JSON
     */
    exportLibrary() {
      this.showShapeActions = false;
      
      const libraryToExport = this.libraries.find(lib => lib.id === this.currentLibraryId);
      if (!libraryToExport) {
        this.$emit('notification', {
          type: 'error',
          message: 'Library not found',
          duration: 3000
        });
        return;
      }
      
      const shapesToExport = this.shapes.filter(shape => shape.libraryId === this.currentLibraryId);
      
      const exportData = {
        libraries: [libraryToExport],
        shapes: shapesToExport
      };
      
      this.downloadJson(exportData, `${libraryToExport.name.replace(/\s+/g, '_')}_library.json`);
      
      this.$emit('notification', {
        type: 'success',
        message: `Library "${libraryToExport.name}" exported`,
        duration: 3000
      });
    },
    
    /**
     * Export all libraries to JSON
     */
    exportAllLibraries() {
      this.showShapeActions = false;
      
      const exportData = {
        libraries: this.libraries,
        shapes: this.shapes
      };
      
      this.downloadJson(exportData, 'all_shape_libraries.json');
      
      this.$emit('notification', {
        type: 'success',
        message: `All libraries exported (${this.libraries.length} libraries, ${this.shapes.length} shapes)`,
        duration: 3000
      });
    },
    
    /**
     * Download JSON data as a file
     */
    downloadJson(data, filename) {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    },
    
    addSelectedAsShape() {
      this.showShapeActions = false;
      
      if (!this.selectedShapes || this.selectedShapes.length === 0) {
        this.$emit('notification', {
          type: 'error',
          message: 'No shapes selected',
          duration: 3000
        });
        return;
      }
      
      // Create a new shape from the selected shapes
      const id = 'shape_' + Date.now();
      const name = 'Custom Shape ' + this.shapes.filter(s => s.libraryId === this.currentLibraryId).length;
      
      this.shapes.push({
        id,
        libraryId: this.currentLibraryId,
        name,
        data: { 
          type: 'group', 
          shapes: JSON.parse(JSON.stringify(this.selectedShapes))
        },
        thumbnail: null // We'll generate this later
      });
      
      this.saveData();
      this.generateThumbnails();
      
      this.$emit('notification', {
        type: 'success',
        message: `Shape "${name}" added to library`,
        duration: 3000
      });
    },
    
    openShapeContextMenu(event, shape) {
      this.selectedShapeId = shape.id;
      this.contextMenuPosition = { x: event.clientX, y: event.clientY };
      this.showContextMenu = true;
      event.stopPropagation();
    },
    
    editShape() {
      this.showContextMenu = false;
      // This would open a shape editor - for now we'll just show a notification
      this.$emit('notification', {
        type: 'info',
        message: 'Shape editor not implemented yet',
        duration: 3000
      });
    },
    
    editPartProperties() {
      this.showContextMenu = false;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Initialize with existing properties or defaults
      this.partProperties = shape.partProperties ? { ...shape.partProperties } : {
        name: shape.name,
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      };
      
      this.showPartPropertiesDialog = true;
    },
    
    duplicateShape() {
      this.showContextMenu = false;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      const newShape = JSON.parse(JSON.stringify(shape));
      newShape.id = 'shape_' + Date.now();
      newShape.name = `${shape.name} (Copy)`;
      
      this.shapes.push(newShape);
      this.saveData();
      
      this.$emit('notification', {
        type: 'success',
        message: `Shape "${shape.name}" duplicated`,
        duration: 3000
      });
    },
    
    moveShape() {
      this.showContextMenu = false;
      
      // If there's only one library, we can't move
      if (this.libraries.length <= 1) {
        this.$emit('notification', {
          type: 'error',
          message: 'No other libraries to move to',
          duration: 3000
        });
        return;
      }
      
      // Set the first library that's not the current one as the target
      this.targetLibraryId = this.libraries.find(lib => lib.id !== this.currentLibraryId)?.id || '';
      
      this.showMoveDialog = true;
    },
    
    cancelMove() {
      this.showMoveDialog = false;
      this.targetLibraryId = '';
    },
    
    confirmMove() {
      if (!this.targetLibraryId) return;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      const targetLibrary = this.libraries.find(lib => lib.id === this.targetLibraryId);
      if (!targetLibrary) return;
      
      // Update the shape's library ID
      shape.libraryId = this.targetLibraryId;
      
      this.showMoveDialog = false;
      this.targetLibraryId = '';
      this.saveData();
      
      this.$emit('notification', {
        type: 'success',
        message: `Shape "${shape.name}" moved to "${targetLibrary.name}"`,
        duration: 3000
      });
    },
    
    renameShape() {
      this.showContextMenu = false;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      this.renameType = 'shape';
      this.renameId = shape.id;
      this.renameValue = shape.name;
      this.renameDialogTitle = 'Rename Shape';
      this.renameDialogPlaceholder = 'Shape name';
      this.showRenameDialog = true;
      
      this.$nextTick(() => {
        this.$refs.renameInput.focus();
      });
    },
    
    cancelRename() {
      this.showRenameDialog = false;
      this.renameType = '';
      this.renameId = null;
      this.renameValue = '';
    },
    
    confirmRename() {
      if (!this.renameValue.trim()) return;
      
      if (this.renameType === 'library') {
        const library = this.libraries.find(lib => lib.id === this.renameId);
        if (library) {
          library.name = this.renameValue.trim();
          this.$emit('notification', {
            type: 'success',
            message: `Library renamed to "${library.name}"`,
            duration: 3000
          });
        }
      } else if (this.renameType === 'shape') {
        const shape = this.shapes.find(s => s.id === this.renameId);
        if (shape) {
          shape.name = this.renameValue.trim();
          
          // Update part name if it exists and matches the old name
          if (shape.partProperties && shape.partProperties.name === shape.name) {
            shape.partProperties.name = this.renameValue.trim();
          }
          
          this.$emit('notification', {
            type: 'success',
            message: `Shape renamed to "${shape.name}"`,
            duration: 3000
          });
        }
      }
      
      this.showRenameDialog = false;
      this.renameType = '';
      this.renameId = null;
      this.renameValue = '';
      this.saveData();
    },
    
    deleteShape() {
      this.showContextMenu = false;
      
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      if (confirm(`Are you sure you want to delete the shape "${shape.name}"?`)) {
        this.shapes = this.shapes.filter(s => s.id !== this.selectedShapeId);
        this.saveData();
        
        this.$emit('notification', {
          type: 'success',
          message: `Shape "${shape.name}" deleted`,
          duration: 3000
        });
      }
    },
    
    // Part properties
    browsePdf() {
      this.$refs.pdfInput.click();
    },
    
    handlePdfSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // In a real app, you'd upload this file to a server
      // For now, we'll just store the filename
      this.partProperties.pdfPath = file.name;
      
      // Reset the input
      event.target.value = '';
    },
    
    cancelPartProperties() {
      this.showPartPropertiesDialog = false;
      this.partProperties = {
        name: '',
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      };
    },
    
    confirmPartProperties() {
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      shape.partProperties = { ...this.partProperties };
      this.showPartPropertiesDialog = false;
      this.saveData();
      
      this.$emit('notification', {
        type: 'success',
        message: `Part properties updated for "${shape.name}"`,
        duration: 3000
      });
    },
    
    // Drag and drop
    handleDrop(event) {
      try {
        const data = event.dataTransfer.getData('application/json');
        if (!data) return;
        
        const parsedData = JSON.parse(data);
        
        // Check if this is a canvas shape being dropped into the library
        if (parsedData.type === 'canvas-shape') {
          this.addShapeToLibrary(parsedData.shape);
        }
      } catch (error) {
        console.error('Error handling drop in Shape Library:', error);
        this.$emit('notification', {
          type: 'error',
          message: 'Failed to add shape to library',
          details: error.message,
          duration: 3000
        });
      }
    },
    
    /**
     * Add a shape from the canvas to the library
     */
    addShapeToLibrary(shape) {
      // Create a name for the shape
      const shapeName = shape.name || this.getShapeTypeName(shape.type);
      
      // Create a new library shape
      const newLibraryShape = {
        id: 'shape_' + Date.now(),
        libraryId: this.selectedLibrary,
        name: shapeName,
        data: this.convertCanvasShapeToLibraryShape(shape),
        thumbnail: null, // We'll generate this later
        partProperties: shape.partProperties || null
      };
      
      // Add the shape to the library
      this.shapes.push(newLibraryShape);
      
      // Save the updated library
      this.saveData();
      
      // Notify the user
      this.$emit('notification', {
        type: 'success',
        message: `Shape "${shapeName}" added to library`,
        duration: 3000
      });
      
      // Generate a thumbnail for the shape
      this.generateThumbnail(newLibraryShape);
    },
    
    /**
     * Convert a canvas shape to a library shape format
     */
    convertCanvasShapeToLibraryShape(shape) {
      // Create a simplified version of the shape for the library
      const libraryShape = {};
      
      switch (shape.type) {
        case 'rectangle':
          return {
            type: 'rect',
            width: shape.width,
            height: shape.height,
            fill: shape.fill
          };
        case 'circle':
          return {
            type: 'circle',
            radius: shape.radius,
            fill: shape.fill
          };
        case 'ellipse':
          return {
            type: 'ellipse',
            radiusX: shape.radiusX,
            radiusY: shape.radiusY,
            fill: shape.fill
          };
        case 'line':
          return {
            type: 'line',
            points: shape.points,
            stroke: shape.stroke,
            strokeWidth: shape.strokeWidth
          };
        case 'path':
          return {
            type: 'path',
            d: shape.d,
            fill: shape.fill,
            stroke: shape.stroke,
            strokeWidth: shape.strokeWidth
          };
        case 'text':
          return {
            type: 'text',
            text: shape.text,
            fontSize: shape.fontSize,
            fontFamily: shape.fontFamily,
            fill: shape.fill
          };
        case 'image':
          return {
            type: 'image',
            src: shape.src,
            width: shape.width,
            height: shape.height
          };
        case 'group':
          return {
            type: 'group',
            shapes: shape.shapes ? shape.shapes.map(s => this.convertCanvasShapeToLibraryShape(s)) : []
          };
        default:
          return { type: shape.type };
      }
    },
    
    /**
     * Get a human-readable name for a shape type
     */
    getShapeTypeName(type) {
      const typeNames = {
        rectangle: 'Rectangle',
        circle: 'Circle',
        ellipse: 'Ellipse',
        line: 'Line',
        path: 'Path',
        text: 'Text',
        image: 'Image',
        group: 'Group'
      };
      
      return typeNames[type] || 'Custom Shape';
    },
    
    /**
     * Generate a thumbnail for a library shape
     */
    generateThumbnail(shape) {
      // Create a small canvas for the thumbnail
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      // Draw a background
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, 100, 100);
      
      // Draw the shape
      try {
        this.drawShapeThumbnail(ctx, shape.data);
        
        // Convert the canvas to a data URL
        const thumbnail = canvas.toDataURL('image/png');
        
        // Update the shape with the thumbnail
        const index = this.shapes.findIndex(s => s.id === shape.id);
        if (index !== -1) {
          this.shapes[index].thumbnail = thumbnail;
          this.saveData();
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
      }
    },
    
    /**
     * Draw a shape on the thumbnail canvas
     */
    drawShapeThumbnail(ctx, shapeData) {
      // Center and scale the shape to fit in the thumbnail
      ctx.save();
      ctx.translate(50, 50);
      
      // Draw based on shape type
      switch (shapeData.type) {
        case 'rect':
          ctx.fillStyle = shapeData.fill || '#3B82F6';
          ctx.fillRect(-shapeData.width/2 * 0.4, -shapeData.height/2 * 0.4, 
                       shapeData.width * 0.4, shapeData.height * 0.4);
          break;
        case 'circle':
          ctx.fillStyle = shapeData.fill || '#10B981';
          ctx.beginPath();
          ctx.arc(0, 0, shapeData.radius * 0.4, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'ellipse':
          ctx.fillStyle = shapeData.fill || '#8B5CF6';
          ctx.beginPath();
          ctx.ellipse(0, 0, shapeData.radiusX * 0.4, shapeData.radiusY * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        default:
          // For complex shapes, just draw a placeholder
          ctx.fillStyle = '#6B7280';
          ctx.fillRect(-30, -30, 60, 60);
      }
      
      ctx.restore();
    },
    
    /**
     * Add a shape to the canvas when clicked
     */
    addShapeToCanvas(shape) {
      // Emit an event to add the shape to the canvas
      this.$emit('add-shape', {
        type: 'library-shape',
        shapeId: shape.id,
        shapeData: shape.data,
        partProperties: shape.partProperties
      });
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Added "${shape.name}" to canvas`,
        duration: 2000
      });
    },
    
    onDragStart(event, shape) {
      // Set the drag data
      event.dataTransfer.setData('application/json', JSON.stringify({
        type: 'library-shape',
        shapeId: shape.id,
        shapeData: shape.data,
        partProperties: shape.partProperties
      }));
      
      // Emit the shape-drag-start event to notify parent components
      this.$emit('shape-drag-start', shape);
      
      // Set a drag image if available
      if (shape.thumbnail) {
        const img = new Image();
        img.src = shape.thumbnail;
        event.dataTransfer.setDragImage(img, 25, 25);
      }
      
      this.$emit('shape-drag-start', shape);
    },
    
    // UI helpers
    closeMenus(event) {
      // Don't close if clicking on a button that toggles the menu
      if (event.target.closest('button') && 
          (event.target.closest('button').getAttribute('@click') === 'showLibraryActions = !showLibraryActions' ||
           event.target.closest('button').getAttribute('@click') === 'showShapeActions = !showShapeActions')) {
        return;
      }
      
      this.showLibraryActions = false;
      this.showShapeActions = false;
      this.showContextMenu = false;
    },
    
    // Data persistence
    saveData() {
      try {
        localStorage.setItem('shapeLibraries', JSON.stringify(this.libraries));
        localStorage.setItem('shapeLibraryShapes', JSON.stringify(this.shapes));
      } catch (error) {
        console.error('Error saving shape library data:', error);
      }
    },
    
    loadData() {
      try {
        // Initialize with default values if not already set
        if (!Array.isArray(this.libraries)) {
          this.libraries = [
            { id: 'default', name: 'Default Library' },
            { id: 'hvac', name: 'HVAC Components' },
            { id: 'electrical', name: 'Electrical Symbols' }
          ];
        }
        
        if (!Array.isArray(this.shapes)) {
          this.shapes = [];
        }
        
        // Try to load from localStorage
        const libraries = localStorage.getItem('shapeLibraries');
        const shapes = localStorage.getItem('shapeLibraryShapes');
        
        if (libraries) {
          try {
            const parsedLibraries = JSON.parse(libraries);
            if (Array.isArray(parsedLibraries)) {
              this.libraries = parsedLibraries;
              console.log('Loaded', this.libraries.length, 'libraries from localStorage');
            }
          } catch (e) {
            console.error('Failed to parse libraries from localStorage:', e);
          }
        }
        
        if (shapes) {
          try {
            const parsedShapes = JSON.parse(shapes);
            if (Array.isArray(parsedShapes)) {
              this.shapes = parsedShapes;
              console.log('Loaded', this.shapes.length, 'shapes from localStorage');
            }
          } catch (e) {
            console.error('Failed to parse shapes from localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Error loading shape library data:', error);
        // Ensure we have valid data structures even if loading fails
        if (!Array.isArray(this.libraries)) {
          this.libraries = [{ id: 'default', name: 'Default Library' }];
        }
        if (!Array.isArray(this.shapes)) {
          this.shapes = [];
        }
      }
    },
    
    // Thumbnail generation
    generateThumbnails() {
      try {
        if (!Array.isArray(this.shapes)) {
          console.warn('Shapes is not an array in generateThumbnails, initializing it');
          this.shapes = [];
          return;
        }
        
        this.shapes.forEach(shape => {
          try {
            if (!shape.thumbnail && shape.data) {
              // For SVG content, we can use it directly
              if (shape.data.type === 'svg' && shape.data.content) {
                shape.thumbnail = shape.data.content;
              }
              // For images, use the source
              else if (shape.data.type === 'image' && shape.data.src) {
                shape.thumbnail = shape.data.src;
              }
              // For basic shapes, generate a simple SVG thumbnail
              else {
                shape.thumbnail = this.generateShapeThumbnail(shape.data);
              }
            }
          } catch (err) {
            console.error('Error generating thumbnail for shape:', shape, err);
          }
        });
        
        this.saveData();
        console.log('Generated thumbnails for', this.shapes.length, 'shapes');
      } catch (error) {
        console.error('Error in generateThumbnails:', error);
      }
    },
    
    /**
     * Ensure default shapes exist in the library
     */
    ensureDefaultShapes() {
      // Make sure libraries is an array
      if (!Array.isArray(this.libraries)) {
        console.warn('Libraries is not an array, initializing it');
        this.libraries = [];
      }
      
      // Make sure shapes is an array
      if (!Array.isArray(this.shapes)) {
        console.warn('Shapes is not an array, initializing it');
        this.shapes = [];
      }
      
      // Define the default shapes that should always be available
      const defaultShapes = [
        { 
          id: 'shape1', 
          libraryId: 'default', 
          name: 'Rectangle', 
          data: { type: 'rect', width: 100, height: 50, fill: '#3B82F6' }
        },
        { 
          id: 'shape2', 
          libraryId: 'default', 
          name: 'Circle', 
          data: { type: 'circle', radius: 40, fill: '#10B981' }
        },
        { 
          id: 'shape3', 
          libraryId: 'default', 
          name: 'Triangle', 
          data: { type: 'polygon', points: '0,60 60,0 120,60', fill: '#F59E0B' }
        },
        { 
          id: 'shape4', 
          libraryId: 'default', 
          name: 'Star', 
          data: { type: 'polygon', points: '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35', fill: '#EC4899' }
        }
      ];
      
      // Ensure the default library exists
      const hasDefaultLibrary = this.libraries.some(lib => lib.id === 'default');
      if (!hasDefaultLibrary) {
        this.libraries.push({ id: 'default', name: 'Default Library' });
        console.log('Added default library');
      }
      
      // Check if we need to add any default shapes
      let shapesAdded = false;
      defaultShapes.forEach(defaultShape => {
        const existingShape = this.shapes.find(s => s.id === defaultShape.id);
        if (!existingShape) {
          // Add the default shape
          this.shapes.push({...defaultShape, thumbnail: null});
          console.log(`Added default shape: ${defaultShape.name}`);
          shapesAdded = true;
        }
      });
      
      // If we added shapes, save the data
      if (shapesAdded) {
        this.saveData();
      }
    },
    
    /**
     * Generate a simple SVG thumbnail for a shape
     */
    generateShapeThumbnail(shapeData) {
      try {
        if (!shapeData || typeof shapeData !== 'object') {
          console.warn('Invalid shape data for thumbnail generation:', shapeData);
          return this.generateDefaultThumbnail('Invalid');
        }
        
        const size = 100;
        const padding = 10;
        const innerSize = size - (padding * 2);
        
        let shapeSvg = '';
        
        if (shapeData.type === 'rect') {
          const width = innerSize * 0.8;
          const height = innerSize * 0.6;
          shapeSvg = `<rect x="${(size - width) / 2}" y="${(size - height) / 2}" width="${width}" height="${height}" fill="${shapeData.fill || '#3B82F6'}" stroke="#000" stroke-width="1" />`;
        } else if (shapeData.type === 'circle') {
          const radius = innerSize / 2.5;
          shapeSvg = `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="${shapeData.fill || '#10B981'}" stroke="#000" stroke-width="1" />`;
        } else if (shapeData.type === 'ellipse') {
          const rx = innerSize / 2.5;
          const ry = innerSize / 4;
          shapeSvg = `<ellipse cx="${size / 2}" cy="${size / 2}" rx="${rx}" ry="${ry}" fill="${shapeData.fill || '#8B5CF6'}" stroke="#000" stroke-width="1" />`;
        } else if (shapeData.type === 'line') {
          shapeSvg = `<line x1="${padding}" y1="${size / 2}" x2="${size - padding}" y2="${size / 2}" stroke="${shapeData.stroke || '#000'}" stroke-width="${shapeData.strokeWidth || 2}" />`;
        } else if (shapeData.type === 'polygon' && shapeData.points) {
          // Scale the points to fit within the thumbnail
          const points = shapeData.points;
          shapeSvg = `<polygon points="${points}" fill="${shapeData.fill || '#F59E0B'}" stroke="#000" stroke-width="1" transform="translate(${size/2}, ${size/2}) scale(0.4)" />`;
        } else if (shapeData.type === 'path' && shapeData.d) {
          // Simple path thumbnail - just show a placeholder
          shapeSvg = `<path d="M ${padding} ${size / 2} Q ${size / 2} ${padding}, ${size - padding} ${size / 2} T ${padding} ${size / 2}" fill="none" stroke="${shapeData.stroke || '#000'}" stroke-width="${shapeData.strokeWidth || 2}" />`;
        } else if (shapeData.type === 'text') {
          shapeSvg = `<text x="${size / 2}" y="${size / 2}" font-family="${shapeData.fontFamily || 'Arial'}" font-size="${shapeData.fontSize || 16}" fill="${shapeData.fill || '#000'}" text-anchor="middle" dominant-baseline="middle">${shapeData.text || 'Text'}</text>`;
        } else if (shapeData.type === 'group') {
          // For groups, just show a placeholder
          shapeSvg = `
            <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="#f0f0f0" stroke="#ccc" stroke-width="1" />
            <text x="${size / 2}" y="${size / 2}" font-family="Arial" font-size="12" fill="#666" text-anchor="middle" dominant-baseline="middle">Group</text>
          `;
        } else {
          // Default placeholder
          shapeSvg = `
            <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="#f0f0f0" stroke="#ccc" stroke-width="1" />
            <text x="${size / 2}" y="${size / 2}" font-family="Arial" font-size="12" fill="#666" text-anchor="middle" dominant-baseline="middle">Shape</text>
          `;
        }
        
        return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeSvg}</svg>`;
      } catch (error) {
        console.error('Error generating shape thumbnail:', error);
        return this.generateDefaultThumbnail('Error');
      }
    },
    
    /**
     * Generate a default thumbnail for error cases
     */
    generateDefaultThumbnail(label) {
      const size = 100;
      const padding = 10;
      const innerSize = size - (padding * 2);
      
      const shapeSvg = `
        <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" fill="#f0f0f0" stroke="#ccc" stroke-width="1" />
        <text x="${size / 2}" y="${size / 2}" font-family="Arial" font-size="12" fill="#666" text-anchor="middle" dominant-baseline="middle">${label}</text>
      `;
      
      return `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${shapeSvg}</svg>`;
    }
  }
};
</script>

<style scoped>
.shape-library {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.bg-gray-850 {
  background-color: #1e2533;
}

.bg-gray-750 {
  background-color: #2a3441;
}

.shape-item {
  transition: all 0.2s ease;
  background-color: #2d3748;
  border: 1px solid #4a5568;
  border-radius: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.shape-item:hover {
  transform: scale(1.05);
  border-color: #3b82f6;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
}

.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}

.aspect-h-1 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Make sure the grid is visible */
.grid {
  display: grid;
}

/* Make sure the thumbnails are visible */
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.shape-item:hover {
  border-color: #4299e1;
  box-shadow: 0 0 10px rgba(66, 153, 225, 0.5);
}

/* For the aspect ratio of thumbnails */
.aspect-w-1 {
  position: relative;
  padding-bottom: 100%;
}

.aspect-h-1 {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>