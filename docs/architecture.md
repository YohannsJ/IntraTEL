# 🏗️ Arquitectura del Sistema - IntraTEL

## 🎯 Visión General de la Arquitectura

IntraTEL está diseñado como una aplicación web moderna de arquitectura de tres capas con separación clara de responsabilidades y alta escalabilidad.

## 📐 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Navegador)                      │
├─────────────────────────────────────────────────────────────┤
│  React Frontend (SPA)                                      │
│  ├── Components (UI)                                       │
│  ├── Context (Estado Global)                               │
│  ├── Utils (Herramientas)                                  │
│  └── Config (Configuración)                                │
└─────────────────┬───────────────────────────────────────────┘
                  │ HTTP/HTTPS + WebSocket
                  │ (JSON API)
┌─────────────────▼───────────────────────────────────────────┐
│                Backend Node.js + Express                    │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│  ├── Routes (API Endpoints)                                │
│  ├── Middleware (Auth, CORS, etc.)                         │
│  └── Error Handling                                        │
│                                                             │
│  Business Logic Layer                                       │
│  ├── Controllers (Lógica de negocio)                       │
│  ├── Services (Servicios de aplicación)                    │
│  └── Validation (Validación de datos)                      │
│                                                             │
│  Data Access Layer                                          │
│  ├── Models (Acceso a datos)                               │
│  ├── Database (SQLite)                                     │
│  └── Migrations/Scripts                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼───────────────────────────────────────────┐
│                   Base de Datos SQLite                      │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                    │
│  ├── users (Usuarios y autenticación)                      │
│  ├── groups (Grupos de estudio)                            │
│  ├── available_flags (Catálogo de flags)                   │
│  ├── user_flags (Flags obtenidas)                          │
│  └── game_progress (Progreso en juegos)                    │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Frontend Architecture (React)

### **Arquitectura de Componentes**

```
src/
├── 📁 components/
│   ├── 🏛️ Layout Components
│   │   ├── Header/
│   │   ├── Sidebar/
│   │   ├── Footer/
│   │   └── Navigation/
│   │
│   ├── 🔐 Authentication
│   │   ├── AuthPage/
│   │   ├── LoginForm/
│   │   ├── RegisterForm/
│   │   └── ProtectedRoute/
│   │
│   ├── 🎮 Game Components
│   │   ├── GameCard/
│   │   ├── GameProgress/
│   │   └── Games/
│   │       ├── G1/ (NAND Game)
│   │       ├── G2/ (Future)
│   │       └── G3/ (Future)
│   │
│   ├── 👥 Group Management
│   │   ├── GroupDashboard/
│   │   ├── GroupCard/
│   │   ├── JoinGroup/
│   │   └── GroupStats/
│   │
│   ├── 🚩 Flag System
│   │   ├── FlagSubmitter/
│   │   ├── FlagCard/
│   │   ├── FlagHistory/
│   │   └── Leaderboard/
│   │
│   ├── 👤 User Management
│   │   ├── UserProfile/
│   │   ├── UserStats/
│   │   └── UserSettings/
│   │
│   └── 🔧 Admin Panel
│       ├── AdminDashboard/
│       ├── UserManagement/
│       ├── FlagCreator/
│       └── SystemStats/
│
├── 📁 context/
│   ├── AuthContext.jsx (Autenticación global)
│   ├── ThemeContext.jsx (Tema de la aplicación)
│   └── DataContext.jsx (Cache de datos)
│
├── 📁 config/
│   ├── environment.js (Configuración centralizada)
│   └── index.js (Exportaciones)
│
├── 📁 layouts/
│   ├── LandingPage.jsx
│   ├── Auth.jsx
│   └── 404.jsx
│
└── 📁 utils/
    ├── api.js (Helpers para API)
    ├── validation.js (Validación de forms)
    └── helpers.js (Utilidades generales)
```

