// Socket connection for Operator client
const socket = io({
  query: { type: 'operator' }
});

// App State
let appState = null;
let songsList = [];
let backgroundVideosList = [];
let programMediaList = [];
let playlistsList = [];
let activePlaylist = null;
let canonicalBooks = [];
let networkIps = [];
let isUserSeeking = false;
let mediaFilter = 'all';
let currentTunnelUrl = null;

// DOM Elements: Top Bar
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

// Status Pills
const videoModePill = document.getElementById('video-mode-pill');
const imageModePill = document.getElementById('image-mode-pill');
const bibleModePill = document.getElementById('bible-mode-pill');
const countdownModePill = document.getElementById('countdown-mode-pill');
const tunnelStatusPill = document.getElementById('tunnel-status-pill');

// Tunnel Elements
const tunnelActiveBox = document.getElementById('tunnel-active-box');
const tunnelInactiveBox = document.getElementById('tunnel-inactive-box');
const tunnelLink = document.getElementById('tunnel-link');
const btnCopyTunnel = document.getElementById('btn-copy-tunnel');
const btnStartTunnel = document.getElementById('btn-start-tunnel');
const tunnelLoadingText = document.getElementById('tunnel-loading-text');

// Tabs Buttons & Panels
const tabs = {
  playlist: { btn: document.getElementById('tab-playlist-btn'), panel: document.getElementById('tab-playlist-panel') },
  songs: { btn: document.getElementById('tab-songs-btn'), panel: document.getElementById('tab-songs-panel') },
  media: { btn: document.getElementById('tab-media-btn'), panel: document.getElementById('tab-media-panel') },
  bible: { btn: document.getElementById('tab-bible-btn'), panel: document.getElementById('tab-bible-panel') },
  countdown: { btn: document.getElementById('tab-countdown-btn'), panel: document.getElementById('tab-countdown-panel') },
  videos: { btn: document.getElementById('tab-videos-btn'), panel: document.getElementById('tab-videos-panel') },
  settings: { btn: document.getElementById('tab-settings-btn'), panel: document.getElementById('tab-settings-panel') }
};

// TAB 1: Playlist Elements
const playlistSelect = document.getElementById('playlist-select');
const btnNewPlaylist = document.getElementById('btn-new-playlist');
const playlistItemsList = document.getElementById('playlist-items-list');
const playlistItemsCount = document.getElementById('playlist-items-count');
const newPlaylistModal = document.getElementById('new-playlist-modal');
const btnClosePlaylistModal = document.getElementById('btn-close-playlist-modal');
const inputPlaylistName = document.getElementById('input-playlist-name');
const btnSaveNewPlaylist = document.getElementById('btn-save-new-playlist');

// TAB 2: Song Elements
const songSearchInput = document.getElementById('song-search-input');
const songsListContainer = document.getElementById('songs-list');
const btnAddSong = document.getElementById('btn-add-song');
const newSongModal = document.getElementById('new-song-modal');
const btnCloseSongModal = document.getElementById('btn-close-song-modal');
const btnSaveSong = document.getElementById('btn-save-song');
const inputSongTitle = document.getElementById('input-song-title');
const inputSongArtist = document.getElementById('input-song-artist');
const inputSongKey = document.getElementById('input-song-key');
const inputSongBpm = document.getElementById('input-song-bpm');
const inputSongContent = document.getElementById('input-song-content');

// TAB 3: Media Elements
const mediaListContainer = document.getElementById('media-list');
const inputMediaUpload = document.getElementById('input-media-upload');
const mediaFilterChips = document.querySelectorAll('.media-filter-bar .filter-chip');

// TAB 4: Bible Elements
const bibleVersionSelect = document.getElementById('bible-version-select');
const btnOpenDownloadBible = document.getElementById('btn-open-download-bible');
const bibleBookSelect = document.getElementById('bible-book-select');
const bibleChapterInput = document.getElementById('bible-chapter-input');
const bibleVerseInput = document.getElementById('bible-verse-input');
const btnFetchBible = document.getElementById('btn-fetch-bible');
const biblePreviewRef = document.getElementById('bible-preview-ref');
const biblePreviewText = document.getElementById('bible-preview-text');
const btnProjectBible = document.getElementById('btn-project-bible');
const btnAddBiblePlaylist = document.getElementById('btn-add-bible-playlist');
const downloadBibleModal = document.getElementById('download-bible-modal');
const btnCloseBibleModal = document.getElementById('btn-close-bible-modal');
const bibleDownloadList = document.getElementById('bible-download-list');

// TAB 5: Countdown Elements
const countdownHours = document.getElementById('countdown-hours');
const countdownMinutes = document.getElementById('countdown-minutes');
const countdownSeconds = document.getElementById('countdown-seconds');
const countdownTitleInput = document.getElementById('countdown-title-input');
const countdownEndInput = document.getElementById('countdown-end-input');
const countdownLiveDigits = document.getElementById('countdown-live-digits');
const countdownStatusBadge = document.getElementById('countdown-status-badge');
const btnCountdownToggle = document.getElementById('btn-countdown-toggle');
const countdownToggleIcon = document.getElementById('countdown-toggle-icon');
const countdownToggleText = document.getElementById('countdown-toggle-text');
const btnCountdownReset = document.getElementById('btn-countdown-reset');
const btnCountdownProjectToggle = document.getElementById('btn-countdown-project-toggle');
const btnAddCountdownPlaylist = document.getElementById('btn-add-countdown-playlist');
const presetPills = document.querySelectorAll('.preset-pill');

