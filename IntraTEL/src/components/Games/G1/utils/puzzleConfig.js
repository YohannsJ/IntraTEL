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
      x: 60, 
      y: 110, 
      manual: false 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 220, 
      y: 95 
    },
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 380, 
      y: 100 
    },
  ];

  return {
    key: "NOT",
    title: "Ejercicio 1: Construye NOT usando sólo una NAND",
    description: "Conecta la entrada A a las dos entradas de la NAND y su salida al indicador Y. (Pista: NAND(a,a) = NOT(a))",
    nodes,
    expected: (inputs) => !inputs[0],
    inputLabels: ["A"],
    outputLabel: "Y",
  };
}

/**
 * Configuración del puzzle XOR
 * @returns {Object} Configuración del puzzle XOR
 */
export function buildPuzzleXOR() {
  const nodes = [
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "A", 
      x: 60, 
      y: 70, 
      manual: false 
    },
    { 
      id: uid("IN"), 
      type: NODE_TYPES.INPUT, 
      label: "B", 
      x: 60, 
      y: 210, 
      manual: false 
    },
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N1", 
      x: 220, 
      y: 60 
    }, // D = NAND(A,B)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N2", 
      x: 220, 
      y: 140 
    }, // E = NAND(A,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N3", 
      x: 220, 
      y: 220 
    }, // F = NAND(B,D)
    { 
      id: uid("N"), 
      type: NODE_TYPES.NAND, 
      label: "N4", 
      x: 420, 
      y: 140 
    }, // Y = NAND(E,F)
    { 
      id: uid("OUT"), 
      type: NODE_TYPES.OUTPUT, 
      label: "Y", 
      x: 580, 
      y: 130 
    },
  ];

  return {
    key: "XOR",
    title: "Ejercicio 2: Construye XOR usando NAND",
    description: "Usa 4 NAND. Estructura clásica: D=NAND(A,B); E=NAND(A,D); F=NAND(B,D); Y=NAND(E,F). Conecta sin cruzar salidas en entradas equivocadas.",
    nodes,
    expected: (inputs) => Boolean(inputs[0] ^ inputs[1]),
    inputLabels: ["A", "B"],
    outputLabel: "Y",
  };
}

/**
 * Obtiene todos los puzzles disponibles
 * @returns {Array} Array de puzzles
 */
export function getAllPuzzles() {
  return [
    buildPuzzleNOT(),
    buildPuzzleXOR()
  ];
}
