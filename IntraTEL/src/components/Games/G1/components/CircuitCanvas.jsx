import React, { useState, useCallback } from 'react';
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
  mousePosition
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

  // Manejar inicio de arrastre
  const handleMouseDown = useCallback((e, node) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    setDragState({
      isDragging: true,
      nodeId: node.id,
      offset: {
        x: mouseX - node.x,
        y: mouseY - node.y
      }
    });
  }, []);

  // Manejar click derecho para mostrar menú contextual
  const handleContextMenu = useCallback((e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Solo mostrar menú para compuertas que se pueden modificar
    const canModify = node.isExtra || 
      node.type === NODE_TYPES.NAND || 
      node.type === NODE_TYPES.NOT || 
      node.type === NODE_TYPES.AND || 
      node.type === NODE_TYPES.OR || 
      node.type === NODE_TYPES.CONST;
    
    if (canModify) {
      setContextMenu({
        isOpen: true,
        position: { x: e.clientX, y: e.clientY },
        node: node
      });
    }
  }, []);

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

  // Manejar movimiento durante arrastre
  const handleMouseMove = useCallback((e) => {
    if (!dragState.isDragging) return;
    
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;
    
    // Límites del área de movimiento ajustados al área completa
    const newX = Math.max(30, Math.min(svgRect.width - 120, mouseX - dragState.offset.x));
    const newY = Math.max(30, Math.min(svgRect.height - 80, mouseY - dragState.offset.y));
    
    onMoveNode(dragState.nodeId, newX, newY);
  }, [dragState, onMoveNode]);

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
        top: 10,
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
          top: -25,
          left: 0,
          fontSize: '12px',
          color: '#64748b',
          fontWeight: '500'
        }}>
          Área de trabajo - Arrastra componentes aquí
        </div>
      </div>
      
      <svg 
        width="100%" 
        height="100%" 
        style={{ minWidth: 600, minHeight: 400, position: 'relative', zIndex: 2 }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
      {/* Conexiones permanentes (se dibujan primero, detrás de los nodos) */}
      {connections.map((connection) => {
        const fromNode = nodes.find((n) => n.id === connection.fromId);
        const toNode = nodes.find((n) => n.id === connection.toId);
        
        if (!fromNode || !toNode) return null;
        
        const startPos = getPortPos(fromNode, "out");
        const endPos = getPortPos(toNode, connection.toPort);
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

        // Renderizar según el tipo de nodo
        return (
          <g 
            key={node.id}
            style={{ 
              cursor: isBeingDragged ? 'grabbing' : 'grab',
              opacity: isBeingDragged ? 0.8 : 1 
            }}
            onMouseDown={(e) => handleMouseDown(e, node)}
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
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
                />
                <Port
                  x={getPortPos(node, "in0").x}
                  y={getPortPos(node, "in0").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1").x}
                  y={getPortPos(node, "in1").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
                />
                <Port
                  x={getPortPos(node, "in").x}
                  y={getPortPos(node, "in").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in", "in");
                  }}
                  title={`${node.label}.in`}
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
                />
                <Port
                  x={getPortPos(node, "in0").x}
                  y={getPortPos(node, "in0").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1").x}
                  y={getPortPos(node, "in1").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
                />
                <Port
                  x={getPortPos(node, "in0").x}
                  y={getPortPos(node, "in0").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in0", "in");
                  }}
                  title={`${node.label}.in0`}
                />
                <Port
                  x={getPortPos(node, "in1").x}
                  y={getPortPos(node, "in1").y}
                  active={isSelectedIn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(node, "in1", "in");
                  }}
                  title={`${node.label}.in1`}
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
                />
                <Port
                  x={getPortPos(node, "in").x}
                  y={getPortPos(node, "in").y}
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
                />
                <Port
                  x={getPortPos(node, "out").x}
                  y={getPortPos(node, "out").y}
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
            selected.port
          ).x}
          cy={getPortPos(
            nodes.find((n) => n.id === selected.nodeId) || nodes[0],
            selected.port
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
