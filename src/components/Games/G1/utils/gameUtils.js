// ======== Tipos de nodos ========
export const NODE_TYPES = {
  INPUT: "INPUT",
  NAND: "NAND",
  NOT: "NOT",
  AND: "AND",
  OR: "OR",
  OUTPUT: "OUTPUT",
  CONST: "CONST",
};

// ======== Utilidades generales ========
let _id = 0;
export const uid = (prefix = "n") => `${prefix}_${_id++}`;

export const boolToBit = (value) => (value ? 1 : 0);
export const bitToBool = (value) => (value ? true : false);

/**
 * Genera todas las combinaciones binarias de n bits
 * @param {number} n - Número de bits
 * @returns {boolean[][]} Array de combinaciones
 */
export function combinations(n) {
  const total = 1 << n;
  const result = [];
  for (let k = 0; k < total; k++) {
    const row = [];
    for (let i = 0; i < n; i++) {
      row.push(((k >> (n - 1 - i)) & 1) === 1);
    }
    result.push(row);
  }
  return result;
}

/**
 * Obtiene la posición de un puerto específico de un nodo
 * @param {Object} node - El nodo
 * @param {string} port - El puerto ('out', 'in', 'in0', 'in1')
 * @returns {Object} Posición {x, y}
 */
export function getPortPos(node, port) {
  switch (node.type) {
    case NODE_TYPES.INPUT: {
      const x = node.x + 70; // derecha
      const y = node.y + 18;
      return { x, y };
    }
    case NODE_TYPES.OUTPUT: {
      const x = node.x; // izquierda
      const y = node.y + 23;
      return { x, y };
    }
    case NODE_TYPES.CONST: {
      const x = node.x + 60; // derecha
      const y = node.y + 18;
      return { x, y };
    }
    case NODE_TYPES.NOT: {
      const w = 80, h = 50;
      if (port === "out") return { x: node.x + w + 8, y: node.y + h / 2 };
      if (port === "in") return { x: node.x, y: node.y + h / 2 };
      break;
    }
    case NODE_TYPES.NAND:
    case NODE_TYPES.AND:
    case NODE_TYPES.OR: {
      const w = 90, h = 60;
      if (port === "out") return { x: node.x + w + 8, y: node.y + h / 2 };
      if (port === "in0") return { x: node.x, y: node.y + h * 0.33 };
      if (port === "in1") return { x: node.x, y: node.y + h * 0.67 };
      break;
    }
  }
  return { x: node.x, y: node.y };
}

/**
 * Obtiene los puertos de entrada para un nodo
 * @param {Object} node - El nodo
 * @returns {string[]} Array de nombres de puertos de entrada
 */
export function inputPortsFor(node) {
  if (node.type === NODE_TYPES.NAND || node.type === NODE_TYPES.AND || node.type === NODE_TYPES.OR) {
    return ["in0", "in1"];
  }
  if (node.type === NODE_TYPES.NOT || node.type === NODE_TYPES.OUTPUT) {
    return ["in"];
  }
  return [];
}

/**
 * Verifica si un nodo tiene salida
 * @param {Object} node - El nodo
 * @returns {boolean} True si el nodo tiene salida
 */
export function hasOutput(node) {
  return node.type === NODE_TYPES.INPUT || 
         node.type === NODE_TYPES.NAND || 
         node.type === NODE_TYPES.NOT ||
         node.type === NODE_TYPES.AND ||
         node.type === NODE_TYPES.OR ||
         node.type === NODE_TYPES.CONST;
}

/**
 * Obtiene las dimensiones de un nodo
 * @param {Object} node - El nodo
 * @returns {Object} Dimensiones {width, height}
 */
export function getNodeDimensions(node) {
  switch (node.type) {
    case NODE_TYPES.INPUT:
      return { width: 70, height: 36 };
    case NODE_TYPES.OUTPUT:
      return { width: 80, height: 46 };
    case NODE_TYPES.CONST:
      return { width: 60, height: 36 };
    case NODE_TYPES.NOT:
      return { width: 80, height: 50 };
    case NODE_TYPES.NAND:
    case NODE_TYPES.AND:
    case NODE_TYPES.OR:
      return { width: 90, height: 60 };
    default:
      return { width: 60, height: 40 };
  }
}

/**
 * Verifica si un punto está dentro de los límites de un nodo
 * @param {Object} node - El nodo
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @returns {boolean} True si el punto está dentro del nodo
 */
export function isPointInNode(node, x, y) {
  const { width, height } = getNodeDimensions(node);
  return x >= node.x && x <= node.x + width && 
         y >= node.y && y <= node.y + height;
}
