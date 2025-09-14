# 📡 Referencia de API - IntraTEL

## 🌐 Información General

La API de IntraTEL está construida con **Express.js** y utiliza **JWT** para autenticación. Todas las rutas protegidas requieren un token válido en el header `Authorization`.

### **Base URL**
```
Desarrollo: http://localhost:3001/api
Producción: https://your-domain.com/api
```

### **Autenticación**
```javascript
// Headers requeridos para rutas protegidas
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

### **Respuestas de la API**
Todas las respuestas siguen este formato:

```javascript
// Respuesta exitosa
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* contenido */ }
}

// Respuesta de error
{
  "success": false,
  "message": "Descripción del error",
  "error": { /* detalles del error */ }
}
```

---

## 🔐 Autenticación (auth)

### **POST** `/auth/register`
Registra un nuevo usuario en el sistema.

**Cuerpo de la solicitud:**
```javascript
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "username": "juan.perez",
  "email": "juan@example.com",
  "password": "password123",
  "group_code": "ABC123" // Opcional
}
```

**Respuesta exitosa (201):**
```javascript
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "username": "juan.perez",
      "email": "juan@example.com",
      "role": "student",
      "group_id": 1,
      "group_name": "Grupo ABC123"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **POST** `/auth/login`
Inicia sesión con credenciales existentes.

**Cuerpo de la solicitud:**
```javascript
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": { /* datos del usuario */ },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### **GET** `/auth/profile` 🔒
Obtiene el perfil del usuario autenticado.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "juan.perez",
    "email": "juan@example.com",
    "role": "student",
    "group_id": 1,
    "group_name": "Grupo ABC123",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### **PUT** `/auth/profile` 🔒
Actualiza el perfil del usuario.

**Cuerpo de la solicitud:**
```javascript
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez García",
  "username": "juanc.perez"
}
```

### **PUT** `/auth/change-password` 🔒
Cambia la contraseña del usuario.

**Cuerpo de la solicitud:**
```javascript
{
  "current_password": "password123",
  "new_password": "newpassword456"
}
```

### **POST** `/auth/join-group` 🔒
Une al usuario a un grupo existente.

**Cuerpo de la solicitud:**
```javascript
{
  "group_code": "XYZ789"
}
```

### **POST** `/auth/leave-group` 🔒
Abandona el grupo actual.

### **GET** `/auth/verify` 🔒
Verifica si el token JWT es válido.

### **GET** `/auth/statistics` 🔒
Obtiene estadísticas del usuario.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "total_flags": 15,
    "total_points": 150,
    "games_completed": 3,
    "rank": 5,
    "group_rank": 2
  }
}
```

---

## 🚩 Flags (flags)

### **POST** `/flags/submit` 🔒
Envía una flag para validación.

**Cuerpo de la solicitud:**
```javascript
{
  "flag": "INTRATEL{ejemplo_flag_123}"
}
```

**Respuesta exitosa (200):**
```javascript
// Flag nueva y correcta
{
  "success": true,
  "message": "🎉 ¡Felicitaciones! Has obtenido la flag \"Ejemplo Flag\" (+10 puntos)",
  "data": {
    "flagName": "Ejemplo Flag",
    "description": "Descripción de la flag",
    "points": 10,
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}

// Flag ya subida por el grupo
{
  "success": true,
  "alreadySubmittedByGroup": true,
  "message": "✅ Flag correcta, pero ya fue subida por Juan Pérez (@juan.perez) el 15/1/2024 10:30:00",
  "data": {
    "flagName": "Ejemplo Flag",
    "description": "Descripción de la flag",
    "points": 10,
    "submittedBy": {
      "firstName": "Juan",
      "lastName": "Pérez",
      "username": "juan.perez",
      "submittedAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### **GET** `/flags/user` 🔒
Obtiene las flags del usuario autenticado.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "flag_name": "Primera Flag",
      "description": "Tu primera flag",
      "points": 10,
      "submitted_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### **GET** `/flags/user/stats` 🔒
Obtiene estadísticas de flags del usuario.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "totalFlags": 15,
    "totalPoints": 150,
    "personalFlags": 10,
    "teamFlags": 5,
    "recentSubmissions": [
      {
        "flag_name": "Flag Reciente",
        "points": 10,
        "submitted_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### **GET** `/flags/leaderboard` 🔒
Obtiene el ranking individual de flags.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "username": "juan.perez",
      "total_flags": 15,
      "total_points": 150,
      "rank": 1
    }
  ]
}
```