### **Flujo de Datos (Unidirectional Data Flow)**

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   User Action   │─────▶│  Event Handler  │─────▶│  State Update   │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                                            │
┌─────────────────┐      ┌─────────────────┐               │
│   Re-render     │◀─────│  React Context  │◀──────────────┘
└─────────────────┘      └─────────────────┘
```

### **Estado Global (Context Pattern)**

```javascript
// Estructura del AuthContext
const authState = {
  user: {
    id: number,
    email: string,
    name: string,
    role: 'admin' | 'teacher' | 'student',
    group_id: number | null,
    created_at: string
  },
  isAuthenticated: boolean,
  isLoading: boolean,
  token: string | null
};

// Estructura del DataContext
const dataState = {
  groups: Group[],
  flags: Flag[],
  gameProgress: GameProgress[],
  userStats: UserStats,
  leaderboard: LeaderboardEntry[],
  cache: {
    lastUpdated: Date,
    ttl: number
  }
};
```

## 🔧 Backend Architecture (Node.js)

### **Arquitectura en Capas**

#### **1. Presentation Layer (Rutas y Middleware)**
```javascript
// Estructura de rutas
server/routes/
├── auth.js          # /api/auth/*
├── groups.js        # /api/groups/*
├── flags.js         # /api/flags/*
├── games.js         # /api/games/*
└── index.js         # Router principal

// Middleware Stack
Request ──▶ CORS ──▶ Auth ──▶ Validation ──▶ Rate Limiting ──▶ Controller
```

#### **2. Business Logic Layer (Controladores)**
```javascript
// Patrón de Controlador
class AuthController {
  static async login(req, res) {
    try {
      // 1. Validar entrada
      const { email, password } = req.body;
      
      // 2. Lógica de negocio
      const user = await User.findByEmail(email);
      const isValid = await bcrypt.compare(password, user.password);
      
      // 3. Generar respuesta
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      
      // 4. Retornar resultado
      res.json({ success: true, token, user });
    } catch (error) {
      // 5. Manejo de errores
      ErrorHandler.handle(error, res);
    }
  }
}
```

#### **3. Data Access Layer (Modelos)**
```javascript
// Patrón Repository/Active Record
class User {
  // Métodos de consulta
  static async findById(id) { /* ... */ }
  static async findByEmail(email) { /* ... */ }
  static async create(userData) { /* ... */ }
  
  // Métodos de negocio
  static async authenticate(email, password) { /* ... */ }
  static async updateProfile(id, data) { /* ... */ }
  
  // Métodos de validación
  static validateEmail(email) { /* ... */ }
  static validatePassword(password) { /* ... */ }
}
```

## 🗄️ Base de Datos (SQLite)

### **Esquema de la Base de Datos**

```sql
-- Usuarios del sistema
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('admin', 'teacher', 'student') DEFAULT 'student',
    group_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- Grupos de estudio
CREATE TABLE groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    invitation_code VARCHAR(10) UNIQUE NOT NULL,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Catálogo de flags disponibles
CREATE TABLE available_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    flag_value VARCHAR(255) NOT NULL, -- Encrypted
    points INTEGER DEFAULT 10,
    category VARCHAR(100),
    difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Flags obtenidas por usuarios
CREATE TABLE user_flags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    flag_id INTEGER NOT NULL,
    submitted_value VARCHAR(255),
    is_correct BOOLEAN NOT NULL,
    points_earned INTEGER DEFAULT 0,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flag_id) REFERENCES available_flags(id),
    UNIQUE(user_id, flag_id) -- Un usuario solo puede obtener una flag una vez
);

-- Progreso en juegos
CREATE TABLE game_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    game_id VARCHAR(100) NOT NULL,
    level INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    progress_data JSON, -- Estado del juego en formato JSON
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, game_id)
);

-- Índices para optimización
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_group ON users(group_id);
CREATE INDEX idx_user_flags_user ON user_flags(user_id);
CREATE INDEX idx_user_flags_flag ON user_flags(flag_id);
CREATE INDEX idx_game_progress_user ON game_progress(user_id);
CREATE INDEX idx_groups_invitation ON groups(invitation_code);
```

### **Relaciones Entre Tablas**

```
users ──┐
        ├─── groups (1:N - Un grupo tiene muchos usuarios)
        │
        ├─── user_flags (1:N - Un usuario puede tener muchas flags)
        │
        ├─── game_progress (1:N - Un usuario puede tener progreso en varios juegos)
        │
        └─── available_flags (1:N - Un admin puede crear muchas flags)

