import express from 'express';
import GroupController from '../controllers/GroupController.js';
import { 
  authenticateToken, 
  requireRole, 
  requireGroupAdmin,
  requireGroupMembership 
} from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas públicas para usuarios autenticados
router.get('/code/:code', GroupController.findByCode);
router.post('/join', GroupController.joinGroup);
router.post('/leave', GroupController.leaveGroup);

// Rutas para crear grupos (admin/teacher)
router.post('/', requireRole(['admin', 'teacher']), GroupController.createGroup);

// Rutas para admin del sistema
router.get('/all', requireRole(['admin']), GroupController.getAllGroups);

// Rutas para administradores de grupos
router.get('/my-groups', GroupController.getMyGroups);

// Rutas específicas de grupo
router.get('/:groupId', requireGroupMembership, GroupController.getGroup);
router.put('/:groupId', requireGroupAdmin, GroupController.updateGroup);
router.delete('/:groupId', requireGroupAdmin, GroupController.deleteGroup);
router.get('/:groupId/stats', requireGroupMembership, GroupController.getGroupStats);

// Rutas de miembros
router.get('/:groupId/members', requireGroupMembership, GroupController.getGroupMembers);
router.delete('/:groupId/members/:userId', requireGroupAdmin, GroupController.removeMember);
router.put('/:groupId/members/:userId', requireGroupAdmin, GroupController.updateMember);

// Transferir administración
router.post('/:groupId/transfer-admin', requireGroupAdmin, GroupController.transferAdmin);

export default router;
