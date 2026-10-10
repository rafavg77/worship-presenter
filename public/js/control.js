// Socket connection for Operator client
const socket = io({
  query: { type: 'operator' }
});

// App State
let appState = null;
let songsList = [];
let videosList = [];
let networkIps = [];
let isUserSeeking = false;

// DOM Elements
const btnBlackout = document.getElementById('btn-blackout');
const btnClearText = document.getElementById('btn-clear-text');
const btnPrevSlide = document.getElementById('btn-prev-slide');
const btnNextSlide = document.getElementById('btn-next-slide');
const btnQuickPrev = document.getElementById('btn-quick-prev');
const btnQuickNext = document.getElementById('btn-quick-next');
const btnOpenDisplay = document.getElementById('btn-open-display');
const btnShowNetwork = document.getElementById('btn-show-network');
const btnCloseModal = document.getElementById('btn-close-modal');
const networkModal = document.getElementById('network-modal');
const ipListContainer = document.getElementById('ip-list-container');
const displayStatusPill = document.getElementById('display-status-pill');
const displayStatusText = document.getElementById('display-status-text');
const videoModePill = document.getElementById('video-mode-pill');
const tunnelStatusPill = document.getElementById('tunnel-status-pill');

// Cloudflare Tunnel elements
const tunnelActiveBox = document.getElementById('tunnel-active-box');
const tunnelInactiveBox = document.getElementById('tunnel-inactive-box');
const tunnelLink = document.getElementById('tunnel-link');
const btnCopyTunnel = document.getElementById('btn-copy-tunnel');
const btnStartTunnel = document.getElementById('btn-start-tunnel');
const tunnelLoadingText = document.getElementById('tunnel-loading-text');
let currentTunnelUrl = null;

// Foreground Video Deck
const videoPlaybackDeck = document.getElementById('video-playback-deck');
const activeSongHeader = document.getElementById('active-song-header');
const fgDeckFilename = document.getElementById('fg-deck-filename');
const btnFgStop = document.getElementById('btn-fg-stop');
const btnFgPlayPause = document.getElementById('btn-fg-play-pause');
const fgPlayIcon = document.getElementById('fg-play-icon');
const fgPlayText = document.getElementById('fg-play-text');
const btnFgRestart = document.getElementById('btn-fg-restart');
const btnFgLoop = document.getElementById('btn-fg-loop');
const fgSeeker = document.getElementById('fg-seeker');
const fgTimeCurrent = document.getElementById('fg-time-current');
const fgTimeTotal = document.getElementById('fg-time-total');
const btnFgMute = document.getElementById('btn-fg-mute');
const fgVolume = document.getElementById('fg-volume');
const fgVolumeLabel = document.getElementById('fg-volume-label');

// Modals
const newSongModal = document.getElementById('new-song-modal');
const btnAddSong = document.getElementById('btn-add-song');
const btnCloseSongModal = document.getElementById('btn-close-song-modal');
const btnSaveSong = document.getElementById('btn-save-song');
const inputSongTitle = document.getElementById('input-song-title');
const inputSongArtist = document.getElementById('input-song-artist');
const inputSongKey = document.getElementById('input-song-key');
const inputSongBpm = document.getElementById('input-song-bpm');
const inputSongContent = document.getElementById('input-song-content');

// Tabs
const tabSongsBtn = document.getElementById('tab-songs-btn');
const tabVideosBtn = document.getElementById('tab-videos-btn');
const tabSettingsBtn = document.getElementById('tab-settings-btn');
const tabSongsPanel = document.getElementById('tab-songs-panel');
const tabVideosPanel = document.getElementById('tab-videos-panel');
const tabSettingsPanel = document.getElementById('tab-settings-panel');

// Sidebar lists
const songSearchInput = document.getElementById('song-search-input');
const songsListContainer = document.getElementById('songs-list');
const videosListContainer = document.getElementById('videos-list');
const btnClearVideo = document.getElementById('btn-clear-video');
const inputFileUpload = document.getElementById('input-file-upload');

// Center workspace
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');
const badgeKey = document.getElementById('badge-key');
const badgeBpm = document.getElementById('badge-bpm');
const badgeCount = document.getElementById('badge-count');
const slidesGridContainer = document.getElementById('slides-grid-container');

