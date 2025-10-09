import React from 'react';
import styles from './ProgressTracker.module.css';

export function ProgressTracker({ 
  currentLevel, 
  completedLevels, 
  totalLevels, 
  attempts,
  onLevelSelect 
}) {
  const progressPercentage = (completedLevels.length / totalLevels) * 100;
  const isCurrentLevelCompleted = completedLevels.includes(currentLevel);

  return (
    <div className={styles.progressTracker}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          📊 Progreso
        </h3>
      </div>

      <div className={styles.stats}>
        {/* <div className={styles.statItem}>
          <span className={styles.statLabel}>Nivel actual:</span>
          <span className={styles.statValue}>
            {currentLevel + 1}/{totalLevels}
            {isCurrentLevelCompleted && <span className={styles.completedBadge}>✅</span>}
          </span>
        </div> */}

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completados:</span>
          <span className={styles.statValue}>
            {completedLevels.length}/{totalLevels}
          </span>
        </div>

        {/* <div className={styles.statItem}>
          <span className={styles.statLabel}>Intentos:</span>
          <span className={styles.statValue}>
            {attempts}
          </span> 
        </div>*/}
      </div>

      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
        />
        <span className={styles.progressText}>
          {Math.round(progressPercentage)}%
        </span>
      </div>

      <div className={styles.levelGrid}>
        {Array.from({ length: totalLevels }, (_, index) => (
          <div
            key={index}
            className={`${styles.levelDot} ${
              completedLevels.includes(index) ? styles.completed : ''
            } ${
              index === currentLevel ? styles.current : ''
            }`}
            title={`Nivel ${index + 1}${completedLevels.includes(index) ? ' - Completado' : ''}`}
            onClick={() => onLevelSelect && onLevelSelect(index)}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}