import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'Android >= 5', 'Chrome >= 61'],
      modernPolyfills: true,
    }),
  ],
  build: {
    target: 'chrome61',
  },
})
