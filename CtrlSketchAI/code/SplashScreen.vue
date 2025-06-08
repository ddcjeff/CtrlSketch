<template>
  <div 
    v-if="visible" 
    class="splash-screen fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50"
    :class="{ 'fade-out': fadeOut }"
  >
    <div class="logo-container relative">
      <!-- Logo with animation -->
      <img 
        src="/assets/splash-logo.png" 
        alt="CtrlSketch Logo" 
        class="logo-image max-w-md animate-pulse"
      />
      
      <!-- Animated elements around the logo -->
      <div class="animated-elements">
        <div class="circle-pulse absolute"></div>
        <div class="sparkles">
          <span v-for="n in 5" :key="n" class="sparkle" :style="getSparkleStyle(n)"></span>
        </div>
      </div>
    </div>
    
    <!-- Version and license info -->
    <div class="mt-8 text-center text-white">
      <h2 class="text-2xl font-bold mb-2 animate-fade-in">
        <span class="text-amber-500">Ctrl</span><span>Sketch</span>
      </h2>
      <div class="version-info animate-slide-up">
        <p class="text-gray-300">Version {{ version }}</p>
        <p v-if="licenseNumber" class="text-gray-400 text-sm mt-1">License: {{ licenseNumber }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SplashScreen',
  props: {
    duration: {
      type: Number,
      default: 3000 // Duration in milliseconds
    },
    version: {
      type: String,
      default: '1.0.0'
    },
    licenseNumber: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: true,
      fadeOut: false
    }
  },
  mounted() {
    // Start fade out animation after specified duration
    setTimeout(() => {
      this.fadeOut = true;
      
      // Hide component after animation completes
      setTimeout(() => {
        this.visible = false;
        this.$emit('splash-complete');
      }, 1000); // Animation duration
    }, this.duration);
  },
  methods: {
    getSparkleStyle(index) {
      // Generate random positions for sparkle elements
      const angle = (index / 5) * Math.PI * 2;
      const distance = 100 + Math.random() * 50;
      const delay = Math.random() * 0.5;
      
      return {
        top: `calc(50% + ${Math.sin(angle) * distance}px)`,
        left: `calc(50% + ${Math.cos(angle) * distance}px)`,
        animationDelay: `${delay}s`
      };
    }
  }
}
</script>

<style scoped>
.splash-screen {
  transition: opacity 1s ease-out;
}

.fade-out {
  opacity: 0;
}

.logo-image {
  animation: pulse 2s infinite ease-in-out;
}

.circle-pulse {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(247, 164, 29, 0.2) 0%, rgba(0, 0, 0, 0) 70%);
  animation: ripple 2s infinite ease-out;
}

.sparkle {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #f7a41d;
  border-radius: 50%;
  animation: twinkle 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(0.98); opacity: 0.8; }
  50% { transform: scale(1.02); opacity: 1; }
  100% { transform: scale(0.98); opacity: 0.8; }
}

@keyframes ripple {
  0% { width: 0%; height: 0%; opacity: 1; }
  100% { width: 200%; height: 200%; opacity: 0; }
}

@keyframes twinkle {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0); opacity: 0; }
}

.animate-fade-in {
  animation: fadeIn 1s ease-in;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out 0.3s both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>