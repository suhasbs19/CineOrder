import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function healthCheckDevPlugin() {
  return {
    name: 'health-check-dev-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (url === '/api/health') {
          try {
            const { default: handler } = await server.ssrLoadModule('/api/health.ts');
            return await handler(req, res);
          } catch (err) {
            console.error('[Vite Health Middleware Error]:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ status: 'error' }));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), healthCheckDevPlugin()],
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
