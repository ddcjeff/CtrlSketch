import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './styles/main.css'
// Removed glossy.css import as requested
import './assets/tool-cursors.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')