// Bottom confidence bar
const livePreviewText = document.getElementById('live-preview-text');
const nextPreviewText = document.getElementById('next-preview-text');

// Settings options
const fontOptions = document.querySelectorAll('.font-opt');
const themeOptions = document.querySelectorAll('.theme-opt');

// Tab Switching
function switchTab(tab) {
  [tabSongsBtn, tabVideosBtn, tabSettingsBtn].forEach(b => b.classList.remove('active'));
  [tabSongsPanel, tabVideosPanel, tabSettingsPanel].forEach(p => p.classList.remove('active'));

  if (tab === 'songs') {
    tabSongsBtn.classList.add('active');
    tabSongsPanel.classList.add('active');
  } else if (tab === 'videos') {
    tabVideosBtn.classList.add('active');
    tabVideosPanel.classList.add('active');
  } else if (tab === 'settings') {
    tabSettingsBtn.classList.add('active');
    tabSettingsPanel.classList.add('active');
  }
}
tabSongsBtn.addEventListener('click', () => switchTab('songs'));
tabVideosBtn.addEventListener('click', () => switchTab('videos'));
tabSettingsBtn.addEventListener('click', () => switchTab('settings'));

// Launch Display Window
btnOpenDisplay.addEventListener('click', () => {
  window.open('/display', 'WorshipDisplay', 'width=1280,height=720,menubar=no,toolbar=no,location=no');
});

// Network Modal
btnShowNetwork.addEventListener('click', () => {
  renderNetworkIps();
  networkModal.classList.remove('hidden');
});
btnCloseModal.addEventListener('click', () => networkModal.classList.add('hidden'));
networkModal.addEventListener('click', (e) => {
  if (e.target === networkModal) networkModal.classList.add('hidden');
});

function renderNetworkIps() {
  ipListContainer.innerHTML = '';
  const port = window.location.port || '3000';
  
  // Localhost
  const localRow = document.createElement('div');
  localRow.className = 'ip-row';
  localRow.innerHTML = `
    <div>
      <div style="font-size:0.75rem; color:#94a3b8">En esta misma laptop:</div>
      <a class="ip-link" href="http://localhost:${port}" target="_blank">http://localhost:${port}</a>
    </div>
    <button class="btn-copy-ip" onclick="navigator.clipboard.writeText('http://localhost:${port}')">Copiar</button>
  `;
  ipListContainer.appendChild(localRow);

  // Network IPs
  if (networkIps && networkIps.length > 0) {
    networkIps.forEach(net => {
      const row = document.createElement('div');
      row.className = 'ip-row';
      const url = `http://${net.address}:${port}`;
      row.innerHTML = `
        <div>
          <div style="font-size:0.75rem; color:#94a3b8">WiFi (${net.interface}):</div>
          <a class="ip-link" href="${url}" target="_blank">${url}</a>
        </div>
        <button class="btn-copy-ip" onclick="navigator.clipboard.writeText('${url}')">Copiar</button>
      `;
      ipListContainer.appendChild(row);
    });
  } else {
    const hint = document.createElement('div');
    hint.style.fontSize = '0.85rem';
    hint.style.color = '#cbd5e1';
    hint.innerText = 'Laptop no conectada a una red WiFi aún. Conéctate a la red local.';
    ipListContainer.appendChild(hint);
  }
}

// ProPresenter Action Buttons
btnBlackout.addEventListener('click', () => socket.emit('toggle-blackout'));
btnClearText.addEventListener('click', () => socket.emit('toggle-clear-text'));
btnPrevSlide.addEventListener('click', () => socket.emit('prev-slide'));
btnNextSlide.addEventListener('click', () => socket.emit('next-slide'));
btnQuickPrev.addEventListener('click', () => socket.emit('prev-slide'));
btnQuickNext.addEventListener('click', () => socket.emit('next-slide'));

// Foreground Video Controls
btnFgStop.addEventListener('click', () => {
  socket.emit('stop-foreground-video');
});

btnFgPlayPause.addEventListener('click', () => {
  socket.emit('control-foreground-video', { action: 'toggle' });
});

btnFgRestart.addEventListener('click', () => {
  socket.emit('control-foreground-video', { action: 'seek', value: 0 });
});

