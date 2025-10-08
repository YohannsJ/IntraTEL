import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rutas
import authRoutes from './routes/auth.js';
// SISTEMA DE GRUPOS DESHABILITADO - Juegos individuales únicamente
// import groupRoutes from './routes/groups.js';
import gameRoutes from './routes/games.js';
import flagRoutes from './routes/flags.js';

// Importar base de datos
import database from './config/database.js';
import createDefaultAdmin from './scripts/createAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowlist = (process.env.CORS_ORIGINS || '').split(',').filter(Boolean);
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowlist.length === 0 || allowlist.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para logs
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
// SISTEMA DE GRUPOS DESHABILITADO - Juegos individuales únicamente
// app.use('/api/groups', groupRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/flags', flagRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor IntraTEL funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Ruta para información del servidor
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'IntraTEL Backend',
      version: '1.0.0',
      description: 'Sistema de gestión de progreso para IntraTEL',
      features: [
        'Autenticación JWT',
        'Gestión de usuarios',
        'Seguimiento de progreso en juegos',
        // 'Administración de grupos',
        'Estadísticas y tablas de líderes'
      ],
      endpoints: {
        auth: '/api/auth',
        // groups: '/api/groups',
        games: '/api/games',
        health: '/api/health'
      }
    }
  });
});

// Middleware para manejar errores 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    availableEndpoints: [
      '/api/auth',
      // '/api/groups', 
      '/api/games',
      '/api/health',
      '/api/info'
    ]
  });
});

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});

// Manejo graceful del cierre del servidor
process.on('SIGINT', async () => {
  console.log('\nCerrando servidor...');
  
  try {
    await database.close();
    console.log('Base de datos cerrada correctamente.');
  } catch (error) {
    console.error('Error cerrando base de datos:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Cerrando servidor (SIGTERM)...');
  
  try {
    await database.close();
    console.log('Base de datos cerrada correctamente.');
  } catch (error) {
    console.error('Error cerrando base de datos:', error);
  }
  
  process.exit(0);
});

// Función para inicializar el servidor
async function startServer() {
  try {
    // Esperar a que la base de datos se inicialice
    await database.ensureInitialized();
    
    // Crear administrador por defecto si no existe
    await createDefaultAdmin();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                      🚀 IntraTEL Backend                      ║
║                                                               ║
║  Servidor iniciado exitosamente                              ║
║  Puerto: ${PORT}                                               ║
║  Entorno: ${process.env.NODE_ENV || 'development'}                                        ║
║                                                               ║
║  Endpoints disponibles:                                       ║
║  • http://localhost:${PORT}/api/auth                            ║
║  • http://localhost:${PORT}/api/games                           ║
║  • http://localhost:${PORT}/api/health                          ║
║  • http://localhost:${PORT}/api/info                            ║
║                                                               ║
║  Base de datos: SQLite (./server/data/intratel.db)           ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
}

// Inicializar servidor
startServer();

export default app;
