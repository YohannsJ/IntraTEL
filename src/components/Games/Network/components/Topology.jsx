import React, { useEffect, useRef } from 'react'

export default function Topology({ topo, setTopo, ctx }) {
  const ref = useRef(null)

  useEffect(() => {
    const svg = ref.current
    if (!svg) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const NS = 'http://www.w3.org/2000/svg'
    const pt = svg.createSVGPoint()
    const toSvg = (e) => {
      pt.x = e.clientX
      pt.y = e.clientY
      return pt.matrixTransform(svg.getScreenCTM().inverse())
    }

    // Rutas de imágenes
    const routerPng = '/router.png'
    const switchPng = '/switch.png'
    const pcPng = '/pc.png'

    // ---------- Estado local para two-tap selection ----------
    let selectedPort = null // { nodeId, portIdx, element }
    let selectionIndicator = null
    let selectedLinkId = null // para borrar con tecla
    let ghostCable = null // cable punteado que sigue el cursor
    
    // ---------- Estado local para drag de nodos ----------
    let draggingNode = null // { nodeId, offX, offY }
    let animationFrameId = null
    let pendingUpdate = null


    // ---------- Helpers ----------
    const portAbs = (nodeId, portIdx) => {
      const n = topo.nodes.find((x) => x.id === nodeId)
      const p = n.ports[portIdx]
      return { x: n.x + p.x, y: n.y + p.y }
    }

    const pairOk = (aType, bType) => {
      const t = [aType, bType].sort().join('-')
      return t === 'router-switch' || t === 'pc-switch'
    }

    const isPortUsed = (nodeId, portIdx) => {
      return topo.links.some(
        (L) =>
          (L.a.nodeId === nodeId && L.a.portIdx === portIdx) ||
          (L.b.nodeId === nodeId && L.b.portIdx === portIdx)
      )
    }
    
    // Verificar si se han hecho las conexiones correctas (Router-Switch y PC-Switch)
    const checkConnectionsFlag = () => {
      if (!ctx || !ctx.setFlags || !ctx.flags) return
      
      // Verificar si ya tiene la bandera de conexión
      if (ctx.flags.some(f => f.id === 'connection')) return
      
      // Verificar que existan Router-Switch y PC-Switch
      const hasRouterSwitch = topo.links.some(L => {
        const nodeA = topo.nodes.find(n => n.id === L.a.nodeId)
        const nodeB = topo.nodes.find(n => n.id === L.b.nodeId)
        if (!nodeA || !nodeB) return false
        const types = [nodeA.type, nodeB.type].sort().join('-')
        return types === 'router-switch'
      })
      
      const hasPCSwitch = topo.links.some(L => {
        const nodeA = topo.nodes.find(n => n.id === L.a.nodeId)
        const nodeB = topo.nodes.find(n => n.id === L.b.nodeId)
        if (!nodeA || !nodeB) return false
        const types = [nodeA.type, nodeB.type].sort().join('-')
        return types === 'pc-switch'
      })
      
      // Si ambas conexiones están hechas, otorgar bandera
      if (hasRouterSwitch && hasPCSwitch) {
        ctx.setFlags(currentFlags => [
          ...currentFlags,
          {
            id: 'connection',
            title: 'Conexión Física Completada',
            code: 'FLAG{NETWORK_C4BL1NG_M4ST3R}'
          }
        ])
      }
    }

    const markSelected = (id, on) => {
      const el = document.getElementById('link-' + id)
      if (!el) return
      el.style.filter = on ? 'drop-shadow(0 0 3px #fff)' : ''
      el.style.strokeWidth = on ? '4' : '3'
    }

    const showSelection = (nodeId, portIdx, element) => {
      hideSelection()
      const n = topo.nodes.find((x) => x.id === nodeId)
      const p = n.ports[portIdx]
      selectionIndicator = document.createElementNS(NS, 'circle')
      selectionIndicator.setAttribute('class', 'port-selection')
      selectionIndicator.setAttribute('r', 16)
      selectionIndicator.setAttribute('cx', n.x + p.x)
      selectionIndicator.setAttribute('cy', n.y + p.y)
      selectionIndicator.style.fill = 'none'
      selectionIndicator.style.stroke = '#00ff00'
      selectionIndicator.style.strokeWidth = '2'
      selectionIndicator.style.pointerEvents = 'none'
      svg.appendChild(selectionIndicator)
    }

    const hideSelection = () => {
      if (selectionIndicator) {
        selectionIndicator.remove()
        selectionIndicator = null
      }
    }

    const highlightTargets = (sourceNodeId, sourceType) => {
      topo.nodes.forEach((n) => {
        if (n.id === sourceNodeId) return
        if (!pairOk(sourceType, n.type)) return
        n.ports.forEach((p, idx) => {
          if (isPortUsed(n.id, idx)) return
          const circle = document.querySelector(
            `circle[data-node="${n.id}"][data-port="${idx}"]`
          )
          if (circle) {
            circle.style.fill = '#ffff00'
            circle.style.stroke = '#ff8800'
          }
        })
      })
    }

    const clearHighlights = () => {
      document.querySelectorAll('circle.port').forEach((c) => {
        c.style.fill = ''
        c.style.stroke = ''
      })
    }

    // ---------- Funciones para cable fantasma ----------
    const createGhostCable = (startX, startY) => {
      if (ghostCable) return
      
      ghostCable = document.createElementNS(NS, 'path')
      ghostCable.setAttribute('class', 'link ghost')
      ghostCable.setAttribute('stroke-dasharray', '8 4')
      ghostCable.setAttribute('stroke-width', '3')
      ghostCable.setAttribute('stroke', '#00ff88')
      ghostCable.setAttribute('fill', 'none')
      ghostCable.setAttribute('opacity', '0.7')
      ghostCable.style.pointerEvents = 'none'
      
      // Crear path curvo inicial
      const d = `M ${startX} ${startY} Q ${startX + 50} ${startY - 30} ${startX + 100} ${startY}`
      ghostCable.setAttribute('d', d)
      
      svg.appendChild(ghostCable)
    }

    const updateGhostCable = (startX, startY, endX, endY) => {
      if (!ghostCable) return
      
      // Calcular punto de control para curva cuadrática
      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2 - Math.abs(endX - startX) * 0.2
      
      const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
      ghostCable.setAttribute('d', d)
    }

    const removeGhostCable = () => {
      if (ghostCable) {
        ghostCable.remove()
        ghostCable = null
      }
    }

    const successFeedback = (x, y) => {
      const flash = document.createElementNS(NS, 'circle')
      flash.setAttribute('cx', x)
      flash.setAttribute('cy', y)
      flash.setAttribute('r', 20)
      flash.style.fill = '#00ff00'
      flash.style.opacity = '0.7'
      flash.style.pointerEvents = 'none'
      svg.appendChild(flash)
      setTimeout(() => {
        flash.style.transition = 'all 0.4s'
        flash.style.opacity = '0'
        flash.setAttribute('r', 40)
        setTimeout(() => flash.remove(), 400)
      }, 50)
    }

    // ---------- Links (render + eventos) ----------
    topo.links.forEach((L) => {
      // Grupo para el cable y sus extremos
      const linkGroup = document.createElementNS(NS, 'g')
      linkGroup.setAttribute('id', 'link-group-' + L.id)
      linkGroup.setAttribute('class', 'link-group')
      
      // Línea del cable (curva)
      const path = document.createElementNS(NS, 'path')
      path.setAttribute('id', 'link-' + L.id)
      path.setAttribute('class', 'link ' + (L.ok ? 'ok' : 'bad'))
      
      // Crear path curvo para el cable
      const midX = (L.a.x + L.b.x) / 2
      const midY = (L.a.y + L.b.y) / 2 - Math.abs(L.b.x - L.a.x) * 0.2
      const d = `M ${L.a.x} ${L.a.y} Q ${midX} ${midY} ${L.b.x} ${L.b.y}`
      path.setAttribute('d', d)
      
      // Círculo en el extremo A (origen)
      const circleA = document.createElementNS(NS, 'circle')
      circleA.setAttribute('class', 'link-endpoint')
      circleA.setAttribute('cx', L.a.x)
      circleA.setAttribute('cy', L.a.y)
      circleA.setAttribute('r', 5)
      circleA.style.fill = L.ok ? 'var(--ok)' : 'var(--err)'
      circleA.style.stroke = '#fff'
      circleA.style.strokeWidth = '1.5'
      circleA.style.pointerEvents = 'none'
      
      // Círculo en el extremo B (destino)
      const circleB = document.createElementNS(NS, 'circle')
      circleB.setAttribute('class', 'link-endpoint')
      circleB.setAttribute('cx', L.b.x)
      circleB.setAttribute('cy', L.b.y)
      circleB.setAttribute('r', 5)
      circleB.style.fill = L.ok ? 'var(--ok)' : 'var(--err)'
      circleB.style.stroke = '#fff'
      circleB.style.strokeWidth = '1.5'
      circleB.style.pointerEvents = 'none'

      const handleLinkClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Eliminar el cable directamente con un solo click/toque
        setTopo((currentTopo) => ({
          ...currentTopo,
          links: currentTopo.links.filter((x) => x.id !== L.id),
        }))
      }

      path.addEventListener('click', handleLinkClick)
      path.addEventListener('touchstart', handleLinkClick)
      path.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        setTopo((currentTopo) => ({
          ...currentTopo,
          links: currentTopo.links.filter((x) => x.id !== L.id),
        }))
      })
      
      linkGroup.appendChild(path)
      linkGroup.appendChild(circleA)
      linkGroup.appendChild(circleB)
      svg.appendChild(linkGroup)
    })

    // ---------- Nodos ----------
    topo.nodes.forEach((n) => {
      const g = document.createElementNS(NS, 'g')
      g.setAttribute('class', 'node')
      g.setAttribute('data-node-id', n.id)
      g.setAttribute('transform', `translate(${n.x},${n.y})`)

      // Icono del dispositivo (sin rectángulo de fondo)
      const img = document.createElementNS(NS, 'image')
      img.setAttribute('x', -10)
      img.setAttribute('y', -10)
      img.setAttribute('width', 120)
      img.setAttribute('height', 120)
      if (n.type === 'router') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', routerPng)
      else if (n.type === 'switch') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', switchPng)
      else if (n.type === 'pc') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', pcPng)
      g.appendChild(img)

      // Etiqueta del dispositivo (encima del icono)
      const label = document.createElementNS(NS, 'text')
      label.setAttribute('class', 'label')
      label.setAttribute('x', 50)
      label.setAttribute('y', -10)
      label.setAttribute('text-anchor', 'middle')
      label.textContent = `${n.type.toUpperCase()} (${n.id})`
      g.appendChild(label)

      // --- Puertos (círculos clickables + "jack" visual) ---
      n.ports.forEach((p, idx) => {
        const portGroup = document.createElementNS(NS, 'g')

        // Puerto clickable (más grande para fácil selección)
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('class', 'port')
        c.setAttribute('r', 15)
        c.setAttribute('cx', p.x)
        c.setAttribute('cy', p.y)
        c.dataset.node = n.id
        c.dataset.port = String(idx)
        
        // Verificar si el puerto está en uso y colorearlo
        const portUsed = isPortUsed(n.id, idx)
        if (portUsed) {
          c.style.fill = '#1a4d2e'
          c.style.stroke = '#4ade80'
          c.style.strokeWidth = '2.5'
        }

        // Jack visual (círculo más pequeño)
        const jack = document.createElementNS(NS, 'circle')
        jack.setAttribute('class', 'port-jack')
        jack.setAttribute('r', 6)
        jack.setAttribute('cx', p.x)
        jack.setAttribute('cy', p.y)
        jack.style.fill = portUsed ? '#4ade80' : '#333'
        jack.style.pointerEvents = 'none'

        // Etiqueta del puerto (solo para router)
        if (n.type === 'router' && p.name) {
          const portLabel = document.createElementNS(NS, 'text')
          portLabel.setAttribute('class', 'port-label')
          portLabel.setAttribute('x', p.x)
          portLabel.setAttribute('y', p.y - 20)
          portLabel.setAttribute('text-anchor', 'middle')
          portLabel.textContent = p.name
          portGroup.appendChild(portLabel)
        }

        // Two-tap: primer toque selecciona, segundo toque conecta
        const onPortTap = (e) => {
          e.stopPropagation()
          e.preventDefault()

          // Si ya hay un puerto seleccionado, intentar conectar
          if (selectedPort) {
            const sourceNode = topo.nodes.find((x) => x.id === selectedPort.nodeId)
            const targetNode = n

            // No conectar al mismo puerto
            if (selectedPort.nodeId === n.id && selectedPort.portIdx === idx) {
              hideSelection()
              clearHighlights()
              selectedPort = null
              return
            }

            // Validar que los puertos no estén en uso
            const sourceUsed = isPortUsed(selectedPort.nodeId, selectedPort.portIdx)
            const targetUsed = isPortUsed(n.id, idx)

            if (!sourceUsed && !targetUsed && pairOk(sourceNode.type, targetNode.type)) {
              const a = {
                nodeId: selectedPort.nodeId,
                portIdx: selectedPort.portIdx,
                ...portAbs(selectedPort.nodeId, selectedPort.portIdx),
              }
              const b = { nodeId: n.id, portIdx: idx, ...portAbs(n.id, idx) }
              const ok = pairOk(sourceNode.type, targetNode.type)
              const newLink = { id: Math.random().toString(36).slice(2, 8), a, b, ok }

              setTopo((currentTopo) => {
                const updatedTopo = {
                  ...currentTopo,
                  links: [...currentTopo.links, newLink],
                }
                // Verificar banderas después de actualizar la topología
                setTimeout(() => checkConnectionsFlag(), 100)
                return updatedTopo
              })

              successFeedback(b.x, b.y)
              hideSelection()
              clearHighlights()
              removeGhostCable()
              selectedPort = null
            } else {
              // Conexión inválida, deseleccionar
              hideSelection()
              clearHighlights()
              removeGhostCable()
              selectedPort = null
            }
          } else {
            // Primer toque: seleccionar puerto
            if (!isPortUsed(n.id, idx)) {
              selectedPort = { nodeId: n.id, portIdx: idx, element: c }
              showSelection(n.id, idx, c)
              highlightTargets(n.id, n.type)
              
              // Crear cable fantasma
              const portPos = portAbs(n.id, idx)
              createGhostCable(portPos.x, portPos.y)
            }
          }
        }

        c.addEventListener('click', onPortTap)
        c.addEventListener('touchstart', onPortTap, { passive: false })

        portGroup.appendChild(c)
        portGroup.appendChild(jack)
        g.appendChild(portGroup)
      })

      // --- Info de interfaces (debajo del icono) ---
      if (n.type === 'router') {
        // Mostrar info de cada interfaz
        n.ports.forEach((p, idx) => {
          const yOffset = 130 + idx * 20
          const info = document.createElementNS(NS, 'text')
          info.setAttribute('class', 'iface-info router-iface')
          info.setAttribute('x', 50)
          info.setAttribute('y', yOffset)
          info.setAttribute('text-anchor', 'middle')
          const ip = p.ip || 'unassigned'
          const mask = p.mask || ''
          const status = p.status || 'down'
          
          // Formato mejorado
          if (ip === 'unassigned') {
            info.textContent = `${p.name}: ${ip} (${status})`
          } else {
            info.textContent = `${p.name}: ${ip}/${mask} (${status})`
          }
          
          // Color según estado
          if (status === 'up') {
            info.style.fill = '#00ff88'
          } else {
            info.style.fill = '#ff6b6b'
          }
          g.appendChild(info)
        })
      } else if (n.type === 'pc') {
        // Info del PC en formato mejorado
        const ip = n.ip || 'No IP'
        const mask = n.mask || ''
        const gw = n.gw || ''
        
        // Línea IP
        const infoIP = document.createElementNS(NS, 'text')
        infoIP.setAttribute('class', 'iface-info pc-iface')
        infoIP.setAttribute('x', 50)
        infoIP.setAttribute('y', 130)
        infoIP.setAttribute('text-anchor', 'middle')
        infoIP.textContent = `IP: ${ip}/${mask}`
        infoIP.style.fill = '#4fc3f7'
        g.appendChild(infoIP)
        
        // Línea Gateway
        const infoGW = document.createElementNS(NS, 'text')
        infoGW.setAttribute('class', 'iface-info pc-iface')
        infoGW.setAttribute('x', 50)
        infoGW.setAttribute('y', 148)
        infoGW.setAttribute('text-anchor', 'middle')
        infoGW.textContent = `GW: ${gw}`
        infoGW.style.fill = '#ffb74d'
        g.appendChild(infoGW)
      }

      // Drag de los nodos (mouse y touch) - Sistema mejorado
      const startDrag = (clientX, clientY, e) => {
        if (e.target && (e.target.classList.contains('port') || e.target.classList.contains('port-jack'))) return false
        pt.x = clientX
        pt.y = clientY
        const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
        draggingNode = { nodeId: n.id, offX: grid.x - n.x, offY: grid.y - n.y }
        g.style.cursor = 'grabbing'
        return true
      }
      
      g.addEventListener('mousedown', (e) => {
        if (startDrag(e.clientX, e.clientY, e)) {
          e.preventDefault()
          e.stopPropagation()
        }
      })
      
      g.addEventListener('touchstart', (e) => {
        const touch = e.touches[0]
        if (startDrag(touch.clientX, touch.clientY, e)) {
          e.preventDefault()
          e.stopPropagation()
        }
      }, { passive: false })

      svg.appendChild(g)
    })

    // ---------- Eventos globales de drag ----------
    const updateNodePosition = (nodeId, newX, newY) => {
      const node = topo.nodes.find(n => n.id === nodeId)
      if (!node) return
      
      node.x = newX
      node.y = newY
      
      // Actualizar visualmente el nodo en el DOM sin re-render
      const nodeGroup = document.querySelector(`g.node[data-node-id="${nodeId}"]`)
      if (nodeGroup) {
        nodeGroup.setAttribute('transform', `translate(${newX},${newY})`)
      }
      
      // Actualizar enlaces conectados a este nodo
      topo.links.forEach((L) => {
        if (L.a.nodeId === node.id) {
          const port = node.ports[L.a.portIdx]
          L.a.x = node.x + port.x
          L.a.y = node.y + port.y
          
          // Actualizar visualmente el path del link (curvo)
          const linkPath = document.getElementById('link-' + L.id)
          if (linkPath) {
            const midX = (L.a.x + L.b.x) / 2
            const midY = (L.a.y + L.b.y) / 2 - Math.abs(L.b.x - L.a.x) * 0.2
            const d = `M ${L.a.x} ${L.a.y} Q ${midX} ${midY} ${L.b.x} ${L.b.y}`
            linkPath.setAttribute('d', d)
          }
          // Actualizar círculo del extremo A
          const circles = document.querySelectorAll(`#link-group-${L.id} .link-endpoint`)
          if (circles[0]) {
            circles[0].setAttribute('cx', L.a.x)
            circles[0].setAttribute('cy', L.a.y)
          }
        }
        if (L.b.nodeId === node.id) {
          const port = node.ports[L.b.portIdx]
          L.b.x = node.x + port.x
          L.b.y = node.y + port.y
          
          // Actualizar visualmente el path del link (curvo)
          const linkPath = document.getElementById('link-' + L.id)
          if (linkPath) {
            const midX = (L.a.x + L.b.x) / 2
            const midY = (L.a.y + L.b.y) / 2 - Math.abs(L.b.x - L.a.x) * 0.2
            const d = `M ${L.a.x} ${L.a.y} Q ${midX} ${midY} ${L.b.x} ${L.b.y}`
            linkPath.setAttribute('d', d)
          }
          // Actualizar círculo del extremo B
          const circles = document.querySelectorAll(`#link-group-${L.id} .link-endpoint`)
          if (circles[1]) {
            circles[1].setAttribute('cx', L.b.x)
            circles[1].setAttribute('cy', L.b.y)
          }
        }
      })
    }
    
    const scheduleUpdate = () => {
      if (!pendingUpdate) return
      
      // Actualizar inmediatamente el DOM
      updateNodePosition(pendingUpdate.nodeId, pendingUpdate.x, pendingUpdate.y)
      pendingUpdate = null
    }
    
    const onMouseMove = (e) => {
      // Actualizar cable fantasma si hay un puerto seleccionado
      if (selectedPort && ghostCable) {
        pt.x = e.clientX
        pt.y = e.clientY
        const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
        const startPos = portAbs(selectedPort.nodeId, selectedPort.portIdx)
        updateGhostCable(startPos.x, startPos.y, grid.x, grid.y)
      }
      
      // Lógica existente de drag de nodos
      if (!draggingNode) return
      e.preventDefault()
      pt.x = e.clientX
      pt.y = e.clientY
      const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
      pendingUpdate = {
        nodeId: draggingNode.nodeId,
        x: Math.max(50, Math.min(950, grid.x - draggingNode.offX)),
        y: Math.max(50, Math.min(470, grid.y - draggingNode.offY))
      }
      scheduleUpdate()
    }
    
    const onTouchMove = (e) => {
      if (!draggingNode) return
      e.preventDefault()
      const touch = e.touches[0]
      pt.x = touch.clientX
      pt.y = touch.clientY
      const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
      pendingUpdate = {
        nodeId: draggingNode.nodeId,
        x: Math.max(50, Math.min(950, grid.x - draggingNode.offX)),
        y: Math.max(50, Math.min(470, grid.y - draggingNode.offY))
      }
      scheduleUpdate()
    }
    
    const onDragEnd = () => {
      if (pendingUpdate) {
        updateNodePosition(pendingUpdate.nodeId, pendingUpdate.x, pendingUpdate.y)
        pendingUpdate = null
      }
      if (draggingNode) {
        // Sincronizar el estado final con React
        setTopo(t => ({ ...t }))
        draggingNode = null
      }
    }
    
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onDragEnd)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onDragEnd)
    window.addEventListener('touchcancel', onDragEnd)

    // ---------- Eventos globales ----------
    const onKey = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLinkId) {
        setTopo((currentTopo) => ({
          ...currentTopo,
          links: currentTopo.links.filter((x) => x.id !== selectedLinkId),
        }))
        selectedLinkId = null
      }
      if (e.key === 'Escape') {
        hideSelection()
        clearHighlights()
        removeGhostCable()
        selectedPort = null
      }
    }
    window.addEventListener('keydown', onKey)

    // cleanup
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onDragEnd)
      window.removeEventListener('touchcancel', onDragEnd)
    }
  }, [topo, setTopo])

  return (
    <svg
      ref={ref}
      viewBox="0 0 1000 520"
      style={{ 
        width: '100%', 
        height: '100%',
        minWidth: '350px',
        // minHeight: '400px',

        touchAction: 'none' // Prevenir zoom y scroll en móviles
      }}
    ></svg>
  )
}
