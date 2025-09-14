# 🔧 Guía de Desarrollo - IntraTEL

## 🎯 Información General

Esta guía está dirigida a desarrolladores que desean contribuir al proyecto IntraTEL o entender su funcionamiento interno.

## 🏗️ Arquitectura del Proyecto

### **Stack Tecnológico**
- **Frontend**: React 18 + Vite 5
- **Backend**: Node.js + Express.js
- **Base de Datos**: SQLite 3
- **Autenticación**: JWT (JSON Web Tokens)
- **Estilos**: CSS Modules + Variables CSS
- **Herramientas**: ESLint, Prettier

### **Estructura de Directorios**

```
IntraTEL/
├── 📁 public/                  # Archivos estáticos
├── 📁 src/                     # Código fuente frontend
│   ├── 📁 components/          # Componentes React
│   ├── 📁 context/             # Estado global (Context API)
│   ├── 📁 config/              # Configuración centralizada
│   ├── 📁 layouts/             # Layouts principales
│   └── 📁 assets/              # Recursos (imágenes, etc.)
├── 📁 server/                  # Código fuente backend
│   ├── 📁 controllers/         # Lógica de negocio
│   ├── 📁 models/              # Modelos de datos
│   ├── 📁 routes/              # Definición de rutas
│   ├── 📁 middleware/          # Middleware personalizado
│   ├── 📁 config/              # Configuración de BD
│   └── 📁 scripts/             # Scripts de utilidad
├── 📁 docs/                    # Documentación
└── 📄 package.json             # Dependencias y scripts
```

## 🚀 Setup de Desarrollo

### **Prerrequisitos**
- Node.js 18.0.0 o superior
- npm 9.0.0 o superior
- Git 2.30.0 o superior
- Editor de código (VS Code recomendado)

### **Configuración Inicial**

#### 1. **Clonar y Configurar**
```bash
# Clonar repositorio
git clone <repository-url>
cd IntraTEL

# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

#### 2. **Variables de Entorno**
Crea un archivo `.env` en la raíz:

```env
# === Configuración Principal ===
NODE_ENV=development
PORT=3001

# === API Configuration ===
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PREFIX=/api

# === JWT Configuration ===
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d

# === Database ===
DB_PATH=./server/data/intratel.db

# === App Settings ===
VITE_APP_NAME=IntraTEL
VITE_APP_VERSION=1.0.0-dev

# === Game Configuration ===
VITE_MAX_FLAG_ATTEMPTS=3
VITE_FLAG_COOLDOWN_MINUTES=5
VITE_DEFAULT_FLAG_POINTS=10

# === Development ===
VITE_ENABLE_LOGGING=true
VITE_DEBUG_MODE=true
```

#### 3. **Inicializar Base de Datos**
```bash
cd server
node scripts/createAdmin.js
node scripts/createFlags.js
cd ..
```

#### 4. **Ejecutar en Modo Desarrollo**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

## 🧩 Estructura de Componentes

### **Patrón de Componentes**
Todos los componentes siguen esta estructura:

```javascript
// Ejemplo: src/components/Example/ExampleComponent.jsx
import { useState, useEffect } from 'react';
import styles from './ExampleComponent.module.css';
import { useAuth } from '../../context/AuthContext';
import { log, getApiUrl } from '../../config/environment';

const ExampleComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Efectos secundarios
    log('Component mounted:', 'ExampleComponent');
  }, []);

  const handleAction = async () => {
    try {
      // Lógica del componente
    } catch (error) {
      logError('Error in ExampleComponent:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* JSX del componente */}
    </div>
  );
};

export default ExampleComponent;
```

### **CSS Modules**
Cada componente tiene su archivo CSS módulo:

```css
/* ExampleComponent.module.css */
.container {
  /* Variables CSS globales disponibles */
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: var(--spacing-sm);
  }
}

.button {
  background: var(--primary-gradient);
  border: none;
  color: white;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-sm);
  transition: var(--transition-standard);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

## 🔌 API y Backend

### **Arquitectura de la API**
IntraTEL utiliza una **API RESTful** construida con Express.js que sigue los principios de:

- **Stateless**: Cada request contiene toda la información necesaria
- **CRUD Operations**: Create, Read, Update, Delete para todos los recursos
- **JWT Authentication**: Tokens seguros para autenticación
- **Role-based Access**: Control de acceso basado en roles
- **Error Handling**: Manejo consistente de errores
- **Response Format**: Formato estandarizado para todas las respuestas

