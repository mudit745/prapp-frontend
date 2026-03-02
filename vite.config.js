import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Ensures index.html uses ./assets/... (avoids 404 when served from HTML5 repo)
  build: {
    outDir: 'webapp',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4004',
        changeOrigin: true,
      },
    },
  },
})
