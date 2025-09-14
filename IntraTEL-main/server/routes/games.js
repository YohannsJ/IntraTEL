import express from 'express';
import GameController from '../controllers/GameController.js';
import { 
  authenticateToken, 
  requireRole,
  requireGroupMembership 
} from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de progreso personal
router.post('/progress', GameController.saveProgress);
router.get('/progress', GameController.getMyProgress);

// Tabla de líderes
router.get('/leaderboard', GameController.getLeaderboard);

// Rutas de progreso de otros usuarios
router.get('/progress/user/:userId', GameController.getUserProgress);

// Rutas de progreso de grupo
router.get('/progress/group/:groupId', requireGroupMembership, GameController.getGroupProgress);

// Rutas de administración (eliminar progreso)
router.delete('/progress/:progressId', GameController.deleteProgress);
router.delete('/progress/user/:userId', GameController.deleteUserProgress);

// Estadísticas generales (solo admins)
router.get('/stats/general', requireRole(['admin']), GameController.getGeneralStats);

export default router;
