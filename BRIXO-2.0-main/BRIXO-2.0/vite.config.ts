import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/BRIXO-2.0/',
  plugins: [
    react(),
    tailwindcss()
  ],
})