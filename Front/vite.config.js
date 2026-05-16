import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Backend local (dev): arranca con `npm run dev` en /Back (puerto 3001).
        // Usar 127.0.0.1 (no "localhost") para evitar que Windows resuelva
        // a IPv6 (::1) y el proxy dé ECONNREFUSED.
        target: 'http://127.0.0.1:3001',
        // target: 'https://tu-backend-en-el-vps',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})