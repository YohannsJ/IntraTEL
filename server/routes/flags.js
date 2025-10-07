import express from 'express';
import FlagController from '../controllers/FlagController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas (sin autenticación)
router.get('/stats', FlagController.getSystemStats);

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas para usuarios
router.post('/submit', FlagController.submitFlag);
router.get('/user', FlagController.getUserFlags);
router.get('/user/stats', FlagController.getUserFlagStats);
router.get('/leaderboard', FlagController.getLeaderboard);
router.get('/groups/leaderboard', FlagController.getGroupLeaderboard);
router.get('/recent', FlagController.getRecentFlags);
router.get('/groups/:groupId', FlagController.getGroupFlags);

// Rutas de administrador
router.get('/admin/all', FlagController.getAllUserFlags);
router.get('/admin/progress', FlagController.getUserProgressOverTime);
router.post('/admin/create', FlagController.createFlag);
router.get('/admin/available', FlagController.getAllAvailableFlags);
router.put('/admin/:flagId', FlagController.updateFlag);
router.delete('/admin/:flagId', FlagController.deleteFlag);

export default router;
