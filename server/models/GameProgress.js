import database from '../config/database.js';

class GameProgress {
  // Método para obtener progreso del usuario (compatible con AuthController)
  static async getUserProgress(userId) {
    try {
      return await this.findByUserId(userId);
    } catch (error) {
      throw new Error(`Error al obtener progreso del usuario: ${error.message}`);
    }
  }

  static async createOrUpdate(progressData) {
    const { userId, gameType, level, completed = false, score = 0, timeSpent = 0 } = progressData;
    
    try {
      // Buscar progreso existente
      const existing = await database.get(
        'SELECT * FROM game_progress WHERE user_id = ? AND game_type = ? AND level = ?',
        [userId, gameType, level]
      );
      
      if (existing) {
        // Actualizar progreso existente
        const updates = {
          completed: completed || existing.completed,
          score: Math.max(score, existing.score),
          time_spent: existing.time_spent + timeSpent,
          attempts: existing.attempts + 1,
          updated_at: new Date().toISOString()
        };
        
        if (completed && !existing.completed) {
          updates.completed_at = new Date().toISOString();
        }
        
        await database.run(
          `UPDATE game_progress SET 
           completed = ?, score = ?, time_spent = ?, attempts = ?, 
           completed_at = ?, updated_at = ? 
           WHERE id = ?`,
          [
            updates.completed,
            updates.score,
            updates.time_spent,
            updates.attempts,
            updates.completed_at || existing.completed_at,
            updates.updated_at,
            existing.id
          ]
        );
        
        return await this.findById(existing.id);
      } else {
        // Crear nuevo progreso
        const result = await database.run(
          `INSERT INTO game_progress 
           (user_id, game_type, level, completed, score, time_spent, attempts, completed_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId, 
            gameType, 
            level, 
            completed, 
            score, 
            timeSpent, 
            1, 
            completed ? new Date().toISOString() : null
          ]
        );
        
        return await this.findById(result.id);
      }
    } catch (error) {
      throw new Error(`Error al crear/actualizar progreso: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      return await database.get(
        `SELECT gp.*, u.username, u.first_name, u.last_name 
         FROM game_progress gp 
         JOIN users u ON gp.user_id = u.id 
         WHERE gp.id = ?`,
        [id]
      );
    } catch (error) {
      throw new Error(`Error al buscar progreso: ${error.message}`);
    }
  }

  static async findByUserId(userId, gameType = null) {
    try {
      let query = `
        SELECT * FROM game_progress 
        WHERE user_id = ?
      `;
      let params = [userId];
      
      if (gameType) {
        query += ' AND game_type = ?';
        params.push(gameType);
      }
      
      query += ' ORDER BY game_type, level';
      
      return await database.all(query, params);
    } catch (error) {
      throw new Error(`Error al buscar progreso del usuario: ${error.message}`);
    }
  }

  static async findByGroupId(groupId, gameType = null) {
    try {
      let query = `
        SELECT gp.*, u.username, u.first_name, u.last_name 
        FROM game_progress gp 
        JOIN users u ON gp.user_id = u.id 
        WHERE u.group_id = ? AND u.is_active = 1
      `;
      let params = [groupId];
      
      if (gameType) {
        query += ' AND gp.game_type = ?';
        params.push(gameType);
      }
      
      query += ' ORDER BY gp.game_type, gp.level, u.last_name, u.first_name';
      
      return await database.all(query, params);
    } catch (error) {
      throw new Error(`Error al buscar progreso del grupo: ${error.message}`);
    }
  }

  static async getUserStats(userId) {
    try {
      const stats = {};
      
      // Progreso general
      const generalStats = await database.get(
        `SELECT 
           COUNT(*) as total_levels,
           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_levels,
           AVG(score) as average_score,
           SUM(time_spent) as total_time,
           SUM(attempts) as total_attempts
         FROM game_progress 
         WHERE user_id = ?`,
        [userId]
      );
      
      stats.general = {
        totalLevels: generalStats.total_levels || 0,
        completedLevels: generalStats.completed_levels || 0,
        completionRate: generalStats.total_levels > 0 
          ? Math.round((generalStats.completed_levels / generalStats.total_levels) * 100) 
          : 0,
        averageScore: Math.round(generalStats.average_score || 0),
        totalTime: generalStats.total_time || 0,
        totalAttempts: generalStats.total_attempts || 0
      };
      
      // Progreso por tipo de juego
      const gameStats = await database.all(
        `SELECT 
           game_type,
           COUNT(*) as total_levels,
           SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_levels,
           AVG(score) as average_score,
           MAX(level) as max_level
         FROM game_progress 
         WHERE user_id = ? 
         GROUP BY game_type`,
        [userId]
      );
      
      stats.byGame = gameStats.reduce((acc, game) => {
        acc[game.game_type] = {
          totalLevels: game.total_levels,
          completedLevels: game.completed_levels,
          completionRate: Math.round((game.completed_levels / game.total_levels) * 100),
          averageScore: Math.round(game.average_score),
          maxLevel: game.max_level
        };
        return acc;
      }, {});
      
      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas del usuario: ${error.message}`);
    }
  }

  static async getGroupStats(groupId, gameType = null) {
    try {
      let query = `
        SELECT 
          gp.game_type,
          gp.level,
          COUNT(*) as total_students,
          SUM(CASE WHEN gp.completed = 1 THEN 1 ELSE 0 END) as completed_students,
          AVG(gp.score) as average_score,
          AVG(gp.time_spent) as average_time,
          AVG(gp.attempts) as average_attempts
        FROM game_progress gp
        JOIN users u ON gp.user_id = u.id
        WHERE u.group_id = ? AND u.is_active = 1
      `;
      let params = [groupId];
      
      if (gameType) {
        query += ' AND gp.game_type = ?';
        params.push(gameType);
      }
      
      query += ' GROUP BY gp.game_type, gp.level ORDER BY gp.game_type, gp.level';
      
      const results = await database.all(query, params);
      
      return results.map(row => ({
        gameType: row.game_type,
        level: row.level,
        totalStudents: row.total_students,
        completedStudents: row.completed_students,
        completionRate: Math.round((row.completed_students / row.total_students) * 100),
        averageScore: Math.round(row.average_score || 0),
        averageTime: Math.round(row.average_time || 0),
        averageAttempts: Math.round(row.average_attempts || 0)
      }));
    } catch (error) {
      throw new Error(`Error al obtener estadísticas del grupo: ${error.message}`);
    }
  }

  static async getLeaderboard(groupId = null, gameType = null, level = null, limit = 10) {
    try {
      let query = `
        SELECT 
          gp.*,
          u.username,
          u.first_name,
          u.last_name,
          g.name as group_name
        FROM game_progress gp
        JOIN users u ON gp.user_id = u.id
        LEFT JOIN groups g ON u.group_id = g.id
        WHERE gp.completed = 1 AND u.is_active = 1
      `;
      let params = [];
      
      if (groupId) {
        query += ' AND u.group_id = ?';
        params.push(groupId);
      }
      
      if (gameType) {
        query += ' AND gp.game_type = ?';
        params.push(gameType);
      }
      
      if (level) {
        query += ' AND gp.level = ?';
        params.push(level);
      }
      
      query += ` 
        ORDER BY gp.score DESC, gp.time_spent ASC, gp.attempts ASC 
        LIMIT ?
      `;
      params.push(limit);
      
      return await database.all(query, params);
    } catch (error) {
      throw new Error(`Error al obtener tabla de líderes: ${error.message}`);
    }
  }

  static async deleteProgress(id) {
    try {
      const result = await database.run(
        'DELETE FROM game_progress WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error al eliminar progreso: ${error.message}`);
    }
  }

  static async deleteUserProgress(userId, gameType = null) {
    try {
      let query = 'DELETE FROM game_progress WHERE user_id = ?';
      let params = [userId];
      
      if (gameType) {
        query += ' AND game_type = ?';
        params.push(gameType);
      }
      
      const result = await database.run(query, params);
      return result.changes;
    } catch (error) {
      throw new Error(`Error al eliminar progreso del usuario: ${error.message}`);
    }
  }

  // ========================
  // MÉTODOS PARA ADMINISTRADOR
  // ========================

  static async getProgressByUserId(userId) {
    try {
      const progress = await database.all(`
        SELECT * FROM game_progress 
        WHERE user_id = ? 
        ORDER BY game_type, level
      `, [userId]);

      return progress;
    } catch (error) {
      throw new Error(`Error al obtener progreso del usuario: ${error.message}`);
    }
  }

  static async getGameStatistics() {
    try {
      const totalGames = await database.get(`
        SELECT COUNT(*) as count FROM game_progress
      `);

      const completedGames = await database.get(`
        SELECT COUNT(*) as count FROM game_progress WHERE completed = 1
      `);

      const averageScore = await database.get(`
        SELECT AVG(score) as avg_score FROM game_progress WHERE completed = 1
      `);

      const gamesByType = await database.all(`
        SELECT 
          game_type,
          COUNT(*) as total_attempts,
          COUNT(CASE WHEN completed = 1 THEN 1 END) as completed_attempts,
          AVG(score) as avg_score,
          AVG(time_spent) as avg_time
        FROM game_progress 
        GROUP BY game_type
      `);

      const recentActivity = await database.all(`
        SELECT 
          gp.*,
          u.username,
          u.first_name,
          u.last_name
        FROM game_progress gp
        JOIN users u ON gp.user_id = u.id
        ORDER BY gp.updated_at DESC
        LIMIT 20
      `);

      return {
        totalGames: totalGames.count,
        completedGames: completedGames.count,
        averageScore: Math.round(averageScore.avg_score || 0),
        completionRate: totalGames.count > 0 ? Math.round((completedGames.count / totalGames.count) * 100) : 0,
        gamesByType,
        recentActivity
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas de juegos: ${error.message}`);
    }
  }

  static async getAllProgressWithUsers(page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const progress = await database.all(`
        SELECT 
          gp.*,
          u.username,
          u.first_name,
          u.last_name,
          u.email,
          g.name as group_name
        FROM game_progress gp
        JOIN users u ON gp.user_id = u.id
        LEFT JOIN groups g ON u.group_id = g.id
        ORDER BY gp.updated_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const total = await database.get(`
        SELECT COUNT(*) as count FROM game_progress
      `);

      return {
        progress,
        pagination: {
          page,
          limit,
          total: total.count,
          totalPages: Math.ceil(total.count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener todo el progreso: ${error.message}`);
    }
  }
}

export default GameProgress;
