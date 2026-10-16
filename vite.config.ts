import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          const normalizedId = id.replace(/\\/g, '/');

          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('react') || normalizedId.includes('react-dom') || normalizedId.includes('scheduler')) {
              return 'vendor-react';
            }
            if (normalizedId.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (normalizedId.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (
              normalizedId.includes('/node_modules/three/') ||
              normalizedId.includes('/node_modules/@react-three/')
            ) {
              return 'vendor-three';
            }
          }
        },
      },
    },
  },
});