btnFgLoop.addEventListener('click', () => {
  socket.emit('control-foreground-video', { action: 'loop-toggle' });
});

btnFgMute.addEventListener('click', () => {
  socket.emit('control-foreground-video', { action: 'mute-toggle' });
});

fgVolume.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  fgVolumeLabel.innerText = `${Math.round(val * 100)}%`;
  socket.emit('control-foreground-video', { action: 'volume', value: val });
});

fgSeeker.addEventListener('mousedown', () => { isUserSeeking = true; });
fgSeeker.addEventListener('touchstart', () => { isUserSeeking = true; });
fgSeeker.addEventListener('change', (e) => {
  isUserSeeking = false;
  socket.emit('control-foreground-video', { action: 'seek', value: parseFloat(e.target.value) });
});
fgSeeker.addEventListener('mouseup', () => { isUserSeeking = false; });
fgSeeker.addEventListener('touchend', () => { isUserSeeking = false; });

// Format seconds to mm:ss
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// Socket: Video time progress from display
socket.on('video-time-update', (data) => {
  if (appState && appState.mediaMode === 'video') {
    if (!isUserSeeking && data.duration > 0) {
      fgSeeker.max = data.duration;
      fgSeeker.value = data.currentTime;
    }
    fgTimeCurrent.innerText = formatTime(data.currentTime);
    fgTimeTotal.innerText = formatTime(data.duration);
  }
});

// Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
  if (['input', 'textarea'].includes(e.target.tagName.toLowerCase())) return;

  if (e.code === 'Space' || e.code === 'ArrowRight' || e.code === 'PageDown') {
    e.preventDefault();
    socket.emit('next-slide');
  } else if (e.code === 'ArrowLeft' || e.code === 'PageUp' || e.code === 'Backspace') {
    e.preventDefault();
    socket.emit('prev-slide');
  } else if (e.key === 'b' || e.key === 'B') {
    e.preventDefault();
    socket.emit('toggle-blackout');
  } else if (e.key === 'c' || e.key === 'C') {
    e.preventDefault();
    socket.emit('toggle-clear-text');
  }
});

