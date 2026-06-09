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
    // Target modern browsers — smaller, faster bundles
    target: 'es2020',
    // Inline small assets (<4kb) as base64 to reduce HTTP requests
    assetsInlineLimit: 4096,
    // Enable CSS code splitting for faster initial load
    cssCodeSplit: true,
    // Keep chunk size warning at 1.5MB (three.js is large but lazy-loaded)
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // Strategic chunk splitting: each chunk loads only when needed
        manualChunks(id) {
          // Three.js is only needed on homepage — isolate it
          if (id.includes('node_modules/three')) return 'three';
          // Router loaded on first navigation
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) return 'router';
          // Framer Motion only for animated pages
          if (id.includes('node_modules/framer-motion')) return 'motion';
          // Zustand state management
          if (id.includes('node_modules/zustand')) return 'store';
          // Lucide icons are large — isolate them
          if (id.includes('node_modules/lucide-react')) return 'icons';
        },
        // Stable file names improve CDN cache hit rates
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Optimise deps pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