// TAB 6: Background Videos
const videosListContainer = document.getElementById('videos-list');
const btnClearVideo = document.getElementById('btn-clear-video');
const inputFileUpload = document.getElementById('input-file-upload');

// TAB 7: Settings
const fontOptions = document.querySelectorAll('.font-opt');
const themeOptions = document.querySelectorAll('.theme-opt');

// Center Workspace Decks
const activeSongHeader = document.getElementById('active-song-header');
const currentSongTitle = document.getElementById('current-song-title');
const currentSongArtist = document.getElementById('current-song-artist');
const badgeKey = document.getElementById('badge-key');
const badgeBpm = document.getElementById('badge-bpm');
const badgeCount = document.getElementById('badge-count');
const slidesGridContainer = document.getElementById('slides-grid-container');

// Foreground Video Deck
const videoPlaybackDeck = document.getElementById('video-playback-deck');
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

// Image Projection Deck
const imagePlaybackDeck = document.getElementById('image-playback-deck');
const imgDeckFilename = document.getElementById('img-deck-filename');
const imgDeckPreview = document.getElementById('img-deck-preview');
const btnImgStop = document.getElementById('btn-img-stop');

// Bible Projection Deck
const biblePlaybackDeck = document.getElementById('bible-playback-deck');
const bibleDeckRef = document.getElementById('bible-deck-ref');
const bibleDeckText = document.getElementById('bible-deck-text');
const btnBibleStop = document.getElementById('btn-bible-stop');

// Countdown Projection Deck
const countdownPlaybackDeck = document.getElementById('countdown-playback-deck');
const countdownDeckTitle = document.getElementById('countdown-deck-title');
const countdownDeckDigits = document.getElementById('countdown-deck-digits');
const btnCountdownDeckToggle = document.getElementById('btn-countdown-deck-toggle');
const btnCountdownDeckReset = document.getElementById('btn-countdown-deck-reset');
const btnCountdownStop = document.getElementById('btn-countdown-stop');

// Bottom Bar
const livePreviewText = document.getElementById('live-preview-text');
const nextPreviewText = document.getElementById('next-preview-text');
const toastContainer = document.getElementById('toast-container');

// Toast Notification
function showToast(message, duration = 2400) {
  if (!toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Format Seconds to HH:MM:SS or MM:SS
function formatTime(sec) {
  if (isNaN(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Tab Switching
function switchTab(targetKey) {
  Object.keys(tabs).forEach(k => {
    if (tabs[k].btn) tabs[k].btn.classList.remove('active');
    if (tabs[k].panel) tabs[k].panel.classList.remove('active');
  });
  if (tabs[targetKey]) {
    if (tabs[targetKey].btn) tabs[targetKey].btn.classList.add('active');
    if (tabs[targetKey].panel) tabs[targetKey].panel.classList.add('active');
  }
}
Object.keys(tabs).forEach(k => {
  if (tabs[k].btn) {
    tabs[k].btn.addEventListener('click', () => switchTab(k));
  }
});

// Launch Projector Display Window
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
  
  const localRow = document.createElement('div');
  localRow.className = 'ip-row';
  localRow.innerHTML = `
    <div>
      <div style="font-size:0.75rem; color:#94a3b8">En esta misma laptop:</div>
      <a class="ip-link" href="http://localhost:${port}" target="_blank">http://localhost:${port}</a>
    </div>
    <button class="btn-copy-ip" onclick="navigator.clipboard.writeText('http://localhost:${port}'); alert('Copiado!');">Copiar</button>
  `;
  ipListContainer.appendChild(localRow);

  if (networkIps && networkIps.length > 0) {
    networkIps.forEach(net => {
      const row = document.createElement('div');
      row.className = 'ip-row';
      const url = `http://${net.address}:${port}`;
      row.innerHTML = `
        <div>
          <div style="font-size:0.75rem; color:#94a3b8">WiFi (${escapeHtml(net.interface)}):</div>
          <a class="ip-link" href="${url}" target="_blank">${url}</a>
        </div>
        <button class="btn-copy-ip" onclick="navigator.clipboard.writeText('${url}'); alert('Copiado!');">Copiar</button>
      `;
      ipListContainer.appendChild(row);
    });
  } else {
    const hint = document.createElement('div');
    hint.style.fontSize = '0.85rem';
    hint.style.color = '#cbd5e1';
    hint.innerText = 'Laptop no conectada a una red WiFi aún.';
    ipListContainer.appendChild(hint);
  }
}

// Cloudflare Tunnel
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
      showToast('¡Enlace público de Cloudflare copiado!');
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
        showToast('¡Túnel Cloudflare activo!');
      }
    } catch (err) {
      alert('Error iniciando túnel: ' + err.message);
    } finally {
      btnStartTunnel.disabled = false;
      if (tunnelLoadingText) tunnelLoadingText.classList.add('hidden');
    }
  });
}

