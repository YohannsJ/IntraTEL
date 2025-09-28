import React, { useMemo, useState, useCallback, useEffect } from "react";
import { getAllPuzzles } from './utils/puzzleConfig.js';
import { uid, combinations, NODE_TYPES } from './utils/gameUtils.js';
import { evaluateCircuit } from './utils/circuitEvaluator.js';
import { CircuitCanvas } from './components/CircuitCanvas.jsx';
import { TruthTable } from './components/TruthTable.jsx';
import { DynamicTruthTable } from './components/DynamicTruthTable.jsx';
import { Toolbar } from './components/Toolbar.jsx';
import StylishAlert from './components/StylishAlert.jsx';
import styles from './styles/NandGame.module.css';

/**
 * NandGame – Mini juego de lógica con puertas NAND
 * - 4 ejercicios: NOT, AND, OR y XOR usando sólo NAND
 * - Interfaz SVG con puertos clicables y cableado visual
 * - Botón "Probar" valida todas las combinaciones de entrada y, si es correcto, muestra alert() con FLAG
 * - Sistema de guardado automático del estado del juego
 */

// Clave para localStorage
const GAME_STATE_KEY = 'nandGame_state';

// Función para guardar el estado del juego
const saveGameState = (state) => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar el estado del juego:', error);
  }
};

// Función para cargar el estado del juego
const loadGameState = () => {
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('No se pudo cargar el estado del juego:', error);
    return null;
  }
};

// Función para crear el estado inicial
const createInitialState = (puzzles) => ({
  puzzleIndex: 0,
  nodes: [...puzzles[0].nodes],
  connections: [],
  solved: { NOT: false, AND: false, OR: false, XOR: false },
  mode: 'puzzle',
  failedAttempts: 0
});

