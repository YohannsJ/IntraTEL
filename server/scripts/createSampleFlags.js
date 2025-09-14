import database from '../config/database.js';

const sampleFlags = [
  {
    flag_name: "Primer Paso",
    flag_value: "FLAG{bienvenido_a_intratel}",
    description: "Flag de bienvenida para nuevos estudiantes",
    points: 10
  },
  {
    flag_name: "NAND Básico",
    flag_value: "FLAG{nand_gate_master}",
    description: "Completar el primer nivel del juego NAND",
    points: 25
  },
  {
    flag_name: "Circuito Completo",
    flag_value: "FLAG{circuit_builder_pro}",
    description: "Crear un circuito completo funcional",
    points: 50
  },
  {
    flag_name: "Explorador",
    flag_value: "FLAG{hidden_treasure_found}",
    description: "Encontrar contenido oculto en la plataforma",
    points: 15
  },
  {
    flag_name: "Colaborador",
    flag_value: "FLAG{team_work_makes_dream_work}",
    description: "Trabajar efectivamente en equipo",
    points: 30
  },
  {
    flag_name: "Lógica Avanzada",
    flag_value: "FLAG{advanced_logic_circuits}",
    description: "Dominar circuitos lógicos complejos",
    points: 75
  },
  {
    flag_name: "Velocista",
    flag_value: "FLAG{speed_run_champion}",
    description: "Completar un desafío en tiempo récord",
    points: 40
  },
  {
    flag_name: "Telemático",
    flag_value: "FLAG{telecommunications_expert}",
    description: "Demostrar conocimiento en telecomunicaciones",
    points: 60
  },
  {
    flag_name: "Debugger",
    flag_value: "FLAG{bug_hunter_elite}",
    description: "Encontrar y reportar bugs en la plataforma",
    points: 35
  },
  {
    flag_name: "Innovador",
    flag_value: "FLAG{creative_solution_master}",
    description: "Proponer una solución creativa e innovadora",
    points: 80
  }
];

async function createSampleFlags() {
  try {
    console.log('🏁 Iniciando creación de flags de ejemplo...');
    
    for (const flag of sampleFlags) {
      // Verificar si la flag ya existe
      const existing = await database.get(
        'SELECT id FROM available_flags WHERE flag_value = ?',
        [flag.flag_value]
      );
      
      if (existing) {
        console.log(`⚠️  Flag ya existe: ${flag.flag_name}`);
        continue;
      }
      
      // Crear la flag
      await database.run(
        `INSERT INTO available_flags (flag_name, flag_value, description, points) 
         VALUES (?, ?, ?, ?)`,
        [flag.flag_name, flag.flag_value, flag.description, flag.points]
      );
      
      console.log(`✅ Flag creada: ${flag.flag_name} (+${flag.points} pts)`);
    }
    
    console.log('\n🎉 ¡Flags de ejemplo creadas exitosamente!');
    console.log('\nPuedes probar estas flags en la plataforma:');
    sampleFlags.forEach(flag => {
      console.log(`   ${flag.flag_value} - ${flag.flag_name} (+${flag.points} pts)`);
    });
    
  } catch (error) {
    console.error('❌ Error creando flags:', error);
  } finally {
    process.exit(0);
  }
}

createSampleFlags();
