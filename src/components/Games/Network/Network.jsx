import React, { useMemo, useState, useRef } from 'react';
import styles from './Network.module.css';
import Topology from './components/Topology.jsx';
import ConsoleWithTabs from './components/ConsoleWithTabs.jsx';
import { createInitialTopology } from './lib/topologyState.js';
import { IOSProvider } from './lib/iosEngine.jsx';

export default function Network(){
  const [topo, setTopo] = useState(createInitialTopology());
  const [status, setStatus] = useState('');
  const [objectiveDone, setObjectiveDone] = useState(false);

  // Mantener ctx estable usando ref para topo actual
  const ctxRef = useRef({ topo, setTopo, setStatus, setObjectiveDone });
  // Actualizar ref cuando cambien los valores, pero no recrear el objeto ctx
  ctxRef.current.topo = topo;
  ctxRef.current.setTopo = setTopo;
  ctxRef.current.setStatus = setStatus;
  ctxRef.current.setObjectiveDone = setObjectiveDone;
  
  // ctx estable (solo se crea una vez)
  const ctx = useMemo(() => ctxRef.current, []);

  return (
    <IOSProvider ctx={ctx}>
      <header className={styles.gameHeader}>
        <div className={styles.title}>
          <h1>Network Challenge</h1>
          <p>Conecta Router↔Switch y PC↔Switch. Configura <code>fa0/0 = 192.168.1.1/24</code>, <code>no shutdown</code> y prueba <code>ping 192.168.1.10</code>.</p>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.btnGhost}
            onClick={()=>{
              setTopo(createInitialTopology());
              setStatus('');
              setObjectiveDone(false);
            }}
          >
            Reiniciar
          </button>
        </div>
      </header>

      <main className={styles.grid}>
        <section className={styles.left}>
          <div className={`${styles.panel} ${styles.canvas}`}>
            <Topology topo={topo} setTopo={setTopo} />
          </div>

          <div className={styles.legend}>
            <span><i className={`${styles.dot} ${styles.ok}`}></i>Cable correcto</span>
            <span><i className={`${styles.dot} ${styles.err}`}></i>Cable inválido</span>
          </div>
        </section>

        <section className={styles.right}>
          <div className={styles.panel}>
            <h3>Consola</h3>
            <ConsoleWithTabs />
          </div>

          <div className={styles.panel}>
            <h3>Estado</h3>
            <pre className={styles.status}>{status || 'Sin cambios aún...'}</pre>
          </div>

          <div className={styles.panel}>
            <h3>Objetivo</h3>
            <ul className={styles.objectives}>
              <li>Conectar Router↔Switch y PC↔Switch (clic en dos puertos para crear cada cable).</li>
              <li>Consola Router: Escribe <code>refresh</code> para habilitar la consola tras conectar cables.</li>
              <li>Configurar: <code>enable → conf t → interface fa0/0 → ip address 192.168.1.1 255.255.255.0 → no shutdown</code></li>
              <li>Validar: <code>show ip int brief</code> (en consola Router)</li>
              <li>Consola PC: <code>ping 192.168.1.1</code> para probar conectividad</li>
            </ul>
            {objectiveDone && (
              <div className={styles.successPanel}>
                <p className={styles.success}>🏆 ¡Desafío completado!</p>
                <p className={styles.flagMessage}>🚩 Revisa la consola para obtener tu FLAG</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </IOSProvider>
  );
}
Network.displayName = 'R3d3s - Network Challenge';