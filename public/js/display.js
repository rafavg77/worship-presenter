// Socket connection for Display client
const socket = io({
  query: { type: 'display' }
});

const slideContainer = document.getElementById('slide-container');
const slideText = document.getElementById('slide-text');
const blackoutLayer = document.getElementById('blackout-layer');
const bgVideo = document.getElementById('bg-video');
const bgAmbient = document.getElementById('bg-ambient');
const contentLayer = document.getElementById('content-layer');
const fgVideoContainer = document.getElementById('fg-video-container');
const fgVideo = document.getElementById('fg-video');
const audioUnlockBanner = document.getElementById('audio-unlock-banner');
const btnFullscreen = document.getElementById('btn-fullscreen');
const hudBar = document.getElementById('hud-bar');
const hudStatus = document.getElementById('hud-status');

let currentSlideContent = '';
let currentBgVideoSrc = '';
let currentFgVideoSrc = '';
let hudTimeout = null;
let lastTimeUpdate = 0;

// Unlock audio on any interaction
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

// Apply state from server
function applyState(state) {
  if (!state) return;

  // 1. Blackout
  if (state.isBlackout) {
    blackoutLayer.classList.add('active');
  } else {
    blackoutLayer.classList.remove('active');
  }

  // 2. Clear Text
  if (state.isTextCleared) {
    slideContainer.classList.add('hidden');
  } else {
    slideContainer.classList.remove('hidden');
  }

  // 3. Theme & Font Size
  document.body.className = `theme-${state.theme || 'cinematic'} font-size-${state.fontSize || 'medium'}`;

  // 4. FOREGROUND VIDEO WITH AUDIO (SIN LETRA)
  if (state.mediaMode === 'video' && state.foregroundVideo && state.foregroundVideo.url) {
    hudStatus.innerText = 'VIDEO EN VIVO';
    fgVideoContainer.classList.remove('hidden');
    contentLayer.classList.add('hidden');

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
          // Show unlock banner
          audioUnlockBanner.classList.remove('hidden');
        });
      }
    } else {
      if (!fgVideo.paused) fgVideo.pause();
    }
    return; // Skip lyrics update while in video mode
  } else {
    // Return to Lyrics mode
    hudStatus.innerText = 'PROYECCIÓN ACTIVA';
    fgVideoContainer.classList.add('hidden');
    contentLayer.classList.remove('hidden');
    audioUnlockBanner.classList.add('hidden');
    if (!fgVideo.paused) {
      fgVideo.pause();
    }
  }

  // 5. Background Video (Loop behind lyrics)
  if (state.currentVideo) {
    if (currentBgVideoSrc !== state.currentVideo) {
      currentBgVideoSrc = state.currentVideo;
      bgVideo.src = state.currentVideo;
      bgVideo.load();
      bgVideo.play().catch(e => console.log('Video loop autoplay prevented:', e));
      bgVideo.classList.add('active');
      bgAmbient.classList.add('hidden');
    }
    bgVideo.muted = true; // Background is always silent
    if (state.videoPlaying) {
      if (bgVideo.paused) bgVideo.play().catch(() => {});
    } else {
      if (!bgVideo.paused) bgVideo.pause();
    }
  } else {
    if (currentBgVideoSrc !== '') {
      currentBgVideoSrc = '';
      bgVideo.pause();
      bgVideo.removeAttribute('src');
      bgVideo.classList.remove('active');
      bgAmbient.classList.remove('hidden');
    }
  }

  // 6. Lyrics Content
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