### **Estructura de Endpoints**
```
/api
├── /auth                    # Autenticación y usuarios
│   ├── POST /register       # Registro de usuario
│   ├── POST /login          # Inicio de sesión
│   ├── GET /profile         # Perfil del usuario
│   ├── PUT /profile         # Actualizar perfil
│   └── GET /admin/*         # Rutas de administración
├── /flags                   # Sistema de flags
│   ├── POST /submit         # Enviar flag
│   ├── GET /user           # Flags del usuario
│   ├── GET /leaderboard    # Ranking individual
│   └── GET /admin/*        # Gestión de flags
├── /groups                  # Gestión de grupos
│   ├── POST /              # Crear grupo
│   ├── POST /join          # Unirse a grupo
│   ├── GET /:id            # Información del grupo
│   └── PUT /:id            # Actualizar grupo
└── /games                   # Sistema de juegos
    ├── POST /progress      # Guardar progreso
    ├── GET /progress       # Obtener progreso
    └── GET /leaderboard    # Ranking de juegos
```

### **Middleware de Seguridad**
```javascript
// server/middleware/auth.js
import jwt from 'jsonwebtoken';

// Middleware de autenticación básica
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acceso requerido'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware para requerir roles específicos
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }
    next();
  };
};

// Middleware para administradores de grupo
export const requireGroupAdmin = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    
    const group = await Group.findById(groupId);
    if (!group || group.admin_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Debe ser administrador del grupo'
      });
    }
    
    req.group = group;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando permisos de grupo'
    });
  }
};
```

### **Controladores Avanzados**
```javascript
// server/controllers/FlagController.js
import Flag from '../models/Flag.js';
import { logError } from '../config/environment.js';

class FlagController {
  // Enviar flag con validación avanzada
  static async submitFlag(req, res) {
    try {
      const { flag } = req.body;
      const userId = req.user.id;

      // Validaciones
      if (!flag || !flag.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La flag es requerida'
        });
      }

      // Lógica de negocio
      const result = await Flag.submitFlag(userId, flag.trim());

      // Respuesta contextual
      if (result.alreadySubmittedByGroup) {
        return res.json({
          success: true,
          alreadySubmittedByGroup: true,
          message: `✅ Flag correcta, pero ya fue subida por ${result.submittedBy.firstName}`,
          data: result
        });
      }

      // Respuesta exitosa
      res.json({
        success: true,
        message: `🎉 ¡Felicitaciones! Has obtenido "${result.flagName}" (+${result.points} puntos)`,
        data: result
      });

    } catch (error) {
      logError('Error enviando flag:', error);
      
      // Manejo específico de errores
      switch (error.message) {
        case 'Flag inválida':
          return res.status(400).json({
            success: false,
            message: 'Flag no existe o es incorrecta'
          });
        case 'Usuario no encontrado':
          return res.status(404).json({
            success: false,
            message: 'Usuario no válido'
          });
        default:
          return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
          });
      }
    }
  }

  // Obtener estadísticas de flags del usuario
  static async getUserFlagStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await Flag.getUserStats(userId);

      res.json({
        success: true,
        data: {
          totalFlags: stats.total_flags,
          totalPoints: stats.total_points,
          personalFlags: stats.personal_flags,
          teamFlags: stats.team_flags,
          rank: stats.user_rank,
          groupRank: stats.group_rank,
          recentSubmissions: stats.recent_flags
        }
      });

    } catch (error) {
      logError('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de flags'
      });
    }
  }

  // Crear nueva flag (solo administradores)
  static async createFlag(req, res) {
    try {
      // Verificar permisos de admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo los administradores pueden crear flags'
        });
      }

      const { name, description, flag_value, points, category, difficulty } = req.body;

      // Validaciones
      const validationErrors = [];
      if (!name) validationErrors.push('El nombre es requerido');
      if (!description) validationErrors.push('La descripción es requerida');
      if (!flag_value) validationErrors.push('El valor de la flag es requerido');
      if (points && (points < 1 || points > 100)) {
        validationErrors.push('Los puntos deben estar entre 1 y 100');
      }

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: validationErrors
        });
      }

      // Crear flag
      const flagData = {
        name: name.trim(),
        description: description.trim(),
        flag_value: flag_value.trim(),
        points: points || 10,
        category: category || 'general',
        difficulty: difficulty || 'medium',
        created_by: req.user.id
      };

      const newFlag = await Flag.create(flagData);

      res.status(201).json({
        success: true,
        message: 'Flag creada exitosamente',
        data: {
          id: newFlag.id,
          name: newFlag.name,
          description: newFlag.description,
          points: newFlag.points,
          category: newFlag.category,
          difficulty: newFlag.difficulty,
          created_at: newFlag.created_at
        }
      });

    } catch (error) {
      logError('Error creando flag:', error);
      
      if (error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una flag con ese nombre o valor'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error creando la flag'
      });
    }
  }

  // Obtener ranking con paginación
  static async getLeaderboard(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const result = await Flag.getLeaderboard(limit, offset);

      res.json({
        success: true,
        data: result.users,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
          hasNext: page < Math.ceil(result.total / limit),
          hasPrev: page > 1
        }
      });

    } catch (error) {
      logError('Error obteniendo ranking:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo el ranking'
      });
    }
  }
}

export default FlagController;
```