// ProPresenter Action Buttons
btnBlackout.addEventListener('click', () => socket.emit('toggle-blackout'));
btnClearText.addEventListener('click', () => socket.emit('toggle-clear-text'));
btnPrevSlide.addEventListener('click', () => socket.emit('prev-slide'));
btnNextSlide.addEventListener('click', () => socket.emit('next-slide'));
btnQuickPrev.addEventListener('click', () => socket.emit('prev-slide'));
btnQuickNext.addEventListener('click', () => socket.emit('next-slide'));

// Stop Decks Buttons
btnFgStop.addEventListener('click', () => socket.emit('stop-foreground-video'));
btnImgStop.addEventListener('click', () => socket.emit('stop-foreground-video'));
btnBibleStop.addEventListener('click', () => socket.emit('stop-foreground-video'));
btnCountdownStop.addEventListener('click', () => socket.emit('countdown-project', false));

// Foreground Video Controls
btnFgPlayPause.addEventListener('click', () => socket.emit('control-foreground-video', { action: 'toggle' }));
btnFgRestart.addEventListener('click', () => socket.emit('control-foreground-video', { action: 'seek', value: 0 }));
btnFgLoop.addEventListener('click', () => socket.emit('control-foreground-video', { action: 'loop-toggle' }));
btnFgMute.addEventListener('click', () => socket.emit('control-foreground-video', { action: 'mute-toggle' }));

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

// ==========================================
// 1. PLAYLIST MANAGEMENT
// ==========================================
function renderPlaylistSelector() {
  playlistSelect.innerHTML = '';
  if (!playlistsList || playlistsList.length === 0) {
    const opt = document.createElement('option');
    opt.value = 'default_playlist';
    opt.innerText = 'Lista de Servicio';
    playlistSelect.appendChild(opt);
    return;
  }

  playlistsList.forEach(pl => {
    const opt = document.createElement('option');
    opt.value = pl.id;
    opt.innerText = pl.name;
    if (activePlaylist && activePlaylist.id === pl.id) {
      opt.selected = true;
    }
    playlistSelect.appendChild(opt);
  });
}

playlistSelect.addEventListener('change', async () => {
  const selectedId = playlistSelect.value;
  try {
    const res = await fetch('/api/playlists/active', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedId })
    });
    const data = await res.json();
    if (data.playlist) {
      activePlaylist = data.playlist;
      renderPlaylistItems();
      showToast(`Playlist activada: ${data.playlist.name}`);
    }
  } catch (err) {
    console.error(err);
  }
});

btnNewPlaylist.addEventListener('click', () => {
  inputPlaylistName.value = '';
  newPlaylistModal.classList.remove('hidden');
});
btnClosePlaylistModal.addEventListener('click', () => newPlaylistModal.classList.add('hidden'));

btnSaveNewPlaylist.addEventListener('click', async () => {
  const name = inputPlaylistName.value.trim();
  if (!name) return alert('Introduce un nombre para la playlist');

  try {
    const res = await fetch('/api/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, items: [] })
    });
    const data = await res.json();
    if (data.playlist) {
      activePlaylist = data.playlist;
      newPlaylistModal.classList.add('hidden');
      await fetch('/api/playlists/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.playlist.id })
      });
      showToast(`Playlist creada: ${name}`);
    }
  } catch (err) {
    alert('Error al crear playlist: ' + err.message);
  }
});

function renderPlaylistItems() {
  playlistItemsList.innerHTML = '';
  const items = (activePlaylist && activePlaylist.items) ? activePlaylist.items : [];
  playlistItemsCount.innerText = `${items.length} Elementos`;

  if (items.length === 0) {
    playlistItemsList.innerHTML = `
      <div style="color:#64748b; padding:16px; font-size:0.8rem; text-align:center;">
        Esta playlist está vacía.<br>Agrega canciones, medios, versículos o contadores desde las pestañas laterales.
      </div>
    `;
    return;
  }

  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'playlist-item-card';

    let icon = '📄';
    let title = item.title || item.reference || item.filename || 'Elemento';
    let sub = '';

    const isImage = item.type === 'image' || (item.type === 'media' && item.mediaType === 'image');
    const isVideo = item.type === 'video' || (item.type === 'media' && item.mediaType === 'video');

    if (item.type === 'song') {
      icon = '🎵';
      sub = item.artist ? `Canción • ${item.artist}` : 'Canción';
    } else if (isImage) {
      icon = '🖼️';
      sub = 'Foto / Flyer de Servicio';
    } else if (isVideo) {
      icon = '🎬';
      sub = 'Video de Programa con Audio';
    } else if (item.type === 'bible') {
      icon = '📖';
      title = item.displayRef || item.reference || item.title;
      sub = `Escritura Bíblica (${item.version || 'RVR1960'})`;
    } else if (item.type === 'countdown') {
      icon = '⏱️';
      const dur = item.totalSeconds || item.duration || 300;
      title = `${formatTime(dur)} - ${item.title || item.header || 'Cuenta Regresiva'}`;
      sub = 'Reloj Contador de Inicio';
    }

    card.innerHTML = `
      <span class="playlist-item-icon">${icon}</span>
      <div class="playlist-item-info">
        <div class="playlist-item-title">${escapeHtml(title)}</div>
        <div class="playlist-item-sub">${escapeHtml(sub)}</div>
      </div>
      <div class="playlist-item-actions">
        <button class="btn-item-ctrl btn-move-up" title="Subir">▲</button>
        <button class="btn-item-ctrl btn-move-down" title="Bajar">▼</button>
        <button class="btn-item-ctrl btn-item-danger btn-remove-item" title="Eliminar">✕</button>
      </div>
    `;

    // Click card to go live / project
    card.addEventListener('click', (e) => {
      if (e.target.closest('.playlist-item-actions')) return;
      launchPlaylistItem(item);
    });

    // Reorder Up
    card.querySelector('.btn-move-up').addEventListener('click', (e) => {
      e.stopPropagation();
      if (idx > 0) {
        const temp = items[idx - 1];
        items[idx - 1] = items[idx];
        items[idx] = temp;
        saveActivePlaylist();
      }
    });

    // Reorder Down
    card.querySelector('.btn-move-down').addEventListener('click', (e) => {
      e.stopPropagation();
      if (idx < items.length - 1) {
        const temp = items[idx + 1];
        items[idx + 1] = items[idx];
        items[idx] = temp;
        saveActivePlaylist();
      }
    });

    // Delete Item
    card.querySelector('.btn-remove-item').addEventListener('click', (e) => {
      e.stopPropagation();
      items.splice(idx, 1);
      saveActivePlaylist();
      showToast('Elemento removido de la playlist');
    });

    playlistItemsList.appendChild(card);
  });
}

