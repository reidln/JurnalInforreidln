import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev
export default defineConfig({
  plugins: [
    tailwindcss(), // 👈 CRITICAL: This plugin must sit BEFORE react()
    react(),
  ],
  base: "/", // Ensures assets are resolved from the root path
  build: {
    outDir: "dist"
  }
})