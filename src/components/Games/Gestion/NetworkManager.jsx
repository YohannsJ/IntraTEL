import React, { useState, useEffect, useRef } from 'react';
import styles from './NetworkManager.module.css';

const NetworkManager = () => {
  const [stability, setStability] = useState(100);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  // Ahora es configurable desde la UI pequeña (por defecto 12 para más juego)
  const [totalRounds, setTotalRounds] = useState(12);
  // Intervalo para popups (más espaciados para menos frecuencia)
  const POPUP_INTERVAL_MIN = 10000; // 10s
  const POPUP_INTERVAL_MAX = 18000; // 18s
  // Pistas: cantidad disponible (empieza con 1 para que el jugador tenga una pista inicial)
  // Las pistas ofrecen un consejo específico por pregunta y NO penalizan estabilidad.
  const [hintCount, setHintCount] = useState(1);
  const [explanationIsHint, setExplanationIsHint] = useState(false);

  const problems = [
    {
      id: 1,
      description: "¡La conexión de la sala de computación está muy lenta!",
      options: [
  { text: "Revisar el router y su configuración", correct: true },
        { text: "Reiniciar todos los computadores", correct: false, explanation: 'Reiniciar a todos interrumpe clases y rara vez arregla el problema de red.' },
        { text: "Desconectar y conectar cables al azar", correct: false, explanation: 'Mover cables al azar puede romper algo; mejor revisar con calma.' }
      ],
  explanation: "Antes de reiniciar todo, revisamos el router y los cables para encontrar la causa sin romper nada."
    },
    {
      id: 2,
      description: "Un alumno compartió su contraseña con otros compañeros.",
      options: [
        { text: "No hacer nada, no es importante", correct: false, explanation: 'Si compartes la contraseña, cualquiera puede entrar y usar tu cuenta.' },
  { text: "Cambiar la contraseña y explicar sobre seguridad", correct: true },
        { text: "Castigar al alumno", correct: false, explanation: 'Castigar no enseña la razón; es mejor explicar y ayudar a corregirlo.' }
      ],
  explanation: "No castigamos: lo mejor es cambiar la contraseña y explicar por qué no hay que compartirla."
    },
    {
      id: 3,
      description: "¡Hay muchos dispositivos desconocidos conectados a la red WiFi!",
      options: [
        { text: "Ignorar la situación", correct: false, explanation: 'Ignorar deja la red vulnerable a intrusos.' },
        { text: "Apagar el WiFi completamente", correct: false, explanation: 'Apagar el WiFi afecta a todos; hay soluciones menos drásticas.' },
  { text: "Cambiar la contraseña del WiFi y limitar el acceso", correct: true }
      ],
  explanation: "Cambiamos la contraseña del WiFi y controlamos quién puede entrar, así evitamos equipos desconocidos."
    },
    {
      id: 4,
      description: "Un computador muestra un mensaje pidiendo dinero para recuperar archivos.",
      options: [
        { text: "Pagar inmediatamente", correct: false, explanation: 'Pagar financia a los atacantes y no garantiza recuperar archivos.' },
  { text: "Desconectar el equipo de la red y reportar el incidente", correct: true },
        { text: "Ignorar el mensaje y seguir trabajando", correct: false, explanation: 'Ignorar puede propagar el problema a otros equipos.' }
      ],
  explanation: "No pagamos. Desconectamos el equipo de la red y avisamos a un adulto o técnico para que lo revise."
    },
    {
      id: 5,
      description: "Los alumnos no pueden imprimir sus trabajos.",
      options: [
  { text: "Verificar la conexión y cola de impresión", correct: true },
        { text: "Comprar una impresora nueva", correct: false, explanation: 'Comprar una impresora nueva es costoso y no resuelve el problema inmediato.' },
        { text: "Decir que no se puede imprimir hoy", correct: false, explanation: 'Decir que no no ayuda a los alumnos; mejor intentar arreglarlo.' }
      ],
  explanation: "Revisamos la conexión y la cola de impresión: muchas veces hay trabajos atascados que hay que borrar."
    },
    {
      id: 6,
      description: "Un profesor reporta que su computador está muy lento y muestra publicidad extraña.",
      options: [
  { text: "Ejecutar el antivirus y revisar programas instalados", correct: true },
        { text: "Ignorar la publicidad", correct: false, explanation: 'Ignorar anuncios no arregla el posible malware que ya está en el equipo.' },
        { text: "Reinstalar Windows inmediatamente", correct: false, explanation: 'Reinstalar es extremo; primero prueba con un escaneo y limpieza.' }
      ],
  explanation: "Hacemos un escaneo con el antivirus y quitamos programas raros; no le hacemos caso a la publicidad."
    },
    {
      id: 7,
      description: "Se detectó que un estudiante está descargando juegos en su computador.",
      options: [
  { text: "Bloquear las descargas y explicar las políticas de uso", correct: true },
        { text: "Permitir las descargas", correct: false, explanation: 'Permitir puede traer malware y ocupar la red.' },
        { text: "Suspender al estudiante", correct: false, explanation: 'Suspender es una medida fuerte; primero es mejor educar y dar advertencias.' }
      ],
  explanation: "Bloqueamos las descargas en la red y explicamos por qué no es buena idea bajar juegos en la escuela."
    },
    {
      id: 8,
      description: "El servidor de archivos compartidos está casi lleno.",
      options: [
  { text: "Analizar y limpiar archivos innecesarios", correct: true },
        { text: "Ignorar el problema", correct: false, explanation: 'Ignorar puede llevar a que el servidor deje de funcionar.' },
        { text: "Borrar todo sin revisar", correct: false, explanation: 'Borrar sin revisar puede eliminar archivos importantes por error.' }
      ],
  explanation: "Buscamos archivos viejos que no se usan y los movemos o borramos para liberar espacio."
    },
    {
      id: 9,
      description: "Se detectó tráfico inusual en la red durante la noche.",
      options: [
  { text: "Investigar el origen y revisar los logs", correct: true },
        { text: "Esperar a que pase", correct: false, explanation: 'Esperar puede permitir que el problema crezca y cause más daño.' },
        { text: "Apagar todos los servidores", correct: false, explanation: 'Apagar todo afecta a toda la escuela y es una medida extrema.' }
      ],
  explanation: "Revisamos los registros para ver quién usa la red; a veces hay dispositivos que no deberían estar conectados."
    },
    {
      id: 10,
      description: "Un profesor no puede acceder a su cuenta de correo institucional.",
      options: [
  { text: "Verificar credenciales y resetear si es necesario", correct: true },
        { text: "Decirle que use su correo personal", correct: false, explanation: 'Usar correo personal no es apropiado para temas escolares y puede ser inseguro.' },
        { text: "Crear una nueva cuenta", correct: false, explanation: 'Crear una nueva cuenta complica la administración; es mejor recuperar la existente.' }
      ],
  explanation: "Verificamos si escribió bien su usuario/contraseña y, si no, ayudamos a resetearla."
    },
    {
      id: 11,
      description: "Se reporta que el proyector del auditorio no conecta con los laptops.",
      options: [
  { text: "Verificar configuración de pantalla y cables", correct: true },
        { text: "Comprar un proyector nuevo", correct: false, explanation: 'Comprar uno nuevo es costoso y no ayuda si el problema es un cable.' },
        { text: "Usar solo computadores de escritorio", correct: false, explanation: 'Limitar equipos no es una solución práctica.' }
      ],
  explanation: "Revisamos los cables y la configuración de pantalla: muchas veces es solo un cable suelto."
    },
    {
      id: 12,
      description: "Un estudiante reporta que perdió su trabajo porque la computadora se apagó.",
      options: [
  { text: "Revisar opciones de recuperación y enseñar autoguardado", correct: true },
        { text: "Decir que debe hacerlo de nuevo", correct: false, explanation: 'Decir que haga todo de nuevo no ayuda a aprender cómo evitarlo.' },
        { text: "Culpar al estudiante por no guardar", correct: false, explanation: 'Culpar no enseña buenas prácticas ni ayuda a resolver el problema.' }
      ],
  explanation: "Revisamos opciones de recuperación y enseñamos a activar el autoguardado para no perder trabajos."
    }
  ];

  // Estado para mantener track de las preguntas ya usadas
  const [usedProblemIds, setUsedProblemIds] = useState([]);
  

  useEffect(() => {
    if (stability <= 0) {
      setGameOver(true);
    }
  }, [stability]);

  const [isAnswering, setIsAnswering] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [explanationAdvance, setExplanationAdvance] = useState(true);
  // Malicious popup (mini-event)
  const [malwareActive, setMalwareActive] = useState(false);
  const [malwareCurrent, setMalwareCurrent] = useState(null);
  const malwareIntervalRef = useRef(null);
  const [malwareSide, setMalwareSide] = useState('right');
  const malwareScheduleRef = useRef(null);

  // Mascota y logros
  const [mascotMood, setMascotMood] = useState('idle'); // idle, happy, sad, cheer, thinking
  // Nombre fijo de la mascota (no editable)
  const [mascotName] = useState('Teli');
  const [popupSuccessCount, setPopupSuccessCount] = useState(0);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [achievements, setAchievements] = useState(() => {
    try {
      const raw = localStorage.getItem('network_achievements');
      return raw ? JSON.parse(raw) : { firstWin: false, perfectGame: false, stableHero: false, popupPro: false };
    } catch (e) { return { firstWin: false, perfectGame: false, stableHero: false, popupPro: false }; }
  });
  const [achievementsQueue, setAchievementsQueue] = useState([]);
  // Animaci f3n aplicada al popup malicioso cuando la p e9rdida ocurre por un popup
  const [malwareLostAnim, setMalwareLostAnim] = useState(false);
  const [lostByPopup, setLostByPopup] = useState(false);

  // Confetti
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  // Mascota específica para explicar popups maliciosos junto al popup
  const [popupMascotExplain, setPopupMascotExplain] = useState({ visible: false, text: '', side: 'right' });
  // Saludo breve de la mascota al comenzar
  const [mascotGreetingVisible, setMascotGreetingVisible] = useState(false);
  const mascotGreetingRef = useRef(null);
  // Mascot tips: consejos generales (no dan la respuesta exacta)
  const mascotTips = [
    'Consejo: mira bien las opciones antes de decidir y elige la más segura.',
    'Tip: piensa quién se beneficia con esa acción; si suena raro, desconfía.',
    'Atención: si te piden instalar algo o abrir un archivo, pide ayuda primero.',
    'Sugerencia: revisa rápido antes de hacer cambios importantes.',
    'Recuerda: si dudas, pregunta a un compañero o a un docente.',
    'Buen hábito: anota lo que hiciste por si hay que revisarlo después.',
    '¿No estás seguro? Espera y revisa los detalles del remitente.',
    'Si te prometen recompensas por instalar algo, desconfía y verifica primero.',
    'Moverse rápido está bien, pero verificar dos segundos puede evitar un problema.',
    'Truco: URLs raras y errores de ortografía suelen indicar phishing.',
    'Consejo práctico: cuando veas una descarga inesperada, no la aceptes de inmediato.'
  ];
  const [mascotTip, setMascotTip] = useState({ visible: false, text: '' });
  const mascotTipRef = useRef(null);
  // Frases cortas para el estado idle para no repetir siempre '¡Listo!'
  const idlePhrases = [
    'Aquí estoy.',
    'Listo para ayudar.',
    '¿Necesitas un tip?',
    'Vamos con la siguiente.',
    'Preparado para el desafío.'
  ];
  const [mascotIdleText, setMascotIdleText] = useState('');

  // Opción: dejar la alerta principal quieta (sin animación)
  const [alertsStatic, setAlertsStatic] = useState(false);

  const showMascotTip = () => {
    // elegir tip aleatorio
    const tip = mascotTips[Math.floor(Math.random() * mascotTips.length)];
    // limpiar cualquier explicación de popup para evitar duplicados
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    setMascotTip({ visible: true, text: tip });
    setMascotMood('thinking');
    if (mascotTipRef.current) clearTimeout(mascotTipRef.current);
    mascotTipRef.current = setTimeout(() => {
      setMascotTip({ visible: false, text: '' });
      setMascotMood('idle');
    }, 4000);
  };

  // ...existing code...

  // ensure mascot mood messages show briefly after actions even if user didn't click the mascot
  useEffect(() => {
    if (mascotMood === 'idle') return;
    // keep positive/negative reactions visible longer so players notice
    let duration = 3000;
    if (mascotMood === 'happy' || mascotMood === 'sad') duration = 5000;
    if (mascotMood === 'cheer') duration = 6000;
    if (mascotMood === 'thinking') duration = 3000;
    const t = setTimeout(() => setMascotMood('idle'), duration);
    return () => clearTimeout(t);
  }, [mascotMood]);
  // Tutorial shown inline on first load: show by default on page load
  // The user can check "No mostrar de nuevo" to persist that preference.
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialDontShowAgain, setTutorialDontShowAgain] = useState(false);
  // El juego NO comienza hasta que el usuario pulse "Comenzar" en la pantalla de inicio
  // (si el tutorial ya fue visto, mostramos un panel de inicio donde debe elegirse rondas)
  const [gameStarted, setGameStarted] = useState(false);
  // estado temporal para la pantalla de inicio (rondas seleccionadas antes de comenzar)
  const [startRounds, setStartRounds] = useState(() => {
    try {
      const v = Number(localStorage.getItem('nm_prefRounds'));
      return v && !Number.isNaN(v) ? v : 12;
    } catch (e) { return 12; }
  });
  // opción para usar siempre la elección (persistida)
  const [alwaysUseRounds, setAlwaysUseRounds] = useState(() => {
    try { return localStorage.getItem('nm_alwaysUseRounds') === '1'; } catch (e) { return false; }
  });
  // Items / recursos
  const [rebootAvailable, setRebootAvailable] = useState(2); // number of reboots available

  // Mostrar tips periódicamente durante la partida para dar variedad sin que el usuario tenga que clicar
  useEffect(() => {
    if (!gameStarted) return;
    const iv = setInterval(() => {
      // mostrar tip si no hay uno visible y no hay un popup activo
      if (!mascotTip.visible && !malwareActive) showMascotTip();
    }, 17000); // cada ~17s
    return () => clearInterval(iv);
  }, [gameStarted, mascotTip.visible, malwareActive]);

  // Cuando la mascota vuelve a idle, seleccionamos una frase idle aleatoria breve
  useEffect(() => {
    if (mascotMood !== 'idle') return;
    // no forzamos frase si ya hay un tip visible o si no comenzó el juego
    if (mascotTip.visible || !gameStarted) {
      setMascotIdleText('');
      return;
    }
    const choice = idlePhrases[Math.floor(Math.random() * idlePhrases.length)];
    setMascotIdleText(choice);
    const t = setTimeout(() => setMascotIdleText(''), 6000); // desaparece tras 6s
    return () => clearTimeout(t);
  }, [mascotMood, mascotTip.visible, gameStarted]);

  useEffect(() => {
    // only pick a new problem when the game has been started
    if (!currentProblem && !gameOver && gameStarted) {
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
  }, [currentProblem, gameOver, usedProblemIds, gameStarted]);

  // Rondas especiales eliminadas: usamos solo los problemas principales y los popups.

  // Settings
  // settings removed; tutorial remains accessible via button

  const handleAnswer = (correct, index) => {
    if (isAnswering) return; // Prevenir múltiples clics
    setIsAnswering(true);
    setSelectedIndex(index);

    // Actualizar puntuación y estabilidad inmediatamente
    setScore(prev => correct ? prev + 10 : prev);
    setStability(prev => correct ? Math.min(100, prev + 10) : Math.max(0, prev - 20));

    // Si es incorrecta mostramos la explicación y pausamos hasta que el usuario cierre el modal
    if (!correct && currentProblem) {
      setMascotMood('sad');
      setCorrectStreak(0);
      // Mostrar explicación específica de la opción si existe
      const opt = currentProblem.options[index];
      setExplanationText((opt && opt.explanation) || currentProblem.explanation || 'Respuesta incorrecta.');
      setExplanationAdvance(true);
      setShowExplanation(true);
      // dejamos isAnswering true hasta que cierren el modal
      return;
    }

  // Si es correcta, avanzamos
  setMascotMood('happy');
  setCorrectStreak(prev => {
    const next = prev + 1;
    // recompensa: cada 3 respuestas correctas consecutivas gana 1 pista
    if (next > 0 && next % 3 === 0) {
      setHintCount(h => h + 1);
    }
    return next;
  });

  setRound(prev => prev + 1);

    // Mantener la selección visible por un momento para mostrar el icono ✓/✖
    const delay = correct ? 600 : 300;
    setTimeout(() => {
      setCurrentProblem(null);
      setIsAnswering(false);
      setSelectedIndex(null);
      setHintUsed(false);
    }, delay);
  };

  // Problemas tipo 'popup malicioso' para hacer el juego más entretenido
  const malwareProblems = [
    {
      id: 'm1',
      title: '¡Mensaje urgente!',
      body: "Tu archivo está en peligro. Haz click aquí para arreglarlo.",
      options: [
  { text: 'Cerrar la ventana', correct: true },
        { text: 'Abrir el archivo', correct: false, explanation: 'Abrir archivos raros puede traer virus. Mejor cerrarlo y avisar.' }
      ]
    },
    {
      id: 'm2',
      title: '¡Actualización urgente!',
      body: 'Haz click para instalar un parche ahora mismo.',
      options: [
  { text: 'Ignorar y cerrar', correct: true },
        { text: 'Instalar ahora', correct: false, explanation: 'Instalar sin permiso puede infectar el equipo.' },
        { text: 'Preguntar en chat', correct: false, explanation: 'El chat no es seguro para esto; mejor avisar a un técnico.' }
      ]
    }
    ,
    {
      id: 'm3',
      title: '¡Sorpresa gratis!',
      body: 'Has ganado un premio. Haz click para reclamar.',
      options: [
  { text: 'Cerrar', correct: true },
        { text: 'Reclamar ahora', correct: false, explanation: 'Reclamar puede descargar software malicioso.' },
        { text: 'Compartir enlace', correct: false, explanation: 'Compartir enlaces sospechosos propaga el problema.' }
      ]
    },
    {
      id: 'm4',
      title: '¡Alarma del sistema!',
      body: 'Tu equipo tiene problemas, haz click para arreglar.',
      options: [
  { text: 'Cerrar y avisar', correct: true },
        { text: 'Seguir las instrucciones', correct: false, explanation: 'Seguir instrucciones de popups puede ser peligroso.' },
        { text: 'Ignorar', correct: false, explanation: 'Ignorar sin avisar puede empeorar el problema.' }
      ]
    }
  ];

  // Añadir más variedad: popups legítimos que requieren distinta respuesta
  const mixedPopupPool = malwareProblems.map(p => ({ ...p, type: 'malicious' })).concat([
    {
      id: 'l1',
      title: 'Recordatorio del profesor',
      body: 'Se ha publicado el material de clase. ¿Quieres abrirlo?',
      options: [
        { text: 'Abrir material', correct: true },
        { text: 'Ignorar', correct: false, explanation: 'Podrías perder información importante.' }
      ],
      type: 'legit'
    }
  ]);

  const showMalware = () => {
    if (!gameStarted || malwareActive || gameOver) return;
    // escoger del pool mixto para más variedad
    const next = mixedPopupPool[Math.floor(Math.random() * mixedPopupPool.length)];
    setMalwareCurrent(next);
    // limpiar cualquier tip visible cuando aparece un popup
    setMascotTip({ visible: false, text: '' });
    // sin temporizador: el popup queda hasta que el alumno responde
    // elegir lado aleatorio para mostrar el popup
    setMalwareSide(Math.random() < 0.5 ? 'left' : 'right');
    setMalwareActive(true);
    setIsAnswering(true); // bloquear otras acciones mientras aparece
  };

  const handleMalwareChoice = (correct, source, optionIndex) => {
    // limpiar timer
    // no hay intervalos activos para el popup
    // Mantener el popup visible mientras la mascota explica (si es incorrecta).
    setIsAnswering(false);

    if (correct) {
      setPopupSuccessCount(prev => {
        const v = prev + 1;
        if (v === 3) unlockAchievement('popupPro');
        return v;
      });
      setScore(prev => prev + 5);
      setStability(prev => Math.min(100, prev + 5));
      setMascotMood('happy');
      // no mostramos explicación modal para respuestas correctas, solo feedback visual
      // no avanzamos de ronda solo por el popup
      // cerrar popup inmediatamente en respuestas correctas
      setMalwareActive(false);
      return;
    }

  // Respuesta incorrecta en popup: aplicamos una penalización suave y educativa
  // Penalización base pequeña; escalamos ligeramente con el progreso
  const basePenalty = 4;
  const scale = 1 + (round / Math.max(1, totalRounds)) * 0.3; // hasta ~1.3x
  const penalty = Math.round(basePenalty * scale);
  // restar estabilidad pero dejando siempre al menos 5 puntos para evitar muertes instantáneas por popup
  setStability(prev => Math.max(5, prev - penalty));
  setMascotMood('sad');
    // En lugar de abrir el modal principal, mostramos la burbuja de la mascota junto al popup
    const chosenWrong = malwareCurrent && malwareCurrent.options[optionIndex];
  const explanation = (chosenWrong && chosenWrong.explanation) || (malwareCurrent && malwareCurrent.options.find(o => !o.correct)?.explanation) || 'Eso no fue seguro, mejor la próxima vez cerrar la ventana.';
    // Decidir lado para la burbuja: si el popup está a la derecha, la burbuja va a la izquierda y viceversa
    const bubbleSide = malwareSide === 'left' ? 'right' : 'left';
    // limpiar tips precedentes y mostrar la explicación puntual para el popup
    setMascotTip({ visible: false, text: '' });
    setPopupMascotExplain({ visible: true, text: explanation, side: bubbleSide });
    // mantener el popup abierto hasta que el alumno cierre la explicación de la mascota
  };

  // Función para usar el ítem reboot
  const useReboot = () => {
    if (rebootAvailable <= 0) return;
    setRebootAvailable(prev => Math.max(0, prev - 1));
    setStability(prev => Math.min(100, prev + 20));
  };

  // Achievements helper
  const ACHIEVEMENT_NAMES = {
    firstWin: 'Primera victoria',
    perfectGame: 'Juego perfecto',
    stableHero: 'Héroe estable',
    popupPro: 'Caza-popups'
  };

  const unlockAchievement = (key) => {
    setAchievements(prev => {
      if (prev[key]) return prev;
      const next = { ...prev, [key]: true };
      try { localStorage.setItem('network_achievements', JSON.stringify(next)); } catch (e) {}
      // queue toast
      setAchievementsQueue(q => [...q, key]);
      return next;
    });
  };

  // (special rounds removed)

  const closePopupMascotExplain = () => {
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    setMalwareActive(false);
    setIsAnswering(false);
    setMascotMood('idle');
  };

  const closeTutorial = (saveDontShow = false) => {
    // persist preference only if the user explicitly asked to not show again
    if (saveDontShow) {
      try { localStorage.setItem('nm_seenTutorial', '1'); } catch (e) {}
    }
    setShowTutorial(false);
    // do not auto-start here; we want to show the rounds selection after closing tutorial
  };

  // (tutorial interactivo eliminado; se mantiene el tutorial estático)

  const startGame = (rounds) => {
    const r = rounds || startRounds || 12;
    setTotalRounds(r);
    setGameStarted(true);
    // saludo corto de la mascota al comenzar
    setMascotMood('happy');
    // mostrar un mensaje inmediato en la mascota para evitar que quede un mensaje anterior
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    // Hacer el mensaje persistente: limpiar cualquier timeout previo y no iniciar uno nuevo.
  if (mascotTipRef.current) { clearTimeout(mascotTipRef.current); mascotTipRef.current = null; }
  setMascotTip({ visible: true, text: 'Perfecto — iniciando partida...' });
  // auto-hide the temporary tip so it doesn't persist into question view
  mascotTipRef.current = setTimeout(() => { setMascotTip({ visible: false, text: '' }); mascotTipRef.current = null; }, 2500);
  setMascotMood('happy');
    // Clear any lingering explanation/modal state so it doesn't show from previous game
    setShowExplanation(false);
    setExplanationText('');
    setExplanationIsHint(false);
    setExplanationAdvance(true);
    setSelectedIndex(null);
    setIsAnswering(false);
    setHintUsed(false);
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    setMalwareActive(false);
    setLostByPopup(false);
    // ensure currentProblem is null so the effect picks a fresh, unused problem
    setCurrentProblem(null);
  };

  // Si el usuario marcó "usar siempre" y ya no está el tutorial, iniciamos automáticamente
  useEffect(() => {
    if (!showTutorial && !gameStarted && alwaysUseRounds) {
      // usar un pequeño timeout para evitar colisiones en el flujo de render inicial
      const t = setTimeout(() => startGame(startRounds), 50);
      return () => clearTimeout(t);
    }
  }, [showTutorial, gameStarted, alwaysUseRounds, startRounds]);

  const closeExplanation = (advance = true) => {
    setShowExplanation(false);
    setExplanationIsHint(false);
    // Si la explicación vino del juego normal (advance=true) avanzamos la ronda.
    if (!advance) return; // por ejemplo: explicaciones de popups no avanzan la ronda

    // Verificamos fin de juego
    if (round >= totalRounds) {
      setGameOver(true);
      setGameWon(stability > 50);
      setIsAnswering(false);
      return;
    }

    setRound(prev => prev + 1);
    // Avanzar a la siguiente pregunta
    setCurrentProblem(null);
    setIsAnswering(false);
    setSelectedIndex(null);
    setHintUsed(false);
  };

  const useHint = () => {
    if (!currentProblem || hintUsed || hintCount <= 0) return;
    // consumir pista
    setHintCount(h => Math.max(0, h - 1));
    // Mostrar explicación específica de la pregunta como pista (sin penalización)
    setExplanationText(currentProblem.explanation || 'Pista: revisa la configuración.');
    setExplanationIsHint(true);
    // al cerrar la pista no avanzamos la ronda
    setExplanationAdvance(false);
    setShowExplanation(true);
    setHintUsed(true);
  };

  // Minimal reset function: restarts the game to initial state
  const resetGame = () => {
    setStability(100);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    setRound(1);
    // clear current problem and UI state but preserve usedProblemIds so restarted games
    // don't immediately show previously answered questions
    setCurrentProblem(null);
    setPopupSuccessCount(0);
    setCorrectStreak(0);
    setMascotMood('idle');
    setConfettiActive(false);
    setConfettiPieces([]);
    // Close any open explanation modal and reset related flags
    setShowExplanation(false);
    setExplanationText('');
    setExplanationIsHint(false);
    setExplanationAdvance(true);
    setSelectedIndex(null);
    setIsAnswering(false);
    setHintUsed(false);
    // close any popup mascot explanation and malware popup
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    setMalwareActive(false);
    setLostByPopup(false);
    if (malwareScheduleRef.current) {
      clearTimeout(malwareScheduleRef.current);
      malwareScheduleRef.current = null;
    }
  // no quedan timers de rondas especiales porque esa mecánica fue eliminada
    // keep gameStarted as false so player must start from the start modal
    setGameStarted(false);
  };

  // Elegir momentos aleatorios para mostrar el popup malicioso
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Si ya está activo, no programamos otro
    if (malwareActive) return;

    // Programar evento entre POPUP_INTERVAL_MIN y MAX
    const delay = POPUP_INTERVAL_MIN + Math.floor(Math.random() * (POPUP_INTERVAL_MAX - POPUP_INTERVAL_MIN));
    malwareScheduleRef.current = setTimeout(() => {
      showMalware();
    }, delay);

    return () => {
      if (malwareScheduleRef.current) clearTimeout(malwareScheduleRef.current);
    };
  }, [round, malwareActive, gameOver]);

  // Rondas especiales eliminadas: ya no programamos rounds extra.

  // (Achievements and leaderboard have been removed per user request)

  const launchConfetti = () => {
    // generate confetti pieces
    const pieces = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      bg: ['#e91e63','#ffeb3b','#4caf50','#2196f3','#ff9800'][Math.floor(Math.random()*5)],
      delay: Math.random() * 500
    }));
    setConfettiPieces(pieces);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 4000);
  };

  // Detect end of game to trigger confetti and final mascot state
  useEffect(() => {
    if (!gameOver) return;
    if (gameWon) {
      unlockAchievement('firstWin');
      if (stability > 90) unlockAchievement('stableHero');
      if (correctStreak >= totalRounds) unlockAchievement('perfectGame');
      launchConfetti();
      setMascotMood('cheer');
    } else {
      // lost: set mood. Visual animation is handled on the popup (if lostByPopup)
      setMascotMood('sad');
      if (!lostByPopup) {
        // if loss did NOT come from a popup, add a brief lostModal class by toggling state via CSS (handled in render)
        // we don't need an extra JS timer here; CSS animation will play when modal renders with .lostModal
      }
    }
  }, [gameOver, gameWon, lostByPopup]);

  // achievements removed
          {achievementsQueue.length > 0 && (
            <div className={styles.achievementToast} role="status" aria-live="polite">
              <span style={{ marginRight: 8 }}>🏆</span>
              <strong>Logro desbloqueado:</strong> {ACHIEVEMENT_NAMES[achievementsQueue[0]] || achievementsQueue[0]}
            </div>
          )}
  return (
    <div className={styles.gameContainer}>
      <div className={styles.header}>
  {/* Hide stats until the game has started */}
  {gameStarted && (
    <div className={styles.statsContainer}>
          <div className={`${styles.stabilityBar} ${stability <= 20 ? styles.critical : ''}`}>
            <div 
              className={`${styles.stabilityFill} ${stability > 60 ? styles.high : stability > 30 ? styles.medium : styles.low}`}
              style={{ width: `${stability}%` }}
            />
          </div>
            <div className={styles.stats}>
              <div className={styles.statLeft}><span>Estabilidad de la Red: {stability}%</span></div>
              <div className={styles.statCenter}><span>Puntuación: {score}</span></div>
              <div className={styles.statRight}><span>Ronda: {round}/{totalRounds}</span></div>
            </div>
            {/* Control: dejar la alerta principal quieta (sin movimiento) */}
            {gameStarted && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={alertsStatic} onChange={e => setAlertsStatic(e.target.checked)} /> Dejar alerta principal quieta
                </label>
              </div>
            )}
            {/* rounds selection moved to the start modal; hide control here since rounds are fixed after start */}
    </div>) }
          {showExplanation && (
            <div className={styles.modalBackdrop} onClick={() => closeExplanation(explanationAdvance)}>
              <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h4>{explanationIsHint ? 'Pista' : '¿Por qué esto no fue buena idea?'}</h4>
                <p>{explanationText}</p>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => closeExplanation(explanationAdvance)} className={styles.resetButton}>{explanationIsHint ? 'Cerrar pista' : '¡Entendido!'}</button>
                </div>
              </div>
            </div>
          )}
          {/* Tutorial modal shown on first load */}
          {/* Inline tutorial panel: always shown on page load until closed */}
          {showTutorial && (
            <div className={styles.tutorialPanel}>
              <h3>Bienvenido a Network Manager</h3>
              {/* intro paragraph removed per user request */}
              <ul className={styles.tutorialList}>
                <li><strong>Popups</strong>: cuando aparezcan, aprende a identificarlos; algunos son maliciosos y debes cerrarlos con seguridad.</li>
                <li><strong>Reboot</strong>: es un recurso limitado que restaura +20% de estabilidad. Úsalo con cuidado.</li>
                <li>Cómo conseguir <strong>pistas</strong>: cada 3 respuestas correctas <em>consecutivas</em> te otorgan +1 pista adicional.</li>
                <li>La <strong>mascota</strong> te dará consejos rápidos y explicaciones cuando los necesites.</li>
              </ul>
              <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={tutorialDontShowAgain} onChange={e => setTutorialDontShowAgain(e.target.checked)} /> No mostrar de nuevo
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={styles.resetButton} onClick={() => { closeTutorial(tutorialDontShowAgain); }}>Comenzar</button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive tutorial (stepped) */}
          {/* interactive tutorial removed; static tutorial modal remains above */}
          {/* startPanel moved into mainContent (rendered there) */}
          {/* Reboot item (single) removed — controls consolidated below */}
          {/* Malware popup mini-event */}
          {malwareActive && malwareCurrent && (
            <>
              <div className={styles.malwareBackdrop} onClick={() => { /* block clicks to game */ }} />
              <div className={styles.malwareContainer}>
              <div className={`${styles.malwarePopup} ${malwareLostAnim ? styles.lostPopup : ''}`}>
                  <div className={styles.malwareHeader}>
                    <div className={styles.malwareTitle}>{malwareCurrent.title}</div>
                  </div>
                  <div className={styles.malwareBody}>{malwareCurrent.body}</div>
                  <div className={styles.malwareOptions}>
                    {malwareCurrent.options.map((opt, i) => (
                      <button
                        key={i}
                        className={styles.malwareButton}
                        onClick={() => handleMalwareChoice(opt.correct, 'click', i)}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Mascota explicadora específica para popups maliciosos */}
                {popupMascotExplain.visible && (
                  <div className={`${styles.popupMascotBubble} ${styles.belowPopup}`}>
                      <div className={styles.bubbleHeader}>
                        <div className={styles.mascotFace}>👾</div>
                        <div style={{ fontWeight: 700 }}>{mascotName}</div>
                        {/* thinkingDots intentionally not shown for popup explanations to avoid 'loading' look */}
                        <button className={styles.bubbleClose} onClick={closePopupMascotExplain}>✖</button>
                      </div>
                    <div>{popupMascotExplain.text}</div>
                  </div>
                )}
              </div>
            </>
          )}
          {/* Leaderboard modal */}
          {/* Leaderboard and Achievements are now persistently shown in the left sidebar */}
          {/* Inline controls row: left = actions, right = tutorial (small). Hidden while game over. */}
          {!gameOver && gameStarted && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={styles.hintButton} onClick={useReboot} disabled={rebootAvailable <= 0}>{rebootAvailable > 0 ? `Reboot (+20%) (${rebootAvailable})` : 'Reboot usado'}</button>
                <button
                  className={styles.hintButton}
                  onClick={useHint}
                  disabled={!currentProblem || hintUsed || hintCount <= 0}
                  title={hintCount > 0 ? `Pistas disponibles: ${hintCount}` : 'No hay pistas disponibles'}
                >
                  {hintCount > 0 ? `Pista (${hintCount})` : 'Sin pistas'}
                </button>
              </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={styles.hintButton} onClick={resetGame}>Reiniciar partida</button>
                <button className={styles.hintButton} style={{ padding: '6px 8px', fontSize: '0.85rem' }} onClick={() => setShowTutorial(true)}>Ver tutorial</button>
              </div>
            </div>
          )}

          {/* Mascota */}
          <div className={styles.mascotContainer}>
            <div className={`${styles.mascot} ${styles[mascotMood]}`} title="Mascota" onClick={showMascotTip} role="button">
              <div className={styles.mascotFace}>👾</div>
              <div className={styles.mascotText}>
                <div style={{ fontWeight: 700 }}>{mascotName}</div>
                {mascotTip.visible ? (
                  <div>
                    <div className={styles.mascotTipInline}>{mascotTip.text}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem' }}>
                    {/* Context-aware idle text: when on start panel show guidance; during tutorial keep bubble; during gameplay show mood brief messages */}
                    {!showTutorial && !gameStarted ? (
                      'Elige el número de rondas y pulsa Comenzar.'
                    ) : showTutorial ? (
                      ''
                    ) : (
                      /* during active game, show mood messages or a short idle phrase */
                      (mascotMood !== 'idle' ? (
                        (mascotMood === 'happy' && '¡Buen trabajo!') ||
                        (mascotMood === 'sad' && 'Oh...') ||
                        (mascotMood === 'cheer' && '¡Genial!') ||
                        (mascotMood === 'thinking' && 'Mmm...') || ''
                      ) : (
                        mascotIdleText || ''
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            {mascotGreetingVisible && (
              <div className={`${styles.popupMascotBubble} ${styles.right}`} style={{ position: 'fixed', bottom: 90, right: 24 }}>
                <div className={styles.bubbleHeader}>
                  <div className={styles.mascotFace}>👾</div>
                  <div style={{ fontWeight: 700 }}>{mascotName}</div>
                </div>
                <div>¡Hola! ¡Vamos a estabilizar la red!</div>
              </div>
            )}
            {showTutorial && (
              <div className={`${styles.popupMascotBubble} ${styles.right}`} style={{ position: 'fixed', bottom: 90, right: 24 }}>
                <div className={styles.bubbleHeader}>
                  <div className={styles.mascotFace}>👾</div>
                  <div style={{ fontWeight: 700 }}>{mascotName}</div>
                </div>
                <div>Lee las instrucciones del tutorial y pulsa <strong>Comenzar</strong> cuando estés listo.</div>
              </div>
            )}
            {/* show a helpful bubble when the player is on the start panel (select rounds) */}
            {!showTutorial && !gameStarted && (
              <div className={`${styles.popupMascotBubble} ${styles.right}`} style={{ position: 'fixed', bottom: 90, right: 24 }}>
                <div className={styles.bubbleHeader}>
                  <div className={styles.mascotFace}>👾</div>
                  <div style={{ fontWeight: 700 }}>{mascotName}</div>
                </div>
                <div>Elige cuántas rondas quieres jugar y pulsa <strong>Comenzar</strong>. ¡Teli te acompañará durante la partida!</div>
              </div>
            )}
          </div>
          {/* Confetti */}
          {confettiActive && (
            <div className={styles.confettiContainer} aria-hidden>
              {confettiPieces.map(p => (
                <div
                  key={p.id}
                  className={styles.confettiPiece}
                  style={{ left: `${p.left}%`, background: p.bg, animationDelay: `${p.delay}ms` }}
                />
              ))}
            </div>
          )}
          {/* Achievements removed */}
          
        </div>

      {/* Ranking and Achievements removed as requested */}

  <div className={styles.mainContent}>
          {/* start panel: placed here so it's visually lower on the page */}
          {!showTutorial && !gameStarted && (
            <div className={styles.startPanel} onClick={e => e.stopPropagation()}>
              <div className={styles.startTitle}><strong>Preparar partida</strong> — Elige rondas</div>
              <div className={styles.roundPills} role="tablist" aria-label="Seleccionar rondas">
                {[10, 12, 15, 20].map(r => (
                  <button
                    key={r}
                    className={`${styles.roundPill} ${startRounds === r ? styles.selectedPill : ''}`}
                    onClick={() => {
                      setStartRounds(r);
                      try { localStorage.setItem('nm_prefRounds', String(r)); } catch (e) {}
                    }}
                    aria-pressed={startRounds === r}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <label className={styles.alwaysUseLabel} style={{ marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={alwaysUseRounds} onChange={e => {
                  const val = e.target.checked;
                  setAlwaysUseRounds(val);
                  try { localStorage.setItem('nm_alwaysUseRounds', val ? '1' : '0'); } catch (err) {}
                  if (val) {
                    try { localStorage.setItem('nm_prefRounds', String(startRounds)); } catch (err) {}
                  }
                }} />
                <span style={{ color: '#d6dbe0', fontSize: '0.9rem' }}>Usar siempre esta elección</span>
              </label>
              <div className={styles.startControls}>
                <button className={styles.resetButton} onClick={() => {
                  try { localStorage.setItem('nm_prefRounds', String(startRounds)); } catch (e) {}
                  startGame(startRounds);
                }}>Comenzar</button>
                {/* 'Ver tutorial' moved here; top small control will be hidden while not started */}
                <button className={`${styles.resetButton} ${styles.greenButton}`} onClick={() => {
                  // Force showing the tutorial and clear any persistent "no mostrar" flag
                  try { localStorage.removeItem('nm_seenTutorial'); } catch (e) {}
                  setTutorialDontShowAgain(false);
                  setShowTutorial(true);
                }}>Ver tutorial</button>
              </div>
            </div>
          )}

          {gameOver ? (
          <div className={styles.modalBackdrop} onClick={() => {}}>
            <div className={`${styles.modal} ${!gameWon ? styles.lostModal : ''}`} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginTop: 0 }}>{gameWon ? '¡Lo lograste! 🎉' : '¡Oh no!'}</h2>
              {gameWon ? (
                <p>¡La red está estable gracias a ti! ¡Buen trabajo, detective de la red!</p>
              ) : (
                <p>Ups, la red necesita ayuda. ¡Inténtalo otra vez y verás mejora!</p>
              )}
              <div style={{ marginTop: 12 }}>
                <p><strong>Estabilidad final:</strong> {stability}%</p>
                <p><strong>Puntuación final:</strong> {score}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                <button className={styles.resetButton} onClick={() => { resetGame(); }}>
                  Reiniciar partida
                </button>
              </div>
            </div>
          </div>
        ) : currentProblem ? (
          <div className={styles.problem}>
            <div className={`${styles.alert} ${alertsStatic ? styles.noPulse : ''}`}>
              <h3>¡Alerta en la red!</h3>
              <p>{currentProblem.description}</p>
            </div>
            <div className={styles.options}>
              {currentProblem.options.map((option, index) => {
                const classes = [styles.optionButton];
                if (selectedIndex === index) classes.push(styles.selected);
                if (selectedIndex !== null && index === selectedIndex) {
                  if (option.correct) classes.push(styles.correct);
                  else classes.push(styles.incorrect);
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.correct, index)}
                    className={classes.join(' ')}
                  >
                    <span>{option.text}</span>
                    <span className={styles.optionIcon} aria-hidden>
                      {selectedIndex === index ? (option.correct ? '✓' : '✖') : ''}
                    </span>
                  </button>
                );
              })}

              {/* hint button removed from here; use the hint control next to Reboot in the top controls */}
            </div>
          </div>
        ) : (
          <div className={styles.loading}>
            {/* Empty state when there is no current problem and game hasn't started; kept intentionally blank */}
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkManager;