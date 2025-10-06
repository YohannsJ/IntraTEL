import React from 'react';

/**
 * Componente NAND Gate - Puerta lógica NAND visual
 */
export function SvgNAND({ x, y, w = 85, h = 55, label = "NAND", activeOut, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Cuerpo tipo AND con burbuja de negación en la salida (NAND)
  const pathBody = `M ${x} ${y} h ${scaledW * 0.55} c ${scaledW * 0.25} 0, ${scaledW * 0.25} ${scaledH}, 0 ${scaledH} h ${-scaledW * 0.55} z`;
  const bubbleX = x + scaledW * 0.8;
  const bubbleY = y + scaledH / 2;
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 14;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 10} y1={input1Y} x2={input1X} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 10} y1={input2Y} x2={input2X} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde la burbuja hasta el puerto */}
      <line x1={bubbleX + 8} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 10} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 10} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
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
        r={8} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      
      <text 
        x={x + scaledW * 0.25} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
export function SvgInput({ x, y, w = 65, h = 35, label = "A", value, onToggle, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  const outX = x + scaledW;
  const outY = y + scaledH / 2;
  
  return (
    <g>
      {/* Nombre arriba */}
      <text 
        x={x + scaledW / 2} 
        y={y - 8} 
        fontSize={12 * scaleFactor} 
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
        width={scaledW} 
        height={scaledH} 
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
          width={scaledW - 16} 
          height={scaledH - 16} 
          rx={8} 
          fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        />
        <circle 
          cx={x + (value ? scaledW - 12 : 12)} 
          cy={y + scaledH / 2} 
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
export function SvgOutput({ x, y, w = 75, h = 45, label = "Y", value, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  const inputX = x;
  const inputY = y + scaledH / 2;
  
  return (
    <g>
      {/* Nombre arriba mostrando valor */}
      <text 
        x={x + scaledW / 2} 
        y={y - 8} 
        fontSize={12 * scaleFactor} 
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
        width={scaledW} 
        height={scaledH} 
        rx={10} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2}
        strokeDasharray="none"
      />
      
      {/* Indicador de elemento fijo */}
      <rect 
        x={x + scaledW - 8} 
        y={y + 2} 
        width={6} 
        height={6} 
        rx={1}
        fill="var(--theme-primary)"
        opacity={0.7}
      />
      
      {/* LED Indicator */}
      <circle 
        cx={x + scaledW / 2} 
        cy={y + scaledH / 2} 
        r={12 * scaleFactor} 
        fill={value ? "var(--theme-circuit-wire-active)" : "var(--theme-background-tertiary)"} 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2}
      />
      <circle 
        cx={x + scaledW / 2} 
        cy={y + scaledH / 2} 
        r={8 * scaleFactor} 
        fill={value ? "var(--theme-accent)" : "var(--theme-background-secondary)"} 
      />
    </g>
  );
}

/**
 * Componente NOT Gate - Puerta lógica NOT visual
 */
export function SvgNOT({ x, y, w = 75, h = 48, label = "NOT", activeOut, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Triángulo con punta hacia la derecha y burbuja de negación
  const points = `${x},${y} ${x},${y + scaledH} ${x + scaledW * 0.8},${y + scaledH/2}`;
  const bubbleX = x + scaledW * 0.8 + 6;
  const bubbleY = y + scaledH / 2;
  const inputX = x;
  const inputY = y + scaledH / 2;
  const outX = x + scaledW + 14;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cable de entrada */}
      <line x1={inputX - 8} y1={inputY} x2={inputX} y2={inputY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde la burbuja hasta el puerto */}
      <line x1={bubbleX + 6} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
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
        x={x + scaledW * 0.3} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
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
export function SvgAND({ x, y, w = 85, h = 55, label = "AND", activeOut, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Cuerpo tipo AND sin burbuja
  const pathBody = `M ${x} ${y} h ${scaledW * 0.6} c ${scaledW * 0.2} 0, ${scaledW * 0.2} ${scaledH}, 0 ${scaledH} h ${-scaledW * 0.6} z`;
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 8;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde el cuerpo hasta el puerto */}
      <line x1={x + scaledW * 0.8} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
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
        x={x + scaledW * 0.3} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
export function SvgOR({ x, y, w = 85, h = 55, label = "OR", activeOut, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Forma curva característica de OR como en la imagen 3
  const pathBody = `M ${x + 10} ${y} 
                   Q ${x + scaledW * 0.7} ${y} ${x + scaledW - 5} ${y + scaledH * 0.5} 
                   Q ${x + scaledW * 0.7} ${y + scaledH} ${x + 10} ${y + scaledH} 
                   Q ${x + scaledW * 0.3} ${y + scaledH * 0.5} ${x + 10} ${y} z`;
  
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 8;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X + 5} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X + 5} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde el cuerpo hasta el puerto */}
      <line x1={x + scaledW - 5} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
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
        x={x + scaledW * 0.4} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
export function SvgConst({ x, y, w = 55, h = 35, value = true, scaleFactor = 1 }) {
  // Usar directamente el factor de escala pasado como prop
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  
  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={scaledW} 
        height={scaledH} 
        rx={8} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      <text 
        x={x + scaledW / 2} 
        y={y + scaledH / 2 + 5} 
        fontSize={14 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {value ? "1" : "0"}
      </text>
    </g>
  );
}

/**
 * Componente NOR Gate - Puerta lógica NOR visual (OR con burbuja de negación)
 */
export function SvgNOR({ x, y, w = 85, h = 55, label = "NOR", activeOut, scaleFactor = 1 }) {
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Forma curva característica de OR con burbuja de negación
  const pathBody = `M ${x + 10} ${y} 
                   Q ${x + scaledW * 0.7} ${y} ${x + scaledW - 15} ${y + scaledH * 0.5} 
                   Q ${x + scaledW * 0.7} ${y + scaledH} ${x + 10} ${y + scaledH} 
                   Q ${x + scaledW * 0.3} ${y + scaledH * 0.5} ${x + 10} ${y} z`;
  
  const bubbleX = x + scaledW - 8;
  const bubbleY = y + scaledH / 2;
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 8;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X + 5} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X + 5} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde la burbuja hasta el puerto */}
      <line x1={bubbleX + 6} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
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
        x={x + scaledW * 0.3} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
 * Componente XOR Gate - Puerta lógica XOR visual
 */
export function SvgXOR({ x, y, w = 85, h = 55, label = "XOR", activeOut, scaleFactor = 1 }) {
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Forma característica de XOR con línea adicional
  const pathBody = `M ${x + 15} ${y} 
                   Q ${x + scaledW * 0.7} ${y} ${x + scaledW - 5} ${y + scaledH * 0.5} 
                   Q ${x + scaledW * 0.7} ${y + scaledH} ${x + 15} ${y + scaledH} 
                   Q ${x + scaledW * 0.35} ${y + scaledH * 0.5} ${x + 15} ${y} z`;
  
  // Línea adicional para XOR
  const pathExtraLine = `M ${x + 5} ${y + 5} Q ${x + scaledW * 0.25} ${y + scaledH * 0.5} ${x + 5} ${y + scaledH - 5}`;
  
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 8;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X + 10} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X + 10} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida */}
      <line x1={x + scaledW - 5} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 8} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 8} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Línea adicional para XOR */}
      <path 
        d={pathExtraLine} 
        fill="none" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      
      {/* Cuerpo de la compuerta */}
      <path 
        d={pathBody} 
        fill="var(--theme-circuit-gate)" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      
      <text 
        x={x + scaledW * 0.4} 
        y={y + scaledH / 2 + 4} 
        fontSize={10 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
 * Componente XNOR Gate - Puerta lógica XNOR visual (XOR con burbuja de negación)
 */
export function SvgXNOR({ x, y, w = 85, h = 55, label = "XNOR", activeOut, scaleFactor = 1 }) {
  const scaledW = w * scaleFactor;
  const scaledH = h * scaleFactor;
  // Forma característica de XOR con línea adicional y burbuja
  const pathBody = `M ${x + 15} ${y} 
                   Q ${x + scaledW * 0.7} ${y} ${x + scaledW - 15} ${y + scaledH * 0.5} 
                   Q ${x + scaledW * 0.7} ${y + scaledH} ${x + 15} ${y + scaledH} 
                   Q ${x + scaledW * 0.35} ${y + scaledH * 0.5} ${x + 15} ${y} z`;
  
  // Línea adicional para XOR
  const pathExtraLine = `M ${x + 5} ${y + 5} Q ${x + scaledW * 0.25} ${y + scaledH * 0.5} ${x + 5} ${y + scaledH - 5}`;
  
  const bubbleX = x + scaledW - 8;
  const bubbleY = y + scaledH / 2;
  const input1X = x;
  const input1Y = y + scaledH * 0.25;
  const input2X = x;
  const input2Y = y + scaledH * 0.75;
  const outX = x + scaledW + 8;
  const outY = y + scaledH / 2;

  return (
    <g>
      {/* Cables de entrada */}
      <line x1={input1X - 8} y1={input1Y} x2={input1X + 10} y2={input1Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      <line x1={input2X - 8} y1={input2Y} x2={input2X + 10} y2={input2Y} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Cable de salida - conecta desde la burbuja hasta el puerto */}
      <line x1={bubbleX + 6} y1={outY} x2={outX} y2={outY} stroke="var(--theme-circuit-gate-border)" strokeWidth={2} />
      
      {/* Puertos de entrada */}
      <circle cx={input1X - 8} cy={input1Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      <circle cx={input2X - 8} cy={input2Y} r={3} fill="var(--theme-background)" fillOpacity={0.5} stroke="var(--theme-circuit-gate-border)" strokeOpacity={0.6} strokeWidth={2} />
      
      {/* Línea adicional para XOR */}
      <path 
        d={pathExtraLine} 
        fill="none" 
        stroke="var(--theme-circuit-gate-border)" 
        strokeWidth={2} 
      />
      
      {/* Cuerpo de la compuerta */}
      <path 
        d={pathBody} 
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
        x={x + scaledW * 0.35} 
        y={y + scaledH / 2 + 4} 
        fontSize={9 * scaleFactor} 
        fill="var(--theme-text-secondary)" 
        textAnchor="middle"
      >
        {label}
      </text>
      
      {/* Puerto de salida */}
      <circle 
        cx={outX} 
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
