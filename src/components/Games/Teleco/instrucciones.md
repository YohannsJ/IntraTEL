# 📡 EspectroGame - Maestría del Espectro Electromagnético

## 🎯 Descripción del Juego

EspectroGame es un simulador educativo interactivo de 3 niveles progresivos que enseña los fundamentos de las telecomunicaciones y análisis del espectro radioeléctrico. Cada nivel presenta desafíos únicos que van desde sintonización básica hasta cálculos avanzados de ingeniería RF.

## 🕹️ Cómo Jugar

### Controles por Nivel

**Nivel 1 - Sintonización Manual:**
1. **📡 Deslizador de Frecuencia**: Ajusta manualmente para alcanzar la frecuencia objetivo (rango WiFi 2.4 GHz: 2400-2485 MHz)
2. **⚡ Control de Potencia**: Modifica la potencia de transmisión (-10 a +50 dBm)
3. **📶 Ancho de Banda**: Ajusta el ancho del espectro (1-40 MHz)
4. **🎯 Objetivo**: Sintonizar exactamente en la frecuencia objetivo mostrada

**Nivel 2 - Identificación de Bandas:**
1. **📡 Botones de Banda**: Selecciona la banda correcta entre múltiples opciones
2. **⚡ Control de Potencia**: Ajusta la potencia según requerimientos del sistema
3. **📶 Ancho de Banda**: Optimiza el ancho de banda para la aplicación
4. **🎯 Objetivo**: Identifica correctamente la banda correspondiente a la frecuencia mostrada

**Nivel 3 - Cálculos Avanzados:**
1. **📊 Campo de Ancho de Banda**: Calcula el ancho de banda mínimo usando el Teorema de Nyquist
2. **⚡ Campo de Potencia**: Calcula la potencia requerida considerando distancia y pérdidas
3. **✨ Parámetros del Sistema**: Tasa de datos (Mbps) y distancia (km) dados
4. **🎯 Objetivo**: Aplicar fórmulas de ingeniería RF para calcular parámetros óptimos

**Controles Comunes:**
- **✅ Verificar**: Valida si cumples todos los objetivos del nivel actual
- **🔄 Reiniciar Juego**: Reinicia completamente al nivel 1
- **▶️ Continuar**: Avanza al siguiente nivel tras completar el actual
- **▶️/⏸️ Espectrograma**: Activa/pausa la visualización en tiempo real

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

**Nivel 1 - Sintonización Manual:**
- **Objetivo**: Sintonizar manualmente la frecuencia exacta dentro de la banda WiFi 2.4 GHz (2400-2485 MHz)
- **Mecánica**: Usa el deslizador de frecuencia para alcanzar la frecuencia objetivo específica
- **Tolerancia**: Debes estar dentro de ±5 MHz del objetivo
- **Duración**: El nivel se completa al alcanzar la frecuencia correcta

**Nivel 2 - Identificación de Bandas:**
- **Objetivo**: Identificar correctamente la banda de telecomunicaciones correspondiente a una frecuencia dada
- **Mecánica**: Se muestra una frecuencia y debes seleccionar la banda correcta de las opciones disponibles
- **Bandas Incluidas**: Bluetooth, WiFi 5 GHz, UMTS 2100, LTE 800
- **Verificación**: Debes seleccionar la banda exacta que contiene la frecuencia mostrada

**Nivel 3 - Cálculos de Ingeniería RF:**
- **Objetivo**: Calcular parámetros del sistema usando fórmulas reales de telecomunicaciones
- **Datos Proporcionados**: Tasa de datos requerida (20-80 Mbps) y distancia del enlace (1-5 km)
- **Cálculos Requeridos**: Ancho de banda mínimo y potencia de transmisión óptima
- **Tolerancia**: ±2 MHz para ancho de banda, ±2 dBm para potencia

### Fórmulas del Nivel 3:

**Teorema de Nyquist (Ancho de Banda Mínimo):**
- `B_min = R ÷ 2`
- Donde: B = Ancho de banda mínimo (MHz), R = Tasa de datos (Mbps)
- Ejemplo: Para 40 Mbps → B_min = 40 ÷ 2 = 20 MHz

