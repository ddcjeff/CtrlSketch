<template>
  <div class="ribbon bg-gray-800 border-b border-gray-700 shadow-md h-28 overflow-x-auto">
    <div class="w-full mx-auto px-4 py-1" data-glossy-target="ribbon">
      <!-- Home Tab -->
      <template v-if="activeTab === 'Home'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Selection Tools Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tools</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'select' })"
              >
                <span class="mr-1 text-indigo-400">⬜</span>
                <span>Select</span>
                <div class="tooltip">
                  Select and manipulate objects
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'hand' })"
              >
                <span class="mr-1 text-indigo-400">✋</span>
                <span>Pan</span>
                <div class="tooltip">
                  Pan around the canvas
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'zoom-in' })"
              >
                <span class="mr-1 text-indigo-400">+</span>
                <span>Zoom In</span>
                <div class="tooltip">
                  Zoom in on the canvas
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'zoom-out' })"
              >
                <span class="mr-1 text-indigo-400">-</span>
                <span>Zoom Out</span>
                <div class="tooltip">
                  Zoom out on the canvas
                </div>
              </button>
            </div>
          </div>
          
          <!-- Clipboard Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Clipboard</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'cut' })"
              >
                <span class="mr-1 text-indigo-400">X</span>
                <span>Cut</span>
                <div class="tooltip">
                  Cut selected objects
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'copy' })"
              >
                <span class="mr-1 text-indigo-400">C</span>
                <span>Copy</span>
                <div class="tooltip">
                  Copy selected objects
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'paste' })"
              >
                <span class="mr-1 text-indigo-400">V</span>
                <span>Paste</span>
                <div class="tooltip">
                  Paste objects from clipboard
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
      
      <!-- Insert Tab -->
      <template v-if="activeTab === 'Insert'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Insert Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Insert</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'insert', value: 'page' })"
              >
                <span class="mr-1 text-indigo-400">📄</span>
                <span>Page</span>
                <div class="tooltip">
                  Add a new page to your document
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'insert', value: 'layers' })"
              >
                <span class="mr-1 text-indigo-400">📚</span>
                <span>Layers</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'import', value: 'png' })"
              >
                <span class="mr-1 text-indigo-400">🖼️</span>
                <span>Import PNG</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'import', value: 'svg' })"
              >
                <span class="mr-1 text-indigo-400">📐</span>
                <span>Import SVG</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'import', value: 'json' })"
              >
                <span class="mr-1 text-indigo-400">📋</span>
                <span>Import JSON</span>
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'Draw'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Tools Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[250px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tools</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'rectangle' })"
              >
                <span class="mr-1 text-indigo-400">⬜</span>
                <span>Rectangle</span>
                <div class="tooltip">
                  Draw a rectangle by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'circle' })"
              >
                <span class="mr-1 text-indigo-400">⚪</span>
                <span>Circle</span>
                <div class="tooltip">
                  Draw a circle by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'ellipse' })"
              >
                <span class="mr-1 text-indigo-400">🔵</span>
                <span>Ellipse</span>
                <div class="tooltip">
                  Draw an ellipse by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'line' })"
              >
                <span class="mr-1 text-indigo-400">➖</span>
                <span>Line</span>
                <div class="tooltip">
                  Draw a straight line by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'arrow' })"
              >
                <span class="mr-1 text-indigo-400">➡️</span>
                <span>Arrow</span>
                <div class="tooltip">
                  Draw an arrow by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'pen' })"
              >
                <span class="mr-1 text-indigo-400">✍️</span>
                <span>Pen</span>
                <div class="tooltip">
                  Draw freehand by clicking and dragging
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'text' })"
              >
                <span class="mr-1 text-indigo-400">🔤</span>
                <span>Text</span>
                <div class="tooltip">
                  Add text by clicking where you want to place it
                </div>
              </button>
            </div>
          </div>
          <!-- Style Section (Fill and Line Color) -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[250px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Style</h3>
            <div class="flex gap-2 nowrap items-center">
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Fill:</label>
                <input 
                  type="color" 
                  value="#000000" 
                  @input="$emit('ribbon-action', { type: 'style', value: { fill: $event.target.value } })" 
                  class="w-6 h-6 bg-gray-800 rounded-md border border-gray-700 cursor-pointer"
                >
              </div>
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Line:</label>
                <input 
                  type="color" 
                  value="#000000" 
                  @input="$emit('ribbon-action', { type: 'style', value: { stroke: $event.target.value } })" 
                  class="w-6 h-6 bg-gray-800 rounded-md border border-gray-700 cursor-pointer"
                >
              </div>
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Width:</label>
                <input 
                  type="number" 
                  value="2" 
                  @input="$emit('ribbon-action', { type: 'style', value: { lineWidth: Number($event.target.value) } })" 
                  class="w-12 px-1 py-0.5 text-xs bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="1"
                  max="10"
                >
              </div>
            </div>
          </div>
          <!-- AI Suggestion Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[150px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">AI</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'ai', value: 'suggest' })"
              >
                <span class="mr-1 text-indigo-400">🤖</span>
                <span>Suggest Shape</span>
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'View'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- View Options Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">View</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'grid' })"
              >
                <span class="mr-1 text-indigo-400">📏</span>
                <span>Toggle Grid</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'rulers' })"
              >
                <span class="mr-1 text-indigo-400">📐</span>
                <span>Toggle Rulers</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'snapToGrid' })"
              >
                <span class="mr-1 text-indigo-400">🧲</span>
                <span>Snap to Grid</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'zoomIn' })"
              >
                <span class="mr-1 text-indigo-400">🔍</span>
                <span>Zoom In</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'zoomOut' })"
              >
                <span class="mr-1 text-indigo-400">🔍</span>
                <span>Zoom Out</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs rounded-md transition-colors duration-200"
                :class="[
                  showLayers 
                    ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                ]"
                @click="$emit('ribbon-action', { type: 'view', value: 'layers' })"
              >
                <span class="mr-1" :class="showLayers ? 'text-white' : 'text-indigo-400'">📚</span>
                <span>Layers</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'pages' })"
              >
                <span class="mr-1 text-indigo-400">📄</span>
                <span>Pages</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'view', value: 'shapeLibrary' })"
              >
                <span class="mr-1 text-indigo-400">📦</span>
                <span>Shape Library</span>
              </button>
            </div>
          </div>
          <!-- Grid Settings Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[300px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Grid Settings</h3>
            <div class="flex gap-2 flex-wrap items-center">
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Size:</label>
                <input 
                  type="number" 
                  :value="gridSize" 
                  @input="$emit('ribbon-action', { type: 'view', value: { gridSize: $event.target.value } })" 
                  class="w-12 px-1 py-0.5 text-xs bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                >
              </div>
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Opacity:</label>
                <input 
                  type="range" 
                  :value="gridOpacity" 
                  @input="$emit('ribbon-action', { type: 'view', value: { gridOpacity: $event.target.value / 100 } })" 
                  class="w-24 h-4 bg-gray-800 rounded-md appearance-none cursor-pointer"
                  min="0"
                  max="100"
                  step="1"
                >
                <span class="text-xs text-gray-200 ml-1">{{ Math.round(gridOpacity) }}%</span>
              </div>
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Type:</label>
                <select
                  :value="gridType"
                  @change="$emit('ribbon-action', { type: 'view', value: { gridType: $event.target.value } })"
                  class="px-1 py-0.5 text-xs bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="square">Square</option>
                  <option value="isometric">Isometric</option>
                  <option value="perspective">Perspective</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div class="flex items-center">
                <label class="text-xs text-gray-200 mr-1">Color:</label>
                <input
                  type="color"
                  :value="gridColor"
                  @change="$emit('ribbon-action', { type: 'view', value: { gridColor: $event.target.value } })"
                  class="w-6 h-6 p-0 bg-transparent border-0 rounded cursor-pointer"
                >
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'Tools'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Document Tools -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Document</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'pageManager' })"
              >
                <span class="mr-1 text-indigo-400">📑</span>
                <span>Page Manager</span>
                <div class="tooltip">
                  Manage pages in your document
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'layerManager' })"
              >
                <span class="mr-1 text-indigo-400">📚</span>
                <span>Layer Manager</span>
                <div class="tooltip">
                  Manage layers in your document
                </div>
              </button>
            </div>
          </div>
          
          <!-- Utility Tools -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Utilities</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'calculator' })"
              >
                <span class="mr-1 text-indigo-400">🧮</span>
                <span>Calculator</span>
                <div class="tooltip">
                  Open the calculator tool
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'colorPicker' })"
              >
                <span class="mr-1 text-indigo-400">🎨</span>
                <span>Color Picker</span>
                <div class="tooltip">
                  Advanced color selection tool
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'bomGenerator' })"
              >
                <span class="mr-1 text-indigo-400">📋</span>
                <span>BOM Generator</span>
                <div class="tooltip">
                  Generate Bill of Materials
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ribbon',
  props: {
    activeTab: {
      type: String,
      default: 'Home'
    },
    gridSize: {
      type: Number,
      default: 20
    },
    gridOpacity: {
      type: Number,
      default: 0.5
    },
    gridType: {
      type: String,
      default: 'square'
    },
    gridColor: {
      type: String,
      default: '#000000'
    },
    showLayers: {
      type: Boolean,
      default: false
    },
    showShapeLibrary: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.nowrap {
  flex-wrap: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
}
::-webkit-scrollbar {
  height: 8px;
}
::-webkit-scrollbar-track {
  @apply bg-gray-900;
}
::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded-full;
}
::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}

/* Wider but shorter ribbon buttons - optimized for horizontal space */
button {
  @apply min-w-[100px] px-3 py-0.5 text-xs h-6 flex items-center justify-start;
}

/* Improve section containers - wider with less vertical padding */
.bg-gray-900 {
  @apply min-w-[200px] px-3 py-1 rounded-lg shadow-sm;
}

/* Increase spacing between sections */
.flex.gap-4 {
  @apply gap-6;
}

/* Increase spacing between buttons */
.flex.gap-1 {
  @apply gap-2;
}

/* Improve section headers - less vertical space */
h3 {
  @apply text-xs font-medium text-gray-300 mb-0.5 uppercase tracking-wider;
}

/* Make icons more compact but still visible */
button span:first-child {
  @apply text-sm mr-1;
}

/* Improve button text */
button span:nth-child(2) {
  @apply font-medium;
}
</style>