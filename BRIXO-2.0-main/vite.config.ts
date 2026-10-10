import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/BRIXO-2.0/' : '/',
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    open: false,
  },
})