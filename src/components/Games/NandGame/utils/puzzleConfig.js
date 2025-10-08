import { NODE_TYPES, uid } from '../utils/gameUtils.js';

/**
 * Configuración del puzzle NOT con coordenadas relativas (0-100)
 * @returns {Object} Configuración del puzzle NOT
 */
export function buildPuzzleNOT() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 43, // 42% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand", 
      relativeX: 45, // 50% desde la izquierda (centro)
      relativeY: 42 // 40% desde arriba
    },
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      relativeX: 95, // 95% desde la izquierda
      relativeY: 42, // 42% desde arriba
      fixed: true 
    },
  ];

  return {
    key: "NOT",
    title: "Ejercicio 1: Construye una compuerta 'NOT' usando sólo una 'NAND'",
    description: "Conecta la entrada A a las dos entradas de la NAND y su salida al indicador Y. (Pista: NAND(a,a) = NOT(a))",
    nodes,
    expected: (inputs) => !inputs[0],
    inputLabels: ["A"],
    outputLabel: "Y",
    flag: "D1FT3L{N0T_G4T3_4M4T3UR}",
  };
}

/**
 * Configuración del puzzle AND
 * @returns {Object} Configuración del puzzle AND
 */
export function buildPuzzleAND() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 33, // 30% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 66, // 60% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_1", 
      relativeX: 50, // 35% desde la izquierda
      relativeY: 20 // 40% desde arriba (centrado entre A y B)
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_2", 
      relativeX: 50, // 65% desde la izquierda
      relativeY: 40 // 40% desde arriba
    },
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      relativeX: 95, // 95% desde la izquierda
      relativeY: 45, // 45% desde arriba
      fixed: true 
    },
  ];

  return {
    key: "AND",
    title: "Ejercicio 2: Construye una compuerta 'AND' usando NANDs",
    description: "Conecta A y B a la primera NAND, luego la salida de N1 a ambas entradas de N2. Recuerda: AND(A,B) = NOT(NAND(A,B))",
    nodes,
    expected: (inputs) => Boolean(inputs[0] && inputs[1]),
    inputLabels: ["A", "B"],
    outputLabel: "Y",
    flag: "D1FT3L{4ND_L0G1C_W1Z4RD}",
  };
}

/**
 * Configuración del puzzle OR
 * @returns {Object} Configuración del puzzle OR
 */
export function buildPuzzleOR() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 25, // 25% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 65, // 65% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_1", 
      relativeX: 20, // 30% desde la izquierda
      relativeY: 10 // 25% desde arriba (nivel de A)
    }, // NOT A
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_2", 
      relativeX: 40, // 30% desde la izquierda
      relativeY: 10 // 65% desde arriba (nivel de B)
    }, // NOT B
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_3", 
      relativeX: 60, // 65% desde la izquierda
      relativeY: 10 // 45% desde arriba (centrado)
    }, // NAND(NOT A, NOT B)
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      relativeX: 95, // 95% desde la izquierda
      relativeY: 47, // 47% desde arriba
      fixed: true 
    },
  ];

  return {
    key: "OR",
    title: "Ejercicio 3: Construye una compuerta 'OR' usando NANDs",
    description: "Usa la Ley de De Morgan: OR(A,B) = NOT(AND(NOT(A),NOT(B))). Necesitas 3 NANDs: dos para hacer NOT(A) y NOT(B), y una para el NAND final.",
    nodes,
    expected: (inputs) => Boolean(inputs[0] || inputs[1]),
    inputLabels: ["A", "B"],
    outputLabel: "Y",
    flag: "D1FT3L{0R_G4T3_CH4MP10N}",
  };
}


export function buildPuzzleXOR() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 20, // 20% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      relativeX: -2, // 5% desde la izquierda
      relativeY: 70, // 70% desde arriba
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_1", 
      relativeX: 40, // 50% desde la izquierda (centro superior en diamante)
      relativeY: 15 // 15% desde arriba
    }, // D = NAND(A,B)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_2", 
      relativeX: 25, // 30% desde la izquierda (izquierda en diamante)
      relativeY: 45 // 45% desde arriba
    }, // E = NAND(A,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_3", 
      relativeX: 40, // 30% desde la izquierda (abajo izquierda en diamante)
      relativeY: 75 // 75% desde arriba
    }, // F = NAND(B,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "Nand_4", 
      relativeX: 65, // 70% desde la izquierda (derecha en diamante)
      relativeY: 45 // 45% desde arriba
    }, // Y = NAND(E,F)
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      relativeX: 95, // 95% desde la izquierda
      relativeY: 45, // 47% desde arriba
      fixed: true 
    },
  ];

  return {
    key: "XOR",
    title: "Ejercicio 4: Construye una compuerta 'XOR' usando NANDs",
    description: "Usa 4 NANDs. Estructura clásica: D=NAND(A,B); E=NAND(A,D); F=NAND(B,D); Y=NAND(E,F). Conecta sin cruzar salidas en entradas equivocadas.",
    nodes,
    expected: (inputs) => Boolean(inputs[0] ^ inputs[1]),
    inputLabels: ["A", "B"],
    outputLabel: "Y",
    flag: "D1FT3L{X0R_M4ST3R_H4CK3R}",
  };
}

/**
 * Obtiene todos los puzzles disponibles
 * @returns {Array} Array de puzzles
 */
export function getAllPuzzles() {
  return [
    buildPuzzleNOT(),
    buildPuzzleAND(),
    buildPuzzleOR(),
    buildPuzzleXOR()
  ];
}
