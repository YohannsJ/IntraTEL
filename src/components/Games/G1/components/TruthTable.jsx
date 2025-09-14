import React, { useMemo } from 'react';
import { NODE_TYPES, combinations } from '../utils/gameUtils.js';
import { evaluateCircuit } from '../utils/circuitEvaluator.js';
import styles from './TruthTable.module.css';

/**
 * Componente Tabla de Verdad - Muestra la tabla de verdad del circuito actual
 */
export function TruthTable({ puzzle, nodes, connections }) {
  // Determina las entradas ordenadas por etiqueta
  const inputNodes = useMemo(
    () => nodes
      .filter((n) => n.type === NODE_TYPES.INPUT)
      .sort((a, b) => a.label.localeCompare(b.label)),
    [nodes]
  );

  // Encuentra el nodo de salida
  const outputNode = useMemo(
    () => nodes.find((n) => 
      n.type === NODE_TYPES.OUTPUT && n.label === puzzle.outputLabel
    ) || nodes.find((n) => n.type === NODE_TYPES.OUTPUT),
    [nodes, puzzle.outputLabel]
  );

  // Calcula todas las filas de la tabla de verdad
  const truthTableRows = useMemo(() => {
    const allCombinations = combinations(inputNodes.length);
    
    return allCombinations.map((inputCombination) => {
      // Configurar los valores de entrada para esta combinación
      const inputOverrides = {};
      inputNodes.forEach((node, index) => {
        inputOverrides[node.label] = inputCombination[index];
      });

      // Evaluar el circuito con estos valores
      const { valueOut } = evaluateCircuit(nodes, connections, inputOverrides);
      const actualOutput = outputNode ? valueOut.get(outputNode.id) : undefined;
      const expectedOutput = puzzle.expected(inputCombination);
      const isCorrect = actualOutput === expectedOutput;

      return {
        inputs: inputCombination,
        expected: expectedOutput,
        actual: actualOutput,
        match: isCorrect
      };
    });
  }, [inputNodes, nodes, connections, outputNode, puzzle]);

  return (
    <div className={styles.truthTable}>
      <h2 className={styles.tableTitle}>Tabla de verdad - {puzzle.title}</h2>
      
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              {puzzle.inputLabels.map((label) => (
                <th key={label} className={styles.inputColumn}>
                  {label}
                </th>
              ))}
              <th className={styles.separator}>|</th>
              <th className={styles.outputColumn}>
                Y (Recibido)
              </th>
              <th className={styles.outputColumn}>
                Y (Esperado)
              </th>
              <th className={styles.statusColumn}>
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {truthTableRows.map((row, index) => (
              <tr key={index} className={row.match ? styles.correctRow : ''}>
                {row.inputs.map((input, inputIndex) => (
                  <td key={inputIndex} className={styles.inputCell}>
                    {input ? 1 : 0}
                  </td>
                ))}
                <td className={styles.separator}>|</td>
                <td className={styles.outputCell}>
                  {row.actual === undefined ? '?' : (row.actual ? 1 : 0)}
                </td>
                <td className={styles.outputCell}>
                  {row.expected ? 1 : 0}
                </td>
                <td className={styles.statusCell}>
                  {row.actual === undefined ? (
                    <span className={styles.unknownIndicator}>?</span>
                  ) : row.match ? (
                    <span className={styles.correctIndicator}>✓</span>
                  ) : (
                    <span className={styles.incorrectIndicator}>✗</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className={styles.tableInfo}>
        <p>
          La ✓ indica que tu circuito coincide con la salida esperada para esa fila; 
          ✗ indica discrepancia; ? indica señal indefinida.
        </p>
      </div>
    </div>
  );
}
