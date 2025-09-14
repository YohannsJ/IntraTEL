import React, { createContext, useContext, useState, useEffect } from 'react';

// Definición de temas
const themes = {
  dark: {
    // Colores principales
    primary: '#0369a1',
    primaryHover: '#0284c7',
    secondary: '#059669',
    secondaryHover: '#047857',
    
    // Fondos
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',
    surface: '#020617',
    surfaceSecondary: '#0b1220',
    
    // Textos
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',
    
    // Bordes
    border: '#475569',
    borderSecondary: '#374151',
    borderAccent: '#64748b',
    
    // Estados
    success: '#10b981',
    successLight: '#064e3b20',
    successDark: '#065f46',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Componentes específicos
    circuit: {
      background: '#020617',
      wire: '#94a3b8',
      wireActive: '#10b981',
      wireInactive: '#6b7280',
      port: '#475569',
      portActive: '#f59e0b',
      gate: '#0f172a',
      gateBorder: '#94a3b8',
      workArea: '#475569'
    },
    
    // Tabla de verdad
    table: {
      background: '#020617',
      headerBg: '#1e293b',
      cellBg: '#0f172a',
      borderColor: '#475569',
      textPrimary: '#f1f5f9',
      textSecondary: '#cbd5e1',
      highlightHigh: '#10b981',
      highlightLow: '#6b7280',
      highlightUndefined: '#f59e0b'
    }
  },
  
  light: {
    // Colores principales
    primary: '#2563eb',
    primaryHover: '#1d4ed8',
    secondary: '#059669',
    secondaryHover: '#047857',
    
    // Fondos
    background: '#ffffff',
    backgroundSecondary: '#f8fafc',
    backgroundTertiary: '#e2e8f0',
    surface: '#ffffff',
    surfaceSecondary: '#f1f5f9',
    
    // Textos
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    
    // Bordes
    border: '#d1d5db',
    borderSecondary: '#e5e7eb',
    borderAccent: '#94a3b8',
    
    // Estados
    success: '#059669',
    successLight: '#dcfce720',
    successDark: '#166534',
    warning: '#d97706',
    error: '#dc2626',
    info: '#2563eb',
    
    // Componentes específicos
    circuit: {
      background: '#ffffff',
      wire: '#6b7280',
      wireActive: '#059669',
      wireInactive: '#d1d5db',
      port: '#9ca3af',
      portActive: '#d97706',
      gate: '#f9fafb',
      gateBorder: '#6b7280',
      workArea: '#d1d5db'
    },
    
    // Tabla de verdad
    table: {
      background: '#ffffff',
      headerBg: '#f8fafc',
      cellBg: '#ffffff',
      borderColor: '#d1d5db',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      highlightHigh: '#059669',
      highlightLow: '#6b7280',
      highlightUndefined: '#d97706'
    }
  }
};

// Contexto del tema
const ThemeContext = createContext();

// Hook para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

// Provider del tema
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  
  // Cargar tema guardado del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('intratel-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);
  
  // Guardar tema en localStorage
  useEffect(() => {
    localStorage.setItem('intratel-theme', currentTheme);
    
    // Aplicar variables CSS globales
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    // Variables CSS principales
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-secondary-hover', theme.secondaryHover);
    root.style.setProperty('--theme-background', theme.background);
    root.style.setProperty('--theme-background-secondary', theme.backgroundSecondary);
    root.style.setProperty('--theme-background-tertiary', theme.backgroundTertiary);
    root.style.setProperty('--theme-surface', theme.surface);
    root.style.setProperty('--theme-surface-secondary', theme.surfaceSecondary);
    root.style.setProperty('--theme-text', theme.text);
    root.style.setProperty('--theme-text-secondary', theme.textSecondary);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-border', theme.border);
    root.style.setProperty('--theme-border-secondary', theme.borderSecondary);
    root.style.setProperty('--theme-border-accent', theme.borderAccent);
    root.style.setProperty('--theme-success', theme.success);
    root.style.setProperty('--theme-success-light', theme.successLight);
    root.style.setProperty('--theme-success-dark', theme.successDark);
    root.style.setProperty('--theme-warning', theme.warning);
    root.style.setProperty('--theme-error', theme.error);
    root.style.setProperty('--theme-info', theme.info);
    
    // Variables específicas del circuito
    root.style.setProperty('--theme-circuit-background', theme.circuit.background);
    root.style.setProperty('--theme-circuit-wire', theme.circuit.wire);
    root.style.setProperty('--theme-circuit-wire-active', theme.circuit.wireActive);
    root.style.setProperty('--theme-circuit-wire-inactive', theme.circuit.wireInactive);
    root.style.setProperty('--theme-circuit-port', theme.circuit.port);
    root.style.setProperty('--theme-circuit-port-active', theme.circuit.portActive);
    root.style.setProperty('--theme-circuit-gate', theme.circuit.gate);
    root.style.setProperty('--theme-circuit-gate-border', theme.circuit.gateBorder);
    root.style.setProperty('--theme-circuit-work-area', theme.circuit.workArea);
    
    // Variables de tabla
    root.style.setProperty('--theme-table-background', theme.table.background);
    root.style.setProperty('--theme-table-header-bg', theme.table.headerBg);
    root.style.setProperty('--theme-table-cell-bg', theme.table.cellBg);
    root.style.setProperty('--theme-table-border-color', theme.table.borderColor);
    root.style.setProperty('--theme-table-text-primary', theme.table.textPrimary);
    root.style.setProperty('--theme-table-text-secondary', theme.table.textSecondary);
    root.style.setProperty('--theme-table-highlight-high', theme.table.highlightHigh);
    root.style.setProperty('--theme-table-highlight-low', theme.table.highlightLow);
    root.style.setProperty('--theme-table-highlight-undefined', theme.table.highlightUndefined);
    
  }, [currentTheme]);
  
  const toggleTheme = () => {
    setCurrentTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };
  
  const setTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };
  
  const value = {
    currentTheme,
    theme: themes[currentTheme],
    themes,
    toggleTheme,
    setTheme
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
