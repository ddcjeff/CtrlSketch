<template>
  <div v-if="showRulers">
    <!-- Horizontal ruler -->
    <div class="ruler horizontal-ruler" :style="{ left: `${horizontalOffset}px` }">
      <div
        v-for="i in horizontalMarks"
        :key="`h-${i}`"
        class="ruler-mark"
        :style="{ 
          left: `${(i * pixelsPerQuarterInch) / zoomLevel}px`,
          height: i % 4 === 0 ? '100%' : i % 2 === 0 ? '75%' : '50%'
        }"
      >
        <span v-if="i % 4 === 0" class="inch-mark">{{ (i / 4).toFixed(0) }}</span>
        <span v-else-if="i % 2 === 0" class="half-mark">½</span>
        <span v-else class="quarter-mark">¼</span>
      </div>
    </div>
    
    <!-- Vertical ruler -->
    <div class="ruler vertical-ruler" :style="{ left: `${horizontalOffset}px` }">
      <div
        v-for="i in verticalMarks"
        :key="`v-${i}`"
        class="ruler-mark"
        :style="{ 
          top: `${(i * pixelsPerQuarterInch) / zoomLevel}px`,
          width: i % 4 === 0 ? '100%' : i % 2 === 0 ? '75%' : '50%'
        }"
      >
        <span v-if="i % 4 === 0" class="inch-mark">{{ (i / 4).toFixed(0) }}</span>
        <span v-else-if="i % 2 === 0" class="half-mark">½</span>
        <span v-else class="quarter-mark">¼</span>
      </div>
    </div>
    
    <!-- Ruler corner -->
    <div class="ruler-corner" :style="{ left: `${horizontalOffset}px` }">0,0</div>
  </div>
</template>

<script>
export default {
  name: "AppRulers",
  props: {
    showRulers: { type: Boolean, required: true },
    canvasWidth: { type: Number, required: true },
    canvasHeight: { type: Number, required: true },
    zoomLevel: { type: Number, default: 1 },
    offsetX: { type: Number, default: 0 },
    offsetY: { type: Number, default: 0 }
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  },
  mounted() {
    window.addEventListener('resize', this.updateWindowDimensions);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  },
  methods: {
    updateWindowDimensions() {
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
    }
  },
  computed: {
    pixelsPerInch() {
      return 96;
    },
    pixelsPerQuarterInch() {
      return this.pixelsPerInch / 4;
    },
    horizontalMarks() {
      return Array.from({ length: 17 * 4 + 1 }, (_, i) => i);
    },
    verticalMarks() {
      return Array.from({ length: 11 * 4 + 1 }, (_, i) => i);
    },
    horizontalOffset() {
      return this.windowWidth / 2 - this.canvasWidth / 2;
    },
    verticalOffset() {
      return (this.windowHeight - 130) / 2 - this.canvasHeight / 2;
    }
  }
}
</script>

<style scoped>
.ruler {
  position: fixed;
  pointer-events: none;
  user-select: none;
  z-index: 100;
}
.horizontal-ruler {
  top: 130px;
  right: 0;
  height: 20px;
  display: flex;
  border-bottom: 1px solid #555;
  background-color: rgba(40, 40, 40, 0.98);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.vertical-ruler {
  top: 150px;
  bottom: 0;
  width: 20px;
  border-right: 1px solid #555;
  background-color: rgba(40, 40, 40, 0.98);
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.3);
}
.ruler-mark {
  position: absolute;
  text-align: center;
}
.horizontal-ruler .ruler-mark {
  height: 100%;
  border-left: 1px solid #555;
  padding-top: 2px;
}
.vertical-ruler .ruler-mark {
  width: 100%;
  border-top: 1px solid #555;
  padding-left: 2px;
}
.ruler-mark span {
  display: block;
  transform: translateX(-50%);
  font-weight: normal;
  font-size: 10px;
}
.vertical-ruler .ruler-mark span {
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  text-orientation: mixed;
  font-size: 10px;
}
.inch-mark {
  color: white;
  font-weight: bold;
  font-size: 12px !important;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);
}
.half-mark {
  color: #cccccc;
  font-size: 11px !important;
  text-shadow: 0px 0px 1px rgba(0, 0, 0, 0.8);
}
.quarter-mark {
  color: #aaaaaa;
  font-size: 10px !important;
}
.horizontal-ruler .ruler-mark:nth-child(4n),
.vertical-ruler .ruler-mark:nth-child(4n) {
  border-left-color: #777;
  border-top-color: #777;
}
.ruler-corner {
  position: fixed;
  top: 130px;
  width: 20px;
  height: 20px;
  background-color: rgba(40, 40, 40, 0.98);
  border-right: 1px solid #555;
  border-bottom: 1px solid #555;
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: white;
  font-weight: bold;
  text-shadow: 0px 0px 2px rgba(0, 0, 0, 0.8);
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}
</style>