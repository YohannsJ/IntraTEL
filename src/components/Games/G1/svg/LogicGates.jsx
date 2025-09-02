import React from 'react';

/**
 * Componente NAND Gate - Puerta lógica NAND visual
 */
export function SvgNAND({ x, y, w = 90, h = 60, label = "NAND", activeOut }) {
  // Cuerpo tipo AND con burbuja de negación en la salida (NAND)
  const pathBody = `M ${x} ${y} h ${w * 0.55} c ${w * 0.25} 0, ${w * 0.25} ${h}, 0 ${h} h ${-w * 0.55} z`;
  const bubbleX = x + w * 0.8;
  const bubbleY = y + h / 2;
  const outX = x + w + 10;
  const outY = y + h / 2;

  return (
    <g>
      <path 
        d={pathBody} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      {/* Burbuja de negación separada del cuerpo */}
      <circle 
        cx={bubbleX} 
        cy={bubbleY} 
        r={6} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w * 0.25} 
        y={y + h / 2 + 5} 
        fontSize={11} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      {/* Indicador de salida (pequeño LED) */}
      <circle 
        cx={outX} 
        cy={outY} 
        r={4} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-circuit-wire-inactive)"} 
      />
    </g>
  );
}

/**
 * Componente Input Switch - Entrada con switch clickeable
 */
export function SvgInput({ x, y, w = 70, h = 36, label = "A", value, onToggle }) {
  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={w} 
        height={h} 
        rx={10} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + 12} 
        y={y + h / 2 + 5} 
        fontSize={14} 
        fill="var(--theme-text-secondary)"
      >
        {label}
      </text>
      {/* Switch clickeable */}
      <g onClick={onToggle} style={{ cursor: "pointer" }}>
        <rect 
          x={x + w - 46} 
          y={y + 8} 
          width={34} 
          height={h - 16} 
          rx={10} 
          fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        />
        <circle 
          cx={x + w - (value ? 14 : 34)} 
          cy={y + h / 2} 
          r={8} 
          fill="var(--theme-text)" 
        />
      </g>
    </g>
  );
}

/**
 * Componente Output Display - Salida con indicador LED
 */
export function SvgOutput({ x, y, w = 80, h = 46, label = "Y", value }) {
  const cx = x + w / 2;
  const cy = y + h / 2 - 4;

  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={w} 
        height={h} 
        rx={12} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w / 2} 
        y={y + h - 6} 
        fontSize={13} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}: {value === undefined ? "?" : value ? 1 : 0}
      </text>
      {/* LED indicator */}
      <circle 
        cx={cx} 
        cy={cy} 
        r={12} 
        fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        stroke="var(--theme-border-accent)" 
        strokeWidth={2} 
      />
    </g>
  );
}

/**
 * Componente NOT Gate - Puerta lógica NOT visual
 */
export function SvgNOT({ x, y, w = 80, h = 50, label = "NOT", activeOut }) {
  // Triángulo con punta hacia la derecha y burbuja de negación
  const points = `${x},${y} ${x},${y + h} ${x + w * 0.8},${y + h/2}`;
  const bubbleX = x + w * 0.8 + 6;
  const bubbleY = y + h / 2;
  const outX = x + w + 10;
  const outY = y + h / 2;

  return (
    <g>
      <polygon 
        points={points} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      {/* Burbuja de negación */}
      <circle 
        cx={bubbleX} 
        cy={bubbleY} 
        r={6} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w * 0.3} 
        y={y + h / 2 + 4} 
        fontSize={10} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      {/* Indicador de salida */}
      <circle 
        cx={outX} 
        cy={outY} 
        r={4} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-circuit-wire-inactive)"} 
      />
    </g>
  );
}

/**
 * Componente AND Gate - Puerta lógica AND visual
 */
export function SvgAND({ x, y, w = 90, h = 60, label = "AND", activeOut }) {
  // Cuerpo tipo AND sin burbuja
  const pathBody = `M ${x} ${y} h ${w * 0.6} c ${w * 0.2} 0, ${w * 0.2} ${h}, 0 ${h} h ${-w * 0.6} z`;
  const outX = x + w + 8;
  const outY = y + h / 2;

  return (
    <g>
      <path 
        d={pathBody} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w * 0.3} 
        y={y + h / 2 + 5} 
        fontSize={12} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      {/* Indicador de salida */}
      <circle 
        cx={outX} 
        cy={outY} 
        r={4} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-circuit-wire-inactive)"} 
      />
    </g>
  );
}

/**
 * Componente OR Gate - Puerta lógica OR visual
 */
export function SvgOR({ x, y, w = 90, h = 60, label = "OR", activeOut }) {
  // Forma curva característica de OR mejorada
  const pathBody = `M ${x} ${y + h * 0.15} Q ${x + w * 0.15} ${y} ${x + w * 0.6} ${y + h * 0.5} Q ${x + w * 0.15} ${y + h} ${x} ${y + h * 0.85} Q ${x + w * 0.25} ${y + h * 0.5} ${x} ${y + h * 0.15} z`;
  const outX = x + w + 8;
  const outY = y + h / 2;

  return (
    <g>
      <path 
        d={pathBody} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w * 0.3} 
        y={y + h / 2 + 5} 
        fontSize={12} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      {/* Indicador de salida */}
      <circle 
        cx={outX} 
        cy={outY} 
        r={4} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-circuit-wire-inactive)"} 
      />
    </g>
  );
}

/**
 * Componente Constant - Valor constante
 */
export function SvgConst({ x, y, w = 60, h = 36, value = true }) {
  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={w} 
        height={h} 
        rx={8} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + w / 2} 
        y={y + h / 2 + 5} 
        fontSize={14} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {value ? "1" : "0"}
      </text>
    </g>
  );
}
