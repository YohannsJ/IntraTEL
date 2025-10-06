export function createInitialTopology(){
  return {
    nodes: [
      { id:'R1', type:'router', x:120, y:80, ports:[ 
          { x:10, y:65, name: 'fa0/0', ip: 'unassigned', mask: '', status: 'down' }, 
          { x:50, y:65, name: 'fa0/1', ip: 'unassigned', mask: '', status: 'down' }
        ]
      },
  { id:'S1', type:'switch', x:420, y:200, ports:[ {x:0,y:65}, {x:20,y:65}, {x:40,y:65}, {x:60,y:65} ] },
  { id:'PC1', type:'pc', x:750, y:320, ports:[ {x:30,y:65} ], ip: '192.168.1.10', mask: '255.255.255.0', gw: '192.168.1.1' },
    ],
    links: [],
    pending: null,
  };
}
