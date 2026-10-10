// Socket connection for Display client
const socket = io({
  query: { type: 'display' }
});

const slideContainer = document.getElementById('slide-container');
const slideText = document.getElementById('slide-text');
const blackoutLayer = document.getElementById('blackout-layer');
const bgVideo = document.getElementById('bg-video');
const bgAmbient = document.getElementById('bg-ambient');
const btnFullscreen = document.getElementById('btn-fullscreen');
const hudBar = document.getElementById('hud-bar');

let currentSlideContent = '';
let currentVideoSrc = '';
let hudTimeout = null;

// Fullscreen Toggle
btnFullscreen.addEventListener('click', () => {
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

  // 4. Video background
  if (state.currentVideo) {
    if (currentVideoSrc !== state.currentVideo) {
      currentVideoSrc = state.currentVideo;
      bgVideo.src = state.currentVideo;
      bgVideo.load();
      bgVideo.play().catch(e => console.log('Video autoplay prevented:', e));
      bgVideo.classList.add('active');
      bgAmbient.classList.add('hidden');
    }
    bgVideo.muted = state.videoMuted !== false;
    if (state.videoPlaying) {
      if (bgVideo.paused) bgVideo.play().catch(() => {});
    } else {
      if (!bgVideo.paused) bgVideo.pause();
    }
  } else {
    if (currentVideoSrc !== '') {
      currentVideoSrc = '';
      bgVideo.pause();
      bgVideo.removeAttribute('src');
      bgVideo.classList.remove('active');
      bgAmbient.classList.remove('hidden');
    }
  }

  // 5. Lyrics Content
  let newText = '';
  if (state.currentSong && state.currentSlideIndex >= 0 && state.currentSong.slides) {
    const slide = state.currentSong.slides[state.currentSlideIndex];
    if (slide && slide.text) {
      newText = slide.text;
    }
  }

  if (newText !== currentSlideContent) {
    currentSlideContent = newText;
    // Smooth crossfade
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

// Keyboard controls directly from projector window
window.addEventListener('keydown', (e) => {
  // Ignore inside inputs
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
