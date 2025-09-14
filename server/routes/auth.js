import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas
router.use(authenticateToken);

router.get('/profile', AuthController.getProfile);
router.put('/profile', AuthController.updateProfile);
router.put('/change-password', AuthController.changePassword);
router.post('/join-group', AuthController.joinGroup);
router.post('/leave-group', AuthController.leaveGroup);
router.get('/verify', AuthController.verifyToken);
router.get('/statistics', AuthController.getUserStatistics);

// Rutas de administrador
router.get('/admin/users', AuthController.getAllUsers);
router.get('/admin/users/:id', AuthController.getUserById);
router.put('/admin/users/:id', AuthController.updateUserAsAdmin);
router.delete('/admin/users/:id', AuthController.deleteUser);
router.get('/admin/dashboard', AuthController.getAdminDashboard);

export default router;
