import * as React from "react";

/**
 * Biblioteca de componentes SVG para un "templo" con pilares desbloqueables.
 * - PilarTelematica: pilar individual con estado on/off y paleta configurable.
 * - TechoTelematico: frontón (techo) que cambia entre íntegro y en ruinas.
 * - TemploTelematica: layout alto nivel que decide el estado del techo según los 5 pilares.
 */

// ===================== Tipos & Paletas =====================
export type Hex = `#${string}`;

export type PillarState = 0 | 1; // 0 = bloqueado (apagado), 1 = desbloqueado (encendido)

export type PillarPalette = {
  primaryOn: Hex;   // contornos/detalles ON (azul oscuro)
  accentOn: Hex;    // cuerpo ON (beige)
  primaryOff: Hex;  // contornos/detalles OFF (gris/azul apagado)
  accentOff: Hex;   // cuerpo OFF (gris/beige apagado)
  labelColorOn?: Hex;
  labelColorOff?: Hex;
};

export const DEFAULT_PILLAR_PALETTE: PillarPalette = {
  primaryOn: "#0f3554",
  accentOn: "#e8dcc7",
  primaryOff: "#000000ff",
  accentOff: "#68655fff",
  labelColorOn: "#0f3554",
  labelColorOff: "#888787ff",
};

// ===================== Pilar =====================
export type PilarTelematicaProps = {
  width?: number | string;
  height?: number | string;
  /** Estado del pilar: 1 = encendido, 0 = apagado */
  state?: PillarState;
  /** Paleta de colores para on/off */
  palette?: PillarPalette;
  /** Texto del fuste */
  label?: string;
  fontSize?: number;
  verticalLabel?: boolean;
  /** Mostrar sombra */
  showShadow?: boolean;
  /** Radio para esquinas de las bases */
  radius?: number;
  /** id único opcional para no colisionar con defs */
  id?: string;
};

const PILLAR_DEFAULTS = {
  width: 220,
  height: 560,
  state: 0 as PillarState,
  palette: DEFAULT_PILLAR_PALETTE,
  fontSize: 18,
  verticalLabel: true,
  showShadow: true,
  radius: 6,
};

