import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('framer-motion')) {
              return 'motion';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
          }
          if (id.includes('src/data/franchises/marvel.ts') || id.includes('src\\data\\franchises\\marvel.ts')) {
            return 'franchise-marvel';
          }
          if (id.includes('src/data/franchises/dc.ts') || id.includes('src\\data\\franchises\\dc.ts') || id.includes('src/data/franchises/starwars.ts') || id.includes('src\\data\\franchises\\starwars.ts')) {
            return 'franchise-major';
          }
        },
      },
    },
  },
});
