import database from '../config/database.js';
import bcrypt from 'bcryptjs';

async function createYohannsAdmin() {
  try {
    console.log('🔧 Creando administrador Yohanns...\n');
    
    // Esperar a que la base de datos se inicialice
    await database.ensureInitialized();

    const email = 'yohanns.jara@usm.cl';
    const username = 'yohanns';
    const firstName = 'Yohanns';
    const lastName = 'Jara';
    const password = 'Admin2025!'; // Contraseña temporal - CAMBIAR después del primer login

    // Verificar si ya existe
    const existingUser = await database.get(
      "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );

    if (existingUser) {
      console.log('⚠️  Usuario ya existe:');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   Username: ${existingUser.username}`);
      console.log(`   Rol actual: ${existingUser.role}`);
      
      // Convertir a admin si no lo es
      if (existingUser.role !== 'admin') {
        await database.run(
          "UPDATE users SET role = 'admin', is_active = 1 WHERE id = ?",
          [existingUser.id]
        );
        console.log('✅ Usuario convertido a administrador exitosamente');
      } else {
        console.log('✅ El usuario ya es administrador');
      }
      
      return;
    }

    // Crear hash de contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar nuevo admin
    const result = await database.run(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, created_at, last_login) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [username, email, passwordHash, firstName, lastName, 'admin', 1]
    );

    console.log('✅ Administrador creado exitosamente:');
    console.log(`   ID: ${result.lastID}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${firstName} ${lastName}`);
    console.log(`   Contraseña temporal: Admin2025!`);
    console.log('\n⚠️  IMPORTANTE: Cambia esta contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    process.exit(0);
  }
}

createYohannsAdmin();
