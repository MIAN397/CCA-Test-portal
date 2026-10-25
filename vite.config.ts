import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: ['es2018', 'chrome60', 'edge79', 'firefox57', 'safari11'],
    cssTarget: ['chrome60', 'firefox57', 'safari11', 'edge79']
  }
})
