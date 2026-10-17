import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        creativeAssociate: resolve(import.meta.dirname, 'creative-associate.html'),
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
    },
  },
})
