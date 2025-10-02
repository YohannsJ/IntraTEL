import React, { useMemo, useState } from 'react';
import styles from './Network.module.css';
import Topology from './components/Topology.jsx';
import Console from './components/Console.jsx';
import { createInitialTopology } from './lib/topologyState.js';
import { IOSProvider } from './lib/iosEngine.jsx';

export default function Network(){
  const [topo, setTopo] = useState(createInitialTopology());
  const [status, setStatus] = useState('');
  const [objectiveDone, setObjectiveDone] = useState(false);

  const ctx = useMemo(()=>({ topo, setTopo, setStatus, setObjectiveDone }),[topo]);

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
            <Console />
          </div>

          <div className={styles.panel}>
            <h3>Estado</h3>
            <pre className={styles.status}>{status || 'Sin cambios aún...'}</pre>
          </div>

          <div className={styles.panel}>
            <h3>Objetivo</h3>
            <ul className={styles.objectives}>
              <li>Conectar Router↔Switch y PC↔Switch (clic en dos puertos para crear cada cable).</li>
              <li>Consola: <code>enable → conf t → interface fa0/0 → ip address 192.168.1.1 255.255.255.0 → no shutdown</code></li>
              <li>Validar: <code>show ip int brief</code></li>
              <li>Finalizar: <code>ping 192.168.1.10</code></li>
            </ul>
            {objectiveDone && <p className={styles.success}>🏆 ¡Desafío completado!</p>}
          </div>
        </section>
      </main>
    </IOSProvider>
  );
}
Network.displayName = 'R3d3s - Network Challenge';