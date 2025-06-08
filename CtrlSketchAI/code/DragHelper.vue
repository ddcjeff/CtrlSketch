<template>
  <div class="drag-helper" ref="dragHelper" style="display: none; position: absolute; top: 0; left: 0; width: 1px; height: 1px; opacity: 0;" draggable="true"></div>
</template>

<script>
export default {
  name: 'DragHelper',
  data() {
    return {
      dragData: null
    };
  },
  methods: {
    /**
     * Initialize the drag helper
     */
    initialize() {
      const dragHelper = this.$refs.dragHelper;
      dragHelper.addEventListener('dragstart', this.handleDragStart);
      dragHelper.addEventListener('dragend', this.handleDragEnd);
    },
    
    /**
     * Start a drag operation
     * @param {Object} data - The data to be dragged
     * @param {Event} event - The original event that triggered the drag
     */
    startDrag(data, event) {
      console.log('DragHelper: Starting drag with data:', data);
      this.dragData = data;
      
      const dragHelper = this.$refs.dragHelper;
      dragHelper.style.display = 'block';
      dragHelper.style.top = (event.clientY - 10) + 'px';
      dragHelper.style.left = (event.clientX - 10) + 'px';
      
      // Trigger the drag programmatically
      setTimeout(() => {
        dragHelper.dispatchEvent(new MouseEvent('dragstart', {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      }, 10);
    },
    
    /**
     * Handle the dragstart event
     * @param {DragEvent} event - The drag event
     */
    handleDragStart(event) {
      console.log('DragHelper: Drag started');
      if (!this.dragData) return;
      
      try {
        // Set the drag data
        event.dataTransfer.setData('application/json', JSON.stringify(this.dragData));
        
        // Create a drag image
        const dragImage = document.createElement('div');
        dragImage.textContent = this.dragData.shape ? this.dragData.shape.type : 'Shape';
        dragImage.style.padding = '10px';
        dragImage.style.background = '#3B82F6';
        dragImage.style.color = 'white';
        dragImage.style.borderRadius = '4px';
        dragImage.style.position = 'absolute';
        dragImage.style.top = '-1000px';
        document.body.appendChild(dragImage);
        
        // Set the drag image
        event.dataTransfer.setDragImage(dragImage, 25, 25);
        
        // Clean up the drag image after a short delay
        setTimeout(() => {
          document.body.removeChild(dragImage);
        }, 100);
        
        // Set the allowed effects
        event.dataTransfer.effectAllowed = 'copy';
      } catch (error) {
        console.error('DragHelper: Error setting drag data:', error);
      }
    },
    
    /**
     * Handle the dragend event
     */
    handleDragEnd() {
      console.log('DragHelper: Drag ended');
      const dragHelper = this.$refs.dragHelper;
      dragHelper.style.display = 'none';
      this.dragData = null;
    }
  },
  mounted() {
    this.initialize();
  },
  beforeUnmount() {
    const dragHelper = this.$refs.dragHelper;
    if (dragHelper) {
      dragHelper.removeEventListener('dragstart', this.handleDragStart);
      dragHelper.removeEventListener('dragend', this.handleDragEnd);
    }
  }
};
</script>