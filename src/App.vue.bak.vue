<template>
  <div class="app-container">
    <!-- MenuBar removed -->
    <!-- RibbonBar removed -->
    <div class="main-body">
      <!-- ToolFlyout removed -->
      <CanvasWorkspace />
    </div>
  </div>
</template>

<script>
import MenuBar from './components/MenuBar.vue'
import RibbonBar from './components/RibbonBar.vue'
import ToolFlyout from './components/ToolFlyout.vue'
import CanvasWorkspace from './components/CanvasWorkspace.vue'

export default {
  components: {
    MenuBar,
    RibbonBar,
    ToolFlyout,
    CanvasWorkspace
  }
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.main-body {
  display: flex;
  flex: 1;
}
</style>
