/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { createAppContainer } from './server/container';
import { handleApiRequest } from './server/app';

function bnbApiServerPlugin(): Plugin {
  let container: ReturnType<typeof createAppContainer> | null = null;
  const getContainer = () => {
    if (!container) {
      container = createAppContainer();
    }
    return container;
  };

  return {
    name: 'bnb-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(getContainer(), req, res);
        if (!handled) next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const handled = await handleApiRequest(getContainer(), req, res);
        if (!handled) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), bnbApiServerPlugin()],
  ssr: {
    noExternal: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    env: { TZ: 'America/Bahia' },
  },
});
