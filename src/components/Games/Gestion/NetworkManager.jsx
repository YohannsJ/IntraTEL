import React, { useState, useEffect, useRef } from 'react';
import styles from './NetworkManager.module.css';
import telixImage from '../../../assets/telix.png';
import { getApiUrl, getAuthHeaders } from '../../../config/environment';

const NetworkManager = () => {
  const [stability, setStability] = useState(100);
  const [score, setScore] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [round, setRound] = useState(1);
  const [gameWon, setGameWon] = useState(false);
  // El juego siempre tiene 15 rondas
  const [totalRounds] = useState(15);
  // Pistas: cantidad disponible (empieza con 1 para que el jugador tenga una pista inicial)
  // Las pistas ofrecen un consejo específico por pregunta y NO penalizan estabilidad.
  const [hintCount, setHintCount] = useState(1);
  const [explanationIsHint, setExplanationIsHint] = useState(false);
  
  // Estado para verificar si el usuario ya tiene una bandera del juego de gestión
  const [hasGestionFlag, setHasGestionFlag] = useState(false);
  const [checkingFlags, setCheckingFlags] = useState(true);

  // Problemas del juego definidos localmente
  const gameProblems = [
    {
      id: 1,
      description: "Recibes un correo que dice: 'Tu cuenta será suspendida si no confirmas tu contraseña ahora'. ¿Qué deberías hacer?",
    options: [
      { text: "Hacer clic rápido antes de que suspendan la cuenta", correct: false, explanation: "Los atacantes usan urgencia para engañarte." },
      { text: "Reenviar el correo a todos tus contactos", correct: false, explanation: "Así solo difundes el intento de phishing." },
      { text: "No hacer clic y verificar el mensaje directamente en el sitio oficial", correct: true },
    ],
    explanation: "El phishing busca que entregues tus datos haciéndose pasar por servicios legítimos."
  },
    {
      id: 2,
      description: "¿Qué es lo más seguro al crear una contraseña?",
    options: [
      { text: "Usar tu fecha de nacimiento", correct: false, explanation: "Es fácil de adivinar con tus datos públicos." },
      { text: "Usar una combinación de letras, números y símbolos", correct: true },
      { text: "Usar la misma contraseña para todo", correct: false, explanation: "Si una se filtra, todas tus cuentas quedan expuestas." }
    ],
    explanation: "Las contraseñas seguras mezclan distintos tipos de caracteres y no se repiten."
  },
    {
      id: 3,
      description: "Estás en un café y el Wi-Fi no tiene contraseña. ¿Qué deberías evitar hacer?",
    options: [
      { text: "Iniciar sesión en tu banco o correo personal", correct: true },
      { text: "Buscar memes o ver videos", correct: false, explanation: "Eso no implica riesgo de robo de información." },
      { text: "Usar auriculares", correct: false, explanation: "Los auriculares no tienen relación con la ciberseguridad." }
    ],
    explanation: "Las redes abiertas permiten que otros usuarios intercepten tus datos fácilmente."
  },
    {
      id: 4,
      description: "Los logs de seguridad revelan intentos de acceso no autorizado desde múltiples IPs. ¿Cuál es la respuesta más efectiva?",
      options: [
        { text: "Cerrar todos los puertos de red", correct: false, explanation: "Cerrar todos los puertos haría inaccesibles los servicios legítimos." },
        { text: "Implementar análisis de comportamiento y bloqueo dinámico de IPs", correct: true },
        { text: "Cambiar todas las direcciones IP del sistema", correct: false, explanation: "Cambiar IPs es complejo y no soluciona el problema de seguridad." }
      ],
      explanation: "El análisis comportamental identifica patrones maliciosos y permite respuesta automatizada."
    },
    {
      id: 5,
      description: "El análisis de datos muestra que el 60% del ancho de banda se usa para streaming no relacionado con trabajo. ¿Cómo gestionar esto?",
      options: [
        { text: "Bloquear permanentemente todo contenido multimedia", correct: false, explanation: "Bloquear todo multimedia puede afectar contenido educativo legítimo." },
        { text: "Ignorar el problema hasta que se resuelva solo", correct: false, explanation: "Ignorar el problema puede llevar a degradación continua del servicio." },
        { text: "Implementar políticas de uso y horarios de limitación de ancho de banda", correct: true },
      ],
      explanation: "Las políticas balanceadas permiten uso personal controlado sin afectar el trabajo."
    },
    {
      id: 6,
      description: "Tu amigo te pide tu contraseña para 'ver algo rápido'. ¿Qué deberías hacer?",
    options: [
      { text: "Dársela solo si es un amigo cercano", correct: false, explanation: "Incluso sin mala intención, puede poner tu cuenta en riesgo." },
      { text: "Cambiar la contraseña después", correct: false, explanation: "Compartirla ya rompe la seguridad, no es buena práctica." },
      { text: "No compartirla con nadie", correct: true },
    ],
    explanation: "Las contraseñas son personales y su seguridad depende de que solo tú las conozcas."
  },
    {
      id: 7,
      description: "¿Qué indica una dirección web segura?",
    options: [
      { text: "Empieza con https:// y tiene un candado en la barra del navegador", correct: true },
      { text: "Tiene colores llamativos y emojis", correct: false, explanation: "Eso no garantiza seguridad, puede ser parte del engaño." },
      { text: "Se ve profesional", correct: false, explanation: "Los sitios falsos pueden imitar el diseño de los reales." }
    ],
    explanation: "HTTPS significa que la conexión está cifrada y protege tus datos en tránsito."
  },
    {
      id: 8,
      description: "Si te llega un mensaje por WhatsApp con un link que promete premios, ¿qué deberías hacer?",
    options: [
      { text: "Abrirlo rápido para no perder el premio", correct: false, explanation: "Es una técnica común para robar datos personales." },
      { text: "No abrirlo y eliminar el mensaje", correct: true },
      { text: "Compartirlo con amigos por si ganan algo", correct: false, explanation: "Difundirlo propaga el fraude." }
    ],
    explanation: "Los enlaces con promesas exageradas suelen ser intentos de phishing o malware."
  },
    {
      id: 9,
      description: "Si tu computador empieza a comportarse raro después de instalar GTA_VI_Gratis_Full_Cr4ck3d_100%_r34l_1_link.rar, ¿qué deberías hacer?",
    options: [
      { text: "Desinstalarlo y analizar el sistema con un antivirus", correct: true },
      { text: "Ignorarlo, seguro se arregla solo", correct: false, explanation: "Los virus no se eliminan sin acción." },
      { text: "Instalar más Juegos Full_Cr4ck3d_100%_r34l_1_link.rar al azar", correct: false, explanation: "Podrías empeorar la infección." }
    ],
    explanation: "Siempre analiza los síntomas de comportamiento extraño: pueden indicar software malicioso, NO INSTALAR DE SITIOS NO CONOCIDOS, NI JUEGOS PIRATAS 👀."
  },
    {
      id: 10,
      description: "Alguien te etiqueta en una publicación que promete regalos si completas un formulario. ¿Qué deberías pensar?",
    options: [
      { text: "Seguro es real porque lo compartió un amigo", correct: false, explanation: "Los amigos también pueden caer en engaños." },
      { text: "No pasa nada si doy mi información", correct: false, explanation: "Estás entregando datos valiosos a desconocidos." },
      { text: "Podría ser una estafa para recolectar datos personales", correct: true },
    ],
    explanation: "Muchas estafas en redes sociales se difunden mediante etiquetas o concursos falsos."
  },
    {
      id: 11,
      description: "Estás en un laboratorio y te ofrecen un pendrive 'gratis' para probar. ¿Qué haces?",
    options: [
      { text: "No lo conectas sin escanearlo antes", correct: true },
      { text: "Lo conectas a tu pc personal para ver qué hay", correct: false, explanation: "Puede contener malware que se instala al instante." },
      { text: "Lo prestas a un compañero", correct: false, explanation: "Así solo se propaga el riesgo a más equipos." }
    ],
    explanation: "Los pendrives desconocidos son una forma común de propagar virus o ransomware."
  },
    {
      id: 12,
      description: "En la escala del 1 al 10, que tanto odias a Israel, y porqué 10?",
      options: [
        { text: "Porque no puedo más :c", correct: true, explanation: "" },
        { text: "Mataron a Yisus", correct: true },
        { text: "Controlan el mundo", correct: true, explanation: "" }
      ],
      explanation: "Los buffers dinámicos y reenvío adaptativo manejan eficientemente la congestión temporal."
    },
    {
      id: 13,
      description: "Si una aplicación comienza a pedir acceso a datos que no necesita, ¿qué deberías hacer?",
      options: [
        { text: "Revisar permisos y ajustar según necesidad", correct: true },
        { text: "Eliminar la aplicación y reinstalarla", correct: false, explanation: "Reinstalar no garantiza que se resuelva el problema de permisos." },
        { text: "Autorizar todo, total lo necesita para funcionar", correct: false, explanation: "Autorizar todos los permisos sin revisión puede comprometer la seguridad." }
      ],
      explanation: "La migración dinámica y auto-escalado optimizan el uso de recursos automáticamente."
    },
    {
      id: 14,
      description: "Quieres saber con quién habla otra persona en redes sociales. ¿Qué es lo ético y legal?",
    options: [
      { text: "Usar herramientas para leer sus mensajes privados sin permiso", correct: false, explanation: "Acceder a mensajes privados sin permiso es invasión y puede ser delito." },
      { text: "Preguntarle abiertamente a la persona si te interesa saber", correct: false, explanation: "Pregunta directa es ética, pero recuerda respetar su derecho a no responder." },
      { text: "No intentar acceder a sus mensajes privados; respetar su privacidad", correct: true },
    ],
    explanation: "Los mensajes privados son privados; la vía correcta es comunicación abierta y consentimiento, nunca intrusión."
  },
    {
      id: 15,
      description: "Alguien doxea tu IP privada (192.168.x.x). ¿Qué deberías hacer?",
      options: [
        { text: "Apago el internet de mi casa, ya que me pueden hackear en cualquier momento", correct: false, explanation: "No es necesario desconectar el internet, ya que la IP privada no es accesible desde fuera." },
        { text: "Nada, porque la IP privada no se muestra en internet, no es accesible desde afuera", correct: true },
        { text: "Llamar a la policia o a la PDI", correct: false, explanation: "Llamar a la policía no es necesario, ya que no hay un delito en curso." }
      ],
      explanation: "La IP privada no es accesible desde internet, por lo que no hay riesgo inmediato."
    }
  ];

  // Tips de mascota para diferentes situaciones
  const mascotTips = [
    "¡Recuerda siempre hacer copias de seguridad!",
    "Mantén la calma y piensa paso a paso.",
    "La seguridad primero: nunca compartas contraseñas.",
    "Un reinicio puede resolver muchos problemas.",
    "Documenta los cambios que hagas.",
    "Si algo no funciona, vuelve al estado anterior."
  ];

  // Mensajes amigables para la pantalla de bienvenida
  const welcomeMessages = [
    "¡Bienvenido al desafío!",
    "¡Estoy aquí para ayudarte!",
    "¿Listo para aprender?",
    "¡Vamos a mantener la red segura!",
    "Juntos haremos un gran trabajo."
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
  
  // Variables para popups maliciosos (ahora manejados localmente)
  const [malwareActive, setMalwareActive] = useState(false);
  const [malwareCurrent, setMalwareCurrent] = useState(null);
  const [malwareSide, setMalwareSide] = useState('right');
  const malwareScheduleRef = useRef(null);
  const malwareStartTimeRef = useRef(null);
  const malwareRemainingTimeRef = useRef(null);
  const lastPopupClosedRef = useRef(null);
  
  // Constantes para intervalos de popup
  const POPUP_INTERVAL_MIN = 8000; // 8 segundos
  const POPUP_INTERVAL_MAX = 13000; // 13 segundos
  const MIN_TIME_BETWEEN_POPUPS = 7000; // Mínimo 7 segundos entre popups

  // Mascota
  const [mascotMood, setMascotMood] = useState('idle'); // idle, happy, sad, cheer, thinking
  const [mascotHighlight, setMascotHighlight] = useState(false); // para el borde azul al interactuar
  // Nombre fijo de la mascota (no editable)
  const [mascotName] = useState('Telix');
  const [popupSuccessCount, setPopupSuccessCount] = useState(0);
  const [popupFlagObtained, setPopupFlagObtained] = useState(false); // Flag especial por 5 popups
  const [popupsDisabled, setPopupsDisabled] = useState(false); // Desactivar popups después de 5
  const [correctStreak, setCorrectStreak] = useState(0);
  // Animacion aplicada al popup malicioso cuando la perdida ocurre por un popup
  const [malwareLostAnim, setMalwareLostAnim] = useState(false);
  const [lostByPopup, setLostByPopup] = useState(false);

  // Confetti
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  // Mascota específica para explicar popups maliciosos junto al popup
  const [popupMascotExplain, setPopupMascotExplain] = useState({ visible: false, text: '', side: 'right' });
  // We'll show the welcome greeting using the inline mascot tip
  const greetingTimeoutRef = useRef(null);
  // Los tips de mascota y mensajes de bienvenida ahora se importan desde data/gameProblems.js
  const [mascotTip, setMascotTip] = useState({ visible: false, text: '' });
  const [lastShownTip, setLastShownTip] = useState('');
  const mascotTipRef = useRef(null);
  const tutorialTipBackupRef = useRef(null);
  // Frases cortas para el estado idle para no repetir siempre '¡Listo!'
  const idlePhrases = [
    'Aquí estoy.',
    'Listo para ayudar.',
    '¿Necesitas un tip?',
    'Vamos con la siguiente.',
    'Preparado para el desafío.'
  ];
  const [mascotIdleText, setMascotIdleText] = useState('¡Aquí estoy!');

  // Opción: dejar la alerta principal quieta (sin animación)
  const [alertsStatic, setAlertsStatic] = useState(false);

  const showMascotTip = () => {
    // Nos aseguramos de que isAnswering esté en false para no bloquear interacciones
    setIsAnswering(false);
    
    // Si hay un timer activo, lo limpiamos para reiniciar la cuenta
    if (mascotTipRef.current) {
      clearTimeout(mascotTipRef.current);
      mascotTipRef.current = null;
    }
    // limpiar cualquier explicación de popup para evitar duplicados
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    // Activar el borde azul
    setMascotHighlight(true);
    // If the tutorial panel is open, show a short advice then restore the tutorial message
    if (showTutorial) {
      // Back up current tutorial text if not already backed up
      if (!tutorialTipBackupRef.current) tutorialTipBackupRef.current = mascotTip.text || '';
      const tip = mascotTips[Math.floor(Math.random() * mascotTips.length)];
      setMascotTip({ visible: true, text: tip });
      setMascotMood('thinking');
      if (mascotTipRef.current) clearTimeout(mascotTipRef.current);
      mascotTipRef.current = setTimeout(() => {
        // restore the tutorial message (if still in tutorial)
        if (showTutorial) {
          setMascotTip({ visible: true, text: tutorialTipBackupRef.current || '' });
        } else {
          setMascotTip({ visible: false, text: '' });
        }
        setMascotHighlight(false); // Desactivamos el highlight después de la transición del mensaje
        tutorialTipBackupRef.current = null;
        mascotTipRef.current = null;
        setMascotMood('idle');
        setIsAnswering(false); // Aseguramos que no se bloqueen interacciones
      }, 5000);
      return;
    }

    // If the welcome screen is open, show friendly messages only (no gameplay tips)
    if (showWelcome) {
      let newMsg;
      do {
        newMsg = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
      } while (newMsg === lastShownTip && welcomeMessages.length > 1);
      
      if (mascotTipRef.current) clearTimeout(mascotTipRef.current);
      setLastShownTip(newMsg);
      setMascotTip({ visible: true, text: newMsg });
      setMascotMood('happy');
      mascotTipRef.current = setTimeout(() => {
        if (showWelcome) {
          // En la pantalla de bienvenida, cambiamos directamente al mensaje original
          setMascotTip({ visible: true, text: '¡Hola! Soy Telix, te ayudaré a mantener la red escolar estable con consejos y alertas sencillas.' });
        } else {
          setMascotTip({ visible: false, text: '' });
        }
        setMascotHighlight(false);
        mascotTipRef.current = null;
        setIsAnswering(false); // Aseguramos que no se bloqueen interacciones
      }, 5000);
      return;
    }

    // elegir tip aleatorio diferente al último mostrado
    let newTip;
    do {
      newTip = mascotTips[Math.floor(Math.random() * mascotTips.length)];
    } while (newTip === lastShownTip && mascotTips.length > 1);
    
    setLastShownTip(newTip);
    setMascotTip({ visible: true, text: newTip });
    setMascotMood('thinking');
    if (mascotTipRef.current) clearTimeout(mascotTipRef.current);
    mascotTipRef.current = setTimeout(() => {
      // Primero ocultamos el mensaje
      setMascotTip({ visible: false, text: '' });
      // Breve retraso antes de quitar el highlight para una transición suave
      setTimeout(() => {
        setMascotHighlight(false);
        setMascotMood('idle');
      }, 150);
      mascotTipRef.current = null;
    }, 5000);
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
  // Tutorial shown on demand: default to hidden on initial load
  // The user can check "No mostrar de nuevo" to persist that preference.
  const [showTutorial, setShowTutorial] = useState(false);
  // Show a mandatory welcome screen when the page is opened
  const [showWelcome, setShowWelcome] = useState(true);
  const [tutorialDontShowAgain, setTutorialDontShowAgain] = useState(() => {
    try {
      return localStorage.getItem('nm_dontShowTutorial') === '1';
    } catch (e) {
      return false;
    }
  });
  // Estados para ejemplos interactivos en el tutorial
  const [showPopupExample, setShowPopupExample] = useState(false);
  const [showRebootExample, setShowRebootExample] = useState(false);
  const [demoStability, setDemoStability] = useState(50);
  // El juego NO comienza hasta que el usuario pulse "Comenzar" en la pantalla de inicio
  const [gameStarted, setGameStarted] = useState(false);
  // Items / recursos
  const [rebootAvailable, setRebootAvailable] = useState(2); // number of reboots available


  const [transitioningToTutorial, setTransitioningToTutorial] = useState(false);
  
  // Estados para controlar las animaciones de transición
  const [welcomeExiting, setWelcomeExiting] = useState(false);
  const [tutorialExiting, setTutorialExiting] = useState(false);
  const [gameContentVisible, setGameContentVisible] = useState(false);

  // show the mascot tip persistently while the welcome hero is visible
  useEffect(() => {
  const greetText = '¡Hola, soy Telix! Te ayudaré a mantener la red escolar estable con consejos y alertas sencillas.';
    if (showWelcome) {
      setMascotTip({ visible: true, text: greetText });
      setMascotMood('happy');
    } else {
      setMascotTip({ visible: false, text: '' });
      setMascotMood('idle');
    }
  }, [showWelcome]);

  // disable page scroll while welcome hero is visible
  useEffect(() => {
    if (showWelcome) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
    return undefined;
  }, [showWelcome]);

  // Verificar si el usuario ya tiene una bandera del juego de gestión
  useEffect(() => {
    const checkUserFlags = async () => {
      try {
        const response = await fetch(getApiUrl('/flags/user'), {
          headers: getAuthHeaders()
        });

        if (response.ok) {
          const data = await response.json();
          const userFlags = data.data || [];
          
          // Códigos de las 3 banderas del juego de gestión
          const gestionFlagCodes = [
            'D1FT3L{G3ST10N_M43STR0_D3_R3D_0R0}',       // Oro
            'D1FT3L{G3ST10N_3XP3RT0_3N_R3D_PL4T4}',     // Plata
            'D1FT3L{G3ST10N_4N4L1ST4_D3_R3D_BR0NC3}'    // Bronce
          ];
          
          // Verificar si el usuario tiene alguna de estas banderas
          const hasAnyGestionFlag = userFlags.some(flag => 
            gestionFlagCodes.includes(flag.code)
          );
          
          if (hasAnyGestionFlag) {
            setHasGestionFlag(true);
            setHintCount(0); // Bloquear pistas
          }
        }
      } catch (error) {
        console.error('Error verificando flags del usuario:', error);
      } finally {
        setCheckingFlags(false);
      }
    };

    checkUserFlags();
  }, []);

  // disable page scroll while tutorial panel is visible and show a tutorial-specific mascot tip
  useEffect(() => {
    if (showTutorial) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // show tutorial-specific message in the mascot tip (do NOT include the mascot name here)
      const tutorialText = 'Seré tu compañero durante el juego. ¡Haz clic en mí cuando necesites ayuda o consejos!';
      // clear any existing timeout so this tip persists while tutorial is open
      if (mascotTipRef.current) { clearTimeout(mascotTipRef.current); mascotTipRef.current = null; }
      setMascotTip({ visible: true, text: tutorialText });
      setMascotMood('thinking');
      return () => { document.body.style.overflow = prev; };
    }
    // when tutorial closes, clear the mascot tip unless welcome is visible
    if (!showTutorial && !showWelcome) {
      setMascotTip({ visible: false, text: '' });
      setMascotMood('idle');
    }
    return undefined;
  }, [showTutorial, showWelcome]);

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
      setMascotIdleText('¡Aquí estoy!');
      return;
    }
    const choice = idlePhrases[Math.floor(Math.random() * idlePhrases.length)];
    setMascotIdleText(choice);
    const t = setTimeout(() => setMascotIdleText('¡Aquí estoy!'), 6000); // vuelve al mensaje por defecto
    return () => clearTimeout(t);
  }, [mascotMood, mascotTip.visible, gameStarted]);

  useEffect(() => {
    // only pick a new problem when the game has been started
    if (!currentProblem && !gameOver && gameStarted) {
      // Filtrar problemas que aún no se han usado
      const availableProblems = gameProblems.filter(p => !usedProblemIds.includes(p.id));
      
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
    if (isAnswering || malwareActive) return; // Prevenir múltiples clics y bloquear durante popup malicioso
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

    // Mantener la selección visible por un momento para mostrar el icono ✓/✖
    const delay = correct ? 600 : 300;
    setTimeout(() => {
      if (round >= totalRounds) {
        setGameOver(true);
        setGameWon(stability > 0);
      } else {
        setRound(prev => prev + 1);
        setCurrentProblem(null);
        setIsAnswering(false);
        setSelectedIndex(null);
        setHintUsed(false);
      }
    }, delay);
  };  // Problemas tipo 'popup malicioso' para hacer el juego más entretenido
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
    if (!gameStarted || malwareActive || gameOver || showExplanation) return;
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
      const newPopupCount = popupSuccessCount + 1;
      setPopupSuccessCount(newPopupCount);
      setScore(prev => prev + 5);
      setStability(prev => Math.min(100, prev + 5));
      
      // Verificar si se alcanzaron 5 popups correctos
      if (newPopupCount === 5 && !popupFlagObtained) {
        setPopupFlagObtained(true);
        setPopupsDisabled(true); // Desactivar futuros popups
        setScore(prev => prev + 50); // Bonus adicional por la flag especial
        // Mostrar mensaje especial
        setMascotMood('cheer');
        setMascotTip({ visible: true, text: '🎉 ¡Increíble! Has bloqueado 5 popups maliciosos. ¡Flag especial desbloqueada!' });
        setTimeout(() => {
          setMascotTip({ visible: false, text: '' });
          setMascotMood('idle');
        }, 5000);
      }
      
      // NO cambiar el mood de Teli por respuestas del popup malicioso
      // setMascotMood('happy'); // Comentado para que Teli no reaccione
      // no mostramos explicación modal para respuestas correctas, solo feedback visual
      // no avanzamos de ronda solo por el popup
      // cerrar popup inmediatamente en respuestas correctas
      setMalwareActive(false);
      lastPopupClosedRef.current = Date.now(); // Registrar cuando se cerró
      // Ocultar cualquier explicación de Telix que esté visible del popup anterior
      setPopupMascotExplain({ visible: false, text: '', side: 'right' });
      return;
    }

  // Respuesta incorrecta en popup: solo educativo, SIN penalización
  // NO se aplica penalización por respuestas incorrectas en popups maliciosos
  // const basePenalty = 4;
  // const scale = 1 + (round / Math.max(1, totalRounds)) * 0.3; // hasta ~1.3x
  // const penalty = Math.round(basePenalty * scale);
  // NO restar estabilidad por respuestas incorrectas en popups
  // setStability(prev => Math.max(5, prev - penalty)); // Comentado para eliminar penalización
  // NO cambiar el mood de Telix por respuestas del popup malicioso
  // setMascotMood('sad'); // Comentado para que Telix no reaccione
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



  // (special rounds removed)

  const closePopupMascotExplain = () => {
    setPopupMascotExplain({ visible: false, text: '', side: 'right' });
    // Cerrar también el popup malicioso cuando se cierra la explicación
    setMalwareActive(false);
    lastPopupClosedRef.current = Date.now(); // Registrar cuando se cerró
    setIsAnswering(false);
    setMascotMood('idle');
  };

  const closeTutorial = (saveDontShow = false) => {
    // persist preference only if the user explicitly asked to not show again
    if (saveDontShow) {
      try { localStorage.setItem('nm_dontShowTutorial', '1'); } catch (e) {}
    }
    
    // Iniciar animación de salida del tutorial
    setTutorialExiting(true);
    setTimeout(() => {
      setShowTutorial(false);
      setTutorialExiting(false);
      // Start game automatically after closing tutorial
      if (!gameStarted) {
        startGame();
      }
    }, 400);
  };

  // (tutorial interactivo eliminado; se mantiene el tutorial estático)

  const startGame = () => {
    setGameStarted(true);
    // Para transiciones desde tutorial - mostrar contenido inmediatamente
    setGameContentVisible(true);

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
    // Limpiar timers de popups maliciosos
    if (malwareScheduleRef.current) {
      clearTimeout(malwareScheduleRef.current);
      malwareScheduleRef.current = null;
    }
    malwareStartTimeRef.current = null;
    malwareRemainingTimeRef.current = null;
    // ensure currentProblem is null so the effect picks a fresh, unused problem
    setCurrentProblem(null);
  };



  const closeExplanation = (advance = true) => {
    setShowExplanation(false);
    setExplanationIsHint(false);
    // Si la explicación vino del juego normal (advance=true) avanzamos la ronda.
    if (!advance) return; // por ejemplo: explicaciones de popups no avanzan la ronda

    // Verificamos si estamos en la última ronda (15)
    if (round === totalRounds) {
      setGameOver(true);
      setGameWon(stability > 75); // Victoria solo si la estabilidad es mayor a 75%
      setIsAnswering(false);
      return;
    }

    // Si no es la última ronda, avanzamos a la siguiente
    setRound(prev => prev + 1);
    // Avanzar a la siguiente pregunta
    setCurrentProblem(null);
    setIsAnswering(false);
    setSelectedIndex(null);
    setHintUsed(false);
  };

  const useHint = () => {
    // Si ya tiene una bandera del juego de gestión, no permitir usar pistas
    if (hasGestionFlag) {
      setMascotTip({ 
        visible: true, 
        text: '¡Ya completaste este juego antes y obtuviste una bandera! Las pistas están bloqueadas para quienes ya ganaron.' 
      });
      setMascotMood('thinking');
      if (mascotTipRef.current) {
        clearTimeout(mascotTipRef.current);
      }
      mascotTipRef.current = setTimeout(() => {
        setMascotTip({ visible: false, text: '' });
        setMascotMood('idle');
        mascotTipRef.current = null;
      }, 5000);
      return;
    }
    
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

  // Función para calcular la flag según el puntaje final
  const calculateFinalFlag = (finalScore) => {
    // 3 niveles de banderas basadas en puntaje
    // Bronce: 0-150 pts (30 pts)
    // Plata: 151-250 pts (60 pts)
    // Oro: 200+ pts (100 pts)
    
    if (finalScore >= 201) {
      return {
        name: 'Gestión Oro - Maestro de Red',
        value: 'D1FT3L{G3ST10N_M43STR0_D3_R3D_0R0}',
        points: 100,
        description: '¡Excelente desempeño! Dominas la gestión de redes.',
        tier: 'gold'
      };
    } else if (finalScore >= 151) {
      return {
        name: 'Gestión Plata - Experto en Red',
        value: 'D1FT3L{G3ST10N_3XP3RT0_3N_R3D_PL4T4}',
        points: 60,
        description: 'Muy buen trabajo. Tienes sólidos conocimientos de gestión.',
        tier: 'silver'
      };
    } else {
      return {
        name: 'Gestión Bronce - Analista de Red',
        value: 'D1FT3L{G3ST10N_4N4L1ST4_D3_R3D_BR0NC3}',
        points: 30,
        description: 'Buen comienzo. Continúa practicando para mejorar.',
        tier: 'bronze'
      };
    }
  };

  // Función para obtener la flag especial de popups
  const getPopupBonusFlag = () => {
    return {
      name: 'Defensor Anti-Malware',
      value: 'D1FT3L{D3F3NS0R_4NT1_M4LW4R3_5_P0PUPS}',
      points: 50,
      description: '¡Bloqueaste 5 popups maliciosos! Excelente vigilancia.'
    };
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
    // Resetear el borde de la burbuja al reiniciar el juego
    setBubbleBorderType('default');
    if (malwareScheduleRef.current) {
      clearTimeout(malwareScheduleRef.current);
      malwareScheduleRef.current = null;
    }
  // no quedan timers de rondas especiales porque esa mecánica fue eliminada
    // keep gameStarted as false so player must start from the start modal
    setGameStarted(false);
    // Reiniciar estados de animación
    setGameContentVisible(false);
    setWelcomeExiting(false);
    setTutorialExiting(false);
  };

  // Elegir momentos aleatorios para mostrar el popup malicioso
  useEffect(() => {
    if (!gameStarted || gameOver || popupsDisabled) return; // Detener si popups están desactivados

    // Si ya está activo, no programamos otro
    if (malwareActive) return;

    // Si hay una explicación abierta, pausar el timer
    if (showExplanation) {
      // Si hay un timer activo, pausarlo
      if (malwareScheduleRef.current && malwareStartTimeRef.current) {
        clearTimeout(malwareScheduleRef.current);
        const elapsed = Date.now() - malwareStartTimeRef.current;
        malwareRemainingTimeRef.current = Math.max(0, malwareRemainingTimeRef.current - elapsed);
      }
      return;
    }

    // Si tenemos tiempo restante de una pausa, usar ese tiempo
    let delay;
    if (malwareRemainingTimeRef.current > 0) {
      delay = malwareRemainingTimeRef.current;
      malwareRemainingTimeRef.current = 0;
    } else {
      // Nuevo timer: programar evento entre POPUP_INTERVAL_MIN y MAX
      delay = POPUP_INTERVAL_MIN + Math.floor(Math.random() * (POPUP_INTERVAL_MAX - POPUP_INTERVAL_MIN));
      
      // Si recién se cerró un popup, asegurar tiempo mínimo adicional
      if (lastPopupClosedRef.current) {
        const timeSinceLastPopup = Date.now() - lastPopupClosedRef.current;
        if (timeSinceLastPopup < MIN_TIME_BETWEEN_POPUPS) {
          const extraDelay = MIN_TIME_BETWEEN_POPUPS - timeSinceLastPopup;
          delay = Math.max(delay, extraDelay);
        }
      }
    }
    
    malwareStartTimeRef.current = Date.now();
    malwareRemainingTimeRef.current = delay;
    
    malwareScheduleRef.current = setTimeout(() => {
      showMalware();
    }, delay);

    return () => {
      if (malwareScheduleRef.current) clearTimeout(malwareScheduleRef.current);
    };
  }, [round, malwareActive, gameOver, showExplanation]);

  // Rondas especiales eliminadas: ya no programamos rounds extra.



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

  return (
    <>
    <div className={styles.gameContainer}>
      <div className={`${styles.header} ${gameContentVisible ? styles.gameContentEntrance : ''}`}>
  {/* Hide stats until the game has started */}
  {gameStarted && (
    <div className={styles.statsContainer}>
          <div className={`${styles.stabilityBar} ${stability <= 20 ? styles.critical : ''}`}>
            <div 
              className={`${styles.stabilityFill} ${stability > 60 ? styles.high : stability > 30 ? styles.medium : styles.low}`}
              style={{ width: `${stability}%` }}
            />
          </div>
            {gameStarted && (
              <div className={styles.stats}>
                <div className={styles.statLeft}><span>Estabilidad de la Red: {stability}%</span></div>
                <div className={styles.statCenter}><span>Puntuación: {score}</span></div>
                <div className={styles.statRight}><span>Ronda: {round}/{totalRounds}</span></div>
              </div>
            )}
            {gameStarted && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={alertsStatic} onChange={e => setAlertsStatic(e.target.checked)} /> Dejar alerta principal quieta
                </label>
              </div>
            )}
            {/* rounds selection moved to the start modal; hide control here since rounds are fixed after start */}
    </div>) }
          {/* Tutorial modal shown on first load */}
          {/* Welcome modal: mandatory intro shown on page load */}
          {/* Inline welcome hero (not a popup) */}
          {showWelcome && (
            <>
              <div className={styles.welcomeBackdrop} />
              <div className={`${styles.welcomeHero} ${transitioningToTutorial ? styles.heroExit : ''} ${welcomeExiting ? styles.welcomeToGameExit : ''}`}>
                <div style={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                <div className={styles.welcomeIcon}>🕵️‍♀️🧩</div>
                <h1 style={{ margin: 0, color: '#fff', fontSize: '2.2rem', lineHeight: 1.05, letterSpacing: '-0.02em' }}>¡Bienvenid@ al Desafío de Análisis!</h1>
                <p style={{ margin: '12px 0 0 0', color: 'rgba(255,255,255,0.95)', fontSize: '1.2rem', lineHeight: 1.4 }}>
                  ¡Ponte en acción y aprende a resolver problemas usando información! 
                  Tu amigo Telix te acompañará en esta divertida aventura donde aprenderás a tomar decisiones inteligentes.
                </p>
                <div className={styles.welcomeFeatures}>
                  <div className={styles.featureItem}>
                    <span role="img" aria-label="explore">🔍</span>
                    <span>Explora pistas</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span role="img" aria-label="solve">🎯</span>
                    <span>Resuelve retos</span>
                  </div>
                  <div className={styles.featureItem}>
                    <span role="img" aria-label="learn">🧠</span>
                    <span>¡Aprende jugando!</span>
                  </div>
                </div>
                
                {/* Mensaje si ya tiene una bandera del juego */}
                {hasGestionFlag && !checkingFlags && (
                  <div style={{ 
                    marginTop: 16, 
                    padding: '12px 16px', 
                    backgroundColor: 'rgba(251, 191, 36, 0.15)', 
                    border: '2px solid rgba(251, 191, 36, 0.5)',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    margin: '16px auto 0 auto'
                  }}>
                    <p style={{ 
                      margin: 0, 
                      color: '#fbbf24', 
                      fontSize: '0.95rem', 
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'center'
                    }}>
                      <span>🏆</span>
                      <span>¡Ya completaste este juego!</span>
                    </p>
                    <p style={{ 
                      margin: '8px 0 0 0', 
                      color: 'rgba(255,255,255,0.9)', 
                      fontSize: '0.85rem',
                      lineHeight: 1.4
                    }}>
                      Puedes volver a jugar, pero las pistas estarán bloqueadas. ¡Demuestra tu habilidad sin ayuda!
                    </p>
                  </div>
                )}
                
                <div style={{ marginTop: 24, display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className={`${styles.welcomeButton} ${styles.primaryButton}`} onClick={() => {
                    const shouldShowTutorial = !localStorage.getItem('nm_dontShowTutorial');
                    
                    if (shouldShowTutorial) {
                      // Transición hacia el tutorial
                      setTransitioningToTutorial(true);
                      setTimeout(() => {
                        setShowWelcome(false);
                        setTransitioningToTutorial(false);
                        setShowTutorial(true);
                      }, 380);
                    } else {
                      // Transición hacia el juego - coordinada para evitar doble animación
                      setWelcomeExiting(true);
                      setTimeout(() => {
                        setShowWelcome(false);
                        setWelcomeExiting(false);
                        // Iniciar el juego inmediatamente sin timeout adicional
                        setGameStarted(true);
                        setGameContentVisible(true); // Activar contenido del juego inmediatamente
                        
                        // Configurar mascota y limpiar estados
                        setMascotMood('happy');
                        setPopupMascotExplain({ visible: false, text: '', side: 'right' });
                        if (mascotTipRef.current) { clearTimeout(mascotTipRef.current); mascotTipRef.current = null; }
                        setMascotTip({ visible: true, text: 'Perfecto — iniciando partida...' });
                        mascotTipRef.current = setTimeout(() => { setMascotTip({ visible: false, text: '' }); mascotTipRef.current = null; }, 2500);
                        
                        // Limpiar estados de explicación
                        setShowExplanation(false);
                        setExplanationText('');
                        setExplanationIsHint(false);
                        setExplanationAdvance(true);
                      }, 500);
                    }
                  }} style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 6px rgba(76, 175, 80, 0.3)'
                  }}>Comenzar</button>
                </div>
                
                {/* (removed inline mascot inside the welcome hero to avoid duplicate bubbles) */}
                </div>
              </div>
            </>
          )}



          {/* Interactive tutorial (stepped) */}
          {/* interactive tutorial removed; static tutorial modal remains above */}
          {/* startPanel moved into mainContent (rendered there) */}
          {/* Reboot item (single) removed — controls consolidated below */}

          {/* Leaderboard modal */}

          {/* Inline controls row: left = actions, right = tutorial (small). Hidden while game over. */}
          {!gameOver && gameStarted && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={styles.hintButton} onClick={useReboot} disabled={rebootAvailable <= 0}>{rebootAvailable > 0 ? `Reinicio (+20%) (${rebootAvailable})` : 'Reinicio usado'}</button>
                <button
                  className={styles.hintButton}
                  onClick={useHint}
                  disabled={!currentProblem || hintUsed || hintCount <= 0 || hasGestionFlag}
                  title={
                    hasGestionFlag 
                      ? '🔒 Pistas bloqueadas - Ya obtuviste una bandera de este juego' 
                      : hintCount > 0 
                        ? `Pistas disponibles: ${hintCount}` 
                        : 'No hay pistas disponibles'
                  }
                  style={hasGestionFlag ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {hasGestionFlag ? '🔒 Pistas bloqueadas' : hintCount > 0 ? `Pista (${hintCount})` : 'Sin pistas'}
                </button>
              </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button className={styles.hintButton} onClick={resetGame}>Reiniciar partida</button>
                <button className={styles.hintButton} style={{ padding: '6px 8px', fontSize: '0.85rem' }} onClick={() => setShowTutorial(true)}>Ver tutorial</button>
              </div>
            </div>
          )}

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

          
        </div>

      {/* Mascota - movida fuera del header para evitar que se anime con el contenido del juego */}
      <div className={`${styles.mascotContainer} ${showTutorial ? styles.tutorialActive : ''}`}>
        <div className={`${styles.mascot} ${styles[mascotMood]} ${mascotHighlight ? styles.highlight : ''}`} title="Mascota" onClick={showMascotTip} role="button">
          <div className={styles.mascotTop}>
            <img src={telixImage} alt={mascotName} className={styles.mascotImage} />
            <div className={styles.mascotName}>{mascotName}</div>
          </div>
          <div className={styles.mascotText}>
            {/* Render the message bubble below the emoji and name - SIEMPRE con burbuja */}
            <div>
              <div className={styles.mascotTipInline}>
                <div className={styles.mascotTipBody}>
                  {mascotTip.visible ? (
                    mascotTip.text
                  ) : (
                    /* Context-aware idle text: SIEMPRE mostrar algo */
                    !showTutorial && !gameStarted && !showWelcome ? (
                      '¡Listo para ayudar!'
                    ) : showTutorial ? (
                      '¡Aquí estoy!'
                    ) : (
                      /* during active game, show mood messages or a short idle phrase */
                      (mascotMood !== 'idle' ? (
                        (mascotMood === 'happy' && '¡Buen trabajo!') ||
                        (mascotMood === 'sad' && 'Oh...') ||
                        (mascotMood === 'cheer' && '¡Genial!') ||
                        (mascotMood === 'thinking' && 'Mmm...') || 
                        '¡Aquí estoy!'
                      ) : (
                        mascotIdleText || '¡Aquí estoy!'
                      ))
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* The inline white mascot tip (bottom-right) handles tutorial/start/welcome messages via mascotTip state. Duplicate fixed popup bubbles removed. */}
      </div>



  <div className={`${styles.mainContent} ${gameContentVisible ? styles.gameContentEntrance : ''}`}>


          {gameOver ? (
            <div className={styles.gameEndScreen}>
              <div className={styles.gameEndContent}>
                <h2 style={{ marginTop: 0 }}>{gameWon ? '¡Lo lograste! 🎉' : '¡Juego Terminado!'}</h2>
                {gameWon ? (
                  <>
                    <p>¡La red está estable gracias a ti! ¡Buen trabajo, detective de la red!</p>
                    
                    {/* Flag principal del juego */}
                    {(() => {
                      const mainFlag = calculateFinalFlag(score);
                      return (
                        <div style={{ 
                          marginTop: 16, 
                          padding: '12px', 
                          backgroundColor: mainFlag.tier === 'gold' ? '#854d0e' : mainFlag.tier === 'silver' ? '#475569' : '#78350f',
                          borderRadius: '8px', 
                          border: `2px solid ${mainFlag.tier === 'gold' ? '#fbbf24' : mainFlag.tier === 'silver' ? '#94a3b8' : '#f59e0b'}`,
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: mainFlag.tier === 'gold' ? '#fef3c7' : mainFlag.tier === 'silver' ? '#e2e8f0' : '#fef3c7',
                          textAlign: 'center',
                          maxWidth: '90%',
                          margin: '0 auto 16px auto'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: mainFlag.tier === 'gold' ? '#fbbf24' : mainFlag.tier === 'silver' ? '#cbd5e1' : '#f59e0b' }}>
                            🚩 FLAG CAPTURADA - {mainFlag.tier === 'gold' ? '🥇 ORO' : mainFlag.tier === 'silver' ? '🥈 PLATA' : '🥉 BRONCE'}
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                            {mainFlag.name}
                          </p>
                          <p style={{ margin: '0 0 8px 0', wordBreak: 'break-all', fontSize: '13px' }}>{mainFlag.value}</p>
                          <p style={{ margin: '0', fontSize: '12px' }}>
                            +{mainFlag.points} puntos
                          </p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '11px', fontStyle: 'italic' }}>
                            {mainFlag.description}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Flag bonus por popups (si se obtuvo) */}
                    {popupFlagObtained && (() => {
                      const bonusFlag = getPopupBonusFlag();
                      return (
                        <div style={{ 
                          marginTop: 8, 
                          padding: '12px', 
                          backgroundColor: '#1e3a8a',
                          borderRadius: '8px', 
                          border: '2px solid #3b82f6',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: '#60a5fa',
                          textAlign: 'center',
                          maxWidth: '90%',
                          margin: '0 auto'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#93c5fd' }}>
                            ⭐ FLAG BONUS - ANTI-MALWARE
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                            {bonusFlag.name}
                          </p>
                          <p style={{ margin: '0 0 8px 0', wordBreak: 'break-all', fontSize: '13px' }}>{bonusFlag.value}</p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#93c5fd' }}>
                            +{bonusFlag.points} puntos
                          </p>
                          <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#e0e7ff', fontStyle: 'italic' }}>
                            {bonusFlag.description}
                          </p>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <>
                    <p>La red necesita ayuda. ¡Inténtalo otra vez!</p>
                    
                    {/* Mostrar flag incluso si perdió */}
                    {(() => {
                      const mainFlag = calculateFinalFlag(score);
                      return (
                        <div style={{ 
                          marginTop: 16, 
                          padding: '12px', 
                          backgroundColor: '#78350f',
                          borderRadius: '8px', 
                          border: '2px solid #f59e0b',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: '#fef3c7',
                          textAlign: 'center',
                          maxWidth: '90%',
                          margin: '0 auto'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f59e0b' }}>🚩 FLAG OBTENIDA</p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                            {mainFlag.name}
                          </p>
                          <p style={{ margin: '0 0 8px 0', wordBreak: 'break-all', fontSize: '13px' }}>{mainFlag.value}</p>
                          <p style={{ margin: '0', fontSize: '12px' }}>
                            +{mainFlag.points} puntos
                          </p>
                        </div>
                      );
                    })()}

                    {/* Flag bonus por popups (si se obtuvo) */}
                    {popupFlagObtained && (() => {
                      const bonusFlag = getPopupBonusFlag();
                      return (
                        <div style={{ 
                          marginTop: 8, 
                          padding: '12px', 
                          backgroundColor: '#1e3a8a',
                          borderRadius: '8px', 
                          border: '2px solid #3b82f6',
                          fontFamily: 'monospace',
                          fontSize: '14px',
                          color: '#60a5fa',
                          textAlign: 'center',
                          maxWidth: '90%',
                          margin: '8px auto 0 auto'
                        }}>
                          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#93c5fd' }}>
                            ⭐ FLAG BONUS
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: '#fbbf24' }}>
                            {bonusFlag.name}
                          </p>
                          <p style={{ margin: '0 0 8px 0', wordBreak: 'break-all', fontSize: '13px' }}>{bonusFlag.value}</p>
                          <p style={{ margin: '0', fontSize: '12px', color: '#93c5fd' }}>
                            +{bonusFlag.points} puntos
                          </p>
                        </div>
                      );
                    })()}
                  </>
                )}
                <div className={styles.finalStats}>
                  <p><strong>Estabilidad final:</strong> {stability}%</p>
                  <p><strong>Puntuación final:</strong> {score}</p>
                  {popupFlagObtained && <p style={{ color: '#3b82f6', fontWeight: 'bold' }}>⭐ Popups bloqueados: 5/5</p>}
                </div>
                <button onClick={resetGame} className={styles.resetButton}>
                  Jugar de nuevo
                </button>
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
                    disabled={malwareActive} // Deshabilitar el botón cuando hay popup malicioso (sin cambio visual)
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

    {/* Tutorial modal - FUERA del contenedor principal para evitar conflictos de z-index */}
    {showTutorial && (
      <>
        <div className={styles.tutorialBackdrop} />
        <div className={`${styles.tutorialPanel} ${tutorialExiting ? styles.tutorialExit : ''}`}>
          <h2 style={{ color: '#2196F3', marginBottom: '20px', textAlign: 'center' }}>Aprende a jugar 🎮</h2>
          
          <div className={styles.tutorialSection}>
            <h3>🎯 Ventanas emergentes</h3>
            <p>Durante el juego aparecerán ventanas con preguntas que deberás resolver. ¡Ten cuidado! Algunas son engañosas.</p>
          </div>

          <div className={styles.tutorialSection}>
            <h3>💡 Sistema de Pistas</h3>
            <p>Gana una pista por cada 3 respuestas correctas seguidas. Úsalas cuando necesites ayuda con una pregunta - ¡no afectan la estabilidad de la red!</p>
          </div>

          <div className={styles.tutorialSection}>
            <h3>🔄 Recuperación de Estabilidad</h3>
            <p>¿La estabilidad está muy baja? Tienes 2 oportunidades para recuperar +20% de estabilidad.</p>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.8)' }}>
              <input 
                type="checkbox" 
                checked={tutorialDontShowAgain} 
                onChange={e => setTutorialDontShowAgain(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              /> 
              No mostrar de nuevo
            </label>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className={`${styles.resetButton} ${styles.primaryButton}`} 
                onClick={() => { closeTutorial(tutorialDontShowAgain); }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </>
    )}

    {/* Modal de explicación - FUERA del contenedor principal para máximo z-index */}
    {showExplanation && (
      <div className={styles.modalBackdrop} onClick={() => closeExplanation(explanationAdvance)}>
        <div className={styles.modal} onClick={e => e.stopPropagation()}>
          <h4>{explanationIsHint ? 'Pista' : '¿Por qué esto no fue buena idea?'}</h4>
          <p>{explanationText}</p>
          <div style={{ textAlign: 'right' }}>
            <button onClick={() => closeExplanation(explanationAdvance)} className={styles.resetButton}>
              {explanationIsHint ? 'Cerrar pista' : '¡Entendido!'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Popup malicioso - FUERA del contenedor principal para correcto posicionamiento */}
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
          {popupMascotExplain.visible && !showWelcome && (
            <div className={`${styles.popupMascotBubble} ${styles.belowPopup}`}>
              <div className={styles.bubbleHeader}>
                <img src={telixImage} alt={mascotName} className={styles.mascotImage} />
                <div style={{ fontWeight: 700, color: '#0b2340' }}>{mascotName}</div>
                {/* thinkingDots intentionally not shown for popup explanations to avoid 'loading' look */}
                <button className={styles.bubbleClose} onClick={closePopupMascotExplain}>✖</button>
              </div>
              <div>{popupMascotExplain.text}</div>
            </div>
          )}
        </div>
      </>
    )}
  </>
  );
}

export default NetworkManager;