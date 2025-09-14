import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password, firstName, lastName, groupCode, createGroup, groupName } = req.body;

      // Validaciones básicas
      if (!username || !email || !password || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos'
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Validar contraseña
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar si el usuario ya existe
      const existingUserByEmail = await User.findByEmail(email);
      if (existingUserByEmail) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este email'
        });
      }

      const existingUserByUsername = await User.findByUsername(username);
      if (existingUserByUsername) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con este nombre de usuario'
        });
      }

      // Manejar grupo
      let groupId = null;
      let userRole = 'student';

      if (createGroup && groupName) {
        // Crear nuevo grupo
        const Group = await import('../models/Group.js').then(m => m.default);
        const newGroup = await Group.create({
          name: groupName.trim(),
          createdBy: null // Se actualizará después de crear el usuario
        });
        groupId = newGroup.id;
        userRole = 'admin'; // El creador del grupo es admin
      } else if (groupCode) {
        // Unirse a grupo existente
        const Group = await import('../models/Group.js').then(m => m.default);
        const group = await Group.findByCode(groupCode);
        
        if (!group) {
          return res.status(400).json({
            success: false,
            message: 'Código de grupo inválido'
          });
        }
        
        groupId = group.id;
      }

      // Crear el usuario
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName,
        groupId,
        role: userRole
      });

      // Si creó un grupo, actualizar el campo createdBy
      if (createGroup && groupName && groupId) {
        const Group = await import('../models/Group.js').then(m => m.default);
        await Group.updateCreatedBy(groupId, user.id);
      }

      // Generar token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user,
          token
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Inicio de sesión
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son requeridos'
        });
      }

      // Buscar usuario por email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar si el usuario está activo
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuario inactivo. Contacta al administrador'
        });
      }

      // Verificar contraseña
      const isValidPassword = await User.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Obtener información completa del usuario
      const fullUser = await User.findById(user.id);

      // Generar token
      const token = generateToken(user.id);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: fullUser,
          token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener perfil del usuario actual
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      res.json({
        success: true,
        data: { user }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar perfil
  static async updateProfile(req, res) {
    try {
      const { username, firstName, lastName } = req.body;
      const updates = {};

      if (username) updates.username = username;
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;

      // Verificar si el username ya está en uso por otro usuario
      if (username) {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(409).json({
            success: false,
            message: 'Este nombre de usuario ya está en uso'
          });
        }
      }

      const user = await User.updateUser(req.user.id, updates);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Cambiar contraseña
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      // Obtener datos del usuario actual
      const currentUser = await User.findByEmail(req.user.email);
      
      // Verificar contraseña actual
      const isValidPassword = await User.validatePassword(currentPassword, currentUser.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Cambiar contraseña
      await User.changePassword(req.user.id, newPassword);

      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Unirse a un grupo
  static async joinGroup(req, res) {
    try {
      const { groupCode } = req.body;

      if (!groupCode) {
        return res.status(400).json({
          success: false,
          message: 'Código de grupo requerido'
        });
      }

      const user = await User.joinGroup(req.user.id, groupCode);

      res.json({
        success: true,
        message: 'Te has unido al grupo exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error uniéndose al grupo:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Salir de un grupo
  static async leaveGroup(req, res) {
    try {
      const user = await User.leaveGroup(req.user.id);

      res.json({
        success: true,
        message: 'Has salido del grupo exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error saliendo del grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Verificar token (para frontend)
  static async verifyToken(req, res) {
    res.json({
      success: true,
      data: { user: req.user }
    });
  }

  // ========================
  // MÉTODOS DE ADMINISTRADOR
  // ========================

  // Verificar si es administrador
  static checkAdminRole(req, res, next) {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
    }
    next();
  }

  // Obtener todos los usuarios (solo admin)
  static async getAllUsers(req, res) {
    try {
      // Verificar si es admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { page = 1, limit = 10, search = '', role = '', groupId = '' } = req.query;
      const offset = (page - 1) * limit;

      let whereConditions = [];
      let params = [];

      if (search) {
        whereConditions.push('(u.username LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)');
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam, searchParam);
      }

      if (role) {
        whereConditions.push('u.role = ?');
        params.push(role);
      }

      if (groupId) {
        whereConditions.push('u.group_id = ?');
        params.push(groupId);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Obtener usuarios con paginación
      const users = await User.getAllUsersWithPagination(whereClause, params, limit, offset);
      
      // Contar total de usuarios
      const totalUsers = await User.countUsers(whereClause, params);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalUsers,
            totalPages: Math.ceil(totalUsers / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener usuario por ID (solo admin)
  static async getUserById(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Obtener progreso del usuario
      const GameProgress = await import('../models/GameProgress.js').then(m => m.default);
      const progress = await GameProgress.getProgressByUserId(id);

      res.json({
        success: true,
        data: {
          user,
          progress
        }
      });

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar usuario como admin
  static async updateUserAsAdmin(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { id } = req.params;
      const { username, email, firstName, lastName, role, groupId, isActive } = req.body;

      // No permitir que el admin se desactive a sí mismo
      if (id == req.user.id && isActive === false) {
        return res.status(400).json({
          success: false,
          message: 'No puedes desactivar tu propia cuenta'
        });
      }

      const updates = {};
      if (username) updates.username = username;
      if (email) updates.email = email;
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
      if (role) updates.role = role;
      if (groupId !== undefined) updates.group_id = groupId;
      if (isActive !== undefined) updates.is_active = isActive;

      const user = await User.updateUser(id, updates);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar usuario (solo admin)
  static async deleteUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { id } = req.params;

      // No permitir que el admin se elimine a sí mismo
      if (id == req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'No puedes eliminar tu propia cuenta'
        });
      }

      const deleted = await User.deleteUser(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Dashboard de administrador
  static async getAdminDashboard(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      // Estadísticas generales
      const totalUsers = await User.countUsers('', []);
      const activeUsers = await User.countUsers('WHERE u.is_active = 1', []);
      const totalGroups = await User.countGroups();
      
      // Usuarios por rol
      const usersByRole = await User.getUsersByRole();
      
      // Actividad reciente (últimos 10 usuarios registrados)
      const recentUsers = await User.getRecentUsers(10);

      // Progreso de juegos
      const GameProgress = await import('../models/GameProgress.js').then(m => m.default);
      const gameStats = await GameProgress.getGameStatistics();

      res.json({
        success: true,
        data: {
          statistics: {
            totalUsers,
            activeUsers,
            totalGroups,
            usersByRole,
            gameStats
          },
          recentActivity: {
            recentUsers
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo dashboard admin:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas del usuario
  static async getUserStatistics(req, res) {
    try {
      const userId = req.user.id;

      // Obtener progreso de juegos del usuario
      const GameProgress = await import('../models/GameProgress.js').then(m => m.default);
      const userGameProgress = await GameProgress.getUserProgress(userId);

      // Obtener flags del usuario
      const Flag = await import('../models/Flag.js').then(m => m.default);
      const userFlags = await Flag.getUserFlags(userId);
      const totalFlags = await Flag.getTotalFlags();

      // Calcular estadísticas
      const totalPoints = userGameProgress.reduce((sum, progress) => sum + (progress.points || 0), 0) +
                         userFlags.reduce((sum, flag) => sum + (flag.points || 0), 0);

      const totalLevelsCompleted = userGameProgress.filter(p => p.is_completed).length;

      res.json({
        success: true,
        data: {
          statistics: {
            totalPoints,
            flagsObtained: userFlags.length,
            totalFlags: totalFlags,
            levelsCompleted: totalLevelsCompleted,
            gamesPlayed: userGameProgress.length
          },
          gameProgress: userGameProgress,
          flags: userFlags
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default AuthController;
