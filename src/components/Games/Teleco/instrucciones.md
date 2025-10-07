# 🌐 EspectroGame - Juego Multinivel del Espectro Electromagnético

## 🎯 Descripción del Juego

EspectroGame es un juego educativo interactivo de 3 niveles diseñado para enseñar diferentes aspectos de las telecomunicaciones. Cada nivel presenta una mecánica diferente, desde sintonización manual hasta cálculos avanzados con el teorema de Nyquist.

## 🕹️ Cómo Jugar

### Controles por Nivel

**Nivel 1 - Sintonización Manual:**
1. **📡 Control de Frecuencia**: Deslizador para ajustar la frecuencia manualmente
2. **⚡ Potencia de Señal (dBm)**: Modifica la potencia de transmisión (-10 a +10 dBm)
3. **📶 Ancho de Banda (MHz)**: Controla el ancho del espectro de la señal (1-40 MHz)

**Nivel 2 - Identificación de Bandas:**
1. **📡 Selección de Banda**: Botones para seleccionar la banda correcta de telecomunicaciones
2. **⚡ Potencia de Señal (dBm)**: Modifica la potencia de transmisión (-10 a +10 dBm)
3. **📶 Ancho de Banda (MHz)**: Controla el ancho del espectro de la señal (1-40 MHz)

**Nivel 3 - Cálculos Avanzados:**
1. **📊 Ancho de Banda Calculado**: Campo numérico para ingresar cálculo basado en Nyquist
2. **⚡ Potencia Calculada**: Campo numérico para calcular potencia requerida
3. **📶 Parámetros SNR**: Mantener relación señal-ruido óptima

**Controles Comunes:**
4. **✅ Verificar**: Valida si has completado correctamente el desafío del nivel
5. **🔄 Reiniciar**: Reinicia el juego completo al nivel 1
6. **▶️/⏸️ Espectrograma**: Activa/pausa la visualización en tiempo real - Identificador de Bandas de Frecuencia

## 🎯 Descripción del Juego

EspectroGame es un juego educativo interactivo diseñado para enseñar la identificación de bandas de frecuencia en telecomunicaciones. Los jugadores deben identificar qué banda de telecomunicaciones corresponde a una frecuencia dada, mientras ajustan parámetros de señal y observan un espectrograma en tiempo real.

## 🕹️ Cómo Jugar

### Controles Principales

1. **📡 Selección de Banda**: Botones para seleccionar la banda correcta de telecomunicaciones
2. **⚡ Potencia de Señal (dBm)**: Modifica la potencia de transmisión (-10 a +10 dBm)
3. **📶 Ancho de Banda (MHz)**: Controla el ancho del espectro de la señal (1-40 MHz)
4. **✅ Verificar Identificación**: Valida si has identificado correctamente la banda
5. **🔄 Reiniciar**: Reinicia el juego completo al nivel 1
6. **▶️/⏸️ Espectrograma**: Activa/pausa la visualización en tiempo real

### Espectrograma Interactivo

- **Eje X (Horizontal)**: Representa el tiempo (ventana de 15 segundos)
- **Eje Y (Vertical)**: Representa la frecuencia (600-3000 MHz)
- **Colores**: Intensidad de la señal (azul = baja, verde/amarillo = media, rojo = alta intensidad)
- **Visualización Tiempo Real**: Muestra cómo tus ajustes afectan la señal instantáneamente
- **Ruido de Fondo**: Nivel de -90 dBm para simular condiciones reales

## 🎮 Mecánica del Juego

### Objetivos por Nivel

Cada nivel presenta desafíos progresivos que debes cumplir simultáneamente:

🎯 **Objetivos Principales:**

1. **Identificación de Banda**: Identifica correctamente qué banda de telecomunicaciones corresponde a la frecuencia mostrada
2. **Control de Potencia**: Configura la potencia al valor requerido (aleatorio por nivel)
3. **Optimización de Ancho de Banda**: Ajusta el ancho de banda correcto (aleatorio por nivel)  
4. **Calidad SNR**: Mantiene una relación señal-ruido ≥ 20 dB para óptima transmisión

### Progresión de Niveles (3 Niveles)

**Nivel 1 - Sintonización Manual**: Ajusta la frecuencia manualmente para alcanzar el objetivo (WiFi 2.4 GHz)

**Nivel 2 - Identificación de Bandas**: Identifica qué banda corresponde a una frecuencia dada (GSM, UMTS, LTE)

**Nivel 3 - Cálculos Avanzados**: Aplica el teorema de Nyquist y la fórmula de Friis para calcular ancho de banda y potencia de transmisión

### Fórmulas del Nivel 3:

**Teorema de Nyquist (Ancho de Banda):**
- `B ≥ R/2`
- Donde: B = Ancho de banda (MHz), R = Tasa de datos (Mbps)
- Rango permitido: 1-40 MHz

