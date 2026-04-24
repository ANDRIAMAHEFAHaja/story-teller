import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget =
    env.VITE_API_PROXY?.trim() || 'http://localhost:3000';

  return {
    // Hors de node_modules : évite EBUSY (rename) sur Windows quand le dossier est verrouillé.
    cacheDir: path.join(__dirname, '.vite'),
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
