import React from 'react';
import styles from './FlagPopup.module.css';

const LEVEL_FLAGS = {
  0: {
    flag: 'D1FT3L{CSS_BASICS_MASTERED}',
    title: '🎨 ¡Fundamentos Dominados!',
    description: 'Has dominado los conceptos básicos de CSS: colores, tamaños y tipografía.',
    icon: '🏆'
  },
  1: {
    flag: 'D1FT3L{LAYOUT_CENTERING_PRO}',
    title: '📐 ¡Maestro del Centrado!',
    description: 'Has aprendido a centrar elementos y controlar el espaciado como un profesional.',
    icon: '🎯'
  },
  2: {
    flag: 'D1FT3L{BORDER_RADIUS_EXPERT}',
    title: '⭕ ¡Experto en Formas!', 
    description: 'Has dominado las formas CSS y creado círculos perfectos con border-radius.',
    icon: '🔵'
  },
  3: {
    flag: 'D1FT3L{FLEXBOX_CENTERING_PRO}',
    title: '⚡ ¡Ninja de Flexbox!',
    description: 'Has conquistado el centrado avanzado con Flexbox. ¡Eres imparable!',
    icon: '🥷'
  },
  4: {
    flag: 'D1FT3L{CSS_MASTER_COMPLETE}',
    title: '👑 ¡CSS MASTER SUPREMO!',
    description: 'Has completado todos los niveles. Eres oficialmente un maestro de CSS.',
    icon: '🏅'
  }
};

export function FlagPopup({ level, isOpen, onClose }) {
  if (!isOpen) return null;

  const flagData = LEVEL_FLAGS[level];
  
  if (!flagData) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.header}>
          <div className={styles.icon}>{flagData.icon}</div>
          <h2 className={styles.title}>{flagData.title}</h2>
        </div>
        
        <div className={styles.content}>
          <p className={styles.description}>{flagData.description}</p>
          
          <div className={styles.flagContainer}>
            <div className={styles.flagLabel}>🚩 Tu Bandera:</div>
            <div className={styles.flag}>
              <code>{flagData.flag}</code>
            </div>
          </div>
          
          {level === 4 ? (
            <div className={styles.completionMessage}>
              <p>🎉 ¡Felicitaciones! Has demostrado ser un verdadero experto en CSS.</p>
              <p>Guarda esta bandera como prueba de tu logro supremo.</p>
            </div>
          ) : (
            <div className={styles.nextLevel}>
              <p>🎯 ¡Continúa al siguiente nivel para más desafíos!</p>
            </div>
          )}
        </div>
        
        <div className={styles.footer}>
          <button className={styles.continueButton} onClick={onClose}>
            {level === 4 ? '🏆 ¡Excelente!' : '➡️ Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}