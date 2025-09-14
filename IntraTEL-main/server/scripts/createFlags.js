import database from '../config/database.js';

// Script para crear flags de ejemplo
const createExampleFlags = async () => {
  try {
    console.log('Creando flags de ejemplo...');

    const flags = [
      {
        flag_name: 'Primera Conexión',
        flag_value: 'INTRATEL{welcome_to_the_system}',
        description: 'Flag de bienvenida al sistema IntraTEL',
        points: 50
      },
      {
        flag_name: 'Primer Nivel',
        flag_value: 'INTRATEL{first_nand_gate}',
        description: 'Completaste tu primer nivel en el juego NAND',
        points: 100
      },
      {
        flag_name: 'Explorador',
        flag_value: 'INTRATEL{found_hidden_feature}',
        description: 'Encontraste una característica oculta del sistema',
        points: 75
      },
      {
        flag_name: 'Solucionador',
        flag_value: 'INTRATEL{logic_master}',
        description: 'Dominaste las compuertas lógicas',
        points: 150
      },
      {
        flag_name: 'Colaborador',
        flag_value: 'INTRATEL{team_player}',
        description: 'Te uniste a un grupo de trabajo',
        points: 30
      }
    ];

    for (const flag of flags) {
      await database.run(
        `INSERT INTO available_flags (flag_name, flag_value, description, points, is_active, created_at) 
         VALUES (?, ?, ?, ?, 1, ?)`,
        [flag.flag_name, flag.flag_value, flag.description, flag.points, new Date().toISOString()]
      );
      console.log(`✅ Flag creada: ${flag.flag_name}`);
    }

    console.log('🎉 Todas las flags de ejemplo han sido creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error creando flags:', error);
  }
};

createExampleFlags();
