import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiUrl, apiHeaders } from '../../../config/index.js';
import { useNavigate } from 'react-router-dom';
import Spectrogram from './Spectrogram.jsx';
import GameCredits from '../../GameCredits/GameCredits.jsx';
import styles from './EspectroGame.module.css';

// Componente memoizado del Spectrogram para optimización
const MemoizedSpectrogram = React.memo(Spectrogram);

// Definición de bandas de frecuencia de telecomunicaciones reales
const FREQUENCY_BANDS = {
  'WiFi 2.4 GHz': { min: 2400, max: 2485, description: 'Wi-Fi en banda ISM 2.4 GHz' },
  'WiFi 5 GHz': { min: 5150, max: 5825, description: 'Wi-Fi en banda 5 GHz' },
  'Bluetooth': { min: 2400, max: 2485, description: 'Bluetooth en banda ISM 2.4 GHz' },
  'GSM 900': { min: 880, max: 960, description: 'GSM 900 MHz' },
  'GSM 1800': { min: 1710, max: 1880, description: 'GSM 1800 MHz (DCS)' },
  'UMTS 2100': { min: 1920, max: 2170, description: 'UMTS en banda 2100 MHz' },
  'LTE 700': { min: 694, max: 790, description: 'LTE banda 700 MHz' },
  'LTE 800': { min: 791, max: 862, description: 'LTE banda 800 MHz' },
  'LTE 1800': { min: 1710, max: 1880, description: 'LTE banda 1800 MHz' },
  'LTE 2600': { min: 2500, max: 2690, description: 'LTE banda 2600 MHz' },
  '5G Sub-6': { min: 3400, max: 3800, description: '5G en banda sub-6 GHz' },
  'FM Radio': { min: 87.5, max: 108, description: 'Radio FM' }
};

// Patrones de frecuencias para generar desafíos por nivel
const LEVEL_PATTERNS = {
  1: ['WiFi 2.4 GHz', 'Bluetooth', 'FM Radio'],
  2: ['Bluetooth', 'WiFi 5 GHz', 'UMTS 2100', 'LTE 800'],
  3: ['LTE 700', 'LTE 800', 'LTE 1800', 'LTE 2600', '5G Sub-6']
};

const EspectroGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    level: 1,
    score: 0,
    isPlaying: false,
    completed: false,
    // Nivel 1: Ajuste manual de frecuencia
    currentFrequency: 2400,
    targetFrequency: 2400, // MHz objetivo
    // Nivel 2: Identificación de bandas
    correctBand: 'WiFi 2.4 GHz', // Banda correcta para la frecuencia mostrada
    selectedBand: null, // Banda seleccionada por el jugador
    // Nivel 3: Cálculo Nyquist y potencia
    requiredDataRate: 0, // Mbps requerido
    calculatedBandwidth: 0, // Ancho de banda calculado por el jugador
    calculatedPower: 0, // Potencia calculada por el jugador
    targetPower: 0, // Potencia objetivo
    distance: 0, // Distancia en km para cálculos de potencia
    // Parámetros comunes
    bandwidth: 10, // Inicia en 10 MHz
    signalPower: 10, // Inicia en 10 dBm
    noise: -90, // dBm
    snr: 0,
    spectrogramActive: true, // Controla si el espectrograma está activo
    startTime: null,
    attempts: 0,
    perfectStreak: 0,
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

  // Generar desafío para Nivel 1: Ajuste manual de frecuencia
  const generateLevel1Challenge = useCallback(() => {
    const targetFreq = 2400 + Math.floor(Math.random() * 85); // 2400-2485 MHz (WiFi 2.4 GHz)
    return {
      targetFrequency: targetFreq,
      currentFrequency: Math.max(2300, targetFreq - 50), // Empezar cerca pero no exacto
    };
  }, []);

  // Generar desafío para Nivel 2: Identificación de bandas
  const generateLevel2Challenge = useCallback(() => {
    const availableBands = LEVEL_PATTERNS[2] || ['Bluetooth', 'WiFi 5 GHz', 'UMTS 2100', 'LTE 800'];
    const randomBand = availableBands[Math.floor(Math.random() * availableBands.length)];
    const bandInfo = FREQUENCY_BANDS[randomBand];
    
    // Generar una frecuencia dentro del rango de la banda seleccionada
    const frequency = bandInfo.min + Math.floor(Math.random() * (bandInfo.max - bandInfo.min));
    
    return {
      frequency: frequency,
      correctBand: randomBand,
      bandInfo: bandInfo
    };
  }, []);

  // Generar desafío para Nivel 3: Cálculo Nyquist y potencia
  const generateLevel3Challenge = useCallback(() => {
    const dataRate = 20 + Math.floor(Math.random() * 60); // 20-80 Mbps (para que Nyquist dé resultado entre 10-40 MHz)
    const distance = 1 + Math.floor(Math.random() * 4); // 1-5 km (más realista)
    const frequency = 2000; // Frecuencia fija para simplificar
    
    // Cálculo de potencia usando fórmula simplificada que incluye distancia:
    // P_total = P_base + 10*log10(d) donde d es la distancia en km
    // Esto simula las pérdidas por propagación
    const basePower = 10; // dBm base (potencia mínima)
    const pathLoss = 10 * Math.log10(distance); // Pérdidas por distancia
    const targetPower = basePower + pathLoss;
    
    return {
      requiredDataRate: dataRate,
      targetFrequency: frequency,
      targetPower: Math.round(targetPower),
      distance: distance
    };
  }, []);

  // Función para seleccionar una banda (Nivel 2)
  const selectBand = useCallback((bandName) => {
    setGameState(prev => ({
      ...prev,
      selectedBand: bandName
    }));
  }, []);

  // Función para ajustar frecuencia (Nivel 1)
  const adjustFrequency = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      currentFrequency: parseInt(value)
    }));
  }, []);

  // Funciones para Nivel 3
  const updateCalculatedBandwidth = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      calculatedBandwidth: parseFloat(value),
      // En Nivel 3, sincronizar bandwidth con calculatedBandwidth
      ...(prev.level === 3 && { bandwidth: parseFloat(value) })
    }));
  }, []);

  const updateCalculatedPower = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      calculatedPower: parseFloat(value),
      // En Nivel 3, sincronizar signalPower con calculatedPower
      ...(prev.level === 3 && { signalPower: parseFloat(value) })
    }));
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
    // Limpiar espectrograma al iniciar el juego
    if (typeof window !== 'undefined' && window.__INTRATEL_CLEAR_SPECTROGRAM) {
      window.__INTRATEL_CLEAR_SPECTROGRAM();
    }
    
    let challenge;
    const level = gameState.level;
    
    if (level === 1) {
      challenge = generateLevel1Challenge();
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        startTime: Date.now(),
        targetFrequency: challenge.targetFrequency,
        currentFrequency: challenge.currentFrequency,
        attempts: 0,
        selectedBand: null, // Reset para otros niveles
      }));
    } else if (level === 2) {
      challenge = generateLevel2Challenge();
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        startTime: Date.now(),
        targetFrequency: challenge.frequency,
        correctBand: challenge.correctBand,
        selectedBand: null,
        currentFrequency: challenge.frequency,
        attempts: 0,
      }));
    } else if (level === 3) {
      challenge = generateLevel3Challenge();
      setGameState(prev => ({
        ...prev,
        isPlaying: true,
        startTime: Date.now(),
        requiredDataRate: challenge.requiredDataRate,
        targetFrequency: challenge.targetFrequency,
        targetPower: challenge.targetPower,
        distance: challenge.distance,
        calculatedBandwidth: 0,
        calculatedPower: 0,
        attempts: 0,
      }));
    }
    
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
    
    // Limpiar espectrograma al cambiar de nivel
    if (typeof window !== 'undefined' && window.__INTRATEL_CLEAR_SPECTROGRAM) {
      window.__INTRATEL_CLEAR_SPECTROGRAM();
    }
    
    let challenge;
    
    if (newLevel === 1) {
      challenge = generateLevel1Challenge();
      setGameState(prev => ({
        ...prev,
        level: newLevel,
        targetFrequency: challenge.targetFrequency,
        currentFrequency: challenge.currentFrequency,
        completed: false,
        isPlaying: true,
        bandwidth: 10,
        signalPower: 10,
        noise: prev.noise - 2,
        startTime: Date.now(),
        attempts: 0,
        selectedBand: null,
      }));
    } else if (newLevel === 2) {
      challenge = generateLevel2Challenge();
      setGameState(prev => ({
        ...prev,
        level: newLevel,
        targetFrequency: challenge.frequency,
        correctBand: challenge.correctBand,
        selectedBand: null,
        currentFrequency: challenge.frequency,
        completed: false,
        isPlaying: true,
        bandwidth: 10,
        signalPower: 10,
        noise: prev.noise - 2,
        startTime: Date.now(),
        attempts: 0,
      }));
    } else if (newLevel === 3) {
      challenge = generateLevel3Challenge();
      setGameState(prev => ({
        ...prev,
        level: newLevel,
        requiredDataRate: challenge.requiredDataRate,
        targetFrequency: challenge.targetFrequency,
        targetPower: challenge.targetPower,
        distance: challenge.distance,
        calculatedBandwidth: 0,
        calculatedPower: 0,
        completed: false,
        isPlaying: true,
        bandwidth: 25,
        signalPower: 25,
        noise: prev.noise - 2,
        startTime: Date.now(),
        attempts: 0,
      }));
    }
  }, [gameState.level, generateLevel1Challenge, generateLevel2Challenge, generateLevel3Challenge]);



  const adjustBandwidth = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      bandwidth: parseFloat(value),
      // En Nivel 3, sincronizar con calculatedBandwidth
      ...(prev.level === 3 && { calculatedBandwidth: parseFloat(value) })
    }));
  }, []);

  const adjustPower = useCallback((value) => {
    setGameState(prev => ({
      ...prev,
      signalPower: parseFloat(value),
      // En Nivel 3, sincronizar con calculatedPower
      ...(prev.level === 3 && { calculatedPower: parseFloat(value) })
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
    const { level, targetFrequency, currentFrequency, correctBand, selectedBand, 
            requiredDataRate, calculatedBandwidth, calculatedPower, distance,
            bandwidth, snr, signalPower, startTime, attempts } = gameState;
    
    const t = levelTargets[(level - 1) % levelTargets.length];
    const bandwidthTarget = t.bandwidth;
    const powerTarget = t.power;
    
    // Incrementar intentos
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1
    }));
    
    let success = false;
    let score = 0;
    let hints = [];
    
    if (level === 1) {
      // Nivel 1: Ajuste manual de frecuencia
      const frequencyError = Math.abs(currentFrequency - targetFrequency);
      const goodFrequency = frequencyError <= 1; // Tolerancia de 1 MHz
      const goodBandwidth = Math.abs(bandwidth - bandwidthTarget) <= 2;
      const goodPower = signalPower === powerTarget;
      const goodSignal = snr >= 20;
      
      success = goodFrequency && goodBandwidth && goodPower && goodSignal;
      score = success ? Math.max(0, 100 - frequencyError * 2) : 0;
      
      if (!goodFrequency) hints.push({
        icon: '🎯',
        title: 'Ajustar Frecuencia',
        message: `Objetivo: ${Math.round(targetFrequency)} MHz (±1 MHz)`,
        current: `Actual: ${Math.round(currentFrequency)} MHz`
      });
      
    } else if (level === 2) {
      // Nivel 2: Identificación de bandas
      const correctBandSelected = selectedBand === correctBand;
      const goodBandwidth = Math.abs(bandwidth - bandwidthTarget) <= 2;
      const goodPower = signalPower === powerTarget;
      const goodSignal = snr >= 20;
      
      success = correctBandSelected && goodBandwidth && goodPower && goodSignal;
      score = success ? 100 : 0;
      
      if (!correctBandSelected) {
        const bandInfo = FREQUENCY_BANDS[correctBand];
        hints.push({
          icon: '📡',
          title: 'Identificar Banda Correcta',
          message: `Frecuencia: ${targetFrequency.toFixed(1)} MHz`,
          current: `Banda correcta: ${correctBand} (${bandInfo.min}-${bandInfo.max} MHz)`
        });
      }
      
    } else if (level === 3) {
      // Nivel 3: Cálculo Nyquist y potencia con distancia
      const nyquistBandwidth = requiredDataRate / 2;
      const correctBandwidth = Math.abs(calculatedBandwidth - nyquistBandwidth) <= 2; // Nyquist: B >= R/2
      
      // Nueva fórmula: P_total = P_base + 10*log10(d)
      // donde P_base = 10 dBm y d es la distancia en km
      const basePower = 10;
      const pathLoss = 10 * Math.log10(distance);
      const expectedPower = basePower + pathLoss;
      const powerDifference = Math.abs(calculatedPower - expectedPower);
      const correctPower = powerDifference <= 1.5; // Tolerancia de ±1.5 dBm
      
      // En Nivel 3, el SNR es menos crítico
      const goodSignal = snr >= 10;
      
      // Debug info
      console.log('Nivel 3 Debug:', {
        calculatedBandwidth,
        nyquistBandwidth, 
        correctBandwidth,
        distance,
        basePower,
        pathLoss: pathLoss.toFixed(1),
        expectedPower: expectedPower.toFixed(1),
        calculatedPower,
        powerDifference: powerDifference.toFixed(1),
        correctPower,
        snr: snr.toFixed(1),
        goodSignal
      });
      
      success = correctBandwidth && correctPower && goodSignal;
      score = success ? 100 : 0;
      
      if (!correctBandwidth) hints.push({
        icon: '📈',
        title: 'Cálculo de Ancho de Banda (Nyquist)',
        message: `Para ${requiredDataRate} Mbps, B ≥ R/2 = ${nyquistBandwidth} MHz`,
        current: `Calculado: ${calculatedBandwidth} MHz`
      });
      
      if (!correctPower) hints.push({
        icon: '⚡',
        title: 'Cálculo de Potencia',
        message: `P_total = P_base + 10×log10(d) = 10 + 10×log10(${distance}) = ${expectedPower.toFixed(1)} dBm`,
        current: `Tu respuesta: ${calculatedPower} dBm (Diferencia: ${Math.abs(calculatedPower - expectedPower).toFixed(1)} dBm)`
      });
      
      if (!goodSignal) hints.push({
        icon: '📶',
        title: 'Calidad de Señal',
        message: `SNR debe ser ≥ 10 dB para una buena comunicación`,
        current: `SNR actual: ${snr.toFixed(1)} dB`
      });
    }
    
    // Verificaciones comunes para todos los niveles
    const goodBandwidth = Math.abs(bandwidth - bandwidthTarget) <= 2;
    const goodPower = signalPower === powerTarget;
    const goodSignal = snr >= 20;
    
    if (level !== 3) { // Para niveles 1 y 2, agregar hints comunes
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
    }
    
    if (!goodSignal) hints.push({
      icon: '📡',
      title: 'Mejorar SNR',
      message: `Necesitas: ≥20 dB`,
      current: `Actual: ${snr.toFixed(1)} dB`
    });

    if (success) {
      const completionTime = (Date.now() - startTime) / 1000; // segundos
      
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
      
      if (success) {
        unlockAchievement('precisionExpert');
      }
      
      if (attempts < 3) {
        unlockAchievement('efficiency');
      }
      
      // Logros por nivel
      if (level === 1) unlockAchievement('masterLevel1');
      if (level === 2) unlockAchievement('masterLevel2');
      if (level === 3) unlockAchievement('masterLevel3');

      const newStreakCount = gameState.perfectStreak + 1;
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + score,
        completed: true,
        perfectStreak: newStreakCount
      }));

      // Crear partículas de éxito
      createSuccessParticles();

      setTimeout(() => {
        if (level === 3) {
          unlockAchievement('completionist');
          if (newStreakCount >= 3) {
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
            flag: (() => {
              switch(level) {
                case 1: return  'D1FT3L{FREQUENCY_TUNER_2400MHZ_PRECISION}';
                case 2: return  'D1FT3L{BAND_DETECTIVE_5G_BLUETOOTH_MASTER}';
                case 3: return  'D1FT3L{NYQUIST_ENGINEER_POWER_CALCULATOR}';
                default: return `D1FT3L{SPECTRUM_MASTER_L${level}}`;
              }
            })(),
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
            flag: (() => {
              switch(level) {
                case 1: return  'D1FT3L{FREQUENCY_TUNER_2400MHZ_PRECISION}';
                case 2: return  'D1FT3L{BAND_DETECTIVE_5G_BLUETOOTH_MASTER}';
                case 3: return  'D1FT3L{NYQUIST_ENGINEER_POWER_CALCULATOR}';
                default: return `D1FT3L{SPECTRUM_MASTER_L${level}}`;
              }
            })(),
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
      title: "¡Bienvenido al Identificador de Bandas!",
      content: "Aprende a identificar las bandas de frecuencia de telecomunicaciones. Se te mostrará una frecuencia y deberás seleccionar qué banda la utiliza.",
      target: null
    },
    {
      title: "Selección de Banda",
      content: "Observa la frecuencia mostrada y selecciona la banda correcta entre las opciones disponibles. Cada banda tiene un rango específico de frecuencias.",
      target: ".control:first-child"
    },
    {
      title: "Ancho de Banda",
      content: "Además de identificar la banda, debes ajustar el ancho de banda según el objetivo del nivel.",
      target: ".control:nth-child(2)"
    },
    {
      title: "Potencia de Señal",
      content: "Configura la potencia de transmisión al valor objetivo mostrado en el panel.",
      target: ".control:nth-child(3)"
    },
    {
      title: "Verificar Identificación",
      content: "Cuando hayas seleccionado la banda y ajustado los parámetros, presiona este botón para verificar tu respuesta.",
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
      correctBand: 'WiFi 2.4 GHz',
      selectedBand: null,
      requiredDataRate: 0,
      calculatedBandwidth: 0,
      calculatedPower: 0,
      targetPower: 0,
      distance: 0,
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
    masterLevel1: { icon: "🥉", title: "Maestro Nivel 1", description: "Dominaste la sintonización manual" },
    masterLevel2: { icon: "🥈", title: "Maestro Nivel 2", description: "Experto en identificación de bandas" },
    masterLevel3: { icon: "🥇", title: "Maestro Nivel 3", description: "Maestro en cálculos de Nyquist" },
    completionist: { icon: "🏆", title: "Completista", description: "¡Completaste todos los niveles!" },
    precisionExpert: { icon: "🔬", title: "Experto en Precisión", description: "Ejecución perfecta en cualquier nivel" },
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
        <h1>
          <span className={styles.titleEmoji}>🌐</span>
          <span className={styles.titleText}>Juego del Espectro Electromagnético</span>
        </h1>
        <p>Domina diferentes aspectos de las telecomunicaciones en cada nivel</p>
      </div>

      {!gameState.isPlaying ? (
        <div className={styles.startScreen}>
          <button className={styles.startButton} onClick={startGame}>
            🚀 Iniciar Juego
          </button>
          <p className={styles.instructions}>
            <strong>Nivel 1:</strong> Sintoniza frecuencias manualmente<br/>
            <strong>Nivel 2:</strong> Identifica bandas de telecomunicaciones<br/>
            <strong>Nivel 3:</strong> Realiza cálculos avanzados con Nyquist
          </p>
        </div>
      ) : (
        <div className={styles.gameLayout}>
          {/* Panel izquierdo - Controles */}
          <div className={styles.leftPanel}>
            <div className={styles.controlsPanel}>
              <div className={styles.controlsHeader}>
                <h3 className={styles.controlsTitle}>🎛️ Controles Nivel {gameState.level}</h3>
              </div>
              <div className={styles.controlsContent}>
                <div className={styles.targetInfo}>
                  <h4 style={{marginBottom: 6}}>🎯 Desafío Nivel {gameState.level}:</h4>
                  
                  {/* Nivel 1: Ajuste de frecuencia */}
                  {gameState.level === 1 && (
                    <></>  
                  )}
                  
                  {/* Nivel 2: Identificación de bandas */}
                  {gameState.level === 2 && (
                    <div style={{marginBottom:'1rem', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', border: '2px solid #3b82f6'}}>
                      <span style={{color: '#3b82f6', fontWeight: 700, fontSize: '1.2rem', display:'block', textAlign: 'center'}}>
                        📡 ¿Qué banda usa esta frecuencia?
                      </span>
                      <span style={{color:'#ffd700', fontWeight:800, display:'block', textAlign: 'center', fontSize: '1.5rem', margin: '10px 0'}}>
                        {gameState.targetFrequency.toFixed(1)} MHz
                      </span>
                    </div>
                  )}
                  
                  {/* Nivel 3: Cálculos Nyquist */}
                  {gameState.level === 3 && (
                    <div style={{marginBottom:'0.75rem', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '2px solid #a855f7'}}>
                      <span style={{color: '#a855f7', fontWeight: 700, fontSize: '1.1rem', display:'block', textAlign: 'center'}}>
                        🧮 Cálculos de Ingeniería
                      </span>
                      
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', margin: '15px 0'}}>
                        <div style={{textAlign: 'center'}}>
                          <span style={{color:'#e6f2ff', display:'block', marginBottom: '5px', fontSize: '0.9rem'}}>
                            📊 Tasa de datos requerida:
                          </span>
                          <span style={{color:'#ffd700', fontWeight:800, fontSize: '1.2rem'}}>
                            {gameState.requiredDataRate} Mbps
                          </span>
                        </div>
                        
                        <div style={{textAlign: 'center'}}>
                          <span style={{color:'#e6f2ff', display:'block', marginBottom: '5px', fontSize: '0.9rem'}}>
                            📏 Distancia del enlace:
                          </span>
                          <span style={{color:'#ffd700', fontWeight:800, fontSize: '1.2rem'}}>
                            {gameState.distance} km
                          </span>
                        </div>
                      </div>
                      

                      
                      <div style={{fontSize: '0.8rem', color: '#cbd5e1', marginTop: '10px', textAlign: 'center'}}>
                        💡 Usa teorema de Nyquist para ancho de banda y fórmula de Friis para potencia
                      </div>
                    </div>
                  )}
                  
                  {/* Objetivos comunes */}
                  <div style={{marginBottom:'1rem'}}>
                    {gameState.level === 1 && (
                      <span style={{color:'#e6f2ff', fontWeight:600, display:'block'}}>
                        📡 Frecuencia objetivo: <span style={{color:'#9af59a'}}>{gameState.targetFrequency.toFixed(1)} MHz</span>
                      </span>
                    )}
                    {gameState.level !== 3 && (
                      <>
                        <span style={{color:'#e6f2ff', fontWeight:600, display:'block'}}>
                          📶 Ancho objetivo: <span style={{color:'#9af59a'}}>{currentTargets.bandwidth} MHz</span>
                        </span>
                        <span style={{color:'#e6f2ff', fontWeight:600, display:'block'}}>
                          ⚡ Potencia objetivo: <span style={{color:'#9af59a'}}>{currentTargets.power} dBm</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {/* Control específico por nivel */}
                
                {/* Nivel 1: Control de frecuencia manual */}
                {gameState.level === 1 && (
                  <div className={styles.control}>
                    <label>📡 Frecuencia (MHz):</label>
                    <input
                      type="range"
                      min={600}
                      max={3000}
                      step="1"
                      value={gameState.currentFrequency}
                      onChange={(e) => adjustFrequency(e.target.value)}
                      className={styles.slider}
                    />
                    <span className={styles.value} style={{ 
                      color: Math.abs(gameState.currentFrequency - gameState.targetFrequency) <= 1 ? '#4ade80' : '#f87171'
                    }}>
                      {Math.abs(gameState.currentFrequency - gameState.targetFrequency) <= 1 ? '✓' : '✗'} 
                      {Math.round(gameState.currentFrequency)} MHz
                    </span>
                  </div>
                )}
                
                {/* Nivel 2: Selección de bandas */}
                {gameState.level === 2 && (
                  <div className={styles.control}>
                    <label>📡 Selecciona la Banda de Frecuencia:</label>
                    <div className={styles.bandSelectionGrid}>
                      {Object.keys(FREQUENCY_BANDS).filter(band => 
                        ['Bluetooth', 'WiFi 5 GHz', 'UMTS 2100', 'LTE 800'].includes(band)
                      ).map((bandName) => {
                        const isSelected = gameState.selectedBand === bandName;
                        const bandInfo = FREQUENCY_BANDS[bandName];
                        
                        return (
                          <button
                            key={bandName}
                            onClick={() => selectBand(bandName)}
                            className={`${styles.bandButton} ${isSelected ? styles.selected : ''}`}
                          >
                            <div className={styles.bandName}>{bandName}</div>
                            <div className={styles.bandRange}>
                              {bandInfo.min}-{bandInfo.max} MHz
                            </div>
                            {isSelected && (
                              <div style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '-2px',
                                background: '#3b82f6',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}>
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {gameState.selectedBand && (
                      <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                        <span className={styles.value} style={{ 
                          color: gameState.selectedBand === gameState.correctBand ? '#4ade80' : '#f87171',
                          fontWeight: '600'
                        }}>
                          {gameState.selectedBand === gameState.correctBand ? '✓' : '✗'} Banda seleccionada: {gameState.selectedBand}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Nivel 3: Cálculos de Nyquist y potencia */}
                {gameState.level === 3 && (
                  <>
                    <div className={styles.control}>
                      <label>📊 Ancho de Banda Calculado (MHz) - Nyquist:</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        step={1}
                        value={gameState.calculatedBandwidth}
                        onChange={(e) => updateCalculatedBandwidth(e.target.value)}
                        placeholder="B ≥ R/2"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          marginTop: '5px'
                        }}
                      />
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>
                        Teorema de Nyquist: B ≥ R/2
                      </div>
                      <span className={styles.value} style={{ 
                        color: Math.abs(gameState.calculatedBandwidth - (gameState.requiredDataRate / 2)) <= 2 ? '#4ade80' : '#f87171'
                      }}>
                        {Math.abs(gameState.calculatedBandwidth - (gameState.requiredDataRate / 2)) <= 2 ? '✓' : '✗'} 
                        {gameState.calculatedBandwidth} MHz
                      </span>
                    </div>
                    
                    <div className={styles.control}>
                      <label>⚡ Potencia Calculada (dBm):</label>
                      <input
                        type="number"
                        min={-50}
                        max={50}
                        step={0.1}
                        value={gameState.calculatedPower}
                        onChange={(e) => updateCalculatedPower(e.target.value)}
                        placeholder="P_total = 10 + 10×log10(d)"
                        style={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '5px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.1)',
                          color: '#fff',
                          marginTop: '5px'
                        }}
                      />
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>
                        <strong>Fórmula:</strong> P<sub>total</sub> = P<sub>base</sub> + 10×log10(d)<br/>
                        <strong>Donde:</strong> P<sub>base</sub> = 10 dBm, d = {gameState.distance || 2.5} km
                      </div>
                      <span className={styles.value} style={{ 
                        color: (() => {
                          const expectedPower = 10 + 10 * Math.log10(gameState.distance || 2.5);
                          return Math.abs(gameState.calculatedPower - expectedPower) <= 1.5 ? '#4ade80' : '#f87171';
                        })()
                      }}>
                        {(() => {
                          const expectedPower = 10 + 10 * Math.log10(gameState.distance || 2.5);
                          return Math.abs(gameState.calculatedPower - expectedPower) <= 1.5 ? '✓' : '✗';
                        })()} 
                        {gameState.calculatedPower} dBm
                      </span>
                    </div>
                  </>
                )}

                {/* Ocultar slider de Ancho de Banda en Nivel 3 */}
                {gameState.level !== 3 && (
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
                )}

                {/* Ocultar slider de Potencia de Señal en Nivel 3 */}
                {gameState.level !== 3 && (
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
                )}

                <div className={styles.actions}>
                  <button 
                    className={styles.checkButton}
                    onClick={checkTuning}
                    disabled={!gameState.isPlaying}
                  >
                    ✅ {gameState.level === 1 ? 'Verificar Sintonización' : gameState.level === 2 ? 'Verificar Identificación' : 'Verificar Cálculos'}
                  </button>
                  <button 
                    className={styles.resetButton}
                    onClick={resetGame}
                  >
                    🔄 Reiniciar
                  </button>
                </div>
              </div>
            </div>
            

          </div>

          {/* Panel central - Espectrograma */}
          <div className={styles.centerPanel}>
            <div className={styles.spectrumPanel}>
              <div className={styles.spectrumHeader}>
                <h3 className={styles.spectrumTitle}>📊 Análisis Espectral</h3>
              </div>
              <div className={styles.spectrumContent}>
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
                />
              </div>
              
              {/* Estadísticas del juego en fila horizontal */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '0.25rem',
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '8px',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                justifyContent: 'space-around'
              }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>NIVEL:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>{gameState.level}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>PUNTUACIÓN:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>{gameState.score.toFixed(0)}</div>
                </div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>LOGROS:</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#fff' }}>
                    {Object.values(achievements).filter(Boolean).length}/10 🏆
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel derecho - Espectro y feedback */}
          <div className={styles.rightPanel}>
            <div className={styles.spectrum}>
              <h4>📊 Analizador de Espectro</h4>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                Frecuencia ocupada: {gameState.level === 3 ? gameState.targetFrequency.toFixed(1) : gameState.currentFrequency.toFixed(1)} MHz
              </div>
              <div className={styles.spectrumDisplay}>
                <div 
                  className={styles.signal}
                  style={{
                    left: `${((gameState.level === 3 ? gameState.targetFrequency : gameState.currentFrequency) - 600) / (3000 - 600) * 100}%`,
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

            {/* Círculo de feedback visual */}
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '1rem'}}>
              {(() => {
                const t = levelTargets[(gameState.level - 1) % levelTargets.length];
                const goodSignal = gameState.snr >= 20;
                
                let color = '#aaa';
                let icon = '⚪';
                let status = 'Sin configurar';
                
                if (gameState.level === 1) {
                  // Nivel 1: Ajuste de frecuencia
                  const frequencyError = Math.abs(gameState.currentFrequency - gameState.targetFrequency);
                  const goodFrequency = frequencyError <= 1;
                  const goodBandwidth = Math.abs(gameState.bandwidth - t.bandwidth) <= 2;
                  const goodPower = Math.abs(gameState.signalPower - t.power) <= 2;
                  
                  if (goodFrequency && goodBandwidth && goodPower && goodSignal) {
                    color = '#2ecc40';
                    icon = '✅';
                    status = '¡Perfecto!';
                  } else if (goodFrequency) {
                    color = '#ffaa00';
                    icon = '⚠️';
                    status = 'Frecuencia correcta, ajusta parámetros';
                  } else {
                    color = '#ff4136';
                    icon = '❌';
                    status = 'Ajusta la frecuencia';
                  }
                } else if (gameState.level === 2) {
                  // Nivel 2: Identificación de bandas
                  const correctBandSelected = gameState.selectedBand === gameState.correctBand;
                  const goodBandwidth = Math.abs(gameState.bandwidth - t.bandwidth) <= 2;
                  const goodPower = Math.abs(gameState.signalPower - t.power) <= 2;
                  
                  if (correctBandSelected && goodBandwidth && goodPower && goodSignal) {
                    color = '#2ecc40';
                    icon = '✅';
                    status = '¡Perfecto!';
                  } else if (gameState.selectedBand) {
                    if (correctBandSelected) {
                      color = '#ffaa00';
                      icon = '⚠️';
                      status = 'Banda correcta, ajusta parámetros';
                    } else {
                      color = '#ff4136';
                      icon = '❌';
                      status = 'Banda incorrecta';
                    }
                  } else {
                    status = 'Selecciona una banda';
                  }
                } else if (gameState.level === 3) {
                  // Nivel 3: Cálculos Nyquist
                  const correctBandwidth = Math.abs(gameState.calculatedBandwidth - (gameState.requiredDataRate / 2)) <= 2;
                  const correctPower = Math.abs(gameState.calculatedPower - gameState.targetPower) <= 2;
                  
                  if (correctBandwidth && correctPower && goodSignal) {
                    color = '#2ecc40';
                    icon = '✅';
                    status = '¡Perfecto!';
                  } else if (gameState.calculatedBandwidth > 0 || gameState.calculatedPower !== 0) {
                    if (correctBandwidth && correctPower) {
                      color = '#ffaa00';
                      icon = '⚠️';
                      status = 'Cálculos correctos, mejora SNR';
                    } else {
                      color = '#ff4136';
                      icon = '❌';
                      status = 'Verifica cálculos';
                    }
                  } else {
                    status = 'Introduce cálculos';
                  }
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

            {/* Sección de Logros */}
            <div className={styles.achievementsSection} style={{marginTop: '0.75rem'}}>
              <div style={{
                padding: '0.75rem',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRadius: '6px',
                border: '1px solid rgba(148, 163, 184, 0.2)'
              }}>
                <h4 style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  🏆 Logros ({Object.values(achievements).filter(Boolean).length}/10)
                </h4>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  maxHeight: '140px',
                  overflowY: 'auto'
                }}>
                  {Object.entries(achievementMeta).slice(0, 5).map(([key, meta]) => (
                    <div 
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem',
                        background: achievements[key] ? 'rgba(16, 185, 129, 0.1)' : 'rgba(148, 163, 184, 0.05)',
                        borderRadius: '6px',
                        border: `1px solid ${achievements[key] ? 'rgba(16, 185, 129, 0.3)' : 'rgba(148, 163, 184, 0.1)'}`,
                        opacity: achievements[key] ? 1 : 0.6,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '1rem' }}>{meta.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: achievements[key] ? '#10b981' : '#94a3b8',
                          marginBottom: '0.125rem'
                        }}>
                          {meta.title}
                        </div>
                        <div style={{
                          fontSize: '0.625rem',
                          color: '#64748b',
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {meta.description}
                        </div>
                      </div>
                      {achievements[key] && (
                        <span style={{ color: '#10b981', fontSize: '0.875rem' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
                
                {Object.keys(achievementMeta).length > 5 && (
                  <button
                    onClick={() => setShowAchievements(!showAchievements)}
                    style={{
                      width: '100%',
                      marginTop: '0.5rem',
                      padding: '0.5rem',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      color: '#3b82f6',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                  >
                    {showAchievements ? 'Ver menos' : `Ver todos (${Object.keys(achievementMeta).length - 5} más)`}
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <div className={styles.theory}>
        <h4>📚 Bandas de Frecuencia en Telecomunicaciones</h4>
        <ul>
          <li><strong>WiFi 2.4 GHz (2400-2485 MHz):</strong> Banda ISM para Wi-Fi y Bluetooth</li>
          <li><strong>WiFi 5 GHz (5150-5825 MHz):</strong> Banda de 5 GHz con menos congestión</li>
          <li><strong>GSM 900 (880-960 MHz):</strong> Red celular 2G en Europa y Ásia</li>
          <li><strong>GSM 1800 (1710-1880 MHz):</strong> DCS-1800, extensión de GSM</li>
          <li><strong>UMTS 2100 (1920-2170 MHz):</strong> Redes 3G en Europa</li>
          <li><strong>LTE (700-2600 MHz):</strong> Varias bandas para redes 4G</li>
          <li><strong>5G Sub-6 (3400-3800 MHz):</strong> Bandas medias para 5G</li>
          <li><strong>FM Radio (87.5-108 MHz):</strong> Radiodifusión en frecuencia modulada</li>
        </ul>
        <p style={{fontSize: '0.9rem', fontStyle: 'italic', marginTop: '15px'}}>
          💡 <strong>Tip:</strong> Cada banda tiene características únicas de propagación y está regulada para usos específicos.
        </p>
      </div>
      
      {/* Créditos */}
      <GameCredits 
        creator={{ name: 'Juan Villalón', github: 'juanvillalon' }}
        emoji="📡"
        gameName="Espectro Teleco"
      />
    </div>
  );
};

export default EspectroGame;