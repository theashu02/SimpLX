// import { defineConfig, loadEnv } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => {
//   // Load env files from the root directory based on the mode.
//   // Prefix is empty ('') to load all VITE_ variables.
//   // const env = loadEnv(mode, './', '') // Load from current dir (usually project root)

//   return {
//     plugins: [react()],
//     server: {
//       port: 3000,
//       proxy: {
//         "/api": {
//           target: "http://localhost:5000", // Use env variable or fallback
//           changeOrigin: true,
//         }
//       }
//     },
//   }
// })


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      }
    }
  },
})
