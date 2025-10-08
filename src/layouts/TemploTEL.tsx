import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getApiUrl, getAuthHeaders } from "../config/environment";
import {
  TemploTelematica,
  DEFAULT_PILLAR_PALETTE,
  PillarState,
} from "../components/Pilar/PilarTelematica";
import WebPreview from "../components/etc/WebPreview";
import InstagramPreview from "../components/etc/InstagramPreview";

// Configuración de flags requeridas para desbloquear cada pilar
const PILLAR_REQUIREMENTS = {
  TELECO: [
    "D1FT3L{FREQUENCY_TUNER_2400MHZ_PRECISION}",      // Nivel 1
    "D1FT3L{BAND_DETECTIVE_5G_BLUETOOTH_MASTER}",     // Nivel 2
    // "D1FT3L{NYQUIST_ENGINEER_POWER_CALCULATOR}"       // Nivel 3
  ],
  REDES: [
    "D1ft3l{F1rst_St3p.Ph1s1c4l_L4y3r}",             // Conexión física
    "D1ft3l{S3c0nd-2do&3er_L4y3r}",                   // Configuración
    // "D1ft3l{F1n4l_St4g3.N3tw0rk-4Dm1n}"              // Ping
  ],
  DATOS: ["D1FT3L{G3ST10N_3XP3RT0_3N_R3D_PL4T4}",
    "D1FT3L{G3ST10N_4N4L1ST4_D3_R3D_BR0NC3}",
    "D1FT3L{G3ST10N_M43STR0_D3_R3D_0R0}"
  ], 
  HARDWARE: [
    "D1FT3L{N0T_G4T3_4M4T3UR}",                      // Nivel 1 NOT
    "D1FT3L{4ND_L0G1C_W1Z4RD}",                       // Nivel 2 AND
    // "D1FT3L{0R_G4T3_CH4MP10N}",                       // Nivel 3 OR
    // "D1FT3L{X0R_M4ST3R_H4CK3R}",                      // Nivel XOR
    // "D1FT3L{NAND_TOTAL_MASTER_4_DE_4}"                // Completado
  ],
  SOFTWARE: ["D1FT3L{CSS_BASICS_MASTERED}",
    "D1FT3L{LAYOUT_CENTERING_PRO}"
  ]
};

