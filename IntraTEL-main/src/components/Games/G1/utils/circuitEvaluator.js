import { NODE_TYPES } from './gameUtils.js';

/**
 * Evalúa el circuito completo con los valores dados
 * @param {Array} nodes - Array de nodos del circuito
 * @param {Array} connections - Array de conexiones
 * @param {Object} manualOverrides - Valores manuales para las entradas
 * @returns {Object} Objeto con los valores de salida
 */
export function evaluateCircuit(nodes, connections, manualOverrides = {}) {
  // Construir mapas de acceso rápido
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const incoming = new Map(); // key: `${toId}:${toPort}` → {fromId}
  for (const c of connections) {
    incoming.set(`${c.toId}:${c.toPort}`, { fromId: c.fromId });
  }

  const valueOut = new Map(); // nodeId → boolean | undefined

  // Inicialización de valores
  for (const n of nodes) {
    if (n.type === NODE_TYPES.CONST) {
      valueOut.set(n.id, n.value ?? true);
    }
    if (n.type === NODE_TYPES.INPUT) {
      valueOut.set(n.id, manualOverrides[n.label] ?? n.manual ?? false);
    }
  }

  // Propagación iterativa hasta convergencia
  for (let iter = 0; iter < 16; iter++) {
    let changed = false;
    
    for (const n of nodes) {
      if (n.type === NODE_TYPES.NAND) {
        const key0 = `${n.id}:in0`;
        const key1 = `${n.id}:in1`;
        const src0 = incoming.get(key0);
        const src1 = incoming.get(key1);
        const a = src0 ? valueOut.get(src0.fromId) : undefined;
        const b = src1 ? valueOut.get(src1.fromId) : undefined;
        const y = a === undefined || b === undefined ? undefined : !(a && b);
        
        if (valueOut.get(n.id) !== y) {
          valueOut.set(n.id, y);
          changed = true;
        }
      }
      
      if (n.type === NODE_TYPES.AND) {
        const key0 = `${n.id}:in0`;
        const key1 = `${n.id}:in1`;
        const src0 = incoming.get(key0);
        const src1 = incoming.get(key1);
        const a = src0 ? valueOut.get(src0.fromId) : undefined;
        const b = src1 ? valueOut.get(src1.fromId) : undefined;
        const y = a === undefined || b === undefined ? undefined : (a && b);
        
        if (valueOut.get(n.id) !== y) {
          valueOut.set(n.id, y);
          changed = true;
        }
      }
      
      if (n.type === NODE_TYPES.OR) {
        const key0 = `${n.id}:in0`;
        const key1 = `${n.id}:in1`;
        const src0 = incoming.get(key0);
        const src1 = incoming.get(key1);
        const a = src0 ? valueOut.get(src0.fromId) : undefined;
        const b = src1 ? valueOut.get(src1.fromId) : undefined;
        const y = a === undefined || b === undefined ? undefined : (a || b);
        
        if (valueOut.get(n.id) !== y) {
          valueOut.set(n.id, y);
          changed = true;
        }
      }
      
      if (n.type === NODE_TYPES.NOT) {
        const key = `${n.id}:in`;
        const src = incoming.get(key);
        const a = src ? valueOut.get(src.fromId) : undefined;
        const y = a === undefined ? undefined : !a;
        
        if (valueOut.get(n.id) !== y) {
          valueOut.set(n.id, y);
          changed = true;
        }
      }
      
      if (n.type === NODE_TYPES.OUTPUT) {
        const key = `${n.id}:in`;
        const src = incoming.get(key);
        const y = src ? valueOut.get(src.fromId) : undefined;
        
        if (valueOut.get(n.id) !== y) {
          valueOut.set(n.id, y);
          changed = true;
        }
      }
    }
    
    if (!changed) break;
  }

  return { valueOut };
}
