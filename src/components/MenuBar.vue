<template>
  <div class="bg-gray-900 border-b border-gray-800 shadow-lg">
    <!-- Main navbar -->
    <div class="max-w-full mx-auto px-4">
      <div class="flex items-center justify-between h-12">
        <!-- Left side: Logo and menus -->
        <div class="flex items-center">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center mr-4">
            <img src="/assets/ctrlsketch-logo.png" alt="CtrlSketch Logo" class="h-8 object-contain" />
          </div>
          
          <!-- Main menu and tabs in one row -->
          <div class="flex items-center space-x-2">
            <!-- File menu -->
            <div class="relative group" @click.stop>
              <button 
                class="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white rounded-md hover:bg-gray-800 transition-all duration-200"
                @click.stop="showFileMenu = !showFileMenu"
              >
                <div class="flex items-center">
                  <span class="mr-1">📁</span>
                  File
                  <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </button>
              
              <div 
                v-if="showFileMenu" 
                class="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                @click.stop
              >
                <div class="py-1">
                  <div 
                    v-for="(item, index) in fileMenuItems" 
                    :key="index"
                    class="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                    @click="handleMenuAction(item.action)"
                  >
                    <span class="text-lg mr-3">{{ item.icon }}</span>
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Help menu -->
            <div class="relative group" @click.stop>
              <button 
                class="px-3 py-1 text-sm font-medium text-gray-300 hover:text-white rounded-md hover:bg-gray-800 transition-all duration-200"
                @click.stop="showHelpMenu = !showHelpMenu"
              >
                <div class="flex items-center">
                  <span class="mr-1">❓</span>
                  Help
                  <svg class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </button>
              
              <div 
                v-if="showHelpMenu" 
                class="absolute left-0 mt-1 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
                @click.stop
              >
                <div class="py-1">
                  <div 
                    v-for="(item, index) in helpMenuItems" 
                    :key="index"
                    class="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                    @click="handleMenuAction(item.action)"
                  >
                    <span class="text-lg mr-3">{{ item.icon }}</span>
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tab navigation -->
            <div class="border-l border-gray-700 mx-2 h-8"></div>
            
            <button
              v-for="tab in tabs"
              :key="tab.name"
              class="px-3 py-1 text-sm font-medium rounded-md transition-all duration-200"
              :class="activeTab === tab.name ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'"
              @click="setActiveTab(tab.name)"
            >
              <div class="flex items-center">
                <span class="mr-1">{{ tab.icon }}</span>
                {{ tab.name }}
              </div>
            </button>
          </div>
        </div>
        
        <!-- Right side: Powered by HickSoft -->
        <div class="text-white text-sm font-medium">
          Powered by HickSoft
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MenuBar',
  data() {
    return {
      showFileMenu: false,
      showHelpMenu: false,
      activeTab: 'Home',
      tabs: [
        { name: 'Home', icon: '🏠' },
        { name: 'Insert', icon: '➕' },
        { name: 'Draw', icon: '✏️' },
        { name: 'View', icon: '👁️' },
        { name: 'Tools', icon: '🔧' }
      ],
      fileMenuItems: [
        { label: 'New', icon: '📄', action: 'new' },
        { label: 'Open', icon: '📂', action: 'open' },
        { label: 'Save', icon: '💾', action: 'save' },
        { label: 'Save As', icon: '💾', action: 'saveAs' },
        { label: 'Export as PDF', icon: '📑', action: 'exportPdf' },
        { label: 'Export as PNG', icon: '🖼️', action: 'exportPng' },
        { label: 'Export as SVG', icon: '📐', action: 'exportSvg' }
      ],
      helpMenuItems: [
        { label: 'About', icon: 'ℹ️', action: 'about' },
        { label: 'User Guide', icon: '📖', action: 'userGuide' },
        { label: 'Documentation', icon: '📚', action: 'docs' },
        { label: 'Support', icon: '📧', action: 'support' },
        { label: 'Live Chat', icon: '💬', action: 'liveChat' }
      ]
    };
  },
  mounted() {
    document.addEventListener('click', this.closeMenus);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenus);
  },
  methods: {
    closeMenus() {
      this.showFileMenu = false;
      this.showHelpMenu = false;
    },
    setActiveTab(tab) {
      this.activeTab = tab;
      this.$emit('menu', { type: 'tab', value: tab });
    },
    handleMenuAction(action) {
      if (action === 'userGuide') {
        // Open the User Guide in a new tab
        window.open('/docs/User_Guide.md', '_blank');
      } else {
        this.$emit('menu', { 
          type: action.startsWith('about') || 
                action.startsWith('docs') || 
                action.startsWith('support') || 
                action.startsWith('liveChat') || 
                action.startsWith('userGuide') ? 'help' : 'file', 
          value: action 
        });
      }
      this.showFileMenu = false;
      this.showHelpMenu = false;
    }
  }
};
</script>