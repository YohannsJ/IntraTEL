# Sistema de Grupos IntraTEL

Sistema completo de gestión de usuarios y grupos para la plataforma educativa IntraTEL, con autenticación JWT, administración de grupos y seguimiento de progreso.

## 🚀 Características

### Sistema de Autenticación
- ✅ Registro e inicio de sesión con JWT
- ✅ Roles de usuario (Admin, Teacher, Student)
- ✅ Protección de rutas por autenticación
- ✅ Persistencia de sesión en localStorage

### Gestión de Grupos
- ✅ Creación de grupos (Admin/Teacher)
- ✅ Códigos únicos de grupo para unirse
- ✅ Administración de miembros
- ✅ Transferencia de administración
- ✅ Estadísticas del grupo

### Sistema de Progreso
- ✅ Seguimiento de progreso en juegos
- ✅ Tabla de líderes
- ✅ Estadísticas por usuario y grupo
- ✅ Gestión de puntajes y tiempo

### Base de Datos
- ✅ SQLite integrado
- ✅ Migraciones automáticas
- ✅ Índices optimizados
- ✅ Respaldos automáticos

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Puerto 3001 disponible para el backend
- Puerto 5173 disponible para el frontend

## 🛠️ Instalación

### 1. Instalar Dependencias del Backend

**Opción A: Usando el script automático (Windows)**
```bash
# Ejecutar el archivo install-backend.bat
./install-backend.bat
```

**Opción B: Manual**
```bash
# Desde la raíz del proyecto
npm install express cors bcryptjs jsonwebtoken sqlite3 multer dotenv concurrently
```

### 2. Configurar Variables de Entorno

El archivo `.env` ya está configurado con valores por defecto:
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=intratel_secret_key_2025_super_secure
JWT_EXPIRES_IN=7d
DB_PATH=./server/data/intratel.db
FRONTEND_URL=http://localhost:5173
LOG_LEVEL=info
```

### 3. Inicializar Base de Datos

La base de datos se crea automáticamente al iniciar el servidor por primera vez.

## 🚀 Ejecución

### Opción 1: Desarrollo Completo (Frontend + Backend)
```bash
npm run dev:full
```

### Opción 2: Solo Backend
```bash
npm run server
```

### Opción 3: Solo Frontend
```bash
npm run dev
```

### Opción 4: Backend con Watch Mode
```bash
npm run server:dev
```

## 📊 Estructura del Proyecto

```
IntraTEL/
├── server/                     # Backend
│   ├── config/
│   │   └── database.js         # Configuración SQLite
│   ├── models/
│   │   ├── User.js             # Modelo de usuarios
│   │   ├── Group.js            # Modelo de grupos
│   │   └── GameProgress.js     # Modelo de progreso
│   ├── controllers/
│   │   ├── AuthController.js   # Controlador de autenticación
│   │   ├── GroupController.js  # Controlador de grupos
│   │   └── GameController.js   # Controlador de juegos
│   ├── routes/
│   │   ├── auth.js             # Rutas de autenticación
│   │   ├── groups.js           # Rutas de grupos
│   │   └── games.js            # Rutas de juegos
│   ├── middleware/
│   │   └── auth.js             # Middlewares de autenticación
│   ├── data/
│   │   └── intratel.db         # Base de datos SQLite
│   └── server.js               # Servidor principal
├── src/
│   ├── components/
│   │   ├── Auth/               # Componentes de autenticación
│   │   ├── Groups/             # Componentes de grupos
│   │   └── ProtectedRoute.jsx  # Componente de rutas protegidas
│   ├── context/
│   │   ├── AuthContext.jsx     # Contexto de autenticación
│   │   ├── ThemeContext.jsx    # Contexto de temas
│   │   └── DataContext.jsx     # Contexto de datos
│   └── ...
└── .env                        # Variables de entorno
```

## 🔐 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/join-group` - Unirse a grupo
- `POST /api/auth/leave-group` - Salir de grupo
- `GET /api/auth/verify` - Verificar token

### Grupos
- `POST /api/groups` - Crear grupo (Admin/Teacher)
- `GET /api/groups/all` - Listar todos los grupos (Admin)
- `GET /api/groups/my-groups` - Mis grupos administrados
- `GET /api/groups/:id` - Obtener grupo específico
- `PUT /api/groups/:id` - Actualizar grupo
- `DELETE /api/groups/:id` - Eliminar grupo
- `GET /api/groups/:id/members` - Listar miembros
- `DELETE /api/groups/:id/members/:userId` - Remover miembro
- `PUT /api/groups/:id/members/:userId` - Actualizar miembro
- `POST /api/groups/:id/transfer-admin` - Transferir administración

