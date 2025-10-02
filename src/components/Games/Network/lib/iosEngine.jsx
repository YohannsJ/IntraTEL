import React, { createContext, useMemo } from 'react';

export const IOSEngineContext = createContext({});

export function IOSProvider({ children, ctx }){
  const engine = useMemo(()=>createEngine(ctx), [ctx]);
  return <IOSEngineContext.Provider value={{ engine }}>{children}</IOSEngineContext.Provider>;
}

function createEngine(ctx){
  const state = {
    hostname: 'Router',
    mode: 'user',           // user | enable | config | int
    currentInt: null,
    routerIf: {
      'fa0/0': { ip:null, mask:null, up:false },
      'fa0/1': { ip:null, mask:null, up:false },
    },
    pc: { ip:'192.168.1.10', mask:'255.255.255.0', up:true },
    version: 'IntraTEL IOS-like v0.1 (sim)',
  };

  function getPrompt(){
    if (state.mode==='user')   return `${state.hostname}>`;
    if (state.mode==='enable') return `${state.hostname}#`;
    if (state.mode==='config') return `${state.hostname}(config)#`;
    if (state.mode==='int')    return `${state.hostname}(config-if)#`;
  }

  function printStatus(){
    const s = state.routerIf;
    const txt = [
      `${state.hostname}`,
      `fa0/0  IP: ${s['fa0/0'].ip||'-'}  Mask: ${s['fa0/0'].mask||'-'}  State: ${s['fa0/0'].up?'up':'down'}`,
      `fa0/1  IP: ${s['fa0/1'].ip||'-'}  Mask: ${s['fa0/1'].mask||'-'}  State: ${s['fa0/1'].up?'up':'down'}`,
      '',
      `PC IP: ${state.pc.ip}  Mask: ${state.pc.mask}`
    ].join('\n');
    ctx.setStatus(txt);
  }

  function showIpIntBrief(){
    let s = 'Interface       IP-Address      OK? Method  Status  Protocol\n';
    for(const [name, ifc] of Object.entries(state.routerIf)){
      s += `${name.padEnd(15)} ${(ifc.ip||'unassigned').padEnd(15)} YES manual ${ifc.up?'up':'down'}   ${ifc.up?'up':'down'}\n`;
    }
    return s.trimEnd();
  }

  function runningConfig(){
    const lines = [
      `hostname ${state.hostname}`,
      ...Object.entries(state.routerIf).map(([n,ifc])=>{
        const body = [];
        if (ifc.ip) body.push(` ip address ${ifc.ip} ${ifc.mask}`);
        body.push(ifc.up ? ' no shutdown' : ' shutdown');
        return ['interface '+n, ...body, ' exit'].join('\n');
      })
    ];
    return lines.join('\n');
  }

  function showInterfaces(){
    const lines = [];
    for(const [name,ifc] of Object.entries(state.routerIf)){
      lines.push(`${name} is ${ifc.up?'up':'administratively down'}, line protocol is ${ifc.up?'up':'down'}`);
      lines.push(`  Internet address is ${ifc.ip||'unassigned'} ${ifc.mask||''}`);
    }
    return lines;
  }

  function cablingOK(){
    // requiere Router↔Switch y PC↔Switch
    const hasRS = ctx.topo.links.some(L=>{
      const types = [ctx.topo.nodes.find(n=>n.id===L.a.nodeId)?.type, ctx.topo.nodes.find(n=>n.id===L.b.nodeId)?.type].sort().join('-');
      return types==='router-switch';
    });
    const hasPS = ctx.topo.links.some(L=>{
      const types = [ctx.topo.nodes.find(n=>n.id===L.a.nodeId)?.type, ctx.topo.nodes.find(n=>n.id===L.b.nodeId)?.type].sort().join('-');
      return types==='pc-switch';
    });
    return hasRS && hasPS;
  }

  function ping(ip){
    const r = state.routerIf['fa0/0'];
    const ok = cablingOK() && r.up && r.ip==='192.168.1.1' && r.mask==='255.255.255.0' && ip==='192.168.1.10';

    if (ok){
      ctx.setObjectiveDone(true);
      return [
        `Pinging ${ip} with 32 bytes of data:`,
        `Reply from ${ip}: bytes=32 time=1ms TTL=255`,
        `Reply from ${ip}: bytes=32 time=1ms TTL=255`,
        `Reply from ${ip}: bytes=32 time=1ms TTL=255`,
        `Reply from ${ip}: bytes=32 time=1ms TTL=255`,
        ``,
        `Ping statistics for ${ip}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss) ✅`
      ];
    }
    return [
      `Pinging ${ip} with 32 bytes of data:`,
      `Request timed out.`,
      `Request timed out.`,
      `Request timed out.`,
      `Request timed out.`,
      ``,
      `Ping statistics for ${ip}: Packets: Sent = 4, Received = 0, Lost = 4 (100% loss) ❌`
    ];
  }

  function traceroute(ip){
    return [
      `Tracing route to ${ip} over a maximum of 30 hops:`,
      `  1    <1 ms   <1 ms   <1 ms  192.168.1.1`,
      `  2     *        *        *   Request timed out.`,
    ];
  }

  const handlers = {
    // modos / navegación
    'enable':           () => { if (state.mode==='user'){ state.mode='enable'; return null } return '% Invalid input'; },
    'disable':          () => { state.mode='user'; return null },
    'end':              () => { state.mode='enable'; state.currentInt=null; return null },
    'exit':             () => { if (state.mode==='int'){ state.mode='config'; state.currentInt=null; } else if (state.mode==='config'){ state.mode='enable' } else if (state.mode==='enable'){ state.mode='user' } return null },

    // configuración
    'configure terminal': () => { if (state.mode!=='enable') return '% Enter privileged mode'; state.mode='config'; return null },
    'conf t':              () => handlers['configure terminal'](),
    'hostname':            (args) => { if (state.mode!=='config') return '% Enter configuration mode'; state.hostname = args || 'Router'; return null },
    'interface':           (args) => { if (state.mode!=='config') return '% Enter configuration mode'; if (!state.routerIf[args]) return '% Invalid interface (use fa0/0 or fa0/1)'; state.currentInt=args; state.mode='int'; return null },
    'ip address':          (args) => { if (state.mode!=='int') return '% Enter interface config mode'; const [ip,mask]=args.split(/\\s+/); if (!ip||!mask) return '% Usage: ip address <ip> <mask>'; state.routerIf[state.currentInt].ip=ip; state.routerIf[state.currentInt].mask=mask; printStatus(); return `Assigned ${ip} ${mask} to ${state.currentInt}` },
    'no shutdown':         () => { if (state.mode!=='int') return '% Enter interface config mode'; state.routerIf[state.currentInt].up=true; printStatus(); return `${state.currentInt} changed state to up` },
    'shutdown':            () => { if (state.mode!=='int') return '% Enter interface config mode'; state.routerIf[state.currentInt].up=false; printStatus(); return `${state.currentInt} changed state to down` },

    // show
    'show ip int brief':   () => showIpIntBrief(),
    'show running-config': () => runningConfig(),
    'show interfaces':     () => showInterfaces(),
    'show version':        () => state.version,

    // pruebas
    'ping':                (args) => { const ip = (args||'').trim()||'192.168.1.10'; return ping(ip) },
    'traceroute':          (args) => { const ip = (args||'').trim()||'192.168.1.10'; return traceroute(ip) },
  };

  function handle(line){
    const raw = line.trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const match = Object.keys(handlers).sort((a,b)=>b.length-a.length).find(cmd => lower.startsWith(cmd));
    if (!match) return '% Comando no reconocido';
    const args = raw.slice(match.length).trim();
    const res = handlers[match](args);
    printStatus();
    return res;
  }

  printStatus();
  return { handle, getPrompt };
}
