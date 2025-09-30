import React, { useState, useEffect } from 'react';
import styles from './NetworkManager.module.css';

const NetworkManager = () => {
  const [stability, setStability] = useState(100);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  const TOTAL_ROUNDS = 10;

  const problems = [
    {
      id: 1,
      description: "¡La conexión de la sala de computación está muy lenta!",
      options: [
        { text: "Revisar el router y su configuración", correct: true },
        { text: "Reiniciar todos los computadores", correct: false },
        { text: "Desconectar y conectar cables al azar", correct: false }
      ],
      explanation: "Es importante revisar primero el router y su configuración para identificar problemas de red."
    },
    {
      id: 2,
      description: "Un alumno compartió su contraseña con otros compañeros.",
      options: [
        { text: "No hacer nada, no es importante", correct: false },
        { text: "Cambiar la contraseña y explicar sobre seguridad", correct: true },
        { text: "Castigar al alumno", correct: false }
      ],
      explanation: "La seguridad es importante. Debemos educar sobre no compartir contraseñas."
    },
    {
      id: 3,
      description: "¡Hay muchos dispositivos desconocidos conectados a la red WiFi!",
      options: [
        { text: "Ignorar la situación", correct: false },
        { text: "Apagar el WiFi completamente", correct: false },
        { text: "Cambiar la contraseña del WiFi y limitar el acceso", correct: true }
      ],
      explanation: "Controlar el acceso a la red es crucial para mantener la seguridad."
    },
    {
      id: 4,
      description: "Un computador muestra un mensaje pidiendo dinero para recuperar archivos.",
      options: [
        { text: "Pagar inmediatamente", correct: false },
        { text: "Desconectar el equipo de la red y reportar el incidente", correct: true },
        { text: "Ignorar el mensaje y seguir trabajando", correct: false }
      ],
      explanation: "Ante un posible ransomware, es crucial aislar el equipo y reportar el incidente."
    },
    {
      id: 5,
      description: "Los alumnos no pueden imprimir sus trabajos.",
      options: [
        { text: "Verificar la conexión y cola de impresión", correct: true },
        { text: "Comprar una impresora nueva", correct: false },
        { text: "Decir que no se puede imprimir hoy", correct: false }
      ],
      explanation: "Primero debemos revisar las conexiones y el estado del servicio de impresión."
    },
    {
      id: 6,
      description: "Un profesor reporta que su computador está muy lento y muestra publicidad extraña.",
      options: [
        { text: "Ejecutar el antivirus y revisar programas instalados", correct: true },
        { text: "Ignorar la publicidad", correct: false },
        { text: "Reinstalar Windows inmediatamente", correct: false }
      ],
      explanation: "Ante posible malware, es importante hacer un escaneo y revisar programas sospechosos."
    },
    {
      id: 7,
      description: "Se detectó que un estudiante está descargando juegos en su computador.",
      options: [
        { text: "Bloquear las descargas y explicar las políticas de uso", correct: true },
        { text: "Permitir las descargas", correct: false },
        { text: "Suspender al estudiante", correct: false }
      ],
      explanation: "Es importante mantener políticas de uso claras y educar sobre ellas."
    },
    {
      id: 8,
      description: "El servidor de archivos compartidos está casi lleno.",
      options: [
        { text: "Analizar y limpiar archivos innecesarios", correct: true },
        { text: "Ignorar el problema", correct: false },
        { text: "Borrar todo sin revisar", correct: false }
      ],
      explanation: "La gestión del espacio requiere un análisis cuidadoso de los archivos."
    },
    {
      id: 9,
      description: "Se detectó tráfico inusual en la red durante la noche.",
      options: [
        { text: "Investigar el origen y revisar los logs", correct: true },
        { text: "Esperar a que pase", correct: false },
        { text: "Apagar todos los servidores", correct: false }
      ],
      explanation: "El tráfico inusual puede indicar problemas de seguridad y debe investigarse."
    },
    {
      id: 10,
      description: "Un profesor no puede acceder a su cuenta de correo institucional.",
      options: [
        { text: "Verificar credenciales y resetear si es necesario", correct: true },
        { text: "Decirle que use su correo personal", correct: false },
        { text: "Crear una nueva cuenta", correct: false }
      ],
      explanation: "Los problemas de acceso suelen resolverse verificando credenciales."
    },
    {
      id: 11,
      description: "Se reporta que el proyector del auditorio no conecta con los laptops.",
      options: [
        { text: "Verificar configuración de pantalla y cables", correct: true },
        { text: "Comprar un proyector nuevo", correct: false },
        { text: "Usar solo computadores de escritorio", correct: false }
      ],
      explanation: "Los problemas de proyección suelen ser de configuración o conexión."
    },
    {
      id: 12,
      description: "Un estudiante reporta que perdió su trabajo porque la computadora se apagó.",
      options: [
        { text: "Revisar opciones de recuperación y enseñar autoguardado", correct: true },
        { text: "Decir que debe hacerlo de nuevo", correct: false },
        { text: "Culpar al estudiante por no guardar", correct: false }
      ],
      explanation: "Es importante educar sobre el guardado frecuente y las opciones de recuperación."
    }
  ];

  // Estado para mantener track de las preguntas ya usadas
  const [usedProblemIds, setUsedProblemIds] = useState([]);

  useEffect(() => {
    if (!currentProblem && !gameOver) {
      // Filtrar problemas que aún no se han usado
      const availableProblems = problems.filter(p => !usedProblemIds.includes(p.id));
      
      // Si no quedan problemas disponibles, reiniciar la lista
      if (availableProblems.length === 0) {
        setUsedProblemIds([]);
        return;
      }
      
      // Seleccionar un problema aleatorio de los disponibles
      const nextProblem = availableProblems[Math.floor(Math.random() * availableProblems.length)];
      setCurrentProblem(nextProblem);
      
      // Agregar el ID a la lista de usados
      setUsedProblemIds([...usedProblemIds, nextProblem.id]);
    }
  }, [currentProblem, gameOver, usedProblemIds]);

  useEffect(() => {
    if (stability <= 0) {
      setGameOver(true);
    }
  }, [stability]);

  const [isAnswering, setIsAnswering] = useState(false);

  const handleAnswer = (correct) => {
    if (isAnswering) return; // Prevenir múltiples clics
    setIsAnswering(true);

    // Actualizar puntuación y estabilidad inmediatamente
    const newScore = correct ? score + 10 : score;
    const newStability = correct 
      ? Math.min(100, stability + 10)
      : Math.max(0, stability - 20);
    
    setScore(newScore);
    setStability(newStability);

    // Verificar si el juego ha terminado
    if (round >= TOTAL_ROUNDS) {
      setGameOver(true);
      setGameWon(newStability > 50);
      return;
    }

    // Avanzar a la siguiente ronda
    setRound(round + 1);

    // Esperar un momento y mostrar siguiente problema
    setTimeout(() => {
      setCurrentProblem(null);
      setIsAnswering(false);
    }, 100);
  };

  const resetGame = () => {
    setStability(100);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setRound(1);
    setCurrentProblem(null);
    setUsedProblemIds([]); // Reiniciar la lista de problemas usados
  };

  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
        <div className={styles.statsContainer}>
          <div className={styles.stabilityBar}>
            <div 
              className={styles.stabilityFill} 
              style={{ 
                width: `${stability}%`,
                backgroundColor: stability > 60 ? '#4CAF50' : stability > 30 ? '#FFA726' : '#F44336'
              }}
            />
          </div>
          <div className={styles.stats}>
            <span>Estabilidad de la Red: {stability}%</span>
            <span>Puntuación: {score}</span>
            <span>Ronda: {round}/{TOTAL_ROUNDS}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        {gameOver ? (
          <div className={styles.gameOver}>
            <h2>{gameWon ? '¡Felicitaciones! 🎉' : 'Juego Terminado'}</h2>
            {gameWon ? (
              <p>¡Has mantenido la red estable! La escuela está orgullosa de tu trabajo.</p>
            ) : (
              <p>La red necesita más atención. ¡Inténtalo de nuevo!</p>
            )}
            <p>Estabilidad final: {stability}%</p>
            <p>Puntuación final: {score}</p>
            <button onClick={resetGame} className={styles.resetButton}>
              Intentar de nuevo
            </button>
          </div>
        ) : currentProblem ? (
          <div className={styles.problem}>
            <div className={styles.alert}>
              <h3>¡Alerta!</h3>
              <p>{currentProblem.description}</p>
            </div>
            <div className={styles.options}>
              {currentProblem.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option.correct)}
                  className={styles.optionButton}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.loading}>
            <p>Monitoreando la red...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkManager;