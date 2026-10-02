/**
 * Ajedrez.jsx
 *
 * Modelos necesarios en public/models/:
 *   level1.onnx, level2.onnx, level3.onnx (+ sus .onnx.data)
 *   (generados por export_onnx.py después del entrenamiento)
 */

import { useState, useRef, useEffect } from 'react'
import { Chess } from 'chess.js'
import { useTheme } from '../../../context/ThemeContext.jsx'
import { getModelMove, preloadModel } from './chessAgent.js'
import s from './Ajedrez.module.css'
import { useAuth } from '../../../context/AuthContext.jsx'
import GuestFlagNotice from '../../Flags/GuestFlagNotice.jsx'

// ─── Piezas ───────────────────────────────────────────────────────────────────
const G = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
}
const FILES = 'abcdefgh'

// ─── 3 niveles del agente ─────────────────────────────────────────────────────
const LEVELS = [
  { id: 1, icon: '🥉', name: 'Principiante', desc: 'Aprende los fundamentos',  color: '#cd7f32' },
  { id: 2, icon: '🥈', name: 'Intermedio',   desc: 'Conoce estrategia básica', color: '#a8a9ad' },
  { id: 3, icon: '🥇', name: 'Avanzado',     desc: 'Juega con fuerza real',    color: '#d4a017' },
]

// ─── Minimax de respaldo (si el modelo ONNX no carga) ─────────────────────────
const PV = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 }
const PST = {
  p: [  0,  0,  0,  0,  0,  0,  0,  0, 50, 50, 50, 50, 50, 50, 50, 50,
       10, 10, 20, 30, 30, 20, 10, 10,  5,  5, 10, 25, 25, 10,  5,  5,
        0,  0,  0, 20, 20,  0,  0,  0,  5, -5,-10,  0,  0,-10, -5,  5,
        5, 10, 10,-20,-20, 10, 10,  5,  0,  0,  0,  0,  0,  0,  0,  0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,  0,  0,  0,  0,-20,-40,
      -30,  0, 10, 15, 15, 10,  0,-30,-30,  5, 15, 20, 20, 15,  5,-30,
      -30,  0, 15, 20, 20, 15,  0,-30,-30,  5, 10, 15, 15, 10,  5,-30,
      -40,-20,  0,  5,  5,  0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,-10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5, 10, 10,  5,  0,-10,-10,  5,  5, 10, 10,  5,  5,-10,
      -10,  0, 10, 10, 10, 10,  0,-10,-10, 10, 10, 10, 10, 10, 10,-10,
      -10,  5,  0,  0,  0,  0,  5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r: [  0,  0,  0,  0,  0,  0,  0,  0,  5, 10, 10, 10, 10, 10, 10,  5,
       -5,  0,  0,  0,  0,  0,  0, -5, -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5, -5,  0,  0,  0,  0,  0,  0, -5,
       -5,  0,  0,  0,  0,  0,  0, -5,  0,  0,  0,  5,  5,  0,  0,  0],
  q: [-20,-10,-10, -5, -5,-10,-10,-20,-10,  0,  0,  0,  0,  0,  0,-10,
      -10,  0,  5,  5,  5,  5,  0,-10, -5,  0,  5,  5,  5,  5,  0, -5,
        0,  0,  5,  5,  5,  5,  0, -5,-10,  5,  5,  5,  5,  5,  0,-10,
      -10,  0,  5,  0,  0,  0,  0,-10,-20,-10,-10, -5, -5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,
      -30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,
      -20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,
       20, 20,  0,  0,  0,  0, 20, 20, 20, 30, 10,  0,  0, 10, 30, 20],
}
const FALLBACK_DEPTH = { 1: 1, 2: 2, 3: 3 }

// Flag que se entrega al ganarle al agente en nivel Principiante
const LEVEL1_FLAG = 'FLAG{CH3CKM4T3_PR1NC1P14NT3}'

function pstIdx(sq, color) {
  const c = FILES.indexOf(sq[0])
  const r = 8 - parseInt(sq[1])
  return color === 'w' ? r * 8 + c : (7 - r) * 8 + c
}

function evalBoard(game) {
  let s = 0
  const board = game.board()
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c]; if (!cell) continue
      const sq = FILES[c] + (8 - r)
      const v  = PV[cell.type]
      const pt = PST[cell.type]?.[pstIdx(sq, cell.color)] ?? 0
      s += cell.color === 'w' ? v + pt : -(v + pt)
    }
  return s
}

function minimax(game, depth, α, β, maxing) {
  if (depth === 0 || game.isGameOver()) {
    if (game.isCheckmate()) return maxing ? -99999 : 99999
    if (game.isStalemate() || game.isDraw()) return 0
    return evalBoard(game)
  }
  const moves = game.moves()
  if (maxing) {
    let best = -Infinity
    for (const m of moves) {
      game.move(m); best = Math.max(best, minimax(game, depth-1, α, β, false)); game.undo()
      α = Math.max(α, best); if (β <= α) break
    }
    return best
  } else {
    let best = Infinity
    for (const m of moves) {
      game.move(m); best = Math.min(best, minimax(game, depth-1, α, β, true)); game.undo()
      β = Math.min(β, best); if (β <= α) break
    }
    return best
  }
}

function fallbackMove(game, level) {
  const depth = FALLBACK_DEPTH[level]
  const moves = [...game.moves({ verbose: true })].sort(() => Math.random() - 0.5)
  if (!moves.length) return null
  const maxing = game.turn() === 'w'
  let best = null, bestScore = maxing ? -Infinity : Infinity
  for (const m of moves) {
    game.move(m)
    const score = minimax(game, depth-1, -Infinity, Infinity, !maxing)
    game.undo()
    if (maxing ? score > bestScore : score < bestScore) { bestScore = score; best = m }
  }
  return best
}

// ─── Piezas capturadas ────────────────────────────────────────────────────────
const CAP_ORDER = ['q','r','b','n','p']
function getCaptured(game, byColor) {
  const caps = game.history({ verbose: true })
    .filter(m => m.captured && m.color === byColor).map(m => m.captured)
  const opp = byColor === 'w' ? 'b' : 'w'
  return CAP_ORDER.flatMap(t =>
    Array(caps.filter(x => x === t).length).fill(G[opp === 'w' ? t.toUpperCase() : t])
  ).join('')
}

