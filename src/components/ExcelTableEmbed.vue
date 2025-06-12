<template>
  <div class="excel-table-embed" ref="tableContainer">
    <!-- Upload Controls -->
    <div v-if="!tableData.length" class="upload-controls">
      <input type="file" accept=".xlsx" @change="handleFileUpload" id="excel-upload" />
      <label for="excel-upload" class="upload-button">
        <span class="icon">📄</span> Import Excel Table
      </label>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>

    <!-- Table Display -->
    <div 
      v-if="tableData.length > 0" 
      class="table-container"
      @dblclick="openEditor"
      :style="{ 
        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
        width: `${width}px`,
        height: `${height}px`
      }"
    >
      <div class="table-header">
        <div class="sheet-selector" v-if="sheetNames.length > 1">
          <select v-model="selectedSheet" @change="loadSelectedSheet">
            <option v-for="name in sheetNames" :key="name" :value="name">{{ name }}</option>
          </select>
        </div>
        <div class="table-title">{{ selectedSheet }}</div>
        <div class="table-controls">
          <button @click.stop="zoomIn" title="Zoom In">+</button>
          <button @click.stop="zoomOut" title="Zoom Out">-</button>
          <button @click.stop="rotate" title="Rotate">↻</button>
          <button @click.stop="exportToXLSX" title="Export">📥</button>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="'header-' + index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in tableData" :key="'row-' + rowIndex">
            <td v-for="(cell, colIndex) in row" :key="'cell-' + rowIndex + '-' + colIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="editMode" class="edit-modal">
      <div class="edit-modal-content">
        <div class="edit-modal-header">
          <h3>Edit Table: {{ selectedSheet }}</h3>
          <button @click="closeEditor" class="close-button">&times;</button>
        </div>
        
        <div class="edit-modal-body">
          <table class="edit-table">
            <thead>
              <tr>
                <th v-for="(header, index) in headers" :key="'edit-header-' + index">
                  <input 
                    type="text" 
                    v-model="editHeaders[index]" 
                    class="header-input"
                  />
                </th>
                <th class="add-column">
                  <button @click="addColumn" title="Add Column">+</button>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in editBuffer" :key="'edit-row-' + rowIndex">
                <td v-for="(cell, colIndex) in row" :key="'edit-cell-' + rowIndex + '-' + colIndex">
                  <input 
                    type="text" 
                    v-model="editBuffer[rowIndex][colIndex]" 
                    class="cell-input"
                  />
                </td>
                <td class="row-actions">
                  <button @click="removeRow(rowIndex)" title="Remove Row">-</button>
                </td>
              </tr>
              <tr class="add-row">
                <td :colspan="headers.length + 1">
                  <button @click="addRow" title="Add Row">+ Add Row</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="edit-modal-footer">
          <button @click="applyChanges" class="save-button">Save Changes</button>
          <button @click="closeEditor" class="cancel-button">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import * as XLSX from 'xlsx'

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => null
  },
  position: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  },
  size: {
    type: Object,
    default: () => ({ width: 500, height: 300 })
  }
})

// Emits
const emit = defineEmits(['update:data', 'resize', 'move'])

// State
const tableData = ref([])
const headers = ref([])
const selectedSheet = ref('')
const sheetNames = ref([])
const workbookCache = ref(null)
const editMode = ref(false)
const editBuffer = ref([])
const editHeaders = ref([])
const error = ref(null)
const tableContainer = ref(null)

// UI state
const zoomLevel = ref(1)
const rotation = ref(0)
const width = ref(props.size.width || 500)
const height = ref(props.size.height || 300)
const isLoading = ref(false)

// Initialize from props if available
onMounted(() => {
  if (props.initialData) {
    try {
      workbookCache.value = props.initialData.workbook
      sheetNames.value = props.initialData.sheetNames
      selectedSheet.value = props.initialData.selectedSheet
      headers.value = props.initialData.headers
      tableData.value = props.initialData.tableData
    } catch (e) {
      console.error('Failed to initialize from props:', e)
    }
  }
})

// File handling
function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file || !file.name.endsWith('.xlsx')) {
    error.value = 'Only .xlsx files are supported.'
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      isLoading.value = true
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      workbookCache.value = workbook
      sheetNames.value = workbook.SheetNames
      selectedSheet.value = workbook.SheetNames[0]
      loadSelectedSheet()
      error.value = null
      
      // Emit update
      emitUpdate()
    } catch (e) {
      error.value = 'Failed to parse Excel file: ' + e.message
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }
  reader.readAsArrayBuffer(file)
}

