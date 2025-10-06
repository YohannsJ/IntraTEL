import React, { useContext, useEffect, useRef, useState } from 'react';
import { IOSEngineContext } from '../lib/iosEngine.jsx';

export default function Console(){
  const { engine } = useContext(IOSEngineContext);
  const [lines, setLines] = useState([]);
  const [cmd, setCmd] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPinging, setIsPinging] = useState(false);
  const outRef = useRef(null);

  useEffect(()=>{ 
    if (outRef.current) {
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  }, [lines]);

  // Verificar conexión al montar el componente y cuando cambie la topología
  useEffect(() => {
    checkConnection();
  }, [engine]);

  function checkConnection() {
    const connected = engine.checkConnection();
    setIsConnected(connected);
    
    if (connected) {
      setLines(['Conexión establecida con el router.', 'Escribe "enable" para acceder al modo privilegiado.', 'Usa "help" o "?" para ver comandos disponibles.', '']);
    } else {
      setLines([
        'Error: No hay conexión entre router y switch.',
        'Para acceder a la consola, debes conectar:',
        '- Router ↔ Switch',
        '- PC ↔ Switch',
        '',
        'Conecta los dispositivos en la topología y escribe "refresh".'
      ]);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCmd(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCmd(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCmd('');
      }
    }
  }

  function submit(e){
    e.preventDefault();
    if (!cmd.trim() || isPinging) return;

    // Agregar comando al historial si no está vacío y no es repetido
    if (cmd.trim() && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd.trim())) {
      setCommandHistory(prev => [...prev, cmd.trim()]);
    }
    setHistoryIndex(-1);

    // Si no hay conexión, solo permitir el comando refresh
    if (!isConnected) {
      if (cmd.trim().toLowerCase() === 'refresh') {
        const refreshResult = engine.handle('refresh');
        const wasConnected = isConnected;
        checkConnection();
        const nowConnected = engine.checkConnection();
        
        setLines(l => [...l, 'Desconectado> ' + cmd, refreshResult, '']);
        
        // Si ahora hay conexión, actualizar el estado
        if (nowConnected && !wasConnected) {
          setIsConnected(true);
        }
        
        setCmd('');
        return;
      }
      setLines(l => [...l, 'Desconectado> ' + cmd, 'Error: Sin conexión. Usa "refresh" para verificar conexión.', '']);
      setCmd('');
      return;
    }

    const prompt = engine.getPrompt();
    const commandLine = prompt + ' ' + cmd;
    
    // Manejar ping especial con delay
    if (cmd.trim().toLowerCase().startsWith('ping')) {
      setIsPinging(true);
      setLines(l => [...l, commandLine, '']);
      
      const pingCallback = (newLines) => {
        setLines(l => [...l, ...newLines]);
      };
      
      // Ejecutar ping async
      engine.handle(cmd, pingCallback).then(() => {
        setIsPinging(false);
      }).catch(() => {
        setIsPinging(false);
      });
      
      setCmd('');
      return;
    }
    
    // Comando normal
    const resp = engine.handle(cmd);
    const newLines = [commandLine];
    
    if (resp) {
      if (Array.isArray(resp)) {
        newLines.push(...resp);
      } else {
        newLines.push(resp);
      }
    }
    
    setLines(l => [...l, ...newLines, ''].filter(line => line !== null));
    setCmd('');
  }

  function renderLine(line, index) {
    // Si la línea contiene un prompt seguido de un comando
    if (line.includes('> ') || line.includes('# ') || line.includes('(config)# ') || line.includes('(config-if)# ')) {
      const parts = line.split(' ');
      const prompt = parts[0];
      const command = parts.slice(1).join(' ');
      return (
        <div key={index}>
          <span className="console-response">{prompt} </span>
          <span className="console-command">{command}</span>
        </div>
      );
    }
    // Si la línea contiene FLAG
    else if (line.includes('FLAG:')) {
      return <div key={index} className="console-flag">{line}</div>;
    }
    // Si la línea es un mensaje de éxito/felicitaciones
    else if (line.includes('🏆') || line.includes('FELICITACIONES') || line.includes('Excelente trabajo')) {
      return <div key={index} className="console-success">{line}</div>;
    }
    // Si la línea es una respuesta del sistema o error
    else if (line.startsWith('%') || line.startsWith('Error:')) {
      return <div key={index} className="console-error">{line}</div>;
    }
    // Respuesta normal del sistema
    else {
      return <div key={index} className="console-response">{line}</div>;
    }
  }

  return (
    <div className="console-container">
      <div ref={outRef} className="console-box">
        {lines.map((l, i) => renderLine(l, i))}
      </div>
      <form onSubmit={submit} className="console-input-container">
        <span className="console-prompt">
          {isConnected ? engine.getPrompt() : 'Desconectado>'}
        </span>
        <input
          className="console-input"
          value={cmd}
          onChange={(e)=>setCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isConnected ? (isPinging ? "Ejecutando ping..." : "") : "refresh"}
          disabled={(!isConnected && cmd.trim().toLowerCase() !== 'refresh') || isPinging}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
