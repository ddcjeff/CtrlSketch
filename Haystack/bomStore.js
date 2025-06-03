
// stores/bomStore.js
import { defineStore } from 'pinia'

export const useBomStore = defineStore('bom', {
  state: () => ({
    parts: []
  }),

  actions: {
    addPart(part) {
      const existing = this.parts.find(p => p.id === part.id)
      if (!existing) this.parts.push(part)
    },
    updatePart(id, updates) {
      const index = this.parts.findIndex(p => p.id === id)
      if (index !== -1) {
        this.parts[index] = { ...this.parts[index], ...updates }
      }
    },
    removePart(id) {
      this.parts = this.parts.filter(p => p.id !== id)
    },
    clearAll() {
      this.parts = []
    }
  }
})
