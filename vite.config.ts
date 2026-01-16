import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Ensure service worker and manifest are copied to dist
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  publicDir: 'public', // Ensure public directory is copied to dist
});
