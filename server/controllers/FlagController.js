import Flag from '../models/Flag.js';

class FlagController {
  // Enviar una flag
  static async submitFlag(req, res) {
    try {
      const { flag } = req.body;
      const userId = req.user.id;

      if (!flag || !flag.trim()) {
        return res.status(400).json({
          success: false,
          message: 'La flag es requerida'
        });
      }

      const result = await Flag.submitFlag(userId, flag.trim());

      // Si la flag ya fue subida por alguien del grupo
      if (result.alreadySubmittedByGroup) {
        return res.json({
          success: true,
          alreadySubmittedByGroup: true,
          message: `✅ Flag correcta, pero ya fue subida por ${result.submittedBy.firstName} ${result.submittedBy.lastName} (@${result.submittedBy.username}) el ${new Date(result.submittedBy.submittedAt).toLocaleString()}`,
          data: {
            flagName: result.flagName,
            description: result.description,
            points: result.points,
            submittedBy: result.submittedBy
          }
        });
      }

      res.json({
        success: true,
        message: `🎉 ¡Felicitaciones! Has obtenido la flag "${result.flagName}" (+${result.points} puntos)`,
        data: result
      });

    } catch (error) {
      console.error('Error enviando flag:', error);
      
      if (error.message === 'Flag inválida') {
        return res.status(500).json({
          success: false,
          message: 'Flag no existe o es incorrecta'
        });
      }
      
      if (error.message.includes('Ya has enviado')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener flags del usuario actual
  static async getUserFlags(req, res) {
    try {
      const userId = req.user.id;
      const flags = await Flag.getUserFlags(userId);

      res.json({
        success: true,
        data: flags
      });

    } catch (error) {
      console.error('Error obteniendo flags del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas de flags del usuario
  static async getUserFlagStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await Flag.getUserFlagStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas de flags:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener tabla de líderes individual
  static async getLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await Flag.getLeaderboard(parseInt(limit));

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      console.error('Error obteniendo tabla de líderes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener tabla de líderes de grupos
  static async getGroupLeaderboard(req, res) {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await Flag.getGroupLeaderboard(parseInt(limit));

      res.json({
        success: true,
        data: leaderboard
      });

    } catch (error) {
      console.error('Error obteniendo ranking de grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener flags recientes (tiempo real)
  static async getRecentFlags(req, res) {
    try {
      const { limit = 50 } = req.query;
      const flags = await Flag.getRecentFlags(parseInt(limit));

      res.json({
        success: true,
        data: flags
      });

    } catch (error) {
      console.error('Error obteniendo flags recientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener flags de un grupo específico
  static async getGroupFlags(req, res) {
    try {
      const { groupId } = req.params;
      const flags = await Flag.getGroupFlags(parseInt(groupId));

      res.json({
        success: true,
        data: flags
      });

    } catch (error) {
      console.error('Error obteniendo flags del grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas del sistema (público)
  static async getSystemStats(req, res) {
    try {
      const stats = await Flag.getSystemStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ========================
  // MÉTODOS DE ADMINISTRADOR
  // ========================

  // Obtener todas las flags de todos los usuarios (solo admin)
  static async getAllUserFlags(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const flags = await Flag.getAllUserFlags();

      res.json({
        success: true,
        data: flags
      });

    } catch (error) {
      console.error('Error obteniendo todas las flags:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Crear nueva flag (solo admin)
  static async createFlag(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { flagName, flagValue, description, points } = req.body;

      if (!flagName || !flagValue) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y valor de la flag son requeridos'
        });
      }

      const flag = await Flag.createFlag({
        flagName,
        flagValue,
        description,
        points: parseInt(points) || 10
      });

      res.status(201).json({
        success: true,
        message: 'Flag creada exitosamente',
        data: flag
      });

    } catch (error) {
      console.error('Error creando flag:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todas las flags disponibles (solo admin)
  static async getAllAvailableFlags(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const flags = await Flag.getAllAvailableFlags();

      res.json({
        success: true,
        data: flags
      });

    } catch (error) {
      console.error('Error obteniendo flags disponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar flag (solo admin)
  static async updateFlag(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { flagId } = req.params;
      const { flagName, flagValue, description, points } = req.body;

      if (!flagName || !flagValue) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y valor de la flag son requeridos'
        });
      }

      const updatedFlag = await Flag.updateFlag(flagId, {
        flagName,
        flagValue,
        description,
        points: parseInt(points) || 0
      });

      res.json({
        success: true,
        message: 'Flag actualizada exitosamente',
        data: updatedFlag
      });

    } catch (error) {
      console.error('Error actualizando flag:', error);
      
      if (error.message.includes('Flag no encontrada')) {
        return res.status(404).json({
          success: false,
          message: 'Flag no encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar flag (solo admin)
  static async deleteFlag(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const { flagId } = req.params;
      const result = await Flag.deleteFlag(flagId);

      if (result.deleted) {
        res.json({
          success: true,
          message: 'Flag eliminada exitosamente',
          data: result
        });
      } else if (result.deactivated) {
        res.json({
          success: true,
          message: `Flag desactivada exitosamente. No se eliminó porque ${result.affectedUsers} usuarios ya la tienen asignada.`,
          data: result
        });
      }

    } catch (error) {
      console.error('Error eliminando flag:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener progreso de usuarios en el tiempo (solo admin)
  static async getUserProgressOverTime(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Se requieren permisos de administrador.'
        });
      }

      const progressData = await Flag.getUserProgressOverTime();

      res.json({
        success: true,
        data: progressData
      });

    } catch (error) {
      console.error('Error obteniendo progreso de usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default FlagController;
