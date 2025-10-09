import React, { createContext, useMemo } from 'react';
import { createPCEngine } from './pcEngine.jsx';

export const IOSEngineContext = createContext({});

export function IOSProvider({ children, ctx }){
  // Crear ambos engines solo una vez
  const routerEngine = useMemo(()=>createRouterEngine(ctx), []);
  const pcEngine = useMemo(()=>createPCEngine(ctx), []);
  
  return (
    <IOSEngineContext.Provider value={{ routerEngine, pcEngine, ctx }}>
      {children}
    </IOSEngineContext.Provider>
  );
}

function createRouterEngine(ctx){
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

  function syncToTopology(){
    // Update topology state to reflect console/engine changes
    // Only call this from handlers that actually modify interface state
    try {
      if (ctx && ctx.setTopo) {
        ctx.setTopo(currentTopo => {
          const newNodes = (currentTopo.nodes || []).map(n => {
            if (n.type === 'router') {
              const ports = (n.ports || []).map(p => {
                const ifc = state.routerIf[p.name] || {};
                return { 
                  ...p, 
                  ip: ifc.ip || 'unassigned', 
                  mask: ifc.mask || '', 
                  status: (ifc.up ? 'up' : 'down')
                };
              });
              return { ...n, ports };
            }
            if (n.type === 'pc') {
              return { ...n, ip: state.pc.ip, mask: state.pc.mask };
            }
            return n;
          });
          return { ...currentTopo, nodes: newNodes };
        });
      }
    } catch (err) {
      // ignore sync errors
    }
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
      '!',
      '! Last configuration change at 12:00:00 UTC Mon Oct 6 2025',
      '!',
      'version 15.1',
      'service timestamps debug datetime msec',
      'service timestamps log datetime msec',
      'no service password-encryption',
      '!',
      `hostname ${state.hostname}`,
      '!',
      'boot-start-marker',
      'boot-end-marker',
      '!',
      'enable secret 5 $1$mERr$hx5rVt7rPNoS4wqbXKX7m0',
      '!',
      'no aaa new-model',
      '!',
      'ip cef',
      '!',
      'no ipv6 cef',
      '!',
      'multilink bundle-name authenticated',
      '!'
    ];
    
    // Agregar configuración de interfaces
    for(const [name, ifc] of Object.entries(state.routerIf)){
      lines.push('!');
      lines.push(`interface ${name}`);
      if (ifc.ip && ifc.mask) {
        lines.push(` ip address ${ifc.ip} ${ifc.mask}`);
      } else {
        lines.push(' no ip address');
      }
      lines.push(ifc.up ? ' no shutdown' : ' shutdown');
    }
    
    lines.push('!');
    lines.push('ip forward-protocol nd');
    lines.push('!');
    lines.push('no ip http server');
    lines.push('no ip http secure-server');
    lines.push('!');
    lines.push('control-plane');
    lines.push('!');
    lines.push('line con 0');
    lines.push('line aux 0');
    lines.push('line vty 0 4');
    lines.push(' login');
    lines.push(' transport input none');
    lines.push('!');
    lines.push('end');
    
    return lines.join('\n');
  }

  function showVersion(){
    return [
      'IntraTEL IOS Software, Router Software (C2900-UNIVERSALK9-M), Version 15.1(4)M4',
      'Technical Support: http://www.intratel.edu',
      'Copyright (c) 1986-2025 by IntraTEL Systems, Inc.',
      'Compiled Wed 06-Oct-25 12:00 by prod_rel_team',
      '',
      'ROM: System Bootstrap, Version 15.1(4)M4, RELEASE SOFTWARE (fc1)',
      '',
      `${state.hostname} uptime is 0 days, 0 hours, 15 minutes`,
      'System returned to ROM by power-on',
      'System image file is "flash0:c2900-universalk9-mz.SPA.151-4.M4.bin"',
      '',
      'This product contains cryptographic features and is subject to United',
      'States and local country laws governing import, export, transfer and',
      'use. Delivery of IntraTEL cryptographic products does not imply',
      'third-party authority to import, export, distribute or use encryption.',
      'Importers, exporters, distributors and users are responsible for',
      'compliance with U.S. and local country laws.',
      '',
      'Cisco 2911 (revision 1.0) with 491520K/32768K bytes of memory.',
      'Processor board ID FTX152400KS',
      '2 Ethernet interfaces',
      '2 Serial interfaces',
      'DRAM configuration is 64 bits wide with parity disabled.',
      '255K bytes of non-volatile configuration memory.',
      '249856K bytes of ATA CompactFlash (Read/Write)',
      '',
      'License Info:',
      'License UDI:',
      '*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*',
      'Device#   PID                   SN',
      '*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*',
      'Technology Package License Information for Module:\'c2900\'',
      '',
      'Configuration register is 0x2102'
    ];
  }

  function showIpRoute(){
    const lines = [
      'Codes: L - local, C - connected, S - static, R - RIP, M - mobile, B - BGP',
      '       D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area',
      '       N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2',
      '       E1 - OSPF external type 1, E2 - OSPF external type 2',
      '       i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2',
      '       ia - IS-IS inter area, * - candidate default, U - per-user static route',
      '       o - ODR, P - periodic downloaded static route, H - NHRP, l - LISP',
      '       + - replicated route, % - next hop override',
      '',
      'Gateway of last resort is not set',
      ''
    ];
    
    // Agregar rutas conectadas según las interfaces configuradas
    for(const [name, ifc] of Object.entries(state.routerIf)){
      if (ifc.ip && ifc.up) {
        const network = calculateNetwork(ifc.ip, ifc.mask);
        lines.push(`C    ${network} is directly connected, ${name}`);
        lines.push(`L    ${ifc.ip}/32 is directly connected, ${name}`);
      }
    }
    
    if (lines.length === 10) { // Solo headers, no hay rutas
      lines.push('     % Network not in table');
    }
    
    return lines;
  }
  
  function calculateNetwork(ip, mask) {
    // Simplificación para la red 192.168.1.0/24
    if (ip && mask && ip.startsWith('192.168.1.') && mask === '255.255.255.0') {
      return '192.168.1.0/24';
    }
    return ip + '/32';
  }

  function cablingOK(){
    // requiere Router↔Switch y PC↔Switch
    // Acceder a topo actual de forma segura
    if (!ctx || !ctx.topo || !ctx.topo.links || !ctx.topo.nodes) return false;
    
    const currentTopo = ctx.topo;
    const hasRS = currentTopo.links.some(L=>{
      const nodeA = currentTopo.nodes.find(n=>n.id===L.a.nodeId);
      const nodeB = currentTopo.nodes.find(n=>n.id===L.b.nodeId);
      if (!nodeA || !nodeB) return false;
      const types = [nodeA.type, nodeB.type].sort().join('-');
      return types==='router-switch';
    });
    const hasPS = currentTopo.links.some(L=>{
      const nodeA = currentTopo.nodes.find(n=>n.id===L.a.nodeId);
      const nodeB = currentTopo.nodes.find(n=>n.id===L.b.nodeId);
      if (!nodeA || !nodeB) return false;
      const types = [nodeA.type, nodeB.type].sort().join('-');
      return types==='pc-switch';
    });
    return hasRS && hasPS;
  }

  function checkConnection(){
    return cablingOK();
  }

  function getHelpCommands(){
    if (state.mode === 'user') {
      return [
        'Comandos disponibles en modo USER:',
        '  enable          - Acceder al modo privilegiado',
        '  refresh         - Verificar conexión de red',
        '  ?               - Mostrar esta ayuda',
        '  help            - Mostrar esta ayuda'
      ];
    } else if (state.mode === 'enable') {
      return [
        'Comandos disponibles en modo PRIVILEGIADO:',
        '  configure terminal (conf t, config, conf) - Entrar al modo configuración',
        '  show ? (sh ?)                           - Ver opciones del comando show',
        '  show ip int brief (sh ip int br)        - Mostrar estado de interfaces',
        '  show ip route (sh ip ro)                - Mostrar tabla de enrutamiento',
        '  show running-config (sh run)            - Mostrar configuración actual',
        '  show interfaces (sh int)                - Mostrar detalles de interfaces',
        '  show version (sh ver)                   - Mostrar información del sistema',
        '  ping <ip>                               - Hacer ping a una dirección IP',
        '  traceroute (tracert, trace) <ip>        - Hacer traceroute a una IP',
        '  copy run start (write, wr)              - Guardar configuración',
        '  refresh                                 - Verificar conexión de red',
        '  disable (dis)                           - Volver al modo usuario',
        '  ?                                       - Mostrar esta ayuda',
        '  help                                    - Mostrar esta ayuda'
      ];
    } else if (state.mode === 'config') {
      return [
        'Comandos disponibles en modo CONFIGURACIÓN:',
        '  hostname (host) <name>     - Cambiar nombre del router',
        '  interface (int) <name>     - Configurar interfaz (fa0/0, fa0/1)',
        '  end                        - Volver al modo privilegiado',
        '  exit (ex)                  - Volver al modo privilegiado',
        '  ?                          - Mostrar esta ayuda',
        '  help                       - Mostrar esta ayuda'
      ];
    } else if (state.mode === 'int') {
      return [
        'Comandos disponibles en modo INTERFAZ:',
        '  ip address (ip addr) <ip> <mask> - Asignar dirección IP',
        '  no shutdown                      - Activar interfaz',
        '  shutdown (shut)                  - Desactivar interfaz',
        '  end                              - Volver al modo privilegiado',
        '  exit (ex)                        - Volver al modo configuración',
        '  ?                                - Mostrar esta ayuda',
        '  help                             - Mostrar esta ayuda'
      ];
    }
    return ['Ayuda no disponible para este modo'];
  }
  
  function getShowHelp(){
    return [
      'Comandos show disponibles:',
      '  show interfaces (sh int)         - Información detallada de interfaces',
      '  show ip interface brief (sh ip int br) - Resumen del estado de interfaces IP',
      '  show ip route (sh ip ro)         - Tabla de enrutamiento IP',
      '  show running-config (sh run)     - Configuración activa actual',
      '  show version (sh ver)            - Información del sistema y hardware'
    ];
  }

  async function ping(ip, callback){
    const r = state.routerIf['fa0/0'];
    const ok = cablingOK() && r.up && r.ip==='192.168.1.1' && r.mask==='255.255.255.0' && ip==='192.168.1.10';

    // Mostrar mensaje inicial
    callback([`Pinging ${ip} with 32 bytes of data:`]);
    
    // Realizar 4 pings con delay
    for(let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (ok) {
        callback([`Reply from ${ip}: bytes=32 time=1ms TTL=255`]);
      } else {
        callback([`Request timed out.`]);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (ok){
      ctx.setObjectiveDone(true);
      // Generar flag única basada en la configuración exitosa
      // const flag = 'INTRATEL{n3tw0rk_c0nf1g_m4st3r_2025}';
      const flag = ' D1ft3l{S3c0nd-2do&3er_L4y3r}';
      
      callback([
        ``,
        `Ping statistics for ${ip}: Packets: Sent = 4, Received = 4, Lost = 0 (0% loss) ✅`,
        ``,
        `🏆 ¡FELICITACIONES! Has completado el desafío de red.`,
        `🚩 FLAG: ${flag}`,
        ``,
        `Has configurado exitosamente:`,
        `✓ Conectividad Router ↔ Switch ↔ PC`,
        `✓ Interfaz fa0/0 con IP 192.168.1.1/24`,
        `✓ Interfaz activada (no shutdown)`,
        `✓ Conectividad verificada con ping`,
        ``,
        `¡Excelente trabajo configurando equipos de red!`
      ]);
    } else {
      callback([
        ``,
        `Ping statistics for ${ip}: Packets: Sent = 4, Received = 0, Lost = 4 (100% loss) ❌`,
        ``,
        `❌ Ping falló. Verifica:`,
        `• Conectividad: Router ↔ Switch ↔ PC`,
        `• Configuración IP: fa0/0 = 192.168.1.1 255.255.255.0`,
        `• Estado interfaz: no shutdown`,
        `• Comando: show ip int brief`
      ]);
    }
  }

  function traceroute(ip){
    return [
      `Tracing route to ${ip} over a maximum of 30 hops:`,
      `  1    <1 ms   <1 ms   <1 ms  192.168.1.1`,
      `  2     *        *        *   Request timed out.`,
    ];
  }

  const handlers = {
    // comandos especiales
    'refresh':          () => { return cablingOK() ? 'Conexión verificada correctamente. \nD1ft3l{F1rst_St3p.Ph1s1c4l_L4y3r}' : 'Error: Sin conexión entre router y switch.' },
    
    // ayuda
    'help':             () => getHelpCommands(),
    '?':                () => getHelpCommands(),

    // modos / navegación
    'enable':           () => { if (state.mode==='user'){ state.mode='enable'; return null } return '% Invalid input'; },
    'en':               () => handlers['enable'](),
    'disable':          () => { state.mode='user'; return null },
    'dis':              () => handlers['disable'](),
    'end':              () => { state.mode='enable'; state.currentInt=null; return null },
    'exit':             () => { if (state.mode==='int'){ state.mode='config'; state.currentInt=null; } else if (state.mode==='config'){ state.mode='enable' } else if (state.mode==='enable'){ state.mode='user' } return null },
    'ex':               () => handlers['exit'](),

    // configuración
    'configure terminal': () => { if (state.mode!=='enable') return '% Enter privileged mode'; state.mode='config'; return null },
    'configure':          () => handlers['configure terminal'](),
    'config terminal':    () => handlers['configure terminal'](),
    'config':             () => handlers['configure terminal'](),
    'conf terminal':      () => handlers['configure terminal'](),
    'conf t':             () => handlers['configure terminal'](),
    'hostname':           (args) => { if (state.mode!=='config') return '% Enter configuration mode'; state.hostname = args || 'Router'; return null },
    'host':               (args) => handlers['hostname'](args),
    'interface':          (args) => { if (state.mode!=='config') return '% Enter configuration mode'; if (!state.routerIf[args]) return '% Invalid interface (use fa0/0 or fa0/1)'; state.currentInt=args; state.mode='int'; return null },
    'int':                (args) => handlers['interface'](args),
    'ip address':         (args) => { if (state.mode!=='int') return '% Enter interface config mode'; const [ip,mask]=args.split(/\s+/); if (!ip||!mask) return '% Usage: ip address <ip> <mask>'; state.routerIf[state.currentInt].ip=ip; state.routerIf[state.currentInt].mask=mask; printStatus(); syncToTopology(); return `Assigned ${ip} ${mask} to ${state.currentInt}` },
    'ip addr':            (args) => handlers['ip address'](args),
    'no shutdown':         () => { 
      if (state.mode!=='int') return '% Enter interface config mode'; 
      state.routerIf[state.currentInt].up=true; 
      printStatus(); 
      syncToTopology(); 
      
      // Verificar si fa0/0 tiene la configuración correcta
      if (state.currentInt === 'fa0/0' && 
          state.routerIf['fa0/0'].ip === '192.168.1.1' && 
          state.routerIf['fa0/0'].mask === '255.255.255.0') {
        return [
          `${state.currentInt} changed state to up`,
          ``,
          `🚩FLAG: D1ft3l{S3c0nd-2do&3er_L4y3r}`,
          ``,
          `✅ ¡Configuración correcta de la interfaz fa0/0!`,
          `   IP: 192.168.1.1`,
          `   Máscara: 255.255.255.0`,
          `   Estado: UP`,
          `   `,
          `   A continuación, verifica la conectividad haciendo ping desde el PC (192.168.1.10) hasta el router (192.168.1.1)`,

        ].join('\n');
      }
      
      return `${state.currentInt} changed state to up`;
    },
    'shutdown':            () => { if (state.mode!=='int') return '% Enter interface config mode'; state.routerIf[state.currentInt].up=false; printStatus(); syncToTopology(); return `${state.currentInt} changed state to down` },
    'shut':                () => handlers['shutdown'](),

    // show commands
    'show ?':              () => getShowHelp(),
    'sh ?':                () => getShowHelp(),
    'show ip interface brief': () => showIpIntBrief(),
    'show ip int brief':   () => showIpIntBrief(),
    'sh ip int brief':     () => showIpIntBrief(),
    'sh ip int br':        () => showIpIntBrief(),
    'show ip route':       () => showIpRoute(),
    'sh ip route':         () => showIpRoute(),
    'sh ip ro':            () => showIpRoute(),
    'show running-config': () => runningConfig(),
    'show run':            () => runningConfig(),
    'sh run':              () => runningConfig(),
    'show interfaces':     () => showInterfaces(),
    'show int':            () => showInterfaces(),
    'sh int':              () => showInterfaces(),
    'show version':        () => showVersion(),
    'show ver':            () => showVersion(),
    'sh ver':              () => showVersion(),

    // pruebas
    'ping':                (args, callback) => { const ip = (args||'').trim()||'192.168.1.10'; return ping(ip, callback) },
    'traceroute':          (args) => { const ip = (args||'').trim()||'192.168.1.10'; return traceroute(ip) },
    'tracert':             (args) => handlers['traceroute'](args),
    'trace':               (args) => handlers['traceroute'](args),
    
    // comandos adicionales útiles
    'clear':               () => '% Use Ctrl+L to clear screen',
    'cls':                 () => handlers['clear'](),
    'reload':              () => '% Reload functionality not implemented in simulation',
    'copy run start':      () => 'Building configuration...\n[OK]',
    'copy running-config startup-config': () => handlers['copy run start'](),
    'write memory':        () => handlers['copy run start'](),
    'write':               () => handlers['copy run start'](),
    'wr':                  () => handlers['copy run start'](),
  };

  function handle(line, callback = null){
    const raw = line.trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const match = Object.keys(handlers).sort((a,b)=>b.length-a.length).find(cmd => lower.startsWith(cmd));
    if (!match) return '% Comando no reconocido';
    const args = raw.slice(match.length).trim();
    
    // Comando ping especial con callback - retornar la Promise
    if (match === 'ping' && callback) {
      return handlers[match](args, callback);
    }
    
    const res = handlers[match](args);
    printStatus();
    return res;
  }

  // No llamar printStatus() aquí - causa setState durante render
  // printStatus() se llamará automáticamente después del primer comando
  return { handle, getPrompt, checkConnection };
}
