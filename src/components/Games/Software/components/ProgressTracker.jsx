import React from 'react';
import styles from './ProgressTracker.module.css';

export function ProgressTracker({ 
  currentLevel, 
  completedLevels, 
  totalLevels, 
  attempts 
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
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Nivel actual:</span>
          <span className={styles.statValue}>
            {currentLevel + 1}/{totalLevels}
            {isCurrentLevelCompleted && <span className={styles.completedBadge}>✅</span>}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Completados:</span>
          <span className={styles.statValue}>
            {completedLevels.length}/{totalLevels}
          </span>
        </div>

        <div className={styles.statItem}>
          <span className={styles.statLabel}>Intentos:</span>
          <span className={styles.statValue}>
            {attempts}
          </span>
        </div>
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
          >
            {index + 1}
          </div>
        ))}
      </div>

      {completedLevels.length > 0 && (
        <div className={styles.achievements}>
          <div className={styles.achievementHeader}>
            <span className={styles.achievementIcon}>🏆</span>
            <span className={styles.achievementTitle}>Logros</span>
          </div>
          
          <div className={styles.achievementsList}>
            {getAchievements(completedLevels.length, totalLevels).map((achievement, index) => (
              <div key={index} className={styles.achievement}>
                <span className={styles.achievementEmoji}>{achievement.emoji}</span>
                <span className={styles.achievementText}>{achievement.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getAchievements(completed, total) {
  const achievements = [];
  
  if (completed >= 1) {
    achievements.push({
      emoji: '🎯',
      text: 'Primer nivel completado'
    });
  }
  
  if (completed >= Math.floor(total / 2)) {
    achievements.push({
      emoji: '🔥',
      text: 'Mitad del camino'
    });
  }
  
  if (completed >= Math.floor(total * 0.75)) {
    achievements.push({
      emoji: '⭐',
      text: 'Casi experto'
    });
  }
  
  if (completed === total) {
    achievements.push({
      emoji: '👑',
      text: 'Maestro CSS'
    });
  }
  
  return achievements;
}