**Cálculo de Potencia con Pérdidas por Distancia:**
- `P_total = P_base + 10 × log10(d)`
- Donde: P_base = 10 dBm, d = distancia (km)
- Ejemplo: Para 2 km → P_total = 10 + 10 × log10(2) = 13 dBm
- Esta fórmula simplificada simula las pérdidas por propagación en función de la distancia

### Bandas de Frecuencia por Nivel

**Nivel 1 - Sintonización en WiFi 2.4 GHz:**
- **WiFi 2.4 GHz** (2400-2485 MHz): Banda ISM utilizada para Wi-Fi 802.11b/g/n
- **Objetivo**: Sintonizar en una frecuencia específica dentro de este rango
- **Aplicaciones**: Redes Wi-Fi domésticas, IoT, dispositivos inteligentes

**Nivel 2 - Identificación de Bandas Móviles:**
- **Bluetooth** (2400-2485 MHz): Comunicaciones de corto alcance, misma banda ISM que WiFi
- **WiFi 5 GHz** (5150-5825 MHz): Wi-Fi de alta velocidad 802.11a/n/ac/ax
- **UMTS 2100** (1920-2170 MHz): Redes celulares 3G en Europa y Asia
- **LTE 800** (791-862 MHz): LTE banda 20, cobertura rural y penetración en edificios
- **Desafío**: Identificar correctamente la banda que contiene la frecuencia mostrada

**Nivel 3 - Cálculos con Bandas LTE:**
- **LTE 700** (694-790 MHz): Banda de baja frecuencia para máxima cobertura
- **LTE 800** (791-862 MHz): Banda europea para cobertura rural extendida
- **LTE 1800** (1710-1880 MHz): Banda de capacidad media para áreas urbanas
- **LTE 2600** (2500-2690 MHz): Banda de alta capacidad para centros urbanos
- **5G Sub-6** (3400-3800 MHz): Bandas medias 5G para balance cobertura-capacidad
- **Objetivo**: Aplicar cálculos de ingeniería RF en estas bandas profesionales

**Bandas Adicionales del Sistema:**
- **GSM 900** (880-960 MHz): Red celular 2G clásica
- **GSM 1800** (1710-1880 MHz): DCS-1800, extensión europea de GSM
- **FM Radio** (87.5-108 MHz): Radiodifusión en frecuencia modulada
- **WiFi 2.4 GHz** (2400-2485 MHz): También utilizada para Bluetooth y ZigBee

🏆 **Cada nivel genera desafíos aleatorios** para máxima rejugabilidad

### Sistema de Puntuación y Recompensas

🏅 **Puntuación por Nivel:**
- **Nivel 1**: 100 puntos base por completar sintonización
- **Nivel 2**: 200 puntos base por identificación correcta de banda
- **Nivel 3**: 300 puntos base por cálculos precisos de ingeniería

**Bonificaciones:**
- **🎯 Precisión de Frecuencia**: +20 puntos por error < 1 MHz
- **📶 SNR Excelente**: +10 puntos por SNR ≥ 25 dB
- **⚡ Velocidad**: +20 puntos por completar en < 30 segundos
- **🎖️ Eficiencia**: +15 puntos por completar en < 3 intentos
- **🔥 Racha Perfecta**: +50 puntos por completar 3 niveles consecutivos sin error

**Penalizaciones:**
- **❌ Errores de Frecuencia**: -2 puntos por cada MHz de desviación
- **⏱️ Tiempo Excesivo**: -1 punto por cada 10 segundos adicionales después de 60s

🏴 **FLAGS Progresivas**: 
- Nivel 1: `FLAG{SPECTRUM_TUNER_L1}`
- Nivel 2: `FLAG{BAND_IDENTIFIER_L2}`  
- Nivel 3: `FLAG{RF_ENGINEER_L3}`

🏆 **Sistema de Logros Desbloqueables** (10 total):
- **🏆 Primera Victoria**: Completa tu primer nivel
- **🏃 Corredor de Velocidad**: Completa cualquier nivel en < 30 segundos
- **🎯 Sintonización Perfecta**: Mantén SNR ≥ 25 dB durante una verificación
- **🥇 Maestro Nivel 1**: Domina la sintonización manual
- **🥈 Maestro Nivel 2**: Experto en identificación de bandas  
- **🥉 Maestro Nivel 3**: Ingeniero RF certificado
- **💯 Completista**: Termina los 3 niveles en una sesión
- **🔬 Experto en Precisión**: Logra error de frecuencia < 1 MHz
- **⚡ Eficiencia**: Completa un nivel en menos de 3 intentos
- **🔥 Maestro de Rachas**: 3 niveles perfectos consecutivos

