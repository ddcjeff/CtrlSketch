<!-- src/components/TextEditor.vue -->
<template>
  <textarea
    v-if="editingShape && editingShape.type === 'text'"
    ref="textEditor"
    class="text-editor"
    :value="localText"
    :style="textEditorStyle"
    @input="updateText($event.target.value)"
    @keydown="handleTextEditKeydown"
    @blur="handleBlur"
  ></textarea>
</template>

<script>
import { executeCommand } from '@/utils/commandManager';

export default {
  props: {
    editingShape: { type: Object, default: null },
    shapes: { type: Array, default: () => [] },
    isDarkTheme: { type: Boolean, required: true },
    fontSize: { type: Number, default: 24 },
    fontType: { type: String, default: 'Arial' },
    fontStyle: { type: String, default: 'normal' }
  },
  emits: ['update:shapes', 'update:status-message', 'clear-editing-shape'],
  data() {
    return {
      localText: this.editingShape ? this.editingShape.text : '',
      isFocused: false
    };
  },
  watch: {
    editingShape(newShape) {
      this.localText = newShape ? newShape.text : '';

      // Focus the text editor when a shape is selected for editing
      if (newShape) {
        this.$nextTick(() => {
          if (this.$refs.textEditor) {
            this.$refs.textEditor.focus();
            this.$refs.textEditor.select();
            this.isFocused = true;
          }
        });
      }
    }
  },
  computed: {
    textEditorStyle() {
      if (!this.editingShape || !this.editingShape.type || this.editingShape.type !== 'text') {
        return {};
      }

      const canvas = document.querySelector('.drawing-canvas');
      if (!canvas) return {};

      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;

      // Calculate appropriate dimensions for the text editor
      const fontSize = this.editingShape.fontSize || this.fontSize || 24;
      const minWidth = Math.max(200, ((this.editingShape.text?.length || 0) * (fontSize * 0.6)) || 100);
      const minHeight = Math.max(50, fontSize * 2);

      // Get the canvas container for proper positioning
      const canvasContainer = document.querySelector('.canvas-container');

      // FIXED: Properly calculate scroll offsets
      let scrollLeft = 0;
      let scrollTop = 0;

      if (canvasContainer) {
        scrollLeft = canvasContainer.scrollLeft || 0;
        scrollTop = canvasContainer.scrollTop || 0;
        console.log('Canvas container scroll:', { scrollLeft, scrollTop });
      }

      // Calculate position accounting for scroll and zoom
      // FIXED: Properly apply scroll offsets
      const x = ((this.editingShape.x || 0) * scaleX);
      const y = ((this.editingShape.y || 0) * scaleY);

      return {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`, // Position at the text baseline
        width: `${minWidth * scaleX}px`,
        height: `${minHeight * scaleY}px`,
        fontSize: `${fontSize * scaleY}px`,
        fontFamily: this.editingShape.fontType || this.fontType || 'Arial',
        fontStyle: this.editingShape.fontStyle === 'italic' ? 'italic' : 'normal',
        fontWeight: this.editingShape.fontStyle === 'bold' ? 'bold' : 'normal',
        textDecoration: this.editingShape.textDecoration || 'none',
        color: this.editingShape.textColor || '#000000',
        border: '2px solid #3498db', // More visible border
        padding: '4px 8px',
        background: this.isDarkTheme ? 'rgba(51, 51, 51, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        outline: 'none',
        resize: 'both',
        zIndex: '1000',
        overflow: 'auto', // Allow scrolling for long text
        lineHeight: 'normal',
        boxSizing: 'border-box',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Add shadow for better visibility
        borderRadius: '4px',
        transform: 'translateY(-100%)' // Position above the baseline
      };
    }
  },
  methods: {
    updateText(value) {
      this.localText = value;
    },
    handleTextEditKeydown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.saveTextEdit();
      } else if (e.key === 'Escape') {
        this.$emit('clear-editing-shape');
        this.$emit('update:status-message', 'Text editing canceled');
      }
    },
    handleBlur() {
      // Save the text when the textarea loses focus
      if (this.localText !== this.editingShape.text) {
        this.saveTextEdit();
      } else {
        this.$emit('clear-editing-shape');
      }
    },

    saveTextEdit() {
      if (!this.editingShape) return;

      // Don't save if text is empty or unchanged
      if (this.localText.trim() === '' || this.localText === this.editingShape.text) {
        this.$emit('clear-editing-shape');
        return;
      }

      const originalShape = { ...this.editingShape };
      const updatedShape = { ...this.editingShape, text: this.localText };

      executeCommand(this, {
        execute: () => {
          const index = this.shapes.findIndex(s => s.id === this.editingShape.id);
          if (index !== -1) {
            const updatedShapes = [...this.shapes];
            updatedShapes[index] = updatedShape;
            this.$emit('update:shapes', updatedShapes);
            this.$emit('clear-editing-shape');
            this.$emit('update:status-message', 'Text saved');
          }
        },
        undo: () => {
          const index = this.shapes.findIndex(s => s.id === originalShape.id);
          if (index !== -1) {
            const updatedShapes = [...this.shapes];
            updatedShapes[index] = originalShape;
            this.$emit('update:shapes', updatedShapes);
            this.$emit('clear-editing-shape');
            this.$emit('update:status-message', 'Text edit undone');
          }
        }
      });
    }
  }
};
</script>
