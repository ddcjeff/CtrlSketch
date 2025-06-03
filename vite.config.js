import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read version from package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
const appVersion = pkg.version

export default defineConfig({
  plugins: [vue()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
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
      protocol: 'ws',
      host: 'localhost',
      port: 24678,
      timeout: 120000
    }
  }
})
