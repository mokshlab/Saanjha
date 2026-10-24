
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const localEnvDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../.local'
)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, localEnvDirectory, 'VITE_')

  return {
    envDir: localEnvDirectory,
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: Number(env.VITE_FRONTEND_PORT || 5174),
      cors: true,
      
      allowedHosts: ['tired-fans-allow.loca.lt'],
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://127.0.0.1:3101',
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
