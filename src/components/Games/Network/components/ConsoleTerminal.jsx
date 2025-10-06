import React, { useContext, useEffect, useRef, useState } from 'react';
import { IOSEngineContext } from '../lib/iosEngine.jsx';

export default function ConsoleTerminal({ type, persistentState, setPersistentState }) {
  const { routerEngine, pcEngine, ctx } = useContext(IOSEngineContext);
  const engine = type === 'router' ? routerEngine : pcEngine;
  
  // Usar estado persistente del padre si está disponible
  const [lines, setLines] = useState(persistentState?.lines || []);
  const [cmd, setCmd] = useState('');
  const [isConnected, setIsConnected] = useState(persistentState?.isConnected ?? false);
  const [commandHistory, setCommandHistory] = useState(persistentState?.commandHistory || []);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPinging, setIsPinging] = useState(false);
  const outRef = useRef(null);

  // Sincronizar cambios de estado local con el estado persistente
  useEffect(() => {
    if (setPersistentState) {
      setPersistentState({
        lines,
        commandHistory,
        isConnected
      });
    }
  }, [lines, commandHistory, isConnected, setPersistentState]);

  useEffect(() => {
    if (outRef.current) {
      outRef.current.scrollTop = outRef.current.scrollHeight;
    }
  }, [lines]);

  // Verificar conexión solo al montar el componente y si no hay líneas previas
  useEffect(() => {
    // Solo mostrar mensajes iniciales si es la primera vez (sin estado persistente)
    if (lines.length === 0) {
      checkConnection();
    }
  }, []); // Solo una vez al montar

  function handleRefresh() {
    const connected = engine.checkConnection();
    const wasConnected = isConnected;
    setIsConnected(connected);
    
    const prompt = type === 'router' ? (isConnected ? engine.getPrompt() : 'Desconectado>') : engine.getPrompt();
    
    if (connected) {
      const refreshMsg = '✅ Conexión verificada correctamente.\nD1ft3l{F1rst_St3p.Ph1s1c4l_L4y3r}';
      setLines(prev => [...prev, prompt + ' refresh', refreshMsg, '']);
      
      // Si cambió de desconectado a conectado, mostrar mensajes de bienvenida
      if (!wasConnected && type === 'router') {
        setLines(prev => [
          ...prev,
          'Conexión establecida con el router.',
          'Escribe "enable" para acceder al modo privilegiado.',
          ''
        ]);
      }
    } else {
      // Sin conexión - mostrar instrucciones
      if (type === 'router') {
        setLines(prev => [
          ...prev,
          prompt + ' refresh',
          '❌ Sin conexión física. Verifica que estén conectados:',
          '   • Router ↔ Switch',
          '   • PC ↔ Switch',
          '',
          'Conecta los cables en la topología y vuelve a ejecutar "refresh".',
          ''
        ]);
      } else {
        // PC
        setLines(prev => [
          ...prev,
          prompt + ' refresh',
          '❌ Sin conexión de red. Verifica el cableado:',
          '   • PC ↔ Switch ↔ Router',
          ''
        ]);
      }
    }
  }

  function checkConnection() {
    const connected = engine.checkConnection();
    const wasConnected = isConnected;
    setIsConnected(connected);

    // Mensajes iniciales según el tipo
    if (type === 'router') {
      if (connected && !wasConnected) {
        setLines(prev => [
          ...prev,
          'Conexión establecida con el router.',
          'Escribe "enable" para acceder al modo privilegiado.',
          'Usa "help" o "?" para ver comandos disponibles.',
          ''
        ]);
      } else if (!connected && lines.length === 0) {
        setLines([
          'Error: No hay conexión entre router y switch.',
          'Para acceder a la consola, debes conectar:',
          '- Router ↔ Switch',
          '- PC ↔ Switch',
          '',
          'Conecta los dispositivos en la topología y escribe "refresh".'
        ]);
      }
    } else {
      // PC
      if (lines.length === 0) {
        setLines([
          'Microsoft Windows [Version 10.0.19045.3803]',
          '(c) IntraTEL Corporation. All rights reserved.',
          '',
          'C:\\Users\\Student> _',
          ''
        ]);
      }
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

  function submit(e) {
    e.preventDefault();
    if (!cmd.trim() || isPinging) return;

    // Agregar comando al historial
    if (cmd.trim() && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd.trim())) {
      setCommandHistory(prev => [...prev, cmd.trim()]);
    }
    setHistoryIndex(-1);

    // Para router, verificar conexión antes de comandos (excepto refresh)
    if (type === 'router' && !isConnected) {
      if (cmd.trim().toLowerCase() === 'refresh') {
        handleRefresh();
        setCmd('');
        return;
      }
      setLines(l => [...l, 'Desconectado> ' + cmd, 'Error: Sin conexión. Usa "refresh" para verificar conexión.', '']);
      setCmd('');
      return;
    }

    // Para PC, manejar refresh también
    if (type === 'pc' && cmd.trim().toLowerCase() === 'refresh') {
      handleRefresh();
      setCmd('');
      return;
    }

    const prompt = engine.getPrompt();
    const commandLine = prompt + ' ' + cmd;

    // Manejar comando cls (limpiar pantalla) - solo para PC
    if (type === 'pc' && cmd.trim().toLowerCase() === 'cls') {
      setLines([]);
      setCmd('');
      return;
    }

    // Manejar ping especial con delay
    if (cmd.trim().toLowerCase().startsWith('ping')) {
      setIsPinging(true);
      setLines(l => [...l, commandLine, '']);

      const pingCallback = (newLines) => {
        setLines(l => [...l, ...newLines]);
      };

      // Ejecutar ping async
      const result = engine.handle(cmd, pingCallback);
      if (result && result.then) {
        result.then(() => {
          setIsPinging(false);
        }).catch(() => {
          setIsPinging(false);
        });
      } else {
        setIsPinging(false);
      }

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
    if (line.includes('> ') || line.includes('# ') || line.includes('(config)# ') || line.includes('(config-if)# ') || line.includes('$ ')) {
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
    else if (line.includes('🏆') || line.includes('FELICITACIONES') || line.includes('Excelente trabajo') || line.includes('✅')) {
      return <div key={index} className="console-success">{line}</div>;
    }
    // Si la línea es una respuesta del sistema o error
    else if (line.startsWith('%') || line.startsWith('Error:') || line.includes('❌')) {
      return <div key={index} className="console-error">{line}</div>;
    }
    // Respuesta normal del sistema
    else {
      return <div key={index} className="console-response">{line}</div>;
    }
  }

  const promptText = type === 'router' 
    ? (isConnected ? engine.getPrompt() : 'Desconectado>')
    : engine.getPrompt();

  const placeholderText = type === 'router'
    ? (isConnected ? (isPinging ? "Ejecutando ping..." : "") : "Escribe 'refresh' para verificar conexión")
    : (isPinging ? "Ejecutando ping..." : "Escribe un comando...");

  // Router: solo deshabilitar si está haciendo ping, SIEMPRE permitir escribir
  // PC: solo deshabilitar si está haciendo ping
  const inputDisabled = isPinging;

  return (
    <div className="console-container">
      <div ref={outRef} className="console-box">
        {lines.map((l, i) => renderLine(l, i))}
      </div>
      <form onSubmit={submit} className="console-input-container">
        <span className="console-prompt">{promptText}</span>
        <input
          className="console-input"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          disabled={inputDisabled}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