groups ──── users (1:N - inverso)

available_flags ──── user_flags (1:N - Una flag puede ser obtenida por muchos usuarios)
```

## 🔐 Sistema de Autenticación

### **Flujo de Autenticación JWT**

```
1. Login Request
   ┌─────────────┐    POST /api/auth/login    ┌─────────────┐
   │   Cliente   │──────────────────────────▶│   Backend   │
   └─────────────┘    {email, password}      └─────────────┘
                                                     │
2. Validation                                        │ Validate credentials
   ┌─────────────┐                                   ▼
   │  Database   │◀─────────────────────────┌─────────────┐
   └─────────────┘   Query user by email   │   Backend   │
                                           └─────────────┘
                                                     │
3. JWT Generation                                    │ Generate JWT
   ┌─────────────┐                                   ▼
   │     JWT     │◀─────────────────────────┌─────────────┐
   └─────────────┘   Sign with secret      │   Backend   │
                                           └─────────────┘
                                                     │
4. Response                                          │
   ┌─────────────┐    {token, user}         ┌─────────────┐
   │   Cliente   │◀──────────────────────────│   Backend   │
   └─────────────┘                          └─────────────┘
                                                     
5. Subsequent Requests
   ┌─────────────┐    Authorization: Bearer <token>  ┌─────────────┐
   │   Cliente   │────────────────────────────────▶│   Backend   │
   └─────────────┘                                  └─────────────┘
                                                           │
6. Token Verification                                      │ Verify JWT
   ┌─────────────┐                                         ▼
   │ Middleware  │◀─────────────────────────────────┌─────────────┐
   └─────────────┘      Extract user info          │   Backend   │
```

### **Middleware de Autenticación**

```javascript
// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // 1. Extraer token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Buscar usuario
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }

    // 4. Agregar usuario al request
    req.user = user;
    next();
    
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token inválido' 
    });
  }
};

module.exports = auth;
```

## 🎮 Arquitectura del Sistema de Juegos

### **Patrón de Juego Modular**

```javascript
// Arquitectura base para juegos
class BaseGame {
  constructor(gameId, userId) {
    this.gameId = gameId;
    this.userId = userId;
    this.state = this.getInitialState();
    this.eventHandlers = new Map();
  }

  // Métodos base que todos los juegos deben implementar
  abstract getInitialState();
  abstract validateMove(move);
  abstract calculateScore(state);
  abstract isGameComplete(state);
  
  // Métodos comunes
  async saveProgress() {
    await GameProgress.save(this.userId, this.gameId, this.state);
  }
  
  async loadProgress() {
    const progress = await GameProgress.load(this.userId, this.gameId);
    if (progress) {
      this.state = progress.progress_data;
    }
  }
}

// Implementación específica - NAND Game
class NANDGame extends BaseGame {
  getInitialState() {
    return {
      level: 1,
      components: [],
      connections: [],
      targetTruthTable: [],
      completed: false
    };
  }

  validateMove(move) {
    // Validar movimiento específico del juego NAND
    return this.isValidConnection(move.from, move.to);
  }

  calculateScore(state) {
    // Calcular puntuación basada en eficiencia del circuito
    const baseScore = 100;
    const penalty = state.components.length * 5;
    return Math.max(0, baseScore - penalty);
  }

  isGameComplete(state) {
    return this.evaluateCircuit(state) === state.targetTruthTable;
  }
}
```

## 🚩 Arquitectura del Sistema de Flags

### **Proceso de Creación y Validación**

```
1. Creación (Admin)
   ┌─────────────┐    Create Flag    ┌─────────────┐
   │    Admin    │─────────────────▶│   Backend   │
   └─────────────┘                  └─────────────┘
                                           │
                                           ▼ Encrypt flag_value
                                    ┌─────────────┐
                                    │  Database   │
                                    └─────────────┘

2. Visualización (Usuario)
   ┌─────────────┐    Get Flags     ┌─────────────┐
   │   Student   │─────────────────▶│   Backend   │
   └─────────────┘                  └─────────────┘
                                           │
                                           ▼ Return metadata only
                                    ┌─────────────┐
                                    │  Response   │
                                    │  {name,     │
                                    │   desc,     │
                                    │   points}   │
                                    └─────────────┘