export default function NandGame() {
  const puzzles = useMemo(() => getAllPuzzles(), []);
  
  // Cargar estado guardado o crear inicial
  const [gameState, setGameState] = useState(() => {
    const savedState = loadGameState();
    if (savedState && savedState.puzzleIndex !== undefined) {
      // Validar que el estado guardado sea válido
      try {
        return {
          puzzleIndex: savedState.puzzleIndex || 0,
          nodes: savedState.nodes || [...puzzles[0]?.nodes || []],
          connections: savedState.connections || [],
          solved: savedState.solved || { NOT: false, AND: false, OR: false, XOR: false },
          mode: savedState.mode || 'puzzle',
          failedAttempts: savedState.failedAttempts || 0
        };
      } catch (error) {
        console.warn('Estado guardado inválido, creando nuevo:', error);
        return createInitialState(puzzles);
      }
    }
    return createInitialState(puzzles);
  });

  // Extraer estados individuales
  const [puzzleIndex, setPuzzleIndex] = useState(gameState.puzzleIndex);
  const [nodes, setNodes] = useState(gameState.nodes);
  const [connections, setConnections] = useState(gameState.connections);
  const [solved, setSolved] = useState(gameState.solved);
  const [mode, setMode] = useState(gameState.mode);
  const [failedAttempts, setFailedAttempts] = useState(gameState.failedAttempts);
  
  const [selected, setSelected] = useState(null); // {nodeId, port, kind:'out'|'in'}
  const [mousePosition, setMousePosition] = useState(null);
  
  // Estados para las alertas estilosas
  const [alert, setAlert] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    flagValue: null,
    showCopyButton: false,
    autoClose: false
  });

  // Funciones para manejar alertas (definidas temprano para evitar problemas de inicialización)
  const showAlert = useCallback((alertConfig) => {
    setAlert({
      isOpen: true,
      ...alertConfig
    });
  }, []);

  const closeAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Efecto para guardar automáticamente el estado cuando cambie
  useEffect(() => {
    const stateToSave = {
      puzzleIndex,
      nodes,
      connections,
      solved,
      mode,
      failedAttempts,
      lastSaved: new Date().toISOString()
    };
    
    saveGameState(stateToSave);
  }, [puzzleIndex, nodes, connections, solved, mode, failedAttempts]);

  const currentPuzzle = puzzles[puzzleIndex];

  // Resetear al puzzle seleccionado
  const resetToPuzzle = useCallback((index) => {
    setPuzzleIndex(index);
    setNodes([...puzzles[index].nodes]);
    setConnections([]);
    setSelected(null);
    setMode('puzzle');
    setFailedAttempts(0);
  }, [puzzles]);

  // Cambiar a modo sandbox
  const enterSandboxMode = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelected(null);
    setMode('sandbox');
    setFailedAttempts(0);
  }, []);

  // Volver al modo puzzle
  const returnToPuzzle = useCallback(() => {
    resetToPuzzle(0); // Volver al primer puzzle
  }, [resetToPuzzle]);

  // Limpiar todo el progreso guardado
  const clearSavedProgress = useCallback(() => {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
      showAlert({
        type: 'info',
        title: '🗑️ Progreso Eliminado',
        message: 'Se ha eliminado todo el progreso guardado. El juego se reiniciará desde el principio.',
        autoClose: true,
        autoCloseDelay: 3000
      });
      
      // Reiniciar completamente al estado inicial
      const initialState = createInitialState(puzzles);
      setPuzzleIndex(initialState.puzzleIndex);
      setNodes(initialState.nodes);
      setConnections(initialState.connections);
      setSolved(initialState.solved);
      setMode(initialState.mode);
      setFailedAttempts(initialState.failedAttempts);
      setSelected(null);
    } catch (error) {
      showAlert({
        type: 'error',
        title: 'Error',
        message: 'No se pudo eliminar el progreso guardado.',
        autoClose: true,
        autoCloseDelay: 3000
      });
    }
  }, [puzzles, showAlert]);

  // Exportar estado del juego
  const exportGameState = useCallback(() => {
    const stateToExport = {
      puzzleIndex,
      nodes,
      connections,
      solved,
      mode,
      failedAttempts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(stateToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `nandgame_estado_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert({
      type: 'success',
      title: '📥 Estado Exportado',
      message: 'El estado del juego ha sido descargado como archivo JSON.',
      autoClose: true,
      autoCloseDelay: 3000
    });
  }, [puzzleIndex, nodes, connections, solved, mode, failedAttempts, showAlert]);

  // Importar estado del juego
  const importGameState = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedState = JSON.parse(e.target.result);
        
        // Validar estructura básica
        if (typeof importedState !== 'object' || 
            !Array.isArray(importedState.nodes) ||
            !Array.isArray(importedState.connections)) {
          throw new Error('Formato de archivo inválido');
        }
        
        // Aplicar estado importado
        setPuzzleIndex(importedState.puzzleIndex || 0);
        setNodes(importedState.nodes || []);
        setConnections(importedState.connections || []);
        setSolved(importedState.solved || { NOT: false, AND: false, OR: false, XOR: false });
        setMode(importedState.mode || 'puzzle');
        setFailedAttempts(importedState.failedAttempts || 0);
        setSelected(null);
        
        showAlert({
          type: 'success',
          title: '📤 Estado Importado',
          message: 'El estado del juego ha sido cargado exitosamente.',
          autoClose: true,
          autoCloseDelay: 3000
        });
        
      } catch (error) {
        showAlert({
          type: 'error',
          title: 'Error de Importación',
          message: 'No se pudo cargar el archivo. Verifica que sea un archivo de estado válido.',
          autoClose: true,
          autoCloseDelay: 4000
        });
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input para permitir re-seleccionar el mismo archivo
    event.target.value = '';
  }, [showAlert]);

  // Contar compuertas extras agregadas por el usuario
  const extraNodesCount = useMemo(() => {
    if (mode === 'sandbox') {
      // En modo sandbox, contar todas las compuertas lógicas
      return nodes.filter(node => 
        node.type === NODE_TYPES.NAND || 
        node.type === NODE_TYPES.NOT || 
        node.type === NODE_TYPES.AND || 
        node.type === NODE_TYPES.OR
      ).length;
    } else {
      // En modo puzzle, contar solo las compuertas extra más allá de las iniciales
      const initialNandCount = currentPuzzle.nodes.filter(n => n.type === NODE_TYPES.NAND).length;
      const currentNandCount = nodes.filter(n => n.type === NODE_TYPES.NAND).length;
      const otherGatesCount = nodes.filter(n => 
        n.type === NODE_TYPES.NOT || 
        n.type === NODE_TYPES.AND || 
        n.type === NODE_TYPES.OR
      ).length;
      
      // Contabilizar NANDs extra + otras compuertas
      const extraNands = Math.max(0, currentNandCount - initialNandCount);
      return extraNands + otherGatesCount;
    }
  }, [nodes, mode, currentPuzzle]);

  // Agregar nuevo nodo
  const addNode = useCallback((newNode) => {
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Mover nodo
  const moveNode = useCallback((nodeId, newX, newY) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, x: newX, y: newY } : node
    ));
  }, []);

  // Eliminar nodo
  const removeNode = useCallback((nodeId) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.fromId !== nodeId && conn.toId !== nodeId
    ));
    if (selected?.nodeId === nodeId) {
      setSelected(null);
    }
  }, [selected]);

  // Renombrar nodo
  const renameNode = useCallback((nodeId, newName) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, label: newName } : node
    ));
    
    showAlert({
      type: 'success',
      title: '✏️ Compuerta Renombrada',
      message: `La compuerta ha sido renombrada a "${newName}"`,
      autoClose: true,
      autoCloseDelay: 2000
    });
  }, [showAlert]);

  // Manejar movimiento del mouse para cable temporal
  const handleMouseMove = useCallback((e) => {
    if (selected && selected.kind === "out") {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [selected]);

  // Evaluar el circuito actual
  const { valueOut } = useMemo(
    () => evaluateCircuit(nodes, connections, {}),
    [nodes, connections]
  );

  // Agregar una nueva conexión
  const addConnection = useCallback(
    (fromId, toId, toPort) => {
      // Evitar múltiples cables a la misma entrada
      const existingConnection = connections.some(
        (c) => c.toId === toId && c.toPort === toPort
      );
      if (existingConnection) return;

      const newConnection = {
        id: uid("W"),
        fromId,
        toId,
        toPort
      };
      setConnections((prev) => [...prev, newConnection]);
    },
    [connections]
  );

  // Manejar clicks en puertos
  const handlePortClick = useCallback(
    (node, port, kind) => {
      if (kind === "out") {
        setSelected({ nodeId: node.id, port, kind });
      } else {
        // kind === 'in'
        if (selected && selected.kind === "out") {
          addConnection(selected.nodeId, node.id, port);
          setSelected(null);
        } else {
          setSelected({ nodeId: node.id, port, kind });
        }
      }
    },
    [selected, addConnection]
  );

  // Remover un cable
  const removeWire = useCallback((wireId) => {
    setConnections((prev) => prev.filter((c) => c.id !== wireId));
  }, []);

  // Toggle de entrada manual
  const toggleInput = useCallback((nodeId) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, manual: !n.manual } : n
      )
    );
  }, []);

  // Intentar resolver el puzzle
  const trySolve = useCallback(() => {
    if (mode === 'sandbox') {
      showAlert({
        type: 'warning',
        title: 'Modo Sandbox',
        message: 'En modo sandbox no hay puzzles para resolver. ¡Experimenta libremente con las compuertas lógicas!',
        autoClose: true,
        autoCloseDelay: 3000
      });
      return;
    }

    const inputNodes = nodes
      .filter((n) => n.type === NODE_TYPES.INPUT)
      .sort((a, b) => a.label.localeCompare(b.label));
    
    const outputNode = nodes.find(
      (n) => n.type === NODE_TYPES.OUTPUT && n.label === currentPuzzle.outputLabel
    ) || nodes.find((n) => n.type === NODE_TYPES.OUTPUT);

    if (!outputNode) {
      showAlert({
        type: 'error',
        title: 'Error de Configuración',
        message: 'No se encontró un nodo de salida válido. Verifica que el circuito esté conectado correctamente.',
        autoClose: true,
        autoCloseDelay: 4000
      });
      return;
    }

    // Verificar todas las combinaciones
    const allCombinations = combinations(inputNodes.length);
    let allCorrect = true;

    for (const combination of allCombinations) {
      const inputOverrides = {};
      inputNodes.forEach((node, index) => {
        inputOverrides[node.label] = combination[index];
      });

      const { valueOut: testValues } = evaluateCircuit(
        nodes,
        connections,
        inputOverrides
      );
      
      const actualOutput = testValues.get(outputNode.id);
      const expectedOutput = currentPuzzle.expected(combination);

      if (actualOutput === undefined || actualOutput !== expectedOutput) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      const newSolved = { ...solved, [currentPuzzle.key]: true };
      setSolved(newSolved);

      // Mostrar flag correspondiente
      const levelFlag = currentPuzzle.flag || `FLAG{${currentPuzzle.key}_COMPLETED}`;
      
      showAlert({
        type: 'flag',
        title: '🎉 ¡Puzzle Resuelto!',
        message: `¡Excelente trabajo! Has completado el puzzle ${currentPuzzle.key}. Aquí tienes tu flag:`,
        flagValue: levelFlag,
        showCopyButton: true,
        autoClose: false
      });

      // Flag final si se completaron ambos
      if (newSolved.NOT && newSolved.AND && newSolved.OR && newSolved.XOR) {
        setTimeout(() => {
          showAlert({
            type: 'success',
            title: '🏆 ¡Maestro NAND!',
            message: '¡Increíble! Has completado todos los puzzles NAND. Eres un verdadero maestro de la lógica digital. Aquí tienes tu flag especial:',
            flagValue: 'FLAG{NAND_TOTAL_MASTER_4_DE_4}',
            showCopyButton: true,
            autoClose: false
          });
        }, 2000);
      }
      
      // Resetear contador de intentos fallidos al resolver
      setFailedAttempts(0);
    } else {
      // Incrementar contador de intentos fallidos
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      showAlert({
        type: 'error',
        title: '❌ Intento Fallido',
        message: `La tabla de verdad no coincide con el resultado esperado. Revisa tus conexiones y vuelve a intentarlo.\n\nIntentos fallidos: ${newFailedAttempts}`,
        autoClose: true,
        autoCloseDelay: 4000
      });
    }
  }, [nodes, connections, currentPuzzle, solved, mode, showAlert, failedAttempts]);

  // Limpiar todas las conexiones
  const clearAllConnections = useCallback(() => {
    setConnections([]);
    setSelected(null);
  }, []);

  return (
    <div className={styles.nandGame}>
      <div className={styles.gameContainer}>
        {/* Header del juego */}
        <header className={styles.gameHeader}>
          <h1 className={styles.gameTitle}>
            NandGame – {mode === 'puzzle' ? '4 ejercicios' : 'Modo Sandbox'}
          </h1>
          
          <div className={styles.gameControls}>
            {mode === 'puzzle' && (
              <select
                className={styles.puzzleSelect}
                value={puzzleIndex}
                onChange={(e) => resetToPuzzle(parseInt(e.target.value, 10))}
              >
                {puzzles.map((puzzle, index) => {
                  const puzzleNames = {
                    NOT: "Ejercicio 1 – NOT",
                    AND: "Ejercicio 2 – AND", 
                    OR: "Ejercicio 3 – OR",
                    XOR: "Ejercicio 4 – XOR"
                  };
                  return (
                    <option key={puzzle.key} value={index}>
                      {puzzleNames[puzzle.key] || `Ejercicio ${index + 1} – ${puzzle.key}`}
                      {solved[puzzle.key] ? " ✅" : ""}
                    </option>
                  );
                })}
              </select>
            )}
            
            {mode === 'puzzle' ? (
              <button
                className={`${styles.controlButton}`}
                onClick={enterSandboxMode}
              >
                Modo Sandbox
              </button>
            ) : (
              <button
                className={`${styles.controlButton} ${styles.activeMode}`}
                onClick={returnToPuzzle}
                title="Volver al modo puzzle"
              >
                🔙 Volver a Puzzles
              </button>
            )}
            
            <button
              className={styles.controlButton}
              onClick={clearAllConnections}
              title="Borra todas las conexiones actuales"
            >
              Borrar cables
            </button>
            
            {mode === 'puzzle' && (
              <button
                className={styles.controlButton}
                onClick={() => resetToPuzzle(puzzleIndex)}
              >
                Reiniciar ejercicio
              </button>
            )}
            
            <button
              className={styles.controlButton}
              onClick={clearSavedProgress}
              title="Elimina todo el progreso guardado y reinicia el juego"
              style={{ 
                backgroundColor: 'var(--theme-danger, #ef4444)', 
                borderColor: 'var(--theme-danger, #ef4444)',
                color: 'white'
              }}
            >
              🗑️ Limpiar Progreso
            </button>
            
            <button
              className={styles.controlButton}
              onClick={exportGameState}
              title="Exporta el estado actual como archivo JSON"
            >
              📥 Exportar
            </button>
            
            <label className={styles.controlButton} title="Importa un estado guardado desde archivo JSON">
              📤 Importar
              <input
                type="file"
                accept=".json"
                onChange={importGameState}
                style={{ display: 'none' }}
              />
            </label>
            
            {mode === 'puzzle' && (
              <button
                className={`${styles.controlButton} ${styles.solveButton}`}
                onClick={trySolve}
              >
                Probar
              </button>
            )}
          </div>
        </header>

        {/* Descripción del puzzle */}
        {mode === 'puzzle' && (
          <p className={styles.puzzleDescription}>
            <span className={styles.puzzleTitle}>{currentPuzzle.title}</span>
            {" — "}
            {currentPuzzle.description}
          </p>
        )}

        {mode === 'sandbox' && (
          <p className={styles.puzzleDescription}>
            <span className={styles.puzzleTitle}>Modo Sandbox</span>
            {" — "}
            Experimenta libremente con todas las compuertas lógicas disponibles. Arrastra para mover, conecta puertos para crear circuitos.
          </p>
        )}

        {/* Grid principal */}
        <div className={styles.gameGrid}>
          {/* Panel del circuito */}
          <div 
            className={styles.circuitPanel}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePosition(null)}
          >
            <CircuitCanvas
              nodes={nodes}
              connections={connections}
              selected={selected}
              valueOut={valueOut}
              mousePosition={mousePosition}
              onPortClick={handlePortClick}
              onToggleInput={toggleInput}
              onRemoveWire={removeWire}
              onMoveNode={moveNode}
              onRemoveNode={removeNode}
              onRenameNode={renameNode}
            />
          </div>

          {/* Panel lateral */}
          <div className={styles.sidePanel}>
            {/* Tabla de verdad - arriba del toolbar */}
            {mode === 'puzzle' ? (
              <TruthTable
                puzzle={currentPuzzle}
                nodes={nodes}
                connections={connections}
              />
            ) : (
              <DynamicTruthTable
                nodes={nodes}
                connections={connections}
              />
            )}

            {/* Toolbar para agregar componentes */}
            <Toolbar 
              onAddNode={addNode} 
              extraNodesCount={extraNodesCount}
              mode={mode}
            />

            {/* Panel de ayuda */}
            <div className={styles.circuitPanel}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                Ayuda rápida
              </h2>
              <ul style={{ 
                listStyle: 'disc', 
                paddingLeft: '1.5rem', 
                color: '#cbd5e1', 
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <li>
                  <strong>Agregar:</strong> Click en la barra de herramientas para agregar componentes.
                </li>
                <li>
                  <strong>Mover:</strong> Arrastra cualquier componente para moverlo.
                </li>
                <li>
                  <strong>Conectar:</strong> Click en puerto de salida, luego en puerto de entrada.
                </li>
                <li>
                  <strong>Eliminar cable:</strong> Click directamente sobre el cable.
                </li>
                <li>
                  <strong>Click derecho:</strong> Menú contextual para renombrar o eliminar compuertas.
                </li>
                <li>
                  Las señales en 1 (HIGH) se muestran en verde; 0 (LOW) en gris.
                </li>
                {mode === 'puzzle' && (
                  <li>
                    <strong>Probar:</strong> Valida toda la tabla de verdad del ejercicio.
                  </li>
                )}
                <li>
                  <strong>💾 Guardado automático:</strong> Tu progreso se guarda automáticamente.
                </li>
                <li>
                  <strong>📥📤 Exportar/Importar:</strong> Puedes respaldar tu progreso en archivos.
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Información de intentos fallidos */}
        {mode === 'puzzle' && failedAttempts > 0 && (
          <div className={styles.failedAttemptsInfo}>
            <span className={styles.attemptsIcon}>⚠️</span>
            <span className={styles.attemptsText}>
              Intentos fallidos: <strong>{failedAttempts}</strong>
            </span>
          </div>
        )}

        {/* Indicador de estado guardado */}
        <div className={styles.saveIndicator}>
          💾 <span>Estado guardado automáticamente</span>
          {solved.NOT || solved.AND || solved.OR || solved.XOR ? (
            <span className={styles.progressBadge}>
              ✅ Progreso: {Object.values(solved).filter(Boolean).length}/4 puzzles completados
            </span>
          ) : null}
        </div>
      </div>

      {/* Alerta estilosa */}
      <StylishAlert
        isOpen={alert.isOpen}
        onClose={closeAlert}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        flagValue={alert.flagValue}
        showCopyButton={alert.showCopyButton}
        autoClose={alert.autoClose}
        autoCloseDelay={alert.autoCloseDelay}
      />
    </div>
  );
}
