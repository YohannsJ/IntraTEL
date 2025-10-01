import GameProgress from '../models/GameProgress.js';
import { getUserAchievements, addUserAchievements } from '../models/AchievementsStore.js';

class GameController {
  // Obtener logros en memoria del usuario actual
  static async getMyAchievements(req, res) {
    try {
      const achievements = getUserAchievements(req.user.id);
      return res.json({ success: true, data: { achievements } });
    } catch (error) {
      console.error('Error obteniendo logros:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }

  // Agregar/actualizar logros del usuario actual
  static async saveMyAchievements(req, res) {
    try {
      const { achievements } = req.body;
      if (!Array.isArray(achievements)) {
        return res.status(400).json({ success: false, message: 'Formato inválido: achievements debe ser un array' });
      }
      const merged = addUserAchievements(req.user.id, achievements);
      return res.json({ success: true, message: 'Logros actualizados', data: { achievements: merged } });
    } catch (error) {
      console.error('Error guardando logros:', error);
      return res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
  }
  // Guardar o actualizar progreso del juego
  static async saveProgress(req, res) {
    try {
      const { gameType, level, completed, score, timeSpent } = req.body;

      if (!gameType || level === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de juego y nivel son requeridos'
        });
      }

      const progress = await GameProgress.createOrUpdate({
        userId: req.user.id,
        gameType,
        level,
        completed: completed || false,
        score: score || 0,
        timeSpent: timeSpent || 0
      });

      res.json({
        success: true,
        message: 'Progreso guardado exitosamente',
        data: { progress }
      });

    } catch (error) {
      console.error('Error guardando progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener progreso del usuario actual
  static async getMyProgress(req, res) {
    try {
      const { gameType } = req.query;

      const progress = await GameProgress.findByUserId(req.user.id, gameType);
      const stats = await GameProgress.getUserStats(req.user.id);

      res.json({
        success: true,
        data: { 
          progress,
          stats
        }
      });

    } catch (error) {
      console.error('Error obteniendo progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener progreso de un usuario específico (solo admin del grupo o del sistema)
  static async getUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const { gameType } = req.query;

      // Verificar permisos
      if (req.user.role !== 'admin' && req.user.id != userId) {
        // Si no es admin del sistema, verificar si es admin del grupo del usuario
        const User = await import('../models/User.js').then(m => m.default);
        const targetUser = await User.findById(userId);
        
        if (!targetUser || targetUser.group_id !== req.user.group_id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver este progreso'
          });
        }

        // Verificar si es admin del grupo
        const Group = await import('../models/Group.js').then(m => m.default);
        const isGroupAdmin = await Group.verifyAdminPermission(targetUser.group_id, req.user.id);
        
        if (!isGroupAdmin) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para ver este progreso'
          });
        }
      }

      const progress = await GameProgress.findByUserId(userId, gameType);
      const stats = await GameProgress.getUserStats(userId);

      res.json({
        success: true,
        data: { 
          progress,
          stats
        }
      });

    } catch (error) {
      console.error('Error obteniendo progreso del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener progreso del grupo
  static async getGroupProgress(req, res) {
    try {
      const { groupId } = req.params;
      const { gameType } = req.query;

      const progress = await GameProgress.findByGroupId(groupId, gameType);
      const stats = await GameProgress.getGroupStats(groupId, gameType);

      res.json({
        success: true,
        data: { 
          progress,
          stats
        }
      });

    } catch (error) {
      console.error('Error obteniendo progreso del grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener tabla de líderes
  static async getLeaderboard(req, res) {
    try {
      const { gameType, level, limit } = req.query;
      let groupId = null;

      // Si el usuario no es admin del sistema, solo mostrar su grupo
      if (req.user.role !== 'admin' && req.user.group_id) {
        groupId = req.user.group_id;
      }

      const leaderboard = await GameProgress.getLeaderboard(
        groupId,
        gameType,
        level ? parseInt(level) : null,
        limit ? parseInt(limit) : 10
      );

      res.json({
        success: true,
        data: { leaderboard }
      });

    } catch (error) {
      console.error('Error obteniendo tabla de líderes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar progreso (solo admin del grupo o del sistema)
  static async deleteProgress(req, res) {
    try {
      const { progressId } = req.params;

      // Obtener información del progreso
      const progress = await GameProgress.findById(progressId);
      
      if (!progress) {
        return res.status(404).json({
          success: false,
          message: 'Progreso no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.role !== 'admin' && req.user.id !== progress.user_id) {
        // Verificar si es admin del grupo
        const User = await import('../models/User.js').then(m => m.default);
        const targetUser = await User.findById(progress.user_id);
        
        if (!targetUser || targetUser.group_id !== req.user.group_id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para eliminar este progreso'
          });
        }

        const Group = await import('../models/Group.js').then(m => m.default);
        const isGroupAdmin = await Group.verifyAdminPermission(targetUser.group_id, req.user.id);
        
        if (!isGroupAdmin) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para eliminar este progreso'
          });
        }
      }

      const deleted = await GameProgress.deleteProgress(progressId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Progreso no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Progreso eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando progreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  static async deleteUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const { gameType } = req.query;

      // Verificar permisos
      if (req.user.role !== 'admin' && req.user.id != userId) {
        // Verificar si es admin del grupo
        const User = await import('../models/User.js').then(m => m.default);
        const targetUser = await User.findById(userId);
        
        if (!targetUser || targetUser.group_id !== req.user.group_id) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para eliminar este progreso'
          });
        }

        const Group = await import('../models/Group.js').then(m => m.default);
        const isGroupAdmin = await Group.verifyAdminPermission(targetUser.group_id, req.user.id);
        
        if (!isGroupAdmin) {
          return res.status(403).json({
            success: false,
            message: 'No tienes permisos para eliminar este progreso'
          });
        }
      }

      const deletedCount = await GameProgress.deleteUserProgress(userId, gameType);

      res.json({
        success: true,
        message: `${deletedCount} registros de progreso eliminados exitosamente`
      });

    } catch (error) {
      console.error('Error eliminando progreso del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas generales (solo para admins)
  static async getGeneralStats(req, res) {
    try {
      const { gameType } = req.query;

      // Esta función requeriría consultas más complejas para estadísticas globales
      // Por ahora, devolvemos un placeholder
      res.json({
        success: true,
        data: {
          message: 'Estadísticas generales - Por implementar',
          gameType
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default GameController;