function loadSelectedSheet() {
  if (!workbookCache.value || !selectedSheet.value) return
  
  const worksheet = workbookCache.value.Sheets[selectedSheet.value]
  const sheetData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  })
  
  headers.value = sheetData[0] || []
  tableData.value = sheetData.slice(1)
  
  // Emit update
  emitUpdate()
}

function exportToXLSX() {
  if (!headers.value.length || !tableData.value.length) return
  
  const data = [headers.value, ...tableData.value]
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, worksheet, selectedSheet.value || 'Export')
  XLSX.writeFile(newWorkbook, `${selectedSheet.value || 'table'}_export.xlsx`)
}

// Editor functions
function openEditor() {
  editHeaders.value = [...headers.value]
  editBuffer.value = JSON.parse(JSON.stringify(tableData.value))
  editMode.value = true
}

function closeEditor() {
  editMode.value = false
}

function applyChanges() {
  headers.value = [...editHeaders.value]
  tableData.value = JSON.parse(JSON.stringify(editBuffer.value))
  editMode.value = false
  
  // Emit update
  emitUpdate()
}

function addRow() {
  const newRow = Array(headers.value.length).fill('')
  editBuffer.value.push(newRow)
}

function removeRow(index) {
  editBuffer.value.splice(index, 1)
}

function addColumn() {
  editHeaders.value.push('New Column')
  editBuffer.value.forEach(row => {
    row.push('')
  })
}

// UI controls
function zoomIn() {
  zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
}

function zoomOut() {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
}

function rotate() {
  rotation.value = (rotation.value + 90) % 360
}

// Emit data updates
function emitUpdate() {
  emit('update:data', {
    workbook: workbookCache.value,
    sheetNames: sheetNames.value,
    selectedSheet: selectedSheet.value,
    headers: headers.value,
    tableData: tableData.value
  })
}

// Watch for prop changes
watch(() => props.initialData, (newData) => {
  if (newData) {
    workbookCache.value = newData.workbook
    sheetNames.value = newData.sheetNames
    selectedSheet.value = newData.selectedSheet
    headers.value = newData.headers
    tableData.value = newData.tableData
  }
}, { deep: true })
</script>

<style scoped>
.excel-table-embed {
  font-family: Arial, sans-serif;
  position: relative;
  border: 1px solid #ccc;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.upload-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

input[type="file"] {
  display: none;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background: #4a90e2;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.upload-button:hover {
  background: #3a80d2;
}

.upload-button .icon {
  margin-right: 0.5rem;
  font-size: 1.2em;
}

.error-message {
  color: #e74c3c;
  margin-top: 1rem;
}

.table-container {
  transform-origin: top left;
  transition: transform 0.2s;
  overflow: auto;
  background: white;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.table-title {
  font-weight: bold;
  font-size: 0.9rem;
}

.table-controls button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 3px;
  margin-left: 0.25rem;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.table-controls button:hover {
  background: #eee;
}

table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.9rem;
}

th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}

th {
  background: #f0f0f0;
  font-weight: 600;
}

/* Edit Modal */
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.edit-modal-content {
  background: white;
  border-radius: 4px;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.edit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
}

.edit-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.edit-modal-body {
  padding: 1rem;
  overflow: auto;
  flex: 1;
}

.edit-table {
  width: 100%;
  border-collapse: collapse;
}

.edit-table th, .edit-table td {
  border: 1px solid #ddd;
  padding: 0.25rem;
}

.header-input, .cell-input {
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: inherit;
}

.header-input {
  font-weight: bold;
  background: #f5f5f5;
}

.add-column button, .row-actions button {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  font-size: 1rem;
  padding: 0.25rem;
}

.add-row button {
  background: none;
  border: 1px dashed #ccc;
  padding: 0.5rem;
  width: 100%;
  cursor: pointer;
  color: #666;
}

.add-row button:hover, .add-column button:hover, .row-actions button:hover {
  background: #f5f5f5;
  color: #333;
}

.edit-modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.save-button, .cancel-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.save-button {
  background: #4a90e2;
  color: white;
  border: none;
}

.cancel-button {
  background: none;
  border: 1px solid #ccc;
  color: #666;
}

.save-button:hover {
  background: #3a80d2;
}

.cancel-button:hover {
  background: #f5f5f5;
}
</style>