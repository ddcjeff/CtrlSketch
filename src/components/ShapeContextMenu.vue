<template>
  <div 
    v-if="show" 
    class="absolute bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50 py-1"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
  >
    <button 
      v-for="(item, index) in menuItems" 
      :key="index"
      @click="!item.disabled && handleAction(item.action)"
      class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
      :class="{ 
        'border-t border-gray-700': item.divider,
        'text-white': !item.disabled,
        'text-gray-500 cursor-not-allowed': item.disabled
      }"
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
      const hasSelectedShapes = this.selectedShapes.length > 0;
      const hasSingleShape = this.selectedShapes.length === 1;
      const selectedShape = hasSingleShape ? this.selectedShapes[0] : null;
      const isPart = selectedShape && selectedShape.partProperties;
      const isFlexLine = selectedShape && selectedShape.type === 'flexline';
      
      const items = [
        { 
          label: 'Cut', 
          action: 'cut',
          disabled: !hasSelectedShapes
        },
        { 
          label: 'Copy', 
          action: 'copy',
          disabled: !hasSelectedShapes
        },
        { 
          label: 'Paste', 
          action: 'paste'
        },
        { 
          label: 'Delete', 
          action: 'delete',
          disabled: !hasSelectedShapes
        },
        { 
          label: 'Duplicate', 
          action: 'duplicate', 
          divider: true,
          disabled: !hasSelectedShapes
        },
        { 
          label: 'Bring to Front', 
          action: 'bringToFront',
          disabled: !hasSelectedShapes
        },
        { 
          label: 'Send to Back', 
          action: 'sendToBack', 
          divider: true,
          disabled: !hasSelectedShapes
        },
        { 
          label: isPart ? 'Edit Part Properties' : 'Make Shape a Part', 
          action: 'makeShapePart',
          disabled: !hasSingleShape
        },
        {
          label: 'Group Shapes',
          action: 'groupShapes',
          disabled: !hasSelectedShapes || this.selectedShapes.length < 2
        },
        {
          label: 'Ungroup Shapes',
          action: 'ungroupShapes',
          disabled: !hasSelectedShapes || !selectedShape || selectedShape.type !== 'group'
        },
        {
          label: 'Align',
          action: 'align',
          disabled: !hasSelectedShapes || this.selectedShapes.length < 2,
          divider: true
        },
        {
          label: 'Properties',
          action: 'properties',
          disabled: !hasSingleShape
        },
        {
          label: 'Set Corner Radius',
          action: 'setCornerRadius',
          disabled: !isFlexLine,
          divider: true
        },
        {
          label: 'No Corner Rounding',
          action: 'noCornerRounding',
          disabled: !isFlexLine
        },
        {
          label: 'Slight Corner Rounding',
          action: 'slightCornerRounding',
          disabled: !isFlexLine
        },
        {
          label: 'Medium Corner Rounding',
          action: 'mediumCornerRounding',
          disabled: !isFlexLine
        },
        {
          label: 'Large Corner Rounding',
          action: 'largeCornerRounding',
          disabled: !isFlexLine
        }
      ];
      
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