function launchPlaylistItem(item) {
  const isImage = item.type === 'image' || (item.type === 'media' && item.mediaType === 'image');
  const isVideo = item.type === 'video' || (item.type === 'media' && item.mediaType === 'video');

  if (item.type === 'song') {
    socket.emit('select-song', { songId: item.songId, slideIndex: 0 });
    showToast(`Proyectando canción: ${item.title}`);
  } else if (isImage) {
    socket.emit('project-media', { url: item.url, filename: item.filename || item.title, mediaType: 'image' });
    showToast(`Proyectando imagen: ${item.filename || item.title}`);
  } else if (isVideo) {
    socket.emit('project-media', { url: item.url, filename: item.filename || item.title, mediaType: 'video' });
    showToast(`Proyectando video con audio: ${item.filename || item.title}`);
  } else if (item.type === 'bible') {
    socket.emit('project-bible', {
      reference: item.reference || item.title,
      displayRef: item.displayRef || item.reference || item.title,
      version: item.version || 'RVR1960',
      text: item.text
    });
    showToast(`Proyectando: ${item.displayRef || item.reference || item.title}`);
  } else if (item.type === 'countdown') {
    const total = item.totalSeconds || item.duration || 300;
    const title = item.title || item.header || 'EL SERVICIO COMIENZA EN';
    socket.emit('countdown-start', {
      totalSeconds: total,
      title,
      endMessage: item.endMessage || '¡BIENVENIDOS!'
    });
    socket.emit('countdown-project', true);
    showToast('Proyectando cuenta regresiva');
  }
}

function addItemToActivePlaylist(item) {
  if (!activePlaylist) {
    activePlaylist = { id: 'default_playlist', name: 'Lista de Servicio', items: [] };
  }
  if (!Array.isArray(activePlaylist.items)) activePlaylist.items = [];
  activePlaylist.items.push(item);
  saveActivePlaylist();
  showToast(`➕ Añadido al playlist: ${item.title || item.displayRef || item.filename || 'Elemento'}`);
}

function saveActivePlaylist() {
  if (!activePlaylist) return;
  socket.emit('update-active-playlist', activePlaylist);
  renderPlaylistItems();
}

