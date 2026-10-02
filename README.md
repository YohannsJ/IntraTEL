# 🚀 IntraTEL

Plataforma de aprendizaje gamificada para Ingeniería Telemática. Incluye juegos prácticos, flags y seguimiento de progreso.

## 🎮 Juegos incluidos

- 🕵️ *Gestión de Redes*: decisiones y ciberseguridad con asistente (Telix), rondas y popups educativos. Flags por puntaje (�/🥈/🥇) y bonus anti‑malware.
- 🖥️ *CSS Code Game* (Software): maqueta estilos arrastrando propiedades, vista previa en dispositivos y niveles con validación y flags.
- 🧪 *Network Challenge* (Redes): conecta Router/Switch/PC y usa consola (enable, conf t, ip address, no shutdown, ping).
- 📡 *Espectro* (Teleco): sintonización, identificación de bandas y cálculos (Nyquist). Logros y progreso por nivel.
- 🔩 *NandGame* (Hardware): construye NOT/AND/OR/XOR solo con puertas NAND, modo puzzles y sandbox.

## ✨ Qué trae (resumen)

- Autenticación JWT y usuario admin por defecto.
- Flags con puntaje, tablas de líderes y progreso por juego (SQLite).
- Logros en juegos (memoria del servidor) y guardado local del avance.
- Tema claro/oscuro y UI responsive.

## ⚙️ Requisitos

- Node.js 18+
- npm

## ⚡ Arranque rápido

1) Instalar dependencias (raíz)

```powershell
npm install
```

2) Ejecutar frontend + backend (desarrollo)

```powershell
npm run dev:full
```

3) Acceder

- Frontend: http://localhost:5173/didactictel/
- API: http://localhost:3001/api

## ⚙️ Admin por defecto 

- Email: admin@intratel.com
- Password: admin123

Se crea automáticamente al iniciar el servidor por primera vez. Cámbialo luego del primer login.

## ⚙️ Configuración rápida

- Config frontend: `src/config/environment.js` (puertos, logs, etc.).
- Proxy de desarrollo: `vite.config.js` (redirige `/api` a `http://localhost:3001`).

## 📚 Más info

- Guía de desarrollo: `./docs/development-guide.md`
- Manual de usuario: `./docs/user-manual.md`
- Arquitectura: `./docs/architecture.md`
- Despliegue: `./docs/deployment.md`

## 🧪 Tests (opcional)

```powershell
npm test
```

---

Desarrollado con ❤️ por DifTel para la comunidad de Ingeniería Civil Telemática UTFSM.