**Fórmula de Friis (Potencia de Transmisión):**
- `P_tx = P_rx + L_path - G_tx - G_rx + Margin`
- `L_path = 32.45 + 20*log10(d_km) + 20*log10(f_MHz)`
- Donde: d = distancia (km), f = frecuencia (MHz)
- Consideraciones: Sensibilidad receptor = -100 dBm, Ganancia antenas = 3 dBi, Margen = 10 dB

### Bandas de Frecuencia por Nivel

**Nivel 1:**
- **WiFi 2.4 GHz** (2400-2485 MHz): Banda ISM para Wi-Fi y Bluetooth

**Nivel 2:**
- **GSM 900** (880-960 MHz): Red celular 2G en Europa y Asia
- **GSM 1800** (1710-1880 MHz): DCS-1800, extensión de GSM
- **UMTS 2100** (1920-2170 MHz): Redes 3G en Europa
- **LTE 700** (694-790 MHz): LTE banda 700 MHz
- **LTE 800** (791-862 MHz): LTE banda 800 MHz

**Nivel 3:**
- **Bandas LTE** (1800-2600 MHz): Varias bandas para cálculos de enlace
- **Bluetooth** (2400-2485 MHz): Misma banda ISM que WiFi 2.4 GHz
- **GSM 900** (880-960 MHz): Red celular 2G en Europa y Asia
- **GSM 1800** (1710-1880 MHz): DCS-1800, extensión de GSM
- **UMTS 2100** (1920-2170 MHz): Redes 3G en Europa
- **LTE** (varias bandas): 700, 800, 1800, 2600 MHz para redes 4G
- **5G Sub-6** (3400-3800 MHz): Bandas medias para 5G
- **FM Radio** (87.5-108 MHz): Radiodifusión en frecuencia modulada

🏆 **Cada nivel tiene objetivos aleatorios** para mayor rejugabilidad

### Sistema de Puntuación y Recompensas

🏅 **Puntuación:**

- **Puntos Base**: 100 puntos por nivel completado  
- **Penalización**: -2 puntos por cada MHz de error en frecuencia
- **Bonus de Precisión**: +10 puntos por SNR > 25 dB
- **Bonus de Velocidad**: +20 puntos por completar en < 30 segundos

🏴 **FLAGS Únicas**: `FLAG{SPECTRUM_MASTER_L[NIVEL]}`

🏆 **Sistema de Logros**: 10 logros desbloqueables incluyendo:

- Primera Victoria.
- Corredor de Velocidad.
- Sintonización Perfecta.
- Maestro Nivel 1.
- Maestro Nivel 2.
- Maestro Nivel 3.
- Completista.
- Experto en Precisión.
- Eficiencia.
- Maestro de Rachas.

## ⚡ Consejos y Estrategias

1. **👀 Observa el Espectrograma**: La visualización en tiempo real muestra el impacto inmediato de tus ajustes
2. **🐌 Ajusta Gradualmente**: Movimientos pequeños y precisos son mejor que saltos grandes
3. **📶 Prioriza la SNR**: Mantén siempre la relación señal-ruido por encima de 20 dB
4. **🎯 Usa el Feedback Visual**: El círculo de estado cambia de color según tu precisión
5. **💡 Solicita Pistas**: Si fallas, el juego te mostrará pistas específicas para mejorar
6. **⏱️ Optimiza Tiempo**: Los logros de velocidad requieren completar niveles en menos de 30s

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

### 🎓 Qué Aprenderás

**Conceptos Fundamentales:**

- 🌊 **Espectro de Frecuencias**: Cómo las señales ocupan bandas específicas
- 📊 **Análisis Espectral**: Interpretación de espectrogramas profesionales
- ⚙️ **Parámetros RF**: Frecuencia, potencia, ancho de banda y su sinergia
- 📶 **Calidad de Señal**: SNR, ruido y su impacto en comunicaciones
- 📡 **Bandas de Telecomunicaciones**: WiFi, Bluetooth, GSM, LTE, 5G

**Aplicaciones Profesionales:**

- 🚀 Diseño de sistemas de comunicación avanzados
- 🌐 Optimización de redes inalámbricas
- 🔍 Análisis y mitigación de interferencias
- 📜 Certificación de equipos RF
- 📊 Planificación del espectro radioeléctrico

## 🚀 Comienza tu Aventura

1. Haz clic en "▶️ Iniciar Juego"
2. Observa los objetivos del nivel actual
3. Ajusta los controles mientras observas el espectrograma
4. Verifica tu sintonización
5. ¡Avanza al siguiente nivel!

**Demuestra tu maestría en la identificación de bandas y desbloquea el poder del pilar de TELECO** 📡✨
