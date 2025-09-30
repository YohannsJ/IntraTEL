import React, { useState, useCallback, useEffect } from 'react';
import { NODE_TYPES, getPortPos, isPointInNode, getNodeDimensions } from '../utils/gameUtils.js';
import { Port, Wire } from '../svg/ConnectionComponents.jsx';
import { SvgNAND, SvgNOT, SvgAND, SvgOR, SvgInput, SvgOutput, SvgConst } from '../svg/LogicGates.jsx';
import { ContextMenu } from './ContextMenu.jsx';

/**
 * Componente Circuit Canvas - Lienzo SVG donde se dibuja y edita el circuito
 */
export function CircuitCanvas({
  nodes,
  connections,
  selected,
  valueOut,
  onPortClick,
  onToggleInput,
  onRemoveWire,
  onMoveNode,
  onRemoveNode,
  onRenameNode,
  mousePosition,
  mode
}) {
  const [dragState, setDragState] = useState({
    isDragging: false,
    nodeId: null,
    offset: { x: 0, y: 0 }
  });

  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
    node: null
  });

  // Estado para el factor de escala que se actualiza con el tamaño de pantalla
  const [scaleFactor, setScaleFactor] = useState(1);

  // Efecto para actualizar el factor de escala cuando cambia el tamaño de pantalla
  useEffect(() => {
    const updateScaleFactor = () => {
      const screenWidth = Math.min(window.innerWidth, 1100); // Limitar a 1100px
      if (screenWidth < 481) {
        setScaleFactor(0.6); // Compuertas más compactas para móviles muy pequeños
      } else if (screenWidth < 780) {
        setScaleFactor(0.7); // Compuertas compactas para móviles grandes y tablets pequeños
      } else if (screenWidth <= 1024) {
        setScaleFactor(0.85); // Escala reducida para tablets
      } else {
        // Para pantallas grandes, escalar proporcionalmente hasta 1100px
        const ratio = Math.min(screenWidth / 1024, 1100 / 1024);
        setScaleFactor(0.85 * ratio);
      }
    };

    // Ejecutar al montar el componente
    updateScaleFactor();

    // Agregar listener para cambios de tamaño
    window.addEventListener('resize', updateScaleFactor);

    // Cleanup
    return () => window.removeEventListener('resize', updateScaleFactor);
  }, []);

  // Función para calcular los límites del viewBox
  const getViewBoxLimits = useCallback(() => {
    const screenWidth = Math.min(window.innerWidth, 1100); // Limitar a 1100px
    let width, height;
    
    if (screenWidth < 481) {
      // Móviles muy pequeños - área compacta
      width = 350;
      height = 450;
    } else if (screenWidth < 780) {
      // Tablets pequeños y móviles grandes
      width = 450;
      height = 550;
    } else {
      // Desktop y tablets grandes - escalar proporcionalmente hasta 1100px
      const baseWidth = 600;
      const baseHeight = 650;
      
      // Escalar el área de trabajo proporcionalmente
      width = Math.floor(baseWidth * (scaleFactor / 0.85));
      height = baseHeight; // Altura máxima establecida
    }
    
    return { width, height };
  }, [scaleFactor]);

  // Obtener coordenadas de evento (mouse o touch)
  const getEventCoordinates = useCallback((e) => {
    if (e.touches && e.touches.length > 0) {
      return { clientX: e.touches[0].clientX, clientY: e.touches[0].clientY };
    }
    return { clientX: e.clientX, clientY: e.clientY };
  }, []);

  // Manejar inicio de arrastre (mouse y touch)
  const handleMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    // Solo prevenir default en eventos mouse, no en touch para evitar el error pasivo
    if (e.type === 'mousedown') {
      e.preventDefault();
    }
    
    // No permitir arrastrar nodos INPUT y OUTPUT en modo puzzle (son fijos)
    // En modo sandbox sí se pueden mover
    if (mode === 'puzzle' && (node.type === NODE_TYPES.INPUT || node.type === NODE_TYPES.OUTPUT)) {
      return;
    }
    
    // Los nodos marcados como fixed nunca se pueden mover
    if (node.fixed) {
      return;
    }
    
    const coords = getEventCoordinates(e);
    const svg = e.currentTarget.closest('svg');
    const svgRect = svg.getBoundingClientRect();
    const viewBoxLimits = getViewBoxLimits();
    const scaleX = svgRect.width / viewBoxLimits.width;
    const scaleY = svgRect.height / viewBoxLimits.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (svgRect.width - viewBoxLimits.width * scale) / 2;
    const offsetY = (svgRect.height - viewBoxLimits.height * scale) / 2;
    
    // Ajustar coordenadas a viewBox
    const mouseX = (coords.clientX - svgRect.left - offsetX) / scale;
    const mouseY = (coords.clientY - svgRect.top - offsetY) / scale;
    
    setDragState({
      isDragging: true,
      nodeId: node.id,
      offset: {
        x: mouseX - node.x,
        y: mouseY - node.y
      }
    });
  }, [getEventCoordinates, mode, getViewBoxLimits]);

  // Manejar click derecho para mostrar menú contextual
  const handleContextMenu = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo mostrar menú para compuertas que se pueden modificar
    // En modo sandbox, también se pueden modificar INPUT y OUTPUT
    const canModify = node.isExtra || 
      node.type === NODE_TYPES.NAND || 
      node.type === NODE_TYPES.NOT || 
      node.type === NODE_TYPES.AND || 
      node.type === NODE_TYPES.OR || 
      node.type === NODE_TYPES.CONST ||
      (mode === 'sandbox' && (node.type === NODE_TYPES.INPUT || node.type === NODE_TYPES.OUTPUT));
    
    if (canModify) {
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        node: node
      });
    }
  }, [mode]);

  // Cerrar menú contextual
  const closeContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, position: { x: 0, y: 0 }, node: null });
  }, []);

  // Manejar renombrado de compuerta
  const handleRenameNode = useCallback((nodeId, newName) => {
    if (onRenameNode) {
      onRenameNode(nodeId, newName);
    }
  }, [onRenameNode]);

  // Manejar eliminación de compuerta desde menú contextual
  const handleDeleteNode = useCallback((nodeId) => {
    onRemoveNode(nodeId);
  }, [onRemoveNode]);

  // Manejar movimiento durante arrastre (mouse y touch)
  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    // Solo prevenir default en eventos mouse para evitar error en eventos táctiles pasivos
    if (e.type === 'mousemove') {
      e.preventDefault();
    }
    
    const coords = getEventCoordinates(e);
    const svg = e.currentTarget;
    const svgRect = svg.getBoundingClientRect();
    const viewBoxLimits = getViewBoxLimits();
    const scaleX = svgRect.width / viewBoxLimits.width;
    const scaleY = svgRect.height / viewBoxLimits.height;
    const scale = Math.min(scaleX, scaleY);
    const offsetX = (svgRect.width - viewBoxLimits.width * scale) / 2;
    const offsetY = (svgRect.height - viewBoxLimits.height * scale) / 2;
    
    // Ajustar coordenadas del mouse a viewBox
    const mouseX = (coords.clientX - svgRect.left - offsetX) / scale;
    const mouseY = (coords.clientY - svgRect.top - offsetY) / scale;
    
    // Obtener dimensiones del nodo
    const nodeDimensions = getNodeDimensions(dragState.nodeId, nodes, scaleFactor);
    const nodeWidth = nodeDimensions?.width || 80;
    const nodeHeight = nodeDimensions?.height || 60;
    
    // Límites en viewBox
    const margin = 10;
    const minX = margin;
    const minY = margin;
    const maxX = viewBoxLimits.width - nodeWidth - margin;
    const maxY = viewBoxLimits.height - nodeHeight - margin;
    
    // Aplicar límites y actualizar posición
    const newX = Math.max(minX, Math.min(maxX, mouseX - dragState.offset.x));
    const newY = Math.max(minY, Math.min(maxY, mouseY - dragState.offset.y));
    
    onMoveNode(dragState.nodeId, newX, newY);
  }, [dragState, onMoveNode, getEventCoordinates, nodes, getViewBoxLimits, scaleFactor]);

  // Manejar fin de arrastre
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      nodeId: null,
      offset: { x: 0, y: 0 }
    });
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Área de trabajo con bordes visibles */}
      <div style={{
        position: 'absolute',
        top: 12,
        left: 10,
        right: 10,
        bottom: 10,
        border: '2px dashed #475569',
        borderRadius: '8px',
        pointerEvents: 'none',
        zIndex: 1
      }}>
        <div style={{
          position: 'absolute',
          top: -20,
          left: 0,
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Área de trabajo
        </div>
      </div>
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${getViewBoxLimits().width} ${getViewBoxLimits().height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative', 
          zIndex: 2,
          touchAction: 'none' // Desabilitar gestos táctiles por defecto
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        onTouchCancel={handleMouseUp}
      >
      {/* Conexiones permanentes (se dibujan primero, detrás de los nodos) */}
      {connections.map((connection) => {
        const fromNode = nodes.find((n) => n.id === connection.fromId);
        const toNode = nodes.find((n) => n.id === connection.toId);
        
        if (!fromNode || !toNode) return null;
        
        const startPos = getPortPos(fromNode, "out", scaleFactor);
        const endPos = getPortPos(toNode, connection.toPort, scaleFactor);
        const wireValue = valueOut.get(fromNode.id);
        
        return (
          <Wire
            key={connection.id}
            id={connection.id}
            x1={startPos.x}
            y1={startPos.y}
            x2={endPos.x}
            y2={endPos.y}
            value={wireValue}
            onRemove={onRemoveWire}
            isTemporary={false}
          />
        );
      })}

      {/* Cable temporal durante conexión */}
      {selected && selected.kind === "out" && mousePosition && (
        <Wire
          id="temp-wire"
          x1={getPortPos(
            nodes.find((n) => n.id === selected.nodeId),
            selected.port
          ).x}
          y1={getPortPos(
            nodes.find((n) => n.id === selected.nodeId),
            selected.port
          ).y}
          x2={mousePosition.x}
          y2={mousePosition.y}
          value={undefined}
          isTemporary={true}
        />
      )}

      {/* Nodos del circuito */}
      {nodes.map((node) => {
        const isSelectedOut = selected?.nodeId === node.id && selected?.kind === "out";
        const isSelectedIn = selected?.nodeId === node.id && selected?.kind === "in";
        const isBeingDragged = dragState.isDragging && dragState.nodeId === node.id;
        // En modo puzzle, INPUT y OUTPUT son fijos; en sandbox son movibles
        const isFixed = mode === 'puzzle' 
          ? (node.type === NODE_TYPES.INPUT || node.type === NODE_TYPES.OUTPUT || node.fixed)
          : node.fixed;

        // Renderizar según el tipo de nodo
        return (
          <g 
            key={node.id}
            style={{ 
              cursor: isFixed ? 'default' : (isBeingDragged ? 'grabbing' : 'grab'),
              opacity: isBeingDragged ? 0.8 : 1,
              touchAction: 'none' // Desabilitar gestos táctiles por defecto
            }}
            onMouseDown={(e) => handleMouseDown(e, node)}
            onTouchStart={(e) => handleMouseDown(e, node)}
            onContextMenu={(e) => handleContextMenu(e, node)}
          >
            {/* Renderizar el componente visual según el tipo */}
            {node.type === NODE_TYPES.INPUT && (
              <>
                <SvgInput
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  value={node.manual ?? false}
                  onToggle={() => onToggleInput(node.id)}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title={`Salida ${node.label}`}
                />
              </>
            )}

            {node.type === NODE_TYPES.NAND && (
              <>
                <SvgNAND
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  activeOut={valueOut.get(node.id) === true}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "in0", scaleFactor).x}
                  y={getPortPos(node, "in0", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1", scaleFactor).x}
                  y={getPortPos(node, "in1", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title={`${node.label}.out`}
                />
              </>
            )}

            {node.type === NODE_TYPES.NOT && (
              <>
                <SvgNOT
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  activeOut={valueOut.get(node.id) === true}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "in", scaleFactor).x}
                  y={getPortPos(node, "in", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in", "in");
                  }}
                  title={`${node.label}.in`}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title={`${node.label}.out`}
                />
              </>
            )}

            {node.type === NODE_TYPES.AND && (
              <>
                <SvgAND
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  activeOut={valueOut.get(node.id) === true}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "in0", scaleFactor).x}
                  y={getPortPos(node, "in0", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1", scaleFactor).x}
                  y={getPortPos(node, "in1", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title={`${node.label}.out`}
                />
              </>
            )}

            {node.type === NODE_TYPES.OR && (
              <>
                <SvgOR
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  activeOut={valueOut.get(node.id) === true}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "in0", scaleFactor).x}
                  y={getPortPos(node, "in0", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1", scaleFactor).x}
                  y={getPortPos(node, "in1", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title={`${node.label}.out`}
                />
              </>
            )}

            {node.type === NODE_TYPES.OUTPUT && (
              <>
                <SvgOutput
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  value={valueOut.get(node.id)}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "in", scaleFactor).x}
                  y={getPortPos(node, "in", scaleFactor).y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in", "in");
                  }}
                  title={`${node.label}.in`}
                />
              </>
            )}

            {node.type === NODE_TYPES.CONST && (
              <>
                <SvgConst
                  x={node.x}
                  y={node.y}
                  value={node.value ?? true}
                  scaleFactor={scaleFactor}
                />
                <Port
                  x={getPortPos(node, "out", scaleFactor).x}
                  y={getPortPos(node, "out", scaleFactor).y}
                  active={isSelectedOut}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "out", "out");
                  }}
                  title="CONST.out"
                />
              </>
            )}
          </g>
        );
      })}

      {/* Indicador visual del puerto seleccionado */}
      {selected && (
        <circle
          cx={getPortPos(
            nodes.find((n) => n.id === selected.nodeId) || nodes[0],
            selected.port,
            scaleFactor
          ).x}
          cy={getPortPos(
            nodes.find((n) => n.id === selected.nodeId) || nodes[0],
            selected.port,
            scaleFactor
          ).y}
          r={10}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
        />
      )}
    </svg>

    {/* Menú contextual */}
    <ContextMenu
      isOpen={contextMenu.isOpen}
      position={contextMenu.position}
      node={contextMenu.node}
      onClose={closeContextMenu}
      onRename={handleRenameNode}
      onDelete={handleDeleteNode}
    />
  </div>
  );
}
