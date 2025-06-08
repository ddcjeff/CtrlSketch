<template>
  <div class="notification-container">
    <Notification
      v-for="(notification, index) in notifications"
      :key="notification.id"
      :type="notification.type"
      :message="notification.message"
      :details="notification.details"
      :duration="notification.duration"
      :actions="notification.actions"
      :top="20 + index * 10"
      @close="removeNotification(notification.id)"
    />
  </div>
</template>

<script>
import Notification from './Notification.vue';

export default {
  name: 'NotificationManager',
  components: {
    Notification
  },
  data() {
    return {
      notifications: [],
      nextId: 1
    };
  },
  methods: {
    addNotification(notification) {
      const id = this.nextId++;
      this.notifications.push({
        id,
        type: notification.type || 'info',
        message: notification.message,
        details: notification.details || '',
        duration: notification.duration || 5000,
        actions: notification.actions || []
      });
      
      // Limit the number of notifications to prevent overwhelming the UI
      if (this.notifications.length > 5) {
        this.notifications.shift();
      }
      
      return id;
    },
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },
    clearAll() {
      this.notifications = [];
    }
  }
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  pointer-events: none;
}

.notification-container > * {
  pointer-events: auto;
  margin-bottom: 0.5rem;
}
</style>