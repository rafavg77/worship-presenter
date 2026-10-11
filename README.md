# 🕊️ Sanación Sin Límites — Sistema de Proyección Worship v2.0 (Estilo ProPresenter)

Sistema web profesional de proyección de letras, biblias, medios y cuentas regresivas en tiempo real, diseñado especialmente para eventos en vivo, cultos y alabanza contemporánea en Ubuntu Linux.

Desarrollado para reproducir el flujo de trabajo de **ProPresenter 7** con sincronización instantánea vía WebSockets entre la laptop del operador, dispositivos móviles (celulares/tablets en la red local o por Internet) y la pantalla del proyector HDMI.

---

## 🚀 Nuevas Funcionalidades v2.0 (Estilo ProPresenter 7)

1. **📜 Playlists / Orden del Servicio**:
   - Organiza el culto completo: cuenta regresiva de inicio, flyers/fotos de anuncios, canciones de alabanza, versículos bíblicos y videos con audio.
   - Reordena los elementos con un solo clic (`▲` / `▼`), elimínalos o lánzalos directamente a pantalla.
   - Crea múltiples playlists (ej. *Servicio Domingo Mañana*, *Servicio Sanación*, etc.).

2. **📚 Catálogo Completo de Canciones con Buscador**:
   - Sección dedicada e independiente con el repertorio completo (`./songs/`).
   - Buscador en tiempo real por título, artista o fragmento de letra.
   - Botón directo `➕ Playlist` para armar la lista del servicio en segundos sin alterar el repertorio base.
   - Fondos en bucle independientes que no interfieren con las fotos o videos del programa.

3. **📖 Lectura y Proyección Bíblica Offline**:
   - **Reina Valera 1960 (RVR1960)** y **Reina Valera Actualizada (RVA)** pre-instaladas y listas para usar 100% sin conexión a internet.
   - Selector inteligente de los 66 libros canónicos, capítulos y versículos individuales o rangos (ej. `Juan 3:16` o `Salmos 23:1-4`).
   - Vista previa inmediata en tarjeta antes de enviar a pantalla.
   - Botón `📽️ Proyectar Versículo` (con tipografía de alto impacto y etiqueta dorada) y `➕ Al Playlist`.
   - Soporte para descargar versiones adicionales en línea (NTV, NVI).

4. **⏱️ Reloj Contador en Cuenta Regresiva**:
   - Configurable en **Horas, Minutos y Segundos** (por defecto en **5 minutos**).
   - Botones rápidos de preset: `1 min`, `3 min`, `5 min`, `10 min`, `15 min`.
   - Título personalizable (ej. *EL SERVICIO COMIENZA EN*) y mensaje de finalización (ej. *¡BIENVENIDOS!*).
   - Motor de tiempo sincronizado al milisegundo en el servidor Node.js (todos los operadores y el proyector muestran exactamente los mismos dígitos).
   - Controles de `Iniciar`, `Pausar`, `Reiniciar`, `📽️ Proyectar en Pantalla` y `➕ Al Playlist`.

5. **🖼️ Medios del Programa (Fotos y Videos con Audio)**:
   - Sección independiente para fotos, banners, anuncios, flyers y videos del programa.
   - Soporte para proyectar imágenes a pantalla completa sin letras.
   - Reproductor con barra de tiempo interactiva, volumen, reinicio y bucle para videos con audio.

6. **🎬 Fondos de Alabanza en Movimiento (Worship Loops)**:
   - Fondos silenciosos que corren fluidamente detrás de las letras de alabanza y las lecturas bíblicas.

7. **🌐 Túnel Cloudflare Integrado (Acceso Global)**:
   - Con un solo clic o parámetro en la terminal, expone el panel de control a Internet con HTTPS seguro para que cualquier persona controle las diapositivas desde cualquier red celular (4G/5G).

---

## ⚡ Canciones Pre-Cargadas (Setlist Sanación Sin Límites)

Incluye las 4 canciones del repertorio con la estructura oficial de Secuencias.com / MultiTracks y tonalidades configuradas:

1. **Jesucristo Basta** — Un Corazón *(Key: Ab | BPM: 69)*
2. **Quiero Conocer A Jesús (Yeshua)** — Generación 12 *(Key: G | BPM: 72)*
3. **Glorioso Día** — Passion feat. Kristian Stanfill *(Key: D | BPM: 110)*
4. **Gracias, Dios** — Essential Worship *(Key: C | BPM: 130)*

