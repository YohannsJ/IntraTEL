/**
 * chessAgent.js
 * Corre los 3 modelos pre-entrenados directamente en el navegador
 * usando onnxruntime-web (WebAssembly). No necesita servidor.
 *
 * Los modelos deben estar en public/models/ (cada .onnx con su .onnx.data):
 *   level1.onnx + level1.onnx.data
 *   level2.onnx + level2.onnx.data
 *   level3.onnx + level3.onnx.data
 */

import * as ort from 'onnxruntime-web/wasm'
import ortWasmUrl from 'onnxruntime-web/ort-wasm-simd-threaded.wasm?url'
import ortMjsUrl from 'onnxruntime-web/ort-wasm-simd-threaded.mjs?url'
import { encodeBoard, moveToIdx } from './boardEncoder.js'

// Archivos .wasm servidos desde el propio paquete instalado (misma versión que el JS)
ort.env.wasm.wasmPaths = { wasm: ortWasmUrl, mjs: ortMjsUrl }
// Un solo hilo: multihilo requiere cabeceras COOP/COEP que el sitio no envía
ort.env.wasm.numThreads = 1

// ─── Paths de los modelos ─────────────────────────────────────────────────────
const MODEL_PATHS = {
  1: '/models/level1.onnx',
  2: '/models/level2.onnx',
  3: '/models/level3.onnx',
}

// ─── Temperatura por nivel ────────────────────────────────────────────────────
// Alta temperatura → más aleatorio (más fácil)
// Temperatura baja → más determinista (más difícil)
const TEMPERATURE = {
  1: 1.8,   // Principiante: bastante aleatorio
  2: 0.6,   // Intermedio:   mezcla estrategia + algo de variación
  3: 0.05,  // Avanzado:     casi siempre elige la mejor movida
}

// ─── Cache de sesiones (se cargan una sola vez por nivel) ─────────────────────
const _sessions = {}
const _loading  = {}

async function getSession(level) {
  if (_sessions[level]) return _sessions[level]

  // Evitar cargas duplicadas paralelas
  if (!_loading[level]) {
    // Los pesos están en un archivo externo (.onnx.data) referenciado por el modelo
    const dataFile = `level${level}.onnx.data`
    _loading[level] = ort.InferenceSession.create(MODEL_PATHS[level], {
      executionProviders: ['wasm'],
      externalData: [{ path: dataFile, data: `/models/${dataFile}` }],
    }).then(session => {
      _sessions[level] = session
      return session
    }).catch(err => {
      delete _loading[level]   // permitir reintento en la siguiente llamada
      throw err
    })
  }

  return _loading[level]
}

/**
 * Precarga un modelo en background (útil para cargar el nivel por defecto
 * cuando el usuario navega a /Ajedrez, antes de que haga su primera movida).
 */
export async function preloadModel(level) {
  try {
    await getSession(level)
  } catch (err) {
    console.warn(`[chessAgent] No se pudo precargar modelo nivel ${level}:`, err)
  }
}

// ─── Sampling con temperatura ─────────────────────────────────────────────────
function sampleMove(legalMoves, policyLogits, temperature) {
  if (!legalMoves.length) return null

  // Obtener el logit de cada movida legal
  const scores = legalMoves.map(m => {
    const idx = moveToIdx(m.from, m.to) % 4096
    return policyLogits[idx]
  })

  if (temperature < 0.01) {
    // Greedy: devuelve directamente la movida con mayor score
    return legalMoves[scores.indexOf(Math.max(...scores))]
  }

  // Softmax con temperatura: convierte logits a probabilidades
  const maxScore  = Math.max(...scores)
  const expScores = scores.map(s => Math.exp((s - maxScore) / temperature))
  const sumExp    = expScores.reduce((a, b) => a + b, 0)
  const probs     = expScores.map(s => s / sumExp)

  // Muestreo por ruleta
  let r = Math.random()
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i]
    if (r <= 0) return legalMoves[i]
  }
  return legalMoves[legalMoves.length - 1]
}

// ─── API pública ──────────────────────────────────────────────────────────────
/**
 * Pide al modelo del nivel indicado que elija una movida.
 *
 * @param {Chess}  game   - instancia de chess.js con la posición actual
 * @param {number} level  - 1 | 2 | 3
 * @returns {object|null} movida verbose de chess.js, o null si falla
 */
export async function getModelMove(game, level) {
  const session    = await getSession(level)
  const boardData  = encodeBoard(game)
  const tensor     = new ort.Tensor('float32', boardData, [1, 14, 8, 8])
  const results    = await session.run({ board: tensor })
  const policy     = results.policy.data   // Float32Array(4096) — logits
  // La política no distingue piezas de promoción: solo se considera promover a dama
  const legalMoves = game.moves({ verbose: true })
    .filter(m => !m.promotion || m.promotion === 'q')
  const temp       = TEMPERATURE[level] ?? 0.5

  return sampleMove(legalMoves, policy, temp)
}

/**
 * Devuelve el valor posicional según el modelo (útil para la barra de evaluación).
 * +1.0 = blancas ganan, -1.0 = negras ganan
 */
export async function getPositionValue(game, level) {
  try {
    const session   = await getSession(level)
    const boardData = encodeBoard(game)
    const tensor    = new ort.Tensor('float32', boardData, [1, 14, 8, 8])
    const results   = await session.run({ board: tensor })
    return results.value.data[0]   // escalar en [-1, 1]
  } catch {
    return 0
  }
}
