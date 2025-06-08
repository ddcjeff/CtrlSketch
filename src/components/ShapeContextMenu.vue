<template>
  <div 
    v-if="show" 
    class="absolute bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <button 
      v-for="(item, index) in menuItems" 
      :key="index"
      @click="handleAction(item.action)"
      class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
      :class="{ 'border-t border-gray-700': item.divider }"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'ShapeContextMenu',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({ x: 0, y: 0 })
    },
    selectedShapes: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    menuItems() {
      const items = [
        { label: 'Cut', action: 'cut' },
        { label: 'Copy', action: 'copy' },
        { label: 'Paste', action: 'paste' },
        { label: 'Delete', action: 'delete' },
        { label: 'Duplicate', action: 'duplicate', divider: true },
        { label: 'Bring to Front', action: 'bringToFront' },
        { label: 'Send to Back', action: 'sendToBack', divider: true },
        { label: 'Make Shape a Part', action: 'makeShapePart' }
      ];
      
      // Only show certain items if shapes are selected
      if (this.selectedShapes.length === 0) {
        return items.filter(item => ['paste'].includes(item.action));
      }
      
      return items;
    }
  },
  methods: {
    handleAction(action) {
      this.$emit('action', { type: action, shapes: this.selectedShapes });
      this.$emit('close');
    }
  }
};
</script>