3. Envío (Usuario)
   ┌─────────────┐   Submit Answer   ┌─────────────┐
   │   Student   │─────────────────▶│   Backend   │
   └─────────────┘                  └─────────────┘
                                           │
                                           ▼ Validate against encrypted value
                                    ┌─────────────┐
                                    │ Validation  │
                                    │   Logic     │
                                    └─────────────┘
                                           │
                                           ▼ Award points if correct
                                    ┌─────────────┐
                                    │  Database   │
                                    │  (user_     │
                                    │   flags)    │
                                    └─────────────┘
```

## 📊 Sistema de Cache y Optimización

### **Estrategia de Cache**

```javascript
// Cache en memoria para datos frecuentemente accedidos
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  set(key, value, ttlMs = 300000) { // 5 minutos por defecto
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + ttlMs);
  }

  get(key) {
    const expiry = this.ttl.get(key);
    
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  // Cache específico para datos del sistema
  async getUserStats(userId) {
    const cacheKey = `user_stats_${userId}`;
    let stats = this.get(cacheKey);
    
    if (!stats) {
      stats = await this.calculateUserStats(userId);
      this.set(cacheKey, stats, 600000); // 10 minutos
    }
    
    return stats;
  }
}
```

## 🔄 Patrones de Arquitectura Utilizados

### **1. MVC (Model-View-Controller)**
- **Model**: Modelos de datos en el backend
- **View**: Componentes React en el frontend
- **Controller**: Controladores Express en el backend

### **2. Repository Pattern**
- Abstracción del acceso a datos
- Facilita testing y mantenimiento
- Separación clara entre lógica de negocio y persistencia

### **3. Context Pattern (React)**
- Estado global compartido
- Evita prop drilling
- Gestión centralizada de autenticación y datos

### **4. Component Composition**
- Componentes reutilizables y modulares
- Separación de responsabilidades
- Facilita mantenimiento y testing

### **5. Middleware Pattern**
- Procesamiento en capas de las requests
- Separación de responsabilidades cross-cutting
- Facilita add/remove funcionalidades

## 🔒 Consideraciones de Seguridad

### **Frontend Security**
- **XSS Protection**: Sanitización de inputs
- **CSRF Protection**: Tokens CSRF en formularios
- **Input Validation**: Validación client-side y server-side
- **Secure Storage**: JWT en httpOnly cookies (producción)

### **Backend Security**
- **JWT Security**: Secretos fuertes, expiración apropiada
- **SQL Injection Prevention**: Prepared statements
- **Rate Limiting**: Prevención de ataques de fuerza bruta
- **CORS Configuration**: Configuración restrictiva de CORS
- **Input Sanitization**: Validación y limpieza de todos los inputs

### **Database Security**
- **Password Hashing**: bcrypt con salt rounds altos
- **Flag Encryption**: Cifrado de valores de flags
- **Backup Security**: Backups cifrados y seguros
- **Access Control**: Principio de menor privilegio

## 📈 Escalabilidad y Performance

### **Optimizaciones Frontend**
- **Code Splitting**: Lazy loading de componentes
- **Memoization**: React.memo para componentes pesados
- **Virtual Scrolling**: Para listas largas
- **Image Optimization**: Formatos modernos y lazy loading

### **Optimizaciones Backend**
- **Database Indexing**: Índices en campos frecuentemente consultados
- **Connection Pooling**: Pool de conexiones a la base de datos
- **Caching Strategy**: Cache de consultas frecuentes
- **Async Processing**: Operaciones pesadas en background

### **Consideraciones de Escalabilidad**
- **Microservicios**: Posible migración futura
- **Load Balancing**: Para múltiples instancias
- **CDN**: Para assets estáticos
- **Database Sharding**: Para datasets grandes

---

<div align="center">

**Arquitectura diseñada para escalabilidad, mantenibilidad y performance**

[⬅️ Volver al README](../README.md) | [📖 Manual de Usuario](./user-manual.md) | [🔧 Guía de Desarrollo](./development-guide.md)

</div>
