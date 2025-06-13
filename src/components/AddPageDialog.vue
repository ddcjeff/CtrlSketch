<!-- src/components/AddPageDialog.vue -->
<template>
  <div v-if="show" class="add-page-dialog-overlay" @click.self="closeDialog">
    <div class="add-page-dialog" :class="{ 'dark-theme': isDarkTheme }">
      <div class="dialog-header">
        <h3>Add New Page</h3>
        <button class="close-button" @click="closeDialog">×</button>
      </div>
      <div class="dialog-content">
        <div class="form-group">
          <label for="pageName">Page Name:</label>
          <input
            type="text"
            id="pageName"
            v-model="pageData.name"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="pageType">Page Type:</label>
          <select
            id="pageType"
            v-model="pageData.type"
            class="form-control"
          >
            <option value="foreground">Foreground</option>
            <option value="background">Background</option>
          </select>
        </div>
        <div class="form-group" v-if="pageData.type === 'foreground'">
          <label for="backgroundPage">Background Page:</label>
          <select
            id="backgroundPage"
            v-model="pageData.backgroundPageId"
            class="form-control"
          >
            <option value="">None</option>
            <option
              v-for="page in backgroundPages"
              :key="page.id"
              :value="page.id"
            >
              {{ page.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="pageDescription">Description:</label>
          <textarea
            id="pageDescription"
            v-model="pageData.description"
            rows="3"
            class="form-control"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="drawingType">Drawing Type:</label>
          <select
            id="drawingType"
            v-model="pageData.drawingType"
            class="form-control"
          >
            <option value="default">Default</option>
            <option value="schematic">Schematic</option>
            <option value="layout">Layout</option>
          </select>
        </div>
      </div>
      <div class="dialog-footer">
        <button class="cancel-button" @click="closeDialog">Cancel</button>
        <button class="ok-button" @click="addPage">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddPageDialog',
  props: {
    show: { type: Boolean, default: false },
    initialData: {
      type: Object,
      default: () => ({
        name: '',
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default'
      })
    },
    backgroundPages: { type: Array, default: () => [] },
    isDarkTheme: { type: Boolean, default: false }
  },
  data() {
    return {
      pageData: { ...this.initialData }
    };
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.pageData = { ...newVal };
      },
      deep: true
    }
  },
  methods: {
    closeDialog() {
      // Explicitly emit the close event
      this.$emit('close');
    },
    
    addPage() {
      if (!this.pageData.name.trim()) {
        alert('Page name cannot be empty');
        return;
      }
      
      // Create a deep copy of the page data to avoid reference issues
      const pageDataCopy = JSON.parse(JSON.stringify(this.pageData));
      
      // Emit the add event with the page data
      this.$emit('add', pageDataCopy);
      
      // Reset the form for the next page (don't close the dialog)
      this.pageData = { 
        name: '', 
        type: 'foreground',
        backgroundPageId: '',
        description: '',
        drawingType: 'default'
      };
      
      // Only close if explicitly requested
      // this.$emit('close');
    }
  }
};
</script>

<style scoped>
.add-page-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999; /* Ensure it's above everything */
  animation: fadeIn 0.2s ease-out;
}
.add-page-dialog {
  background: #2D2D2D;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  width: 420px;
  max-width: 90%;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  color: #CCCCCC;
  animation: slideUp 0.2s ease-out;
}
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #3C3C3C;
}
.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999999;
  transition: color 0.2s;
}
.close-button:hover {
  color: #FFFFFF;
}
.dialog-content {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid #3C3C3C;
  gap: 8px;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #4A4A4A;
  border-radius: 4px;
  font-size: 14px;
  background: #333333;
  color: #FFFFFF;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.form-control:focus {
  border-color: #0078D4;
  box-shadow: 0 0 4px rgba(0, 120, 212, 0.3);
  outline: none;
}
.cancel-button, .ok-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.cancel-button {
  background: #3C3C3C;
  border: 1px solid #4A4A4A;
  color: #CCCCCC;
}
.cancel-button:hover {
  background: #4A4A4A;
}
.ok-button {
  background: #0078D4;
  border: 1px solid #005EA2;
  color: #FFFFFF;
}
.ok-button:hover {
  background: #005EA2;
}
.add-page-dialog.dark-theme {
  background: #2D2D2D;
  color: #CCCCCC;
}
.add-page-dialog:not(.dark-theme) {
  background: #FFFFFF;
  color: #333333;
}
.dialog-header:not(.dark-theme) {
  border-bottom: 1px solid #D1D1D1;
}
.dialog-footer:not(.dark-theme) {
  border-top: 1px solid #D1D1D1;
}
.close-button:not(.dark-theme) {
  color: #666666;
}
.close-button:hover:not(.dark-theme) {
  color: #000000;
}
.form-control:not(.dark-theme) {
  background: #FFFFFF;
  border-color: #CCCCCC;
  color: #333333;
}
.cancel-button:not(.dark-theme) {
  background: #F5F5F5;
  border-color: #D1D1D1;
  color: #333333;
}
.cancel-button:hover:not(.dark-theme) {
  background: #E5E5E5;
}
.ok-button:not(.dark-theme) {
  background: #0078D4;
  border-color: #005EA2;
}
.ok-button:hover:not(.dark-theme) {
  background: #005EA2;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>