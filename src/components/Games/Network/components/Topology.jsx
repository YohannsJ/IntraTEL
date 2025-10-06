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
      const path = document.createElementNS(NS, 'path')
      path.setAttribute('id', 'link-' + L.id)
      path.setAttribute('class', 'link ' + (L.ok ? 'ok' : 'bad'))
      path.setAttribute('d', `M ${L.a.x} ${L.a.y} L ${L.b.x} ${L.b.y}`)

      path.addEventListener('click', () => {
        if (selectedLinkId === L.id) {
          markSelected(L.id, false)
          selectedLinkId = null
          return
        }
        if (selectedLinkId) {
          markSelected(selectedLinkId, false)
        }
        selectedLinkId = L.id
        markSelected(L.id, true)
      })
      path.addEventListener('touchstart', (e) => {
        e.preventDefault()
        if (selectedLinkId === L.id) {
          markSelected(L.id, false)
          selectedLinkId = null
          return
        }
        if (selectedLinkId) {
          markSelected(selectedLinkId, false)
        }
        selectedLinkId = L.id
        markSelected(L.id, true)
      })
      path.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        setTopo((currentTopo) => ({
          ...currentTopo,
          links: currentTopo.links.filter((x) => x.id !== L.id),
        }))
      })
      svg.appendChild(path)
    })

    // ---------- Nodos ----------
    topo.nodes.forEach((n) => {
      const g = document.createElementNS(NS, 'g')
      g.setAttribute('class', 'node')
      g.setAttribute('transform', `translate(${n.x},${n.y})`)

      // Icono del dispositivo (sin rectángulo de fondo)
      const img = document.createElementNS(NS, 'image')
      img.setAttribute('x', 0)
      img.setAttribute('y', 0)
      img.setAttribute('width', 80)
      img.setAttribute('height', 80)
      if (n.type === 'router') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', routerPng)
      else if (n.type === 'switch') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', switchPng)
      else if (n.type === 'pc') img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', pcPng)
      g.appendChild(img)

      // Etiqueta del dispositivo (encima del icono)
      const label = document.createElementNS(NS, 'text')
      label.setAttribute('class', 'label')
      label.setAttribute('x', 40)
      label.setAttribute('y', -5)
      label.setAttribute('text-anchor', 'middle')
      label.textContent = `${n.type.toUpperCase()} (${n.id})`
      g.appendChild(label)

      // --- Puertos (círculos clickables + "jack" visual) ---
      n.ports.forEach((p, idx) => {
        const portGroup = document.createElementNS(NS, 'g')

        // Puerto clickable (más grande para fácil selección)
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('class', 'port')
        c.setAttribute('r', 12)
        c.setAttribute('cx', p.x)
        c.setAttribute('cy', p.y)
        c.dataset.node = n.id
        c.dataset.port = String(idx)

        // Jack visual (círculo más pequeño)
        const jack = document.createElementNS(NS, 'circle')
        jack.setAttribute('class', 'port-jack')
        jack.setAttribute('r', 5)
        jack.setAttribute('cx', p.x)
        jack.setAttribute('cy', p.y)
        jack.style.fill = '#333'
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
              selectedPort = null
            } else {
              // Conexión inválida, deseleccionar
              hideSelection()
              clearHighlights()
              selectedPort = null
            }
          } else {
            // Primer toque: seleccionar puerto
            if (!isPortUsed(n.id, idx)) {
              selectedPort = { nodeId: n.id, portIdx: idx, element: c }
              showSelection(n.id, idx, c)
              highlightTargets(n.id, n.type)
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
          const yOffset = 110 + idx * 18
          const info = document.createElementNS(NS, 'text')
          info.setAttribute('class', 'iface-info router-iface')
          info.setAttribute('x', 40)
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
        infoIP.setAttribute('x', 40)
        infoIP.setAttribute('y', 110)
        infoIP.setAttribute('text-anchor', 'middle')
        infoIP.textContent = `IP: ${ip}/${mask}`
        infoIP.style.fill = '#4fc3f7'
        g.appendChild(infoIP)
        
        // Línea Gateway
        const infoGW = document.createElementNS(NS, 'text')
        infoGW.setAttribute('class', 'iface-info pc-iface')
        infoGW.setAttribute('x', 40)
        infoGW.setAttribute('y', 125)
        infoGW.setAttribute('text-anchor', 'middle')
        infoGW.textContent = `GW: ${gw}`
        infoGW.style.fill = '#ffb74d'
        g.appendChild(infoGW)
      }

      // Drag de los nodos (mouse y touch) - Sistema centralizado
      g.addEventListener('mousedown', (e) => {
        if (e.target && (e.target.classList.contains('port') || e.target.classList.contains('port-jack'))) return
        const grid = toSvg(e)
        draggingNode = { nodeId: n.id, offX: grid.x - n.x, offY: grid.y - n.y }
        e.preventDefault()
        e.stopPropagation()
      })
      
      g.addEventListener('touchstart', (e) => {
        if (e.target && (e.target.classList.contains('port') || e.target.classList.contains('port-jack'))) return
        const touch = e.touches[0]
        pt.x = touch.clientX
        pt.y = touch.clientY
        const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
        draggingNode = { nodeId: n.id, offX: grid.x - n.x, offY: grid.y - n.y }
        e.preventDefault()
        e.stopPropagation()
      }, { passive: false })

      svg.appendChild(g)
    })

    // ---------- Eventos globales de drag ----------
    const updateNodePosition = (nodeId, newX, newY) => {
      const node = topo.nodes.find(n => n.id === nodeId)
      if (!node) return
      
      node.x = newX
      node.y = newY
      
      // Actualizar enlaces conectados a este nodo
      topo.links.forEach((L) => {
        if (L.a.nodeId === node.id) {
          const port = node.ports[L.a.portIdx]
          L.a.x = node.x + port.x
          L.a.y = node.y + port.y
        }
        if (L.b.nodeId === node.id) {
          const port = node.ports[L.b.portIdx]
          L.b.x = node.x + port.x
          L.b.y = node.y + port.y
        }
      })
    }
    
    const scheduleUpdate = () => {
      if (animationFrameId) return
      
      animationFrameId = requestAnimationFrame(() => {
        if (pendingUpdate) {
          updateNodePosition(pendingUpdate.nodeId, pendingUpdate.x, pendingUpdate.y)
          setTopo(t => ({ ...t }))
          pendingUpdate = null
        }
        animationFrameId = null
      })
    }
    
    const onMouseMove = (e) => {
      if (!draggingNode) return
      const grid = toSvg(e)
      pendingUpdate = {
        nodeId: draggingNode.nodeId,
        x: grid.x - draggingNode.offX,
        y: grid.y - draggingNode.offY
      }
      scheduleUpdate()
    }
    
    const onTouchMove = (e) => {
      if (!draggingNode) return
      const touch = e.touches[0]
      pt.x = touch.clientX
      pt.y = touch.clientY
      const grid = pt.matrixTransform(svg.getScreenCTM().inverse())
      pendingUpdate = {
        nodeId: draggingNode.nodeId,
        x: grid.x - draggingNode.offX,
        y: grid.y - draggingNode.offY
      }
      scheduleUpdate()
      e.preventDefault()
    }
    
    const onDragEnd = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      if (pendingUpdate) {
        updateNodePosition(pendingUpdate.nodeId, pendingUpdate.x, pendingUpdate.y)
        setTopo(t => ({ ...t }))
        pendingUpdate = null
      }
      draggingNode = null
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
