<template>
  <div ref="wrapper" class="wrapper" @dblclick="resetZoom">
    <canvas
      ref="canvas"
      class="styled-canvas"
      @wheel.prevent="handleWheel"
    ></canvas>
  </div>
</template>

<script>
export default {
  name: "CanvasZoomGrid",
  data() {
    return {
      ctx: null,
      zoom: 1,
      zoomTarget: 1,
      offsetX: 0,
      offsetY: 0,
      panTargetX: 0,
      panTargetY: 0,
      gridSpacing: 50,
      canvasWidth: 1632,
      canvasHeight: 1056,
    };
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });

    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas);

    this.animate();
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.resizeCanvas);
  },
  methods: {
    resizeCanvas() {
      const canvas = this.$refs.canvas;
      const wrapper = this.$refs.wrapper;

      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;

      canvas.width = width;
      canvas.height = height;

      this.canvasWidth = width;
      this.canvasHeight = height;

      const centerX = width / 2;
      const centerY = height / 2;

      this.offsetX = centerX - this.canvasWidth / 2;
      this.offsetY = centerY - this.canvasHeight / 2;
      this.panTargetX = this.offsetX;
      this.panTargetY = this.offsetY;
    },

    handleWheel(e) {
      const rect = this.$refs.wrapper.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      if (e.ctrlKey) {
        const delta = e.deltaY * -0.0012;
        const newZoom = Math.min(Math.max(this.zoomTarget + delta, 0.3), 4);

        const wx = (centerX - this.offsetX) / this.zoom;
        const wy = (centerY - this.offsetY) / this.zoom;

        this.zoomTarget = newZoom;
        this.panTargetX = centerX - wx * newZoom;
        this.panTargetY = centerY - wy * newZoom;
      } else if (e.shiftKey) {
        this.panTargetX += e.deltaY * 0.3;
      } else {
        this.panTargetY += e.deltaY * 0.3;
      }
    },

    resetZoom() {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      this.zoomTarget = 1;
      this.panTargetX = centerX - this.canvasWidth / 2;
      this.panTargetY = centerY - this.canvasHeight / 2;
    },

    animate() {
      this.zoom += (this.zoomTarget - this.zoom) * 0.1;
      this.offsetX += (this.panTargetX - this.offsetX) * 0.1;
      this.offsetY += (this.panTargetY - this.offsetY) * 0.1;

      this.render();

      requestAnimationFrame(this.animate);
    },

    render() {
      const ctx = this.ctx;
      if (!ctx) return;

      ctx.save();
      ctx.setTransform(this.zoom, 0, 0, this.zoom, this.offsetX, this.offsetY);
      ctx.clearRect(
        -this.offsetX / this.zoom,
        -this.offsetY / this.zoom,
        this.canvasWidth / this.zoom,
        this.canvasHeight / this.zoom
      );

      const step = this.gridSpacing;
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1 / this.zoom;

      for (let x = 0; x <= this.canvasWidth; x += step) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, this.canvasHeight);
        ctx.stroke();
      }

      for (let y = 0; y <= this.canvasHeight; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(this.canvasWidth, y + 0.5);
        ctx.stroke();
      }

      ctx.strokeStyle = "#999";
      ctx.lineWidth = 2 / this.zoom;
      ctx.strokeRect(0, 0, this.canvasWidth, this.canvasHeight);

      ctx.restore();
    },
  },
};
</script>

<style scoped>
.wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #1e1e1e;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.styled-canvas {
  display: block;
  background: transparent;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.75);
  border: 1px solid #555;
  overflow: hidden;
}
</style>
