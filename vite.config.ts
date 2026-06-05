import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@services': path.resolve(__dirname, './src/services'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@validators': path.resolve(__dirname, './src/validators'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  // Solo escanear src/main.tsx como entry-point de optimizacion de deps;
  // los archivos HTML de ProyectoAntiguo tienen referencias a js/zoom.js,
  // js/sibforms.js etc. que no forman parte del bundle de Vite.
  optimizeDeps: {
    entries: ['./src/main.tsx'],
    exclude: ['js/zoom.js', 'js/sibforms.js'],
  },
})