// Update UI on state change
function updateUI(state) {
  if (!state) return;
  appState = state;

  // 1. Blackout & Clear buttons
  if (state.isBlackout) {
    btnBlackout.classList.add('active');
    btnBlackout.innerHTML = '<span class="btn-icon">⬛</span> <span>EN BLACKOUT</span>';
  } else {
    btnBlackout.classList.remove('active');
    btnBlackout.innerHTML = '<span class="btn-icon">⬛</span> <span>BLACKOUT</span>';
  }

  if (state.isTextCleared) {
    btnClearText.classList.add('active');
    btnClearText.innerHTML = '<span class="btn-icon">🚫</span> <span>LETRA OCULTA</span>';
  } else {
    btnClearText.classList.remove('active');
    btnClearText.innerHTML = '<span class="btn-icon">🚫</span> <span>LIMPIAR LETRA</span>';
  }

  // 2. FOREGROUND VIDEO WITH AUDIO (SIN LETRA)
  if (state.mediaMode === 'video' && state.foregroundVideo && state.foregroundVideo.url) {
    videoModePill.classList.remove('hidden');
    videoPlaybackDeck.classList.remove('hidden');
    fgDeckFilename.innerText = state.foregroundVideo.filename || 'video.mp4';

    if (state.foregroundVideo.playing) {
      fgPlayIcon.innerText = '⏸';
      fgPlayText.innerText = 'Pausar';
    } else {
      fgPlayIcon.innerText = '▶';
      fgPlayText.innerText = 'Reproducir';
    }

    btnFgLoop.innerText = state.foregroundVideo.loop ? '🔁 Repetir: Sí' : '🔁 Repetir: No';
    btnFgMute.innerText = state.foregroundVideo.muted ? '🔇' : '🔊';
    fgVolume.value = state.foregroundVideo.volume;
    fgVolumeLabel.innerText = `${Math.round(state.foregroundVideo.volume * 100)}%`;

    livePreviewText.innerText = `🎬 [VIDEO CON AUDIO EN VIVO] ${state.foregroundVideo.filename || ''}`;
    nextPreviewText.innerText = 'Presiona "⏹ Detener y Volver a Letras" para reanudar canciones';
  } else {
    videoModePill.classList.add('hidden');
    videoPlaybackDeck.classList.add('hidden');
  }

  // 3. Active Song Info
  if (state.currentSong) {
    currentSongTitle.innerText = state.currentSong.title || 'Canción sin título';
    currentSongArtist.innerText = state.currentSong.artist || 'Sin artista';
    badgeKey.innerText = state.currentSong.key ? `Key: ${state.currentSong.key}` : 'Key: -';
    badgeBpm.innerText = state.currentSong.bpm ? `BPM: ${state.currentSong.bpm}` : 'BPM: -';
    badgeCount.innerText = `${(state.currentSong.slides || []).length} Diapositivas`;
  } else {
    currentSongTitle.innerText = 'Selecciona una canción';
    currentSongArtist.innerText = '-';
    badgeKey.innerText = 'Key: -';
    badgeBpm.innerText = 'BPM: -';
    badgeCount.innerText = '0 Diapositivas';
  }

  // 4. Render Slides Grid
  renderSlideCards(state.currentSong, state.currentSlideIndex);

  // 5. Update Confidence / Bottom Bar if not in video mode
  if (state.mediaMode !== 'video') {
    let liveText = '— Pantalla Vacía —';
    let nextText = '— Fin de Canción —';

    if (state.isBlackout) {
      liveText = '⬛ EN BLACKOUT (PANTALLA NEGRA)';
    } else if (state.isTextCleared) {
      liveText = '🚫 LETRA OCULTA (SOLO FONDO)';
    } else if (state.currentSong && state.currentSong.slides && state.currentSlideIndex >= 0) {
      const curSlide = state.currentSong.slides[state.currentSlideIndex];
      if (curSlide) {
        liveText = `[${curSlide.label}] ${curSlide.text.replace(/\n/g, ' / ')}`;
      }
    }

    if (state.currentSong && state.currentSong.slides) {
      const nextIdx = state.currentSlideIndex + 1;
      if (nextIdx < state.currentSong.slides.length) {
        const nextSlide = state.currentSong.slides[nextIdx];
        if (nextSlide) {
          nextText = `[${nextSlide.label}] ${nextSlide.text.replace(/\n/g, ' / ')}`;
        }
      }
    }

    livePreviewText.innerText = liveText;
    nextPreviewText.innerText = nextText;
  }

  // 6. Highlight active song in sidebar
  document.querySelectorAll('.song-item').forEach(item => {
    if (state.mediaMode !== 'video' && item.dataset.id === state.currentSongId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 7. Highlight active video in sidebar
  document.querySelectorAll('.video-card-item').forEach(item => {
    item.classList.remove('active-fg', 'active-bg');
    if (state.mediaMode === 'video' && state.foregroundVideo && item.dataset.url === state.foregroundVideo.url) {
      item.classList.add('active-fg');
    } else if (state.currentVideo && item.dataset.url === state.currentVideo) {
      item.classList.add('active-bg');
    }
  });
}

// Render ProPresenter Slide Cards
function renderSlideCards(song, activeIndex) {
  if (!song || !song.slides) {
    slidesGridContainer.innerHTML = '<div style="color:#64748b; padding:20px;">No hay diapositivas disponibles.</div>';
    return;
  }

  slidesGridContainer.innerHTML = '';
  song.slides.forEach((slide, idx) => {
    const card = document.createElement('div');
    const isLive = appState && appState.mediaMode !== 'video' && idx === activeIndex;
    card.className = `slide-card ${isLive ? 'active' : ''}`;
    card.dataset.index = idx;

    let tagClass = 'tag-default';
    const lbl = (slide.label || '').toLowerCase();
    if (lbl.includes('verso')) tagClass = 'tag-verso';
    else if (lbl.includes('coro')) tagClass = 'tag-coro';
    else if (lbl.includes('puente')) tagClass = 'tag-puente';
    else if (lbl.includes('pre-coro') || lbl.includes('precoro')) tagClass = 'tag-pre-coro';

    card.innerHTML = `
      ${isLive ? '<span class="live-indicator-badge">EN VIVO</span>' : ''}
      <div class="slide-card-header">
        <span class="slide-section-tag ${tagClass}">${escapeHtml(slide.label || 'Slide')}</span>
        <span class="slide-num">#${idx + 1}</span>
      </div>
      <div class="slide-card-body">${escapeHtml(slide.text)}</div>
    `;

    card.addEventListener('click', () => {
      socket.emit('go-to-slide', { index: idx });
    });

    slidesGridContainer.appendChild(card);
  });

  const activeCard = slidesGridContainer.querySelector('.slide-card.active');
  if (activeCard) {
    activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// Render Song List in Sidebar
function renderSongsList(songs) {
  songsListContainer.innerHTML = '';
  const filter = (songSearchInput.value || '').toLowerCase().trim();

  const filtered = songs.filter(s => {
    const full = `${s.title} ${s.artist} ${s.key}`.toLowerCase();
    return full.includes(filter);
  });

  if (filtered.length === 0) {
    songsListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">No se encontraron canciones.</div>';
    return;
  }

  filtered.forEach(song => {
    const item = document.createElement('div');
    item.className = `song-item ${appState && appState.mediaMode !== 'video' && appState.currentSongId === song.id ? 'active' : ''}`;
    item.dataset.id = song.id;

    item.innerHTML = `
      <div class="song-item-title">${escapeHtml(song.title)}</div>
      <div class="song-item-artist">${escapeHtml(song.artist || 'Sin artista')}</div>
      <div class="song-item-badges">
        ${song.key ? `<span class="badge-pill badge-key-pill">${escapeHtml(song.key)}</span>` : ''}
        ${song.bpm ? `<span class="badge-pill">${escapeHtml(song.bpm)} BPM</span>` : ''}
        <span class="badge-pill">${song.slidesCount || (song.slides || []).length} diapositivas</span>
      </div>
    `;

    item.addEventListener('click', () => {
      socket.emit('select-song', { songId: song.id, slideIndex: 0 });
    });

    songsListContainer.appendChild(item);
  });
}

songSearchInput.addEventListener('input', () => renderSongsList(songsList));

// Render Videos List with 2 Options: Standalone Video with Audio vs Background Loop
function renderVideosList(videos) {
  videosListContainer.innerHTML = '';
  if (!videos || videos.length === 0) {
    videosListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">Coloca archivos .mp4 en ./videos o súbelos aquí abajo.</div>';
    return;
  }

  videos.forEach(v => {
    const item = document.createElement('div');
    item.className = 'video-card-item';
    item.dataset.url = v.url;

    item.innerHTML = `
      <div class="video-card-title" title="${escapeHtml(v.filename)}">
        <span>🎬</span> <span>${escapeHtml(v.filename)}</span>
      </div>
      <div class="video-card-actions">
        <button class="btn-video-audio" title="Proyectar solo este video con su audio y sin letra">
          ▶ Con Audio (Sin Letra)
        </button>
        <button class="btn-video-bg" title="Usar como fondo en bucle detrás de las letras">
          🖼️ Fondo
        </button>
      </div>
    `;

    // Button: Play standalone with audio (no lyrics)
    item.querySelector('.btn-video-audio').addEventListener('click', (e) => {
      e.stopPropagation();
      socket.emit('play-foreground-video', { url: v.url, filename: v.filename });
    });

    // Button: Set as background loop
    item.querySelector('.btn-video-bg').addEventListener('click', (e) => {
      e.stopPropagation();
      socket.emit('select-video', { url: v.url });
    });

    videosListContainer.appendChild(item);
  });
}

btnClearVideo.addEventListener('click', () => {
  socket.emit('video-control', 'stop');
});

// File upload
inputFileUpload.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert(`Archivo subido exitosamente: ${data.file}`);
    }
  } catch (err) {
    alert('Error al subir el archivo: ' + err.message);
  }
});

// New Song Modal
btnAddSong.addEventListener('click', () => {
  inputSongTitle.value = '';
  inputSongArtist.value = '';
  inputSongKey.value = '';
  inputSongBpm.value = '';
  inputSongContent.value = `[Verso 1]\n\n\n[Coro]\n\n\n[Puente]\n\n`;
  newSongModal.classList.remove('hidden');
});

btnCloseSongModal.addEventListener('click', () => newSongModal.classList.add('hidden'));

btnSaveSong.addEventListener('click', async () => {
  const title = inputSongTitle.value.trim();
  const artist = inputSongArtist.value.trim();
  const key = inputSongKey.value.trim();
  const bpm = inputSongBpm.value.trim();
  const content = inputSongContent.value.trim();

  if (!title || !content) {
    alert('Por favor introduce título y contenido.');
    return;
  }

  let fullText = `Title: ${title}\n`;
  if (artist) fullText += `Artist: ${artist}\n`;
  if (key) fullText += `Key: ${key}\n`;
  if (bpm) fullText += `BPM: ${bpm}\n`;
  fullText += `\n${content}\n`;

  try {
    const res = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        artist,
        key,
        bpm,
        content: fullText,
        filename: `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.txt`
      })
    });
    const data = await res.json();
    if (data.success) {
      newSongModal.classList.add('hidden');
      socket.emit('select-song', { songId: data.song.id, slideIndex: 0 });
    }
  } catch (err) {
    alert('Error al guardar la canción: ' + err.message);
  }
});

