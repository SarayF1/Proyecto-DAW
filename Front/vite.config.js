import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Backend local (dev): arranca con `npm run dev` en /Back (puerto 3001).
        // Para apuntar al backend de Render en prod, comenta la línea de abajo
        // y descomenta la siguiente.
        target: 'http://localhost:3001',
        // target: 'https://myparking-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