---

## 🚀 Inicio Rápido en Ubuntu

### 1. Clonar o Actualizar el Repositorio
```bash
git clone https://github.com/rafavg77/worship-presenter.git
cd worship-presenter

# Si ya lo tenías clonado:
git pull origin main
```

### 2. Instalar dependencias con `pnpm`
*(Por política del proyecto, siempre se utiliza `pnpm`)*
```bash
pnpm install
```

### 3. Iniciar el Servidor

**Modo Local / Red WiFi:**
```bash
pnpm start
```

**Modo con Túnel Cloudflare Público (acceso por Internet / datos móviles):**
```bash
pnpm run start:tunnel
```
*(O también: `node server.js --tunnel`)*

Al iniciar, la terminal te indicará las URLs disponibles:
```text
================================================================
   🕊️  SANACIÓN SIN LÍMITES - SISTEMA DE PROYECCIÓN WORSHIP 2.0  
================================================================
 💻 Panel de Control (Laptop):      http://localhost:3000
 📽️ Pantalla Proyector (HDMI):      http://localhost:3000/display
 📱 Control Remoto (Celular/WiFi):  http://192.168.X.X:3000
 🌐 Túnel Cloudflare:               https://xxxx.trycloudflare.com
================================================================
```

---

## 🖥️ Configuración de Pantalla Doble (Laptop + Proyector HDMI)

1. Conecta el cable HDMI de la laptop al proyector.
2. En la configuración de pantalla de Ubuntu, activa **"Extender Pantallas"** (no duplicar).
3. En la laptop, abre el navegador (Chrome, Brave, Firefox):
   - En la pantalla de tu laptop abre **`http://localhost:3000`** (Panel de Operador).
   - Haz clic en el botón superior derecho **`📽️ Pantalla HDMI`** o abre **`http://localhost:3000/display`**.
   - Arrastra esa ventana hacia el proyector HDMI y presiona **`F11`** para Pantalla Completa.

---

## 📱 Control Remoto Inalámbrico desde Celular o Tablet

- **Misma red WiFi**: Ingresa la IP de tu laptop que aparece en el botón **`📱 Red / Celular`** (ej. `http://192.168.68.68:3000`).
- **Por Internet / Datos Celulares**: Presiona **`⚡ Activar Túnel Cloudflare Ahora`** en el modal de Red para obtener la URL pública `https://...trycloudflare.com`.

---

## 📂 Estructura de Carpetas

```text
worship-presenter/
├── bibles/          # Biblias en formato JSON (rvr1960.json, rva.json)
├── media/           # Fotos de anuncios, flyers y videos de programa
├── playlists/       # Listas de servicio en JSON (servicio_sanacion.json)
├── songs/           # Letras de canciones estructuradas (.txt)
├── videos/          # Fondos worship en movimiento en bucle (.mp4)
├── public/
│   ├── css/         # Estilos profesionales (control.css, display.css)
│   ├── js/          # Lógica de sockets y renderizado (control.js, display.js)
│   ├── index.html   # Panel de control ProPresenter para operador
│   └── display.html # Ventana de salida para proyector HDMI
├── server.js        # Servidor Node.js + Express + Socket.IO + Cloudflare
└── package.json
```

---

## ⌨️ Atajos de Teclado (Laptop y Proyector)

| Tecla | Acción |
|---|---|
| <kbd>Barra Espaciadora</kbd> o <kbd>→</kbd> | Avanzar a la siguiente diapositiva |
| <kbd>←</kbd> o <kbd>Backspace</kbd> | Retroceder a la diapositiva anterior |
| <kbd>B</kbd> | Alternar Blackout (Pantalla Negra) |
| <kbd>C</kbd> | Alternar Limpiar Texto (Oculta texto y mantiene fondo) |
| <kbd>F11</kbd> | Pantalla completa en la ventana del proyector |

---

## 💡 Próximas Características Estilo ProPresenter 7

Consulta el panel y la documentación para futuras expansiones:
- **Monitor de Confianza para Músicos (Stage Display)** con acordes, letra actual y siguiente en tiempo real.
- **Salida Lower Thirds** transparente para transmisión en vivo (OBS / vMix).
- **Control MIDI / Companion** para sincronización con pedales, Stream Deck y Playback de Secuencias.com.
