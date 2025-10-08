import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CodeEditor } from './components/CodeEditor.jsx';
import { DevicePreview } from './components/DevicePreview.jsx';
import { ElementLibrary } from './components/ElementLibrary.jsx';
import { GameHeader } from './components/GameHeader.jsx';
import { ProgressTracker } from './components/ProgressTracker.jsx';
import { FlagPopup } from './components/FlagPopup.jsx';
import { generateCSS, validateLevel } from './utils/cssGenerator.js';
import { LEVELS } from './config/levelData.js';
import Footer from '../../Footer/Footer.jsx';
import styles from './CSSCodeGame.module.css';

const GAME_STATE_KEY = 'cssCodeGame_state';

const saveGameState = (state) => {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('No se pudo guardar el estado del juego:', error);
  }
};

const loadGameState = () => {
  try {
    const saved = localStorage.getItem(GAME_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('No se pudo cargar el estado del juego:', error);
    return null;
  }
};

const createInitialState = () => ({
  currentLevel: 0,
  completedLevels: [],
  cssProperties: {},
  deviceType: 'web', // 'web' | 'mobile'
  showHints: true,
  attempts: 0
});

export default function CSSCodeGame() {
  // Cargar estado guardado o crear inicial
  const [gameState, setGameState] = useState(() => {
    const savedState = loadGameState();
    return savedState || createInitialState();
  });

  const [cssProperties, setCssProperties] = useState(gameState.cssProperties || {});
  const [currentLevel, setCurrentLevel] = useState(gameState.currentLevel || 0);
  const [completedLevels, setCompletedLevels] = useState(gameState.completedLevels || []);
  const [deviceType, setDeviceType] = useState(gameState.deviceType || 'web');
  const [showHints, setShowHints] = useState(gameState.showHints ?? true);
  const [attempts, setAttempts] = useState(gameState.attempts || 0);
  const [notification, setNotification] = useState(null);
  const [flagPopup, setFlagPopup] = useState({ isOpen: false, level: null });

  // Efecto para guardar automáticamente el estado cuando cambie
  useEffect(() => {
    const stateToSave = {
      currentLevel,
      completedLevels,
      cssProperties,
      deviceType,
      showHints,
      attempts,
      lastSaved: new Date().toISOString()
    };
    
    saveGameState(stateToSave);
  }, [currentLevel, completedLevels, cssProperties, deviceType, showHints, attempts]);

  const level = LEVELS[currentLevel];

  // Generar CSS completo
  const generatedCSS = useMemo(() => {
    return generateCSS(cssProperties, level?.baseCSS || '');
  }, [cssProperties, level]);

  // Mostrar notificación
  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);

  // Manejar drag & drop de propiedades CSS
  const handlePropertyDrop = useCallback((property, value, selector = '.target-element') => {
    setCssProperties(prev => ({
      ...prev,
      [selector]: {
        ...prev[selector],
        [property]: value
      }
    }));
  }, []);

  // Remover propiedad CSS
  const removeProperty = useCallback((selector, property) => {
    setCssProperties(prev => {
      const newState = { ...prev };
      if (newState[selector]) {
        delete newState[selector][property];
        if (Object.keys(newState[selector]).length === 0) {
          delete newState[selector];
        }
      }
      return newState;
    });
  }, []);

  // Limpiar todas las propiedades
  const clearAllProperties = useCallback(() => {
    setCssProperties({});
    showNotification('Todas las propiedades han sido eliminadas', 'info');
  }, [showNotification]);

  // Validar nivel actual
  const validateCurrentLevel = useCallback(() => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isValid = validateLevel(cssProperties, level);
    
    if (isValid) {
      const newCompletedLevels = [...completedLevels];
      if (!newCompletedLevels.includes(currentLevel)) {
        newCompletedLevels.push(currentLevel);
      }
      setCompletedLevels(newCompletedLevels);
      
      // Mostrar popup de bandera personalizada
      setFlagPopup({ isOpen: true, level: currentLevel });
      
      // Auto-avanzar al siguiente nivel después de cerrar el popup (excepto último nivel)
      // Esta lógica se manejará en el callback de cerrar popup
    } else {
      showNotification(`Intento ${newAttempts}: El resultado no coincide con el objetivo. ¡Sigue intentando!`, 'error');
    }
  }, [cssProperties, level, currentLevel, completedLevels, attempts, showNotification]);

  // Cambiar nivel
  const changeLevel = useCallback((levelIndex) => {
    setCurrentLevel(levelIndex);
    setCssProperties({});
    setAttempts(0);
  }, []);

  // Cerrar popup de bandera
  const closeFlagPopup = useCallback(() => {
    const wasLastLevel = flagPopup.level === LEVELS.length - 1;
    setFlagPopup({ isOpen: false, level: null });
    
    // Auto-avanzar al siguiente nivel si no es el último
    if (!wasLastLevel && flagPopup.level !== null && flagPopup.level < LEVELS.length - 1) {
      setTimeout(() => {
        setCurrentLevel(flagPopup.level + 1);
        setCssProperties({});
        setAttempts(0);
      }, 300);
    }
  }, [flagPopup.level]);

  // Resetear progreso
  const resetProgress = useCallback(() => {
    try {
      localStorage.removeItem(GAME_STATE_KEY);
      setCurrentLevel(0);
      setCompletedLevels([]);
      setCssProperties({});
      setAttempts(0);
      setDeviceType('web');
      setShowHints(true);
      setFlagPopup({ isOpen: false, level: null });
      showNotification('Progreso reiniciado', 'info');
    } catch (error) {
      showNotification('Error al reiniciar progreso', 'error');
    }
  }, [showNotification]);

  return (
    <div className={styles.cssCodeGame}>
      <GameHeader
        level={level}
        currentLevel={currentLevel}
        totalLevels={LEVELS.length}
        completedLevels={completedLevels}
        onLevelChange={changeLevel}
        onDeviceTypeChange={setDeviceType}
        deviceType={deviceType}
        onToggleHints={() => setShowHints(!showHints)}
        showHints={showHints}
        onResetProgress={resetProgress}
        onValidateLevel={validateCurrentLevel}
        attempts={attempts}
      />

      {notification && (
        <div className={`${styles.notification} ${styles[notification.type]}`}>
          {notification.message}
        </div>
      )}

      <div className={styles.gameContent}>
        <div className={styles.leftPanel}>
          <ElementLibrary
            level={level}
            onPropertyDrop={handlePropertyDrop}
            showHints={showHints}
          />
          
          <ProgressTracker
            currentLevel={currentLevel}
            completedLevels={completedLevels}
            totalLevels={LEVELS.length}
            attempts={attempts}
          />
        </div>

        <div className={styles.centerPanel}>
          <CodeEditor
            cssProperties={cssProperties}
            generatedCSS={generatedCSS}
            onRemoveProperty={removeProperty}
            onClearAll={clearAllProperties}
            level={level}
          />
        </div>

        <div className={styles.rightPanel}>
          <DevicePreview
            css={generatedCSS}
            html={level?.html || ''}
            deviceType={deviceType}
            expectedResult={level?.expectedResult}
            showExpected={showHints}
          />
        </div>
      </div>
      
      {/* Footer con créditos de todos los creadores */}
      <Footer />
      
      {/* Popup de banderas */}
      <FlagPopup
        level={flagPopup.level}
        isOpen={flagPopup.isOpen}
        onClose={closeFlagPopup}
      />
    </div>
  );
}