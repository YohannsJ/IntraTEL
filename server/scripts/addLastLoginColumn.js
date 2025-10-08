import database from '../config/database.js';

async function addLastLoginColumn() {
  try {
    console.log('Iniciando migración: Agregando columna last_login...');
    
    // Verificar si la columna ya existe
    const tableInfo = await database.all("PRAGMA table_info(users)");
    const hasLastLogin = tableInfo.some(col => col.name === 'last_login');
    
    if (hasLastLogin) {
      console.log('La columna last_login ya existe. No es necesario hacer cambios.');
      process.exit(0);
    }
    
    // Agregar la columna last_login
    await database.run(`
      ALTER TABLE users 
      ADD COLUMN last_login DATETIME
    `);
    
    console.log('✓ Columna last_login agregada exitosamente');
    
    // Actualizar last_login para todos los usuarios existentes con la fecha actual
    await database.run(`
      UPDATE users 
      SET last_login = CURRENT_TIMESTAMP 
      WHERE last_login IS NULL
    `);
    
    console.log('✓ Valores iniciales de last_login establecidos');
    console.log('Migración completada exitosamente');
    
    process.exit(0);
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  }
}

addLastLoginColumn();
