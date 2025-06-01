import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/e2e/**', // 🛑 Exclude Playwright tests
    ],
  },
})
// This configuration sets up Vitest for a Vue.js project with JSDOM environment and coverage reporting.
// It also excludes the Playwright tests from being run with Vitest.
// Make sure to install the necessary dependencies:
// npm install --save-dev vitest @vitejs/plugin-vue jsdom
// You can run the tests using the command:
// npx vitest run
// or for watch mode:
// npx vitest
// For more information on Vitest configuration, refer to the official documentation:
// https://vitest.dev/config/
// For more information on Vue.js testing, refer to the official documentation:
// https://vuejs.org/guide/scaling-up/testing.html
// For more information on JSDOM, refer to the official documentation:
// https://github.com/jsdom/jsdom