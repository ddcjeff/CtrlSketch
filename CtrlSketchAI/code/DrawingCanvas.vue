
<template>
  <div class="canvas-shape" @mousedown="startDrag" @mouseup="stopDrag" @mousemove="onDrag">
    <svg :width="width" :height="height">
      <rect :x="x" :y="y" :width="width" :height="height" class="shape-rect"/>
    </svg>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const x = ref(50)
const y = ref(50)
const width = 100
const height = 100

function startDrag(event) {
  console.log('Start dragging at', event.clientX, event.clientY)
}

function stopDrag(event) {
  console.log('Stop dragging at', event.clientX, event.clientY)
}

function onDrag(event) {
  console.log('Dragging over', event.clientX, event.clientY)
}
</script>

<style scoped>
.shape-rect {
  fill: #3498db;
  stroke: #2c3e50;
  stroke-width: 2px;
}
</style>
