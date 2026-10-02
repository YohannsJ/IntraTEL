/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Prefijo bajo el que se sirve la app (https://d1ft3l.cl/didactictel/).
// Se puede cambiar al compilar con VITE_BASE (p. ej. VITE_BASE=/ para servir en la raíz).
const base = `/${(process.env.VITE_BASE ?? '/didactictel/').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/')

// La API cuelga del mismo prefijo (<base>api); el backend sigue exponiendo /api
const apiProxy = {
  [`${base}api`]: {
    target: 'http://localhost:3001',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path.slice(base.length - 1)
  }
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy }
})
