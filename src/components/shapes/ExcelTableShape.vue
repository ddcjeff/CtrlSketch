<template>
  <g :transform="`translate(${shape.x}, ${shape.y}) rotate(${shape.rotation || 0})`">
    <!-- Background rectangle -->
    <rect
      :width="shape.width"
      :height="shape.height"
      :fill="shape.fill || '#FFFFFF'"
      :stroke="shape.stroke || '#CCCCCC'"
      :stroke-width="shape.strokeWidth || 1"
      rx="2"
      ry="2"
    />
    
    <!-- Excel Table Component -->
    <foreignObject
      :width="shape.width"
      :height="shape.height"
      :x="0"
      :y="0"
    >
      <div
        xmlns="http://www.w3.org/1999/xhtml"
        style="width: 100%; height: 100%; overflow: hidden;"
      >
        <excel-table-embed
          :initial-data="shape.excelData"
          :position="{ x: shape.x, y: shape.y }"
          :size="{ width: shape.width, height: shape.height }"
          @update:data="updateExcelData"
          @resize="handleResize"
        />
      </div>
    </foreignObject>
    
    <!-- Selection outline (only shown when selected) -->
    <rect
      v-if="isSelected"
      :width="shape.width"
      :height="shape.height"
      fill="none"
      stroke="#4299e1"
      stroke-width="2"
      stroke-dasharray="5,5"
      rx="2"
      ry="2"
    />
  </g>
</template>

<script>
import ExcelTableEmbed from '../ExcelTableEmbed.vue';

export default {
  name: 'ExcelTableShape',
  components: {
    ExcelTableEmbed
  },
  props: {
    shape: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:shape'],
  methods: {
    updateExcelData(data) {
      this.$emit('update:shape', {
        ...this.shape,
        excelData: data
      });
    },
    handleResize(size) {
      this.$emit('update:shape', {
        ...this.shape,
        width: size.width,
        height: size.height
      });
    }
  }
};
</script>