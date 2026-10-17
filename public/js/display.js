// Socket connection for Display client
const socket = io({
  query: { type: 'display' }
});

// DOM Elements
const slideContainer = document.getElementById('slide-container');
const slideText = document.getElementById('slide-text');
const blackoutLayer = document.getElementById('blackout-layer');
const bgVideo = document.getElementById('bg-video');
const bgAmbient = document.getElementById('bg-ambient');
const contentLayer = document.getElementById('content-layer');

// Layers for ProPresenter Media Modes
const programImageContainer = document.getElementById('program-image-container');
const programImage = document.getElementById('program-image');

const bibleContainer = document.getElementById('bible-container');
const bibleText = document.getElementById('bible-text');
const bibleReference = document.getElementById('bible-reference');
const bibleVersionTag = document.getElementById('bible-version-tag');

const countdownContainer = document.getElementById('countdown-container');
const countdownTitle = document.getElementById('countdown-title');
const countdownDigits = document.getElementById('countdown-digits');
const countdownEndMsg = document.getElementById('countdown-end-msg');

const fgVideoContainer = document.getElementById('fg-video-container');
const fgVideo = document.getElementById('fg-video');
const audioUnlockBanner = document.getElementById('audio-unlock-banner');
const btnFullscreen = document.getElementById('btn-fullscreen');
const hudBar = document.getElementById('hud-bar');
const hudStatus = document.getElementById('hud-status');

let currentSlideContent = '';
let currentBgVideoSrc = '';
let currentFgVideoSrc = '';
let currentImageSrc = '';
let hudTimeout = null;
let lastTimeUpdate = 0;

// Format seconds to HH:MM:SS or MM:SS
function formatTimerDigits(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Unlock audio on user interaction
function unlockAudio() {
  audioUnlockBanner.classList.add('hidden');
  if (fgVideo && !fgVideo.paused) {
    fgVideo.muted = false;
  }
}
window.addEventListener('click', unlockAudio);
audioUnlockBanner.addEventListener('click', unlockAudio);

// Fullscreen Toggle
btnFullscreen.addEventListener('click', () => {
  unlockAudio();
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn('Error enabling fullscreen:', err);
    });
  } else {
    document.exitFullscreen().catch(err => {
      console.warn('Error exiting fullscreen:', err);
    });
  }
});

// Auto-hide HUD bar
function showHudTemporarily() {
  hudBar.classList.add('visible');
  if (hudTimeout) clearTimeout(hudTimeout);
  hudTimeout = setTimeout(() => {
    hudBar.classList.remove('visible');
  }, 2500);
}
window.addEventListener('mousemove', showHudTemporarily);

// Foreground video time update and ended listeners
fgVideo.addEventListener('timeupdate', () => {
  const now = Date.now();
  if (now - lastTimeUpdate > 400) {
    lastTimeUpdate = now;
    socket.emit('sync-video-time', {
      currentTime: fgVideo.currentTime,
      duration: fgVideo.duration || 0
    });
  }
});

fgVideo.addEventListener('ended', () => {
  socket.emit('foreground-video-ended');
});

// Real-time Countdown updates from server
socket.on('countdown-tick', (data) => {
  if (data && typeof data.remainingSeconds === 'number') {
    countdownDigits.innerText = formatTimerDigits(data.remainingSeconds);
    if (data.remainingSeconds <= 0) {
      countdownDigits.classList.add('hidden');
      countdownEndMsg.classList.remove('hidden');
    } else {
      countdownDigits.classList.remove('hidden');
      countdownEndMsg.classList.add('hidden');
    }
  }
});

socket.on('countdown-ended', () => {
  countdownDigits.classList.add('hidden');
  countdownEndMsg.classList.remove('hidden');
});

