import React from 'react';

/**
 * Componente NAND Gate - Puerta lógica NAND visual
 */
export function SvgNAND({ x, y, w = 90, h = 60, label = "NAND", activeOut }) {
  // Cuerpo tipo AND con burbuja de negación en la salida (NAND)
  const pathBody = `M ${x} ${y} h ${w * 0.55} c ${w * 0.25} 0, ${w * 0.25} ${h}, 0 ${h} h ${-w * 0.55} z`;
  const bubbleX = x + w * 0.8;
  const bubbleY = y + h / 2;
  const input1X = x;
  const input1Y = y + h * 0.3;
  const input2X = x;
  const input2Y = y + h * 0.7;
  const outX = x + w + 14;
  const outY = y + h / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida */}
      <line x1={bubbleX + 6} y1={outY} x2={outX + 8} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 8} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 8} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Cuerpo de la compuerta */}
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
        y={y + h / 2 + 4} 
        fontSize={10} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX + 8} 
        cy={outY} 
        r={3} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-background)"} 
        fillOpacity={activeOut ? 1.0 : 0.5}
        stroke="var(--theme-circuit-gate-border)" 
        strokeOpacity={0.6}
        strokeWidth={2} 
      />
    </g>
  );
}

/**
 * Componente Input Switch - Entrada con switch clickeable
 */
export function SvgInput({ x, y, w = 70, h = 36, label = "A", value, onToggle }) {
  const outX = x + w;
  const outY = y + h / 2;
  
  return (
    <g>
      {/* Nombre arriba */}
      <text 
        x={x + w / 2} 
        y={y - 8} 
        fontSize={12} 
        fill="var(--theme-text)"
        textAnchor="middle"
        fontWeight="600"
      >
        {label}
      </text>
      
      {/* Cable de salida */}
      <line x1={outX} y1={outY} x2={outX + 8} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cuerpo principal */}
      <rect 
        x={x} 
        y={y} 
        width={w} 
        height={h} 
        rx={10} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2}
        strokeDasharray="none"
      />
      
      {/* Indicador de elemento fijo */}
      <rect 
        x={x + 2} 
        y={y + 2} 
        width={6} 
        height={6} 
        rx={1}
        fill="var(--theme-primary)"
        opacity={0.7}
      />
      
      {/* Switch clickeable */}
      <g onClick={onToggle} style={{ cursor: "pointer" }}>
        <rect 
          x={x + 8} 
          y={y + 8} 
          width={w - 16} 
          height={h - 16} 
          rx={8} 
          fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        />
        <circle 
          cx={x + (value ? w - 12 : 12)} 
          cy={y + h / 2} 
          r={6} 
          fill="var(--theme-background)" 
        />
      </g>
      
      {/* Puerto de conexión */}
      <circle 
        cx={outX + 8} 
        cy={outY} 
        r={3} 
        fill="var(--theme-background)" 
        fillOpacity={0.5}
        stroke="var(--theme-circuit-gate-border)" 
        strokeOpacity={0.6}
        strokeWidth={2} 
      />
    </g>
  );
}

/**
 * Componente Output Display - Salida con indicador LED
 */
export function SvgOutput({ x, y, w = 80, h = 46, label = "Y", value }) {
  const inputX = x;
  const inputY = y + h / 2;
  
  return (
    <g>
      {/* Nombre arriba mostrando valor */}
      <text 
        x={x + w / 2} 
        y={y - 8} 
        fontSize={12} 
        fill="var(--theme-text)"
        textAnchor="middle"
        fontWeight="600"
      >
        {label}: {value ? "1" : "0"}
      </text>
      
      {/* Cable de entrada con punto de conexión */}
      <line x1={inputX - 8} y1={inputY} x2={inputX} y2={inputY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puerto de entrada */}
      <circle cx={inputX - 8} cy={inputY} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Cuerpo principal */}
      <rect 
        x={x} 
        y={y} 
        width={w} 
        height={h} 
        rx={10} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2}
        strokeDasharray="none"
      />
      
      {/* Indicador de elemento fijo */}
      <rect 
        x={x + w - 8} 
        y={y + 2} 
        width={6} 
        height={6} 
        rx={1}
        fill="var(--theme-primary)"
        opacity={0.7}
      />
      
      {/* LED Indicator */}
      <circle 
        cx={x + w / 2} 
        cy={y + h / 2} 
        r={12} 
        fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2}
      />
      <circle 
        cx={x + w / 2} 
        cy={y + h / 2} 
        r={8} 
        fill={value ? "var(--theme-accent)" : "var(--theme-background-secondary)"} 
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
  const inputX = x;
  const inputY = y + h / 2;
  const outX = x + w + 14;
  const outY = y + h / 2;

  return (
    <g>
      {/* Cable de entrada */}
      <line x1={inputX - 8} y1={inputY} x2={inputX} y2={inputY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida */}
      <line x1={bubbleX + 6} y1={outY} x2={outX + 8} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puerto de entrada */}
      <circle cx={inputX - 8} cy={inputY} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Cuerpo de la compuerta */}
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
      
      {/* Puerto de salida */}
      <circle 
        cx={outX + 8} 
        cy={outY} 
        r={3} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-background)"} 
        fillOpacity={activeOut ? 1.0 : 0.5}
        stroke="var(--theme-circuit-gate-border)" 
        strokeOpacity={0.6}
        strokeWidth={2} 
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
  const input1X = x;
  const input1Y = y + h * 0.3;
  const input2X = x;
  const input2Y = y + h * 0.7;
  const outX = x + w;
  const outY = y + h / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida */}
      <line x1={outX} y1={outY} x2={outX + 8} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 8} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 8} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Cuerpo de la compuerta */}
      <path 
        d={pathBody} 
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
      
      {/* Puerto de salida */}
      <circle 
        cx={outX + 8} 
        cy={outY} 
        r={3} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-background)"} 
        fillOpacity={activeOut ? 1.0 : 0.5}
        stroke="var(--theme-circuit-gate-border)" 
        strokeOpacity={0.6}
        strokeWidth={2} 
      />
    </g>
  );
}

/**
 * Componente OR Gate - Puerta lógica OR visual
 */
export function SvgOR({ x, y, w = 90, h = 60, label = "OR", activeOut }) {
  // Forma curva característica de OR como en la imagen 3
  const pathBody = `M ${x + 10} ${y} 
                   Q ${x + w * 0.7} ${y} ${x + w - 5} ${y + h * 0.5} 
                   Q ${x + w * 0.7} ${y + h} ${x + 10} ${y + h} 
                   Q ${x + w * 0.3} ${y + h * 0.5} ${x + 10} ${y} z`;
  
  const input1X = x;
  const input1Y = y + h * 0.3;
  const input2X = x;
  const input2Y = y + h * 0.7;
  const outX = x + w;
  const outY = y + h / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X + 5} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X + 5} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida */}
      <line x1={outX - 5} y1={outY} x2={outX + 8} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 8} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 8} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Cuerpo de la compuerta */}
      <path 
        d={pathBody} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      
      <text 
        x={x + w * 0.4} 
        y={y + h / 2 + 4} 
        fontSize={10} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX + 8} 
        cy={outY} 
        r={3} 
        fill={activeOut ? "var(--theme-circuit-wire-active)" : "var(--theme-background)"} 
        fillOpacity={activeOut ? 1.0 : 0.5}
        stroke="var(--theme-circuit-gate-border)" 
        strokeOpacity={0.6}
        strokeWidth={2} 
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
