import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/games/game1/',
  build: {
    outDir: '../../dist/games/game1',
    emptyOutDir: false,
  },
})