import database from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async create(userData) {
    const { username, email, password, firstName, lastName, role = 'student', groupId = null } = userData;
    
    try {
      // Hash de la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      const result = await database.run(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, role, group_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [username, email, passwordHash, firstName, lastName, role, groupId]
      );
      
      return await this.findById(result.id);
    } catch (error) {
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const user = await database.get(
        `SELECT u.*, g.name as group_name, g.code as group_code 
         FROM users u 
         LEFT JOIN groups g ON u.group_id = g.id 
         WHERE u.id = ?`,
        [id]
      );
      
      if (user) {
        delete user.password_hash;
      }
      
      return user;
    } catch (error) {
      throw new Error(`Error al buscar usuario: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      return await database.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
    } catch (error) {
      throw new Error(`Error al buscar usuario por email: ${error.message}`);
    }
  }

  static async findByUsername(username) {
    try {
      return await database.get(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
    } catch (error) {
      throw new Error(`Error al buscar usuario por username: ${error.message}`);
    }
  }

  static async validatePassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error al validar contraseña: ${error.message}`);
    }
  }

  static async updateUser(id, updates) {
    try {
      const allowedFields = ['username', 'email', 'first_name', 'last_name', 'role', 'group_id', 'is_active'];
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
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error al actualizar usuario: ${error.message}`);
    }
  }

  static async deleteUser(id) {
    try {
      const result = await database.run(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      
      return result.changes > 0;
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error.message}`);
    }
  }

  static async findByGroupId(groupId) {
    try {
      const users = await database.all(
        `SELECT u.*, g.name as group_name 
         FROM users u 
         LEFT JOIN groups g ON u.group_id = g.id 
         WHERE u.group_id = ? AND u.is_active = 1`,
        [groupId]
      );
      
      return users.map(user => {
        delete user.password_hash;
        return user;
      });
    } catch (error) {
      throw new Error(`Error al buscar usuarios del grupo: ${error.message}`);
    }
  }

  static async changePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
      
      await database.run(
        'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
        [passwordHash, new Date().toISOString(), id]
      );
      
      return true;
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error.message}`);
    }
  }

  static async joinGroup(userId, groupCode) {
    try {
      // Buscar el grupo por código
      const group = await database.get(
        'SELECT id FROM groups WHERE code = ?',
        [groupCode]
      );
      
      if (!group) {
        throw new Error('Código de grupo inválido');
      }
      
      // Actualizar el usuario con el grupo
      await database.run(
        'UPDATE users SET group_id = ?, updated_at = ? WHERE id = ?',
        [group.id, new Date().toISOString(), userId]
      );
      
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error al unirse al grupo: ${error.message}`);
    }
  }

  static async leaveGroup(userId) {
    try {
      await database.run(
        'UPDATE users SET group_id = NULL, updated_at = ? WHERE id = ?',
        [new Date().toISOString(), userId]
      );
      
      return await this.findById(userId);
    } catch (error) {
      throw new Error(`Error al salir del grupo: ${error.message}`);
    }
  }

  // ========================
  // MÉTODOS DE ADMINISTRADOR
  // ========================

  static async getAllUsersWithPagination(whereClause, params, limit, offset) {
    try {
      const sql = `
        SELECT u.*, g.name as group_name, g.code as group_code 
        FROM users u 
        LEFT JOIN groups g ON u.group_id = g.id 
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const users = await database.all(sql, [...params, limit, offset]);
      
      return users.map(user => {
        delete user.password_hash;
        return user;
      });
    } catch (error) {
      throw new Error(`Error al obtener usuarios con paginación: ${error.message}`);
    }
  }

  static async countUsers(whereClause, params) {
    try {
      const sql = `
        SELECT COUNT(*) as count 
        FROM users u 
        LEFT JOIN groups g ON u.group_id = g.id 
        ${whereClause}
      `;
      
      const result = await database.get(sql, params);
      return result.count;
    } catch (error) {
      throw new Error(`Error al contar usuarios: ${error.message}`);
    }
  }

  static async countGroups() {
    try {
      const result = await database.get('SELECT COUNT(*) as count FROM groups');
      return result.count;
    } catch (error) {
      throw new Error(`Error al contar grupos: ${error.message}`);
    }
  }

  static async getUsersByRole() {
    try {
      const users = await database.all(`
        SELECT role, COUNT(*) as count 
        FROM users 
        WHERE is_active = 1 
        GROUP BY role
      `);
      
      return users;
    } catch (error) {
      throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
    }
  }

  static async getRecentUsers(limit = 10) {
    try {
      const users = await database.all(`
        SELECT u.*, g.name as group_name 
        FROM users u 
        LEFT JOIN groups g ON u.group_id = g.id 
        ORDER BY u.created_at DESC 
        LIMIT ?
      `, [limit]);
      
      return users.map(user => {
        delete user.password_hash;
        return user;
      });
    } catch (error) {
      throw new Error(`Error al obtener usuarios recientes: ${error.message}`);
    }
  }

  static async createAdmin(userData) {
    try {
      const adminData = {
        ...userData,
        role: 'admin'
      };
      
      return await this.create(adminData);
    } catch (error) {
      throw new Error(`Error al crear administrador: ${error.message}`);
    }
  }
}

export default User;
