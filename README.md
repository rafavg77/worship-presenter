# 🕊️ Sanación Sin Límites — Sistema de Proyección Worship (Estilo ProPresenter)

Sistema web profesional de proyección de letras y videos en tiempo real, diseñado especialmente para eventos en vivo, iglesias y alabanza contemporánea en Ubuntu Linux.

Desarrollado para reproducir el flujo de trabajo de **ProPresenter** con sincronización instantánea vía WebSockets entre la laptop del operador, dispositivos móviles (celulares/tablets en la red local) y la pantalla del proyector HDMI.

---

## ⚡ Canciones Pre-Cargadas (Setlist Sanación Sin Límites)

Incluye las 4 canciones del repertorio con la estructura oficial de Secuencias.com / MultiTracks y acordes/tonalidades configuradas:

1. **Jesucristo Basta** — Un Corazón *(Tonalidad: Ab | BPM: 69)*
2. **Quiero Conocer A Jesús (Yeshua)** — Generación 12 *(Tonalidad: G | BPM: 72)*
3. **Glorioso Día** — Passion feat. Kristian Stanfill *(Tonalidad: D | BPM: 110)*
4. **Gracias, Dios** — Essential Worship *(Tonalidad: C | BPM: 130)*

---

## 🚀 Inicio Rápido en Ubuntu

### 1. Clonar el repositorio
```bash
git clone https://github.com/rafavg77/worship-presenter.git
cd worship-presenter
```

### 2. Instalar dependencias con `pnpm`
*(Por política del proyecto, siempre se utiliza `pnpm`)*
```bash
pnpm install
```

### 3. Iniciar el servidor
```bash
pnpm start
```

Al iniciar, la terminal te mostrará un banner con las direcciones disponibles:
```text
================================================================
   🕊️  SANACIÓN SIN LÍMITES - SISTEMA DE PROYECCIÓN WORSHIP   
================================================================
 💻 Panel de Control (Laptop):      http://localhost:3000
 📽️ Pantalla Proyector (HDMI):      http://localhost:3000/display
 📱 Control Remoto (Celular/WiFi):  http://192.168.X.X:3000
================================================================
```

---

## 🖥️ Configuración de Pantalla Doble (Laptop + Proyector HDMI)

1. **Conecta tu cable HDMI** de la laptop al proyector.
2. En la configuración de pantalla de Ubuntu, asegúrate de tener activada la opción **"Extender Pantallas"** (no duplicar/espejo).
3. Abre tu navegador web favorito (Chrome, Firefox, Brave) en la laptop:
   - En la pantalla de tu laptop, abre: **`http://localhost:3000`** (Panel de Operador).
   - Haz clic en el botón superior derecho **`📽️ Pantalla HDMI`** o navega a **`http://localhost:3000/display`**.
   - Arrastra esa ventana hacia el proyector HDMI y presiona la tecla **`F11`** para ponerla en **Pantalla Completa**.

---

## 📱 Control Remoto Inalámbrico desde Celular o Tablet

Cualquier miembro del equipo de audio, músicos o pastores puede controlar o avanzar las canciones desde su celular:
1. Conecta el celular a la **misma red WiFi** de la laptop.
2. Abre el navegador del celular e ingresa la dirección IP que aparece en el botón **`📱 Red / Celular`** del panel (ejemplo: `http://192.168.68.68:3000`).
3. El panel es 100% responsivo: podrás pulsar directamente las diapositivas o usar los botones flotantes inferiores de **Anterior** / **Siguiente**.

---

## 🎛️ Características Estilo ProPresenter

- **Cuadrícula de Diapositivas (Slide Grid)**: Vista previa de todas las estrofas, pre-coros, coros y puentes con colores distintivos.
- **Salto Inmediato**: Haz clic en cualquier diapositiva para proyectarla al instante sin interrupciones.
- **Acciones Rápidas en Vivo**:
  - ⬛ **BLACKOUT (`Tecla B`)**: Pantalla negra total inmediata (útil para oraciones, momentos de ministración o transiciones).
  - 🚫 **LIMPIAR LETRA (`Tecla C`)**: Oculta el texto de la letra pero mantiene activo el fondo de video en movimiento.
  - ◀ **ANTERIOR (`Flecha Izquierda` / `RePág` / `Backspace`)**
  - ▶ **SIGUIENTE (`Barra Espaciadora` / `Flecha Derecha` / `AvPág`)**
- **Monitor de Confianza Integrado**: En la barra inferior puedes ver en tiempo real qué texto está en pantalla y qué texto viene a continuación.
- **Indicador de Conexión HDMI**: El panel te avisa con un punto verde cuando la ventana del proyector está abierta y recibiendo señal.

---

## 📂 Gestión de Canciones y Videos

### 🎵 Carpeta de Canciones (`./songs/`)
Las canciones se guardan como archivos de texto `.txt` editables. Puedes editarlas directamente con cualquier editor de texto o agregar nuevas desde el botón **`+`** del panel de control.

Formato simple:
```text
Title: Nombre de la Canción
Artist: Artista
Key: Tonalidad (ej. G)
BPM: Tempo (ej. 72)

[Verso 1]
Primera línea
Segunda línea

[Coro]
Línea del coro
Otra línea del coro

[Puente]
Línea del puente
```

### 🎬 Carpeta de Videos (`./videos/`)
- Coloca cualquier archivo de video en formato `.mp4` o `.webm` dentro de la carpeta `videos/` o súbelo directamente desde la pestaña **`🎬 Videos y Fondo`**.
- La aplicación ya incluye fondos de movimiento suaves preconfigurados (`fondo_worship_azul.mp4` y `fondo_worship_calido.mp4`).
- Al seleccionar un video, se reproduce en bucle continuo de fondo detrás de las letras en el proyector.

---

## ⌨️ Atajos de Teclado (Laptop y Proyector)

| Tecla | Acción |
|---|---|
| <kbd>Barra Espaciadora</kbd> o <kbd>→</kbd> | Avanzar a la siguiente diapositiva |
| <kbd>←</kbd> o <kbd>Backspace</kbd> | Retroceder a la diapositiva anterior |
| <kbd>B</kbd> | Alternar Blackout (Pantalla Negra) |
| <kbd>C</kbd> | Alternar Limpiar Letra (Ocultar/Mostrar texto) |
| <kbd>F11</kbd> | Pantalla completa en el proyector |

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** con soporte ES Modules
- **Express.js** para servicio web HTTP y streaming de video
- **Socket.IO** para sincronización bidireccional sub-milisegundo
- **Vanilla Modern JS / CSS Grid** optimizado para bajo consumo de memoria y CPU
- Tipografía **Montserrat** de alto contraste con sombras diseñadas para proyectores de alto brillo.
