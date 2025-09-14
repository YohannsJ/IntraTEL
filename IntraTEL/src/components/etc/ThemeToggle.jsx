import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';

/**
 * Componente ThemeToggle - Botón para cambiar entre temas
 */
export function ThemeToggle({ className = '', style = {} }) {
  const { currentTheme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      style={{
        padding: '0.5rem',
        border: '1px solid var(--theme-border)',
        borderRadius: '0.5rem',
        backgroundColor: 'var(--theme-background-secondary)',
        color: 'var(--theme-text)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '1.25rem',
        ...style
      }}
      title={`Cambiar a tema ${currentTheme === 'dark' ? 'claro' : 'oscuro'}`}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--theme-background-tertiary)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'var(--theme-background-secondary)';
      }}
    >
      {currentTheme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}

export default ThemeToggle;
