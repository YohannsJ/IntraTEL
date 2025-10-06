import React, { useState } from 'react';
import ConsoleTerminal from './ConsoleTerminal.jsx';
import styles from '../Network.module.css';

export default function ConsoleWithTabs() {
  const [activeTab, setActiveTab] = useState('router'); // 'router' o 'pc'
  
  // Mantener el estado de cada consola de forma independiente
  const [routerState, setRouterState] = useState({
    lines: [],
    commandHistory: [],
    isConnected: false
  });
  
  const [pcState, setPcState] = useState({
    lines: [],
    commandHistory: [],
    isConnected: true // PC siempre empieza como "conectado" a nivel local
  });

  return (
    <div className={styles.consoleTabsContainer}>
      <div className={styles.consoleTabs}>
        <button
          className={`${styles.consoleTab} ${activeTab === 'router' ? styles.active : ''}`}
          onClick={() => setActiveTab('router')}
        >
          🔧 Router
        </button>
        <button
          className={`${styles.consoleTab} ${activeTab === 'pc' ? styles.active : ''}`}
          onClick={() => setActiveTab('pc')}
        >
          💻 PC
        </button>
      </div>
      
      <div className={styles.consoleContent}>
        {activeTab === 'router' && (
          <ConsoleTerminal 
            type="router" 
            persistentState={routerState}
            setPersistentState={setRouterState}
          />
        )}
        {activeTab === 'pc' && (
          <ConsoleTerminal 
            type="pc" 
            persistentState={pcState}
            setPersistentState={setPcState}
          />
        )}
      </div>
    </div>
  );
}
