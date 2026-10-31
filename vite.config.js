import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.PORT || env.API_PORT || '3001';
  const vitePort = Number.parseInt(env.VITE_PORT || '3002', 10);

  return {
    plugins: [react()],
    server: {
      port: Number.isFinite(vitePort) ? vitePort : 3002,
      // If the preferred frontend port is occupied, Vite selects and reports
      // the next available port instead of failing or claiming a stale port.
      strictPort: false,
      open: false,
      host: true,
      allowedHosts: ['cubical-perky-atom.ngrok-free.dev'],
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || `http://127.0.0.1:${apiPort}`,
          changeOrigin: true,
          configure(proxy) {
            // The browser talks to Vite on the same origin. Drop Origin before
            // proxying so the API's CORS allowlist does not reject local dev.
            proxy.on('proxyReq', (proxyRequest) => {
              proxyRequest.removeHeader('origin');
            });
          }
        }
      }
    }
  };
});
