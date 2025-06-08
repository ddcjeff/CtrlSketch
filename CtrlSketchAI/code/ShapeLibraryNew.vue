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
      
      <!-- Direct import button -->
      <button @click="importShape" class="ml-2 text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700" title="Import Shape">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
        </svg>
      </button>
      
      <!-- More actions button -->
      <button @click="showShapeActions = !showShapeActions" class="ml-2 text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-700" title="More Actions">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
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
          <button @click="addDefaultShapes" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Add Default Shapes
          </button>
          <button @click="exportLibrary" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Export Library
          </button>
          <button @click="exportAllLibraries" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
            Export All Libraries
          </button>
        </div>
      </div>
      
      <!-- Import instructions -->
      <div class="absolute left-4 right-4 top-28 bg-blue-900 border border-blue-700 rounded-md shadow-lg z-10 p-3 text-xs text-white" v-if="!filteredShapes.length && !searchQuery">
        <p class="mb-2"><strong>Tip:</strong> You can import shapes in several ways:</p>
        <ul class="list-disc pl-4 space-y-1">
          <li>Click the import button above</li>
          <li>Drag and drop image or SVG files here</li>
          <li>Select shapes on canvas and add to library</li>
        </ul>
        <button @click="importShape" class="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-xs w-full">
          Import Shape Now
        </button>
      </div>
    </div>
    
    <!-- Shapes grid -->
    <div class="flex-1 overflow-y-auto bg-gray-850 border border-gray-700 rounded-md p-2">
      <div v-if="filteredShapes.length === 0" class="text-gray-400 text-center py-8">
        <div v-if="searchQuery">
          <!-- Search results empty state -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>No shapes match your search.</p>
          <button @click="searchQuery = ''" class="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm">
            Clear Search
          </button>
        </div>
        <div v-else>
          <!-- Empty library state -->
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p>No shapes found in this library.</p>
          <div class="flex justify-center mt-2 space-x-2">
            <button @click="importShape" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Import
            </button>
            <button @click="addDefaultShapes" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Defaults
            </button>
          </div>
        </div>
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
            <img v-if="shape.thumbnail" :src="shape.thumbnail" :alt="shape.name" class="max-w-full max-h-full object-contain" style="max-width: 40px; max-height: 40px;" />
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
          <option v-for="lib in otherLibraries" :key="lib.id" :value="lib.id">
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
  name: 'ShapeLibraryNew',
  props: {
    selectedShapes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    // Define default libraries and shapes
    const defaultLibraries = [
      { id: 'default', name: 'Default Library' },
      { id: 'hvac', name: 'HVAC Components' },
      { id: 'electrical', name: 'Electrical Symbols' }
    ];
    
    const defaultShapes = [
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
          haystackTag: 'vav',
          partNumber: 'VAV-001',
          quantity: 1,
          description: 'Variable Air Volume terminal unit',
          pointType: 'AI',
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
          haystackTag: 'ahu',
          partNumber: 'AHU-001',
          quantity: 1,
          description: 'Air Handling Unit with supply and return fans',
          pointType: 'AI',
          pdfPath: ''
        }
      },
      { 
        id: 'shape7', 
        libraryId: 'electrical', 
        name: 'Switch', 
        data: { type: 'group', shapes: [] },
        thumbnail: null
      }
    ];
    
    return {
      // Initialize with default values
      libraries: defaultLibraries,
      shapes: defaultShapes,
      currentLibraryId: 'default',
      searchQuery: '',
      showLibraryActions: false,
      showShapeActions: false,
      showContextMenu: false,
      contextMenuPosition: { x: 0, y: 0 },
      selectedShapeId: null,
      
      // Dialogs
      showNewLibraryDialog: false,
      newLibraryName: '',
      
      showRenameDialog: false,
      renameDialogTitle: '',
      renameDialogPlaceholder: '',
      renameValue: '',
      renameType: '', // 'library' or 'shape'
      renameId: '',
      
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
      },
      
      // Store default values for reset if needed
      defaultLibraries: defaultLibraries,
      defaultShapes: defaultShapes
    };
  },
  computed: {
    filteredShapes() {
      const query = this.searchQuery.toLowerCase();
      return this.shapes.filter(shape => {
        // Filter by current library
        if (shape.libraryId !== this.currentLibraryId) {
          return false;
        }
        
        // Filter by search query if present
        if (query) {
          return shape.name.toLowerCase().includes(query);
        }
        
        return true;
      });
    },
    contextMenuStyle() {
      return {
        left: `${this.contextMenuPosition.x}px`,
        top: `${this.contextMenuPosition.y}px`
      };
    },
    otherLibraries() {
      return this.libraries.filter(lib => lib.id !== this.currentLibraryId);
    }
  },
  mounted() {
    // Close context menus when clicking outside
    document.addEventListener('click', this.closeMenus);
    
    // Load libraries and shapes from localStorage if available
    this.loadData();
    
    // Generate thumbnails for all shapes
    this.generateThumbnails();
    
    // Log the shapes for debugging
    console.log('Shape Library loaded with', this.shapes.length, 'shapes');
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenus);
  },
  methods: {
    /**
     * Close all dropdown menus
     */
    closeMenus(event) {
      // Don't close if clicking on a button that toggles a menu
      if (event.target.closest('button') && 
          (event.target.closest('button').getAttribute('@click') || '')
            .includes('show')) {
        return;
      }
      
      this.showLibraryActions = false;
      this.showShapeActions = false;
      this.showContextMenu = false;
    },
    
    /**
     * Add a shape to the canvas when clicked
     */
    addShapeToCanvas(shape) {
      console.log('Adding shape to canvas:', shape);
      
      if (!shape || !shape.data) {
        console.error('Invalid shape data:', shape);
        this.$emit('notification', {
          type: 'error',
          message: 'Invalid shape data',
          duration: 3000
        });
        return;
      }
      
      // Create the shape data
      const shapeData = {
        type: 'library-shape',
        shapeId: shape.id,
        data: shape.data,  // Use consistent property name
        shapeData: shape.data,  // Keep for backward compatibility
        partProperties: shape.partProperties,
        name: shape.name
      };
      
      // Emit an event to add the shape to the canvas
      this.$emit('add-shape', shapeData);
      
      // Also emit the shape-drag-start event as a fallback
      this.$emit('shape-drag-start', shapeData);
      
      // Simple notification without follow-ups
      this.$emit('notification', {
        type: 'success',
        message: `Added shape to canvas`,
        duration: 1500
      });
    },
    
    /**
     * Handle drag start for a shape
     */
    onDragStart(event, shape) {
      console.log('Drag start for shape:', shape);
      
      if (!shape || !shape.data) {
        console.error('Invalid shape data for drag:', shape);
        return;
      }
      
      // Set the drag data
      try {
        const dragData = {
          type: 'library-shape',
          shapeId: shape.id,
          data: shape.data,  // Use consistent property name
          shapeData: shape.data,  // Keep for backward compatibility
          partProperties: shape.partProperties,
          name: shape.name
        };
        
        // Set both text and application/json formats to ensure compatibility
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
        event.dataTransfer.setData('application/json', JSON.stringify(dragData));
        console.log('Set drag data:', dragData);
        
        // Emit event to parent to handle drag start
        this.$emit('shape-drag-start', dragData);
        
        // Create a drag image
        const dragImage = document.createElement('div');
        dragImage.className = 'drag-preview';
        dragImage.innerHTML = `
          <div style="background: #2d3748; color: white; padding: 8px; border-radius: 4px; border: 1px solid #4a5568; width: 100px; text-align: center;">
            ${shape.name || 'Shape'}
          </div>
        `;
        document.body.appendChild(dragImage);
        event.dataTransfer.setDragImage(dragImage, 50, 25);
        
        // Remove the drag image after a short delay
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 100);
      } catch (error) {
        console.error('Error setting drag data:', error);
      }
      
      // Emit the shape-drag-start event to notify parent components
      this.$emit('shape-drag-start', {
        id: shape.id,
        name: shape.name,
        data: shape.data,
        partProperties: shape.partProperties
      });
      
      // Set a drag image if available
      if (shape.thumbnail) {
        const img = new Image();
        img.src = shape.thumbnail;
        event.dataTransfer.setDragImage(img, 25, 25);
      }
    },
    
    /**
     * Open the context menu for a shape
     */
    openShapeContextMenu(event, shape) {
      this.selectedShapeId = shape.id;
      this.contextMenuPosition = { x: event.clientX, y: event.clientY };
      this.showContextMenu = true;
      
      // Prevent the default context menu
      event.preventDefault();
    },
    
    /**
     * Create a new library
     */
    createNewLibrary() {
      this.showLibraryActions = false;
      this.showNewLibraryDialog = true;
      
      // Focus the input field
      this.$nextTick(() => {
        if (this.$refs.newLibraryInput) {
          this.$refs.newLibraryInput.focus();
        }
      });
    },
    
    /**
     * Cancel creating a new library
     */
    cancelNewLibrary() {
      this.showNewLibraryDialog = false;
      this.newLibraryName = '';
    },
    
    /**
     * Confirm creating a new library
     */
    confirmNewLibrary() {
      if (!this.newLibraryName.trim()) {
        this.$emit('notification', {
          type: 'error',
          message: 'Library name cannot be empty',
          duration: 3000
        });
        return;
      }
      
      // Generate a unique ID
      const id = 'lib_' + Date.now();
      
      // Add the new library
      this.libraries.push({
        id,
        name: this.newLibraryName.trim()
      });
      
      // Switch to the new library
      this.currentLibraryId = id;
      
      // Close the dialog
      this.showNewLibraryDialog = false;
      this.newLibraryName = '';
      
      // Save the data
      this.saveData();
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Created library "${this.newLibraryName.trim()}"`,
        duration: 2000
      });
    },
    
    /**
     * Rename a library
     */
    renameLibrary() {
      this.showLibraryActions = false;
      
      // Find the current library
      const library = this.libraries.find(lib => lib.id === this.currentLibraryId);
      if (!library) return;
      
      this.renameDialogTitle = 'Rename Library';
      this.renameDialogPlaceholder = 'Library name';
      this.renameValue = library.name;
      this.renameType = 'library';
      this.renameId = library.id;
      this.showRenameDialog = true;
      
      // Focus the input field
      this.$nextTick(() => {
        if (this.$refs.renameInput) {
          this.$refs.renameInput.focus();
        }
      });
    },
    
    /**
     * Delete a library
     */
    deleteLibrary() {
      this.showLibraryActions = false;
      
      // Find the current library
      const library = this.libraries.find(lib => lib.id === this.currentLibraryId);
      if (!library) return;
      
      // Don't allow deleting the default library
      if (library.id === 'default') {
        this.$emit('notification', {
          type: 'error',
          message: 'Cannot delete the default library',
          duration: 3000
        });
        return;
      }
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete the library "${library.name}"? This will also delete all shapes in this library.`)) {
        return;
      }
      
      // Remove the library
      const index = this.libraries.findIndex(lib => lib.id === library.id);
      if (index !== -1) {
        this.libraries.splice(index, 1);
      }
      
      // Remove all shapes in this library
      this.shapes = this.shapes.filter(shape => shape.libraryId !== library.id);
      
      // Switch to the default library
      this.currentLibraryId = 'default';
      
      // Save the data
      this.saveData();
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Deleted library "${library.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Import a shape
     */
    importShape() {
      this.showShapeActions = false;
      
      // Trigger the file input
      this.$refs.fileInput.click();
    },
    
    /**
     * Handle file import
     */
    handleFileImport(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Handle different file types
      if (file.type.includes('image')) {
        this.importImageShape(file);
      } else if (file.name.endsWith('.svg')) {
        this.importSvgShape(file);
      } else if (file.name.endsWith('.json')) {
        this.importJsonShape(file);
      } else {
        this.$emit('notification', {
          type: 'error',
          message: 'Unsupported file type',
          duration: 3000
        });
      }
      
      // Reset the file input
      event.target.value = '';
    },
    
    /**
     * Import an image shape
     */
    importImageShape(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = 'shape_' + Date.now();
        const name = file.name.split('.')[0];
        
        // Create a new shape
        const shape = {
          id,
          libraryId: this.currentLibraryId,
          name,
          data: {
            type: 'image',
            src: e.target.result,
            width: 100,
            height: 100
          },
          thumbnail: e.target.result
        };
        
        // Add the shape
        this.shapes.push(shape);
        
        // Save the data
        this.saveData();
        
        // Show notification
        this.$emit('notification', {
          type: 'success',
          message: `Imported image "${name}"`,
          duration: 2000
        });
      };
      
      reader.readAsDataURL(file);
    },
    
    /**
     * Import an SVG shape
     */
    importSvgShape(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const id = 'shape_' + Date.now();
        const name = file.name.split('.')[0];
        
        // Create a new shape
        const shape = {
          id,
          libraryId: this.currentLibraryId,
          name,
          data: {
            type: 'svg',
            content: e.target.result,
            width: 100,
            height: 100
          },
          thumbnail: e.target.result
        };
        
        // Add the shape
        this.shapes.push(shape);
        
        // Save the data
        this.saveData();
        
        // Show notification
        this.$emit('notification', {
          type: 'success',
          message: `Imported SVG "${name}"`,
          duration: 2000
        });
      };
      
      reader.readAsDataURL(file);
    },
    
    /**
     * Import a JSON shape
     */
    importJsonShape(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Check if it's a library export
          if (data.type === 'library' && Array.isArray(data.shapes)) {
            // Import all shapes
            data.shapes.forEach(shape => {
              // Generate a new ID
              shape.id = 'shape_' + Date.now() + Math.random();
              
              // Set the library ID
              shape.libraryId = this.currentLibraryId;
              
              // Add the shape
              this.shapes.push(shape);
            });
            
            // Save the data
            this.saveData();
            
            // Generate thumbnails
            this.generateThumbnails();
            
            // Show notification
            this.$emit('notification', {
              type: 'success',
              message: `Imported ${data.shapes.length} shapes from library`,
              duration: 2000
            });
          } else {
            // Import a single shape
            const id = 'shape_' + Date.now();
            const name = file.name.split('.')[0];
            
            // Create a new shape
            const shape = {
              id,
              libraryId: this.currentLibraryId,
              name,
              data,
              thumbnail: null
            };
            
            // Add the shape
            this.shapes.push(shape);
            
            // Generate thumbnail
            shape.thumbnail = this.generateShapeThumbnail(data);
            
            // Save the data
            this.saveData();
            
            // Show notification
            this.$emit('notification', {
              type: 'success',
              message: `Imported shape "${name}"`,
              duration: 2000
            });
          }
        } catch (error) {
          console.error('Error importing JSON shape:', error);
          this.$emit('notification', {
            type: 'error',
            message: 'Invalid JSON file',
            duration: 3000
          });
        }
      };
      
      reader.readAsText(file);
    },
    
    /**
     * Add selected shapes as a library shape
     */
    addSelectedAsShape() {
      this.showShapeActions = false;
      
      if (this.selectedShapes.length === 0) {
        this.$emit('notification', {
          type: 'error',
          message: 'No shapes selected',
          duration: 3000
        });
        return;
      }
      
      // Create a name for the shape
      const name = this.selectedShapes.length === 1 
        ? this.selectedShapes[0].type.charAt(0).toUpperCase() + this.selectedShapes[0].type.slice(1)
        : 'Group';
      
      // Open rename dialog
      this.renameDialogTitle = 'Add Shape to Library';
      this.renameDialogPlaceholder = 'Shape name';
      this.renameValue = name;
      this.renameType = 'new-shape';
      this.showRenameDialog = true;
      
      // Focus the input field
      this.$nextTick(() => {
        if (this.$refs.renameInput) {
          this.$refs.renameInput.focus();
        }
      });
    },
    
    /**
     * Export the current library
     */
    exportLibrary() {
      this.showShapeActions = false;
      
      // Get all shapes in the current library
      const libraryShapes = this.shapes.filter(shape => shape.libraryId === this.currentLibraryId);
      
      if (libraryShapes.length === 0) {
        this.$emit('notification', {
          type: 'error',
          message: 'No shapes in this library',
          duration: 3000
        });
        return;
      }
      
      // Create the export data
      const exportData = {
        type: 'library',
        name: this.libraries.find(lib => lib.id === this.currentLibraryId)?.name || 'Library',
        shapes: libraryShapes
      };
      
      // Convert to JSON
      const json = JSON.stringify(exportData, null, 2);
      
      // Create a blob
      const blob = new Blob([json], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportData.name}.json`;
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Exported library "${exportData.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Export all libraries
     */
    exportAllLibraries() {
      this.showShapeActions = false;
      
      if (this.shapes.length === 0) {
        this.$emit('notification', {
          type: 'error',
          message: 'No shapes to export',
          duration: 3000
        });
        return;
      }
      
      // Create the export data
      const exportData = {
        type: 'all-libraries',
        libraries: this.libraries,
        shapes: this.shapes
      };
      
      // Convert to JSON
      const json = JSON.stringify(exportData, null, 2);
      
      // Create a blob
      const blob = new Blob([json], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'all-libraries.json';
      
      // Trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: 'Exported all libraries',
        duration: 2000
      });
    },
    
    /**
     * Edit a shape
     */
    editShape() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Emit an event to edit the shape
      this.$emit('edit-shape', shape);
    },
    
    /**
     * Edit part properties
     */
    editPartProperties() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Initialize part properties
      this.partProperties = shape.partProperties || {
        name: shape.name,
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      };
      
      // Show the dialog
      this.showPartPropertiesDialog = true;
    },
    
    /**
     * Cancel editing part properties
     */
    cancelPartProperties() {
      this.showPartPropertiesDialog = false;
    },
    
    /**
     * Confirm editing part properties
     */
    confirmPartProperties() {
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Update the part properties
      shape.partProperties = { ...this.partProperties };
      
      // Save the data
      this.saveData();
      
      // Close the dialog
      this.showPartPropertiesDialog = false;
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Updated part properties for "${shape.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Browse for a PDF
     */
    browsePdf() {
      this.$refs.pdfInput.click();
    },
    
    /**
     * Handle PDF selection
     */
    handlePdfSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Store the file path
      this.partProperties.pdfPath = file.name;
      
      // Reset the file input
      event.target.value = '';
    },
    
    /**
     * Duplicate a shape
     */
    duplicateShape() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Create a new shape
      const newShape = JSON.parse(JSON.stringify(shape));
      newShape.id = 'shape_' + Date.now();
      newShape.name = `${shape.name} (Copy)`;
      
      // Add the shape
      this.shapes.push(newShape);
      
      // Save the data
      this.saveData();
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Duplicated shape "${shape.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Move a shape to another library
     */
    moveShape() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // If there are no other libraries, show an error
      if (this.otherLibraries.length === 0) {
        this.$emit('notification', {
          type: 'error',
          message: 'No other libraries to move to',
          duration: 3000
        });
        return;
      }
      
      // Set the target library
      this.targetLibraryId = this.otherLibraries[0].id;
      
      // Show the dialog
      this.showMoveDialog = true;
    },
    
    /**
     * Cancel moving a shape
     */
    cancelMove() {
      this.showMoveDialog = false;
    },
    
    /**
     * Confirm moving a shape
     */
    confirmMove() {
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Find the target library
      const targetLibrary = this.libraries.find(lib => lib.id === this.targetLibraryId);
      if (!targetLibrary) return;
      
      // Update the shape
      shape.libraryId = targetLibrary.id;
      
      // Save the data
      this.saveData();
      
      // Close the dialog
      this.showMoveDialog = false;
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Moved shape "${shape.name}" to library "${targetLibrary.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Rename a shape
     */
    renameShape() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Open rename dialog
      this.renameDialogTitle = 'Rename Shape';
      this.renameDialogPlaceholder = 'Shape name';
      this.renameValue = shape.name;
      this.renameType = 'shape';
      this.renameId = shape.id;
      this.showRenameDialog = true;
      
      // Focus the input field
      this.$nextTick(() => {
        if (this.$refs.renameInput) {
          this.$refs.renameInput.focus();
        }
      });
    },
    
    /**
     * Cancel renaming
     */
    cancelRename() {
      this.showRenameDialog = false;
      this.renameValue = '';
      this.renameType = '';
      this.renameId = '';
    },
    
    /**
     * Confirm renaming
     */
    confirmRename() {
      if (!this.renameValue.trim()) {
        this.$emit('notification', {
          type: 'error',
          message: 'Name cannot be empty',
          duration: 3000
        });
        return;
      }
      
      if (this.renameType === 'library') {
        // Find the library
        const library = this.libraries.find(lib => lib.id === this.renameId);
        if (!library) return;
        
        // Update the name
        library.name = this.renameValue.trim();
        
        // Show notification
        this.$emit('notification', {
          type: 'success',
          message: `Renamed library to "${library.name}"`,
          duration: 2000
        });
      } else if (this.renameType === 'shape') {
        // Find the shape
        const shape = this.shapes.find(s => s.id === this.renameId);
        if (!shape) return;
        
        // Update the name
        shape.name = this.renameValue.trim();
        
        // Show notification
        this.$emit('notification', {
          type: 'success',
          message: `Renamed shape to "${shape.name}"`,
          duration: 2000
        });
      } else if (this.renameType === 'new-shape') {
        // Create a new shape from selected shapes
        const id = 'shape_' + Date.now();
        const name = this.renameValue.trim();
        
        let data;
        if (this.selectedShapes.length === 1) {
          // Single shape
          data = { ...this.selectedShapes[0] };
          delete data.id; // Remove the original ID
        } else {
          // Group of shapes
          data = {
            type: 'group',
            shapes: this.selectedShapes.map(shape => {
              const copy = { ...shape };
              delete copy.id; // Remove the original ID
              return copy;
            })
          };
        }
        
        // Create the shape
        const shape = {
          id,
          libraryId: this.currentLibraryId,
          name,
          data,
          thumbnail: null
        };
        
        // Add the shape
        this.shapes.push(shape);
        
        // Generate thumbnail
        shape.thumbnail = this.generateShapeThumbnail(data);
        
        // Show notification
        this.$emit('notification', {
          type: 'success',
          message: `Added shape "${name}" to library`,
          duration: 2000
        });
      }
      
      // Save the data
      this.saveData();
      
      // Close the dialog
      this.showRenameDialog = false;
      this.renameValue = '';
      this.renameType = '';
      this.renameId = '';
    },
    
    /**
     * Delete a shape
     */
    deleteShape() {
      this.showContextMenu = false;
      
      // Find the selected shape
      const shape = this.shapes.find(s => s.id === this.selectedShapeId);
      if (!shape) return;
      
      // Confirm deletion
      if (!confirm(`Are you sure you want to delete the shape "${shape.name}"?`)) {
        return;
      }
      
      // Remove the shape
      const index = this.shapes.findIndex(s => s.id === shape.id);
      if (index !== -1) {
        this.shapes.splice(index, 1);
      }
      
      // Save the data
      this.saveData();
      
      // Show notification
      this.$emit('notification', {
        type: 'success',
        message: `Deleted shape "${shape.name}"`,
        duration: 2000
      });
    },
    
    /**
     * Handle drop event
     */
    handleDrop(event) {
      // Prevent default behavior
      event.preventDefault();
      
      // First, try to get data from dataTransfer
      try {
        const jsonData = event.dataTransfer.getData('application/json');
        if (jsonData) {
          const data = JSON.parse(jsonData);
          console.log('Dropped JSON data:', data);
          
          // Check if this is a shape from the canvas
          if (data.type === 'canvas-shape') {
            this.addShapeFromCanvas(data.shape);
            return;
          }
        }
      } catch (error) {
        console.warn('Error parsing dropped JSON data:', error);
      }
      
      // If no JSON data, try to handle files
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        // Handle the first file
        const file = files[0];
        
        // Handle different file types
        if (file.type.includes('image')) {
          this.importImageShape(file);
        } else if (file.name.endsWith('.svg')) {
          this.importSvgShape(file);
        } else if (file.name.endsWith('.json')) {
          this.importJsonShape(file);
        } else {
          this.$emit('notification', {
            type: 'error',
            message: 'Unsupported file type',
            duration: 3000
          });
        }
      }
    },
    
    /**
     * Add a shape from the canvas to the library
     */
    addShapeFromCanvas(shape) {
      console.log('Adding shape from canvas to library:', shape);
      
      // Create a new library shape
      const newShape = {
        id: 'lib_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: shape.type.charAt(0).toUpperCase() + shape.type.slice(1),
        description: 'Added from canvas',
        category: 'Custom',
        libraryId: this.currentLibraryId,
        data: {
          type: shape.type,
          width: shape.width,
          height: shape.height,
          fill: shape.fill,
          stroke: shape.stroke,
          strokeWidth: shape.strokeWidth,
          points: shape.points,
          radius: shape.radius,
          src: shape.src
        }
      };
      
      // Add the shape to the library
      this.shapes.push(newShape);
      
      // Save the updated library
      this.saveData();
      
      // Show success notification
      this.$emit('notification', {
        type: 'success',
        message: 'Shape added to library',
        duration: 2000
      });
    },
    
    /**
     * Save data to localStorage
     */
    saveData() {
      try {
        localStorage.setItem('shapeLibraries', JSON.stringify(this.libraries));
        localStorage.setItem('shapeLibraryShapes', JSON.stringify(this.shapes));
      } catch (error) {
        console.error('Error saving shape library data:', error);
      }
    },
    
    /**
     * Load data from localStorage
     */
    loadData() {
      try {
        // Try to load from localStorage
        const libraries = localStorage.getItem('shapeLibraries');
        const shapes = localStorage.getItem('shapeLibraryShapes');
        
        if (libraries) {
          try {
            const parsedLibraries = JSON.parse(libraries);
            if (Array.isArray(parsedLibraries) && parsedLibraries.length > 0) {
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
            if (Array.isArray(parsedShapes) && parsedShapes.length > 0) {
              this.shapes = parsedShapes;
              console.log('Loaded', this.shapes.length, 'shapes from localStorage');
            }
          } catch (e) {
            console.error('Failed to parse shapes from localStorage:', e);
          }
        }
        
        // Ensure the default library exists
        if (!this.libraries.some(lib => lib.id === 'default')) {
          this.libraries.push({ id: 'default', name: 'Default Library' });
        }
      } catch (error) {
        console.error('Error loading shape library data:', error);
      }
    },
    
    /**
     * Generate thumbnails for all shapes
     */
    generateThumbnails() {
      try {
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
        
        // Save the updated shapes
        this.saveData();
      } catch (error) {
        console.error('Error generating thumbnails:', error);
      }
    },
    
    /**
     * Generate a simple SVG thumbnail for a shape
     */
    generateShapeThumbnail(shapeData) {
      try {
        if (!shapeData || typeof shapeData !== 'object') {
          return this.generateDefaultThumbnail('Invalid');
        }
        
        // Smaller thumbnail size
        const size = 60;
        const padding = 5;
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
    },
    
    /**
     * Add default shapes to the current library
     */
    addDefaultShapes() {
      try {
        // Define default shapes for the current library
        const defaultShapes = [];
        
        if (this.currentLibraryId === 'default') {
          // Basic shapes for the default library
          defaultShapes.push(
            { 
              id: 'shape_' + Date.now() + '_1', 
              libraryId: 'default', 
              name: 'Rectangle', 
              data: { type: 'rect', width: 100, height: 50, fill: '#3B82F6' },
              thumbnail: null
            },
            { 
              id: 'shape_' + Date.now() + '_2', 
              libraryId: 'default', 
              name: 'Circle', 
              data: { type: 'circle', radius: 40, fill: '#10B981' },
              thumbnail: null
            },
            { 
              id: 'shape_' + Date.now() + '_3', 
              libraryId: 'default', 
              name: 'Triangle', 
              data: { type: 'polygon', points: '0,60 60,0 120,60', fill: '#F59E0B' },
              thumbnail: null
            },
            { 
              id: 'shape_' + Date.now() + '_4', 
              libraryId: 'default', 
              name: 'Star', 
              data: { type: 'polygon', points: '50,0 61,35 98,35 68,57 79,91 50,70 21,91 32,57 2,35 39,35', fill: '#EC4899' },
              thumbnail: null
            }
          );
        } else if (this.currentLibraryId === 'hvac') {
          // HVAC components
          defaultShapes.push(
            { 
              id: 'shape_' + Date.now() + '_5', 
              libraryId: 'hvac', 
              name: 'VAV Box', 
              data: { 
                type: 'rect', 
                width: 80, 
                height: 60, 
                fill: '#E5E7EB',
                stroke: '#374151',
                strokeWidth: 2,
                rx: 5,
                ry: 5
              },
              thumbnail: null,
              partProperties: {
                name: 'VAV Box',
                haystackTag: 'vav',
                partNumber: 'VAV-001',
                quantity: 1,
                description: 'Variable Air Volume terminal unit',
                pointType: 'AI',
                pdfPath: ''
              }
            },
            { 
              id: 'shape_' + Date.now() + '_6', 
              libraryId: 'hvac', 
              name: 'AHU', 
              data: { 
                type: 'rect', 
                width: 120, 
                height: 80, 
                fill: '#D1D5DB',
                stroke: '#1F2937',
                strokeWidth: 2,
                rx: 2,
                ry: 2
              },
              thumbnail: null,
              partProperties: {
                name: 'Air Handling Unit',
                haystackTag: 'ahu',
                partNumber: 'AHU-001',
                quantity: 1,
                description: 'Air Handling Unit with supply and return fans',
                pointType: 'AI',
                pdfPath: ''
              }
            }
          );
        } else if (this.currentLibraryId === 'electrical') {
          // Electrical symbols
          defaultShapes.push(
            { 
              id: 'shape_' + Date.now() + '_7', 
              libraryId: 'electrical', 
              name: 'Switch', 
              data: { 
                type: 'path', 
                d: 'M 10,50 L 40,50 M 60,30 L 90,50 L 60,70', 
                fill: 'none',
                stroke: '#000000',
                strokeWidth: 2
              },
              thumbnail: null
            },
            { 
              id: 'shape_' + Date.now() + '_8', 
              libraryId: 'electrical', 
              name: 'Outlet', 
              data: { 
                type: 'circle', 
                radius: 20, 
                fill: 'white',
                stroke: '#000000',
                strokeWidth: 2
              },
              thumbnail: null
            }
          );
        } else {
          // For custom libraries, add some basic shapes
          defaultShapes.push(
            { 
              id: 'shape_' + Date.now() + '_9', 
              libraryId: this.currentLibraryId, 
              name: 'Rectangle', 
              data: { type: 'rect', width: 100, height: 50, fill: '#3B82F6' },
              thumbnail: null
            },
            { 
              id: 'shape_' + Date.now() + '_10', 
              libraryId: this.currentLibraryId, 
              name: 'Circle', 
              data: { type: 'circle', radius: 40, fill: '#10B981' },
              thumbnail: null
            }
          );
        }
        
        // Add the shapes to the library
        if (defaultShapes.length > 0) {
          this.shapes.push(...defaultShapes);
          
          // Generate thumbnails for the new shapes
          this.$nextTick(() => {
            defaultShapes.forEach(shape => {
              if (!shape.thumbnail) {
                shape.thumbnail = this.generateShapeThumbnail(shape.data);
              }
            });
            
            // Save the data
            this.saveData();
            
            // Show notification
            this.$emit('notification', {
              type: 'success',
              message: `Added ${defaultShapes.length} default shapes to library`,
              duration: 2000
            });
          });
        } else {
          this.$emit('notification', {
            type: 'info',
            message: 'No default shapes available for this library',
            duration: 2000
          });
        }
      } catch (error) {
        console.error('Error adding default shapes:', error);
        this.$emit('notification', {
          type: 'error',
          message: 'Error adding default shapes',
          duration: 3000
        });
      }
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
</style>