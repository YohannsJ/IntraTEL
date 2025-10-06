export function createInitialTopology(){
  return {
    nodes: [
      { id:'R1', type:'router', x:120, y:80, ports:[ 
          { x:15, y:85, name: 'fa0/0', ip: 'unassigned', mask: '', status: 'down' }, 
          { x:65, y:85, name: 'fa0/1', ip: 'unassigned', mask: '', status: 'down' }
        ]
      },
  { id:'S1', type:'switch', x:420, y:200, ports:[ {x:0,y:85}, {x:30,y:85}, {x:60,y:85}, {x:90,y:85} ] },
  { id:'PC1', type:'pc', x:750, y:320, ports:[ {x:40,y:85} ], ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' },
    ],
    links: [],
    pending: null,
  };
}