// ==========================================
// 2. SONG CATALOG
// ==========================================
function renderSongsList(songs) {
  songsListContainer.innerHTML = '';
  const filter = (songSearchInput.value || '').toLowerCase().trim();

  const filtered = songs.filter(s => {
    const full = `${s.title} ${s.artist || ''} ${s.key || ''}`.toLowerCase();
    return full.includes(filter);
  });

  if (filtered.length === 0) {
    songsListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">No se encontraron canciones.</div>';
    return;
  }

  filtered.forEach(song => {
    const item = document.createElement('div');
    const isCurrent = appState && appState.mediaMode === 'lyrics' && appState.currentSongId === song.id;
    item.className = `song-item ${isCurrent ? 'active' : ''}`;
    item.dataset.id = song.id;

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="flex:1; min-width:0;">
          <div class="song-item-title">${escapeHtml(song.title)}</div>
          <div class="song-item-artist">${escapeHtml(song.artist || 'Sin artista')}</div>
        </div>
        <button class="action-btn btn-sm btn-ghost btn-add-pl" title="Agregar a Playlist" style="padding:4px 8px; font-size:0.72rem; margin-left:6px;">
          ➕ Playlist
        </button>
      </div>
      <div class="song-item-badges">
        ${song.key ? `<span class="badge-pill badge-key-pill">${escapeHtml(song.key)}</span>` : ''}
        ${song.bpm ? `<span class="badge-pill">${escapeHtml(song.bpm)} BPM</span>` : ''}
        <span class="badge-pill">${song.slidesCount || (song.slides || []).length} diapositivas</span>
      </div>
    `;

    // Click item to load song & project first slide
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-add-pl')) return;
      socket.emit('select-song', { songId: song.id, slideIndex: 0 });
    });

    // Add to playlist button
    item.querySelector('.btn-add-pl').addEventListener('click', (e) => {
      e.stopPropagation();
      addItemToActivePlaylist({
        type: 'song',
        songId: song.id,
        title: song.title,
        artist: song.artist
      });
    });

    songsListContainer.appendChild(item);
  });
}

songSearchInput.addEventListener('input', () => renderSongsList(songsList));

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
      showToast(`Canción guardada: ${title}`);
    }
  } catch (err) {
    alert('Error al guardar la canción: ' + err.message);
  }
});

// ==========================================
// 3. PROGRAM MEDIA (FOTOS Y VIDEOS)
// ==========================================
mediaFilterChips.forEach(chip => {
  chip.addEventListener('click', () => {
    mediaFilterChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    mediaFilter = chip.dataset.filter;
    renderMediaList();
  });
});

function renderMediaList() {
  mediaListContainer.innerHTML = '';
  let items = programMediaList || [];

  if (mediaFilter !== 'all') {
    items = items.filter(m => m.mediaType === mediaFilter);
  }

  if (items.length === 0) {
    mediaListContainer.innerHTML = `
      <div style="color:#64748b; padding:16px; font-size:0.8rem; text-align:center;">
        No hay fotos o videos subidos.<br>Sube imágenes (.jpg/.png) o videos (.mp4) abajo.
      </div>
    `;
    return;
  }

  items.forEach(m => {
    const card = document.createElement('div');
    card.className = 'media-card';

    const isImage = m.mediaType === 'image';
    const thumbHtml = isImage
      ? `<img src="${m.url}" class="media-thumb" alt="Miniatura">`
      : `<div class="media-thumb">🎬</div>`;

    card.innerHTML = `
      ${thumbHtml}
      <div class="media-card-info">
        <div class="media-title" title="${escapeHtml(m.filename)}">${escapeHtml(m.filename)}</div>
        <span class="media-type-tag ${isImage ? 'tag-image' : 'tag-video'}">${isImage ? '🖼️ FOTO / FLYER' : '🎬 VIDEO CON AUDIO'}</span>
      </div>
      <div class="media-card-btns">
        <button class="action-btn btn-sm btn-primary btn-proj-media" title="Proyectar ahora en pantalla">
          📽️ Proyectar
        </button>
        <button class="action-btn btn-sm btn-ghost btn-add-media-pl" title="Añadir a Playlist">
          ➕
        </button>
      </div>
    `;

    // Project media
    card.querySelector('.btn-proj-media').addEventListener('click', () => {
      socket.emit('project-media', {
        url: m.url,
        filename: m.filename,
        mediaType: m.mediaType
      });
      showToast(`Proyectando ${isImage ? 'imagen' : 'video'}: ${m.filename}`);
    });

    // Add to playlist
    card.querySelector('.btn-add-media-pl').addEventListener('click', () => {
      addItemToActivePlaylist({
        type: isImage ? 'image' : 'video',
        url: m.url,
        filename: m.filename
      });
    });

    mediaListContainer.appendChild(card);
  });
}

inputMediaUpload.addEventListener('change', async (e) => {
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
      showToast(`Medio subido: ${data.file}`);
    }
  } catch (err) {
    alert('Error al subir medio: ' + err.message);
  }
});

// ==========================================
// 4. BIBLE READER
// ==========================================
function populateBibleBooks(books) {
  bibleBookSelect.innerHTML = '';
  (books || []).forEach(b => {
    const bookName = typeof b === 'object' && b.name ? b.name : String(b);
    const opt = document.createElement('option');
    opt.value = bookName;
    opt.innerText = bookName;
    if (bookName === 'Juan') opt.selected = true;
    bibleBookSelect.appendChild(opt);
  });
}

async function fetchBibleScripture() {
  const version = bibleVersionSelect.value || 'rvr1960';
  const book = bibleBookSelect.value || 'Juan';
  const chapter = bibleChapterInput.value || '3';
  const verseInput = (bibleVerseInput.value || '16').trim();

  let verse = '1';
  let verseEnd = '';
  if (verseInput.includes('-')) {
    const parts = verseInput.split('-');
    verse = parts[0].trim();
    verseEnd = parts[1].trim();
  } else {
    verse = verseInput;
  }

  try {
    let url = `/api/bible/query?version=${encodeURIComponent(version)}&book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}&verse=${encodeURIComponent(verse)}`;
    if (verseEnd) url += `&verseEnd=${encodeURIComponent(verseEnd)}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      alert(`Error en consulta bíblica: ${data.error}`);
      return;
    }

    const ref = data.displayRef || data.reference || `${book} ${chapter}:${verseInput}`;
    biblePreviewRef.innerText = `${ref} (${data.version || version.toUpperCase()})`;
    biblePreviewText.innerText = data.text;
  } catch (err) {
    alert('Error al consultar versículo: ' + err.message);
  }
}

btnFetchBible.addEventListener('click', fetchBibleScripture);
bibleBookSelect.addEventListener('change', fetchBibleScripture);
bibleChapterInput.addEventListener('change', fetchBibleScripture);
bibleVerseInput.addEventListener('change', fetchBibleScripture);

