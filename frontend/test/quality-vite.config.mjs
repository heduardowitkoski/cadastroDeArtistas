import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
export default defineConfig({
  root: resolve(import.meta.dirname, '..'),
  envDir: false,
  plugins: [react(), {
    name: 'quality-local-api-only', enforce: 'pre',
    transform(_code, id) {
      if (id.replaceAll('\\', '/').endsWith('/src/lib/apiConfig.ts')) return { code: 'export const API_URL = "http://127.0.0.1:3207";', map: null };
    },
  }],
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('http://127.0.0.1:3207'),
    'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify('local-quality-public-fixture'),
  },
});
