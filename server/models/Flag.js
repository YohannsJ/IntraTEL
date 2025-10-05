import database from '../config/database.js';

class Flag {
  static async submitFlag(userId, flagValue) {
    try {
      // Buscar si la flag existe y es válida
      const validFlag = await database.get(
        'SELECT * FROM available_flags WHERE flag_value = ? AND is_active = 1',
        [flagValue]
      );

      if (!validFlag) {
        throw new Error('Flag inválida');
      }

      // Obtener información del usuario y su grupo
      const user = await database.get(
        'SELECT id, group_id FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Si el usuario pertenece a un grupo, verificar si alguien del grupo ya subió esta flag
      if (user.group_id) {
        const groupFlagSubmission = await database.get(
          `SELECT uf.*, u.username, u.first_name, u.last_name 
           FROM user_flags uf 
           JOIN users u ON uf.user_id = u.id 
           WHERE u.group_id = ? AND uf.flag_id = ?`,
          [user.group_id, validFlag.id]
        );

        if (groupFlagSubmission) {
          // La flag ya fue subida por alguien del grupo
          return {
            alreadySubmittedByGroup: true,
            submittedBy: {
              username: groupFlagSubmission.username,
              firstName: groupFlagSubmission.first_name,
              lastName: groupFlagSubmission.last_name,
              submittedAt: groupFlagSubmission.obtained_at
            },
            flagName: validFlag.flag_name,
            description: validFlag.description,
            points: validFlag.points
          };
        }
      } else {
        // Si no pertenece a un grupo, verificar si el usuario ya ha enviado esta flag
        const existingSubmission = await database.get(
          'SELECT * FROM user_flags WHERE user_id = ? AND flag_id = ?',
          [userId, validFlag.id]
        );

        if (existingSubmission) {
          throw new Error('Ya has enviado esta flag anteriormente');
        }
      }

      // Registrar la flag para el usuario
      const result = await database.run(
        `INSERT INTO user_flags (user_id, flag_id, flag_value, obtained_at) 
         VALUES (?, ?, ?, ?)`,
        [userId, validFlag.id, flagValue, new Date().toISOString()]
      );

      return {
        id: result.id,
        flagName: validFlag.flag_name,
        description: validFlag.description,
        points: validFlag.points,
        alreadySubmittedByGroup: false
      };
    } catch (error) {
      throw new Error(`Error enviando flag: ${error.message}`);
    }
  }

  static async getUserFlags(userId) {
    try {
      const flags = await database.all(
        `SELECT 
           uf.id,
           uf.flag_value,
           uf.obtained_at,
           af.flag_name,
           af.description,
           af.points
         FROM user_flags uf
         JOIN available_flags af ON uf.flag_id = af.id
         WHERE uf.user_id = ?
         ORDER BY uf.obtained_at DESC`,
        [userId]
      );

      return flags;
    } catch (error) {
      throw new Error(`Error obteniendo flags del usuario: ${error.message}`);
    }
  }

  static async getAllUserFlags() {
    try {
      const flags = await database.all(
        `SELECT 
           uf.id,
           uf.flag_value,
           uf.obtained_at,
           af.flag_name,
           af.description,
           af.points,
           u.username,
           u.first_name,
           u.last_name,
           u.email,
           g.name as group_name
         FROM user_flags uf
         JOIN available_flags af ON uf.flag_id = af.id
         JOIN users u ON uf.user_id = u.id
         LEFT JOIN groups g ON u.group_id = g.id
         ORDER BY uf.obtained_at DESC`
      );

      return flags;
    } catch (error) {
      throw new Error(`Error obteniendo todas las flags: ${error.message}`);
    }
  }

  static async createFlag(flagData) {
    try {
      const { flagName, flagValue, description, points } = flagData;
      
      const result = await database.run(
        `INSERT INTO available_flags (flag_name, flag_value, description, points, is_active) 
         VALUES (?, ?, ?, ?, 1)`,
        [flagName, flagValue, description, points || 10]
      );
      
      return await this.getFlagById(result.id);
    } catch (error) {
      throw new Error(`Error creando flag: ${error.message}`);
    }
  }

  static async getFlagById(id) {
    try {
      return await database.get(
        'SELECT * FROM available_flags WHERE id = ?',
        [id]
      );
    } catch (error) {
      throw new Error(`Error obteniendo flag: ${error.message}`);
    }
  }

  static async getAllAvailableFlags() {
    try {
      return await database.all(
        'SELECT * FROM available_flags WHERE is_active = 1 ORDER BY created_at DESC'
      );
    } catch (error) {
      throw new Error(`Error obteniendo flags disponibles: ${error.message}`);
    }
  }

  static async getUserFlagStats(userId) {
    try {
      const stats = await database.get(
        `SELECT 
           COUNT(uf.id) as total_flags,
           SUM(af.points) as total_points,
           COUNT(DISTINCT DATE(uf.obtained_at)) as days_active
         FROM user_flags uf
         JOIN available_flags af ON uf.flag_id = af.id
         WHERE uf.user_id = ?`,
        [userId]
      );

      return {
        totalFlags: stats.total_flags || 0,
        totalPoints: stats.total_points || 0,
        daysActive: stats.days_active || 0
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas de flags: ${error.message}`);
    }
  }

  static async getLeaderboard(limit = 10) {
    try {
      const leaderboard = await database.all(
        `SELECT 
           u.id,
           u.username,
           u.first_name,
           u.last_name,
           g.name as group_name,
           COUNT(uf.id) as total_flags,
           SUM(af.points) as total_points
         FROM users u
         LEFT JOIN user_flags uf ON u.id = uf.user_id
         LEFT JOIN available_flags af ON uf.flag_id = af.id
         LEFT JOIN groups g ON u.group_id = g.id
         WHERE u.is_active = 1
         GROUP BY u.id
         ORDER BY total_points DESC, total_flags DESC
         LIMIT ?`,
        [limit]
      );

      return leaderboard.map(entry => ({
        ...entry,
        total_flags: entry.total_flags || 0,
        total_points: entry.total_points || 0
      }));
    } catch (error) {
      throw new Error(`Error obteniendo tabla de líderes: ${error.message}`);
    }
  }

  static async getTotalFlags() {
    try {
      const result = await database.get(
        'SELECT COUNT(*) as count FROM available_flags WHERE is_active = 1'
      );
      return result.count || 0;
    } catch (error) {
      throw new Error(`Error al obtener total de flags: ${error.message}`);
    }
  }

  static async updateFlag(flagId, flagData) {
    try {
      const { flagName, flagValue, description, points } = flagData;
      
      // Obtener la flag actual para comparar
      const currentFlag = await this.getFlagById(flagId);
      if (!currentFlag) {
        throw new Error('Flag no encontrada');
      }
      console.log(flagData)
      // Actualizar la flag disponible
      await database.run(
        `UPDATE available_flags 
         SET flag_name = ?, flag_value = ?, description = ?, points = ?
         WHERE id = ?`,
        [flagName, flagValue, description, points || 10, flagId]
      );

      // Si el valor de la flag cambió, crear nuevas entradas en user_flags
      // para preservar los valores antiguos de los usuarios que ya la tenían
      if (currentFlag.flag_value !== flagValue) {
        // Obtener todos los usuarios que ya tienen esta flag
        const usersWithFlag = await database.all(
          'SELECT user_id, flag_value, obtained_at FROM user_flags WHERE flag_id = ?',
          [flagId]
        );

        if (usersWithFlag.length > 0) {
          // Para cada usuario, actualizar solo el flag_id referenciado,
          // pero mantener su flag_value original
          // Esto significa que seguirán viendo el valor que originalmente enviaron
          console.log(`Flag ${flagId} valor cambiado de "${currentFlag.flag_value}" a "${flagValue}"`);
          console.log(`${usersWithFlag.length} usuarios mantienen su valor original`);
        }
      }

      return await this.getFlagById(flagId);
    } catch (error) {
      throw new Error(`Error actualizando flag: ${error.message}`);
    }
  }

  static async deleteFlag(flagId) {
    try {
      // Verificar si existen usuarios con esta flag
      const usersWithFlag = await database.get(
        'SELECT COUNT(*) as count FROM user_flags WHERE flag_id = ?',
        [flagId]
      );

      if (usersWithFlag.count > 0) {
        // Si hay usuarios con esta flag, solo marcarla como inactiva
        await database.run(
          'UPDATE available_flags SET is_active = 0 WHERE id = ?',
          [flagId]
        );
        return { deleted: false, deactivated: true, affectedUsers: usersWithFlag.count };
      } else {
        // Si no hay usuarios con esta flag, eliminarla completamente
        await database.run(
          'DELETE FROM available_flags WHERE id = ?',
          [flagId]
        );
        return { deleted: true, deactivated: false, affectedUsers: 0 };
      }
    } catch (error) {
      throw new Error(`Error eliminando flag: ${error.message}`);
    }
  }

  static async getGroupLeaderboard(limit = 10) {
    try {
      const groupLeaderboard = await database.all(
        `SELECT 
           g.id,
           g.name as group_name,
           g.code as group_code,
           COUNT(DISTINCT uf.flag_id) as total_flags,
           SUM(af.points) as total_points,
           COUNT(DISTINCT uf.user_id) as active_members,
           (SELECT COUNT(*) FROM users WHERE group_id = g.id AND is_active = 1) as total_members,
           MAX(uf.obtained_at) as last_flag_obtained
         FROM groups g
         LEFT JOIN users u ON g.id = u.group_id AND u.is_active = 1
         LEFT JOIN user_flags uf ON u.id = uf.user_id
         LEFT JOIN available_flags af ON uf.flag_id = af.id
         GROUP BY g.id
         ORDER BY total_points DESC, total_flags DESC, last_flag_obtained DESC
         LIMIT ?`,
        [limit]
      );

      return groupLeaderboard.map(entry => ({
        ...entry,
        total_flags: entry.total_flags || 0,
        total_points: entry.total_points || 0,
        active_members: entry.active_members || 0,
        participation_rate: entry.total_members > 0 ? 
          Math.round((entry.active_members / entry.total_members) * 100) : 0
      }));
    } catch (error) {
      throw new Error(`Error obteniendo ranking de grupos: ${error.message}`);
    }
  }

  static async getGroupFlags(groupId) {
    try {
      const flags = await database.all(
        `SELECT DISTINCT
           uf.flag_id,
           uf.obtained_at,
           af.flag_name,
           af.description,
           af.points,
           u.username,
           u.first_name,
           u.last_name
         FROM user_flags uf
         JOIN available_flags af ON uf.flag_id = af.id
         JOIN users u ON uf.user_id = u.id
         WHERE u.group_id = ?
         ORDER BY uf.obtained_at DESC`,
        [groupId]
      );

      return flags;
    } catch (error) {
      throw new Error(`Error obteniendo flags del grupo: ${error.message}`);
    }
  }

  static async getRecentFlags(limit = 50) {
    try {
      const flags = await database.all(
        `SELECT 
           uf.id,
           uf.flag_value,
           uf.obtained_at,
           af.flag_name,
           af.description,
           af.points,
           u.username,
           u.first_name,
           u.last_name,
           u.email,
           g.name as group_name,
           g.code as group_code
         FROM user_flags uf
         JOIN available_flags af ON uf.flag_id = af.id
         JOIN users u ON uf.user_id = u.id
         LEFT JOIN groups g ON u.group_id = g.id
         ORDER BY uf.obtained_at DESC
         LIMIT ?`,
        [limit]
      );

      return flags;
    } catch (error) {
      throw new Error(`Error obteniendo flags recientes: ${error.message}`);
    }
  }
}

export default Flag;
