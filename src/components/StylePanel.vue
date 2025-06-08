<template>
  <div 
    v-if="selectedShapes.length" 
    class="fixed right-0 top-[130px] w-[320px] bg-gradient-to-b from-gray-800 to-gray-900 border-l border-gray-600 p-5 z-40 h-[calc(100vh-130px)] overflow-y-auto text-white shadow-elegant"
  >
    <h3 class="text-xl font-bold mb-6 text-primary-300 border-b border-gray-600 pb-3 flex items-center">
      <span class="mr-2">⚙️</span> Properties
    </h3>
    
    <div 
      v-for="(shape, index) in selectedShapes.filter(s => s.type !== 'image')" 
      :key="shape.id + '-' + index"
      class="animate-in slide-in-from-right duration-300"
    >
      <div class="card bg-gray-800/50 backdrop-blur-sm border border-gray-700 mb-4 p-4 rounded-xl hover:shadow-inner-glow transition-all duration-300">
        <!-- Layer Selection -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Layer</label>
          <select 
            v-model="shape.layerId" 
            @change="updateShape(shape)"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option v-for="layer in layers" :key="layer.id" :value="layer.id">
              {{ layer.name }} {{ !layer.visible ? '(Hidden)' : '' }}
            </option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Line Width</label>
          <select 
            v-model="shape.lineWidth" 
            @change="updateShape(shape)"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option value="1">1px</option>
            <option value="2">2px</option>
            <option value="3">3px</option>
            <option value="4">4px</option>
            <option value="5">5px</option>
            <option value="8">8px</option>
            <option value="10">10px</option>
            <option value="12">12px</option>
            <option value="15">15px</option>
            <option value="20">20px</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Line Style</label>
          <select 
            v-model="shape.lineStyle" 
            @change="updateShape(shape)"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="dash-dot">Dash-Dot</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">Stroke Color</label>
          <div class="flex items-center">
            <input 
              type="color" 
              v-model="shape.stroke" 
              @input="updateShape(shape)"
              class="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-600 cursor-pointer mr-3 hover:scale-105 transition-transform duration-200"
            >
            <div class="text-sm font-mono bg-gray-700 px-3 py-1 rounded-md">{{ shape.stroke }}</div>
            <button 
              @click="setTransparentStroke(shape)" 
              :class="{'bg-primary-600': shape.stroke === 'transparent', 'bg-gray-700': shape.stroke !== 'transparent'}"
              class="ml-3 px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200 text-sm"
            >
              Transparent
            </button>
          </div>
        </div>
        
        <!-- Fill color section - different for text vs other shapes -->
        <div class="mb-4" v-if="shape.type !== 'text'">
          <label class="block text-sm font-medium text-gray-300 mb-2">Fill Color</label>
          <div class="flex items-center">
            <input 
              type="color" 
              v-model="shape.fill" 
              @input="updateShape(shape)"
              class="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-600 cursor-pointer mr-3 hover:scale-105 transition-transform duration-200"
            >
            <div class="text-sm font-mono bg-gray-700 px-3 py-1 rounded-md">{{ shape.fill }}</div>
            <button 
              @click="setTransparentFill(shape)" 
              :class="{'bg-primary-600': shape.fill === 'transparent', 'bg-gray-700': shape.fill !== 'transparent'}"
              class="ml-3 px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200 text-sm"
            >
              Transparent
            </button>
          </div>
        </div>
        
        <div v-if="shape.type === 'text'" class="mb-6 border-t border-gray-700 pt-4 mt-4">
          <h4 class="text-lg font-semibold text-primary-300 mb-3">Text Properties</h4>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Text Content</label>
            <input 
              type="text" 
              v-model="shape.text" 
              @input="updateShape(shape)"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Text Color</label>
            <div class="flex items-center">
              <input 
                type="color" 
                v-model="shape.fill" 
                @input="updateShape(shape)"
                class="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-600 cursor-pointer mr-3 hover:scale-105 transition-transform duration-200"
              >
              <div class="text-sm font-mono bg-gray-700 px-3 py-1 rounded-md">{{ shape.fill }}</div>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Font Family</label>
            <select 
              v-model="shape.fontFamily" 
              @change="updateShape(shape)"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            >
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
              <option value="'Courier New', monospace">Courier New</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="Verdana, sans-serif">Verdana</option>
              <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
              <option value="Impact, sans-serif">Impact</option>
              <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Font Size</label>
            <div class="flex items-center">
              <input 
                type="range" 
                v-model.number="shape.fontSize" 
                @input="updateShape(shape)"
                min="8" 
                max="72" 
                step="1"
                class="w-full mr-3 accent-primary-500"
              >
              <div class="text-sm font-mono bg-gray-700 px-3 py-1 rounded-md w-16 text-center">
                {{ shape.fontSize }}px
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Font Style</label>
            <div class="flex space-x-2">
              <button 
                @click="toggleFontStyle(shape, 'bold')" 
                :class="{'bg-primary-600': shape.fontWeight === 'bold', 'bg-gray-700': shape.fontWeight !== 'bold'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200"
              >
                <strong>B</strong>
              </button>
              <button 
                @click="toggleFontStyle(shape, 'italic')" 
                :class="{'bg-primary-600': shape.fontStyle === 'italic', 'bg-gray-700': shape.fontStyle !== 'italic'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200"
              >
                <em>I</em>
              </button>
              <button 
                @click="toggleFontStyle(shape, 'underline')" 
                :class="{'bg-primary-600': shape.textDecoration === 'underline', 'bg-gray-700': shape.textDecoration !== 'underline'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200"
              >
                <u>U</u>
              </button>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-300 mb-2">Text Alignment</label>
            <div class="flex space-x-2">
              <button 
                @click="setTextAlign(shape, 'left')" 
                :class="{'bg-primary-600': shape.textAlign === 'left', 'bg-gray-700': shape.textAlign !== 'left'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200 flex-1"
              >
                Left
              </button>
              <button 
                @click="setTextAlign(shape, 'center')" 
                :class="{'bg-primary-600': shape.textAlign === 'center', 'bg-gray-700': shape.textAlign !== 'center'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200 flex-1"
              >
                Center
              </button>
              <button 
                @click="setTextAlign(shape, 'right')" 
                :class="{'bg-primary-600': shape.textAlign === 'right', 'bg-gray-700': shape.textAlign !== 'right'}"
                class="px-3 py-2 rounded-lg border border-gray-600 hover:bg-primary-500 transition-colors duration-200 flex-1"
              >
                Right
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StylePanel',
  props: {
    selectedShapes: Array,
    layers: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    updateShape(shape) {
      console.log('Style panel updating shape:', shape);
      // Make a deep copy of the shape to avoid reference issues
      const shapeCopy = JSON.parse(JSON.stringify(shape));
      
      // Convert lineWidth from string to number if needed
      if (typeof shapeCopy.lineWidth === 'string') {
        shapeCopy.lineWidth = Number(shapeCopy.lineWidth);
      }
      
      // Set default line style if not set
      if (!shapeCopy.lineStyle) {
        shapeCopy.lineStyle = 'solid';
      }
      
      // Ensure text shapes have default font properties if not set
      if (shapeCopy.type === 'text') {
        if (!shapeCopy.fontFamily) shapeCopy.fontFamily = 'Arial, sans-serif';
        if (!shapeCopy.fontSize) shapeCopy.fontSize = 20;
        if (!shapeCopy.fontWeight) shapeCopy.fontWeight = 'normal';
        if (!shapeCopy.fontStyle) shapeCopy.fontStyle = 'normal';
        if (!shapeCopy.textDecoration) shapeCopy.textDecoration = 'none';
        if (!shapeCopy.textAlign) shapeCopy.textAlign = 'left';
        
        // Ensure text always has a non-transparent color
        if (!shapeCopy.fill || shapeCopy.fill === 'transparent') {
          shapeCopy.fill = '#000000';
        }
        
        // Force stroke to be transparent for text
        shapeCopy.stroke = 'transparent';
      }
      
      this.$emit('shape-updated', shapeCopy);
    },
    
    toggleFontStyle(shape, style) {
      // Create a copy to avoid direct mutation
      const shapeCopy = { ...shape };
      
      switch (style) {
        case 'bold':
          shapeCopy.fontWeight = shapeCopy.fontWeight === 'bold' ? 'normal' : 'bold';
          break;
        case 'italic':
          shapeCopy.fontStyle = shapeCopy.fontStyle === 'italic' ? 'normal' : 'italic';
          break;
        case 'underline':
          shapeCopy.textDecoration = shapeCopy.textDecoration === 'underline' ? 'none' : 'underline';
          break;
      }
      
      this.updateShape(shapeCopy);
    },
    
    setTextAlign(shape, alignment) {
      // Create a copy to avoid direct mutation
      const shapeCopy = { ...shape };
      shapeCopy.textAlign = alignment;
      this.updateShape(shapeCopy);
    },
    
    setTransparentFill(shape) {
      // Create a copy to avoid direct mutation
      const shapeCopy = { ...shape };
      // Toggle between transparent (rgba with 0 alpha) and white
      // Check if current fill is already transparent (has rgba with 0 alpha)
      const isCurrentlyTransparent = shapeCopy.fill && 
        (shapeCopy.fill === 'rgba(0,0,0,0)' || 
         shapeCopy.fill === 'rgba(255,255,255,0)' || 
         shapeCopy.fill === '#00000000');
      
      if (isCurrentlyTransparent) {
        shapeCopy.fill = '#ffffff';
        shapeCopy._isFillTransparent = false;
        console.log('Setting fill to opaque for shape:', shapeCopy.id);
      } else {
        shapeCopy.fill = '#000000';
        shapeCopy._isFillTransparent = true;
        console.log('Setting fill to transparent for shape:', shapeCopy.id);
      }
      this.updateShape(shapeCopy);
    },
    
    setTransparentStroke(shape) {
      // Create a copy to avoid direct mutation
      const shapeCopy = { ...shape };
      // Toggle between transparent (rgba with 0 alpha) and black
      // Check if current stroke is already transparent (has rgba with 0 alpha)
      const isCurrentlyTransparent = shapeCopy.stroke && 
        (shapeCopy.stroke === 'rgba(0,0,0,0)' || 
         shapeCopy.stroke === 'rgba(255,255,255,0)' || 
         shapeCopy.stroke === '#00000000');
      
      if (isCurrentlyTransparent) {
        shapeCopy.stroke = '#000000';
        shapeCopy._isStrokeTransparent = false;
        console.log('Setting stroke to opaque for shape:', shapeCopy.id);
      } else {
        shapeCopy.stroke = '#000000';
        shapeCopy._isStrokeTransparent = true;
        console.log('Setting stroke to transparent for shape:', shapeCopy.id);
      }
      this.updateShape(shapeCopy);
    }
  }
}
</script>