// Apply global state from server
function applyState(state) {
  if (!state) return;

  // 1. Blackout
  if (state.isBlackout) {
    blackoutLayer.classList.add('active');
  } else {
    blackoutLayer.classList.remove('active');
  }

  // 2. Clear Text flag
  const customSlideContainer = document.getElementById('custom-slide-container');
  const customSlideBg = document.getElementById('custom-slide-bg');
  const customSlideOverlay = document.getElementById('custom-slide-overlay');
  const customSlideContent = document.getElementById('custom-slide-content');
  const customSlideTitle = document.getElementById('custom-slide-title');
  const customSlideBody = document.getElementById('custom-slide-body');

  if (state.isTextCleared) {
    slideContainer.classList.add('hidden');
    bibleContainer.classList.add('hidden');
    if (customSlideContent) customSlideContent.classList.add('hidden');
  } else {
    slideContainer.classList.remove('hidden');
    if (customSlideContent) customSlideContent.classList.remove('hidden');
    if (state.mediaMode === 'bible') {
      bibleContainer.classList.remove('hidden');
    }
  }

  // 3. Theme & Font Size
  document.body.className = `theme-${state.theme || 'cinematic'} font-size-${state.fontSize || 'medium'}`;

  // 4. Background Video (Loop behind lyrics, bible, countdown, and custom when bgType === 'video')
  const cs = state.currentCustomSlide;
  const isCustomVideoBg = state.mediaMode === 'custom' && cs && cs.bgType === 'video' && cs.bgValue;
  const activeBgVideoUrl = isCustomVideoBg ? cs.bgValue : state.currentVideo;
  const shouldPlayBgVideo = ['lyrics', 'bible', 'countdown'].includes(state.mediaMode) || isCustomVideoBg;

  if (activeBgVideoUrl && shouldPlayBgVideo) {
    if (currentBgVideoSrc !== activeBgVideoUrl) {
      currentBgVideoSrc = activeBgVideoUrl;
      bgVideo.src = activeBgVideoUrl;
      bgVideo.load();
      bgVideo.play().catch(e => console.log('Video loop autoplay prevented:', e));
      bgVideo.classList.add('active');
      bgAmbient.classList.add('hidden');
    }
    bgVideo.muted = true;
    if (state.videoPlaying) {
      if (bgVideo.paused) bgVideo.play().catch(() => {});
    } else {
      if (!bgVideo.paused) bgVideo.pause();
    }
  } else if (!activeBgVideoUrl || !shouldPlayBgVideo) {
    if (currentBgVideoSrc !== '') {
      currentBgVideoSrc = '';
      bgVideo.pause();
      bgVideo.removeAttribute('src');
      bgVideo.classList.remove('active');
      bgAmbient.classList.remove('hidden');
    }
  }

  // 5. Media Mode Switcher
  const mode = state.mediaMode || 'lyrics';
  if (customSlideContainer && mode !== 'custom') {
    customSlideContainer.classList.add('hidden');
  }

  // --- MODE: VIDEO CON AUDIO (Stand-alone video) ---
  if (mode === 'video' && state.foregroundVideo && state.foregroundVideo.url) {
    hudStatus.innerText = 'VIDEO EN VIVO';
    fgVideoContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');
    programImageContainer.classList.add('hidden');
    bibleContainer.classList.add('hidden');
    countdownContainer.classList.add('hidden');

    if (currentFgVideoSrc !== state.foregroundVideo.url) {
      currentFgVideoSrc = state.foregroundVideo.url;
      fgVideo.src = state.foregroundVideo.url;
      fgVideo.load();
    }

    fgVideo.volume = typeof state.foregroundVideo.volume === 'number' ? state.foregroundVideo.volume : 1.0;
    fgVideo.muted = !!state.foregroundVideo.muted;
    fgVideo.loop = !!state.foregroundVideo.loop;

    if (state.foregroundVideo.playing) {
      const playPromise = fgVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn('Autoplay with sound blocked:', err);
          audioUnlockBanner.classList.remove('hidden');
        });
      }
    } else {
      if (!fgVideo.paused) fgVideo.pause();
    }
    return;
  } else {
    fgVideoContainer.classList.add('hidden');
    audioUnlockBanner.classList.add('hidden');
    if (!fgVideo.paused) fgVideo.pause();
  }

  // --- MODE: OBJETO EDITABLE / DIAPOSITIVA PERSONALIZADA ---
  if (mode === 'custom' && cs && customSlideContainer) {
    hudStatus.innerText = 'DISEÑO EN VIVO';
    customSlideContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');
    programImageContainer.classList.add('hidden');
    bibleContainer.classList.add('hidden');
    countdownContainer.classList.add('hidden');

    // Background styling
    if (cs.bgType === 'video') {
      customSlideBg.style.background = 'transparent';
    } else if (cs.bgType === 'image' && cs.bgValue) {
      customSlideBg.style.background = `url("${cs.bgValue}") center / cover no-repeat`;
    } else {
      customSlideBg.style.background = cs.bgValue || 'radial-gradient(circle at 50% 30%, #1e3a8a 0%, #090d16 70%, #000000 100%)';
    }

    const overlayAlpha = typeof cs.overlayOpacity === 'number' ? cs.overlayOpacity : 0.35;
    customSlideOverlay.style.background = `rgba(0, 0, 0, ${overlayAlpha})`;

    // Typography & layout
    const fontFam = cs.fontFamily || "'Montserrat', sans-serif";
    const scaleVw = parseFloat(cs.fontSizeVw) || 5.2;
    const titleSizeVw = Math.max(2.2, scaleVw * 0.68);
    const color = cs.textColor || '#ffffff';
    const titleColor = cs.titleColor || '#fde047';
    const align = cs.textAlign || 'center';
    const weight = cs.fontWeight || '800';
    const italic = cs.fontStyle === 'italic' ? 'italic' : 'normal';
    const transform = cs.uppercase ? 'uppercase' : 'none';
    const shadow = cs.textShadow === 'none'
      ? 'none'
      : '0 3px 15px rgba(0,0,0,0.9), 0 6px 35px rgba(0,0,0,0.85)';

    customSlideContent.style.textAlign = align;
    customSlideContent.style.fontFamily = fontFam;

    if (cs.title && cs.title.trim()) {
      customSlideTitle.classList.remove('hidden');
      customSlideTitle.innerText = cs.title;
      customSlideTitle.style.fontSize = `${titleSizeVw}vw`;
      customSlideTitle.style.color = titleColor;
      customSlideTitle.style.fontWeight = '800';
      customSlideTitle.style.textTransform = transform;
      customSlideTitle.style.textShadow = shadow;
    } else {
      customSlideTitle.classList.add('hidden');
      customSlideTitle.innerText = '';
    }

    customSlideBody.innerText = cs.text || '';
    customSlideBody.style.fontSize = `${scaleVw}vw`;
    customSlideBody.style.color = color;
    customSlideBody.style.fontWeight = weight;
    customSlideBody.style.fontStyle = italic;
    customSlideBody.style.textTransform = transform;
    customSlideBody.style.textShadow = shadow;
    return;
  }

  // --- MODE: IMAGEN DE PROGRAMA (Flyers, Anuncios, Diapositivas) ---
  if (mode === 'image' && state.currentProgramMedia && state.currentProgramMedia.url) {
    hudStatus.innerText = 'IMAGEN EN VIVO';
    programImageContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');
    bibleContainer.classList.add('hidden');
    countdownContainer.classList.add('hidden');

    if (currentImageSrc !== state.currentProgramMedia.url) {
      currentImageSrc = state.currentProgramMedia.url;
      programImage.src = state.currentProgramMedia.url;
    }
    return;
  } else {
    programImageContainer.classList.add('hidden');
  }

  // --- MODE: BIBLIA ---
  if (mode === 'bible' && state.currentBible) {
    hudStatus.innerText = 'ESCRITURA EN VIVO';
    bibleContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');
    countdownContainer.classList.add('hidden');

    bibleText.innerText = state.currentBible.text || '';
    bibleReference.innerText = state.currentBible.displayRef || state.currentBible.reference || '';
    bibleVersionTag.innerText = state.currentBible.version || 'RVR1960';
    return;
  } else {
    bibleContainer.classList.add('hidden');
  }

  // --- MODE: CUENTA REGRESIVA ---
  if (mode === 'countdown' && state.countdown) {
    hudStatus.innerText = 'CUENTA REGRESIVA';
    countdownContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');

    countdownTitle.innerText = state.countdown.title || 'EL SERVICIO COMIENZA EN';
    countdownEndMsg.innerText = state.countdown.endMessage || '¡BIENVENIDOS!';
    countdownDigits.innerText = formatTimerDigits(state.countdown.remainingSeconds);

    if (state.countdown.remainingSeconds <= 0) {
      countdownDigits.classList.add('hidden');
      countdownEndMsg.classList.remove('hidden');
    } else {
      countdownDigits.classList.remove('hidden');
      countdownEndMsg.classList.add('hidden');
    }
    return;
  } else {
    countdownContainer.classList.add('hidden');
  }

  // --- MODE: LETRAS DE CANCIONES (Worship Lyrics) ---
  hudStatus.innerText = 'PROYECCIÓN ACTIVA';
  contentLayer.classList.remove('hidden');

  let newText = '';
  if (state.currentSong && state.currentSlideIndex >= 0 && state.currentSong.slides) {
    const slide = state.currentSong.slides[state.currentSlideIndex];
    if (slide && slide.text) {
      newText = slide.text;
    }
  }

  if (newText !== currentSlideContent) {
    currentSlideContent = newText;
    slideContainer.classList.add('fade-out');
    setTimeout(() => {
      slideText.innerText = newText;
      slideContainer.classList.remove('fade-out');
    }, 150);
  }
}

// Socket Events
socket.on('init', (data) => {
  applyState(data.state);
});

socket.on('state-changed', (state) => {
  applyState(state);
});

socket.on('seek-foreground-video', (data) => {
  if (fgVideo && !isNaN(data.time)) {
    fgVideo.currentTime = data.time;
  }
});

// Keyboard controls directly from projector window
window.addEventListener('keydown', (e) => {
  if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

  if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'PageDown') {
    e.preventDefault();
    socket.emit('next-slide');
  } else if (e.code === 'ArrowLeft' || e.code === 'PageUp' || e.code === 'Backspace') {
    e.preventDefault();
    socket.emit('prev-slide');
  } else if (e.key === 'b' || e.key === 'B') {
    socket.emit('toggle-blackout');
  } else if (e.key === 'c' || e.key === 'C') {
    socket.emit('toggle-clear-text');
  } else if (e.key === 'f' || e.key === 'F') {
    btnFullscreen.click();
  }
});