### **GET** `/flags/groups/leaderboard` 🔒
Obtiene el ranking de grupos.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "group_id": 1,
      "group_name": "Grupo A",
      "group_code": "ABC123",
      "total_flags": 25,
      "total_points": 250,
      "member_count": 5,
      "rank": 1
    }
  ]
}
```

### **GET** `/flags/recent` 🔒
Obtiene las flags más recientes enviadas.

**Parámetros de consulta:**
- `limit`: Número de flags a retornar (por defecto: 10)

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "flag_name": "Flag Reciente",
      "user_name": "Juan Pérez",
      "username": "juan.perez",
      "group_name": "Grupo A",
      "points": 10,
      "submitted_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### **GET** `/flags/groups/:groupId` 🔒
Obtiene las flags de un grupo específico.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "flag_name": "Flag del Grupo",
      "description": "Descripción",
      "points": 10,
      "submitted_by": "Juan Pérez",
      "submitted_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### **POST** `/flags/admin/create` 🔒👑
Crea una nueva flag (solo administradores).

**Cuerpo de la solicitud:**
```javascript
{
  "name": "Nueva Flag",
  "description": "Descripción de la flag",
  "flag_value": "INTRATEL{nueva_flag_123}",
  "points": 15,
  "category": "web",
  "difficulty": "medium"
}
```

### **GET** `/flags/admin/all` 🔒👑
Obtiene todas las flags enviadas por usuarios.

### **GET** `/flags/admin/available` 🔒👑
Obtiene todas las flags disponibles en el sistema.

---

## 👥 Grupos (groups)

### **POST** `/groups` 🔒👨‍🏫
Crea un nuevo grupo (solo profesores y administradores).

**Cuerpo de la solicitud:**
```javascript
{
  "name": "Grupo de Desarrollo",
  "description": "Grupo para el curso de desarrollo web",
  "max_members": 10
}
```

**Respuesta exitosa (201):**
```javascript
{
  "success": true,
  "message": "Grupo creado exitosamente",
  "data": {
    "id": 1,
    "name": "Grupo de Desarrollo",
    "description": "Grupo para el curso de desarrollo web",
    "code": "ABC123",
    "max_members": 10,
    "current_members": 1,
    "admin_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### **GET** `/groups/code/:code` 🔒
Busca un grupo por su código.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grupo de Desarrollo",
    "description": "Grupo para el curso de desarrollo web",
    "code": "ABC123",
    "max_members": 10,
    "current_members": 5,
    "admin_name": "Profesor Juan",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### **POST** `/groups/join` 🔒
Une al usuario a un grupo usando un código.

**Cuerpo de la solicitud:**
```javascript
{
  "group_code": "ABC123"
}
```

### **POST** `/groups/leave` 🔒
Abandona el grupo actual del usuario.

### **GET** `/groups/all` 🔒👑
Obtiene todos los grupos (solo administradores).

### **GET** `/groups/my-groups` 🔒
Obtiene los grupos administrados por el usuario.

### **GET** `/groups/:groupId` 🔒👥
Obtiene información detallada de un grupo.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Grupo de Desarrollo",
    "description": "Grupo para el curso de desarrollo web",
    "code": "ABC123",
    "max_members": 10,
    "current_members": 5,
    "admin_id": 1,
    "admin_name": "Profesor Juan",
    "created_at": "2024-01-15T10:30:00.000Z",
    "members": [
      {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "username": "juan.perez",
        "role": "student",
        "joined_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### **PUT** `/groups/:groupId` 🔒👤
Actualiza un grupo (solo admin del grupo).

**Cuerpo de la solicitud:**
```javascript
{
  "name": "Nuevo nombre del grupo",
  "description": "Nueva descripción",
  "max_members": 15
}
```

### **DELETE** `/groups/:groupId` 🔒👤
Elimina un grupo (solo admin del grupo).

### **GET** `/groups/:groupId/stats` 🔒👥
Obtiene estadísticas del grupo.

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "total_flags": 50,
    "total_points": 500,
    "average_flags_per_member": 10,
    "most_active_member": {
      "name": "Juan Pérez",
      "flags": 15
    },
    "recent_activity": [
      {
        "user_name": "Juan Pérez",
        "flag_name": "Flag Reciente",
        "points": 10,
        "submitted_at": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### **GET** `/groups/:groupId/members` 🔒👥
Obtiene la lista de miembros del grupo.

### **DELETE** `/groups/:groupId/members/:userId` 🔒👤
Remueve un miembro del grupo (solo admin del grupo).

### **PUT** `/groups/:groupId/members/:userId` 🔒👤
Actualiza el rol de un miembro (solo admin del grupo).

### **POST** `/groups/:groupId/transfer-admin` 🔒👤
Transfiere la administración del grupo a otro miembro.

**Cuerpo de la solicitud:**
```javascript
{
  "new_admin_id": 2
}
```

---

## 🎮 Juegos (games)

### **POST** `/games/progress` 🔒
Guarda el progreso de un juego.

**Cuerpo de la solicitud:**
```javascript
{
  "game_id": "nand-game",
  "progress_data": {
    "level": 5,
    "score": 1500,
    "completed_challenges": ["challenge1", "challenge2"],
    "time_spent": 3600000
  },
  "completed_at": "2024-01-15T10:30:00.000Z" // null si no está completo
}
```

**Respuesta exitosa (201):**
```javascript
{
  "success": true,
  "message": "Progreso guardado exitosamente",
  "data": {
    "id": 1,
    "game_id": "nand-game",
    "progress_data": { /* datos del progreso */ },
    "completed_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### **GET** `/games/progress` 🔒
Obtiene el progreso de juegos del usuario.

**Parámetros de consulta:**
- `game_id`: ID del juego específico (opcional)

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "id": 1,
      "game_id": "nand-game",
      "progress_data": {
        "level": 5,
        "score": 1500,
        "completed_challenges": ["challenge1", "challenge2"],
        "time_spent": 3600000
      },
      "completed_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### **GET** `/games/leaderboard` 🔒
Obtiene la tabla de líderes de juegos.

**Parámetros de consulta:**
- `game_id`: ID del juego específico (opcional)
- `limit`: Número de resultados (por defecto: 10)

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "Juan",
      "last_name": "Pérez",
      "username": "juan.perez",
      "game_id": "nand-game",
      "best_score": 2500,
      "completion_time": 7200000,
      "completed_at": "2024-01-15T10:30:00.000Z",
      "rank": 1
    }
  ]
}
```

### **GET** `/games/progress/user/:userId` 🔒
Obtiene el progreso de juegos de un usuario específico.

### **GET** `/games/progress/group/:groupId` 🔒👥
Obtiene el progreso de juegos de un grupo.

### **DELETE** `/games/progress/:progressId` 🔒
Elimina un registro de progreso específico.

### **DELETE** `/games/progress/user/:userId` 🔒👑
Elimina todo el progreso de un usuario (solo administradores).

### **GET** `/games/stats/general` 🔒👑
Obtiene estadísticas generales de juegos (solo administradores).

**Respuesta exitosa (200):**
```javascript
{
  "success": true,
  "data": {
    "total_players": 150,
    "total_game_sessions": 500,
    "average_completion_time": 5400000,
    "most_popular_game": "nand-game",
    "completion_rate": 0.75,
    "games_breakdown": [
      {
        "game_id": "nand-game",
        "total_players": 120,
        "completion_rate": 0.8,
        "average_score": 1800
      }
    ]
  }
}
```

---

## 🔧 Funciones del Frontend

### **AuthContext - Gestión de Autenticación**

```javascript
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { 
    user,           // Usuario actual
    loading,        // Estado de carga
    isAuthenticated,// Booleano de autenticación
    login,          // Función de login
    logout,         // Función de logout
    register,       // Función de registro
    updateProfile,  // Actualizar perfil
    changePassword, // Cambiar contraseña
    joinGroup,      // Unirse a grupo
    leaveGroup      // Abandonar grupo
  } = useAuth();

  // Ejemplo de uso
  const handleLogin = async (email, password) => {
    try {
      const result = await login(email, password);
      if (result.success) {
        console.log('Login exitoso');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Bienvenido, {user.first_name}!</p>
      ) : (
        <button onClick={() => handleLogin('email', 'password')}>
          Iniciar Sesión
        </button>
      )}
    </div>
  );
};
```

### **DataContext - Gestión de Datos**

```javascript
import { useData } from '../context/DataContext';

const MyComponent = () => {
  const { 
    isRefreshing,   // Estado de actualización
    refreshData     // Función para refrescar datos
  } = useData();

  return (
    <div>
      {isRefreshing && <div>Actualizando datos...</div>}
      <button onClick={refreshData}>Actualizar</button>
    </div>
  );
};
```

### **Utilidades de API**

```javascript
import { getApiUrl, getAuthHeaders, apiRequest } from '../config';

// Realizar solicitud GET
const fetchUserData = async () => {
  try {
    const response = await fetch(getApiUrl('/auth/profile'), {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Error en la solicitud');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// Realizar solicitud POST
const submitFlag = async (flagValue) => {
  try {
    const response = await fetch(getApiUrl('/flags/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ flag: flagValue })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error enviando flag:', error);
    throw error;
  }
};

// Función helper para requests API
const makeApiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error en la solicitud');
  }
  
  return await response.json();
};

// Ejemplos de uso específicos
export const flagAPI = {
  submit: (flag) => makeApiRequest('/flags/submit', {
    method: 'POST',
    body: JSON.stringify({ flag })
  }),
  
  getUserFlags: () => makeApiRequest('/flags/user'),
  
  getLeaderboard: () => makeApiRequest('/flags/leaderboard'),
  
  getGroupLeaderboard: () => makeApiRequest('/flags/groups/leaderboard')
};

export const groupAPI = {
  create: (groupData) => makeApiRequest('/groups', {
    method: 'POST',
    body: JSON.stringify(groupData)
  }),
  
  join: (groupCode) => makeApiRequest('/groups/join', {
    method: 'POST',
    body: JSON.stringify({ group_code: groupCode })
  }),
  
  leave: () => makeApiRequest('/groups/leave', {
    method: 'POST'
  }),
  
  getByCode: (code) => makeApiRequest(`/groups/code/${code}`),
  
  getMembers: (groupId) => makeApiRequest(`/groups/${groupId}/members`)
};

export const gameAPI = {
  saveProgress: (gameId, progressData, completedAt = null) => 
    makeApiRequest('/games/progress', {
      method: 'POST',
      body: JSON.stringify({
        game_id: gameId,
        progress_data: progressData,
        completed_at: completedAt
      })
    }),
  
  getProgress: (gameId = null) => {
    const url = gameId ? `/games/progress?game_id=${gameId}` : '/games/progress';
    return makeApiRequest(url);
  },
  
  getLeaderboard: (gameId = null, limit = 10) => {
    const params = new URLSearchParams();
    if (gameId) params.append('game_id', gameId);
    if (limit) params.append('limit', limit);
    
    return makeApiRequest(`/games/leaderboard?${params}`);
  }
};
```

### **Hooks Personalizados**

```javascript
// useApi.js - Hook personalizado para llamadas API
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const useApi = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && options.requireAuth !== false) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await makeApiRequest(endpoint, options.requestOptions);
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, isAuthenticated]);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await makeApiRequest(endpoint, options.requestOptions);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
};

// useFlags.js - Hook específico para flags
export const useFlags = () => {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitFlag = async (flagValue) => {
    try {
      setLoading(true);
      const result = await flagAPI.submit(flagValue);
      
      if (result.success) {
        // Actualizar lista de flags local
        await refreshFlags();
      }
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshFlags = async () => {
    try {
      setLoading(true);
      const result = await flagAPI.getUserFlags();
      setFlags(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFlags();
  }, []);

  return {
    flags,
    loading,
    error,
    submitFlag,
    refreshFlags
  };
};
```

---

## 🔒 Códigos de Estado y Errores

### **Códigos de Estado HTTP**
- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos
- `401` - Unauthorized: Token inválido o ausente
- `403` - Forbidden: Permisos insuficientes
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto (ej: usuario ya existe)
- `500` - Internal Server Error: Error del servidor

### **Errores Comunes**

```javascript
// Error de autenticación
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": {
    "code": "INVALID_TOKEN",
    "details": "El token JWT no es válido"
  }
}

// Error de validación
{
  "success": false,
  "message": "Datos inválidos",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "email": "El email es requerido",
      "password": "La contraseña debe tener al menos 6 caracteres"
    }
  }
}

// Error de permisos
{
  "success": false,
  "message": "Permisos insuficientes",
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "details": "Requiere rol de administrador"
  }
}
```

---

## 📊 Middleware de Autenticación

### **authenticateToken**
Verifica que el usuario esté autenticado.

### **requireRole(['admin', 'teacher'])**
Requiere que el usuario tenga uno de los roles especificados.

### **requireGroupAdmin**
Requiere que el usuario sea administrador del grupo especificado.

### **requireGroupMembership**
Requiere que el usuario sea miembro del grupo especificado.

---

## 🚀 Ejemplos de Integración Completa

### **Componente de Lista de Flags**

```javascript
import React, { useState, useEffect } from 'react';
import { useFlags } from '../hooks/useFlags';
import { flagAPI } from '../utils/api';

const FlagsList = () => {
  const { flags, loading, error, submitFlag, refreshFlags } = useFlags();
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flagInput.trim()) return;

    try {
      setSubmitting(true);
      setMessage('');
      
      const result = await submitFlag(flagInput.trim());
      
      if (result.success) {
        setMessage(result.message);
        setFlagInput('');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Cargando flags...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flags-container">
      <h2>Mis Flags</h2>
      
      <form onSubmit={handleSubmit} className="flag-submit-form">
        <input
          type="text"
          value={flagInput}
          onChange={(e) => setFlagInput(e.target.value)}
          placeholder="Ingresa tu flag aquí..."
          disabled={submitting}
        />
        <button type="submit" disabled={submitting || !flagInput.trim()}>
          {submitting ? 'Enviando...' : 'Enviar Flag'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="flags-list">
        {flags.length === 0 ? (
          <p>No has obtenido flags aún.</p>
        ) : (
          flags.map((flag, index) => (
            <div key={index} className="flag-item">
              <h3>{flag.flag_name}</h3>
              <p>{flag.description}</p>
              <div className="flag-meta">
                <span>+{flag.points} puntos</span>
                <span>{new Date(flag.submitted_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <button onClick={refreshFlags} disabled={loading}>
        Actualizar Lista
      </button>
    </div>
  );
};

export default FlagsList;
```

### **Componente de Gestión de Grupos**

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { groupAPI } from '../utils/api';

const GroupManager = () => {
  const { user, joinGroup, leaveGroup } = useAuth();
  const [groupCode, setGroupCode] = useState('');
  const [groupInfo, setGroupInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const searchGroup = async () => {
    if (!groupCode.trim()) return;

    try {
      setLoading(true);
      setMessage('');
      
      const result = await groupAPI.getByCode(groupCode.trim());
      
      if (result.success) {
        setGroupInfo(result.data);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setGroupInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    try {
      setLoading(true);
      const result = await joinGroup(groupCode);
      
      if (result.success) {
        setMessage('Te has unido al grupo exitosamente');
        setGroupInfo(null);
        setGroupCode('');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);
      const result = await leaveGroup();
      
      if (result.success) {
        setMessage('Has abandonado el grupo');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-manager">
      <h2>Gestión de Grupos</h2>

      {user?.group_name ? (
        <div className="current-group">
          <h3>Grupo Actual: {user.group_name}</h3>
          <p>Código: {user.group_code}</p>
          <button onClick={handleLeaveGroup} disabled={loading}>
            Abandonar Grupo
          </button>
        </div>
      ) : (
        <div className="join-group">
          <h3>Unirse a un Grupo</h3>
          <div className="group-search">
            <input
              type="text"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
              placeholder="Código del grupo (ej: ABC123)"
              maxLength={6}
            />
            <button onClick={searchGroup} disabled={loading || !groupCode.trim()}>
              Buscar
            </button>
          </div>

          {groupInfo && (
            <div className="group-info">
              <h4>{groupInfo.name}</h4>
              <p>{groupInfo.description}</p>
              <p>
                Miembros: {groupInfo.current_members}/{groupInfo.max_members}
              </p>
              <p>Administrador: {groupInfo.admin_name}</p>
              
              {groupInfo.current_members < groupInfo.max_members ? (
                <button onClick={handleJoinGroup} disabled={loading}>
                  Unirse al Grupo
                </button>
              ) : (
                <p className="error">El grupo está lleno</p>
              )}
            </div>
          )}
        </div>
      )}

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default GroupManager;
```

---

## ⚙️ Configuración y Variables de Entorno

### **Variables de Frontend (Vite)**
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_API_PREFIX=/api
VITE_APP_NAME=IntraTEL
VITE_DEBUG_MODE=true
VITE_ENABLE_LOGGING=true
```

### **Variables de Backend**
```env
NODE_ENV=development
PORT=3001
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
DB_PATH=./server/data/intratel.db
```

### **Configuración Centralizada**

```javascript
// src/config/environment.js
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  API_PREFIX: import.meta.env.VITE_API_PREFIX || '/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'IntraTEL',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
  TOKEN_STORAGE_KEY: 'intratel_token'
};

export const getApiUrl = (endpoint) => {
  return `${config.API_BASE_URL}${config.API_PREFIX}${endpoint}`;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const log = (...args) => {
  if (config.DEBUG_MODE) {
    console.log('[IntraTEL]', ...args);
  }
};

export const logError = (...args) => {
  console.error('[IntraTEL Error]', ...args);
};

export { config };
```

---

<div align="center">

**📡 Documentación completa de la API IntraTEL**

[⬅️ Volver a la Guía de Desarrollo](./development-guide.md) | [📖 Manual de Usuario](./user-manual.md)

</div>
