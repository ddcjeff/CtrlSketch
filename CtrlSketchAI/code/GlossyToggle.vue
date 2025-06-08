<template>
  <div class="glossy-toggle">
    <button 
      class="px-3 py-1 text-xs font-medium text-gray-300 hover:text-white rounded-md hover:bg-gray-800 transition-all duration-200 flex items-center"
      @click="toggleGlossy"
    >
      <span class="mr-1">✨</span>
      {{ isGlossy ? 'Standard UI' : 'Glossy UI' }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'GlossyToggle',
  data() {
    return {
      isGlossy: false
    };
  },
  mounted() {
    try {
      // Load saved preference
      const savedPreference = localStorage.getItem('glossyUI');
      if (savedPreference === 'true') {
        this.isGlossy = true;
        // Wait for DOM to be fully rendered before applying effects
        this.$nextTick(() => {
          this.applyGlossyEffect();
        });
      }
    } catch (error) {
      console.error('Error in GlossyToggle mounted hook:', error);
    }
  },
  methods: {
    toggleGlossy() {
      this.isGlossy = !this.isGlossy;
      localStorage.setItem('glossyUI', this.isGlossy);
      
      // Use $nextTick to ensure DOM is updated before applying/removing effects
      this.$nextTick(() => {
        if (this.isGlossy) {
          this.applyGlossyEffect();
        } else {
          this.removeGlossyEffect();
        }
      });
    },
    
    applyGlossyEffect() {
      try {
        // Apply glossy classes to elements
        const menuBar = document.querySelector('.bg-gray-900.border-b.border-gray-800');
        const menuButtons = document.querySelector('.flex.items-center.space-x-2');
        const ribbon = document.querySelector('.max-w-full.mx-auto.px-4');
        
        if (menuBar) menuBar.classList.add('glossy-menubar');
        if (menuButtons) menuButtons.classList.add('glossy-buttons', 'glossy-tabs');
        if (ribbon) ribbon.classList.add('glossy-ribbon');
      } catch (error) {
        console.error('Error applying glossy effect:', error);
      }
    },
    
    removeGlossyEffect() {
      try {
        // Remove glossy classes from elements
        const menuBar = document.querySelector('.bg-gray-900.border-b.border-gray-800');
        const menuButtons = document.querySelector('.flex.items-center.space-x-2');
        const ribbon = document.querySelector('.max-w-full.mx-auto.px-4');
        
        if (menuBar) menuBar.classList.remove('glossy-menubar');
        if (menuButtons) menuButtons.classList.remove('glossy-buttons', 'glossy-tabs');
        if (ribbon) ribbon.classList.remove('glossy-ribbon');
      } catch (error) {
        console.error('Error removing glossy effect:', error);
      }
    }
  }
};
</script>