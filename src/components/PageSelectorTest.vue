<template>
  <div class="min-h-screen bg-gray-900 text-white p-8">
    <h1 class="text-2xl mb-4">Page Selector Test</h1>
    
    <div class="mb-4">
      <button 
        @click="showSelector = !showSelector"
        class="px-4 py-2 bg-blue-600 rounded"
      >
        Toggle Page Selector
      </button>
    </div>
    
    <div class="mb-4">
      <p>Current Page: {{ currentPageId }}</p>
      <p>Pages:</p>
      <ul>
        <li v-for="page in pages" :key="page.id" :class="{ 'text-yellow-400': page.id === currentPageId }">
          {{ page.name }} ({{ page.id }})
        </li>
      </ul>
    </div>
    
    <!-- Simple Page Selector -->
    <div 
      v-if="showSelector"
      class="fixed top-40 left-40 w-64 bg-gray-800 border border-gray-700 rounded"
      style="box-shadow: none !important;"
    >
      <div class="p-2 bg-gray-900 flex justify-between">
        <h3>Pages</h3>
        <button @click="showSelector = false">×</button>
      </div>
      
      <div class="p-2">
        <div 
          v-for="page in pages" 
          :key="page.id"
          class="p-2 cursor-pointer hover:bg-gray-700"
          :class="{ 'bg-gray-700': page.id === currentPageId }"
          @click="selectPage(page.id)"
        >
          {{ page.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showSelector: false,
      currentPageId: 'page-1',
      pages: [
        { id: 'page-1', name: 'Page 1' },
        { id: 'page-2', name: 'Page 2' },
        { id: 'page-3', name: 'Page 3' }
      ]
    };
  },
  methods: {
    selectPage(pageId) {
      console.log('Selecting page:', pageId);
      this.currentPageId = pageId;
    }
  }
};
</script>