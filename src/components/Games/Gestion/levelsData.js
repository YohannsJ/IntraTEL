// data for levels and quiz questions
const levels = [
  {
    name: "Nivel 1: Accesos básicos",
    cards: [
  { usuario: "Ana", pais: "Chile", hora: "10:00", accion: "Login exitoso", sospechoso: false },
  { usuario: "Juan", pais: "Rusia", hora: "03:00", accion: "Login desde país inusual", sospechoso: true },
  { usuario: "Pedro", pais: "China", hora: "02:45", accion: "Contraseña fallida 20 veces", sospechoso: true },
  { usuario: "Sofía", pais: "Chile", hora: "11:15", accion: "Subir tarea", sospechoso: false },
  { usuario: "Carlos", pais: "México", hora: "12:30", accion: "Descarga de datos", sospechoso: true },
  { usuario: "Lucía", pais: "Uruguay", hora: "13:10", accion: "Actualización de perfil", sospechoso: false },
  { usuario: "Javier", pais: "Ecuador", hora: "15:05", accion: "Eliminación de registros", sospechoso: true },
  { usuario: "Valentina", pais: "Bolivia", hora: "08:50", accion: "Login", sospechoso: false },
  { usuario: "Miguel", pais: "Venezuela", hora: "17:30", accion: "Acceso fuera de horario", sospechoso: true }
    ],
    quiz: {
      pregunta: "¿Por qué es importante detectar accesos sospechosos?",
      opciones: [
        "Porque pueden indicar un ataque o robo de información.",
        "Porque es divertido.",
        "Porque así el sistema funciona más rápido."
      ],
      correcta: 0
    }
  },
  {
    name: "Nivel 2: Mensajes y transferencias",
    cards: [
  { usuario: "María", pais: "Perú", hora: "16:45", accion: "Mensaje: '¿Me puedes dar tu contraseña?'", sospechoso: true },
  { usuario: "Pedro", pais: "Colombia", hora: "11:20", accion: "Transferencia de archivos: 500MB a servidor externo", sospechoso: true },
  { usuario: "Carla", pais: "Chile", hora: "09:00", accion: "Login exitoso", sospechoso: false },
  { usuario: "Luis", pais: "Chile", hora: "12:00", accion: "Subir tarea", sospechoso: false },
  { usuario: "Sofía", pais: "Argentina", hora: "09:15", accion: "Cambio de contraseña", sospechoso: false },
  { usuario: "Miguel", pais: "Venezuela", hora: "17:30", accion: "Acceso fuera de horario", sospechoso: true },
  { usuario: "Valentina", pais: "Bolivia", hora: "08:50", accion: "Login", sospechoso: false },
  { usuario: "Andrés", pais: "Paraguay", hora: "10:40", accion: "Intento de acceso a datos sensibles", sospechoso: true },
  { usuario: "Camila", pais: "Costa Rica", hora: "13:25", accion: "Actualización de contraseña", sospechoso: false }
    ],
    quiz: {
      pregunta: "¿Qué debes hacer si recibes un mensaje pidiendo tu contraseña?",
      opciones: [
        "Nunca compartirla y avisar a un adulto o profesor.",
        "Compartirla si parece urgente.",
        "Ignorar el mensaje."
      ],
      correcta: 0
    }
  }
];

export default levels;
