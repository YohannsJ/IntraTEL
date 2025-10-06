// PC Engine - Consola simplificada para el PC
export function createPCEngine(ctx) {
  const state = {
    hostname: 'PC1',
    ip: '192.168.1.10',
    mask: '255.255.255.0',
    gateway: '192.168.1.1',
  };

  function getPrompt() {
    return `${state.hostname}$`;
  }

  function cablingOK() {
    if (!ctx || !ctx.topo || !ctx.topo.links || !ctx.topo.nodes) return false;
    
    const currentTopo = ctx.topo;
    const hasPS = currentTopo.links.some(L => {
      const nodeA = currentTopo.nodes.find(n => n.id === L.a.nodeId);
      const nodeB = currentTopo.nodes.find(n => n.id === L.b.nodeId);
      if (!nodeA || !nodeB) return false;
      const types = [nodeA.type, nodeB.type].sort().join('-');
      return types === 'pc-switch';
    });
    const hasRS = currentTopo.links.some(L => {
      const nodeA = currentTopo.nodes.find(n => n.id === L.a.nodeId);
      const nodeB = currentTopo.nodes.find(n => n.id === L.b.nodeId);
      if (!nodeA || !nodeB) return false;
      const types = [nodeA.type, nodeB.type].sort().join('-');
      return types === 'router-switch';
    });
    return hasPS && hasRS;
  }

  function checkConnection() {
    return cablingOK();
  }

  function ipconfig() {
    return [
      'Configuración IP de Windows',
      '',
      'Adaptador de Ethernet:',
      '',
      `   Dirección IPv4. . . . . . . . . : ${state.ip}`,
      `   Máscara de subred . . . . . . . : ${state.mask}`,
      `   Puerta de enlace predeterminada : ${state.gateway}`,
    ];
  }

  async function ping(target, callback) {
    // Verificar que target sea la gateway (router)
    const targetIsRouter = target === state.gateway || target === '192.168.1.1';
    
    if (!targetIsRouter) {
      callback([`Ping request could not find host ${target}. Please check the name and try again.`]);
      return;
    }

    // Verificar cabling
    if (!cablingOK()) {
      callback([`Pinging ${target} with 32 bytes of data:`]);
      for (let i = 0; i < 4; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        callback([`Request timed out.`]);
      }
      callback([
        ``,
        `Ping statistics for ${target}:`,
        `    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`,
        ``,
        `❌ Sin conexión física. Verifica el cableado.`
      ]);
      return;
    }

    // Verificar que el router tenga la IP configurada correctamente
    // Y que el PUERTO CONECTADO sea el que está configurado
    let routerConfigured = false;
    if (ctx && ctx.topo && ctx.topo.nodes && ctx.topo.links) {
      const router = ctx.topo.nodes.find(n => n.type === 'router');
      const switchNode = ctx.topo.nodes.find(n => n.type === 'switch');
      
      // Encontrar qué puerto del router está conectado al switch
      const routerToSwitch = ctx.topo.links.find(L => {
        const nodeA = ctx.topo.nodes.find(n => n.id === L.a.nodeId);
        const nodeB = ctx.topo.nodes.find(n => n.id === L.b.nodeId);
        if (!nodeA || !nodeB) return false;
        const types = [nodeA.type, nodeB.type].sort().join('-');
        return types === 'router-switch';
      });
      
      if (router && router.ports && routerToSwitch) {
        // Identificar qué puerto del router está en el link
        const routerPortIdx = routerToSwitch.a.nodeId === router.id 
          ? routerToSwitch.a.portIdx 
          : routerToSwitch.b.portIdx;
        
        // Verificar que ESE puerto específico tenga la IP correcta y esté up
        const connectedPort = router.ports[routerPortIdx];
        routerConfigured = connectedPort && 
          connectedPort.ip === '192.168.1.1' && 
          connectedPort.mask === '255.255.255.0' && 
          connectedPort.status === 'up';
      }
    }

    callback([`Pinging ${target} with 32 bytes of data:`]);
    
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      if (routerConfigured) {
        callback([`Reply from ${target}: bytes=32 time<1ms TTL=255`]);
      } else {
        callback([`Request timed out.`]);
      }
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    if (routerConfigured) {
      callback([
        ``,
        `Ping statistics for ${target}:`,
        `    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`,
        `Approximate round trip times in milli-seconds:`,
        `    Minimum = 0ms, Maximum = 0ms, Average = 0ms`,
        ``,
        `✅ Conexión exitosa con el router!`
      ]);
      
      // Otorgar segunda bandera si el ping fue exitoso
      if (ctx && ctx.setFlags && ctx.flags) {
        // Verificar que no tenga ya la bandera
        if (!ctx.flags.some(f => f.id === 'ping')) {
          ctx.setFlags(currentFlags => [
            ...currentFlags,
            {
              id: 'ping',
              title: 'Configuración Exitosa',
            //   code: 'FLAG{P1NG_SUCC3SSFUL_C0NF1G}'
              code: 'D1ft3l{F1n4l_St4g3.N3tw0rk-4Dm1n}'
            }
          ]);
        }
      }
    } else {
      callback([
        ``,
        `Ping statistics for ${target}:`,
        `    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),`,
        ``,
        `❌ El router no responde. Verifica:`,
        `• Router configurado con IP 192.168.1.1/24`,
        `• Interfaz del router activada (no shutdown)`,
        `• Usa la consola del Router para configurar`
      ]);
    }
  }

  function tracert(target) {
    return [
      `Tracing route to ${target} over a maximum of 30 hops`,
      ``,
      `  1    <1 ms    <1 ms    <1 ms  ${state.gateway}`,
      ``,
      `Trace complete.`
    ];
  }

  function getHelp() {
    return [
      'Comandos disponibles en PC:',
      '  ipconfig        - Mostrar configuración IP',
      '  ping <ip>       - Hacer ping a una dirección',
      '  tracert <ip>    - Trazar ruta a una dirección',
      '  help            - Mostrar esta ayuda',
      '  cls             - Limpiar pantalla',
      '',
      'Ejemplo: ping 192.168.1.1'
    ];
  }

  const handlers = {
    'ipconfig': () => ipconfig(),
    'ping': (args, callback) => {
      const target = (args || '').trim() || state.gateway;
      return ping(target, callback);
    },
    'tracert': (args) => {
      const target = (args || '').trim() || state.gateway;
      return tracert(target);
    },
    'help': () => getHelp(),
    '?': () => getHelp(),
    'cls': () => 'CLEAR', // Señal especial para limpiar consola
    'refresh': () => {
      return cablingOK() 
        ? 'Conexión de red verificada correctamente.' 
        : 'Error: Sin conexión de red. Verifica el cableado PC ↔ Switch ↔ Router.';
    },
  };

  function handle(line, callback = null) {
    const raw = line.trim();
    if (!raw) return null;
    const lower = raw.toLowerCase();
    const match = Object.keys(handlers).sort((a, b) => b.length - a.length).find(cmd => lower.startsWith(cmd));
    if (!match) return `'${raw.split(' ')[0]}' is not recognized as an internal or external command, operable program or batch file.`;
    const args = raw.slice(match.length).trim();

    // Comando ping especial con callback
    if (match === 'ping' && callback) {
      return handlers[match](args, callback);
    }

    return handlers[match](args);
  }

  return { handle, getPrompt, checkConnection };
}
