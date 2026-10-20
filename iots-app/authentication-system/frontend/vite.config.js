import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
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
    port: 5174,
    strictPort: true,
    proxy: {
      "/api": {
        target: 'http://127.0.0.1:3001',
        configure(proxy) {
          const proxySecret = require('../backend/src/auth/proxy-secret')
          proxy.on('proxyReq', (request, incoming) => {
            request.setHeader('X-IOTS-Client-IP', incoming.socket.remoteAddress);
            request.setHeader('X-IOTS-Proxy-Token', proxySecret);
          });
        },
      },
    },
  },
})
