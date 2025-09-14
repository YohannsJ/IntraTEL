import database from '../config/database.js';
import bcrypt from 'bcryptjs';

async function createDefaultAdmin() {
  try {
    // Esperar a que la base de datos se inicialice
    await database.ensureInitialized();

    // Verificar si ya existe un administrador
    const existingAdmin = await database.get(
      "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin) {
      console.log('✅ Ya existe un administrador en el sistema.');
      console.log(`   Admin actual: ${existingAdmin.email} (${existingAdmin.first_name} ${existingAdmin.last_name})`);
      return;
    }

    // Verificar si ya existe el username o email
    const existingUser = await database.get(
      "SELECT * FROM users WHERE username = 'admin' OR email = 'admin@intratel.com' LIMIT 1"
    );

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con username "admin" o email "admin@intratel.com"');
      console.log('   Convirtiendo usuario existente a administrador...');
      
      // Actualizar el usuario existente para que sea admin
      await database.run(
        "UPDATE users SET role = 'admin', is_active = 1 WHERE id = ?",
        [existingUser.id]
      );
      
      console.log('✅ Usuario convertido a administrador exitosamente:');
      console.log(`   Email: ${existingUser.email}`);
      console.log('   ⚠️  Asegúrate de conocer la contraseña de este usuario');
      return;
    }

    // Crear administrador por defecto
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('admin123', saltRounds);

    await database.run(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@intratel.com', passwordHash, 'Administrador', 'IntraTEL', 'admin', 1]
    );

    console.log('✅ Administrador por defecto creado:');
    console.log('   Email: admin@intratel.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  Cambia esta contraseña después del primer inicio de sesión');

  } catch (error) {
    console.error('Error creando administrador por defecto:', error);
  }
}

// Ejecutar si este archivo es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createDefaultAdmin().then(() => {
    process.exit(0);
  });
}

export default createDefaultAdmin;
