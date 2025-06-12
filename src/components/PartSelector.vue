<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-4 w-[90vw] h-[90vh] flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-white text-lg font-medium">Parts Plus Browser</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
      </div>
      
      <div class="flex-1 overflow-hidden bg-white rounded-md">
        <PartsBrowser @select="selectPartFromBrowser" @close="$emit('close')" />
      </div>
      
      <!-- Selected part preview -->
      <div v-if="selectedPart" class="border border-gray-700 rounded-md p-3 mt-4 bg-gray-900">
        <h4 class="text-white font-medium mb-2">Selected Part</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span class="text-gray-400">Part Number:</span> 
            <span class="text-white">{{ selectedPart.partNumber }}</span>
          </div>
          <div>
            <span class="text-gray-400">Manufacturer:</span> 
            <span class="text-white">{{ selectedPart.manufacturer }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-400">Description:</span> 
            <span class="text-white">{{ selectedPart.name }}</span>
          </div>
          <div class="col-span-2">
            <span class="text-gray-400">Haystack Tags:</span> 
            <span class="text-white">{{ selectedPart.haystackTag }}</span>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end mt-4">
        <button @click="$emit('close')" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
          Cancel
        </button>
        <button 
          @click="confirmSelection" 
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          :disabled="!selectedPart"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import PartsBrowser from './PartsBrowser.vue';

export default {
  name: 'PartSelector',
  components: {
    PartsBrowser
  },
  data() {
    return {
      selectedPart: null
    };
  },
  methods: {
    selectPartFromBrowser(partProperties) {
      this.selectedPart = partProperties;
    },
    confirmSelection() {
      if (this.selectedPart) {
        this.$emit('select', this.selectedPart);
        this.$emit('close');
      }
    }
  }
};
</script>