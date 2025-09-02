# 🚀 IntraTEL - Sistema Interactivo de Aprendizaje Telemático

**IntraTEL** es una plataforma educativa innovadora desarrollada por **DifTel** para estudiantes de Ingeniería Civil Telemática. La plataforma combina gamificación, colaboración en grupos y desafíos técnicos para crear una experiencia de aprendizaje única e interactiva.

## 📋 Tabla de Contenidos

- [🎯 Características Principales](#-características-principales)
- [🏗️ Arquitectura del Sistema](#️-arquitectura-del-sistema)
- [🚀 Instalación y Configuración](#-instalación-y-configuración)
- [🎮 Funcionalidades](#-funcionalidades)
- [👥 Roles de Usuario](#-roles-de-usuario)
- [🔧 Desarrollo](#-desarrollo)
- [📚 Documentación](#-documentación)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🎯 Características Principales

### 🎮 **Sistema de Juegos Educativos**
- **Circuitos Lógicos NAND**: Juego interactivo para aprender diseño de circuitos digitales
- **Simuladores de Protocolos**: Experiencias prácticas con protocolos de red
- **Desafíos de Telecomunicaciones**: Ejercicios específicos de la carrera

### 🚩 **Sistema de Flags y Gamificación**
- **Flags Personalizables**: Los administradores pueden crear desafíos únicos
- **Sistema de Puntuación**: Puntos por logros y progreso
- **Ranking Competitivo**: Tabla de líderes global y por grupos
- **Logros Desbloqueables**: Reconocimientos por hitos específicos

### 👥 **Gestión de Grupos**
- **Creación de Grupos**: Los profesores pueden formar equipos de estudio
- **Códigos de Invitación**: Sistema simple para unirse a grupos
- **Estadísticas Grupales**: Métricas de rendimiento por equipo
- **Administración Flexible**: Transferencia de roles y gestión de miembros

### 🔐 **Sistema de Autenticación Robusto**
- **Múltiples Roles**: Admin, Profesor, Estudiante
- **Autenticación JWT**: Seguridad moderna y escalable
- **Perfiles Personalizables**: Gestión completa de información personal

## 🏗️ Arquitectura del Sistema

### **Frontend (React + Vite)**
```
src/
├── components/           # Componentes reutilizables
│   ├── Admin/           # Panel de administración
│   ├── Auth/            # Autenticación y registro
│   ├── Games/           # Juegos educativos
│   │   ├── G1/          # Juego de circuitos NAND
│   │   ├── G2/          # Próximos juegos
│   │   └── G3/          # Próximos juegos
│   ├── Groups/          # Gestión de grupos
│   ├── Profile/         # Perfil de usuario
│   └── etc/             # Utilidades (tema, etc.)
├── context/             # Estado global de React
├── config/              # Configuración centralizada
├── layouts/             # Layouts principales
└── assets/              # Recursos estáticos
```

### **Backend (Node.js + Express)**
```
server/
├── controllers/         # Lógica de negocio
├── models/             # Modelos de datos (SQLite)
├── routes/             # Definición de rutas API
├── middleware/         # Middleware de autenticación
├── config/             # Configuración de base de datos
├── scripts/            # Utilidades y scripts
└── data/               # Base de datos SQLite
```

### **Base de Datos (SQLite)**
- **users**: Información de usuarios y autenticación
- **groups**: Datos de grupos y códigos de invitación
- **available_flags**: Catálogo de flags disponibles
- **user_flags**: Registro de flags obtenidas por usuarios
- **game_progress**: Progreso en juegos individuales

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+ 
- npm o yarn
- Git

### **1. Clonar el Repositorio**
```bash
git clone <repository-url>
cd IntraTEL
```

### **2. Configurar Variables de Entorno**
Crea un archivo `.env` en la raíz del proyecto:

```env
# Configuración del servidor
PORT=3001
NODE_ENV=development

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PREFIX=/api

# JWT Configuration
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=7d

# App Configuration
VITE_APP_NAME=IntraTEL
VITE_APP_VERSION=1.0.0

# Base de datos
DB_PATH=./server/data/intratel.db

# Game Configuration
VITE_MAX_FLAG_ATTEMPTS=3
VITE_FLAG_COOLDOWN_MINUTES=5
VITE_DEFAULT_FLAG_POINTS=10

# UI Configuration
VITE_ITEMS_PER_PAGE=10
VITE_ADMIN_STATS_REFRESH_INTERVAL=30000
VITE_LEADERBOARD_LIMIT=20

# Security Configuration
SESSION_TIMEOUT_HOURS=24
VITE_TOKEN_STORAGE_KEY=intratel-token

# Development Configuration
VITE_ENABLE_LOGGING=true
```

### **3. Instalar Dependencias**
```bash
# Dependencias del frontend
npm install

# Dependencias del backend
cd server
npm install
cd ..
```

### **4. Configurar la Base de Datos**
```bash
# El script inicializará automáticamente la base de datos SQLite
cd server
node scripts/createAdmin.js
```

### **5. Ejecutar el Proyecto**

#### **Modo de Desarrollo**
```bash
# Terminal 1: Backend
cd server
npm run dev
# o
node server.js

# Terminal 2: Frontend
npm run dev
```

#### **Modo de Producción**
```bash
# Construir frontend
npm run build

# Servir aplicación
npm run preview
```

### **6. Acceder a la Aplicación**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api
- **Admin por defecto**: Creado automáticamente en primera ejecución

## 🎮 Funcionalidades

### **Para Estudiantes**
- ✅ **Registro e inicio de sesión**
- ✅ **Unirse a grupos con códigos**
- ✅ **Jugar juegos educativos**
- ✅ **Enviar flags y obtener puntos**
- ✅ **Ver progreso personal y ranking**
- ✅ **Gestionar perfil personal**

### **Para Profesores**
- ✅ **Crear y gestionar grupos**
- ✅ **Generar códigos de invitación**
- ✅ **Ver estadísticas de estudiantes**
- ✅ **Monitorear progreso grupal**

### **Para Administradores**
- ✅ **Panel de administración completo**
- ✅ **Gestión de usuarios y roles**
- ✅ **Creación de flags personalizadas**
- ✅ **Asignación de grupos a estudiantes**
- ✅ **Visualización de estadísticas globales**
- ✅ **Monitoreo de flags obtenidas**

## 👥 Roles de Usuario

### **🔧 Administrador (`admin`)**
- Control total del sistema
- Gestión de usuarios y contenido
- Creación de flags y desafíos
- Acceso a métricas y estadísticas

### **👨‍🏫 Profesor (`teacher`)**
- Creación y administración de grupos
- Monitoreo de progreso estudiantil
- Acceso a estadísticas grupales

### **👨‍🎓 Estudiante (`student`)**
- Participación en juegos y desafíos
- Envío de flags y obtención de puntos
- Colaboración en grupos de estudio

## 🔧 Desarrollo

### **Estructura de Componentes**
- **Modulares**: Cada componente tiene responsabilidad única
- **Reutilizables**: Diseño que permite reutilización
- **CSS Modules**: Estilos encapsulados y mantenibles

### **API RESTful**
```
GET    /api/auth/verify              # Verificar autenticación
POST   /api/auth/login               # Iniciar sesión
POST   /api/auth/register            # Registrar usuario

GET    /api/groups                   # Listar grupos
POST   /api/groups                   # Crear grupo
POST   /api/groups/join              # Unirse a grupo
POST   /api/groups/leave             # Salir de grupo

GET    /api/flags/user               # Flags del usuario
POST   /api/flags/submit             # Enviar flag
GET    /api/flags/admin/all          # Todas las flags (admin)
POST   /api/flags/admin/create       # Crear flag (admin)

GET    /api/games/progress           # Progreso en juegos
POST   /api/games/save               # Guardar progreso
```

### **Sistema de Configuración**
- **Centralizado**: Toda la configuración en `src/config/environment.js`
- **Variables de Entorno**: Configuración flexible por ambiente
- **Helpers**: Funciones auxiliares para API y logging

### **Logging y Debug**
```javascript
import { log, logError } from '../config/environment';

log('Información general');
logError('Error específico', errorObject);
```

## 📚 Documentación

### **Documentos Disponibles**
- 📖 **[Manual de Usuario](./docs/user-manual.md)** - Guía completa para usuarios
- 🔧 **[Guía de Desarrollo](./docs/development-guide.md)** - Setup y contribución
- 🏗️ **[Arquitectura del Sistema](./docs/architecture.md)** - Diseño técnico
- 🚀 **[Guía de Despliegue](./docs/deployment.md)** - Producción y hosting

## 🤝 Contribución

### **Proceso de Contribución**
1. **Fork** el repositorio
2. **Crea** una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. **Abre** un Pull Request

### **Estándares de Código**
- **ESLint**: Configuración estricta para calidad de código
- **Prettier**: Formateo automático consistente
- **Commits Semánticos**: `feat:`, `fix:`, `docs:`, `style:`, etc.

## 🚧 Roadmap

### **v1.1 - Próximas Funcionalidades**
- [ ] Más juegos educativos (G2, G3)
- [ ] Sistema de notificaciones en tiempo real
- [ ] Chat grupal integrado
- [ ] Exportación de estadísticas
- [ ] Modo offline para juegos

### **v1.2 - Mejoras Avanzadas**
- [ ] Integración con LMS externos
- [ ] API para terceros
- [ ] Móvil app (React Native)
- [ ] Análisis de learning analytics

## 📞 Soporte

### **Contacto**
- **Email**: diftel@usm.cl
- **Issues**: [GitHub Issues](./issues)
- **Documentación**: [Wiki del Proyecto](./wiki)

### **FAQ**
**P: ¿Cómo reseteo mi contraseña?**
R: Contacta al administrador del sistema o usa la opción de recuperación.

**P: ¿Puedo estar en múltiples grupos?**
R: No, cada usuario puede pertenecer a un solo grupo a la vez.

**P: ¿Cómo obtengo permisos de profesor?**
R: Los permisos son asignados por administradores del sistema.

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License** - ver el archivo [LICENSE](LICENSE) para detalles.

---

<div align="center">

**Desarrollado con ❤️ por DifTel para la comunidad de Ingeniería Civil Telemática**

[🏠 Inicio](/) | [📖 Documentación](./docs/) | [🎮 Demo](./demo) | [🤝 Contribuir](./CONTRIBUTING.md)

</div>