// Settings buttons
fontOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    fontOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    socket.emit('set-font-size', btn.dataset.size);
  });
});

themeOptions.forEach(btn => {
  btn.addEventListener('click', () => {
    themeOptions.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    socket.emit('set-theme', btn.dataset.theme);
  });
});

// Cloudflare Tunnel Logic
function updateTunnelUI(url) {
  currentTunnelUrl = url;
  if (url) {
    if (tunnelStatusPill) tunnelStatusPill.classList.remove('hidden');
    if (tunnelActiveBox) tunnelActiveBox.classList.remove('hidden');
    if (tunnelInactiveBox) tunnelInactiveBox.classList.add('hidden');
    if (tunnelLink) {
      tunnelLink.href = url;
      tunnelLink.innerText = url;
    }
  } else {
    if (tunnelStatusPill) tunnelStatusPill.classList.add('hidden');
    if (tunnelActiveBox) tunnelActiveBox.classList.add('hidden');
    if (tunnelInactiveBox) tunnelInactiveBox.classList.remove('hidden');
  }
}

if (btnCopyTunnel) {
  btnCopyTunnel.addEventListener('click', () => {
    if (currentTunnelUrl) {
      navigator.clipboard.writeText(currentTunnelUrl);
      alert('¡Enlace público de Cloudflare copiado al portapapeles!');
    }
  });
}

