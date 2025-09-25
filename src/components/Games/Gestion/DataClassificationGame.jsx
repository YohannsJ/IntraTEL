
import React, { useState, useRef } from "react";
import styles from "./DataClassificationGame.module.css";
import dataSamples from "./dataSamples";

const initialCards = dataSamples.map((d, i) => ({ ...d, id: i }));

const DataClassificationGame = () => {
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState(initialCards);
  const [dragged, setDragged] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showFeedback, setShowFeedback] = useState(null); // 'success' | 'fail'
  const [maxScore, setMaxScore] = useState(0);
  const dragCardRef = useRef();

  // Animación de confeti simple
  const showConfetti = () => {
    const confetti = document.createElement('div');
    confetti.innerHTML = '🎉';
    confetti.style.position = 'fixed';
    confetti.style.left = '50%';
    confetti.style.top = '20%';
    confetti.style.fontSize = '4rem';
    confetti.style.zIndex = 9999;
    confetti.style.pointerEvents = 'none';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 1200);
  };

  const handleMouseDown = (e, card) => {
    setDragged(card);
    setDragPos({ x: e.clientX, y: e.clientY });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e) => {
    setDragPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e) => {
    // Detectar si soltó sobre una caja
    const safeBox = document.getElementById('safe-box');
    const suspiciousBox = document.getElementById('suspicious-box');
    const overSafe = isOverBox(e, safeBox);
    const overSuspicious = isOverBox(e, suspiciousBox);
    let correct = false;
    if (overSafe || overSuspicious) {
      if (overSafe && !dragged.sospechoso) correct = true;
      if (overSuspicious && dragged.sospechoso) correct = true;
      if (correct) {
        setScore((prev) => {
          const newScore = prev + 10;
          if (newScore > maxScore) setMaxScore(newScore);
          return newScore;
        });
        setShowFeedback('success');
        showConfetti();
      } else {
        setScore((prev) => prev - 5);
        setShowFeedback('fail');
      }
      setCards(cards.filter(c => c.id !== dragged.id));
      setTimeout(() => setShowFeedback(null), 900);
    }
    setDragged(null);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const isOverBox = (e, box) => {
    if (!box) return false;
    const rect = box.getBoundingClientRect();
    return (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
  };

  const handleRestart = () => {
    setCards(initialCards);
    setScore(0);
    setShowFeedback(null);
  };

  return (
    <div className={styles.gameContainer}>
  <div style={{ marginTop: 32, marginBottom: 10 }}>
        {cards.map((card) => (
          <div
            key={card.id}
            className={styles.card}
            style={dragged && dragged.id === card.id ? { opacity: 0.3 } : {}}
            onMouseDown={(e) => handleMouseDown(e, card)}
          >
            {card.texto}
          </div>
        ))}
      </div>
      {/* Tarjeta flotante */}
      {dragged && (
        <div
          ref={dragCardRef}
          className={styles.card}
          style={{
            position: 'fixed',
            left: dragPos.x - 110,
            top: dragPos.y - 20,
            width: 220,
            zIndex: 1000,
            pointerEvents: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            opacity: 0.95,
            transition: 'box-shadow 0.2s',
          }}
        >
          {dragged.texto}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
        <div
          id="safe-box"
          className={`${styles.box} ${styles.safe}`}
        >
          <span style={{ fontSize: '2rem' }}>✅</span>
          <div>Datos seguros</div>
        </div>
        <div
          id="suspicious-box"
          className={`${styles.box} ${styles.suspicious}`}
        >
          <span style={{ fontSize: '2rem' }}>🚨</span>
          <div>Datos sospechosos</div>
        </div>
      </div>
      <div className={styles.score}>
        Puntaje: {score} {maxScore > 0 && <span style={{ fontSize: '1rem', marginLeft: 10 }}>🏅 Máx: {maxScore}</span>}
      </div>
      <button onClick={handleRestart} style={{ marginTop: 10, padding: '6px 18px', borderRadius: 8, border: 'none', background: 'var(--safe-bg)', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>Reiniciar</button>
      {/* Feedback visual */}
      {showFeedback === 'success' && (
        <div style={{ position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: '#2ecc40', zIndex: 9999, pointerEvents: 'none' }}>¡Correcto! 😃</div>
      )}
      {showFeedback === 'fail' && (
        <div style={{ position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: '#e74c3c', zIndex: 9999, pointerEvents: 'none' }}>Oops, te equivocaste 😅</div>
      )}
    </div>
  );
};

export default DataClassificationGame;