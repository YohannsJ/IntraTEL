import { NODE_TYPES, uid } from '../utils/gameUtils.js';

/**
 * Configuración del puzzle NOT
 * @returns {Object} Configuración del puzzle NOT
 */
export function buildPuzzleNOT() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      x: 0, 
      y: 110, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 180, 
      y: 95 
    },
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 520, 
      y: 100,
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
    flag: "FLAG{N0T_G4T3_M4ST3R}",
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
      x: 0, 
      y: 80, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      x: 0, 
      y: 140, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 180, 
      y: 110 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N2", 
      x: 320, 
      y: 110 
    },
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 540, 
      y: 110,
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
    flag: "FLAG{4ND_L0G1C_W1Z4RD}",
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
      x: 0, 
      y: 70, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      x: 0, 
      y: 150, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 160, 
      y: 70 
    }, // NOT A
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N2", 
      x: 160, 
      y: 150 
    }, // NOT B
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N3", 
      x: 320, 
      y: 110 
    }, // NAND(NOT A, NOT B)
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 540, 
      y: 110,
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
    flag: "FLAG{0R_G4T3_CH4MP10N}",
  };
}


export function buildPuzzleXOR() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      x: 0, 
      y: 70, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      x: 0, 
      y: 210, 
      manual: false,
      fixed: true 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 180, 
      y: 60 
    }, // D = NAND(A,B)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N2", 
      x: 180, 
      y: 140 
    }, // E = NAND(A,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N3", 
      x: 180, 
      y: 220 
    }, // F = NAND(B,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N4", 
      x: 360, 
      y: 140 
    }, // Y = NAND(E,F)
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 520, 
      y: 140,
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
    flag: "FLAG{X0R_M4ST3R_H4CK3R}",
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
