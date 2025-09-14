import database from '../config/database.js';
import bcrypt from 'bcryptjs';
import readline from 'readline';

// Crear un nuevo admin:
//cd "ruta\Diftel\IntraTEL\server" && node scripts/createNewAdmin.js

// Configurar readline para entrada de usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    
    let password = '';
    
    stdin.on('data', function(ch) {
      ch = ch + '';
      
      switch (ch) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;
        default:
          password += ch;
          stdout.write('*');
          break;
      }
    });
  });
}

async function createNewAdmin() {
  try {
    console.log('🔧 Creador de Nuevos Administradores - IntraTEL\n');
    
    // Esperar a que la base de datos se inicialice
    await database.ensureInitialized();

    // Solicitar información del nuevo administrador
    const username = await askQuestion('👤 Username del nuevo admin: ');
    const email = await askQuestion('📧 Email del nuevo admin: ');
    const firstName = await askQuestion('👤 Nombre: ');
    const lastName = await askQuestion('👤 Apellido: ');
    const password = await askPassword('🔐 Contraseña: ');
    
    console.log('\n');

    // Validaciones básicas
    if (!username || !email || !firstName || !lastName || !password) {
      console.log('❌ Todos los campos son requeridos');
      rl.close();
      return;
    }

    if (password.length < 6) {
      console.log('❌ La contraseña debe tener al menos 6 caracteres');
      rl.close();
      return;
    }

    // Verificar si el username o email ya existen
    const existingUser = await database.get(
      "SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );

    if (existingUser) {
      console.log('⚠️  Ya existe un usuario con ese username o email');
      console.log(`   Usuario existente: ${existingUser.email} (${existingUser.first_name} ${existingUser.last_name})`);
      
      const convert = await askQuestion('¿Convertir este usuario a administrador? (s/n): ');
      
      if (convert.toLowerCase() === 's' || convert.toLowerCase() === 'si') {
        await database.run(
          "UPDATE users SET role = 'admin', is_active = 1 WHERE id = ?",
          [existingUser.id]
        );
        
        console.log('✅ Usuario convertido a administrador exitosamente');
        console.log(`   Email: ${existingUser.email}`);
      } else {
        console.log('❌ Operación cancelada');
      }
      
      rl.close();
      return;
    }

    // Crear el hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insertar el nuevo administrador
    const result = await database.run(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [username, email, passwordHash, firstName, lastName, 'admin', 1]
    );

    console.log('✅ Nuevo administrador creado exitosamente:');
    console.log(`   ID: ${result.lastID}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${firstName} ${lastName}`);
    console.log(`   Rol: Administrador`);
    console.log('\n🔐 Asegúrate de que el administrador cambie su contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error creando administrador:', error);
  } finally {
    rl.close();
  }
}

// Listar administradores existentes
async function listAdmins() {
  try {
    await database.ensureInitialized();
    
    const admins = await database.all(
      "SELECT id, username, email, first_name, last_name, created_at, is_active FROM users WHERE role = 'admin' ORDER BY created_at ASC"
    );

    console.log('\n👑 Administradores actuales:');
    console.log('─'.repeat(80));
    
    if (admins.length === 0) {
      console.log('   No hay administradores en el sistema');
    } else {
      admins.forEach((admin, index) => {
        const status = admin.is_active ? '🟢 Activo' : '🔴 Inactivo';
        const date = new Date(admin.created_at).toLocaleDateString('es-ES');
        
        console.log(`${index + 1}. ${admin.first_name} ${admin.last_name}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Estado: ${status}`);
        console.log(`   Creado: ${date}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error listando administradores:', error);
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--list') || args.includes('-l')) {
    await listAdmins();
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log('🔧 Creador de Administradores - IntraTEL');
    console.log('\nUso:');
    console.log('  node createNewAdmin.js          # Crear nuevo administrador');
    console.log('  node createNewAdmin.js --list   # Listar administradores existentes');
    console.log('  node createNewAdmin.js --help   # Mostrar esta ayuda');
  } else {
    await createNewAdmin();
  }
  
  process.exit(0);
}

// Ejecutar si este archivo es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createNewAdmin, listAdmins };
