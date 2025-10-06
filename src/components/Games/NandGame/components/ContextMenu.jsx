import React, { useState, useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';

/**
 * Menú contextual pequeño para compuertas lógicas
 * Aparece al hacer click derecho en una compuerta
 */
export function ContextMenu({ 
  isOpen, 
  position, 
  node, 
  onClose, 
  onRename, 
  onDelete 
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && node) {
      setNewName(node.label || '');
      setIsRenaming(false);
    }
  }, [isOpen, node]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Manejar teclas
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        if (isRenaming) {
          setIsRenaming(false);
          setNewName(node?.label || '');
        } else {
          onClose();
        }
      } else if (event.key === 'Enter' && isRenaming) {
        handleConfirmRename();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isRenaming, newName, node, onClose]);

  const handleStartRename = () => {
    setIsRenaming(true);
  };

  const handleConfirmRename = () => {
    if (newName.trim() && newName.trim() !== node?.label) {
      onRename(node.id, newName.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setNewName(node?.label || '');
  };

  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  if (!isOpen || !node || !position) return null;

  // Verificar si la compuerta se puede modificar
  const canModify = node.isExtra || 
    node.type === 'NAND' || 
    node.type === 'NOT' || 
    node.type === 'AND' || 
    node.type === 'OR' || 
    node.type === 'CONST';

  if (!canModify) return null;

  // Ajustar posición para evitar que se salga de la pantalla
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 180),
    y: Math.max(20, Math.min(position.y, window.innerHeight - 120))
  };

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isRenaming ? (
        <div className={styles.renameContainer}>
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.renameInput}
            placeholder="Nuevo nombre..."
            maxLength={12}
          />
          <div className={styles.renameButtons}>
            <button
              onClick={handleConfirmRename}
              className={`${styles.menuButton} ${styles.confirmButton}`}
              title="Confirmar (Enter)"
            >
              ✓
            </button>
            <button
              onClick={handleCancelRename}
              className={`${styles.menuButton} ${styles.cancelButton}`}
              title="Cancelar (Esc)"
            >
              ✕
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.menuButtons}>
          <button
            onClick={handleStartRename}
            className={styles.menuButton}
            title="Cambiar nombre"
          >
            <span className={styles.icon}>📝</span>
            <span className={styles.text}>Renombrar</span>
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.menuButton} ${styles.deleteButton}`}
            title="Eliminar compuerta"
          >
            <span className={styles.icon}>🗑️</span>
            <span className={styles.text}>Eliminar</span>
          </button>
        </div>
      )}
    </div>
  );
}