export function PilarTelematica(props: PilarTelematicaProps) {
  const cfg = { ...PILLAR_DEFAULTS, ...props };
  const pal = cfg.palette!;
  const on = cfg.state === 1;
  const primary = on ? pal.primaryOn : pal.primaryOff;
  const accent = on ? pal.accentOn : pal.accentOff;
  const labelColor = on ? pal.labelColorOn! : pal.labelColorOff!;
  const uid = cfg.id ?? React.useId();

  return (
    <svg
      role="img"
      aria-labelledby={`title-${uid} desc-${uid}`}
      width={cfg.width}
      height={cfg.height}
      viewBox="0 0 220 560"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={`title-${uid}`}>Pilar clásico — estado {on ? "desbloqueado" : "bloqueado"}</title>
      <desc id={`desc-${uid}`}>Pilar con basa, fuste acanalado y capitel, con colores según estado.</desc>

      <defs>
        {cfg.showShadow && (
          <filter id={`drop-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity={on ? 0.28 : 0.12} />
          </filter>
        )}
        <linearGradient id={`shaftGrad-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={accent} />
          <stop offset="55%" stopColor={accent} />
          <stop offset="100%" stopColor={shade(accent, on ? -8 : -18)} />
        </linearGradient>
      </defs>

      <g filter={cfg.showShadow ? `url(#drop-${uid})` : undefined}>
        {/* Base escalonada */}
        <rect x="20" y="500" width="180" height="28" rx={cfg.radius} fill={accent} />
        <rect x="32" y="476" width="156" height="22" rx={cfg.radius} fill={accent} />
        <rect x="46" y="458" width="128" height="14" rx={cfg.radius - 1} fill={accent} />

        {/* Fuste */}
        <rect x="62" y="160" width="96" height="300" rx="8" fill={`url(#shaftGrad-${uid})`} stroke={primary} strokeWidth="2" />

        {/* Acanaladuras */}
        {Array.from({ length: 10 }).map((_, i) => {
          const x = 67 + i * 9; // más flautas
          return (
            <rect
              key={i}
              x={x}
              y={170}
              width={3}
              height={280}
              rx={2}
              fill={shade(primary, 40)}
              opacity={on ? 0.22 : 0.12}
            />
          );
        })}

        {/* Capitel */}
        <rect x="50" y="142" width="120" height="12" rx="4" fill={accent} />
        <path
          d="M46 154 h128 c8 0 12 6 12 12 v6 c0 8-6 14-14 14 H48 c-8 0-14-6-14-14 v-6 c0-6 4-12 12-12 z"
          fill={accent}
        />
        <rect x="42" y="186" width="136" height="8" rx="4" fill={accent} />
        <rect x="40" y="200" width="140" height="6" rx="3" fill={primary} opacity={on ? 0.25 : 0.15} />

        {/* Texto */}
        {cfg.label && (
          <text
            x={cfg.verticalLabel ? 112 : 110}
            y={cfg.verticalLabel ? 495 : 440}
            textAnchor="middle"
            fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontWeight={700}
            fontSize={cfg.fontSize}
            fill={labelColor}
            // transform={cfg.verticalLabel ? "rotate(-90 112 310)" : undefined}
            style={{ letterSpacing: 1.5, opacity: on ? 1 : 0.65 }}
          >
            {cfg.label}
          </text>
        )}
      </g>
    </svg>
  );
}

// ===================== Techo =====================
export type TechoTelematicoProps = {
  width?: number | string;
  height?: number | string;
  /** true: íntegro con título; false: en ruinas sin título */
  intacto?: boolean;
  titulo?: string;
  palette?: PillarPalette;
  id?: string;
};

const ROOF_DEFAULTS = {
  width: 1100, // ancho total del techo
  height: 300, // altura total del techo
  intacto: false,
  titulo: "INGENIERÍA CIVIL TELEMÁTICA",
  palette: DEFAULT_PILLAR_PALETTE,
};

export function TechoTelematico(props: TechoTelematicoProps) {
  const cfg = { ...ROOF_DEFAULTS, ...props };
  const { intacto } = cfg;
  const pal = cfg.palette!;
  const primary = intacto ? pal.primaryOn : pal.primaryOff;
  const accent = intacto ? pal.accentOn : pal.accentOff;
  const labelColor = intacto ? pal.labelColorOn! : pal.labelColorOff!;
  const uid = cfg.id ?? React.useId();

  return (
    <svg
      width={cfg.width}
      height={cfg.height}
      viewBox="0 0 900 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={`roof-title-${uid}`}
    >
      <title id={`roof-title-${uid}`}>Frontón {intacto ? "íntegro" : "en ruinas"}</title>

      {/* Plinto */}
      <rect x="70" y="183" width="760" height="22" rx="6" fill={accent} />

      {/* Frontón */}
      {intacto ? (
        <g>
          <path d="M60 180 L450 30 L840 180 Z" fill={accent} stroke={primary} strokeWidth={4} />
          <text
            x={450}
            y={175}
            textAnchor="middle"
            fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontWeight={800}
            fontSize={34}
            fill={labelColor}
            style={{ letterSpacing: 2 }}
          >
            {cfg.titulo}
          </text>
        </g>
      ) : (
        // Versión "en ruinas": piezas faltantes y grietas
        <g>
          <path d="M60 180 L450 30 L840 180 Z" fill={accent} stroke={primary} strokeWidth={3} opacity={0.85} />
          {/* Muescas / faltantes */}
          <rect x="140" y="160" width="60" height="22" fill="#000" opacity="0.18" />
          <rect x="360" y="120" width="40" height="18" fill="#000" opacity="0.18" />
          <rect x="700" y="150" width="55" height="20" fill="#000" opacity="0.18" />
          {/* Grietas (líneas quebradas) */}
          <path d="M300 150 l15 -10 l-8 18 l20 -12 l-10 22" stroke={primary} strokeWidth={2} fill="none" opacity="0.6" />
          <path d="M600 120 l12 -8 l-6 14 l16 -10 l-9 20" stroke={primary} strokeWidth={2} fill="none" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}

// ===================== Templo (layout) =====================
export type TemploTelematicaProps = {
  /** estados para 5 pilares en orden: Teleco, Redes, Datos, Hardware, Software */
  states: [PillarState, PillarState, PillarState, PillarState, PillarState];
  labels?: [string, string, string, string, string];
  pillarPalette?: PillarPalette;
  roofPalette?: PillarPalette;
  width?: number | string;
  /** separación horizontal entre pilares */
  gap?: number;
};

export function TemploTelematica({
  states,
  labels = ["TELECO", "REDES", "DATOS", "HARDWARE", "SOFTWARE"],
  pillarPalette = DEFAULT_PILLAR_PALETTE,
  roofPalette = DEFAULT_PILLAR_PALETTE,
  width = "100%",
  gap = 40,
}: TemploTelematicaProps) {
  const allOn = states.every((s) => s === 1);

  return (
    <div style={{ width, display: "grid", placeItems: "center", gap: 8 }}>
      <TechoTelematico intacto={allOn} palette={roofPalette} />
      <div style={{ display: "flex", gap, alignItems: "flex-end" }}>
        {states.map((s, i) => (
          <PilarTelematica
            key={i}
            state={s}
            palette={pillarPalette}
            width={140}
            height={305}
            label={labels[i]}
          />
        ))}
      </div>
    </div>
  );
}

// ===================== Utils =====================
function shade(hex: string, percent: number) {
  const p = Math.max(-100, Math.min(100, percent)) / 100;
  const [r, g, b] = hex
    .replace('#', '')
    .match(/.{2}/g)!
    .map((h) => parseInt(h, 16));
  const t = p < 0 ? 0 : 255;
  const rn = Math.round((t - r) * Math.abs(p) + r);
  const gn = Math.round((t - g) * Math.abs(p) + g);
  const bn = Math.round((t - b) * Math.abs(p) + b);
  return `#${toHex(rn)}${toHex(gn)}${toHex(bn)}`;
}
function toHex(n: number) { return n.toString(16).padStart(2, '0'); }
