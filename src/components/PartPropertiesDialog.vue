<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-gray-800 rounded-lg p-4 w-96 max-h-[90vh] overflow-y-auto">
      <h3 class="text-white text-lg font-medium mb-4">Assign Part Properties</h3>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Part Name</label>
        <input 
          type="text" 
          v-model="localProperties.name" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Haystack Tag</label>
        <input 
          type="text" 
          v-model="localProperties.haystackTag" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Part Number</label>
        <input 
          type="text" 
          v-model="localProperties.partNumber" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Quantity</label>
        <input 
          type="number" 
          v-model.number="localProperties.quantity" 
          min="1"
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        />
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Description</label>
        <textarea 
          v-model="localProperties.description" 
          rows="3"
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        ></textarea>
      </div>
      
      <div class="mb-3">
        <label class="block text-gray-400 text-sm mb-1">Point Type</label>
        <select 
          v-model="localProperties.pointType" 
          class="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
        >
          <option value="">Select Point Type</option>
          <option value="AI">AI - Analog Input</option>
          <option value="BI">BI - Binary Input</option>
          <option value="AO">AO - Analog Output</option>
          <option value="BO">BO - Binary Output</option>
          <option value="UI">UI - Universal Input</option>
          <option value="UO">UO - Universal Output</option>
        </select>
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-400 text-sm mb-1">PDF Cut Sheet Path</label>
        <div class="flex">
          <input 
            type="text" 
            v-model="localProperties.pdfPath" 
            class="flex-1 bg-gray-700 text-white rounded-l-md border border-gray-600 px-3 py-2"
            readonly
          />
          <button @click="browsePdf" class="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-r-md">
            Browse
          </button>
        </div>
      </div>
      
      <div class="flex justify-end">
        <button @click="cancel" class="px-4 py-2 text-gray-400 hover:text-white mr-2">
          Cancel
        </button>
        <button @click="confirm" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
          Apply
        </button>
      </div>
    </div>
    
    <input 
      type="file" 
      ref="pdfInput" 
      style="display: none" 
      accept=".pdf"
      @change="handlePdfSelect"
    />
  </div>
</template>

<script>
export default {
  name: 'PartPropertiesDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    initialProperties: {
      type: Object,
      default: () => ({
        name: '',
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      })
    }
  },
  data() {
    return {
      localProperties: {
        name: '',
        haystackTag: '',
        partNumber: '',
        quantity: 1,
        description: '',
        pointType: '',
        pdfPath: ''
      }
    };
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Initialize with provided properties
        this.localProperties = { ...this.initialProperties };
      }
    }
  },
  methods: {
    browsePdf() {
      this.$refs.pdfInput.click();
    },
    
    handlePdfSelect(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // In a real app, you'd upload this file to a server
      // For now, we'll just store the filename
      this.localProperties.pdfPath = file.name;
      
      // Reset the input
      event.target.value = '';
    },
    
    cancel() {
      this.$emit('cancel');
    },
    
    confirm() {
      this.$emit('confirm', { ...this.localProperties });
    }
  }
};
</script>