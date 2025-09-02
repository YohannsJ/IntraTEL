import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getApiUrl, getAuthHeaders, logError } from '../../config';
import styles from './FlagSubmitter.module.css';

const FlagSubmitter = () => {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [flagValue, setFlagValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!flagValue.trim()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(getApiUrl('/flags/submit'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ flag: flagValue.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.alreadySubmittedByGroup) {
          setMessage({ 
            type: 'warning', 
            text: data.message || '⚠️ Flag correcta, pero ya fue subida por tu equipo.'
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: data.message || '🎉 ¡Flag válida! Has ganado puntos.' 
          });
        }
        setFlagValue('');
        setTimeout(() => {
          setIsOpen(false);
          setMessage({ type: '', text: '' });
        }, 3000);
      } else {
        if (response.status === 500) {
          setMessage({ 
            type: 'error', 
            text: '❌ Flag incorrecta o no existe' 
          });
        } else {
          setMessage({ 
            type: 'error', 
            text: data.message || 'Flag inválida' 
          });
        }
      }
    } catch (error) {
      logError('Error enviando flag:', error);
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setFlagValue('');
    setMessage({ type: '', text: '' });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Botón flotante */}
      <button 
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        title="Enviar Flag"
      >
        🏁
      </button>

      {/* Modal */}
      {isOpen && (
        <div className={styles.modal} onClick={handleClose}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Enviar Flag</h3>
              <button 
                className={styles.closeButton}
                onClick={handleClose}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="flag">Ingresa tu flag:</label>
                <input
                  type="text"
                  id="flag"
                  value={flagValue}
                  onChange={(e) => setFlagValue(e.target.value)}
                  placeholder="FLAG{...}"
                  className={styles.flagInput}
                  disabled={loading}
                  autoFocus
                />
              </div>

              {message.text && (
                <div className={`${styles.message} ${styles[message.type]}`}>
                  {message.text}
                </div>
              )}

              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleClose}
                  className={styles.cancelButton}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={loading || !flagValue.trim()}
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>

            <div className={styles.helpText}>
              <p>💡 Las flags son códigos especiales que puedes encontrar completando desafíos.</p>
              <p>Formato típico: <code>FLAG{'{contenido}'}</code></p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagSubmitter;
