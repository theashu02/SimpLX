import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env files from the root directory based on the mode.
  // Prefix is empty ('') to load all VITE_ variables.
  const env = loadEnv(mode, './', '') // Load from current dir (usually project root)

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: env.VITE_DEV_PROXY_TARGET || "http://localhost:5000", // Use env variable or fallback
          changeOrigin: true,
        }
      }
    },
  }
})
