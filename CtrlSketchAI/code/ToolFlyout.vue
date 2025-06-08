<template>
  <div class="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 font-sans border-r border-gray-600 shadow-md">
    <h3 class="text-lg font-bold mb-4 text-primary-300 border-b border-gray-700 pb-2">Shapes</h3>
    
    <div class="space-y-1">
      <div 
        v-for="shape in shapes" 
        :key="shape.name"
        class="flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700/50 hover:text-primary-300 group"
        @click="selectShape(shape)"
      >
        <div class="w-8 h-8 mr-3 flex items-center justify-center bg-gray-700 rounded-md group-hover:bg-primary-900 transition-colors duration-200">
          <span v-html="getShapeIcon(shape.name)" class="w-5 h-5 text-primary-300 group-hover:text-primary-200"></span>
        </div>
        <span class="font-medium">{{ shape.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ToolFlyout',
  data: () => ({
    shapes: [
      { name: 'rect', label: 'Rectangle' },
      { name: 'circle', label: 'Circle' },
      { name: 'arrow', label: 'Arrow' },
      { name: 'diamond', label: 'Decision' }
    ]
  }),
  methods: {
    selectShape(shape) {
      this.$emit('shape-selected', shape.name);
    },
    getShapeIcon(shapeName) {
      // Simple SVG icons as strings
      const icons = {
        rect: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
              </svg>`,
        circle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" />
                </svg>`,
        arrow: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                 <line x1="5" y1="12" x2="19" y2="12" />
                 <polyline points="12 5 19 12 12 19" />
               </svg>`,
        diamond: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <polygon points="12 2 22 12 12 22 2 12" />
                 </svg>`
      };
      
      return icons[shapeName] || icons.rect;
    }
  }
}
</script>
