<template>
  <transition name="notification">
    <div 
      v-if="show" 
      :class="[
        'fixed z-50 p-4 rounded-lg shadow-lg max-w-md flex items-start',
        'right-4 transition-all duration-300 ease-in-out',
        typeClasses
      ]"
      :style="{ top: `${top}px` }"
    >
      <!-- Icon -->
      <div class="flex-shrink-0 mr-3">
        <svg v-if="type === 'error'" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else-if="type === 'warning'" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <svg v-else-if="type === 'success'" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- Content -->
      <div class="flex-1">
        <div class="flex justify-between items-start">
          <p class="text-sm font-medium">{{ message }}</p>
          <button 
            @click="close" 
            class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p v-if="details" class="mt-1 text-xs text-gray-300">{{ details }}</p>
        
        <!-- Action buttons -->
        <div v-if="actions && actions.length" class="mt-3 flex space-x-2">
          <button 
            v-for="(action, index) in actions" 
            :key="index"
            @click="handleAction(action)"
            class="px-3 py-1 text-xs font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-white"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'success', 'warning', 'error'].includes(value)
    },
    message: {
      type: String,
      required: true
    },
    details: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 5000
    },
    actions: {
      type: Array,
      default: () => []
    },
    top: {
      type: Number,
      default: 20
    }
  },
  data() {
    return {
      show: true,
      timeout: null
    };
  },
  computed: {
    typeClasses() {
      switch (this.type) {
        case 'error':
          return 'bg-red-900 text-white border-l-4 border-red-500';
        case 'warning':
          return 'bg-yellow-900 text-white border-l-4 border-yellow-500';
        case 'success':
          return 'bg-green-900 text-white border-l-4 border-green-500';
        default:
          return 'bg-blue-900 text-white border-l-4 border-blue-500';
      }
    }
  },
  mounted() {
    if (this.duration > 0) {
      this.timeout = setTimeout(() => {
        this.close();
      }, this.duration);
    }
  },
  beforeUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
  methods: {
    close() {
      this.show = false;
      this.$emit('close');
    },
    handleAction(action) {
      if (typeof action.callback === 'function') {
        action.callback();
      }
      this.close();
    }
  }
};
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}
.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>