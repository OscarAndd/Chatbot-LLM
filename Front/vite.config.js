import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/ - Tailwind v3 Integrated
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Cualquier petición a /api/** se redirige a tu backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // quita el prefijo /api
      },
    },
  },
})
