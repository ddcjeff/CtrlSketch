<template>
  <div class="ribbon-tool" @click="handleClick">
    <div class="ribbon-tool-icon">
      <span class="icon">📊</span>
    </div>
    <div class="ribbon-tool-label">Excel Table</div>
  </div>
</template>

<script>
export default {
  name: 'ExcelTableTool',
  methods: {
    handleClick() {
      this.$emit('tool-selected', {
        type: 'excel-table',
        width: 500,
        height: 300,
        excelData: null
      });
    }
  }
};
</script>

<style scoped>
.ribbon-tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 5px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.ribbon-tool:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.ribbon-tool-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.ribbon-tool-label {
  font-size: 11px;
  text-align: center;
}

.icon {
  font-size: 24px;
}
</style>