// Socket connection for Operator client
const socket = io({
  query: { type: 'operator' }
});

// App State
let appState = null;
let songsList = [];
let videosList = [];
let networkIps = [];

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
    hint.innerText = 'Laptop no conectada a una red WiFi aún. Conéctate a la red local de la iglesia.';
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

  // 2. Active Song Info
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

  // 3. Render Slides Grid
  renderSlideCards(state.currentSong, state.currentSlideIndex);

  // 4. Update Confidence / Bottom Bar
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

  // 5. Highlight active song in sidebar
  document.querySelectorAll('.song-item').forEach(item => {
    if (item.dataset.id === state.currentSongId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 6. Highlight active video in sidebar
  document.querySelectorAll('.video-item').forEach(item => {
    if (state.currentVideo && item.dataset.url === state.currentVideo) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
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
    card.className = `slide-card ${idx === activeIndex ? 'active' : ''}`;
    card.dataset.index = idx;

    // Tag color class
    let tagClass = 'tag-default';
    const lbl = (slide.label || '').toLowerCase();
    if (lbl.includes('verso')) tagClass = 'tag-verso';
    else if (lbl.includes('coro')) tagClass = 'tag-coro';
    else if (lbl.includes('puente')) tagClass = 'tag-puente';
    else if (lbl.includes('pre-coro') || lbl.includes('precoro')) tagClass = 'tag-pre-coro';

    const isLive = idx === activeIndex;

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

  // Scroll active slide into view smoothly
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
    item.className = `song-item ${appState && appState.currentSongId === song.id ? 'active' : ''}`;
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

// Render Videos List
function renderVideosList(videos) {
  videosListContainer.innerHTML = '';
  if (!videos || videos.length === 0) {
    videosListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">Coloca archivos .mp4 en ./videos o súbelos aquí abajo.</div>';
    return;
  }

  videos.forEach(v => {
    const item = document.createElement('div');
    item.className = `video-item ${appState && appState.currentVideo === v.url ? 'active' : ''}`;
    item.dataset.url = v.url;

    item.innerHTML = `
      <span class="video-icon">🎬</span>
      <span class="video-name" title="${escapeHtml(v.filename)}">${escapeHtml(v.filename)}</span>
    `;

    item.addEventListener('click', () => {
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

// Socket Events
socket.on('init', (data) => {
  appState = data.state;
  songsList = data.songs || [];
  videosList = data.videos || [];
  networkIps = data.ips || [];

  renderSongsList(songsList);
  renderVideosList(videosList);
  updateUI(appState);
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
