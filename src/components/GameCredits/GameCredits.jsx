import React from 'react';
import styles from './GameCredits.module.css';

const GameCredits = ({ creator, emoji = '🎮', gameName }) => {
  return (
    <div className={styles.creditsContainer}>
      <div className={styles.creditsContent}>
        <span className={styles.creditsEmoji}>{emoji}</span>
        <div className={styles.creditsText}>
          <span className={styles.creditsLabel}>Creado por:</span>
          <a
            href={`https://github.com/${creator.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.creditsLink}
          >
            {creator.name} (@{creator.github})
          </a>
        </div>
      </div>
    </div>
  );
};

export default GameCredits;
