// Test de los nuevos puzzles AND y OR
import { buildPuzzleAND, buildPuzzleOR } from '../utils/puzzleConfig.js';

console.log('=== Test de Puzzle AND ===');
const andPuzzle = buildPuzzleAND();
console.log('Título:', andPuzzle.title);
console.log('Descripción:', andPuzzle.description);
console.log('Nodos:', andPuzzle.nodes.length);
console.log('Función esperada - AND(false, false):', andPuzzle.expected([false, false])); // debería ser false
console.log('Función esperada - AND(true, false):', andPuzzle.expected([true, false])); // debería ser false  
console.log('Función esperada - AND(false, true):', andPuzzle.expected([false, true])); // debería ser false
console.log('Función esperada - AND(true, true):', andPuzzle.expected([true, true])); // debería ser true

console.log('\n=== Test de Puzzle OR ===');
const orPuzzle = buildPuzzleOR();
console.log('Título:', orPuzzle.title);
console.log('Descripción:', orPuzzle.description);
console.log('Nodos:', orPuzzle.nodes.length);
console.log('Función esperada - OR(false, false):', orPuzzle.expected([false, false])); // debería ser false
console.log('Función esperada - OR(true, false):', orPuzzle.expected([true, false])); // debería ser true
console.log('Función esperada - OR(false, true):', orPuzzle.expected([false, true])); // debería ser true
console.log('Función esperada - OR(true, true):', orPuzzle.expected([true, true])); // debería ser true