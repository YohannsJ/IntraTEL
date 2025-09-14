  // Colormap tipo 'jet' (azul-bajo, rojo/amarillo-alto)
  function jetColor(val) {
    // val: 0 (bajo, azul) a 1 (alto, rojo/amarillo)
    const fourValue = 4 * val;
    const r = Math.max(0, Math.min(1, fourValue - 1.5, -fourValue + 4.5));
    const g = Math.max(0, Math.min(1, fourValue - 0.5, -fourValue + 3.5));
    const b = Math.max(0, Math.min(1, fourValue + 0.5, -fourValue + 2.5));
    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  }
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import styles from './Spectrogram.module.css';

const Spectrogram = ({ 
  signalFrequency, 
  signalPower, 
  noise, 
  bandwidth,
  isActive = true,
  timeWindow = 10, // segundos
  frequencyRange = [0, 600], // Hz
  // tuningStatus eliminado porque no se usa
}) => {
  const canvasRef = useRef(null);
  const [spectrogramData, setSpectrogramData] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  // Eliminar captureStartTime, no se necesita para scroll continuo

  // Configuración del espectrograma
  const config = useMemo(() => ({
    width: 800,
    height: 400,
    timeResolution: 50, // ms entre muestras
    frequencyBins: 64,
    maxDataPoints: Math.floor(timeWindow * 1000 / 50)
  }), [timeWindow]);

  // FFT simple (solo magnitud, radix-2, para fines didácticos)
  function fftMag(signal) {
    const N = signal.length;
    if (N <= 1) return [Math.abs(signal[0])];
    if ((N & (N - 1)) !== 0) throw new Error('N debe ser potencia de 2');
    // Cooley-Tukey
    const even = fftMag(signal.filter((_, i) => i % 2 === 0));
    const odd = fftMag(signal.filter((_, i) => i % 2 !== 0));
    const T = [];
    for (let k = 0; k < N / 2; k++) {
      const exp = -2 * Math.PI * k / N;
      const twiddle = [Math.cos(exp), Math.sin(exp)];
      T[k] = [
        odd[k] * twiddle[0],
        odd[k] * twiddle[1]
      ];
    }
    const X = [];
    for (let k = 0; k < N / 2; k++) {
      const re = even[k] + T[k][0];
      const im = T[k][1];
      X[k] = Math.sqrt(re * re + im * im);
      const re2 = even[k] - T[k][0];
      const im2 = -T[k][1];
      X[k + N / 2] = Math.sqrt(re2 * re2 + im2 * im2);
    }
    return X;
  }

  // Generar señal a partir de frecuencia y potencia seleccionadas por el usuario
  function dbmToAmplitude(dbm) {
    // 0 dBm = 1 mW, amplitud proporcional a sqrt(P)
    const mW = Math.pow(10, dbm / 10);
    return Math.sqrt(mW);
  }

  function generateSignal({ freq, amplitude, bandwidth, noise, fs, N, t0 }) {
    // Simula una portadora con modulación de banda base (suma de senoidales para simular ancho de banda)
    const signal = [];
    for (let n = 0; n < N; n++) {
      const t = t0 + n / fs;
      let s = 0;
      const numTones = Math.max(1, Math.round(bandwidth / 20));
      for (let k = 0; k < numTones; k++) {
        const delta = (k - numTones / 2) * (bandwidth / numTones);
        s += Math.sin(2 * Math.PI * (freq + delta) * t);
      }
      s = amplitude * s / numTones + noise * (Math.random() - 0.5);
      signal.push(s);
    }
    return signal;
  }

  // Generar espectrograma en tiempo real
  const generateSpectralData = useCallback((t0) => {
    // Parámetros de la señal
    const fs = 1000; // Hz
    const N = 256; // muestras por ventana
    // Usar frecuencia y potencia seleccionadas por el usuario
  // Normalizar frecuencia de entrada al rango del canvas
  // Convertir de MHz a Hz si los valores son mayores a 1000 (asumimos que vienen en MHz)
  let freq = typeof signalFrequency === 'number' ? signalFrequency : 50;
  if (freq > 1000) freq = freq * 1e6; // MHz a Hz
  if (freq > frequencyRange[1]) freq = ((freq / 1e6) % (frequencyRange[1] - frequencyRange[0])) + frequencyRange[0];
  freq = Math.max(frequencyRange[0] + 10, Math.min(frequencyRange[1] - 10, freq));
  const amplitude = dbmToAmplitude(typeof signalPower === 'number' ? signalPower : 0);
  let bw = typeof bandwidth === 'number' ? bandwidth : 10;
  if (bw > 1000) bw = bw * 1e6; // MHz a Hz
  if (bw > frequencyRange[1] - frequencyRange[0]) bw = frequencyRange[1] - frequencyRange[0];
  bw = Math.max(5, Math.min(frequencyRange[1] - frequencyRange[0], bw));
  const noiseLevel = 0.1;
  // Generar ventana de señal con ancho de banda
  const signal = generateSignal({ freq, amplitude, bandwidth: bw, noise: noiseLevel, fs, N, t0 });
    // FFT
    let mag;
    try {
      mag = fftMag(signal);
    } catch (e) {
      mag = new Array(N / 2).fill(0);
    }
    // Solo la mitad positiva
    mag = mag.slice(0, N / 2);
    // Normalizar y escalar a 0-1 (más contraste visual)
    const maxMag = Math.max(...mag) || 1;
    // Elevar a 0.5 para aumentar contraste (raíz cuadrada)
    return mag.map(v => Math.pow(v / maxMag, 0.5));
  }, [signalFrequency, signalPower, bandwidth, frequencyRange]);

  // Actualizar datos del espectrograma en tiempo real usando refs
  const freqRef = useRef(signalFrequency);
  const powerRef = useRef(signalPower);
  const noiseRef = useRef(noise);
  const bwRef = useRef(bandwidth);

  useEffect(() => {
    freqRef.current = signalFrequency;
    // No reiniciar el buffer ni el tiempo al cambiar frecuencia
  }, [signalFrequency]);
  useEffect(() => { powerRef.current = signalPower; }, [signalPower]);
  useEffect(() => { noiseRef.current = noise; }, [noise]);
  useEffect(() => { bwRef.current = bandwidth; }, [bandwidth]);

  useEffect(() => {
    if (!isActive) return;
    // Captura cada 0.5s (500ms) de forma continua, siempre mostrando los últimos 15s
    const interval = setInterval(() => {
      const t0 = currentTime / 1000;
      const newSpectralData = generateSpectralData(t0);
      setSpectrogramData(prevData => {
        const newData = [...prevData, {
          time: currentTime,
          spectrum: newSpectralData
        }];
        // Mantener solo los últimos 30 datos (15s)
        return newData.slice(-30);
      });
      setCurrentTime(prev => prev + 500);
    }, 500);
    return () => clearInterval(interval);
  }, [isActive, currentTime, generateSpectralData]);

  // Dibujar el espectrograma
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || spectrogramData.length === 0) return;

  const ctx = canvas.getContext('2d');
  const { width, height } = config;
    
  // Fondo negro puro, sin gradiente ni relleno adicional
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();

  // Definir steps para el espectrograma
  // const timeStep = width / config.maxDataPoints; // Eliminada variable no usada
  const freqStep = height / config.frequencyBins;
  // Tamaño mínimo de punto para mejor visibilidad
  // minPointWidth y minPointHeight eliminados porque no se usan

      // Espectrograma clásico: fondo negro, señal en escala de grises según intensidad
      // Espectrograma tipo scroll: cada espectro en la siguiente columna
      // Cuando se llena la ventana, se desplaza todo a la izquierda
  // const nPoints = spectrogramData.length; // Eliminada variable no usada
      const nPoints = spectrogramData.length;
      const xStep = width / Math.max(1, nPoints - 1);
      spectrogramData.forEach((dataPoint, i) => {
        // Para que el último punto llegue al borde derecho, usar:
        const x = i * xStep;
        dataPoint.spectrum.forEach((intensity, freqIndex) => {
          const y = height - ((freqIndex) / (dataPoint.spectrum.length - 1)) * height;
          let colorIntensity = Math.pow(intensity, 0.7);
          ctx.fillStyle = jetColor(colorIntensity);
          ctx.fillRect(
            x,
            y,
            Math.ceil(xStep),
            Math.max(freqStep, 2)
          );
        });
      });
    
    // Línea de frecuencia objetivo eliminada según solicitud
    
  }, [spectrogramData, signalFrequency, config, frequencyRange]);

  const clearSpectrogram = () => {
    setSpectrogramData([]);
    setCurrentTime(0);
    // Forzar borrado visual inmediato del canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  // Permitir limpiar desde fuera usando window.__INTRATEL_CLEAR_SPECTROGRAM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__INTRATEL_CLEAR_SPECTROGRAM = clearSpectrogram;
    }
    return () => {
      if (typeof window !== 'undefined' && window.__INTRATEL_CLEAR_SPECTROGRAM) {
        delete window.__INTRATEL_CLEAR_SPECTROGRAM;
      }
    };
  }, []);

  return (
    <div className={styles.spectrogramContainer}>
      <div className={styles.header}>
        <h4>📊 Espectrograma en Tiempo Real</h4>
        <button 
          className={styles.clearButton}
          onClick={clearSpectrogram}
          title="Limpiar espectrograma"
        >
          🗑️
        </button>
      </div>
      
      <div className={styles.canvasContainer}>
        <canvas 
          ref={canvasRef}
          className={styles.canvas}
          width={config.width}
          height={config.height}
        />
        {/* Etiquetas de ejes eliminadas según solicitud */}
      </div>
      

      {/* Barra de intensidad eliminada */}
      
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span>🕒 Ventana: {timeWindow}s</span>
        </div>
        <div className={styles.infoItem}>
          <span>📈 Resolución: {config.timeResolution}ms</span>
        </div>
        <div className={styles.infoItem}>
          <span>🎯 Freq. Objetivo: {typeof window !== 'undefined' && window.__INTRATEL_TARGET_FREQ ? `${window.__INTRATEL_TARGET_FREQ.toFixed(1)} MHz` : (signalFrequency > 0 ? `${signalFrequency.toFixed(1)} MHz` : 'No definida')}</span>
        </div>
      </div>
    </div>
  );
};

export default Spectrogram;