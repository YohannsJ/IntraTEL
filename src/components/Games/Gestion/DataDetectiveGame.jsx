import React, { useState, useRef } from "react";
import styles from "./DataClassificationGame.module.css";
import levels from "./levelsData";

const avatarImg = "https://cdn-icons-png.flaticon.com/512/616/616494.png"; // detective avatar

// Iconos según el tipo de registro
function getCardIcon(texto) {
  if (texto.includes('Login')) return '👤';
  if (texto.toLowerCase().includes('mensaje')) return '💬';
  if (texto.includes('Transferencia')) return '📤';
  if (texto.toLowerCase().includes('tarea')) return '📄';
  if (texto.toLowerCase().includes('fallidos')) return '⚠️';
  return '🗂️';
}

const DataDetectiveGame = () => {
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [cards, setCards] = useState(levels[0].cards.map((d, i) => ({ ...d, id: i })));
  const [dragged, setDragged] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showFeedback, setShowFeedback] = useState(null); // 'success' | 'fail'
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState(null);
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
    setCards(levels[level].cards.map((d, i) => ({ ...d, id: i })));
    setScore(0);
    setShowFeedback(null);
    setQuizMode(false);
    setQuizAnswer(null);
  };

  // Cuando termina el nivel
  React.useEffect(() => {
    if (cards.length === 0 && !quizMode) {
      setTimeout(() => setQuizMode(true), 600);
    }
  }, [cards, quizMode]);

  // Siguiente nivel
  const nextLevel = () => {
    if (level < levels.length - 1) {
      setLevel(level + 1);
      setCards(levels[level + 1].cards.map((d, i) => ({ ...d, id: i })));
      setQuizMode(false);
      setQuizAnswer(null);
    } else {
      setLevel(0);
      setCards(levels[0].cards.map((d, i) => ({ ...d, id: i })));
      setQuizMode(false);
      setQuizAnswer(null);
      setScore(0);
    }
  };

  // Quiz
  const quiz = levels[level].quiz;
  const handleQuiz = (idx) => {
    setQuizAnswer(idx);
    setTimeout(() => {
      nextLevel();
    }, 1200);
  };

  return (
    <div className={styles.gameContainer}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <img src={avatarImg} alt="Detective" style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', border: '2px solid #ccc' }} />
        <h2 style={{ color: 'var(--game-text)', margin: 0 }}>{levels[level].name}</h2>
      </div>
      {!quizMode && (
        <>
          <div className={styles.instruction}>
            Arrastra cada tarjeta a la caja correcta.
          </div>
          <div className={styles.cardsRow}>
            {cards.map((card) => (
              <div
                key={card.id}
                className={styles.card}
                style={dragged && dragged.id === card.id ? { opacity: 0.3 } : {}}
                onMouseDown={(e) => handleMouseDown(e, card)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                  <div>Usuario: {card.usuario || '-'}</div>
                  <div>País: {card.pais || '-'}</div>
                  <div>Hora: {card.hora || '-'}</div>
                  <div>{card.accion}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
            <div>Usuario: {dragged.usuario || '-'}</div>
            <div>País: {dragged.pais || '-'}</div>
            <div>Hora: {dragged.hora || '-'}</div>
            <div>{dragged.accion}</div>
          </div>
        </div>
      )}
      {!quizMode && (
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
      )}
      <div className={styles.score}>
        Puntaje: {score} {maxScore > 0 && <span style={{ fontSize: '1rem', marginLeft: 10 }}>🏅 Máx: {maxScore}</span>}
      </div>
      <button onClick={handleRestart} style={{ marginTop: 10, padding: '6px 18px', borderRadius: 8, border: 'none', background: 'var(--safe-bg)', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>Reiniciar nivel</button>
      {/* Feedback visual */}
      {showFeedback === 'success' && (
        <div style={{ position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: '#2ecc40', zIndex: 9999, pointerEvents: 'none' }}>¡Correcto! 😃</div>
      )}
      {showFeedback === 'fail' && (
        <div style={{ position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%, -50%)', fontSize: '3rem', color: '#e74c3c', zIndex: 9999, pointerEvents: 'none' }}>Oops, te equivocaste 😅</div>
      )}
      {/* Quiz */}
      {quizMode && (
        <div style={{ marginTop: 32, background: 'var(--card-bg)', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.10)', display: 'inline-block' }}>
          <h3 style={{ color: 'var(--game-text)' }}>{quiz.pregunta}</h3>
          {quiz.opciones.map((op, idx) => (
            <button
              key={idx}
              onClick={() => handleQuiz(idx)}
              style={{
                display: 'block',
                margin: '12px auto',
                padding: '10px 18px',
                borderRadius: 8,
                border: '2px solid #ccc',
                background: quizAnswer === idx ? (idx === quiz.correcta ? '#d4f8d4' : '#f8d4d4') : 'var(--card-bg)',
                color: 'var(--card-text)',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: 220
              }}
              disabled={quizAnswer !== null}
            >
              {op}
            </button>
          ))}
          {quizAnswer !== null && (
            <div style={{ marginTop: 16, fontSize: '1.2rem', color: quizAnswer === quiz.correcta ? '#2ecc40' : '#e74c3c' }}>
              {quizAnswer === quiz.correcta ? '¡Muy bien, detective!' : 'Revisa la pista y vuelve a intentarlo.'}
            </div>
          )}
          <button onClick={nextLevel} style={{ marginTop: 18, padding: '6px 18px', borderRadius: 8, border: 'none', background: 'var(--safe-bg)', color: '#222', fontWeight: 'bold', cursor: 'pointer' }}>Siguiente nivel</button>
        </div>
      )}
    </div>
  );
};

export default DataDetectiveGame;