function getKingCheckSq(game) {
  if (!game.isCheck()) return null
  const board = game.board(), turn = game.turn()
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c]
      if (cell?.type === 'k' && cell.color === turn) return FILES[c] + (8 - r)
    }
  return null
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ─── Componente ───────────────────────────────────────────────────────────────
export default function AjedrezGame() {
  const { currentTheme } = useTheme()
  const isDark = currentTheme === 'dark'

  const gameRef  = useRef(new Chess())
  const busyRef  = useRef(false)
  const timerRef = useRef(null)
  const gameIdRef = useRef(0)   // cambia en cada reinicio: invalida movidas del agente en curso
  const game     = gameRef.current

  const [,             setFen]          = useState(() => game.fen())
  const [selectedSq,   setSelectedSq]   = useState(null)
  const [legalDests,   setLegalDests]   = useState([])
  const [lastFrom,     setLastFrom]     = useState(null)
  const [lastTo,       setLastTo]       = useState(null)
  const [watchMode,    setWatchMode]    = useState(false)
  const [level,        setLevel]        = useState(2)
  const [modelLoading, setModelLoading] = useState(false)
  const [statusMsg,    setStatusMsg]    = useState('Tu turno — mueve una pieza blanca.')
  const [statusType,   setStatusType]   = useState('')
  const [history,      setHistory]      = useState([])
  const [evalPct,      setEvalPct]      = useState(50)
  const [gameOver,     setGameOver]     = useState(false)
  const [flag,         setFlag]         = useState(null)
  const [flagCopied,   setFlagCopied]   = useState(false)
  // Invitados: pueden ganar, pero no reciben la flag
  const { isAuthenticated } = useAuth()
  const [guestWon,     setGuestWon]     = useState(false)

  // Precarga el modelo del nivel seleccionado al entrar a la página
  useEffect(() => {
    setModelLoading(true)
    preloadModel(level).finally(() => setModelLoading(false))
  }, [level])

  // Cancela movidas pendientes del agente al salir de la página
  useEffect(() => () => {
    clearTimeout(timerRef.current)
    gameIdRef.current++
  }, [])

  function resetGame() {
    clearTimeout(timerRef.current)
    gameIdRef.current++
    game.reset(); busyRef.current = false
    setSelectedSq(null); setLegalDests([])
    setLastFrom(null); setLastTo(null)
    setFlag(null); setFlagCopied(false); setGuestWon(false)
    syncBoard()
  }

  function syncBoard() {
    setFen(game.fen())
    setHistory(game.history({ verbose: true }))
    setGameOver(game.isGameOver())
    // Evaluación simple normalizada a 0-100
    const raw = game.isGameOver() ? 0 : evalBoard(game)
    const clamped = Math.max(-900, Math.min(900, raw))
    setEvalPct(((clamped + 900) / 1800) * 100)
  }

  function applyStatus(inWatch = false) {
    if (game.isCheckmate()) {
      const w = game.turn() === 'w' ? 'Negras' : 'Blancas'
      setStatusMsg(`♛ ¡Jaque mate! Ganan las ${w}.`); setStatusType('gameover'); return
    }
    if (game.isStalemate()) { setStatusMsg('½ Tablas — Ahogado.'); setStatusType('gameover'); return }
    if (game.isDraw())      { setStatusMsg('½ Tablas.');          setStatusType('gameover'); return }
    if (game.isCheck()) {
      const w = game.turn() === 'w' ? 'Blancas' : 'Negras'
      setStatusMsg(`⚠️ ¡${w} en jaque!`); setStatusType('check'); return
    }
    if (inWatch) { setStatusMsg('▶ Calculando...'); setStatusType(''); return }
    setStatusMsg(game.turn() === 'w' ? 'Tu turno — mueve una pieza blanca.' : 'El agente está pensando...')
    setStatusType('')
  }

  // ── Movida del agente ────────────────────────────────────────────────────────
  async function doAgentMove(lvl = level) {
    if (game.isGameOver() || busyRef.current) return
    const gameId = gameIdRef.current
    busyRef.current = true
    setStatusMsg('El agente está pensando...'); setStatusType('thinking')

    // Pequeña pausa para que la UI actualice antes del cálculo
    await sleep(200)
    if (gameId !== gameIdRef.current) return

    let mv = null
    try {
      // Inferencia con el modelo ONNX en el navegador
      mv = await getModelMove(game, lvl)
    } catch (err) {
      console.warn('[Ajedrez] Modelo no disponible, usando minimax:', err)
      mv = fallbackMove(game, lvl)
    }
    // La partida se reinició mientras el agente pensaba
    if (gameId !== gameIdRef.current) return

    if (mv) {
      game.move(mv); setLastFrom(mv.from); setLastTo(mv.to)
      syncBoard(); applyStatus(false)
    }
    busyRef.current = false
  }

  // ── Click en casilla ─────────────────────────────────────────────────────────
  function onSquareClick(sqName) {
    if (watchMode || busyRef.current || game.isGameOver()) return
    if (game.turn() === 'b') return

    if (selectedSq === sqName) { setSelectedSq(null); setLegalDests([]); return }

    if (selectedSq && legalDests.includes(sqName)) {
      const mv = { from: selectedSq, to: sqName }
      const p  = game.get(selectedSq)
      if (p?.type === 'p' && (sqName[1]==='8' || sqName[1]==='1')) mv.promotion = 'q'
      try { game.move(mv) } catch { setSelectedSq(null); setLegalDests([]); return }
      setLastFrom(selectedSq); setLastTo(sqName)
      setSelectedSq(null); setLegalDests([])
      syncBoard(); applyStatus(false)
      if (game.isCheckmate() && level === 1) {
        if (isAuthenticated) setFlag(LEVEL1_FLAG)
        else setGuestWon(true)
      }
      if (!game.isGameOver()) timerRef.current = setTimeout(() => doAgentMove(level), 300)
      return
    }

    const cell = game.get(sqName)
    if (cell && cell.color === 'w') {
      setSelectedSq(sqName)
      setLegalDests(game.moves({ square: sqName, verbose: true }).map(m => m.to))
    } else {
      setSelectedSq(null); setLegalDests([])
    }
  }

  // ── Modo espectador ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!watchMode) return
    let active = true
    resetGame()
    setStatusMsg('▶ Agente vs Agente en curso...'); setStatusType('')

    async function tick() {
      if (!active || busyRef.current || game.isGameOver()) return
      busyRef.current = true
      let mv = null
      try {
        mv = await getModelMove(game, level)
      } catch {
        mv = fallbackMove(game, level)
      }
      if (mv && active) {
        game.move(mv); setLastFrom(mv.from); setLastTo(mv.to)
        syncBoard(); applyStatus(true)
      }
      busyRef.current = false
      if (active && !game.isGameOver()) timerRef.current = setTimeout(tick, 900)
    }
    timerRef.current = setTimeout(tick, 700)
    return () => { active = false; clearTimeout(timerRef.current) }
  }, [watchMode]) // eslint-disable-line

  // ── Controles ─────────────────────────────────────────────────────────────────
  function handleLevelChange(newLevel) {
    if (watchMode) return
    setLevel(newLevel)
    handleNewGame()
  }

  function handleNewGame() {
    if (watchMode) setWatchMode(false)
    resetGame()
    setStatusMsg('Tu turno — mueve una pieza blanca.'); setStatusType('')
  }

  function handleResign() {
    if (watchMode || busyRef.current || game.isGameOver()) return
    clearTimeout(timerRef.current); gameIdRef.current++; busyRef.current = false
    setStatusMsg('Te has rendido. ¡Mejor suerte la próxima!'); setStatusType('gameover')
    setGameOver(true)
  }

  function handleToggleWatch() {
    if (watchMode) {
      setWatchMode(false)
      resetGame()
      setStatusMsg('Tu turno — mueve una pieza blanca.'); setStatusType('')
    } else { setWatchMode(true) }
  }

  async function handleCopyFlag() {
    try {
      await navigator.clipboard.writeText(flag)
      setFlagCopied(true)
    } catch {
      setFlagCopied(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const board      = game.board()
  const isWTurn    = game.turn() === 'w'
  const checkSq    = getKingCheckSq(game)
  const activeLevel = LEVELS.find(l => l.id === level)
  const evalDisp   = evalPct > 50
    ? `+${((evalPct - 50) / 50 * 9).toFixed(1)}`
    : `-${((50 - evalPct) / 50 * 9).toFixed(1)}`

  const movePairs = Array.from(
    { length: Math.ceil(history.length / 2) },
    (_, i) => ({ num: i + 1, w: history[i * 2]?.san, b: history[i * 2 + 1]?.san })
  )

  return (
    <div className={`${s.page} ${isDark ? s.dark : s.light}`}>
      <div className={s.gameArea}>

        {/* ── Tablero ── */}
        <div className={s.boardSection}>

          {/* Carta del agente */}
          <div className={s.playerCard}>
            <div className={s.playerAvatar} style={{ background: activeLevel.color }}>
              {activeLevel.icon}
            </div>
            <div className={s.playerInfo}>
              <span className={s.playerName}>Agente RL</span>
              <span className={s.playerSub}>{activeLevel.name}</span>
            </div>
            <div className={s.capturedRow}>{getCaptured(game, 'b')}</div>
            {!isWTurn && !gameOver && <div className={s.activeDot} />}
          </div>

          {/* Tablero con coordenadas */}
          <div className={s.boardWrap}>
            <div className={s.ranksCol}>
              {[8,7,6,5,4,3,2,1].map(r => <span key={r}>{r}</span>)}
            </div>
            <div>
              <div className={s.board} role="grid" aria-label="Tablero de ajedrez">
                {board.map((row, ri) =>
                  row.map((cell, ci) => {
                    const sqName  = FILES[ci] + (8 - ri)
                    const isLight = (ri + ci) % 2 === 0
                    const isSel   = sqName === selectedSq
                    const isLast  = sqName === lastFrom || sqName === lastTo
                    const isDest  = legalDests.includes(sqName)
                    const isCap   = isDest && cell !== null

                    const cls = [
                      s.sq,
                      isLight ? s.sqLight : s.sqDark,
                      isSel                 ? s.sel       : '',
                      isLast  && isLight    ? s.lastLight : '',
                      isLast  && !isLight   ? s.lastDark  : '',
                      isDest  && !isCap     ? s.dot       : '',
                      isCap                 ? s.capRing   : '',
                      sqName === checkSq    ? s.inCheck   : '',
                    ].filter(Boolean).join(' ')

                    const glyph = cell
                      ? G[cell.color === 'w' ? cell.type.toUpperCase() : cell.type]
                      : null

                    return (
                      <div key={sqName} className={cls} onClick={() => onSquareClick(sqName)}
                        role="gridcell" aria-label={sqName}>
                        {glyph && (
                          <span className={cell.color === 'w' ? s.pieceW : s.pieceB}>
                            {glyph}
                          </span>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
              <div className={s.filesRow}>
                {FILES.split('').map(f => <span key={f}>{f}</span>)}
              </div>
            </div>
          </div>

          {/* Carta del jugador */}
          <div className={s.playerCard}>
            <div className={`${s.playerAvatar} ${s.humanAvatar}`}>🎓</div>
            <div className={s.playerInfo}>
              <span className={s.playerName}>Tú</span>
              <span className={s.playerSub}>Piezas blancas</span>
            </div>
            <div className={s.capturedRow}>{getCaptured(game, 'w')}</div>
            {isWTurn && !gameOver && <div className={`${s.activeDot} ${s.dotPlayer}`} />}
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div className={s.panel}>

          {/* Selector de nivel */}
          <p className={s.panelLabel}>Elige tu oponente</p>
          <div className={s.levelCards}>
            {LEVELS.map(lv => (
              <button
                key={lv.id}
                className={`${s.levelCard}${level === lv.id ? ` ${s.levelActive}` : ''}`}
                onClick={() => handleLevelChange(lv.id)}
                disabled={watchMode}
              >
                <span className={s.lvIcon}>{lv.icon}</span>
                <div className={s.lvText}>
                  <span className={s.lvName}>{lv.name}</span>
                  <span className={s.lvDesc}>{lv.desc}</span>
                </div>
                {level === lv.id && <span className={s.lvCheck}>✓</span>}
              </button>
            ))}
          </div>

          {/* Barra de evaluación */}
          <div className={s.evalWrap}>
            <div className={s.evalBg}>
              <div className={s.evalFillW} style={{ width: `${evalPct}%` }} />
            </div>
            <span className={s.evalLabel}>{evalDisp}</span>
          </div>

          {/* Status */}
          <div className={`${s.statusBox}${statusType ? ` ${s[statusType]}` : ''}`}>
            {modelLoading && !gameOver
              ? '⏳ Cargando modelo...'
              : statusMsg}
          </div>

          {/* Flag por ganar en nivel Principiante */}
          {flag && (
            <div className={s.flagBox}>
              <span className={s.flagTitle}>🚩 ¡Venciste al agente Principiante!</span>
              <code className={s.flagCode}>{flag}</code>
              <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleCopyFlag}>
                {flagCopied ? '✓ Copiada' : '📋 Copiar flag'}
              </button>
            </div>
          )}

          {guestWon && !flag && <GuestFlagNotice />}

          {/* Botones */}
          <div className={s.btnRow}>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={() => handleNewGame()}>
              ⟳ Nueva partida
            </button>
            <button className={`${s.btn} ${s.btnDanger}`}
              onClick={handleResign} disabled={gameOver || watchMode}>
              🏳 Rendirse
            </button>
          </div>

          <button className={`${s.watchBtn}${watchMode ? ` ${s.watchOn}` : ''}`}
            onClick={handleToggleWatch}>
            {watchMode ? '⏹ Detener espectador' : '👁 Ver agente vs agente'}
          </button>

          {/* Historial */}
          <p className={s.panelLabel}>Historial</p>
          <div className={s.historyBox}>
            {movePairs.length === 0
              ? <span className={s.historyEmpty}>La partida aún no comienza…</span>
              : (
                <div className={s.historyGrid}>
                  {movePairs.map(({ num, w, b }) => [
                    <span key={`n${num}`} className={s.hNum}>{num}.</span>,
                    <span key={`w${num}`} className={s.hW}>{w}</span>,
                    <span key={`b${num}`} className={s.hB}>{b ?? ''}</span>,
                  ])}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
