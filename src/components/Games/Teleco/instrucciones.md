# 📊 EspectroGame - Juego de Sintonización de Espectro

## 🎯 Descripción del Juego

EspectroGame es un juego educativo diseñado para enseñar conceptos fundamentales de telecomunicaciones a través de la sintonización de espectros de frecuencia. Los jugadores deben ajustar parámetros de señal para alcanzar objetivos específicos mientras observan un espectrograma en tiempo real.

## 🕹️ Cómo Jugar

### Controles Principales

1. **Frecuencia (MHz)**: Ajusta la frecuencia de la señal objetivo usando el control deslizante
2. **Potencia (dBm)**: Modifica la potencia de transmisión de la señal
3. **Ancho de Banda (MHz)**: Controla el ancho del espectro de la señal
4. **Verificar Sintonización**: Botón para validar si los parámetros son correctos
5. **Reiniciar**: Limpia el espectrograma y reinicia el juego

### Espectrograma

- **Eje X (Horizontal)**: Representa el tiempo (ventana de 15 segundos)
- **Eje Y (Vertical)**: Representa la frecuencia (0-3000 Hz)
- **Colores**: Intensidad de la señal (azul = baja intensidad, rojo/amarillo = alta intensidad)
- **Línea Punteada Blanca**: Indica la frecuencia objetivo que debes sintonizar

## 🎮 Mecánica del Juego

### Objetivo por Nivel

Cada nivel presenta objetivos específicos que debes cumplir simultáneamente:

1. **Frecuencia**: Sintonizar la frecuencia exacta mostrada como objetivo
2. **Potencia**: Ajustar la potencia al valor requerido (varía por nivel)
3. **Ancho de Banda**: Configurar el ancho de banda correcto (varía por nivel)
4. **SNR (Signal-to-Noise Ratio)**: Mantener una relación señal-ruido ≥ 20 dB

### Progresión de Niveles

**Nivel 1**: Enfoque en frecuencia y conceptos básicos
- Frecuencia objetivo: Banda WiFi 2.4 GHz
- Objetivos: Frecuencia + Ancho de banda + Potencia aleatoria

**Nivel 2**: Mayor complejidad en múltiples parámetros
- Frecuencia objetivo: Banda Bluetooth + WiFi
- Objetivos: Frecuencia + Ancho de banda + Potencia aleatoria

**Nivel 3**: Máxima dificultad con precisión extrema
- Frecuencia objetivo: Banda GSM 900
- Objetivos: Frecuencia + Ancho de banda + Potencia aleatoria

### Sistema de Puntuación

- **Puntos Base**: 100 puntos por nivel completado
- **Penalización**: -2 puntos por cada MHz de error en frecuencia
- **FLAG**: Al completar cada nivel recibes un FLAG único: `FLAG{SPECTRUM_MASTER_L[NIVEL]_[PUNTUACIÓN]}`

## ⚡ Consejos y Estrategias

1. **Observa el Espectrograma**: La visualización en tiempo real te ayuda a entender cómo tus ajustes afectan la señal
2. **Ajusta Gradualmente**: Pequeños cambios son más precisos que grandes saltos
3. **Prioriza la SNR**: Asegúrate de mantener una buena relación señal-ruido
4. **Usa la Línea Guía**: La línea punteada blanca te muestra exactamente dónde debe estar tu señal
5. **Verifica Frecuentemente**: Usa el botón "Verificar Sintonización" para obtener retroalimentación

## 🏛️ Requisitos para Desbloquear TELECO

### ⚠️ Restricción Importante

Para poder seleccionar el **Pilar de TELECO** en el Templo, debes:

✅ **Completar exitosamente los 3 niveles de EspectroGame**

### ¿Por qué esta restricción?

El pilar de TELECO representa el dominio de conceptos avanzados de telecomunicaciones. Completar los 3 niveles demuestra que has adquirido las competencias fundamentales en:

- Análisis espectral
- Sintonización de frecuencias
- Control de potencia
- Gestión de ancho de banda
- Optimización de SNR

### Estado del Progreso

- 🔒 **Bloqueado**: El botón de TELECO aparece gris y deshabilitado
- 🔓 **Desbloqueado**: Tras completar el nivel 3, el pilar se vuelve seleccionable
- 💾 **Persistencia**: Tu progreso se guarda automáticamente en el navegador

## 🎓 Conceptos Educativos

### Qué Aprenderás

- **Espectro de Frecuencias**: Cómo las señales ocupan diferentes bandas
- **Análisis Espectral**: Interpretación de espectrogramas reales
- **Parámetros de RF**: Frecuencia, potencia, ancho de banda y su interrelación
- **Calidad de Señal**: SNR y su impacto en las comunicaciones
- **Bandas de Telecomunicaciones**: WiFi, Bluetooth, GSM, LTE, 5G

### Aplicaciones Reales

- Diseño de sistemas de comunicación
- Optimización de redes inalámbricas
- Análisis de interferencias
- Certificación de equipos RF
- Planificación de espectro radioeléctrico

## 🚀 ¡Comienza tu Aventura!

1. Haz clic en "▶️ Iniciar Juego"
2. Observa los objetivos del nivel actual
3. Ajusta los controles mientras observas el espectrograma
4. Verifica tu sintonización
5. ¡Avanza al siguiente nivel!

**¡Demuestra tu maestría en el espectro y desbloquea el poder del pilar de TELECO!** 📡✨