### **Modelos de Datos**
```javascript
// server/models/Example.js
const Database = require('../config/database');

class Example {
  static async create(data) {
    const db = Database.getInstance();
    const stmt = db.prepare(`
      INSERT INTO examples (name, description, created_at)
      VALUES (?, ?, datetime('now'))
    `);
    
    const result = stmt.run(data.name, data.description);
    return { id: result.lastInsertRowid, ...data };
  }

  static async findById(id) {
    const db = Database.getInstance();
    const stmt = db.prepare('SELECT * FROM examples WHERE id = ?');
    return stmt.get(id);
  }

  static async findAll() {
    const db = Database.getInstance();
    const stmt = db.prepare('SELECT * FROM examples ORDER BY created_at DESC');
    return stmt.all();
  }

  static async update(id, data) {
    const db = Database.getInstance();
    const stmt = db.prepare(`
      UPDATE examples 
      SET name = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `);
    
    const result = stmt.run(data.name, data.description, id);
    return result.changes > 0;
  }

  static async delete(id) {
    const db = Database.getInstance();
    const stmt = db.prepare('DELETE FROM examples WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = Example;
```

## 🎮 Sistema de Juegos

### **Estructura de un Juego**
```javascript
// src/components/Games/NewGame/NewGame.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { saveGameProgress } from '../../../utils/gameUtils';
import styles from './NewGame.module.css';

const NewGame = () => {
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    isPlaying: false,
    completed: false
  });
  
  const { user } = useAuth();

  // Lógica de juego
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now()
    }));
  }, []);

  const completeLevel = useCallback(async (levelScore) => {
    const newGameState = {
      ...gameState,
      level: gameState.level + 1,
      score: gameState.score + levelScore,
      isPlaying: false
    };

    setGameState(newGameState);

    // Guardar progreso en backend
    if (user) {
      await saveGameProgress('new-game', newGameState);
    }
  }, [gameState, user]);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameHeader}>
        <h2>Nuevo Juego</h2>
        <div className={styles.gameStats}>
          <span>Nivel: {gameState.level}</span>
          <span>Puntuación: {gameState.score}</span>
        </div>
      </div>
      
      <div className={styles.gameArea}>
        {/* Contenido del juego */}
      </div>
      
      {!gameState.isPlaying && (
        <button 
          className={styles.startButton}
          onClick={startGame}
        >
          Comenzar Juego
        </button>
      )}
    </div>
  );
};

export default NewGame;
```

### **Utilidades de Juego**
```javascript
// src/utils/gameUtils.js
import { getApiUrl, getAuthHeaders } from '../config/environment';

export const saveGameProgress = async (gameId, gameState) => {
  try {
    const response = await fetch(getApiUrl('/games/save'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({
        game_id: gameId,
        progress_data: gameState,
        completed_at: gameState.completed ? new Date().toISOString() : null
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save game progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving game progress:', error);
    throw error;
  }
};

export const loadGameProgress = async (gameId) => {
  try {
    const response = await fetch(getApiUrl(`/games/progress?game_id=${gameId}`), {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to load game progress');
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading game progress:', error);
    return null;
  }
};
```

