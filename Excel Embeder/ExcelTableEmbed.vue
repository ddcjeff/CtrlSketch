<template>
  <div class="excel-table-importer">
    <input type="file" accept=".xlsx" @change="handleFileUpload" />

    <div v-if="sheetNames.length > 1">
      <label>Select Sheet:</label>
      <select v-model="selectedSheet" @change="loadSelectedSheet">
        <option v-for="name in sheetNames" :key="name" :value="name">{{ name }}</option>
      </select>
    </div>

    <div class="canvas-container" :style="{ transform: 'scale(' + zoomLevel + ')' }">
      <table v-if="tableData.length > 0">
        <thead>
          <tr>
            <th v-for="(header, index) in headers" :key="'header-' + index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in tableData" :key="'row-' + rowIndex">
            <td v-for="(cell, colIndex) in row" :key="'cell-' + colIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
      <button @click="exportToXLSX">Export to Excel</button>
    </div>

    <div v-if="isLoading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'

const tableData = ref([])
const headers = ref([])
const selectedSheet = ref('')
const sheetNames = ref([])
const workbookCache = ref(null)

const zoomLevel = ref(1)
const isLoading = ref(false)
const error = ref(null)

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
    } catch (e) {
      error.value = 'Failed to parse Excel file.'
    } finally {
      isLoading.value = false
    }
  }
  reader.readAsArrayBuffer(file)
}

function loadSelectedSheet() {
  const worksheet = workbookCache.value.Sheets[selectedSheet.value]
  const sheetData = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false
  })
  headers.value = sheetData[0] || []
  tableData.value = sheetData.slice(1)
}

function zoomIn() {
  zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
}

function zoomOut() {
  zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
}

function exportToXLSX() {
  const data = [headers.value, ...tableData.value]
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'Export')
  XLSX.writeFile(newWorkbook, 'exported_table.xlsx')
}
</script>

<style scoped>
.excel-table-importer {
  font-family: Arial, sans-serif;
  padding: 1rem;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
}
.canvas-container {
  overflow: auto;
  border: 1px solid #aaa;
  margin: 1rem 0;
}
.controls {
  margin-top: 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
