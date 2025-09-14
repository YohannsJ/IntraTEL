import * as React from "react";
import { useState } from "react";
import {
  TemploTelematica,
  DEFAULT_PILLAR_PALETTE,
  PillarState,
} from "../components/Pilar/PilarTelematica";

export default function HomeHero() {
  // Estado de los 5 pilares (0 = apagado, 1 = encendido)
  const [states, setStates] = useState<PillarState[]>([0, 0, 0, 0, 0]);

  const labels: [string, string, string, string, string] = [
    "TELECO",
    "REDES",
    "DATOS",
    "HARDWARE",
    "SOFTWARE",
  ];

  // Función para alternar un pilar al hacer click
  // Solo permite seleccionar TELECO si se completaron los 3 niveles
  const isTelecoUnlocked = typeof window !== 'undefined' && localStorage.getItem('teleco_completed') === 'true';
  const togglePillar = (index: number) => {
    // Si es TELECO y no está desbloqueado, no hacer nada
    if (index === 0 && !isTelecoUnlocked) {
      alert('Debes completar los 3 niveles del juego de espectro para desbloquear el pilar de TELECO.');
      return;
    }
    setStates((prev) => {
      const newStates = [...prev] as PillarState[];
      newStates[index] = Math.abs(newStates[index] - 1) as PillarState; // alterna entre ON y OFF
      return newStates;
    });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0f14] p-8">
      <TemploTelematica
        states={states as [PillarState, PillarState, PillarState, PillarState, PillarState]}
        labels={labels}
        pillarPalette={DEFAULT_PILLAR_PALETTE}
        roofPalette={DEFAULT_PILLAR_PALETTE}
        gap={48}
      />

      {/* Zona interactiva */}
      <div className="flex gap-6 mt-8">
        {labels.map((label, i) => {
          const isTeleco = i === 0;
          const disabled = isTeleco && !isTelecoUnlocked;
          return (
            <button
              key={i}
              onClick={() => togglePillar(i)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-300 ${
                states[i] === 1
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : disabled
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              disabled={disabled}
              title={disabled ? 'Completa los 3 niveles del juego de espectro para desbloquear TELECO' : ''}
            >
              {states[i] === 1 ? `${label} ✅` : `${label} ❌`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
