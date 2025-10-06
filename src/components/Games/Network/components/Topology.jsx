import React, { useEffect, useRef } from 'react'

export default function Topology({ topo, setTopo }){
  const ref = useRef(null)

  useEffect(()=>{
    const svg = ref.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const NS = 'http://www.w3.org/2000/svg'
    const pt = svg.createSVGPoint()
    const toSvg = (e) => {
      pt.x = e.clientX; pt.y = e.clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    }

    // ---------- Estado local para drag de cable ----------
    let dragging = null            // { nodeId, portIdx, start:{x,y} }
    let hoverPort = null           // { nodeId, portIdx }
    let selectedLinkId = null      // para borrar con tecla
    const ghost = document.createElementNS(NS,'path')
    ghost.setAttribute('class','link ghost')
    ghost.style.display = 'none'
    svg.appendChild(ghost)

    // ---------- Helpers ----------
    const portAbs = (nodeId, portIdx) => {
      const n = topo.nodes.find(x=>x.id===nodeId)
      const p = n.ports[portIdx]
      return { x: n.x + p.x, y: n.y + p.y }
    }
    const pairOk = (aType, bType) => {
      const t = [aType,bType].sort().join('-')
      return t==='router-switch' || t==='pc-switch'
    }
    const markSelected = (id, on) => {
      const el = document.getElementById('link-'+id)
      if (!el) return
      el.style.filter = on ? 'drop-shadow(0 0 3px #fff)' : ''
      el.style.strokeWidth = on ? '4' : '3'
    }

    // ---------- Links (render + eventos) ----------
    topo.links.forEach(L=>{
      const path = document.createElementNS(NS,'path')
      path.setAttribute('id','link-'+L.id)
      path.setAttribute('class','link '+(L.ok?'ok':'bad'))
      path.setAttribute('d', `M ${L.a.x} ${L.a.y} L ${L.b.x} ${L.b.y}`)

      path.addEventListener('click', ()=>{
        // seleccionar / deseleccionar
        if (selectedLinkId === L.id){ markSelected(L.id,false); selectedLinkId=null; return }
        if (selectedLinkId){ markSelected(selectedLinkId,false) }
        selectedLinkId = L.id; markSelected(L.id,true)
      })
      path.addEventListener('contextmenu', (e)=>{
        e.preventDefault()
        // eliminar con clic derecho
        topo.links = topo.links.filter(x=>x.id!==L.id)
        setTopo(t=>({...t}))
      })
      svg.appendChild(path)
    })

    // ---------- Nodos ----------
    topo.nodes.forEach(n=>{
      const g = document.createElementNS(NS,'g')
      g.setAttribute('class','node')
      g.setAttribute('transform',`translate(${n.x},${n.y})`)

      const rect = document.createElementNS(NS,'rect')
      rect.setAttribute('class','dev '+n.type)
      rect.setAttribute('rx', 10)
      rect.setAttribute('width', 130)
      rect.setAttribute('height', 70)
      g.appendChild(rect)

      const label = document.createElementNS(NS,'text')
      label.setAttribute('class','label')
      label.setAttribute('x', 10)
      label.setAttribute('y', 22)
      label.textContent = `${n.type.toUpperCase()} (${n.id})`
      g.appendChild(label)

      // Puertos
      n.ports.forEach((p, idx)=>{
        const c = document.createElementNS(NS,'circle')
        c.setAttribute('class','port')
        c.setAttribute('r', 8)                     // más cómodo de clickear
        c.setAttribute('cx', p.x)
        c.setAttribute('cy', p.y)
        c.dataset.node = n.id
        c.dataset.port = String(idx)

        // Inicia drag del cable (al estilo NandGame)
        c.addEventListener('mousedown', (e)=>{
          e.stopPropagation()
          const start = portAbs(n.id, idx)
          dragging = { nodeId:n.id, portIdx:idx, start }
          ghost.style.display = null
          ghost.setAttribute('d', `M ${start.x} ${start.y} L ${start.x} ${start.y}`)
        })

        // Trackea hover para saber si soltamos sobre un puerto válido
        c.addEventListener('mouseenter', ()=>{
          hoverPort = { nodeId:n.id, portIdx:idx }
        })
        c.addEventListener('mouseleave', ()=>{
          hoverPort = null
        })

        g.appendChild(c)
      })

      // Drag de los nodos (como ya tenías)
      let draggingNode=false, offX=0, offY=0
      g.addEventListener('mousedown',(e)=>{
        // si empezamos drag desde un puerto, no mover el nodo
        if (e.target && e.target.classList.contains('port')) return
        draggingNode=true
        const grid = toSvg(e)
        offX = grid.x - n.x; offY = grid.y - n.y
        e.preventDefault()
      })
      const onMove = (e)=>{
        if(!draggingNode) return
        const grid = toSvg(e)
        n.x = grid.x - offX; n.y = grid.y - offY
        // actualizar extremos de enlaces ligados a este nodo
        topo.links.forEach(L=>{
          const upd = (end)=>{
            if (end.nodeId !== n.id) return end
            const port = topo.nodes.find(nn=>nn.id===n.id).ports[end.portIdx]
            return { ...end, x: n.x + port.x, y: n.y + port.y }
          }
          L.a = upd(L.a); L.b = upd(L.b)
        })
        setTopo(t=>({...t}))
      }
      const onUp = ()=> draggingNode=false
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)

      svg.appendChild(g)
    })

    // ---------- Eventos globales para el drag de cable ----------
    const onMouseMove = (e)=>{
      if (!dragging) return
      const m = toSvg(e)
      const a = dragging.start
      ghost.setAttribute('d', `M ${a.x} ${a.y} L ${m.x} ${m.y}`)
    }
    const onMouseUp = ()=>{
      if (!dragging) return
      // finalizar en el puerto que estamos hovereando
      if (hoverPort && !(hoverPort.nodeId===dragging.nodeId && hoverPort.portIdx===dragging.portIdx)){
        const A = topo.nodes.find(n=>n.id===dragging.nodeId)
        const B = topo.nodes.find(n=>n.id===hoverPort.nodeId)

        // no permitir reutilizar mismo puerto
        const aUsed = topo.links.some(L=>L.a.nodeId===A.id && L.a.portIdx===dragging.portIdx)
        const bUsed = topo.links.some(L=>L.b.nodeId===B.id && L.b.portIdx===hoverPort.portIdx)

        if (!aUsed && !bUsed){
          const a = { nodeId:A.id, portIdx:dragging.portIdx, ...portAbs(A.id, dragging.portIdx) }
          const b = { nodeId:B.id, portIdx:hoverPort.portIdx, ...portAbs(B.id, hoverPort.portIdx) }
          const ok = pairOk(A.type, B.type)
          topo.links.push({ id: Math.random().toString(36).slice(2,8), a, b, ok })
          setTopo(t=>({...t}))
        }
      }
      dragging = null
      ghost.style.display = 'none'
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // ---------- Borrar cable seleccionado con teclado ----------
    const onKey = (e)=>{
      if ((e.key==='Delete' || e.key==='Backspace') && selectedLinkId){
        topo.links = topo.links.filter(x=>x.id!==selectedLinkId)
        selectedLinkId = null
        setTopo(t=>({...t}))
      }
      if (e.key==='Escape'){
        dragging=null; ghost.style.display='none'
      }
    }
    window.addEventListener('keydown', onKey)

    // cleanup
    return ()=>{
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('keydown', onKey)
    }
  }, [topo, setTopo])

  return <svg ref={ref} viewBox="0 0 1000 520"></svg>
}