## ⚡ Consejos y Estrategias

### Estrategias por Nivel

**Nivel 1 - Sintonización Manual:**
1. **🎯 Ajustes Finos**: Usa movimientos pequeños del deslizador cerca del objetivo
2. **� Observa el Espectrograma**: La señal se centra cuando estás en la frecuencia correcta
3. **⏱️ Velocidad vs Precisión**: Tómate tiempo para ajustes precisos, la velocidad viene con práctica

**Nivel 2 - Identificación de Bandas:**
1. **📚 Memoriza Rangos**: Conoce las frecuencias típicas de cada banda
2. **� Analiza la Frecuencia**: Compara con los rangos conocidos antes de seleccionar
3. **⚡ Decisión Rápida**: Una vez identificada, selecciona inmediatamente

**Nivel 3 - Cálculos Avanzados:**
1. **🧮 Usa las Fórmulas**: B_min = R/2 y P_total = 10 + 10×log10(d)
2. **🎯 Precisión Matemática**: Calcula exactamente, no aproximes
3. **� Verifica Cálculos**: Revisa tus cálculos antes de ingresar valores

### Consejos Generales

4. **📶 Mantén SNR Alto**: Ajusta potencia y ancho de banda para SNR ≥ 20 dB
5. **� Usa el Feedback Visual**: Los indicadores de color muestran tu progreso
6. **💡 Aprende de Errores**: Las pistas después de fallar son valiosas
7. **🔄 Practica**: Cada nivel genera desafíos diferentes, práctica múltiples rondas
8. **⚡ Optimiza para Logros**: Velocidad < 30s, precisión < 1 MHz, eficiencia < 3 intentos

## 🏛️ Requisitos para Desbloquear TELECO

### ⚠️ Restricción Importante

Para poder activar el **Pilar de TELECO** en el Templo de Telemática, debes:

✅ **Completar exitosamente los 3 niveles consecutivos de EspectroGame**

### ¿Por qué esta restricción?

El pilar de TELECO representa el dominio completo de los fundamentos de telecomunicaciones. Completar la progresión completa demuestra que has adquirido competencias esenciales en:

- **🎯 Sintonización Manual**: Precisión en ajustes de frecuencia
- **🔍 Identificación de Bandas**: Conocimiento del espectro radioeléctrico  
- **📐 Cálculos de Ingeniería**: Aplicación de fórmulas RF profesionales
- **📊 Análisis Espectral**: Interpretación de espectrogramas
- **⚙️ Optimización de Sistemas**: Control de potencia, ancho de banda y SNR

### Estado del Progreso

- 🔒 **Pilar Bloqueado**: Requiere completar secuencialmente niveles 1 → 2 → 3
- 🔄 **Progreso Parcial**: Los niveles individuales se guardan, pero requieres completar la secuencia completa
- 🔓 **Pilar Desbloqueado**: Tras completar nivel 3, el pilar TELECO se enciende permanentemente
- 💾 **Persistencia Total**: Progreso, logros y flags se guardan automáticamente

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

### Pasos para Iniciar:
1. **▶️ Haz clic en "Iniciar Juego"** para generar el primer desafío
2. **👀 Lee los objetivos específicos** mostrados para el nivel actual
3. **🎮 Interactúa con los controles** según el tipo de nivel:
   - **Nivel 1**: Ajusta el deslizador de frecuencia
   - **Nivel 2**: Selecciona la banda correcta con los botones
   - **Nivel 3**: Calcula y ingresa valores numéricos
4. **📊 Observa el espectrograma** para feedback visual en tiempo real
5. **✅ Verifica tu solución** cuando creas tener los parámetros correctos
6. **▶️ Continúa al siguiente nivel** tras completar exitosamente
7. **🏆 Desbloquea logros** y acumula puntuación por tu desempeño

### Tutorial Interactivo
- **🎓 Primera vez**: El juego incluye un tutorial paso a paso
- **💡 Pistas contextuales**: Ayuda específica después de errores
- **📈 Progreso visual**: Indicadores de estado en tiempo real

**¡Domina los 3 niveles del espectro electromagnético y desbloquea el poder del pilar TELECO!** 📡⚡✨
