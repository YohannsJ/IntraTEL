import React, { useMemo } from 'react';
import { NODE_TYPES, combinations } from '../utils/gameUtils.js';
import { evaluateCircuit } from '../utils/circuitEvaluator.js';
import styles from './TruthTable.module.css';

/**
 * Componente DynamicTruthTable - Tabla de verdad dinámica para modo sandbox
 */
export function DynamicTruthTable({ nodes, connections }) {
  const { inputNodes, outputNodes, truthTable } = useMemo(() => {
    // Encontrar nodos de entrada y salida
    const inputs = nodes
      .filter(n => n.type === NODE_TYPES.INPUT)
      .sort((a, b) => a.label.localeCompare(b.label));
    
    const outputs = nodes
      .filter(n => n.type === NODE_TYPES.OUTPUT)
      .sort((a, b) => a.label.localeCompare(b.label));

    if (inputs.length === 0 || outputs.length === 0) {
      return { inputNodes: [], outputNodes: [], truthTable: [] };
    }

    // Generar todas las combinaciones posibles
    const allCombinations = combinations(inputs.length);
    const table = [];

    for (const combination of allCombinations) {
      const inputOverrides = {};
      inputs.forEach((node, index) => {
        inputOverrides[node.label] = combination[index];
      });

      const { valueOut } = evaluateCircuit(nodes, connections, inputOverrides);
      
      const row = {
        inputs: combination,
        outputs: outputs.map(output => valueOut.get(output.id))
      };
      
      table.push(row);
    }

    return { inputNodes: inputs, outputNodes: outputs, truthTable: table };
  }, [nodes, connections]);

  if (inputNodes.length === 0 || outputNodes.length === 0) {
    return (
      <div className={styles.truthTable}>
        <h2 className={styles.tableTitle}>Tabla de Verdad - Modo Sandbox</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            Agrega al menos una entrada (INPUT) y una salida (OUTPUT) para ver la tabla de verdad dinámica.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.truthTable}>
      <h2 className={styles.tableTitle}>
        Tabla de Verdad - Modo Sandbox
      </h2>
      <p className={styles.tableSubtitle}>
        {inputNodes.length} entrada{inputNodes.length > 1 ? 's' : ''}, {outputNodes.length} salida{outputNodes.length > 1 ? 's' : ''}
      </p>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {/* Columnas de entrada */}
              {inputNodes.map(node => (
                <th key={`input-${node.id}`} className={styles.inputColumn}>
                  {node.label}
                </th>
              ))}
              {/* Separador */}
              <th className={styles.separator}>|</th>
              {/* Columnas de salida */}
              {outputNodes.map(node => (
                <th key={`output-${node.id}`} className={styles.outputColumn}>
                  {node.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {truthTable.map((row, index) => (
              <tr key={index}>
                {/* Valores de entrada */}
                {row.inputs.map((value, i) => (
                  <td key={`input-${i}`} className={styles.inputCell}>
                    {value ? 1 : 0}
                  </td>
                ))}
                {/* Separador */}
                <td className={styles.separator}>|</td>
                {/* Valores de salida */}
                {row.outputs.map((value, i) => (
                  <td key={`output-${i}`} className={`${styles.outputCell} ${
                    value === true ? styles.high : 
                    value === false ? styles.low : 
                    styles.undefined
                  }`}>
                    {value === undefined ? '?' : (value ? 1 : 0)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className={styles.tableInfo}>
        <p>Se evalúan automáticamente todas las {Math.pow(2, inputNodes.length)} combinaciones posibles.</p>
      </div>
    </div>
  );
}
