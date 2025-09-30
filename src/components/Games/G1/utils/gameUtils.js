// ======== Tipos de nodos ========
// Función para convertir coordenadas relativas (0-100) a píxeles
export function relativeToPixels(relativeX, relativeY, viewBoxLimits, scaleFactor) {
  // Área de trabajo con márgenes (similar a CircuitCanvas)
  const workAreaLeft = 10;
  const workAreaTop = 12;
  const workAreaRight = 10;
  const workAreaBottom = 10;
  
  // Dimensiones del área de trabajo disponible
  const workAreaWidth = viewBoxLimits.width - workAreaLeft - workAreaRight;
  const workAreaHeight = viewBoxLimits.height - workAreaTop - workAreaBottom;
  
  // Convertir porcentajes a píxeles
  const pixelX = workAreaLeft + (relativeX / 100) * workAreaWidth;
  const pixelY = workAreaTop + (relativeY / 100) * workAreaHeight;
  
  return { x: pixelX, y: pixelY };
}

// Función para convertir píxeles a coordenadas relativas (0-100)
export function pixelsToRelative(pixelX, pixelY, viewBoxLimits) {
  const workAreaLeft = 10;
  const workAreaTop = 12;
  const workAreaRight = 10;
  const workAreaBottom = 10;
  
  const workAreaWidth = viewBoxLimits.width - workAreaLeft - workAreaRight;
  const workAreaHeight = viewBoxLimits.height - workAreaTop - workAreaBottom;
  
  const relativeX = Math.max(0, Math.min(100, ((pixelX - workAreaLeft) / workAreaWidth) * 100));
  const relativeY = Math.max(0, Math.min(100, ((pixelY - workAreaTop) / workAreaHeight) * 100));
  
  return { x: relativeX, y: relativeY };
}

export const NODE_TYPES = {
  INPUT: "INPUT",
  NAND: "NAND",
  NOT: "NOT",
  AND: "AND",
  OR: "OR",
  NOR: "NOR",
  XOR: "XOR",
  XNOR: "XNOR",
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
 * @param {number} scaleFactor - Factor de escala opcional (por defecto 1)
 * @returns {Object} Posición {x, y}
 */
export function getPortPos(node, port, scaleFactor = 1) {
  switch (node.type) {
    case NODE_TYPES.INPUT: {
      const x = node.x + (65 * scaleFactor); // derecha
      const y = node.y + (17.5 * scaleFactor);
      return { x, y };
    }
    case NODE_TYPES.OUTPUT: {
      const x = node.x; // izquierda
      const y = node.y + (22.5 * scaleFactor);
      return { x, y };
    }
    case NODE_TYPES.CONST: {
      const x = node.x + (55 * scaleFactor); // derecha
      const y = node.y + (17.5 * scaleFactor);
      return { x, y };
    }
    case NODE_TYPES.NOT: {
      const w = 75 * scaleFactor, h = 48 * scaleFactor;
      if (port === "out") return { x: node.x + w + 8, y: node.y + h / 2 };
      if (port === "in") return { x: node.x, y: node.y + h / 2 };
      break;
    }
    case NODE_TYPES.NAND:
    case NODE_TYPES.AND:
    case NODE_TYPES.OR:
    case NODE_TYPES.NOR:
    case NODE_TYPES.XOR:
    case NODE_TYPES.XNOR: {
      const w = 85 * scaleFactor, h = 55 * scaleFactor;
      if (port === "out") return { x: node.x + w + 8, y: node.y + h / 2 };
      if (port === "in0") return { x: node.x, y: node.y + h * 0.25 };
      if (port === "in1") return { x: node.x, y: node.y + h * 0.75 };
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
  if (node.type === NODE_TYPES.NAND || node.type === NODE_TYPES.AND || node.type === NODE_TYPES.OR ||
      node.type === NODE_TYPES.NOR || node.type === NODE_TYPES.XOR || node.type === NODE_TYPES.XNOR) {
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
         node.type === NODE_TYPES.NOR ||
         node.type === NODE_TYPES.XOR ||
         node.type === NODE_TYPES.XNOR ||
         node.type === NODE_TYPES.CONST;
}

/**
 * Obtiene las dimensiones de un nodo
 * @param {Object} node - El nodo
 * @param {number} scaleFactor - Factor de escala opcional (por defecto 1)
 * @returns {Object} Dimensiones {width, height}
 */
export function getNodeDimensions(node, scaleFactor = 1) {
  let baseWidth, baseHeight;
  
  switch (node.type) {
    case NODE_TYPES.INPUT:
      baseWidth = 65; baseHeight = 35;
      break;
    case NODE_TYPES.OUTPUT:
      baseWidth = 75; baseHeight = 45;
      break;
    case NODE_TYPES.CONST:
      baseWidth = 55; baseHeight = 35;
      break;
    case NODE_TYPES.NOT:
      baseWidth = 75; baseHeight = 48;
      break;
    case NODE_TYPES.NAND:
    case NODE_TYPES.AND:
    case NODE_TYPES.OR:
      baseWidth = 85; baseHeight = 55;
      break;
    default:
      baseWidth = 60; baseHeight = 40;
  }
  
  return { 
    width: baseWidth * scaleFactor, 
    height: baseHeight * scaleFactor 
  };
}

/**
 * Verifica si un punto está dentro de los límites de un nodo
 * @param {Object} node - El nodo
 * @param {number} x - Coordenada X
 * @param {number} y - Coordenada Y
 * @param {number} scaleFactor - Factor de escala opcional (por defecto 1)
 * @returns {boolean} True si el punto está dentro del nodo
 */
export function isPointInNode(node, x, y, scaleFactor = 1) {
  const { width, height } = getNodeDimensions(node, scaleFactor);
  return x >= node.x && x <= node.x + width && 
         y >= node.y && y <= node.y + height;
}