btnProjectBible.addEventListener('click', () => {
  const version = (bibleVersionSelect.value || 'rvr1960').toUpperCase();
  const text = biblePreviewText.innerText;
  const displayRef = biblePreviewRef.innerText.replace(` (${version})`, '');

  socket.emit('project-bible', {
    reference: displayRef,
    displayRef,
    version,
    text
  });
  showToast(`Proyectando versículo: ${displayRef}`);
});

btnAddBiblePlaylist.addEventListener('click', () => {
  const version = (bibleVersionSelect.value || 'rvr1960').toUpperCase();
  const text = biblePreviewText.innerText;
  const displayRef = biblePreviewRef.innerText.replace(` (${version})`, '');

  addItemToActivePlaylist({
    type: 'bible',
    reference: displayRef,
    displayRef,
    version,
    text
  });
});

btnOpenDownloadBible.addEventListener('click', async () => {
  try {
    const res = await fetch('/api/bible/versions');
    const versions = await res.json();
    renderBibleDownloadList(versions);
    downloadBibleModal.classList.remove('hidden');
  } catch (err) {
    alert('Error obteniendo versiones: ' + err.message);
  }
});
btnCloseBibleModal.addEventListener('click', () => downloadBibleModal.classList.add('hidden'));

function renderBibleDownloadList(versions) {
  bibleDownloadList.innerHTML = '';
  versions.forEach(v => {
    const item = document.createElement('div');
    item.className = 'bible-download-item';
    item.innerHTML = `
      <div>
        <div style="font-weight:700; color:#fff;">${escapeHtml(v.name)}</div>
        <div style="font-size:0.75rem; color:${v.downloaded ? '#4ade80' : '#94a3b8'};">
          ${v.downloaded ? '✓ Instalada para uso sin internet' : 'Disponible para descargar'}
        </div>
      </div>
      <button class="action-btn btn-sm ${v.downloaded ? 'btn-ghost' : 'btn-primary'} btn-dl" ${v.downloaded ? 'disabled' : ''}>
        ${v.downloaded ? 'Instalada' : '📥 Descargar'}
      </button>
    `;

    if (!v.downloaded) {
      item.querySelector('.btn-dl').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.innerText = 'Descargando...';
        try {
          const res = await fetch('/api/bible/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: v.id })
          });
          const data = await res.json();
          if (data.success) {
            showToast(`Versión ${v.name} descargada exitosamente`);
            downloadBibleModal.classList.add('hidden');
            // Refresh versions dropdown
            const vRes = await fetch('/api/bible/versions');
            const vData = await vRes.json();
            updateBibleVersionDropdown(vData);
          } else {
            alert('Error: ' + data.error);
          }
        } catch (err) {
          alert('Error descargando versión: ' + err.message);
        }
      });
    }

    bibleDownloadList.appendChild(item);
  });
}

function updateBibleVersionDropdown(versions) {
  bibleVersionSelect.innerHTML = '';
  versions.forEach(v => {
    if (v.downloaded) {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.innerText = v.name;
      bibleVersionSelect.appendChild(opt);
    }
  });
}

// ==========================================
// 5. COUNTDOWN TIMER
// ==========================================
function getCountdownTotalSeconds() {
  const h = parseInt(countdownHours.value, 10) || 0;
  const m = parseInt(countdownMinutes.value, 10) || 0;
  const s = parseInt(countdownSeconds.value, 10) || 0;
  return h * 3600 + m * 60 + s;
}

presetPills.forEach(pill => {
  pill.addEventListener('click', () => {
    presetPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const min = parseInt(pill.dataset.minutes, 10);
    countdownHours.value = 0;
    countdownMinutes.value = min;
    countdownSeconds.value = 0;
    countdownLiveDigits.innerText = formatTime(min * 60);

    socket.emit('countdown-config', {
      totalSeconds: min * 60,
      title: countdownTitleInput.value,
      endMessage: countdownEndInput.value
    });
  });
});

[countdownHours, countdownMinutes, countdownSeconds].forEach(inp => {
  inp.addEventListener('input', () => {
    const total = getCountdownTotalSeconds();
    countdownLiveDigits.innerText = formatTime(total);
    socket.emit('countdown-config', {
      totalSeconds: total,
      title: countdownTitleInput.value,
      endMessage: countdownEndInput.value
    });
  });
});

countdownTitleInput.addEventListener('change', () => {
  socket.emit('countdown-config', {
    totalSeconds: getCountdownTotalSeconds(),
    title: countdownTitleInput.value,
    endMessage: countdownEndInput.value
  });
});

countdownEndInput.addEventListener('change', () => {
  socket.emit('countdown-config', {
    totalSeconds: getCountdownTotalSeconds(),
    title: countdownTitleInput.value,
    endMessage: countdownEndInput.value
  });
});

btnCountdownToggle.addEventListener('click', () => {
  if (appState && appState.countdown && appState.countdown.running) {
    socket.emit('countdown-pause');
  } else {
    const total = getCountdownTotalSeconds();
    socket.emit('countdown-start', {
      totalSeconds: total,
      title: countdownTitleInput.value,
      endMessage: countdownEndInput.value
    });
  }
});

btnCountdownReset.addEventListener('click', () => {
  socket.emit('countdown-reset');
});

