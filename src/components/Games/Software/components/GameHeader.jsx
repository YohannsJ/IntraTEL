import React from 'react';
import styles from './GameHeader.module.css';

export function GameHeader({
  level,
  currentLevel,
  totalLevels,
  completedLevels,
  onLevelChange,
  onDeviceTypeChange,
  deviceType,
  onToggleHints,
  showHints,
  onResetProgress,
  onValidateLevel,
  attempts
}) {
  return (
    <header className={styles.gameHeader}>
      <div className={styles.titleSection}>
        <h1 className={styles.gameTitle}>
          CSS Code Game
        </h1>
        <p className={styles.gameSubtitle}>
          Aprende CSS arrastrando propiedades y viendo cambios en tiempo real
        </p>
      </div>

      <div className={styles.levelSection}>
        <div className={styles.levelInfo}>
          <h2 className={styles.levelTitle}>
            Nivel {currentLevel + 1}: {level?.title || 'Cargando...'}
          </h2>
          <p className={styles.levelDescription}>
            {level?.description || ''}
          </p>
        </div>

        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(completedLevels.length / totalLevels) * 100}%` }}
          />
          <span className={styles.progressText}>
            {completedLevels.length}/{totalLevels} niveles completados
          </span>
        </div>
      </div>

      <div className={styles.controls}>
        <select
          className={styles.levelSelect}
          value={currentLevel}
          onChange={(e) => onLevelChange(parseInt(e.target.value))}
        >
          {Array.from({ length: totalLevels }, (_, i) => (
            <option key={i} value={i}>
              Nivel {i + 1} {completedLevels.includes(i) ? '✅' : ''}
            </option>
          ))}
        </select>

        <div className={styles.deviceToggle}>
          <button
            className={`${styles.deviceButton} ${deviceType === 'web' ? styles.active : ''}`}
            onClick={() => onDeviceTypeChange('web')}
            title="Vista web"
          >
            🖥️ Web
          </button>
          <button
            className={`${styles.deviceButton} ${deviceType === 'mobile' ? styles.active : ''}`}
            onClick={() => onDeviceTypeChange('mobile')}
            title="Vista móvil"
          >
            📱 Móvil
          </button>
        </div>

        <button
          className={`${styles.controlButton} ${showHints ? styles.active : ''}`}
          onClick={onToggleHints}
          title="Mostrar/ocultar pistas"
        >
          💡 Pistas
        </button>

        <button
          className={`${styles.controlButton} ${styles.validateButton}`}
          onClick={onValidateLevel}
          title="Validar el nivel actual"
        >
          ✅ Validar
        </button>

        <button
          className={`${styles.controlButton} ${styles.resetButton}`}
          onClick={onResetProgress}
          title="Reiniciar todo el progreso"
        >
          🔄 Reset
        </button>

        {attempts > 0 && (
          <div className={styles.attemptsCounter}>
            Intentos: {attempts}
          </div>
        )}
      </div>
    </header>
  );
}