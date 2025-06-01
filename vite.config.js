import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  server: {
    hmr: {
      // Use a different protocol if WebSocket is blocked
      protocol: 'ws',
      // Explicitly set the host
      host: 'localhost',
      // Try a different port for WebSocket
      port: 24678,
      // Increase timeout
      timeout: 120000
    }
  }
})
