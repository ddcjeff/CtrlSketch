<template>
  <div class="ribbon bg-gray-800 border-b border-gray-700 shadow-md h-28 overflow-x-auto">
    <div class="w-full mx-auto px-4 py-1">
      <!-- Home Tab -->
      <template v-if="activeTab === 'Home'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Canvas Tools Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tools</h3>
            <div class="flex gap-1 nowrap">
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
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'copy' }); console.log('Copy button clicked');"
                id="copy-button"
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
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'import', value: 'excel' })"
              >
                <span class="mr-1 text-indigo-400">📊</span>
                <span>Excel Table</span>
                <div class="tooltip">
                  Import an Excel spreadsheet as a table
                </div>
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
                @click="$emit('ribbon-action', { type: 'tool', value: 'flexline' })"
              >
                <span class="mr-1 text-indigo-400">⟿</span>
                <span>Flex Line</span>
                <div class="tooltip">
                  Draw a line with right-angle bends (orthogonal routing)
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tool', value: 'connection-point' })"
              >
                <span class="mr-1 text-indigo-400">✛</span>
                <span>Connection Point</span>
                <div class="tooltip">
                  Add connection points to shapes that lines can snap to (invisible when printing)
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
                @click="showPageSelector = true"
              >
                <span class="mr-1 text-indigo-400">📄</span>
                <span>Show Pages</span>
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
                @click="$emit('ribbon-action', { type: 'view', value: 'snapToObjects' })"
              >
                <span class="mr-1 text-indigo-400">🔗</span>
                <span>Snap to Objects</span>
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
              <!-- Simple Page Selector Button -->
              <div class="relative">
                <button 
                  class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                  @click="showPageSelector = true; console.log('Show page selector clicked, showPageSelector =', showPageSelector)"
                >
                  <span class="mr-1 text-indigo-400">📄</span>
                  <span>Pages</span>
                </button>
              </div>
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
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'makeShapePart' })"
              >
                <span class="mr-1 text-indigo-400">🔧</span>
                <span>Make Shape a Part</span>
                <div class="tooltip">
                  Convert selected shape to a BOM part
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'tools', value: 'partsPlusBrowser' })"
              >
                <span class="mr-1 text-indigo-400">📦</span>
                <span>Parts Plus</span>
                <div class="tooltip">
                  Browse parts by manufacturer, category and sub-category
                </div>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  
  <!-- Draggable Page Selector Panel -->
  <div 
    v-if="showPageSelector" 
    class="fixed z-[2000] border border-gray-700 rounded-lg overflow-hidden"
    :class="{ 'border-indigo-500': isPinned }"
    style="box-shadow: none !important; background-color: #1f2937 !important;"
    :style="{ left: pageSelectorPosition.x + 'px', top: pageSelectorPosition.y + 'px' }"
  >
    <!-- Panel Content -->
    <div class="bg-gray-800 w-64">
      <!-- Header with drag handle -->
      <div 
        class="p-2 bg-gray-900 flex justify-between items-center"
        style="cursor: move;"
        @mousedown="startDrag"
      >
        <h3 class="text-sm font-medium text-white">Pages</h3>
        <div class="flex items-center space-x-2">
          <button 
            @click="togglePinPageSelector" 
            class="text-gray-400 hover:text-white px-2 py-1"
            :class="{ 'text-yellow-400': isPinned }"
          >
            <span class="text-sm">📌</span>
          </button>
          <button @click="showPageSelector = false" class="text-gray-400 hover:text-white px-2 py-1">
            <span class="text-sm">×</span>
          </button>
        </div>
      </div>
      
      <!-- Page List -->
      <div class="p-2 max-h-[60vh] overflow-y-auto">
        <div class="space-y-1">
          <div 
            v-for="page in pages" 
            :key="page.id"
            class="flex items-center p-1.5 rounded cursor-pointer hover:bg-gray-700 text-sm"
            :class="{ 'bg-gray-700': activePageId === page.id }"
            @click="selectPage(page.id); console.log('Clicked on page:', page.id, page.name)"
          >
            <span v-if="activePageId === page.id" class="mr-1.5 text-yellow-400">▶</span>
            <span v-else class="mr-1.5 opacity-0">▶</span>
            <span class="text-white truncate">{{ page.name }}</span>
            <span v-if="page.type === 'background'" class="ml-1.5 text-xs bg-blue-800 px-1 rounded">BG</span>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-2 bg-gray-900 border-t border-gray-700">
        <button 
          @click="openPageManager"
          class="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm"
        >
          Manage Pages
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Ribbon',
  emits: ['ribbon-action'],
  data() {
    return {
      showPageSelector: false,
      pageSelectorPosition: { x: 100, y: 100 },
      isDraggingPageSelector: false,
      dragOffset: { x: 0, y: 0 },
      isPinned: false
    };
  },
  mounted() {
    // Initialize page selector position to a good default
    this.pageSelectorPosition = {
      x: Math.max(window.innerWidth / 2 - 150, 10),
      y: Math.max(window.innerHeight / 2 - 200, 10)
    };
    
    // Restore pin state from localStorage
    try {
      const savedPinState = localStorage.getItem('pageSelectorPinned');
      if (savedPinState === 'true') {
        this.isPinned = true;
      }
    } catch (e) {
      console.error('Failed to restore pin state from localStorage:', e);
    }
    
    // Restore position from localStorage
    try {
      const savedPosition = localStorage.getItem('pageSelectorPosition');
      if (savedPosition) {
        const position = JSON.parse(savedPosition);
        if (position && typeof position.x === 'number' && typeof position.y === 'number') {
          this.pageSelectorPosition = position;
        }
      }
    } catch (e) {
      console.error('Failed to restore position from localStorage:', e);
    }
  },
  beforeUnmount() {
    // No need to clean up event listeners as they're automatically removed
    // when the component is unmounted
  },
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
    },
    pages: {
      type: Array,
      default: () => []
    },
    activePageId: {
      type: String,
      default: ''
    }
  },
  methods: {
    // Select a page
    selectPage(pageId) {
      console.log('Selecting page:', pageId);
      
      // Emit the event with the page ID
      console.log('Emitting ribbon-action event with:', { type: 'page', value: pageId });
      this.$emit('ribbon-action', { type: 'page', value: pageId });
      
      // Force a direct call to the store as a backup
      try {
        if (window.app && window.app.store) {
          console.log('Directly calling store.setActivePage with:', pageId);
          window.app.store.setActivePage(pageId);
        }
      } catch (e) {
        console.error('Error directly calling store.setActivePage:', e);
      }
      
      // Only close if not pinned
      if (!this.isPinned) {
        this.showPageSelector = false;
      }
    },
    
    // Open the page manager
    openPageManager() {
      console.log('Opening page manager');
      this.$emit('ribbon-action', { type: 'manage', value: 'pages' });
      
      // Only close if not pinned
      if (!this.isPinned) {
        this.showPageSelector = false;
      }
    },
    
    // Toggle pin state
    togglePinPageSelector() {
      this.isPinned = !this.isPinned;
      
      // Store the pin state in localStorage for persistence
      try {
        localStorage.setItem('pageSelectorPinned', this.isPinned ? 'true' : 'false');
      } catch (e) {
        console.error('Failed to save pin state to localStorage:', e);
      }
    },
    
    // Start dragging the page selector
    startDrag(event) {
      // Don't start drag if clicking buttons
      if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
        return;
      }
      
      // Get initial mouse position
      const startX = event.clientX;
      const startY = event.clientY;
      
      // Get initial panel position
      const startPanelX = this.pageSelectorPosition.x;
      const startPanelY = this.pageSelectorPosition.y;
      
      // Function to handle mouse movement
      const handleMouseMove = (moveEvent) => {
        // Calculate how far the mouse has moved
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        // Update panel position
        this.pageSelectorPosition = {
          x: Math.max(0, startPanelX + dx),
          y: Math.max(0, startPanelY + dy)
        };
      };
      
      // Function to handle mouse up
      const handleMouseUp = () => {
        // Remove event listeners
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        
        // Save position to localStorage
        try {
          localStorage.setItem('pageSelectorPosition', JSON.stringify(this.pageSelectorPosition));
        } catch (e) {
          console.error('Failed to save position to localStorage:', e);
        }
      };
      
      // Add event listeners
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      // Prevent default to avoid text selection
      event.preventDefault();
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

/* Remove all page selector styles */

/* Tooltip styles */
.tooltip-container {
  position: relative;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
  z-index: 1000;
  margin-bottom: 5px;
}

.tooltip-container:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

/* No page list item styles */

/* No custom scrollbar styles */

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