<template>
  <div class="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden" 
       :style="{ left: position.x + 'px', top: position.y + 'px', width: '280px' }"
       ref="calculatorPanel">
    <div class="flex justify-between items-center p-2 bg-gray-900 cursor-move"
         @mousedown.stop="startDrag">
      <div class="text-gray-400 font-medium text-xs uppercase tracking-wider">Calculator</div>
      <button @click="$emit('close')" class="text-gray-400 hover:text-white text-lg font-bold">&times;</button>
    </div>
    
    <div class="p-3">
      <!-- Display -->
      <div class="bg-gray-900 p-3 rounded-md mb-3">
        <div class="text-right text-xs text-gray-400 mb-1">{{ expression || '0' }}</div>
        <div class="text-right text-xl text-white font-medium">{{ display }}</div>
      </div>
      
      <!-- Buttons -->
      <div class="grid grid-cols-4 gap-2">
        <!-- First row -->
        <button @click="clear" class="calc-btn bg-red-600 hover:bg-red-700">C</button>
        <button @click="backspace" class="calc-btn bg-gray-700 hover:bg-gray-600">⌫</button>
        <button @click="addOperator('%')" class="calc-btn bg-gray-700 hover:bg-gray-600">%</button>
        <button @click="addOperator('/')" class="calc-btn bg-blue-600 hover:bg-blue-700">÷</button>
        
        <!-- Second row -->
        <button @click="addDigit('7')" class="calc-btn">7</button>
        <button @click="addDigit('8')" class="calc-btn">8</button>
        <button @click="addDigit('9')" class="calc-btn">9</button>
        <button @click="addOperator('*')" class="calc-btn bg-blue-600 hover:bg-blue-700">×</button>
        
        <!-- Third row -->
        <button @click="addDigit('4')" class="calc-btn">4</button>
        <button @click="addDigit('5')" class="calc-btn">5</button>
        <button @click="addDigit('6')" class="calc-btn">6</button>
        <button @click="addOperator('-')" class="calc-btn bg-blue-600 hover:bg-blue-700">−</button>
        
        <!-- Fourth row -->
        <button @click="addDigit('1')" class="calc-btn">1</button>
        <button @click="addDigit('2')" class="calc-btn">2</button>
        <button @click="addDigit('3')" class="calc-btn">3</button>
        <button @click="addOperator('+')" class="calc-btn bg-blue-600 hover:bg-blue-700">+</button>
        
        <!-- Fifth row -->
        <button @click="toggleSign" class="calc-btn">±</button>
        <button @click="addDigit('0')" class="calc-btn">0</button>
        <button @click="addDecimal" class="calc-btn">.</button>
        <button @click="calculate" class="calc-btn bg-green-600 hover:bg-green-700">=</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Calculator',
  props: {
    initialPosition: {
      type: Object,
      default: () => ({ x: 100, y: 100 })
    }
  },
  data() {
    return {
      display: '0',
      expression: '',
      lastResult: null,
      waitingForOperand: false,
      position: this.initialPosition,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    };
  },
  methods: {
    addDigit(digit) {
      if (this.waitingForOperand) {
        this.display = digit;
        this.waitingForOperand = false;
      } else {
        this.display = this.display === '0' ? digit : this.display + digit;
      }
    },
    addDecimal() {
      if (this.waitingForOperand) {
        this.display = '0.';
        this.waitingForOperand = false;
      } else if (this.display.indexOf('.') === -1) {
        this.display += '.';
      }
    },
    addOperator(operator) {
      const value = parseFloat(this.display);
      
      if (this.lastResult === null) {
        this.lastResult = value;
      } else if (!this.waitingForOperand) {
        this.calculate();
        this.lastResult = parseFloat(this.display);
      }
      
      this.expression = this.lastResult + ' ' + operator + ' ';
      this.waitingForOperand = true;
    },
    calculate() {
      if (this.waitingForOperand || !this.expression) {
        return;
      }
      
      const value = parseFloat(this.display);
      const fullExpression = this.expression + value;
      
      try {
        // Using Function instead of eval for better security
        const result = new Function('return ' + fullExpression.replace(/×/g, '*').replace(/÷/g, '/'))();
        this.display = Number.isInteger(result) ? result.toString() : result.toFixed(8).replace(/\.?0+$/, '');
        this.lastResult = result;
        this.expression = '';
        this.waitingForOperand = true;
      } catch (error) {
        this.display = 'Error';
        this.expression = '';
        this.lastResult = null;
        this.waitingForOperand = true;
      }
    },
    clear() {
      this.display = '0';
      this.expression = '';
      this.lastResult = null;
      this.waitingForOperand = false;
    },
    backspace() {
      if (this.waitingForOperand) return;
      
      this.display = this.display.length > 1 ? this.display.slice(0, -1) : '0';
    },
    toggleSign() {
      this.display = (parseFloat(this.display) * -1).toString();
    },
    
    // Dragging functionality
    startDrag(event) {
      this.isDragging = true;
      
      const rect = this.$refs.calculatorPanel.getBoundingClientRect();
      this.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      
      document.addEventListener('mousemove', this.onDrag);
      document.addEventListener('mouseup', this.stopDrag);
      
      event.preventDefault();
    },
    onDrag(event) {
      if (this.isDragging) {
        this.position = {
          x: event.clientX - this.dragOffset.x,
          y: event.clientY - this.dragOffset.y
        };
      }
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.onDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    }
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }
};
</script>

<style scoped>
.calc-btn {
  @apply flex items-center justify-center h-10 rounded-md text-white font-medium bg-gray-800 hover:bg-gray-700 transition-colors duration-150;
}
</style>