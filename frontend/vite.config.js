import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('lucide-react')) return 'icons';
          // Rich-text + code editor stack — only the (lazy) admin console imports
          // it. Leave it UNCHUNKED so Rollup keeps it in the lazy admin graph
          // instead of the eagerly-loaded vendor chunk.
          if (
            id.includes('@tiptap') ||
            id.includes('prosemirror') ||
            id.includes('@floating-ui') ||
            id.includes('@codemirror') ||
            id.includes('@lezer') ||
            id.includes('@uiw') ||
            id.includes('@marijn') ||
            id.includes('style-mod') || id.includes('w3c-keyname') || id.includes('crelt')
          ) {
            return undefined;
          }
          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          return 'vendor';
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
