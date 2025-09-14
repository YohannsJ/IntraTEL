import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'intratel_secret_key_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware para verificar token JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de acceso requerido' 
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar el usuario en la base de datos
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o usuario inactivo' 
      });
    }

    // Agregar información del usuario a la request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    } else {
      console.error('Error en autenticación:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor' 
      });
    }
  }
};

// Middleware para verificar roles específicos
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Autenticación requerida' 
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}` 
      });
    }

    next();
  };
};

// Middleware para verificar que el usuario es admin del grupo
export const requireGroupAdmin = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    
    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de grupo requerido' 
      });
    }

    const Group = await import('../models/Group.js').then(m => m.default);
    const isAdmin = await Group.verifyAdminPermission(groupId, req.user.id);
    
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Solo el administrador del grupo puede realizar esta acción' 
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando permisos de admin:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verificando permisos' 
    });
  }
};

// Middleware para verificar que el usuario pertenece al grupo o es admin del sistema
export const requireGroupMembership = async (req, res, next) => {
  try {
    const groupId = req.params.groupId || req.body.groupId;
    
    if (!groupId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de grupo requerido' 
      });
    }

    // Admin del sistema puede acceder a cualquier grupo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar que el usuario pertenece al grupo
    if (req.user.group_id != groupId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tienes acceso a este grupo' 
      });
    }

    next();
  } catch (error) {
    console.error('Error verificando membresía del grupo:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error verificando membresía' 
    });
  }
};

// Función para generar JWT
export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Función para verificar token sin middleware (para uso interno)
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Middleware para logs de autenticación
export const logAuth = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';
  
  console.log(`[${timestamp}] AUTH: ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);
  
  if (req.user) {
    console.log(`[${timestamp}] User: ${req.user.username} (${req.user.role}) - Group: ${req.user.group_id || 'None'}`);
  }
  
  next();
};

export default {
  authenticateToken,
  requireRole,
  requireGroupAdmin,
  requireGroupMembership,
  generateToken,
  verifyToken,
  logAuth
};
