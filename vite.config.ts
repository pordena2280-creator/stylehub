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
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://ccfhpovymmqgjtyybfpw.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjZmhwb3Z5bW1xZ2p0eXliZnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MjEzNjgsImV4cCI6MjA5NDA5NzM2OH0.YEJGy855z6UGf8p5xAoNseAYNEZ8iQ-FXQFBnbZCh0Y'),
    'import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify('pk_test_51StRrHERhDWcEo0iFJ3ejrBG1HzU5rXO0E2lc3mE0TlnYiPgfaKacAFiV04qhVhKuzKsu054SOlp5VPbH2cg0UgA00UKcqw9ta'),
    'import.meta.env.VITE_APP_NAME': JSON.stringify('StyleHub'),
    'import.meta.env.VITE_APP_URL': JSON.stringify('https://stylehub-2.vercel.app'),
  },
  optimizeDeps: {
    entries: ['./src/main.tsx'],
    exclude: ['js/zoom.js', 'js/sibforms.js'],
  },
})
