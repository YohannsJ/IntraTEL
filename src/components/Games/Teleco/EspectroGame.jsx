import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiUrl, apiHeaders } from '../../../config/index.js';
import { useNavigate } from 'react-router-dom';
import Spectrogram from './Spectrogram.jsx';
import styles from './EspectroGame.module.css';

// Componente memoizado del Spectrogram para optimización
const MemoizedSpectrogram = React.memo(Spectrogram);

// Patrones de frecuencias para diferentes niveles (constante fuera del componente)
const FREQUENCY_PATTERNS = {
  1: { base: 2400, range: 50 },   // WiFi 2.4 GHz
  2: { base: 2450, range: 100 },  // Bluetooth + WiFi
  3: { base: 900, range: 200 },   // GSM 900
  4: { base: 1800, range: 300 },  // GSM 1800
  5: { base: 2100, range: 400 },  // UMTS
  6: { base: 800, range: 500 },   // LTE Band 20
  7: { base: 1900, range: 600 },  // PCS
  8: { base: 700, range: 700 },   // LTE Band 17
  9: { base: 2600, range: 800 },  // LTE Band 7
  10: { base: 3500, range: 1000 } // 5G
};

const EspectroGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    isPlaying: false,
    completed: false,
    currentFrequency: 0,
    targetFrequency: 2400, // MHz
    bandwidth: 10, // Inicia en 10 MHz
    signalPower: 10, // Inicia en 10 dBm
    noise: -90, // dBm
    snr: 0,
    spectrogramActive: true, // Controla si el espectrograma está activo
    startTime: null,
    attempts: 0,
    perfectStreak: 0,
  // patternMode y autoPattern eliminados porque no se usan
  });

  // Estados para logros y progreso
  const [achievements, setAchievements] = useState({
    firstWin: false,
    speedRunner: false, // Completar un nivel en menos de 30 segundos
    perfectTuning: false, // SNR >= 25 dB
    masterLevel1: false,
    masterLevel2: false,
    masterLevel3: false,
    completionist: false, // Completar los 3 niveles
    precisionExpert: false, // Acertar con error de frecuencia < 1 MHz
    efficiency: false, // Completar con menos de 3 intentos
    streakMaster: false, // 3 niveles seguidos sin error
  });

  const [showAchievements, setShowAchievements] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [gameProgress, setGameProgress] = useState({
    gamesPlayed: 0,
    totalScore: 0,
    bestTimes: { 1: null, 2: null, 3: null },
    completedLevels: [],
  });

  // Estados para modales mejorados
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [sessionAchievements, setSessionAchievements] = useState([]);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintData, setHintData] = useState('');

  // Cargar datos guardados
  useEffect(() => {
    const savedProgress = localStorage.getItem('telecoGameProgress');
    const savedAchievements = localStorage.getItem('telecoAchievements');
    
    if (savedProgress) {
      setGameProgress(JSON.parse(savedProgress));
    }
    
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    // Mostrar tutorial si es primera vez
    const hasSeenTutorial = localStorage.getItem('telecoTutorialSeen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    // Intentar cargar logros del servidor (en memoria) para recordarlos hasta reinicio
    (async () => {
      try {
        const res = await fetch(apiUrl('games/achievements/me'), { headers: apiHeaders(true) });
        if (res.ok) {
          const data = await res.json();
          const list = data?.data?.achievements;
          if (Array.isArray(list) && list.length > 0) {
            setAchievements(prev => {
              const next = { ...prev };
              list.forEach(k => { if (k in next) next[k] = true; });
              return next;
            });
          }
        }
      } catch {
        // ignorar si no hay sesión o endpoint no disponible
      }
    })();
  }, []);

  // Guardar progreso y logros
  const saveProgress = useCallback(() => {
    localStorage.setItem('telecoGameProgress', JSON.stringify(gameProgress));
    localStorage.setItem('telecoAchievements', JSON.stringify(achievements));
  }, [gameProgress, achievements]);

  // Guardar automáticamente cuando cambian el progreso o logros
  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  // Función para desbloquear logros
  const unlockAchievement = useCallback((achievementKey) => {
    if (!achievements[achievementKey]) {
      // Agregar a logros de la sesión
      setSessionAchievements(prev => [...prev, achievementKey]);
      
      setAchievements(prev => {
        const updated = { ...prev, [achievementKey]: true };
        setTimeout(() => {
          setNewAchievement(achievementKey);
          setTimeout(() => setNewAchievement(null), 3000);
        }, 500);
        return updated;
      });
    }
  }, [achievements]);

  // Enviar al servidor los logros actuales (se recuerdan hasta que se reinicie el servidor)
  const syncAchievementsToServer = useCallback(async () => {
    try {
      const keys = Object.entries(achievements)
        .filter((entry) => entry[1])
        .map((entry) => entry[0]);
      if (keys.length === 0) return;
      await fetch(apiUrl('games/achievements/me'), {
        method: 'POST',
        headers: apiHeaders(true),
        body: JSON.stringify({ achievements: keys })
      });
    } catch {
      // silencioso
    }
  }, [achievements]);

  // Sincronizar cuando se agregan logros en la sesión
  useEffect(() => {
    if (sessionAchievements.length > 0) {
      syncAchievementsToServer();
    }
  }, [sessionAchievements, syncAchievementsToServer]);

  // Generar nueva frecuencia objetivo basada en el nivel
  const generateTargetFrequency = useCallback((level) => {
    const pattern = FREQUENCY_PATTERNS[level] || FREQUENCY_PATTERNS[10];
    const minFreq = Math.max(300, pattern.base - pattern.range / 2);
    const maxFreq = Math.min(6000, pattern.base + pattern.range / 2);
    return minFreq + Math.random() * (maxFreq - minFreq);
  }, []);

  // Calcular SNR (Signal to Noise Ratio)
  useEffect(() => {
    const snr = gameState.signalPower - gameState.noise;
    setGameState(prev => ({ ...prev, snr }));
  }, [gameState.signalPower, gameState.noise]);

  // Actualizar la frecuencia objetivo global para el espectrograma
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__INTRATEL_TARGET_FREQ = gameState.targetFrequency;
    }
  }, [gameState.targetFrequency]);

  const startGame = () => {
    const newTargetFreq = generateTargetFrequency(gameState.level);
    // Limpiar espectrograma al iniciar el juego
    if (typeof window !== 'undefined' && window.__INTRATEL_CLEAR_SPECTROGRAM) {
      window.__INTRATEL_CLEAR_SPECTROGRAM();
    }
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
      targetFrequency: newTargetFreq,
      currentFrequency: Math.max(300, newTargetFreq - 100), // Empezar cerca pero no exacto
      attempts: 0,
    }));
    
    // Actualizar estadísticas de partidas jugadas
    setGameProgress(prev => ({
      ...prev,
      gamesPlayed: prev.gamesPlayed + 1
    }));
  };

  const startNextLevel = useCallback(() => {
    // No permitir avanzar más allá del nivel 3
    if (gameState.level >= 3) return;
    
    const newLevel = gameState.level + 1;
    
    const newTargetFreq = generateTargetFrequency(newLevel);
    // Limpiar espectrograma al cambiar de nivel
    if (typeof window !== 'undefined' && window.__INTRATEL_CLEAR_SPECTROGRAM) {
      window.__INTRATEL_CLEAR_SPECTROGRAM();
    }
    setGameState(prev => ({
      ...prev,
      level: newLevel,
      targetFrequency: newTargetFreq,
      currentFrequency: Math.max(300, newTargetFreq - 100),
      completed: false,
      isPlaying: true,
      bandwidth: 10, // Reinicia a 10
      signalPower: 10, // Reinicia a 10
      noise: prev.noise - 2, // Menos ruido = más fácil ver la señal
      startTime: Date.now(),
      attempts: 0,
    }));
  }, [gameState.level, generateTargetFrequency]);

  const adjustFrequency = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      currentFrequency: parseFloat(value)
    }));
  }, []);

  const adjustBandwidth = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      bandwidth: parseFloat(value)
    }));
  }, []);

  const adjustPower = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      signalPower: parseFloat(value)
    }));
  }, []);

  // Objetivos variables por nivel - generar una sola vez al inicio del juego
  const [randomPowers, setRandomPowers] = useState({1: 0, 2: 0, 3: 0});
  const [randomBandwidths, setRandomBandwidths] = useState({1: 20, 2: 20, 3: 18});
  
  // Generar valores aleatorios solo una vez al iniciar el juego o resetear
  const generateRandomValues = useCallback(() => {
    setRandomPowers({
      1: Math.round((Math.random() * 20 - 10)), // -10 a 10
      2: Math.round((Math.random() * 20 - 10)), // -10 a 10
      3: Math.round((Math.random() * 20 - 10))  // -10 a 10
    });
    setRandomBandwidths({
      1: Math.floor(Math.random() * 40) + 1, // 1-40 MHz
      2: Math.floor(Math.random() * 40) + 1, // 1-40 MHz
      3: Math.floor(Math.random() * 40) + 1  // 1-40 MHz
    });
  }, []);

  // Generar valores aleatorios solo al iniciar el juego
  useEffect(() => {
    generateRandomValues();
  }, [generateRandomValues]); // Solo al montar el componente

  const levelTargets = [
    { bandwidth: randomBandwidths[1], power: randomPowers[1] }, // Nivel 1: frecuencia, ancho de banda y potencia aleatoria
    { bandwidth: randomBandwidths[2], power: randomPowers[2] }, // Nivel 2: frecuencia, ancho de banda y potencia aleatoria
    { bandwidth: randomBandwidths[3], power: randomPowers[3] } // Nivel 3: frecuencia, ancho de banda y potencia aleatoria
  ];

  // Objetivos visibles para el nivel actual
  const currentTargets = useMemo(() => {
    const idx = Math.max(1, Math.min(3, gameState.level));
    return {
      bandwidth: randomBandwidths[idx],
      power: randomPowers[idx]
    };
  }, [gameState.level, randomBandwidths, randomPowers]);

  // Helpers de estado (color e icono) según cercanía al objetivo
  const statusFromDiff = useCallback((diff, tol) => {
    if (diff <= (tol * 0.25)) return { color: '#8ff38f', icon: '✅' }; // verde
    if (diff <= (tol * 0.75)) return { color: '#ffcc66', icon: '⚠️' }; // ámbar
    return { color: '#ff6b6b', icon: '❌' }; // rojo
  }, []);

  const frequencyStatus = useMemo(() => {
    const diff = Math.abs(gameState.currentFrequency - gameState.targetFrequency);
    const tol = Math.max(0.01, gameState.bandwidth / 2);
    return statusFromDiff(diff, tol);
  }, [gameState.currentFrequency, gameState.targetFrequency, gameState.bandwidth, statusFromDiff]);

  const bandwidthStatus = useMemo(() => {
    const diff = Math.abs(gameState.bandwidth - currentTargets.bandwidth);
    const tol = 3; // ±3 MHz como margen moderado
    return statusFromDiff(diff, tol);
  }, [gameState.bandwidth, currentTargets, statusFromDiff]);

  const powerStatus = useMemo(() => {
    const diff = Math.abs(gameState.signalPower - currentTargets.power);
    // Para potencia pedimos exacto (0), cercano (<=2), lejos (>2)
    if (diff === 0) return { color: '#8ff38f', icon: '✅' };
    if (diff <= 2) return { color: '#ffcc66', icon: '⚠️' };
    return { color: '#ff6b6b', icon: '❌' };
  }, [gameState.signalPower, currentTargets]);

  // Determinar estado de acierto/error para feedback visual

  const checkTuning = () => {
    const { currentFrequency, targetFrequency, bandwidth, snr, signalPower, level, startTime, attempts } = gameState;
    const frequencyError = Math.abs(currentFrequency - targetFrequency);
    const t = levelTargets[(level - 1) % levelTargets.length];
    const bandwidthTarget = t.bandwidth;
    const powerTarget = t.power;
    const inBand = frequencyError <= bandwidth / 2;
    const goodBandwidth = Math.abs(bandwidth - bandwidthTarget) <= 2;
    const goodPower = signalPower === powerTarget;
    const goodSignal = snr >= 20;

    // Incrementar intentos
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));

    if (inBand && goodBandwidth && goodPower && goodSignal) {
      const completionTime = (Date.now() - startTime) / 1000; // segundos
      const score = Math.max(0, 100 - frequencyError * 2);
      
      // Actualizar estadísticas
      setGameProgress(prev => ({
        ...prev,
        totalScore: prev.totalScore + score,
        completedLevels: [...new Set([...prev.completedLevels, level])],
        bestTimes: {
          ...prev.bestTimes,
          [level]: prev.bestTimes[level] ? Math.min(prev.bestTimes[level], completionTime) : completionTime
        }
      }));

      // Verificar y desbloquear logros
      if (!achievements.firstWin) {
        unlockAchievement('firstWin');
      }
      
      if (completionTime < 30) {
        unlockAchievement('speedRunner');
      }
      
      if (snr >= 25) {
        unlockAchievement('perfectTuning');
      }
      
      if (frequencyError < 1) {
        unlockAchievement('precisionExpert');
      }
      
      if (attempts < 3) {
        unlockAchievement('efficiency');
      }
      
      // Logros por nivel
      if (level === 1) unlockAchievement('masterLevel1');
      if (level === 2) unlockAchievement('masterLevel2');
      if (level === 3) unlockAchievement('masterLevel3');

      setGameState(prev => ({
        ...prev,
        score: prev.score + score,
        completed: true,
        perfectStreak: prev.perfectStreak + 1
      }));

      // Crear partículas de éxito
      createSuccessParticles();

      setTimeout(() => {
        if (level === 3) {
          unlockAchievement('completionist');
          if (gameState.perfectStreak >= 3) {
            unlockAchievement('streakMaster');
          }
          
          // Guardar progreso en localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('teleco_completed', 'true');
          }
          
          // Mostrar modal de completación con todos los logros
          setModalData({
            level,
            targetFrequency,
            bandwidthTarget,
            powerTarget,
            score,
            completionTime,
            flag: `FLAG{SPECTRUM_MASTER_L${level}}`,
            isGameComplete: true,
            sessionAchievements: sessionAchievements.length > 0 ? sessionAchievements : []
          });
          setShowCompletionModal(true);

          // Sincronizar logros actuales al servidor
          syncAchievementsToServer();
        } else {
          // Mostrar modal de éxito del nivel
          setModalData({
            level,
            targetFrequency,
            bandwidthTarget,
            powerTarget,
            score,
            completionTime,
            flag: `FLAG{SPECTRUM_MASTER_L${level}}`,
            isGameComplete: false
          });
          setShowSuccessModal(true);
        }
      }, 100);
    } else {
      // Resetear racha perfecta
      setGameState(prev => ({
        ...prev,
        perfectStreak: 0
      }));
      
      let hints = [];
      if (!inBand) hints.push({
        icon: '🎯',
        title: 'Ajustar Frecuencia',
        message: `Objetivo: ${targetFrequency.toFixed(1)} MHz (±${bandwidth/2} MHz)`,
        current: `Actual: ${currentFrequency.toFixed(1)} MHz`
      });
      if (!goodBandwidth && bandwidthTarget !== null) {
        hints.push({
          icon: '📶',
          title: 'Ajustar Ancho de Banda',
          message: `Objetivo: ${bandwidthTarget} MHz`,
          current: `Actual: ${bandwidth} MHz`
        });
      }
      if (!goodPower) hints.push({
        icon: '⚡',
        title: 'Ajustar Potencia',
        message: `Objetivo: ${powerTarget} dBm`,
        current: `Actual: ${signalPower} dBm`
      });
      if (!goodSignal) hints.push({
        icon: '📡',
        title: 'Mejorar SNR',
        message: `Necesitas: ≥20 dB`,
        current: `Actual: ${snr.toFixed(1)} dB`
      });
      
      setHintData(hints);
      setShowHintModal(true);
    }
  };

  const toggleSpectrogram = () => {
    setGameState(prev => ({
      ...prev,
      spectrogramActive: !prev.spectrogramActive
    }));
  };

  // Código de patrón automático eliminado porque no se usa



  // Función para crear partículas de éxito
  const createSuccessParticles = useCallback(() => {
    const container = document.querySelector(`.${styles.gameContainer}`);
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = styles.particle;
      particle.style.left = Math.random() * container.offsetWidth + 'px';
      particle.style.top = Math.random() * container.offsetHeight + 'px';
      particle.style.animationDelay = (Math.random() * 0.5) + 's';
      container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 2000);
    }
  }, []);

  // Tutorial steps
  const tutorialSteps = [
    {
      title: "¡Bienvenido al Juego del Espectro!",
      content: "Aprende a sintonizar frecuencias como un profesional. Tu objetivo es ajustar los parámetros de la señal para cumplir con los objetivos.",
      target: null
    },
    {
      title: "Controles de Frecuencia",
      content: "Usa este control para ajustar la frecuencia de tu señal. Debes acercarte a la frecuencia objetivo.",
      target: ".control:first-child"
    },
    {
      title: "Ancho de Banda",
      content: "El ancho de banda determina el rango de frecuencias de tu señal. Ajústalo según el objetivo del nivel.",
      target: ".control:nth-child(2)"
    },
    {
      title: "Potencia de Señal",
      content: "La potencia afecta la intensidad de tu señal y el SNR. Ajústala al valor requerido.",
      target: ".control:nth-child(3)"
    },
    {
      title: "Verificar Sintonización",
      content: "Cuando creas que tienes los parámetros correctos, presiona este botón para verificar.",
      target: ".checkButton"
    }
  ];

  const nextTutorialStep = useCallback(() => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    } else {
      setShowTutorial(false);
      localStorage.setItem('telecoTutorialSeen', 'true');
    }
  }, [tutorialStep, tutorialSteps.length]);

  const skipTutorial = useCallback(() => {
    setShowTutorial(false);
    localStorage.setItem('telecoTutorialSeen', 'true');
  }, []);

  // Funciones para manejar modales
  const handleSuccessModalContinue = useCallback(() => {
    setShowSuccessModal(false);
    startNextLevel();
  }, [startNextLevel]);

  const handleSuccessModalExit = useCallback(() => {
    setShowSuccessModal(false);
    // Volver al menú principal o mantener en el nivel actual
  }, []);

  const handleCompletionModalFinish = useCallback(() => {
    setShowCompletionModal(false);
    saveProgress();
    navigate('/templo', { state: { pilar: 'TELECO' } });
  }, [saveProgress, navigate]);

  const closeHintModal = useCallback(() => {
    setShowHintModal(false);
  }, []);

  const resetGame = () => {
    // Generar nuevos valores aleatorios
    generateRandomValues();
    
    setGameState({
      level: 1,
      score: 0,
      isPlaying: false,
      completed: false,
      currentFrequency: 0,
      targetFrequency: 2400,
      bandwidth: 10,
      signalPower: 10,
      noise: -90,
      snr: 0,
      spectrogramActive: true,
      startTime: null,
      attempts: 0,
      perfectStreak: 0,
    });

    // Limpiar logros de sesión
    setSessionAchievements([]);
  };

  // Valores memoizados para optimización
  const spectrogramFrequencyRange = useMemo(() => [600, 3000], []);
  
  // Definición de logros con metadata (memoizada)
  const achievementMeta = useMemo(() => ({
    firstWin: { icon: "🎉", title: "Primera Victoria", description: "¡Completaste tu primer nivel!" },
    speedRunner: { icon: "⚡", title: "Velocista", description: "Completaste un nivel en menos de 30 segundos" },
    perfectTuning: { icon: "🎯", title: "Sintonización Perfecta", description: "Alcanzaste un SNR ≥ 25 dB" },
    masterLevel1: { icon: "🥉", title: "Maestro Nivel 1", description: "Dominaste el WiFi 2.4 GHz" },
    masterLevel2: { icon: "🥈", title: "Maestro Nivel 2", description: "Dominaste Bluetooth + WiFi" },
    masterLevel3: { icon: "🥇", title: "Maestro Nivel 3", description: "Dominaste GSM 900" },
    completionist: { icon: "🏆", title: "Completista", description: "¡Completaste todos los niveles!" },
    precisionExpert: { icon: "🔬", title: "Experto en Precisión", description: "Error de frecuencia < 1 MHz" },
    efficiency: { icon: "🎨", title: "Eficiencia", description: "Completaste con menos de 3 intentos" },
    streakMaster: { icon: "🔥", title: "Racha Perfecta", description: "3 niveles seguidos sin error" },
  }), []);

  return (
    <div className={styles.gameContainer}>
      {/* Panel de logros */}
      <div className={`${styles.achievementsPanel} ${showAchievements ? styles.show : ''}`}>
        <h3>🏆 Logros</h3>
        <button 
          onClick={() => setShowAchievements(!showAchievements)}
          className={styles.toggleButton}
        >
          {showAchievements ? 'Ocultar' : 'Mostrar'} Logros
        </button>
        {showAchievements && (
          <div>
            {Object.entries(achievementMeta).map(([key, meta]) => (
              <div 
                key={key}
                className={`${styles.achievementItem} ${achievements[key] ? styles.unlocked : ''}`}
              >
                <span style={{ fontSize: '1.5rem' }}>{meta.icon}</span>
                <div>
                  <strong>{meta.title}</strong>
                  <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                    {meta.description}
                  </p>
                </div>
                {achievements[key] && <span style={{ color: '#4ade80', fontSize: '1.2rem' }}>✓</span>}
              </div>
            ))}
            
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#22d3ee' }}>📊 Estadísticas</h4>
              <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                Partidas jugadas: <strong>{gameProgress.gamesPlayed}</strong>
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                Puntuación total: <strong>{gameProgress.totalScore.toFixed(0)}</strong>
              </p>
              <p style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                Niveles completados: <strong>{gameProgress.completedLevels.length}/3</strong>
              </p>
              {Object.entries(gameProgress.bestTimes).map(([level, time]) => (
                time && (
                  <p key={level} style={{ margin: '5px 0', fontSize: '0.9rem' }}>
                    Mejor tiempo L{level}: <strong>{time.toFixed(1)}s</strong>
                  </p>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notificación de nuevo logro */}
      {newAchievement && (
        <div className={`${styles.achievementNotification}`} style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(45deg, #4ade80, #22d3ee)',
          color: '#000',
          padding: '15px 25px',
          borderRadius: '15px',
          zIndex: 1002,
          animation: `${styles.achievementPulse} 0.6s ease`,
        }}>
          <strong>🎉 ¡Nuevo Logro!</strong><br/>
          {achievementMeta[newAchievement]?.icon} {achievementMeta[newAchievement]?.title}
        </div>
      )}

      {/* Tutorial */}
      {showTutorial && (
        <div className={styles.tutorial} style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1003,
        }}>
          <h3>{tutorialSteps[tutorialStep]?.title}</h3>
          <p>{tutorialSteps[tutorialStep]?.content}</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button onClick={nextTutorialStep} className={styles.checkButton}>
              {tutorialStep < tutorialSteps.length - 1 ? 'Siguiente' : 'Entendido'}
            </button>
            <button onClick={skipTutorial} className={styles.resetButton}>
              Saltar Tutorial
            </button>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${((tutorialStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>
      )}



      {/* Modal de éxito de nivel */}
      {showSuccessModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setShowSuccessModal(false)}>
          <div className={styles.successModal}>
            <h2 className={styles.modalTitle}>🎉 ¡Nivel Completado!</h2>
            <div className={styles.modalContent}>
              <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                ¡Excelente sintonización! Has dominado este nivel.
              </p>
              
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h4>📡 Frecuencia</h4>
                  <p>{modalData.targetFrequency?.toFixed(1)} MHz</p>
                </div>
                <div className={styles.statCard}>
                  <h4>📶 Ancho de Banda</h4>
                  <p>{modalData.bandwidthTarget} MHz</p>
                </div>
                <div className={styles.statCard}>
                  <h4>⚡ Potencia</h4>
                  <p>{modalData.powerTarget} dBm</p>
                </div>
                <div className={styles.statCard}>
                  <h4>⏱️ Tiempo</h4>
                  <p>{modalData.completionTime?.toFixed(1)}s</p>
                </div>
              </div>

              <div className={styles.flagDisplay}>
                {modalData.flag}
              </div>

              <p style={{ fontSize: '1rem', color: '#22d3ee', marginBottom: '20px' }}>
                Puntuación obtenida: <strong>{modalData.score?.toFixed(0)} puntos</strong>
              </p>

              <div className={styles.modalButtons}>
                {(modalData.level || 1) < 3 ? (
                  <>
                    <button 
                      className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                      onClick={handleSuccessModalContinue}
                    >
                      Continuar al Nivel {(modalData.level || 1) + 1}
                    </button>
                    <button 
                      className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                      onClick={handleSuccessModalExit}
                    >
                      Mantener Nivel
                    </button>
                  </>
                ) : (
                  <button 
                    className={`${styles.modalButton} ${styles.modalButtonSecondary}`}
                    onClick={handleSuccessModalExit}
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de completación del juego */}
      {showCompletionModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.completionModal}>
            <h2 className={styles.modalTitle}>🏆 ¡JUEGO COMPLETADO!</h2>
            <div className={styles.modalContent}>
              <p style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#ffd700' }}>
                ¡Felicidades! Has dominado completamente el espectro electromagnético
              </p>
              
              <div className={styles.flagDisplay}>
                {modalData.flag}
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <h4>🎯 Puntuación Final</h4>
                  <p>{gameProgress.totalScore.toFixed(0)}</p>
                </div>
                <div className={styles.statCard}>
                  <h4>🎮 Partidas Jugadas</h4>
                  <p>{gameProgress.gamesPlayed}</p>
                </div>
                <div className={styles.statCard}>
                  <h4>⚡ Mejor Tiempo</h4>
                  <p>
                    {Object.values(gameProgress.bestTimes).filter(Boolean).length > 0 
                      ? `${Math.min(...Object.values(gameProgress.bestTimes).filter(Boolean)).toFixed(1)}s`
                      : 'N/A'
                    }
                  </p>
                </div>
                <div className={styles.statCard}>
                  <h4>🏆 Logros</h4>
                  <p>{Object.values(achievements).filter(Boolean).length}/10</p>
                </div>
              </div>

              {sessionAchievements.length > 0 && (
                <div>
                  <h3 style={{ color: '#4ade80', marginBottom: '15px' }}>
                    🏅 Logros Obtenidos en esta Sesión
                  </h3>
                  <div className={styles.achievementsList}>
                    {sessionAchievements.map((achievementKey, index) => (
                      <div key={index} className={styles.achievementItem2}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {achievementMeta[achievementKey]?.icon}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                          <strong>{achievementMeta[achievementKey]?.title}</strong>
                          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.8 }}>
                            {achievementMeta[achievementKey]?.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalButtons}>
                <button 
                  className={`${styles.modalButton} ${styles.modalButtonPrimary}`}
                  onClick={handleCompletionModalFinish}
                >
                  🚀 Ir al Templo TELECO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de pistas */}
      {showHintModal && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && closeHintModal()}>
          <div className={styles.hintModal}>
            <h3 style={{ color: '#ff6b6b', marginBottom: '20px', textAlign: 'center' }}>
              💡 Pistas para Mejorar
            </h3>
            <div>
              {Array.isArray(hintData) && hintData.map((hint, index) => (
                <div key={index} className={styles.hintItem}>
                  <div className={styles.hintIcon}>{hint.icon}</div>
                  <div className={styles.hintContent}>
                    <h4>{hint.title}</h4>
                    <p>{hint.message}</p>
                    <p className={styles.current}>{hint.current}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.modalButtons}>
              <button 
                className={`${styles.modalButton} ${styles.modalButtonDanger}`}
                onClick={closeHintModal}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.header}>
        <h1>🎯 Juego del Espectro Electromagnético</h1>
        <p>Sintoniza la frecuencia correcta y optimiza la señal</p>
      </div>

      <div className={styles.gameStats}>
        <div className={styles.stat}>
          <label>Nivel:</label>
          <span>{gameState.level}</span>
        </div>
        <div className={styles.stat}>
          <label>Puntuación:</label>
          <span>{gameState.score.toFixed(0)}</span>
        </div>
        <div className={styles.stat}>
          <label>SNR:</label>
          <span className={gameState.snr >= 20 ? styles.good : styles.bad}>
            {gameState.snr.toFixed(1)} dB
          </span>
        </div>
        <div className={styles.stat}>
          <label>Logros:</label>
          <span>{Object.values(achievements).filter(Boolean).length}/10</span>
          <button 
            onClick={() => setShowAchievements(!showAchievements)}
            style={{
              marginTop: '5px',
              padding: '5px 10px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '5px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            {showAchievements ? '📖' : '🏆'}
          </button>
        </div>
        <div className={styles.stat}>
          <label>Racha:</label>
          <span className={gameState.perfectStreak > 0 ? styles.good : ''}>
            {gameState.perfectStreak} 🔥
          </span>
        </div>
      </div>

      {!gameState.isPlaying ? (
        <div className={styles.startScreen}>
          <button className={styles.startButton} onClick={startGame}>
            🚀 Iniciar Juego
          </button>
          <p className={styles.instructions}>
            Tu objetivo es sintonizar la frecuencia de 2.4 GHz y mantener una buena calidad de señal
          </p>
        </div>
      ) : (
        <div className={styles.gameArea}>
          <div className={styles.targetInfo}>
            <h3 style={{marginBottom: 6}}>🎯 Objetivos:</h3>
            <div style={{display:'flex', gap:'1.5rem', justifyContent:'center', alignItems:'center', marginTop: '2px', marginBottom: '4px'}}>
              <span style={{color:'#e6f2ff', fontWeight:600}}>📡 Frecuencia: <span style={{color:'#9af59a'}}>{gameState.targetFrequency.toFixed(2)} MHz</span></span>
              <span style={{color:'#e6f2ff', fontWeight:600}}>📶 Ancho objetivo: <span style={{color:'#9af59a'}}>{currentTargets.bandwidth} MHz</span></span>
            </div>
            <div style={{textAlign:'center', color:'#e6f2ff', fontWeight:600, marginBottom:'8px'}}>
              ⚡ Potencia objetivo: <span style={{color:'#9af59a'}}>{currentTargets.power} dBm</span>
            </div>
            {/* Objetivos del nivel actual */}
            <div className={styles.control}>
              <label>🎛️ Frecuencia (MHz):</label>
              <input
                type="range"
                min={600}
                max={3000}
                step="0.01"
                value={gameState.currentFrequency}
                onChange={(e) => adjustFrequency(e.target.value)}
                className={styles.slider}
              />
              <span className={styles.value} style={{ color: frequencyStatus.color }}>{frequencyStatus.icon} {parseFloat(gameState.currentFrequency).toFixed(2)} MHz</span>
            </div>

            <div className={styles.control}>
              <label>📶 Ancho de Banda (MHz):</label>
              <input
                type="range"
                min={1}
                max={40}
                step={1}
                value={gameState.bandwidth}
                onChange={(e) => adjustBandwidth(e.target.value)}
                className={styles.slider}
              />
              <span className={styles.value} style={{ color: bandwidthStatus.color }}>{bandwidthStatus.icon} {gameState.bandwidth} MHz</span>
            </div>

            <div className={styles.control}>
              <label>⚡ Potencia de Señal (dBm):</label>
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                value={gameState.signalPower}
                onChange={(e) => adjustPower(e.target.value)}
                className={styles.slider}
              />
              <span className={styles.value} style={{ color: powerStatus.color }}>{powerStatus.icon} {gameState.signalPower} dBm</span>
            </div>
          </div>

          <div className={styles.spectrum}>
            <h4>📊 Analizador de Espectro</h4>
            <div className={styles.spectrumDisplay}>
              <div 
                className={styles.signal}
                style={{
                  left: `${((gameState.currentFrequency - 600) / (3000 - 600)) * 100}%`,
                  width: `${(gameState.bandwidth / (3000 - 600)) * 100}%`,
                  height: `${Math.max(10, (gameState.signalPower + 100) * 0.8)}%`
                }}
              />
              <div 
                className={styles.target}
                style={{
                  left: `${((gameState.targetFrequency - 600) / (3000 - 600)) * 100}%`
                }}
              />
            </div>
            <div className={styles.frequencyLabels}>
              <span>600</span>
              <span>1200</span>
              <span>1800</span>
              <span>2400</span>
              <span>3000 MHz</span>
            </div>
          </div>

          {/* Espectrograma + círculo de feedback */}
          <div className={styles.spectrogramSection} style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
            <div style={{flex: 1}}>
              <div className={styles.spectrogramControls}>
                <button 
                  className={styles.toggleButton}
                  onClick={toggleSpectrogram}
                >
                  {gameState.spectrogramActive ? '⏸️ Pausar' : '▶️ Activar'} Espectrograma
                </button>
              </div>
              <MemoizedSpectrogram 
                signalFrequency={gameState.currentFrequency}
                signalPower={gameState.signalPower}
                noise={gameState.noise}
                bandwidth={gameState.bandwidth}
                isActive={gameState.spectrogramActive && gameState.isPlaying}
                timeWindow={15}
                frequencyRange={spectrogramFrequencyRange}
                // tuningStatus y detectionColor eliminados porque no se usan
              />
            </div>
            {/* Círculo de feedback visual */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              {(() => {
                const t = levelTargets[(gameState.level - 1) % levelTargets.length];
                const frequencyError = Math.abs(gameState.currentFrequency - gameState.targetFrequency);
                const inBand = frequencyError <= gameState.bandwidth / 2;
                const goodBandwidth = Math.abs(gameState.bandwidth - t.bandwidth) <= 2;
                const goodPower = Math.abs(gameState.signalPower - t.power) <= 2;
                const goodSignal = gameState.snr >= 20;
                
                let color = '#aaa';
                let icon = '⚪';
                let status = 'Sin ajustar';
                
                if (inBand && goodBandwidth && goodPower && goodSignal) {
                  color = '#2ecc40';
                  icon = '✅';
                  status = '¡Perfecto!';
                } else if (gameState.bandwidth > 0 || gameState.signalPower !== 0) {
                  color = '#ff4136';
                  icon = '❌';
                  status = 'Necesita ajuste';
                }
                
                return (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      background: `radial-gradient(circle, ${color}, ${color}aa)`,
                      border: '3px solid #fff',
                      boxShadow: `0 0 20px ${color}66`,
                      margin: '8px auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      animation: color === '#2ecc40' ? 'pulse 1s ease-in-out infinite alternate' : 'none'
                    }}>
                      {icon}
                    </div>
                    <p style={{ 
                      margin: '5px 0 0 0', 
                      fontSize: '0.8rem', 
                      color: color,
                      fontWeight: 'bold'
                    }}>
                      {status}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className={styles.actions}>
            <button 
              className={styles.checkButton}
              onClick={checkTuning}
              disabled={!gameState.isPlaying}
            >
              ✅ Verificar Sintonización
            </button>
            <button 
              className={styles.resetButton}
              onClick={resetGame}
            >
              🔄 Reiniciar
            </button>
          </div>
        </div>
      )}

      <div className={styles.theory}>
        <h4>📚 Conceptos de Telecomunicaciones</h4>
        <ul>
          <li><strong>Frecuencia:</strong> Número de oscilaciones por segundo (Hz)</li>
          <li><strong>Ancho de Banda:</strong> Rango de frecuencias que puede transmitir un canal</li>
          <li><strong>SNR:</strong> Relación Señal-Ruido, indica la calidad de la señal</li>
          <li><strong>dBm:</strong> Unidad de potencia en decibeles referenciada a 1 milivatios</li>
          <li><strong>Espectrograma:</strong> Representación visual de cómo cambia el espectro de frecuencias en el tiempo</li>
          <li><strong>FFT:</strong> Transformada Rápida de Fourier, algoritmo para análisis espectral</li>
        </ul>
      </div>
    </div>
  );
};

export default EspectroGame;