import React from 'react';

/**
 * Componente Puerto - Punto de conexión clickeable
 */
export function Port({ x, y, active, onClick, title }) {
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      <circle 
        cx={x} 
        cy={y} 
        r={7} 
        fill={active ? "var(--theme-circuit-port-active)" : "var(--theme-circuit-gate)"} 
        stroke="var(--theme-circuit-port)" 
        strokeWidth={2} 
      />
      <title>{title}</title>
    </g>
  );
}

/**
 * Componente Cable - Conexión visual entre puertos
 */
export function Wire({ id, x1, y1, x2, y2, value, onRemove, isTemporary = false }) {
  // Curva cúbica suave
  const dx = Math.max(40, Math.abs(x2 - x1) * 0.6);
  const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  
  // Color según el valor usando variables del tema
  let color;
  if (isTemporary) {
    color = "var(--theme-warning)";
  } else if (value === true) {
    color = "var(--theme-circuit-wire-active)";
  } else if (value === false) {
    color = "var(--theme-circuit-wire-inactive)";
  } else {
    color = "var(--theme-circuit-wire)";
  }

  return (
    <g>
      <path 
        d={path} 
        stroke={color} 
        strokeWidth={isTemporary ? 2 : 3} 
        fill="none"
        strokeDasharray={isTemporary ? "5,5" : "none"}
      />
      {/* Zona de click gruesa y transparente para borrar (solo para cables permanentes) */}
      {!isTemporary && (
        <path
          d={path}
          stroke="transparent"
          strokeWidth={14}
          fill="none"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.(id);
          }}
          style={{ cursor: "pointer" }}
        />
      )}
    </g>
  );
}
