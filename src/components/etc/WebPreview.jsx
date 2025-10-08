import React from 'react';
import styles from './WebPreview.module.css';

/**
 * Componente que muestra un preview de una página web en formato móvil vertical
 * Al hacer click, redirige a la página web
 */
export default function WebPreview({ url, title, className = "" }) {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`${styles.previewContainer} ${className}`}>
      <div className={styles.phoneFrame}>
        <div className={styles.phoneNotch}></div>
        <div className={styles.phoneContent} onClick={handleClick}>
          <iframe
            src={url}
            title={title}
            className={styles.iframe}
            sandbox="allow-same-origin allow-scripts allow-popups"
            loading="lazy"
          />
          <div className={styles.clickOverlay}>
            <div className={styles.clickHint}>
              <span className={styles.icon}>🌐</span>
              <span className={styles.text}>Haz click para visitar</span>
              <span className={styles.domain}>{title}</span>
            </div>
          </div>
        </div>
        <div className={styles.phoneButton}></div>
      </div>
    </div>
  );
}
