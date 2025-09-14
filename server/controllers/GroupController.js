import Group from '../models/Group.js';
import User from '../models/User.js';

class GroupController {
  // Crear un nuevo grupo
  static async createGroup(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Nombre del grupo es requerido'
        });
      }

      // Solo admins y teachers pueden crear grupos
      if (!['admin', 'teacher'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores y profesores pueden crear grupos'
        });
      }

      const group = await Group.create({
        name,
        description,
        adminId: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Grupo creado exitosamente',
        data: { group }
      });

    } catch (error) {
      console.error('Error creando grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener información de un grupo
  static async getGroup(req, res) {
    try {
      const { groupId } = req.params;

      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo no encontrado'
        });
      }

      res.json({
        success: true,
        data: { group }
      });

    } catch (error) {
      console.error('Error obteniendo grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener grupos donde el usuario es admin
  static async getMyGroups(req, res) {
    try {
      const groups = await Group.findByAdminId(req.user.id);

      res.json({
        success: true,
        data: { groups }
      });

    } catch (error) {
      console.error('Error obteniendo mis grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener todos los grupos (solo para admins)
  static async getAllGroups(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Group.getAllGroups(page, limit);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error obteniendo todos los grupos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar información de un grupo
  static async updateGroup(req, res) {
    try {
      const { groupId } = req.params;
      const { name, description } = req.body;

      const updates = {};
      if (name) updates.name = name;
      if (description !== undefined) updates.description = description;

      const group = await Group.updateGroup(groupId, updates);

      res.json({
        success: true,
        message: 'Grupo actualizado exitosamente',
        data: { group }
      });

    } catch (error) {
      console.error('Error actualizando grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Eliminar un grupo
  static async deleteGroup(req, res) {
    try {
      const { groupId } = req.params;

      const deleted = await Group.deleteGroup(groupId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Grupo no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Grupo eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error eliminando grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener miembros de un grupo
  static async getGroupMembers(req, res) {
    try {
      const { groupId } = req.params;

      const members = await User.findByGroupId(groupId);

      res.json({
        success: true,
        data: { members }
      });

    } catch (error) {
      console.error('Error obteniendo miembros del grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Remover un miembro del grupo
  static async removeMember(req, res) {
    try {
      const { groupId, userId } = req.params;

      // Verificar que no se está intentando remover al admin
      const group = await Group.findById(groupId);
      if (group.admin_id == userId) {
        return res.status(400).json({
          success: false,
          message: 'No se puede remover al administrador del grupo'
        });
      }

      await Group.removeMember(groupId, userId);

      res.json({
        success: true,
        message: 'Miembro removido del grupo exitosamente'
      });

    } catch (error) {
      console.error('Error removiendo miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Actualizar información de un miembro (solo admin del grupo)
  static async updateMember(req, res) {
    try {
      const { groupId, userId } = req.params;
      const { role, isActive } = req.body;

      const updates = {};
      if (role && ['student', 'teacher'].includes(role)) {
        updates.role = role;
      }
      if (typeof isActive === 'boolean') {
        updates.is_active = isActive;
      }

      // Verificar que no se está intentando cambiar al admin
      const group = await Group.findById(groupId);
      if (group.admin_id == userId && role) {
        return res.status(400).json({
          success: false,
          message: 'No se puede cambiar el rol del administrador del grupo'
        });
      }

      const user = await User.updateUser(userId, updates);

      res.json({
        success: true,
        message: 'Miembro actualizado exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error actualizando miembro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Transferir administración del grupo
  static async transferAdmin(req, res) {
    try {
      const { groupId } = req.params;
      const { newAdminId } = req.body;

      if (!newAdminId) {
        return res.status(400).json({
          success: false,
          message: 'ID del nuevo administrador es requerido'
        });
      }

      const group = await Group.transferAdminRole(groupId, req.user.id, newAdminId);

      res.json({
        success: true,
        message: 'Administración transferida exitosamente',
        data: { group }
      });

    } catch (error) {
      console.error('Error transfiriendo administración:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // Buscar grupo por código (para unirse)
  static async findByCode(req, res) {
    try {
      const { code } = req.params;

      const group = await Group.findByCode(code);

      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo no encontrado'
        });
      }

      // Solo devolver información básica del grupo
      res.json({
        success: true,
        data: {
          group: {
            id: group.id,
            name: group.name,
            description: group.description,
            code: group.code
          }
        }
      });

    } catch (error) {
      console.error('Error buscando grupo por código:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Obtener estadísticas del grupo
  static async getGroupStats(req, res) {
    try {
      const { groupId } = req.params;

      const group = await Group.findById(groupId);
      
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Grupo no encontrado'
        });
      }

      res.json({
        success: true,
        data: { 
          stats: group.stats,
          groupInfo: {
            id: group.id,
            name: group.name,
            description: group.description,
            memberCount: group.members.length
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas del grupo:', error);
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
      const userId = req.user.id;

      if (!groupCode) {
        return res.status(400).json({
          success: false,
          message: 'Código de grupo es requerido'
        });
      }

      // Verificar si el usuario ya pertenece a un grupo
      const currentUser = await User.findById(userId);
      if (currentUser.group_id) {
        return res.status(400).json({
          success: false,
          message: 'Ya perteneces a un grupo. Debes salir del grupo actual primero.'
        });
      }

      // Buscar el grupo por código
      const group = await Group.findByCode(groupCode.toUpperCase());
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Código de grupo inválido'
        });
      }

      // Unir al usuario al grupo
      await User.updateUser(userId, { group_id: group.id });

      res.json({
        success: true,
        message: `Te has unido exitosamente al grupo "${group.name}"`,
        data: {
          group: {
            id: group.id,
            name: group.name,
            code: group.code
          }
        }
      });

    } catch (error) {
      console.error('Error uniéndose al grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // Salir de un grupo
  static async leaveGroup(req, res) {
    try {
      const userId = req.user.id;

      // Verificar si el usuario pertenece a un grupo
      const currentUser = await User.findById(userId);
      if (!currentUser.group_id) {
        return res.status(400).json({
          success: false,
          message: 'No perteneces a ningún grupo'
        });
      }

      // Verificar si el usuario es el admin del grupo
      const group = await Group.findById(currentUser.group_id);
      if (group && group.admin_id === userId) {
        return res.status(400).json({
          success: false,
          message: 'No puedes salir del grupo porque eres el administrador. Transfiere la administración primero o elimina el grupo.'
        });
      }

      // Remover al usuario del grupo
      await User.updateUser(userId, { group_id: null });

      res.json({
        success: true,
        message: 'Has salido del grupo exitosamente'
      });

    } catch (error) {
      console.error('Error saliendo del grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default GroupController;
