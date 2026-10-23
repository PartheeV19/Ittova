import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
    open: false,
    host: true,
    allowedHosts: ['cubical-perky-atom.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure(proxy) {
          // The browser talks to Vite on the same origin. Drop Origin before
          // proxying so the API's CORS allowlist does not reject port 3002.
          proxy.on('proxyReq', (proxyRequest) => {
            proxyRequest.removeHeader('origin');
          });
        }
      }
    }
  }
});
