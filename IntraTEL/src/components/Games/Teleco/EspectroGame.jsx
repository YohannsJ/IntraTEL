import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../../context/AuthContext';
import Spectrogram from './Spectrogram.jsx';
  // ...existing code...
import styles from './EspectroGame.module.css';

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
  // patternMode y autoPattern eliminados porque no se usan
  });

  // Patrones de frecuencias para diferentes niveles
  const frequencyPatterns = {
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

  // Generar nueva frecuencia objetivo basada en el nivel
  const generateTargetFrequency = (level) => {
    const pattern = frequencyPatterns[level] || frequencyPatterns[10];
    const minFreq = Math.max(300, pattern.base - pattern.range / 2);
    const maxFreq = Math.min(6000, pattern.base + pattern.range / 2);
    return minFreq + Math.random() * (maxFreq - minFreq);
  };

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
    }));
  };

  const startNextLevel = () => {
    const newLevel = Math.min(3, gameState.level + 1); // Limita a 3 niveles
    if (newLevel > 3) return;
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
      noise: prev.noise - 2 // Menos ruido = más fácil ver la señal
    }));
  };

  const adjustFrequency = (value) => {
    setGameState(prev => ({
      ...prev,
      currentFrequency: parseFloat(value)
    }));
  };

  const adjustBandwidth = (value) => {
    setGameState(prev => ({
      ...prev,
      bandwidth: parseFloat(value)
    }));
  };

  const adjustPower = (value) => {
    setGameState(prev => ({
      ...prev,
      signalPower: parseFloat(value)
    }));
  };

  // Objetivos variables por nivel
  // Generar objetivo de potencia aleatorio entre -10 y 10 para niveles 2 y 3
  const [randomPowers, setRandomPowers] = useState({1: 0, 2: 0, 3: 0});
  const [randomBandwidths, setRandomBandwidths] = useState({1: 20, 2: 20, 3: 18});
  useEffect(() => {
    setRandomPowers({
      1: Math.round((Math.random() * 20 - 10)),
      2: Math.round((Math.random() * 20 - 10)),
      3: Math.round((Math.random() * 20 - 10))
    });
    setRandomBandwidths({
      1: Math.floor(Math.random() * 40) + 1, // 1-40 MHz
      2: Math.floor(Math.random() * 40) + 1,
      3: Math.floor(Math.random() * 40) + 1
    });
  }, [gameState.level, gameState.isPlaying]);

  const levelTargets = [
    { bandwidth: randomBandwidths[1], power: randomPowers[1] }, // Nivel 1: frecuencia, ancho de banda y potencia aleatoria
    { bandwidth: randomBandwidths[2], power: randomPowers[2] }, // Nivel 2: frecuencia, ancho de banda y potencia aleatoria
    { bandwidth: randomBandwidths[3], power: randomPowers[3] } // Nivel 3: frecuencia, ancho de banda y potencia aleatoria
  ];

  // Determinar estado de acierto/error para feedback visual

  const checkTuning = () => {
    const { currentFrequency, targetFrequency, bandwidth, snr, signalPower, level } = gameState;
    const frequencyError = Math.abs(currentFrequency - targetFrequency);
    const t = levelTargets[(level - 1) % levelTargets.length];
    const bandwidthTarget = t.bandwidth;
    const powerTarget = t.power;
    const inBand = frequencyError <= bandwidth / 2;
      const goodBandwidth = Math.abs(bandwidth - bandwidthTarget) <= 2;
  const goodPower = signalPower === powerTarget;
    const goodSignal = snr >= 20;

    if (inBand && goodBandwidth && goodPower && goodSignal) {
      const score = Math.max(0, 100 - frequencyError * 2);
      setGameState(prev => ({
        ...prev,
        score: prev.score + score,
        completed: true
      }));
      setTimeout(() => {
        alert(`¡Excelente! Has sintonizado la frecuencia ${targetFrequency.toFixed(1)} MHz, ancho de banda ${bandwidthTarget} MHz y potencia ${powerTarget} dBm`);
        alert(`FLAG{SPECTRUM_MASTER_L${gameState.level}_${Math.floor(score)}}`);
        if (gameState.level === 3) {
            // Guardar progreso en localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('teleco_completed', 'true');
            }
          setTimeout(() => {
            alert('¡Felicidades! Has completado los 3 niveles del juego de espectro. Serás redirigido al Templo, para que puedas seleccionar el pilar de TELECO.');
            navigate('/templo', { state: { pilar: 'TELECO' } });
          }, 200);
        } else {
          const continueGame = confirm(`¿Quieres continuar al nivel ${gameState.level + 1}?`);
          if (continueGame) {
            startNextLevel();
          }
        }
      }, 100);
    } else {
      let hint = '';
      if (!inBand) hint += `Ajusta la frecuencia. Objetivo: ${targetFrequency.toFixed(1)} MHz (±${bandwidth/2} MHz)\n`;
      if (!goodBandwidth && bandwidthTarget !== null) {
        hint += `Ajusta el ancho de banda a ${bandwidthTarget} MHz\n`;
      }
      if (!goodBandwidth && bandwidthTarget === null) {
        hint += `Ajusta el ancho de banda a cualquier valor\n`;
      }
      if (!goodPower) hint += `Ajusta la potencia a ${powerTarget} dBm\n`;
      if (!goodSignal) hint += `Aumenta el SNR (actual: ${snr.toFixed(1)} dB, necesitas: ≥20 dB)`;
      alert(hint);
    }
  };

  const toggleSpectrogram = () => {
    setGameState(prev => ({
      ...prev,
      spectrogramActive: !prev.spectrogramActive
    }));
  };

  // Código de patrón automático eliminado porque no se usa



  const resetGame = () => {
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
      spectrogramActive: true
    });
  };

  return (
    <div className={styles.gameContainer}>
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
            <h3>📡 Objetivo: {gameState.targetFrequency.toFixed(2)} MHz</h3>
            {/* Objetivos del nivel actual */}
            {(() => {
              const t = levelTargets[(gameState.level - 1) % levelTargets.length];
              return (
                <div style={{marginBottom: 8}}>
                  <span style={{display: 'block', marginBottom: 2}}>🎯 <b>Parámetros a ajustar:</b></span>
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    <li>• Frecuencia objetivo: <b>{gameState.targetFrequency.toFixed(2)} MHz</b></li>
                    <li>• Ancho de banda objetivo: <b>{t.bandwidth !== null ? t.bandwidth + ' MHz' : 'Cualquiera'}</b></li>
                    <li>• Potencia objetivo: <b>{t.power !== null ? t.power + ' dBm' : 'Cualquiera'}</b></li>
                  </ul>
                </div>
              );
            })()}
            <p>Nivel actual: {gameState.level}</p>
            {/* Banda disponible y rango de búsqueda eliminados */}
          </div>

          <div className={styles.controls}>
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
              <span className={styles.value}>{parseFloat(gameState.currentFrequency).toFixed(2)} MHz</span>
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
              <span className={styles.value}>{gameState.bandwidth} MHz</span>
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
              <span className={styles.value}>{gameState.signalPower} dBm</span>
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
              <Spectrogram 
                signalFrequency={gameState.currentFrequency}
                signalPower={gameState.signalPower}
                noise={gameState.noise}
                bandwidth={gameState.bandwidth}
                isActive={gameState.spectrogramActive && gameState.isPlaying}
                timeWindow={15}
                frequencyRange={[600, 3000]}
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
                if (inBand && goodBandwidth && goodPower && goodSignal) color = '#2ecc40'; // verde
                else if (gameState.bandwidth > 0 || gameState.signalPower !== 0) color = '#ff4136'; // rojo
                return (
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    background: color,
                    border: '3px solid #fff',
                    boxShadow: '0 0 8px #0003',
                    margin: 8
                  }} title={color === '#2ecc40' ? '¡Bien ajustado!' : color === '#ff4136' ? 'Ajuste incorrecto' : 'Sin ajustar'} />
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