btnCountdownProjectToggle.addEventListener('click', () => {
  const isCurrentlyProjecting = appState && appState.mediaMode === 'countdown';
  socket.emit('countdown-project', !isCurrentlyProjecting);
});

btnAddCountdownPlaylist.addEventListener('click', () => {
  const total = getCountdownTotalSeconds();
  addItemToActivePlaylist({
    type: 'countdown',
    totalSeconds: total,
    title: countdownTitleInput.value,
    endMessage: countdownEndInput.value
  });
});

btnCountdownDeckToggle.addEventListener('click', () => {
  if (appState && appState.countdown && appState.countdown.running) {
    socket.emit('countdown-pause');
  } else {
    socket.emit('countdown-resume');
  }
});
btnCountdownDeckReset.addEventListener('click', () => {
  socket.emit('countdown-reset');
});

// Real-time Countdown Socket Events
socket.on('countdown-tick', (data) => {
  if (data && typeof data.remainingSeconds === 'number') {
    const formatted = formatTime(data.remainingSeconds);
    countdownLiveDigits.innerText = formatted;
    countdownDeckDigits.innerText = formatted;
  }
});

socket.on('countdown-ended', () => {
  const endMsg = (appState && appState.countdown && appState.countdown.endMessage) || '¡BIENVENIDOS!';
  countdownLiveDigits.innerText = endMsg;
  countdownDeckDigits.innerText = endMsg;
});

