<template>
  <div class="bg-gray-800 border-b border-gray-700 shadow-md h-28 overflow-x-auto">
    <div class="w-full mx-auto px-2 py-1">
      <template v-if="activeTab === 'Home'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Clipboard Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[150px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Clipboard</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'paste' })"
              >
                <span class="mr-1 text-indigo-400">📋</span>
                <span>Paste</span>
                <div class="tooltip">
                  Paste copied or cut shapes (Ctrl+V)
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'cut' })"
              >
                <span class="mr-1 text-indigo-400">✂️</span>
                <span>Cut</span>
                <div class="tooltip">
                  Cut selected shapes to clipboard (Ctrl+X)
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'clipboard', value: 'copy' })"
              >
                <span class="mr-1 text-indigo-400">📝</span>
                <span>Copy</span>
                <div class="tooltip">
                  Copy selected shapes to clipboard (Ctrl+C)
                </div>
              </button>
            </div>
          </div>
          
          <!-- History Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[150px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">History</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'history', value: 'undo' })"
              >
                <span class="mr-1 text-indigo-400">↩️</span>
                <span>Undo</span>
                <div class="tooltip">
                  Undo the last action (Ctrl+Z)
                </div>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200 tooltip-container"
                @click="$emit('ribbon-action', { type: 'history', value: 'redo' })"
              >
                <span class="mr-1 text-indigo-400">↪️</span>
                <span>Redo</span>
                <div class="tooltip">
                  Redo the last undone action (Ctrl+Y)
                </div>
              </button>
            </div>
          </div>
          
          <!-- Arrange Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[150px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Arrange</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'arrange', value: 'group' })"
                title="Group selected shapes"
              >
                <span class="mr-1 text-indigo-400">🔗</span>
                <span>Group</span>
              </button>
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                @click="$emit('ribbon-action', { type: 'arrange', value: 'ungroup' })"
                title="Ungroup selected group"
              >
                <span class="mr-1 text-indigo-400">🔓</span>
                <span>Ungroup</span>
              </button>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'Insert'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Insert Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Insert</h3>
            <div class="flex gap-1 nowrap">
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
            </div>
          </div>
          <!-- Grid Settings Section -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[200px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Grid Settings</h3>
            <div class="flex gap-2 nowrap items-center">
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
                  type="number" 
                  :value="gridOpacity * 100" 
                  @input="$emit('ribbon-action', { type: 'view', value: { gridOpacity: $event.target.value } })" 
                  class="w-12 px-1 py-0.5 text-xs bg-gray-800 text-gray-200 rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  min="0"
                  max="100"
                >
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="activeTab === 'Tools'">
        <div class="flex gap-4 justify-start overflow-x-auto">
          <!-- Placeholder for Tools Tab -->
          <div class="bg-gray-900 rounded-lg p-2 min-w-[150px]">
            <h3 class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Tools</h3>
            <div class="flex gap-1 nowrap">
              <button 
                class="flex items-center px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-md transition-colors duration-200"
                disabled
              >
                <span class="mr-1 text-indigo-400">🔧</span>
                <span>Coming Soon</span>
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
    showLayers: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.nowrap {
  flex-wrap: nowrap;
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
</style>