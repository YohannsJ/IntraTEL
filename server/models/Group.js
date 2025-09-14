import database from '../config/database.js';

class Group {
  static async create(groupData) {
    const { name, description, adminId, createdBy } = groupData;
    
    try {
      // Generar código único para el grupo
      const code = this.generateGroupCode();
      
      const result = await database.run(
        `INSERT INTO groups (name, description, code, admin_id) 
         VALUES (?, ?, ?, ?)`,
        [name, description, code, adminId || createdBy]
      );
      
      return await this.findById(result.id);
    } catch (error) {
      throw new Error(`Error al crear grupo: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const group = await database.get(
        `SELECT g.*, u.username as admin_username, u.first_name as admin_first_name, u.last_name as admin_last_name
         FROM groups g 
         LEFT JOIN users u ON g.admin_id = u.id 
         WHERE g.id = ?`,
        [id]
      );
      
      if (group) {
        // Obtener miembros del grupo
        group.members = await database.all(
          `SELECT id, username, first_name, last_name, email, role, is_active, created_at 
           FROM users 
           WHERE group_id = ? AND is_active = 1 
           ORDER BY role, last_name, first_name`,
          [id]
        );
        
        // Obtener estadísticas del grupo
        group.stats = await this.getGroupStats(id);
      }
      
      return group;
    } catch (error) {
      throw new Error(`Error al buscar grupo: ${error.message}`);
    }
  }

  static async findByCode(code) {
    try {
      return await database.get(
        'SELECT * FROM groups WHERE code = ?',
        [code]
      );
    } catch (error) {
      throw new Error(`Error al buscar grupo por código: ${error.message}`);
    }
  }

  static async findByAdminId(adminId) {
    try {
      return await database.all(
        `SELECT g.*, 
         (SELECT COUNT(*) FROM users WHERE group_id = g.id AND is_active = 1) as member_count
         FROM groups g 
         WHERE g.admin_id = ? 
         ORDER BY g.created_at DESC`,
        [adminId]
      );
    } catch (error) {
      throw new Error(`Error al buscar grupos del admin: ${error.message}`);
    }
  }

  static async updateGroup(id, updates) {
    try {
      const allowedFields = ['name', 'description'];
      const updateFields = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
          updateFields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      values.push(new Date().toISOString());
      updateFields.push('updated_at = ?');
      values.push(id);

      await database.run(
        `UPDATE groups SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar grupo: ${error.message}`);
    }
  }

  static async deleteGroup(id) {
    try {
      // Primero, remover a todos los usuarios del grupo
      await database.run(
        'UPDATE users SET group_id = NULL WHERE group_id = ?',
        [id]
      );
      
      // Luego eliminar el grupo
      const result = await database.run(
        'DELETE FROM groups WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error al eliminar grupo: ${error.message}`);
    }
  }

  static async removeMember(groupId, userId) {
    try {
      await database.run(
        'UPDATE users SET group_id = NULL, updated_at = ? WHERE id = ? AND group_id = ?',
        [new Date().toISOString(), userId, groupId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Error al remover miembro del grupo: ${error.message}`);
    }
  }

  static async getGroupStats(groupId) {
    try {
      const stats = {};
      
      // Total de miembros activos
      const memberCount = await database.get(
        'SELECT COUNT(*) as count FROM users WHERE group_id = ? AND is_active = 1',
        [groupId]
      );
      stats.totalMembers = memberCount.count;
      
      // Progreso promedio en juegos
      const gameProgress = await database.get(
        `SELECT 
           AVG(CASE WHEN completed = 1 THEN 100.0 ELSE (score * 100.0 / NULLIF(level * 100, 0)) END) as avg_progress,
           COUNT(DISTINCT user_id) as active_players
         FROM game_progress gp
         JOIN users u ON gp.user_id = u.id
         WHERE u.group_id = ?`,
        [groupId]
      );
      
      stats.averageProgress = Math.round(gameProgress.avg_progress || 0);
      stats.activePlayers = gameProgress.active_players || 0;
      
      // Distribución por roles
      const roleDistribution = await database.all(
        `SELECT role, COUNT(*) as count 
         FROM users 
         WHERE group_id = ? AND is_active = 1 
         GROUP BY role`,
        [groupId]
      );
      
      stats.roleDistribution = roleDistribution.reduce((acc, row) => {
        acc[row.role] = row.count;
        return acc;
      }, {});
      
      return stats;
    } catch (error) {
      throw new Error(`Error al obtener estadísticas del grupo: ${error.message}`);
    }
  }

  static generateGroupCode() {
    // Generar código de 6 caracteres alfanuméricos
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  static async verifyAdminPermission(groupId, userId) {
    try {
      const group = await database.get(
        'SELECT admin_id FROM groups WHERE id = ?',
        [groupId]
      );
      
      return group && group.admin_id === userId;
    } catch (error) {
      throw new Error(`Error al verificar permisos de admin: ${error.message}`);
    }
  }

  static async transferAdminRole(groupId, currentAdminId, newAdminId) {
    try {
      // Verificar que el usuario actual es admin
      const isAdmin = await this.verifyAdminPermission(groupId, currentAdminId);
      if (!isAdmin) {
        throw new Error('No tienes permisos para transferir la administración');
      }
      
      // Verificar que el nuevo admin es miembro del grupo
      const newAdmin = await database.get(
        'SELECT id FROM users WHERE id = ? AND group_id = ? AND is_active = 1',
        [newAdminId, groupId]
      );
      
      if (!newAdmin) {
        throw new Error('El nuevo administrador debe ser miembro activo del grupo');
      }
      
      // Transferir administración
      await database.run(
        'UPDATE groups SET admin_id = ?, updated_at = ? WHERE id = ?',
        [newAdminId, new Date().toISOString(), groupId]
      );
      
      return await this.findById(groupId);
    } catch (error) {
      throw new Error(`Error al transferir administración: ${error.message}`);
    }
  }

  static async getAllGroups(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const groups = await database.all(
        `SELECT g.*, u.username as admin_username,
         (SELECT COUNT(*) FROM users WHERE group_id = g.id AND is_active = 1) as member_count
         FROM groups g
         LEFT JOIN users u ON g.admin_id = u.id
         ORDER BY g.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      const totalCount = await database.get(
        'SELECT COUNT(*) as count FROM groups'
      );
      
      return {
        groups,
        totalCount: totalCount.count,
        page,
        limit,
        totalPages: Math.ceil(totalCount.count / limit)
      };
    } catch (error) {
      throw new Error(`Error al obtener grupos: ${error.message}`);
    }
  }

  static async updateCreatedBy(groupId, userId) {
    try {
      await database.run(
        'UPDATE groups SET admin_id = ?, updated_at = ? WHERE id = ?',
        [userId, new Date().toISOString(), groupId]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Error al actualizar creador del grupo: ${error.message}`);
    }
  }
}

export default Group;
