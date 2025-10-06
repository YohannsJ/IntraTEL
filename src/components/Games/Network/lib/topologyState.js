export function createInitialTopology(){
  return {
    nodes: [
      { id:'R1', type:'router', x:120, y:80, ports:[ {x:14,y:48}, {x:40,y:48} ] },
      { id:'S1', type:'switch', x:420, y:200, ports:[ {x:14,y:48}, {x:40,y:48}, {x:66,y:48}, {x:92,y:48} ] },
      { id:'PC1', type:'pc', x:750, y:320, ports:[ {x:14,y:48} ] },
    ],
    links: [],
    pending: null,
  };
}