// ==========================================
// 6. BACKGROUND VIDEOS (LOOP PARA LETRAS)
// ==========================================
function renderVideosList(videos) {
  videosListContainer.innerHTML = '';
  if (!videos || videos.length === 0) {
    videosListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">No hay fondos en ./videos. Sube uno abajo.</div>';
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
        <button class="btn-video-bg" title="Poner de fondo en bucle para canciones">
          🖼️ Seleccionar Fondo
        </button>
      </div>
    `;

    item.querySelector('.btn-video-bg').addEventListener('click', () => {
      socket.emit('select-video', { url: v.url });
      showToast(`Fondo de alabanza activo: ${v.filename}`);
    });

    videosListContainer.appendChild(item);
  });
}

btnClearVideo.addEventListener('click', () => {
  socket.emit('select-video', { url: null });
  showToast('Fondo quitado (pantalla limpia)');
});

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
      showToast(`Fondo en bucle subido: ${data.file}`);
    }
  } catch (err) {
    alert('Error al subir video: ' + err.message);
  }
});

// ==========================================
// 7. SETTINGS
// ==========================================
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

// ==========================================
// 8. KEYBOARD SHORTCUTS
// ==========================================
window.addEventListener('keydown', (e) => {
  if (['input', 'textarea', 'select'].includes(e.target.tagName.toLowerCase())) return;

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

// ==========================================
// 9. UPDATE UI BASED ON GLOBAL STATE
// ==========================================
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
    btnClearText.innerHTML = '<span class="btn-icon">🚫</span> <span>TEXTO OCULTO</span>';
  } else {
    btnClearText.classList.remove('active');
    btnClearText.innerHTML = '<span class="btn-icon">🚫</span> <span>LIMPIAR TEXTO</span>';
  }

  // 2. Status Pills
  videoModePill.classList.toggle('hidden', state.mediaMode !== 'video');
  imageModePill.classList.toggle('hidden', state.mediaMode !== 'image');
  bibleModePill.classList.toggle('hidden', state.mediaMode !== 'bible');
  countdownModePill.classList.toggle('hidden', state.mediaMode !== 'countdown');

  // 3. Center Workspace Decks Switching
  const mode = state.mediaMode || 'lyrics';

  if (mode === 'video' && state.foregroundVideo && state.foregroundVideo.url) {
    videoPlaybackDeck.classList.remove('hidden');
    imagePlaybackDeck.classList.add('hidden');
    biblePlaybackDeck.classList.add('hidden');
    countdownPlaybackDeck.classList.add('hidden');
    slidesGridContainer.classList.add('hidden');

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
    nextPreviewText.innerText = 'Presiona "⏹ Detener y Volver a Letras" para reanudar';
  } else if (mode === 'image' && state.currentProgramMedia) {
    imagePlaybackDeck.classList.remove('hidden');
    videoPlaybackDeck.classList.add('hidden');
    biblePlaybackDeck.classList.add('hidden');
    countdownPlaybackDeck.classList.add('hidden');
    slidesGridContainer.classList.add('hidden');

    imgDeckFilename.innerText = state.currentProgramMedia.filename || 'imagen.jpg';
    imgDeckPreview.src = state.currentProgramMedia.url;

    livePreviewText.innerText = `🖼️ [IMAGEN EN VIVO] ${state.currentProgramMedia.filename || ''}`;
    nextPreviewText.innerText = 'Presiona "⏹ Quitar Imagen y Volver a Letras" para reanudar';
  } else if (mode === 'bible' && state.currentBible) {
    biblePlaybackDeck.classList.remove('hidden');
    videoPlaybackDeck.classList.add('hidden');
    imagePlaybackDeck.classList.add('hidden');
    countdownPlaybackDeck.classList.add('hidden');
    slidesGridContainer.classList.add('hidden');

    bibleDeckRef.innerText = `${state.currentBible.displayRef || state.currentBible.reference} (${state.currentBible.version || 'RVR1960'})`;
    bibleDeckText.innerText = state.currentBible.text;

    livePreviewText.innerText = `📖 [BIBLIA] ${state.currentBible.displayRef || state.currentBible.reference}: "${state.currentBible.text.substring(0, 50)}..."`;
    nextPreviewText.innerText = 'Presiona "⏹ Quitar Versículo y Volver a Letras" para reanudar';
  } else if (mode === 'countdown' && state.countdown) {
    countdownPlaybackDeck.classList.remove('hidden');
    videoPlaybackDeck.classList.add('hidden');
    imagePlaybackDeck.classList.add('hidden');
    biblePlaybackDeck.classList.add('hidden');
    slidesGridContainer.classList.add('hidden');

    countdownDeckTitle.innerText = state.countdown.title || 'EL SERVICIO COMIENZA EN';
    countdownDeckDigits.innerText = formatTime(state.countdown.remainingSeconds);
    btnCountdownDeckToggle.innerText = state.countdown.running ? '⏸ Pausar' : '▶ Iniciar';

    livePreviewText.innerText = `⏱️ [CONTADOR] ${state.countdown.title}: ${formatTime(state.countdown.remainingSeconds)}`;
    nextPreviewText.innerText = 'Presiona "⏹ Quitar Contador y Volver a Letras" para reanudar';
  } else {
    // Mode is 'lyrics'
    videoPlaybackDeck.classList.add('hidden');
    imagePlaybackDeck.classList.add('hidden');
    biblePlaybackDeck.classList.add('hidden');
    countdownPlaybackDeck.classList.add('hidden');
    slidesGridContainer.classList.remove('hidden');

    // Active Song Metadata
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

    renderSlideCards(state.currentSong, state.currentSlideIndex);

    // Confidence Monitor
    let liveText = '— Pantalla Vacía —';
    let nextText = '— Fin de Canción —';

    if (state.isBlackout) {
      liveText = '⬛ EN BLACKOUT (PANTALLA NEGRA)';
    } else if (state.isTextCleared) {
      liveText = '🚫 TEXTO OCULTO (SOLO FONDO)';
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

  // 4. Countdown Card Controls in Sidebar
  if (state.countdown) {
    if (state.countdown.running) {
      countdownStatusBadge.className = 'badge-status-running';
      countdownStatusBadge.innerText = 'CORRIENDO';
      countdownToggleIcon.innerText = '⏸';
      countdownToggleText.innerText = 'Pausar';
      btnCountdownToggle.className = 'action-btn btn-warning';
    } else {
      countdownStatusBadge.className = 'badge-status-stopped';
      countdownStatusBadge.innerText = 'DETENIDO';
      countdownToggleIcon.innerText = '▶';
      countdownToggleText.innerText = 'Iniciar';
      btnCountdownToggle.className = 'action-btn btn-success';
    }

    btnCountdownProjectToggle.innerText = state.mediaMode === 'countdown'
      ? '⏹ Quitar Contador de Pantalla'
      : '📽️ Proyectar Contador en Pantalla';
  }

  // 5. Highlight active song in catalog
  document.querySelectorAll('.song-item').forEach(item => {
    if (state.mediaMode === 'lyrics' && item.dataset.id === state.currentSongId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // 6. Highlight active background video in sidebar
  document.querySelectorAll('.video-card-item').forEach(item => {
    if (state.currentVideo && item.dataset.url === state.currentVideo) {
      item.classList.add('active-bg');
    } else {
      item.classList.remove('active-bg');
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
    const isLive = appState && appState.mediaMode === 'lyrics' && idx === activeIndex;
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

// ==========================================
// 10. INITIALIZATION VIA SOCKET
// ==========================================
socket.on('init', (data) => {
  appState = data.state;
  songsList = data.songs || [];
  backgroundVideosList = data.backgroundVideos || [];
  programMediaList = data.programMedia || [];
  playlistsList = data.playlists || [];
  activePlaylist = data.state ? data.state.activePlaylist : (playlistsList[0] || null);
  canonicalBooks = data.canonicalBooks || [];
  networkIps = data.ips || [];

  if (data.tunnelUrl) {
    updateTunnelUI(data.tunnelUrl);
  }

  renderPlaylistSelector();
  renderPlaylistItems();
  renderSongsList(songsList);
  renderMediaList();
  populateBibleBooks(canonicalBooks);
  renderVideosList(backgroundVideosList);
  updateUI(appState);
});

socket.on('tunnel-status', (data) => {
  updateTunnelUI(data.tunnelUrl);
});

socket.on('state-changed', (state) => {
  if (state.activePlaylist) {
    activePlaylist = state.activePlaylist;
    renderPlaylistItems();
  }
  updateUI(state);
});

socket.on('library-updated', (data) => {
  songsList = data.songs || [];
  backgroundVideosList = data.backgroundVideos || [];
  programMediaList = data.programMedia || [];
  playlistsList = data.playlists || [];

  if (data.state && data.state.activePlaylist) {
    activePlaylist = data.state.activePlaylist;
  }

  renderPlaylistSelector();
  renderPlaylistItems();
  renderSongsList(songsList);
  renderMediaList();
  renderVideosList(backgroundVideosList);
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
