import React, { useState, useEffect } from 'react';
import styles from './StylishAlert.module.css';

const StylishAlert = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  flagValue = null,
  showCopyButton = false,
  autoClose = false,
  autoCloseDelay = 5000 
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  const copyToClipboard = async () => {
    if (flagValue) {
      try {
        await navigator.clipboard.writeText(flagValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '🎉';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'flag': return '🚩';
      default: return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success': return styles.success;
      case 'error': return styles.error;
      case 'warning': return styles.warning;
      case 'flag': return styles.flag;
      default: return styles.info;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={`${styles.alert} ${getTypeClass()}`}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{getIcon()}</span>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.message}>{message}</p>
          
          {flagValue && (
            <div className={styles.flagContainer}>
              <div className={styles.flagValue}>
                <code className={styles.flagCode}>{flagValue}</code>
                {showCopyButton && (
                  <button 
                    className={styles.copyButton}
                    onClick={copyToClipboard}
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <span className={styles.copyIcon}>✓</span>
                        Copiado
                      </>
                    ) : (
                      <>
                        <span className={styles.copyIcon}>📋</span>
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button className={styles.closeButton} onClick={onClose}>
          <span className={styles.closeIcon}>×</span>
        </button>
        
        {autoClose && (
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ animationDuration: `${autoCloseDelay}ms` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylishAlert;
