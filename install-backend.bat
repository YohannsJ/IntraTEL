@echo off
echo Instalando dependencias del backend...
cd /d "%~dp0"
echo Removiendo Express 5.x y instalando Express 4.x estable...
npm uninstall express
npm install express@^4.18.2 cors bcryptjs jsonwebtoken sqlite3 multer dotenv concurrently
echo.
echo Dependencias instaladas exitosamente.
echo.
echo Para iniciar el servidor completo (frontend + backend):
echo npm run dev:full
echo.
echo Para iniciar solo el backend:
echo npm run server
echo.
echo Para iniciar solo el frontend:
echo npm run dev
pause
