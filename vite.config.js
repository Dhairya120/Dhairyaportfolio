import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // Three.js + R3F chunk is ~900kB minified; default 500kB triggers a warning only
    chunkSizeWarningLimit: 3500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@react-three/rapier') || id.includes('@dimforge/rapier')) return 'vendor-rapier'
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three'
          if (id.includes('gsap')) return 'vendor-gsap'
          if (id.includes('split-type')) return 'vendor-split'
          if (
            id.includes('node_modules/react-dom')
            || id.includes('node_modules/react/')
            || id.includes('node_modules\\react-dom')
            || id.includes('node_modules\\react\\')
            || id.includes('/scheduler/')
            || id.includes('\\scheduler\\')
          ) {
            return 'vendor-react'
          }
        },
      },
    },
  },
})
