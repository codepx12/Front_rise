import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  build: {
    // Configuration optimale pour Netlify
    target: 'esnext',
    minify: 'esbuild', // ✅ Utiliser esbuild au lieu de terser
    cssCodeSplit: true,
    sourcemap: false,
    outDir: 'dist',
    assetsDir: 'assets',
    // S'assurer que les modules sont correctement generés
    rollupOptions: {
      output: {
        // Configuration pour éviter les problèmes MIME
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  // Optimisation pour Netlify
  define: {
    'process.env': JSON.stringify(process.env),
  },
})
