<template>
  <div 
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="$emit('close')"
  >
    <div 
      class="bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-3/4 max-w-4xl max-h-[80vh] flex flex-col"
      @click.stop
    >
      <div class="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
        <div class="flex items-center gap-2">
          <div class="flex items-center mr-2">
            <span class="text-xs text-gray-400 mr-2">Show:</span>
            <select 
              v-model="filterStatus" 
              class="px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Shortcuts</option>
              <option value="active">Active Only</option>
              <option value="planned">Planned Only</option>
            </select>
          </div>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search shortcuts..."
            class="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            @click="$emit('close')" 
            class="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="overflow-y-auto p-4 flex-1">
        <div class="bg-gray-700 p-3 rounded-md mb-4 text-sm text-gray-300">
          <p><span class="font-semibold text-green-400">●</span> Active shortcuts are currently implemented and working.</p>
          <p><span class="font-semibold text-yellow-400">●</span> Planned shortcuts will be implemented in future updates.</p>
        </div>
        
        <div v-if="filteredShortcuts.length === 0" class="text-center text-gray-400 py-8">
          No shortcuts match your search.
        </div>
        
        <div v-for="(category, index) in filteredShortcuts" :key="index" class="mb-6">
          <h3 class="text-lg font-medium text-blue-400 mb-2">{{ category.name }}</h3>
          <div class="bg-gray-900 rounded-lg overflow-hidden">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-gray-800">
                  <th class="px-4 py-2 text-left text-gray-300 font-medium">Action</th>
                  <th class="px-4 py-2 text-left text-gray-300 font-medium">Shortcut</th>
                  <th class="px-4 py-2 text-left text-gray-300 font-medium">Description</th>
                  <th class="px-4 py-2 text-left text-gray-300 font-medium w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(shortcut, i) in category.shortcuts" :key="i" class="border-t border-gray-800">
                  <td class="px-4 py-3 text-white">{{ shortcut.action }}</td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="(key, k) in shortcut.keys" 
                        :key="k" 
                        class="inline-block bg-gray-700 px-2 py-1 rounded text-white font-mono text-xs"
                      >
                        {{ key }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-gray-300">{{ shortcut.description }}</td>
                  <td class="px-4 py-3">
                    <span 
                      :class="{
                        'text-green-400': shortcut.active,
                        'text-yellow-400': !shortcut.active
                      }"
                      class="font-semibold"
                    >
                      ● {{ shortcut.active ? 'Active' : 'Planned' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeyboardShortcutsPanel',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialPosition: {
      type: Object,
      default: () => ({ x: 100, y: 100 })
    }
  },
  data() {
    return {
      searchQuery: '',
      filterStatus: 'all',
      shortcuts: [
        {
          name: 'File Operations',
          shortcuts: [
            { action: 'New Document', keys: ['Ctrl', 'N'], description: 'Create a new document', active: false },
            { action: 'Open Document', keys: ['Ctrl', 'O'], description: 'Open an existing document', active: false },
            { action: 'Save', keys: ['Ctrl', 'S'], description: 'Save the current document', active: false },
            { action: 'Save As', keys: ['Ctrl', 'Shift', 'S'], description: 'Save the document with a new name', active: false },
            { action: 'Export', keys: ['Ctrl', 'E'], description: 'Export the document to various formats', active: false },
            { action: 'Print', keys: ['Ctrl', 'P'], description: 'Print the current document', active: false }
          ]
        },
        {
          name: 'Editing',
          shortcuts: [
            { action: 'Undo', keys: ['Ctrl', 'Z'], description: 'Undo the last action', active: true },
            { action: 'Redo', keys: ['Ctrl', 'Y'], description: 'Redo the previously undone action', active: true },
            { action: 'Cut', keys: ['Ctrl', 'X'], description: 'Cut the selected shapes', active: true },
            { action: 'Copy', keys: ['Ctrl', 'C'], description: 'Copy the selected shapes', active: true },
            { action: 'Paste', keys: ['Ctrl', 'V'], description: 'Paste from clipboard', active: true },
            { action: 'Delete', keys: ['Delete'], description: 'Delete selected shapes', active: true },
            { action: 'Select All', keys: ['Ctrl', 'A'], description: 'Select all shapes on the active layer', active: true }
          ]
        },
        {
          name: 'View',
          shortcuts: [
            { action: 'Zoom In', keys: ['Ctrl', '+'], description: 'Zoom in on the canvas', active: true },
            { action: 'Zoom Out', keys: ['Ctrl', '-'], description: 'Zoom out on the canvas', active: true },
            { action: 'Fit to Screen', keys: ['Ctrl', '0'], description: 'Fit the drawing to the screen', active: true },
            { action: 'Actual Size', keys: ['Ctrl', '1'], description: 'View at 100% zoom', active: false },
            { action: 'Toggle Grid', keys: ['Ctrl', 'G'], description: 'Show or hide the grid', active: false },
            { action: 'Toggle Rulers', keys: ['Ctrl', 'R'], description: 'Show or hide rulers', active: false },
            { action: 'Toggle Layers Panel', keys: ['F7'], description: 'Show or hide the layers panel', active: false }
          ]
        },
        {
          name: 'Tools',
          shortcuts: [
            { action: 'Selection Tool', keys: ['V'], description: 'Switch to the selection tool', active: false },
            { action: 'Line Tool', keys: ['L'], description: 'Switch to the line tool', active: false },
            { action: 'Rectangle Tool', keys: ['R'], description: 'Switch to the rectangle tool', active: false },
            { action: 'Ellipse Tool', keys: ['E'], description: 'Switch to the ellipse tool', active: false },
            { action: 'Text Tool', keys: ['T'], description: 'Switch to the text tool', active: false },
            { action: 'Pen Tool', keys: ['P'], description: 'Switch to the pen tool', active: false },
            { action: 'Hand Tool', keys: ['H'], description: 'Switch to the hand tool for panning', active: false },
            { action: 'Zoom Tool', keys: ['Z'], description: 'Switch to the zoom tool', active: false }
          ]
        },
        {
          name: 'Arrange',
          shortcuts: [
            { action: 'Bring to Front', keys: ['Ctrl', 'Shift', ']'], description: 'Bring selected shapes to the front', active: false },
            { action: 'Send to Back', keys: ['Ctrl', 'Shift', '['], description: 'Send selected shapes to the back', active: false },
            { action: 'Bring Forward', keys: ['Ctrl', ']'], description: 'Bring selected shapes forward one level', active: false },
            { action: 'Send Backward', keys: ['Ctrl', '['], description: 'Send selected shapes backward one level', active: false },
            { action: 'Group', keys: ['Ctrl', 'G'], description: 'Group selected shapes', active: false },
            { action: 'Ungroup', keys: ['Ctrl', 'Shift', 'G'], description: 'Ungroup selected shapes', active: false },
            { action: 'Lock Selection', keys: ['Ctrl', 'L'], description: 'Lock selected shapes', active: false }
          ]
        },
        {
          name: 'Miscellaneous',
          shortcuts: [
            { action: 'Toggle Shape Library', keys: ['F8'], description: 'Show or hide the shape library', active: false },
            { action: 'Toggle Calculator', keys: ['F9'], description: 'Show or hide the calculator', active: false },
            { action: 'Toggle Color Picker', keys: ['F10'], description: 'Show or hide the color picker', active: false },
            { action: 'Toggle BOM Generator', keys: ['F11'], description: 'Show or hide the BOM generator', active: false },
            { action: 'Toggle Keyboard Shortcuts', keys: ['F1'], description: 'Show or hide keyboard shortcuts panel', active: true },
            { action: 'Toggle Snap to Grid', keys: ['G'], description: 'Enable or disable snap to grid', active: true },
            { action: 'Cancel/Escape', keys: ['Esc'], description: 'Cancel current operation or clear selection', active: true }
          ]
        }
      ]
    };
  },
  computed: {
    filteredShortcuts() {
      let filtered = this.shortcuts;
      
      // First filter by status if needed
      if (this.filterStatus !== 'all') {
        const isActive = this.filterStatus === 'active';
        filtered = filtered.map(category => {
          const filteredShortcuts = category.shortcuts.filter(shortcut => 
            shortcut.active === isActive
          );
          
          if (filteredShortcuts.length > 0) {
            return {
              name: category.name,
              shortcuts: filteredShortcuts
            };
          }
          
          return null;
        }).filter(category => category !== null);
      }
      
      // Then filter by search query if provided
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        
        filtered = filtered.map(category => {
          const filteredShortcuts = category.shortcuts.filter(shortcut => 
            shortcut.action.toLowerCase().includes(query) || 
            shortcut.description.toLowerCase().includes(query) ||
            shortcut.keys.some(key => key.toLowerCase().includes(query))
          );
          
          if (filteredShortcuts.length > 0) {
            return {
              name: category.name,
              shortcuts: filteredShortcuts
            };
          }
          
          return null;
        }).filter(category => category !== null);
      }
      
      return filtered;
    }
  }
};
</script>