export default function HomeHero() {
  const { user, isAuthenticated } = useAuth();
  const [states, setStates] = useState<PillarState[]>([0, 0, 0, 0, 0]);
  const [userFlags, setUserFlags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockedPillars, setUnlockedPillars] = useState({
    TELECO: false,
    REDES: false,
    DATOS: false,
    HARDWARE: false,
    SOFTWARE: false
  });

  const labels: [string, string, string, string, string] = [
    "TELECO",
    "REDES",
    "DATOS",
    "HARDWARE",
    "SOFTWARE",
  ];

  // Cargar las flags del usuario
  useEffect(() => {
    const fetchUserFlags = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(getApiUrl('/flags/user'), {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const flagValues = data.data.map((flag: any) => flag.flag_value);
          setUserFlags(flagValues);
        }
      } catch (error) {
        console.error('Error loading user flags:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFlags();
  }, [isAuthenticated]);

  // Verificar qué pilares están desbloqueados
  useEffect(() => {
    const checkUnlocked = (requirements: string[]) => {
      if (requirements.length === 0) return true; // Sin requisitos = desbloqueado
      return requirements.every(req => userFlags.includes(req));
    };

    // Función especial para DATOS: se desbloquea con al menos 1 flag
    const checkUnlockedDatos = (requirements: string[]) => {
      if (requirements.length === 0) return true;
      return requirements.some(req => userFlags.includes(req));
    };

    const newUnlockedState = {
      TELECO: checkUnlocked(PILLAR_REQUIREMENTS.TELECO),
      REDES: checkUnlocked(PILLAR_REQUIREMENTS.REDES),
      DATOS: checkUnlockedDatos(PILLAR_REQUIREMENTS.DATOS),
      HARDWARE: checkUnlocked(PILLAR_REQUIREMENTS.HARDWARE),
      SOFTWARE: checkUnlocked(PILLAR_REQUIREMENTS.SOFTWARE)
    };

    setUnlockedPillars(newUnlockedState);

    // Auto-encender pilares desbloqueados, apagar los bloqueados
    setStates([
      newUnlockedState.TELECO ? 1 : 0,
      newUnlockedState.REDES ? 1 : 0,
      newUnlockedState.DATOS ? 1 : 0,
      newUnlockedState.HARDWARE ? 1 : 0,
      newUnlockedState.SOFTWARE ? 1 : 0
    ] as PillarState[]);
  }, [userFlags]);

  // Para usuarios no autenticados, mostrar todos los pilares apagados
  useEffect(() => {
    if (!isAuthenticated) {
      setStates([0, 0, 0, 0, 0] as PillarState[]);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#0a0f14", overflowX: "hidden" }}>
        {/* Layout de 3 columnas horizontal - Forzado con Flexbox */}
        <div style={{ 
          display: "flex", 
          flexDirection: "row", 
          height: "100vh",
          width: "100%",
          marginTop: "40px",
          // marginBottom: "20px"
        }}>
          
          {/* Columna Izquierda - Web Preview */}
          <div style={{
            width: "20%",
            display: "flex",
            alignItems: "center", 
            justifyContent: "center",
            background: "linear-gradient(to bottom, #0a0f14, #151a24)",
            borderRight: "1px solid #374151",
            minHeight: "0",
            overflow: "hidden"
          }}>
            <WebPreview 
              url="https://telematica.usm.cl/" 
              title="Telemática USM"
            />
          </div>

          {/* Columna Central - Templo */}
          <div className="flex flex-col items-center justify-center p-2 md:p-8 min-h-0 overflow-hidden" style={{ width: "60%" }}>
            <div 
              className="temple-container w-full flex items-center justify-center"
              style={{ 
                maxWidth: "100vw",
                overflow: "hidden",
                // marginBottom: "10px"
              }}
            >
              <div
                style={{
                  transform: "scale(var(--temple-scale, 1))",
                  transformOrigin: "center center",
                  transition: "transform 0.3s ease",
                  marginBottom: "20px"
                }}
              >
                <TemploTelematica
                  states={[0, 0, 0, 0, 0]}
                  labels={labels}
                  pillarPalette={DEFAULT_PILLAR_PALETTE}
                  roofPalette={DEFAULT_PILLAR_PALETTE}
                  gap={48}
                />
              </div>
            </div>
            <div className="mt-4 md:mt-8 text-center text-white max-w-2xl px-4">
              <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">🏛️ Templo de Telemática Destruido</h2>
              <p className="text-gray-400 text-sm md:text-lg mb-2">
                Los pila-res del conocimiento han caído en la oscuridad...
              </p>
              <p className="text-gray-500 text-xs md:text-base">
                Inicia sesión y completa los desafíos para restaurar cada pilar y reconstruir el templo
              </p>
            </div>
          </div>

          {/* Columna Derecha - Instagram Preview */}
          <div style={{
            width: "20%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(to bottom, #0a0f14, #151a24)",
            borderLeft: "1px solid #374151",
            minHeight: "0",
            overflow: "hidden"
          }}>
            <InstagramPreview username="telematicausm" />
          </div>
        </div>

        {/* Redes sociales y web móvil - Footer para usuarios no autenticados */}
        <footer className="md:hidden border-t border-gray-800 bg-gray-900 bg-opacity-50 backdrop-blur-sm p-6">
          <div className="max-w-md mx-auto">
            <h3 className="text-white font-bold text-center mb-4">Visita Telemática USM</h3>
            <div className="flex flex-col gap-4 mb-6">
              <a 
                href="https://telematica.usm.cl/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="text-xl">🌐</span>
                <span className="font-semibold">Página Web Telemática</span>
              </a>
              <a 
                href="https://www.instagram.com/telematicausm/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="text-xl">📱</span>
                <span className="font-semibold">Instagram @telematicausm</span>
              </a>
            </div>
          </div>
        </footer>

        {/* CSS para responsive scaling */}
        <style>{`
          .temple-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          
          @media (min-width: 768px) {
            .temple-container {
              --temple-scale: 0.8;
            }
          }
          @media (min-width: 1024px) {
            .temple-container {
              --temple-scale: 0.9;
            }
          }
          @media (min-width: 1280px) {
            .temple-container {
              --temple-scale: 1.0;
            }
          }
          @media (min-width: 1536px) {
            .temple-container {
              --temple-scale: 1.1;
            }
          }
          @media (max-width: 768px) {
            .temple-container {
              --temple-scale: 0.45;
            }
          }
          @media (max-width: 640px) {
            .temple-container {
              --temple-scale: 0.35;
            }
          }
          @media (max-width: 480px) {
            .temple-container {
              --temple-scale: 0.28;
            }
          }
          @media (max-width: 380px) {
            .temple-container {
              --temple-scale: 0.22;
            }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#0a0f14] p-8">
        <div className="text-white">Cargando tu progreso...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0f14", overflowX: "hidden" }}>
      {/* Layout de 3 columnas horizontal - Forzado con Flexbox */}
      <div style={{ 
        display: "flex", 
        flexDirection: "row", 
        height: "100vh",
        width: "100%"
      }}>
        
        {/* Columna Izquierda - Web Preview */}
        <div style={{
          width: "20%",
          display: "flex",
          alignItems: "center", 
          justifyContent: "center",
          // background: "linear-gradient(to bottom, #0a0f14, #151a24)",
          borderRight: "1px solid #374151",
          minHeight: "0",
          overflow: "hidden"
        }}>
          <WebPreview 
            url="https://telematica.usm.cl/" 
            title="Telemática USM"
          />
        </div>

        {/* Columna Central - Templo */}
        <div className="flex flex-col items-center justify-center p-2 md:p-4 lg:p-8 min-h-0 overflow-hidden" style={{ width: "60%" }}>
          <div 
            className="temple-container w-full flex items-center justify-center"
            style={{ 
              maxWidth: "100vw",
              overflow: "hidden",
              marginTop: "40px",
            }}
          >
            <div
              style={{
                transform: "scale(var(--temple-scale, 1))",
                transformOrigin: "center center",
                transition: "transform 0.3s ease"
              }}
            >
            <TemploTelematica
              states={states as [PillarState, PillarState, PillarState, PillarState, PillarState]}
              labels={labels}
              pillarPalette={DEFAULT_PILLAR_PALETTE}
              roofPalette={DEFAULT_PILLAR_PALETTE}
              gap={48}
            />
            
            {/* Indicadores de progreso - misma estructura que los pilares */}
            <div 
              style={{ 
                fontSize: "12px",
                display: "flex", 
                gap: "53px", 
                alignItems: "flex-start",
                marginTop: "-35px",
                marginLeft: "100px"
              }}
            >
              {labels.map((label, i) => {
                const isUnlocked = unlockedPillars[label as keyof typeof unlockedPillars];
                const requirements = PILLAR_REQUIREMENTS[label as keyof typeof PILLAR_REQUIREMENTS];
                const completedFlags = requirements.filter(req => userFlags.includes(req)).length;
                const totalFlags = requirements.length;

                // Solo mostrar progreso si hay requisitos y no está completado
                const showProgress = totalFlags > 0 && !isUnlocked;

                return (
                  <div 
                    key={i} 
                    style={{ 
                      width: "140px", // mismo ancho que cada pilar
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      marginBottom: "80px",
                    }}
                  >
                    {showProgress && (
                      <div className="text-center">
                        <span className="text-sm text-red-400 font-semibold">
                          {completedFlags}/{totalFlags} flags
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          </div>

          {/* Leyenda */}
          <div className="mt-4 md:mt-8 text-center text-gray-400 text-sm max-w-2xl mx-auto px-4">
            <p className="mb-2">Los pilares se encienden automáticamente al completar sus flags requeridas</p>
            <p className="text-xs text-gray-500">Completa desafíos en cada juego para restaurar el Templo de Telemática</p>
          </div>
        </div>

        {/* Columna Derecha - Instagram Preview */}
        <div style={{
          width: "20%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // background: "linear-gradient(to bottom, #0a0f14, #151a24)",
          borderLeft: "1px solid #374151",
          minHeight: "0",
          overflow: "hidden"
        }}>
          <InstagramPreview username="telematicausm" />
        </div>
      </div>

      {/* Redes sociales y web móvil - Footer */}
      <footer className="md:hidden border-t border-gray-800 bg-gray-900 bg-opacity-50 backdrop-blur-sm p-6">
        <div className="max-w-md mx-auto">
          <h3 className="text-white font-bold text-center mb-4">Visita Telemática USM</h3>
          <div className="flex flex-col gap-4 mb-6">
            <a 
              href="https://telematica.usm.cl/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-xl">🌐</span>
              <span className="font-semibold">Página Web Telemática</span>
            </a>
            <a 
              href="https://www.instagram.com/telematicausm/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <span className="text-xl">�</span>
              <span className="font-semibold">Instagram @telematicausm</span>
            </a>
          </div>
        </div>
      </footer>

      {/* CSS para responsive scaling */}
      <style>{`
        .temple-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        
        @media (min-width: 768px) {
          .temple-container {
            --temple-scale: 0.8;
          }
        }
        @media (min-width: 1024px) {
          .temple-container {
            --temple-scale: 0.9;
          }
        }
        @media (min-width: 1280px) {
          .temple-container {
            --temple-scale: 1.0;
          }
        }
        @media (min-width: 1536px) {
          .temple-container {
            --temple-scale: 1.1;
          }
        }
        @media (max-width: 768px) {
          .temple-container {
            --temple-scale: 0.45;
          }
        }
        @media (max-width: 640px) {
          .temple-container {
            --temple-scale: 0.35;
          }
        }
        @media (max-width: 480px) {
          .temple-container {
            --temple-scale: 0.28;
          }
        }
        @media (max-width: 380px) {
          .temple-container {
            --temple-scale: 0.22;
          }
        }
      `}</style>
    </div>
  );
}
