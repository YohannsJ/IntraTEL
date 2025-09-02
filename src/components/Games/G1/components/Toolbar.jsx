import React from 'react';
import { NODE_TYPES, uid } from '../utils/gameUtils.js';
import styles from './Toolbar.module.css';

/**
 * Componente Toolbar - Barra de herramientas para agregar nuevos elementos
 */
export function Toolbar({ onAddNode, extraNodesCount, mode }) {
  const gateTypes = [
    { type: NODE_TYPES.NAND, label: 'NAND', icon: '⊼' },
    { type: NODE_TYPES.NOT, label: 'NOT', icon: '¬' },
    { type: NODE_TYPES.AND, label: 'AND', icon: '∧' },
    { type: NODE_TYPES.OR, label: 'OR', icon: '∨' },
    { type: NODE_TYPES.INPUT, label: 'INPUT', icon: '⚬' },
    { type: NODE_TYPES.OUTPUT, label: 'OUTPUT', icon: '💡' },
    { type: NODE_TYPES.CONST, label: 'CONST', icon: '1' },
  ];

  const handleAddGate = (gateType) => {
    // Posición en la esquina superior izquierda con pequeña variación
    const x = 30 + Math.random() * 50;
    const y = 30 + Math.random() * 50;
    
    let nodeCounter = 1;
    const newNode = {
      id: uid(gateType.toLowerCase()),
      type: gateType,
      label: gateType === NODE_TYPES.INPUT ? 'A' : 
             gateType === NODE_TYPES.OUTPUT ? 'Y' : 
             gateType === NODE_TYPES.CONST ? '1' :
             `${gateType}${nodeCounter++}`,
      x,
      y,
      manual: gateType === NODE_TYPES.INPUT ? false : undefined,
      value: gateType === NODE_TYPES.CONST ? true : undefined,
      isExtra: true // Marcar como componente extra agregado por el usuario
    };
    
    onAddNode(newNode);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarHeader}>
        <h3 className={styles.toolbarTitle}>Agregar Componentes</h3>
      </div>
      
      {extraNodesCount > 0 && (
        <div className={styles.counter}>
          <span className={styles.counterText}>
            Compuertas extras: {extraNodesCount}
          </span>
        </div>
      )}
      
      <div className={styles.gateGrid}>
        {gateTypes.map((gate) => (
          <button
            key={gate.type}
            className={styles.gateButton}
            onClick={() => handleAddGate(gate.type)}
            title={`Agregar ${gate.label}`}
          >
            <span className={styles.gateIcon}>{gate.icon}</span>
            <span className={styles.gateLabel}>{gate.label}</span>
          </button>
        ))}
      </div>
      
      <div className={styles.instructions}>
        <h4>Instrucciones:</h4>
        <ul>
          <li>Click en un componente para agregarlo al circuito</li>
          <li>Arrastra los componentes para moverlos</li>
          <li>Click en puerto de salida, luego en puerto de entrada para conectar</li>
          <li>Click en un cable para eliminarlo</li>
          <li><strong>Right-click</strong> en una compuerta para eliminarla</li>
        </ul>
      </div>
    </div>
  );
}
