
<template>
  <div class="haystack-panel">
    <h3>Haystack Tags</h3>

    <div v-if="selectedPart">
      <p><strong>{{ selectedPart.partNumber }}</strong></p>
      <ul>
        <li v-for="(val, key) in selectedPart.haystack" :key="key">
          <code>{{ key }}: {{ val }}</code>
        </li>
      </ul>
    </div>

    <h4>Filter Parts by Tags</h4>
    <div class="filter-grid">
      <label v-for="tag in commonTags" :key="tag">
        <input type="checkbox" v-model="selectedTags[tag]" />
        {{ tag }}
      </label>
    </div>

    <button @click="filterParts">Filter</button>

    <div v-if="filteredParts.length">
      <h4>Matched Parts</h4>
      <ul>
        <li v-for="part in filteredParts" :key="part.partNumber">
          {{ part.partNumber }} – {{ part.description }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBomStore } from '@/stores/bomStore'

const bomStore = useBomStore()
const selectedPart = ref(null)
const filteredParts = ref([])

// Sample list of tags to filter with – customize as needed
const commonTags = ['sensor', 'controller', 'temp', 'pressure', 'humidity', 'duct', 'wall', 'relay', 'point', 'power']
const selectedTags = ref({})

// Track currently selected part
if (bomStore.parts.length) {
  selectedPart.value = bomStore.parts[0]
}

function filterParts() {
  const active = Object.keys(selectedTags.value).filter(k => selectedTags.value[k])
  filteredParts.value = bomStore.parts.filter(p =>
    active.every(tag => p.haystack?.[tag] === true)
  )
}
</script>

<style scoped>
.haystack-panel {
  padding: 1rem;
  border-left: 1px solid #444;
  background: #1e1e1e;
  color: #eee;
}
.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}
button {
  margin-bottom: 1rem;
}
</style>
