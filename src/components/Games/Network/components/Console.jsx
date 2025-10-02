import React, { useContext, useEffect, useRef, useState } from 'react';
import { IOSEngineContext } from '../lib/iosEngine.jsx';

export default function Console(){
  const { engine } = useContext(IOSEngineContext);
  const [lines, setLines] = useState([ 'Bienvenido. Escribe "enable" para comenzar.' ]);
  const [cmd, setCmd] = useState('');
  const outRef = useRef(null);

  useEffect(()=>{ outRef.current.scrollTop = outRef.current.scrollHeight }, [lines]);

  function submit(e){
    e.preventDefault();
    if (!cmd.trim()) return;
    const before = engine.getPrompt() + ' ' + cmd;
    const resp = engine.handle(cmd);
    setLines(l=>[...l, before, ...(Array.isArray(resp)?resp:[resp])].filter(Boolean));
    setCmd('');
  }

  return (
    <div>
      <div ref={outRef} className="console-box">
        {lines.map((l,i)=>(<div key={i}>{l}</div>))}
      </div>
      <form onSubmit={submit} style={{marginTop:8}}>
        <input
          className="console-input"
          value={cmd}
          onChange={(e)=>setCmd(e.target.value)}
          placeholder="enable, conf t, interface fa0/0, ip address..., no shutdown, show ip int brief, ping 192.168.1.10"
        />
      </form>
    </div>
  );
}
