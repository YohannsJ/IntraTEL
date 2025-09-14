import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración de la base de datos SQLite
const dataDir = join(__dirname, '..', 'data');
const dbPath = join(dataDir, 'intratel.db');

// Asegurar que el directorio data existe
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('Directorio data creado:', dataDir);
}

class Database {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error al conectar con la base de datos:', err.message);
          reject(err);
        } else {
          console.log('Conectado a la base de datos SQLite.');
          this.initializeTables()
            .then(() => {
              this.initialized = true;
              resolve();
            })
            .catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    return new Promise((resolve, reject) => {
      // Primero crear todas las tablas
      const tableQueries = [
        // Tabla de grupos
        `CREATE TABLE IF NOT EXISTS groups (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          code TEXT UNIQUE NOT NULL,
          admin_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        // Tabla de usuarios
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          role TEXT DEFAULT 'student' CHECK(role IN ('admin', 'teacher', 'student')),
          group_id INTEGER,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE SET NULL
        )`,
        
        // Tabla de progreso de juegos
        `CREATE TABLE IF NOT EXISTS game_progress (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          game_type TEXT NOT NULL,
          level INTEGER NOT NULL,
          completed BOOLEAN DEFAULT 0,
          score INTEGER DEFAULT 0,
          time_spent INTEGER DEFAULT 0,
          attempts INTEGER DEFAULT 0,
          completed_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`,
        
        // Tabla de sesiones
        `CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT UNIQUE NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )`,

        // Tabla de flags disponibles
        `CREATE TABLE IF NOT EXISTS available_flags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          flag_name TEXT NOT NULL,
          flag_value TEXT UNIQUE NOT NULL,
          description TEXT,
          points INTEGER DEFAULT 10,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        // Tabla de flags de usuarios
        `CREATE TABLE IF NOT EXISTS user_flags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          flag_id INTEGER NOT NULL,
          flag_value TEXT NOT NULL,
          obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          FOREIGN KEY (flag_id) REFERENCES available_flags (id) ON DELETE CASCADE,
          UNIQUE(user_id, flag_id)
        )`
      ];

      // Luego crear los índices
      const indexQueries = [
        'CREATE INDEX IF NOT EXISTS idx_users_group_id ON users(group_id)',
        'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(code)',
        'CREATE INDEX IF NOT EXISTS idx_game_progress_user_id ON game_progress(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token)',
        'CREATE INDEX IF NOT EXISTS idx_available_flags_value ON available_flags(flag_value)',
        'CREATE INDEX IF NOT EXISTS idx_user_flags_user_id ON user_flags(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_user_flags_flag_id ON user_flags(flag_id)'
      ];

      // Función para ejecutar queries secuencialmente
      const executeQueries = async (queries, description) => {
        for (let i = 0; i < queries.length; i++) {
          await new Promise((resolveQuery, rejectQuery) => {
            this.db.run(queries[i], (err) => {
              if (err) {
                console.error(`Error ejecutando ${description} ${i + 1}:`, err.message);
                rejectQuery(err);
              } else {
                resolveQuery();
              }
            });
          });
        }
      };

      // Ejecutar primero las tablas, luego los índices
      executeQueries(tableQueries, 'tabla')
        .then(() => executeQueries(indexQueries, 'índice'))
        .then(() => {
          console.log('Tablas de base de datos inicializadas correctamente.');
          resolve();
        })
        .catch(reject);
    });
  }

  // Método para asegurar que la base de datos esté inicializada
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
    return this.db;
  }

  // Método para obtener la instancia de la base de datos
  getDB() {
    return this.db;
  }

  // Método para ejecutar consultas con promesas
  async run(sql, params = []) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  // Método para obtener un registro
  async get(sql, params = []) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Método para obtener múltiples registros
  async all(sql, params = []) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Cerrar conexión
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Conexión a la base de datos cerrada.');
          resolve();
        }
      });
    });
  }
}

// Crear y exportar instancia única de la base de datos
const database = new Database();
export default database;