### Progreso de Juegos
- `POST /api/games/progress` - Guardar progreso
- `GET /api/games/progress` - Obtener mi progreso
- `GET /api/games/progress/user/:userId` - Progreso de usuario
- `GET /api/games/progress/group/:groupId` - Progreso de grupo
- `GET /api/games/leaderboard` - Tabla de líderes
- `DELETE /api/games/progress/:id` - Eliminar progreso

## 👥 Roles y Permisos

### Admin (Administrador del Sistema)
- ✅ Acceso a todos los grupos
- ✅ Gestión completa de usuarios
- ✅ Ver estadísticas globales
- ✅ Eliminar cualquier progreso

### Teacher (Profesor)
- ✅ Crear y administrar grupos
- ✅ Gestionar miembros de sus grupos
- ✅ Ver progreso de sus estudiantes
- ✅ Eliminar progreso de su grupo

### Student (Estudiante)
- ✅ Unirse a grupos con código
- ✅ Ver su progreso personal
- ✅ Participar en juegos
- ✅ Ver tabla de líderes de su grupo

## 🎮 Integración con Juegos

### Guardar Progreso
```javascript
// Ejemplo de uso en componentes de juego
const { apiCall } = useAuth();

const saveProgress = async (gameData) => {
  try {
    await apiCall('/games/progress', {
      method: 'POST',
      body: JSON.stringify({
        gameType: 'NAND_GAME',
        level: 1,
        completed: true,
        score: 100,
        timeSpent: 120 // segundos
      })
    });
  } catch (error) {
    console.error('Error guardando progreso:', error);
  }
};
```

### Obtener Progreso
```javascript
const getMyProgress = async () => {
  try {
    const response = await apiCall('/games/progress?gameType=NAND_GAME');
    console.log('Mi progreso:', response.data.progress);
  } catch (error) {
    console.error('Error obteniendo progreso:', error);
  }
};
```

## 🔧 Configuración Avanzada

### Cambiar Puerto del Backend
Edita el archivo `.env`:
```env
PORT=3002
```

### Configurar JWT
```env
JWT_SECRET=tu_clave_super_secreta_aqui
JWT_EXPIRES_IN=30d
```

### Configurar CORS
En `server/server.js`, modifica:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://tu-dominio.com'],
  credentials: true
}));
```

## 🐛 Solución de Problemas

### Error: "No se puede cargar el archivo npm.ps1"
**Solución:** Usar el archivo `install-backend.bat` o cambiar la política de ejecución:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "EADDRINUSE: Puerto ya en uso"
**Solución:** Cambiar el puerto en `.env` o terminar el proceso:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill
```

### Error: "Cannot find module 'sqlite3'"
**Solución:** Reinstalar dependencias:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Base de datos corrupta
**Solución:** Eliminar y recrear:
```bash
rm server/data/intratel.db
# Reiniciar el servidor para recrear automáticamente
```

## 📝 Flujo de Trabajo Típico

### Para Profesores:
1. Registrarse con rol de teacher
2. Crear un grupo nuevo
3. Compartir el código de grupo con estudiantes
4. Monitorear progreso de estudiantes
5. Gestionar miembros del grupo

### Para Estudiantes:
1. Registrarse con código de grupo
2. Acceder a los juegos
3. Completar niveles y ganar puntos
4. Ver progreso personal y ranking
5. Competir con compañeros

### Para Administradores:
1. Acceso a todos los grupos
2. Gestión global de usuarios
3. Monitoreo de estadísticas
4. Mantenimiento del sistema

## 🚀 Próximas Características

- [ ] Notificaciones en tiempo real
- [ ] Exportar estadísticas a Excel
- [ ] Sistema de logros y badges
- [ ] Chat entre miembros del grupo
- [ ] Calendario de actividades
- [ ] Reportes avanzados
- [ ] API para integración con LMS
- [ ] Modo offline

## 📞 Soporte

Si encuentras algún problema o necesitas ayuda:

1. Revisa la sección de solución de problemas
2. Verifica los logs del servidor en la consola
3. Asegúrate de que todos los puertos estén disponibles
4. Verifica que las dependencias estén correctamente instaladas

## 📄 Licencia

Este proyecto es parte del sistema educativo IntraTEL y está destinado para uso académico.

---

**¡Disfruta usando el sistema de grupos IntraTEL! 🎓**