if (btnStartTunnel) {
  btnStartTunnel.addEventListener('click', async () => {
    btnStartTunnel.disabled = true;
    if (tunnelLoadingText) tunnelLoadingText.classList.remove('hidden');
    try {
      const res = await fetch('/api/tunnel/start', { method: 'POST' });
      const data = await res.json();
      if (data.tunnelUrl) {
        updateTunnelUI(data.tunnelUrl);
      }
    } catch (err) {
      alert('Error al iniciar el túnel de Cloudflare: ' + err.message);
    } finally {
      btnStartTunnel.disabled = false;
      if (tunnelLoadingText) tunnelLoadingText.classList.add('hidden');
    }
  });
}

// Socket Events
socket.on('init', (data) => {
  appState = data.state;
  songsList = data.songs || [];
  videosList = data.videos || [];
  networkIps = data.ips || [];
  if (data.tunnelUrl) {
    updateTunnelUI(data.tunnelUrl);
  }

  renderSongsList(songsList);
  renderVideosList(videosList);
  updateUI(appState);
});

socket.on('tunnel-status', (data) => {
  updateTunnelUI(data.tunnelUrl);
});

socket.on('state-changed', (state) => {
  updateUI(state);
});

socket.on('library-updated', (data) => {
  songsList = data.songs || [];
  videosList = data.videos || [];
  renderSongsList(songsList);
  renderVideosList(videosList);
  if (data.state) updateUI(data.state);
});

socket.on('displays-count', (data) => {
  const count = data.displays || 0;
  if (count > 0) {
    displayStatusPill.className = 'status-pill status-connected';
    displayStatusText.innerText = `Proyector: ${count} (Conectado)`;
  } else {
    displayStatusPill.className = 'status-pill status-disconnected';
    displayStatusText.innerText = 'Proyector: 0 (Desconectado)';
  }
});

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
