<template>
  <div class="ai-assistant" :class="{ 'dark-theme': isDarkTheme }">
    <div class="assistant-header">
      <div class="assistant-avatar">AI</div>
      <div class="assistant-info">
        <h3>CtrlSketch AI Assistant</h3>
        <p>Powered by advanced AI for building automation</p>
      </div>
      <button class="close-button" @click="$emit('close')" title="Close">×</button>
    </div>

    <div class="chat-messages" ref="chatMessages">
      <div class="chat-message ai-message">
        <div class="message-avatar ai-avatar">AI</div>
        <div class="message-content">
          <p>Hello! I'm your CtrlSketch AI Assistant. I can help with system design, optimization, and troubleshooting. How can I assist you today?</p>
        </div>
      </div>

      <div v-for="(message, index) in messages" :key="index" class="chat-message" :class="{ 'ai-message': message.sender === 'ai', 'user-message': message.sender === 'user' }">
        <div class="message-avatar" :class="{ 'ai-avatar': message.sender === 'ai', 'user-avatar': message.sender === 'user' }">
          {{ message.sender === 'ai' ? 'AI' : 'U' }}
        </div>
        <div class="message-content">
          <p>{{ message.text }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="chat-message ai-message">
        <div class="message-avatar ai-avatar">AI</div>
        <div class="message-content">
          <p class="typing-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </p>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input
        type="text"
        v-model="userInput"
        placeholder="Ask me about control system design..."
        @keyup.enter="sendMessage"
        :disabled="isLoading"
      >
      <button class="send-button" @click="sendMessage" :disabled="isLoading">
        <span v-if="!isLoading">Send</span>
        <span v-else>...</span>
      </button>
    </div>

    <div class="quick-actions">
      <div class="quick-actions-title">Quick Actions</div>
      <div class="quick-actions-buttons">
        <button @click="quickAction('design')" :disabled="isLoading">System Design</button>
        <button @click="quickAction('optimize')" :disabled="isLoading">Optimize</button>
        <button @click="quickAction('troubleshoot')" :disabled="isLoading">Troubleshoot</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getChatResponse, getSystemDesignAssistance, getOptimizationSuggestions, getTroubleshootingAssistance } from '@/utils/aiService';

export default {
  name: 'AiAssistant',
  props: {
    isDarkTheme: {
      type: Boolean,
      default: true
    },
    systemData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      messages: [],
      userInput: '',
      isLoading: false
    };
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return;

      // Add user message
      this.messages.push({
        sender: 'user',
        text: this.userInput
      });

      const userMessage = this.userInput;
      this.userInput = '';
      this.isLoading = true;

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        console.log('Sending message to AI:', userMessage);

        // Get AI response
        const response = await getChatResponse(userMessage);
        console.log('Received AI response:', response ? response.substring(0, 50) + '...' : 'No response');

        // Add AI response
        this.messages.push({
          sender: 'ai',
          text: response || 'I apologize, but I received an empty response. Please try again.'
        });
      } catch (error) {
        console.error('Error getting AI response:', error);

        // Add error message
        this.messages.push({
          sender: 'ai',
          text: `Sorry, I encountered an error processing your request: ${error.message || 'Unknown error'}. Please try again.`
        });
      } finally {
        this.isLoading = false;

        // Scroll to bottom
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    async quickAction(type) {
      if (this.isLoading) return;

      let actionMessage = '';
      let responsePromise = null;

      switch (type) {
        case 'design':
          actionMessage = 'Can you help me design a control system for my building?';
          responsePromise = getSystemDesignAssistance({
            buildingType: 'Office Building',
            squareFootage: 50000,
            climateZone: '4A - Mixed/Humid',
            requirements: 'Energy efficiency, occupant comfort'
          });
          break;
        case 'optimize':
          actionMessage = 'How can I optimize my current control system design?';
          responsePromise = getOptimizationSuggestions(this.systemData);
          break;
        case 'troubleshoot':
          actionMessage = 'I\'m having issues with my control system. Can you help troubleshoot?';
          responsePromise = getTroubleshootingAssistance({
            description: 'Communication issues between controllers'
          });
          break;
        default:
          return;
      }

      // Add user message
      this.messages.push({
        sender: 'user',
        text: actionMessage
      });

      this.isLoading = true;

      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        // Get AI response
        const response = await responsePromise;

        // Add AI response
        this.messages.push({
          sender: 'ai',
          text: response
        });
      } catch (error) {
        console.error('Error getting AI response:', error);

        // Add error message
        this.messages.push({
          sender: 'ai',
          text: 'Sorry, I encountered an error processing your request. Please try again.'
        });
      } finally {
        this.isLoading = false;

        // Scroll to bottom
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },

    scrollToBottom() {
      if (this.$refs.chatMessages) {
        this.$refs.chatMessages.scrollTop = this.$refs.chatMessages.scrollHeight;
      }
    }
  }
};
</script>

<style scoped>
.ai-assistant {
  background-color: #1e293b;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.assistant-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #0f172a;
  border-bottom: 1px solid #334155;
}

.assistant-avatar {
  width: 32px;
  height: 32px;
  background-color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-weight: 600;
}

.assistant-info {
  flex: 1;
}

.assistant-info h3 {
  font-size: 16px;
  margin: 0 0 4px 0;
  color: #e2e8f0;
}

.assistant-info p {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #e2e8f0;
}

.chat-messages {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  background-color: #1e293b;
}

.chat-message {
  display: flex;
  margin-bottom: 20px;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.user-avatar {
  background-color: #334155;
  color: #94a3b8;
}

.ai-avatar {
  background-color: #3b82f6;
  color: white;
}

.message-content {
  background-color: #334155;
  padding: 12px 16px;
  border-radius: 8px;
  max-width: 80%;
}

.message-content p {
  margin: 0;
  color: #e2e8f0;
}

.ai-message .message-content {
  background-color: #0f172a;
}

.chat-input {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-top: 1px solid #334155;
  background-color: #0f172a;
}

.chat-input input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #334155;
  border-radius: 6px;
  background-color: #1e293b;
  color: #e2e8f0;
  font-size: 14px;
}

.chat-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.chat-input input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-button {
  padding: 10px 15px;
  margin-left: 10px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.send-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.quick-actions {
  padding: 15px 20px;
  border-top: 1px solid #334155;
  background-color: #0f172a;
}

.quick-actions-title {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.quick-actions-buttons {
  display: flex;
  gap: 10px;
}

.quick-actions-buttons button {
  padding: 8px 12px;
  background-color: #1e293b;
  color: #e2e8f0;
  border: 1px solid #334155;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-actions-buttons button:hover:not(:disabled) {
  background-color: #334155;
  border-color: #3b82f6;
}

.quick-actions-buttons button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 20px;
}

.dot {
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* Dark theme overrides */
.dark-theme {
  background-color: #1e293b;
  color: #e2e8f0;
}
</style>