## 🚩 Sistema de Flags

### **Crear Nueva Flag (Admin)**
```javascript
// Proceso para añadir una nueva flag al sistema

// 1. En el panel de admin, usar el formulario de creación
const createFlag = async (flagData) => {
  const response = await fetch(getApiUrl('/flags/admin/create'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      name: flagData.name,
      description: flagData.description,
      flag_value: flagData.answer,
      points: flagData.points || 10,
      category: flagData.category,
      difficulty: flagData.difficulty
    })
  });
  
  return await response.json();
};

// 2. La flag se almacena cifrada en la base de datos
// 3. Los usuarios pueden verla y enviar respuestas
// 4. El sistema valida automáticamente las respuestas
```

## 🧪 Testing

### **Configuración de Tests**
```javascript
// tests/components/ExampleComponent.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from '../../src/context/AuthContext';
import ExampleComponent from '../../src/components/ExampleComponent';

const renderWithAuth = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

describe('ExampleComponent', () => {
  test('renders correctly', () => {
    renderWithAuth(<ExampleComponent />);
    expect(screen.getByText('Example')).toBeInTheDocument();
  });

  test('handles user interaction', () => {
    renderWithAuth(<ExampleComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Verificar comportamiento esperado
  });
});
```

### **Tests de API**
```javascript
// tests/api/auth.test.js
const request = require('supertest');
const app = require('../../server/app');

describe('Auth Endpoints', () => {
  test('POST /api/auth/register', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'securepassword'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(userData.email);
  });

  test('POST /api/auth/login', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'securepassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
```

## 🚀 Despliegue

### **Build de Producción**
```bash
# 1. Instalar dependencias
npm install
cd server && npm install && cd ..

# 2. Configurar variables de entorno para producción
cp .env.example .env.production

# 3. Construir frontend
npm run build

# 4. Configurar servidor web (nginx, apache, etc.)
# 5. Configurar PM2 para el backend
npm install -g pm2
pm2 start server/server.js --name "intratel-backend"

# 6. Configurar SSL/HTTPS
# 7. Configurar backups de base de datos
```

### **Docker (Opcional)**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package.json
COPY package*.json ./
COPY server/package*.json ./server/

# Instalar dependencias
RUN npm install
RUN cd server && npm install

# Copiar código fuente
COPY . .

# Construir frontend
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["node", "server/server.js"]
```

## 🔧 Herramientas de Desarrollo

### **Scripts NPM Disponibles**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src --ext .js,.jsx,.ts,.tsx --fix",
    "format": "prettier --write 'src/**/*.{js,jsx,ts,tsx,css,md}'",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### **Configuración ESLint**
```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      'react/prop-types': 'warn',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
];
```

## 🐛 Debugging

### **Logging del Sistema**
```javascript
// Usar las funciones de logging centralizadas
import { log, logError, logWarning } from '../config/environment';

// Logging básico
log('User logged in:', user.email);

// Errores
try {
  await apiCall();
} catch (error) {
  logError('API call failed:', error);
}

// Warnings
logWarning('Deprecated function used:', functionName);
```

### **Debugging en Desarrollo**
```javascript
// Variables de debug disponibles
const debugMode = import.meta.env.VITE_DEBUG_MODE;

if (debugMode) {
  console.log('Debug info:', debugData);
}
```

## 🤝 Contribución

### **Git Workflow**
```bash
# 1. Crear rama para feature/bugfix
git checkout -b feature/new-feature

# 2. Hacer cambios y commits semánticos
git add .
git commit -m "feat: add new game component"

# 3. Pushear y crear Pull Request
git push origin feature/new-feature
```

### **Code Review Checklist**
- [ ] ✅ Código sigue las convenciones del proyecto
- [ ] 🧪 Tests incluidos para nueva funcionalidad
- [ ] 📝 Documentación actualizada
- [ ] 🔧 ESLint pasa sin errores
- [ ] 🎨 Componentes son responsivos
- [ ] ♿ Accesibilidad considerada
- [ ] 🔐 Seguridad validada
- [ ] 📱 Testing en múltiples navegadores

---

<div align="center">

**¡Gracias por contribuir a IntraTEL!**

[⬅️ Volver al README](../README.md) | [📖 Manual de Usuario](./user-manual.md) | [🏗️ Arquitectura](./architecture.md)

</div>
