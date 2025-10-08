/**
 * Script para subir múltiples banderas desde un archivo JSON
 * Uso: node server/scripts/uploadFlags.js [archivo.json]
 */

import { readFileSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Definir __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar sqlite3 (módulo CommonJS) usando require
const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

// Ruta a la base de datos
const DB_PATH = join(__dirname, '..', 'data', 'intratel.db');

// Función para cargar banderas desde JSON
function loadFlagsFromJSON(filePath) {
  try {
    const jsonData = readFileSync(filePath, 'utf-8');
    const flags = JSON.parse(jsonData);
    
    if (!Array.isArray(flags)) {
      throw new Error('El archivo JSON debe contener un array de banderas');
    }
    
    return flags;
  } catch (error) {
    console.error('❌ Error al leer el archivo JSON:', error.message);
    process.exit(1);
  }
}

// Función para validar una bandera
function validateFlag(flag, index) {
  const required = ['titulo', 'descripcion', 'valor', 'puntos'];
  const missing = required.filter(field => !flag[field]);
  
  if (missing.length > 0) {
    console.error(`❌ Bandera #${index + 1} inválida. Campos faltantes: ${missing.join(', ')}`);
    return false;
  }
  
  if (typeof flag.puntos !== 'number' || flag.puntos <= 0) {
    console.error(`❌ Bandera #${index + 1}: puntos debe ser un número positivo`);
    return false;
  }
  
  return true;
}

// Función para insertar banderas en la base de datos
function uploadFlags(flags) {
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Error al conectar con la base de datos:', err.message);
      process.exit(1);
    }
    console.log('✅ Conectado a la base de datos');
  });

  // Verificar si existe la tabla available_flags
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='available_flags'", (err, row) => {
    if (err || !row) {
      console.error('❌ La tabla "available_flags" no existe en la base de datos');
      db.close();
      process.exit(1);
    }
  });

  let successCount = 0;
  let errorCount = 0;
  let skippedCount = 0;

  // Preparar la consulta de inserción
  const insertStmt = db.prepare(`
    INSERT INTO available_flags (flag_name, flag_value, description, points, is_active, created_at)
    VALUES (?, ?, ?, ?, 1, datetime('now'))
  `);

  // Verificar duplicados
  const checkStmt = db.prepare('SELECT id FROM available_flags WHERE flag_value = ?');

  console.log(`\n📦 Procesando ${flags.length} bandera(s)...\n`);

  // Procesar cada bandera
  let processed = 0;
  flags.forEach((flag, index) => {
    checkStmt.get(flag.valor, (err, row) => {
      if (err) {
        console.error(`❌ Error al verificar bandera "${flag.titulo}":`, err.message);
        errorCount++;
      } else if (row) {
        console.log(`⏭️  Omitida (ya existe): ${flag.titulo} [${flag.valor}]`);
        skippedCount++;
      } else {
        insertStmt.run(
          flag.titulo,
          flag.valor,
          flag.descripcion,
          flag.puntos,
          (err) => {
            if (err) {
              console.error(`❌ Error al insertar "${flag.titulo}":`, err.message);
              errorCount++;
            } else {
              console.log(`✅ Insertada: ${flag.titulo} (${flag.puntos} pts)`);
              successCount++;
            }
          }
        );
      }

      processed++;
      if (processed === flags.length) {
        // Finalizar cuando todas las banderas estén procesadas
        setTimeout(() => {
          insertStmt.finalize();
          checkStmt.finalize();
          
          console.log('\n' + '='.repeat(50));
          console.log('📊 RESUMEN:');
          console.log(`   ✅ Insertadas: ${successCount}`);
          console.log(`   ⏭️  Omitidas (duplicadas): ${skippedCount}`);
          console.log(`   ❌ Errores: ${errorCount}`);
          console.log('='.repeat(50) + '\n');

          db.close((err) => {
            if (err) {
              console.error('❌ Error al cerrar la base de datos:', err.message);
            } else {
              console.log('✅ Conexión cerrada');
            }
            process.exit(errorCount > 0 ? 1 : 0);
          });
        }, 500);
      }
    });
  });
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📋 Uso: node server/scripts/uploadFlags.js <archivo.json>');
    console.log('\nEjemplo:');
    console.log('  node server/scripts/uploadFlags.js server/scripts/banderas.json');
    console.log('\nFormato del JSON:');
    console.log(`  [
    {
      "titulo": "ALQUIMISTA DE COMPUERTAS",
      "descripcion": "Completó el 3 nivel de NandGame",
      "valor": "D1FT3L{0R_G4T3_CH4MP10N}",
      "puntos": 100
    },
    {
      "titulo": "OTRA BANDERA",
      "descripcion": "Descripción de otra bandera",
      "valor": "D1FT3L{0TR0_FL4G}",
      "puntos": 50
    }
  ]`);
    process.exit(1);
  }

  const filePath = resolve(args[0]);
  
  if (!existsSync(filePath)) {
    console.error(`❌ El archivo no existe: ${filePath}`);
    process.exit(1);
  }

  console.log(`📂 Cargando banderas desde: ${filePath}\n`);
  
  const flags = loadFlagsFromJSON(filePath);
  
  // Validar todas las banderas
  const validFlags = flags.filter((flag, index) => validateFlag(flag, index));
  
  if (validFlags.length === 0) {
    console.error('\n❌ No hay banderas válidas para insertar');
    process.exit(1);
  }

  if (validFlags.length < flags.length) {
    console.warn(`\n⚠️  ${flags.length - validFlags.length} bandera(s) inválida(s) serán omitidas\n`);
  }

  // Subir banderas válidas
  uploadFlags(validFlags);
}

// Ejecutar
main();
