import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'router';
          if (id.includes('node_modules/framer-motion')) return 'motion';
          if (id.includes('node_modules/zustand')) return 'store';
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})
