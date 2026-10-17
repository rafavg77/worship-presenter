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
// 1. REPERTORIO & ESPACIOS MULTIMEDIA
// ==========================================
const btnRepertorioAddSong = document.getElementById('btn-repertorio-add-song');
const btnRepertorioAddSpace = document.getElementById('btn-repertorio-add-space');
const newSpaceModal = document.getElementById('new-space-modal');
const btnCloseSpaceModal = document.getElementById('btn-close-space-modal');
const inputSpaceTitle = document.getElementById('input-space-title');
const btnSaveNewSpace = document.getElementById('btn-save-new-space');
const chkAddSongToRepertorio = document.getElementById('chk-add-song-to-repertorio');
const lblActiveRepertorioSong = document.getElementById('lbl-active-repertorio-song');

// Helper to upload a single File object and return its media descriptor
async function uploadFileAndReturnMedia(file, target = 'media') {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`/api/upload?target=${encodeURIComponent(target)}`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al subir archivo');
  const ext = (data.file || file.name).split('.').pop().toLowerCase();
  const isVideo = ['mp4', 'webm', 'mov', 'mkv', 'm4v'].includes(ext);
  return {
    id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: data.title || data.file,
    filename: data.file,
    url: data.url || `/media-store/${encodeURIComponent(data.file)}`,
    mediaType: data.mediaType || (isVideo ? 'video' : 'image')
  };
}

function renderPlaylistSelector() {
  playlistSelect.innerHTML = '';
  if (!playlistsList || playlistsList.length === 0) {
    const opt = document.createElement('option');
    opt.value = '17_10_2026';
    opt.innerText = '17/10/2026';
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

  if (lblActiveRepertorioSong && activePlaylist) {
    lblActiveRepertorioSong.innerText = activePlaylist.name;
  }
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
      if (lblActiveRepertorioSong) lblActiveRepertorioSong.innerText = activePlaylist.name;
      renderPlaylistItems();
      showToast(`🎵 Repertorio activo: ${data.playlist.name}`);
    }
  } catch (err) {
    console.error(err);
  }
});

btnNewPlaylist.addEventListener('click', () => {
  inputPlaylistName.value = '';
  newPlaylistModal.classList.remove('hidden');
  setTimeout(() => inputPlaylistName.focus(), 50);
});
btnClosePlaylistModal.addEventListener('click', () => newPlaylistModal.classList.add('hidden'));

btnSaveNewPlaylist.addEventListener('click', async () => {
  const name = inputPlaylistName.value.trim();
  if (!name) return alert('Introduce un título o fecha para el repertorio (ej. 17/10/2026)');

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
      if (lblActiveRepertorioSong) lblActiveRepertorioSong.innerText = activePlaylist.name;
      showToast(`✨ Repertorio creado: ${name}`);
    }
  } catch (err) {
    alert('Error al crear repertorio: ' + err.message);
  }
});

// Quick buttons inside Repertorio tab
if (btnRepertorioAddSong) {
  btnRepertorioAddSong.addEventListener('click', () => {
    inputSongTitle.value = '';
    inputSongArtist.value = '';
    inputSongKey.value = '';
    inputSongBpm.value = '';
    inputSongContent.value = `[Verso 1]\n\n\n[Coro]\n\n\n[Puente]\n\n`;
    if (chkAddSongToRepertorio) chkAddSongToRepertorio.checked = true;
    if (lblActiveRepertorioSong && activePlaylist) lblActiveRepertorioSong.innerText = activePlaylist.name;
    newSongModal.classList.remove('hidden');
    setTimeout(() => inputSongTitle.focus(), 50);
  });
}

if (btnRepertorioAddSpace) {
  btnRepertorioAddSpace.addEventListener('click', () => {
    if (inputSpaceTitle) inputSpaceTitle.value = '';
    if (newSpaceModal) {
      newSpaceModal.classList.remove('hidden');
      setTimeout(() => inputSpaceTitle && inputSpaceTitle.focus(), 50);
    }
  });
}

if (btnCloseSpaceModal) {
  btnCloseSpaceModal.addEventListener('click', () => newSpaceModal.classList.add('hidden'));
}

if (btnSaveNewSpace) {
  btnSaveNewSpace.addEventListener('click', () => {
    const title = (inputSpaceTitle.value || '').trim();
    if (!title) return alert('Escribe un nombre para este espacio (ej. Bienvenida, Anuncios, Predicación)');

    const newSpace = {
      id: `space_${Date.now()}`,
      type: 'space',
      title,
      items: []
    };

    if (!activePlaylist) {
      activePlaylist = { id: '17_10_2026', name: '17/10/2026', items: [] };
    }
    if (!Array.isArray(activePlaylist.items)) activePlaylist.items = [];
    activePlaylist.items.push(newSpace);
    saveActivePlaylist();
    newSpaceModal.classList.add('hidden');
    socket.emit('select-space', { spaceId: newSpace.id, space: newSpace });
    showToast(`🗂️ Espacio creado: "${title}". ¡Ahora arrastra fotos o videos al centro!`);
  });
}

// ==========================================
// 1B. ESTUDIO DE OBJETO EDITABLE (CUSTOM SLIDE)
// ==========================================
const btnRepertorioAddCustom = document.getElementById('btn-repertorio-add-custom');
const customSlideModal = document.getElementById('custom-slide-modal');
const btnCloseCustomModal = document.getElementById('btn-close-custom-modal');
const csLiveSyncBadge = document.getElementById('cs-live-sync-badge');

// Preview elements inside modal
const customPreviewStage = document.getElementById('custom-preview-stage');
const customPreviewVideo = document.getElementById('custom-preview-video');
const customPreviewBg = document.getElementById('custom-preview-bg');
const customPreviewOverlay = document.getElementById('custom-preview-overlay');
const customPreviewTitle = document.getElementById('custom-preview-title');
const customPreviewBody = document.getElementById('custom-preview-body');

// Inputs inside modal
const csTitleInput = document.getElementById('cs-title-input');
const csTextInput = document.getElementById('cs-text-input');
const csFontSelect = document.getElementById('cs-font-select');
const csSizeSlider = document.getElementById('cs-size-slider');
const csSizeLabel = document.getElementById('cs-size-label');
const csTextColor = document.getElementById('cs-text-color');
const csTitleColor = document.getElementById('cs-title-color');
const csBtnItalic = document.getElementById('cs-btn-italic');
const csBtnUppercase = document.getElementById('cs-btn-uppercase');
const csBtnShadow = document.getElementById('cs-btn-shadow');
const csOverlaySlider = document.getElementById('cs-overlay-slider');
const csOverlayVal = document.getElementById('cs-overlay-val');

const csBgTabs = document.querySelectorAll('.cs-bg-tab');
const csBgBoxVideo = document.getElementById('cs-bg-box-video');
const csBgBoxGradient = document.getElementById('cs-bg-box-gradient');
const csBgBoxColor = document.getElementById('cs-bg-box-color');
const csBgBoxImage = document.getElementById('cs-bg-box-image');
const csBgVideoSelect = document.getElementById('cs-bg-video-select');
const csBgColorInput = document.getElementById('cs-bg-color-input');
const csBgImageSelect = document.getElementById('cs-bg-image-select');
const csBgImageUpload = document.getElementById('cs-bg-image-upload');

const btnCsSave = document.getElementById('btn-cs-save');
const btnCsProjectLive = document.getElementById('btn-cs-project-live');

let editingCustomTarget = null; // reference to existing item if editing
let editingCustomTargetSpace = null; // reference to space if adding/editing inside a space
let currentCustomDraft = {
  id: '',
  type: 'custom',
  mediaType: 'custom',
  title: 'BIENVENIDOS',
  text: 'Escribe tu anuncio o mensaje aquí...',
  fontFamily: "'Montserrat', sans-serif",
  fontSizeVw: 5.0,
  textColor: '#ffffff',
  titleColor: '#fde047',
  textAlign: 'center',
  fontWeight: '800',
  fontStyle: 'normal',
  uppercase: false,
  textShadow: 'strong',
  bgType: 'video',
  bgValue: '/videos/01_fondo_particulas_doradas.mp4',
  overlayOpacity: 0.35
};

function populateCustomModalMediaSelects() {
  if (csBgVideoSelect) {
    csBgVideoSelect.innerHTML = '';
    const vids = (backgroundVideosList && backgroundVideosList.length > 0)
      ? backgroundVideosList
      : [{ filename: '01_fondo_particulas_doradas.mp4', url: '/videos/01_fondo_particulas_doradas.mp4' }];
    vids.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.url;
      opt.innerText = `🎬 ${v.filename}`;
      if (currentCustomDraft.bgType === 'video' && currentCustomDraft.bgValue === v.url) {
        opt.selected = true;
      }
      csBgVideoSelect.appendChild(opt);
    });
  }

  if (csBgImageSelect) {
    csBgImageSelect.innerHTML = '';
    const imgs = (programMediaList || []).filter(m => m.mediaType === 'image');
    if (imgs.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.innerText = 'Sube una imagen con el botón de al lado 👉';
      csBgImageSelect.appendChild(opt);
    } else {
      imgs.forEach(img => {
        const opt = document.createElement('option');
        opt.value = img.url;
        opt.innerText = `🖼️ ${img.filename}`;
        if (currentCustomDraft.bgType === 'image' && currentCustomDraft.bgValue === img.url) {
          opt.selected = true;
        }
        csBgImageSelect.appendChild(opt);
      });
    }
  }
}

function setCustomBgTabUI(bgType) {
  csBgTabs.forEach(t => t.classList.toggle('active', t.dataset.bgtype === bgType));
  if (csBgBoxVideo) csBgBoxVideo.classList.toggle('hidden', bgType !== 'video');
  if (csBgBoxGradient) csBgBoxGradient.classList.toggle('hidden', bgType !== 'gradient');
  if (csBgBoxColor) csBgBoxColor.classList.toggle('hidden', bgType !== 'color');
  if (csBgBoxImage) csBgBoxImage.classList.toggle('hidden', bgType !== 'image');
}

function isCustomDraftCurrentlyLive() {
  if (!appState || appState.mediaMode !== 'custom' || !appState.currentCustomSlide) return false;
  return Boolean(editingCustomTarget && appState.currentCustomSlide.id === editingCustomTarget.id);
}

function updateCustomPreviewAndSync() {
  const d = currentCustomDraft;
  // 1. Background in 16:9 preview stage
  if (d.bgType === 'video' && d.bgValue) {
    if (customPreviewVideo.getAttribute('src') !== d.bgValue) {
      customPreviewVideo.setAttribute('src', d.bgValue);
      customPreviewVideo.load();
      customPreviewVideo.play().catch(() => {});
    }
    customPreviewVideo.classList.remove('hidden');
    customPreviewBg.style.background = 'transparent';
  } else {
    customPreviewVideo.pause();
    customPreviewVideo.classList.add('hidden');
    if (d.bgType === 'image' && d.bgValue) {
      customPreviewBg.style.background = `url("${d.bgValue}") center / cover no-repeat`;
    } else {
      customPreviewBg.style.background = d.bgValue || '#090d16';
    }
  }

  // 2. Overlay opacity
  const op = typeof d.overlayOpacity === 'number' ? d.overlayOpacity : 0.35;
  customPreviewOverlay.style.background = `rgba(0, 0, 0, ${op})`;

  // 3. Title & Body typography (scaled proportionally to preview box width)
  const stageWidth = customPreviewStage.clientWidth || 420;
  const bodyPx = Math.max(12, ( (d.fontSizeVw || 5.0) / 100 ) * stageWidth);
  const titlePx = Math.max(10, bodyPx * 0.45);

  if (d.title && d.title.trim()) {
    customPreviewTitle.innerText = d.title;
    customPreviewTitle.style.display = 'block';
    customPreviewTitle.style.fontFamily = d.fontFamily || "'Montserrat', sans-serif";
    customPreviewTitle.style.color = d.titleColor || '#fde047';
    customPreviewTitle.style.textAlign = d.textAlign || 'center';
    customPreviewTitle.style.fontSize = `${titlePx}px`;
  } else {
    customPreviewTitle.innerText = '';
    customPreviewTitle.style.display = 'none';
  }

  customPreviewBody.innerText = d.text || '';
  customPreviewBody.style.fontFamily = d.fontFamily || "'Montserrat', sans-serif";
  customPreviewBody.style.fontSize = `${bodyPx}px`;
  customPreviewBody.style.color = d.textColor || '#ffffff';
  customPreviewBody.style.textAlign = d.textAlign || 'center';
  customPreviewBody.style.fontWeight = d.fontWeight || '800';
  customPreviewBody.style.fontStyle = d.fontStyle || 'normal';
  customPreviewBody.style.textTransform = d.uppercase ? 'uppercase' : 'none';
  customPreviewBody.style.textShadow = d.textShadow === 'none'
    ? 'none'
    : '0 3px 12px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.95)';

  // 4. If this custom slide is LIVE right now on the projector, stream changes in real time!
  const isLiveNow = isCustomDraftCurrentlyLive();
  if (csLiveSyncBadge) csLiveSyncBadge.classList.toggle('hidden', !isLiveNow);
  if (isLiveNow) {
    if (editingCustomTarget) Object.assign(editingCustomTarget, d);
    socket.emit('project-custom-slide', d);
  }
}

function openCustomSlideModal(existingItem = null, targetSpace = null) {
  editingCustomTarget = existingItem || null;
  editingCustomTargetSpace = targetSpace || null;

  const defaultBgVideo = (backgroundVideosList && backgroundVideosList[0])
    ? backgroundVideosList[0].url
    : '/videos/01_fondo_particulas_doradas.mp4';

  if (existingItem) {
    currentCustomDraft = {
      id: existingItem.id || `custom_${Date.now()}`,
      type: 'custom',
      mediaType: 'custom',
      title: existingItem.title ?? '',
      text: existingItem.text ?? '',
      fontFamily: existingItem.fontFamily || "'Montserrat', sans-serif",
      fontSizeVw: Number(existingItem.fontSizeVw) || 5.0,
      textColor: existingItem.textColor || '#ffffff',
      titleColor: existingItem.titleColor || '#fde047',
      textAlign: existingItem.textAlign || 'center',
      fontWeight: existingItem.fontWeight || '800',
      fontStyle: existingItem.fontStyle || 'normal',
      uppercase: Boolean(existingItem.uppercase),
      textShadow: existingItem.textShadow || 'strong',
      bgType: existingItem.bgType || 'video',
      bgValue: existingItem.bgValue || defaultBgVideo,
      overlayOpacity: typeof existingItem.overlayOpacity === 'number' ? existingItem.overlayOpacity : 0.35
    };
  } else {
    currentCustomDraft = {
      id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'custom',
      mediaType: 'custom',
      title: 'BIENVENIDOS',
      text: 'Escribe aquí tu anuncio, frase o aviso en vivo...',
      fontFamily: "'Montserrat', sans-serif",
      fontSizeVw: 5.0,
      textColor: '#ffffff',
      titleColor: '#fde047',
      textAlign: 'center',
      fontWeight: '800',
      fontStyle: 'normal',
      uppercase: false,
      textShadow: 'strong',
      bgType: 'video',
      bgValue: defaultBgVideo,
      overlayOpacity: 0.35
    };
  }

  populateCustomModalMediaSelects();

  // Populate inputs from currentCustomDraft
  csTitleInput.value = currentCustomDraft.title;
  csTextInput.value = currentCustomDraft.text;
  csFontSelect.value = currentCustomDraft.fontFamily;
  csSizeSlider.value = currentCustomDraft.fontSizeVw;
  csSizeLabel.innerText = Number(currentCustomDraft.fontSizeVw).toFixed(1);
  csTextColor.value = currentCustomDraft.textColor;
  csTitleColor.value = currentCustomDraft.titleColor;
  csOverlaySlider.value = currentCustomDraft.overlayOpacity;
  csOverlayVal.innerText = `${Math.round(currentCustomDraft.overlayOpacity * 100)}%`;

  document.querySelectorAll('.cs-align-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.align === currentCustomDraft.textAlign);
  });
  csBtnItalic.classList.toggle('active', currentCustomDraft.fontStyle === 'italic');
  csBtnUppercase.classList.toggle('active', Boolean(currentCustomDraft.uppercase));
  csBtnShadow.classList.toggle('active', currentCustomDraft.textShadow !== 'none');

  setCustomBgTabUI(currentCustomDraft.bgType);
  if (currentCustomDraft.bgType === 'color' && csBgColorInput) {
    csBgColorInput.value = currentCustomDraft.bgValue || '#090d16';
  }

  customSlideModal.classList.remove('hidden');
  setTimeout(() => {
    updateCustomPreviewAndSync();
    csTextInput.focus();
  }, 40);
}

if (btnRepertorioAddCustom) {
  btnRepertorioAddCustom.addEventListener('click', () => {
    // If an Espacio is currently open in center workspace, offer adding directly or to repertorio
    openCustomSlideModal(null, null);
  });
}

if (btnCloseCustomModal) {
  btnCloseCustomModal.addEventListener('click', () => {
    customPreviewVideo.pause();
    customSlideModal.classList.add('hidden');
  });
}

// Wire up live preview listeners
[csTitleInput, csTextInput].forEach(inp => {
  if (!inp) return;
  inp.addEventListener('input', () => {
    currentCustomDraft.title = csTitleInput.value;
    currentCustomDraft.text = csTextInput.value;
    updateCustomPreviewAndSync();
  });
});

if (csFontSelect) {
  csFontSelect.addEventListener('change', () => {
    currentCustomDraft.fontFamily = csFontSelect.value;
    updateCustomPreviewAndSync();
  });
}

if (csSizeSlider) {
  csSizeSlider.addEventListener('input', () => {
    currentCustomDraft.fontSizeVw = parseFloat(csSizeSlider.value);
    csSizeLabel.innerText = currentCustomDraft.fontSizeVw.toFixed(1);
    updateCustomPreviewAndSync();
  });
}

if (csTextColor) {
  csTextColor.addEventListener('input', () => {
    currentCustomDraft.textColor = csTextColor.value;
    updateCustomPreviewAndSync();
  });
}

document.querySelectorAll('.cs-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    currentCustomDraft.textColor = sw.dataset.color;
    csTextColor.value = sw.dataset.color;
    updateCustomPreviewAndSync();
  });
});

if (csTitleColor) {
  csTitleColor.addEventListener('input', () => {
    currentCustomDraft.titleColor = csTitleColor.value;
    updateCustomPreviewAndSync();
  });
}

document.querySelectorAll('.cs-title-swatch').forEach(sw => {
  sw.addEventListener('click', () => {
    currentCustomDraft.titleColor = sw.dataset.color;
    csTitleColor.value = sw.dataset.color;
    updateCustomPreviewAndSync();
  });
});

document.querySelectorAll('.cs-align-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cs-align-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCustomDraft.textAlign = btn.dataset.align;
    updateCustomPreviewAndSync();
  });
});

if (csBtnItalic) {
  csBtnItalic.addEventListener('click', () => {
    currentCustomDraft.fontStyle = currentCustomDraft.fontStyle === 'italic' ? 'normal' : 'italic';
    csBtnItalic.classList.toggle('active', currentCustomDraft.fontStyle === 'italic');
    updateCustomPreviewAndSync();
  });
}

if (csBtnUppercase) {
  csBtnUppercase.addEventListener('click', () => {
    currentCustomDraft.uppercase = !currentCustomDraft.uppercase;
    csBtnUppercase.classList.toggle('active', currentCustomDraft.uppercase);
    updateCustomPreviewAndSync();
  });
}

if (csBtnShadow) {
  csBtnShadow.addEventListener('click', () => {
    currentCustomDraft.textShadow = currentCustomDraft.textShadow === 'none' ? 'strong' : 'none';
    csBtnShadow.classList.toggle('active', currentCustomDraft.textShadow !== 'none');
    updateCustomPreviewAndSync();
  });
}

if (csOverlaySlider) {
  csOverlaySlider.addEventListener('input', () => {
    currentCustomDraft.overlayOpacity = parseFloat(csOverlaySlider.value);
    csOverlayVal.innerText = `${Math.round(currentCustomDraft.overlayOpacity * 100)}%`;
    updateCustomPreviewAndSync();
  });
}

// Background Type Tabs
csBgTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const bgType = tab.dataset.bgtype;
    currentCustomDraft.bgType = bgType;
    setCustomBgTabUI(bgType);

    if (bgType === 'video' && csBgVideoSelect && csBgVideoSelect.value) {
      currentCustomDraft.bgValue = csBgVideoSelect.value;
    } else if (bgType === 'gradient') {
      currentCustomDraft.bgValue = 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)';
    } else if (bgType === 'color') {
      currentCustomDraft.bgValue = csBgColorInput ? csBgColorInput.value : '#090d16';
    } else if (bgType === 'image' && csBgImageSelect && csBgImageSelect.value) {
      currentCustomDraft.bgValue = csBgImageSelect.value;
    }
    updateCustomPreviewAndSync();
  });
});

if (csBgVideoSelect) {
  csBgVideoSelect.addEventListener('change', () => {
    currentCustomDraft.bgType = 'video';
    currentCustomDraft.bgValue = csBgVideoSelect.value;
    updateCustomPreviewAndSync();
  });
}

document.querySelectorAll('.cs-grad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cs-grad-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCustomDraft.bgType = 'gradient';
    currentCustomDraft.bgValue = btn.dataset.grad;
    updateCustomPreviewAndSync();
  });
});

if (csBgColorInput) {
  csBgColorInput.addEventListener('input', () => {
    currentCustomDraft.bgType = 'color';
    currentCustomDraft.bgValue = csBgColorInput.value;
    updateCustomPreviewAndSync();
  });
}

if (csBgImageSelect) {
  csBgImageSelect.addEventListener('change', () => {
    if (csBgImageSelect.value) {
      currentCustomDraft.bgType = 'image';
      currentCustomDraft.bgValue = csBgImageSelect.value;
      updateCustomPreviewAndSync();
    }
  });
}

if (csBgImageUpload) {
  csBgImageUpload.addEventListener('change', async (e) => {
    const file = (e.target.files || [])[0];
    if (!file) return;
    try {
      const uploaded = await uploadFileAndReturnMedia(file, 'media');
      currentCustomDraft.bgType = 'image';
      currentCustomDraft.bgValue = uploaded.url;
      populateCustomModalMediaSelects();
      if (csBgImageSelect) csBgImageSelect.value = uploaded.url;
      updateCustomPreviewAndSync();
      showToast(`🖼️ Imagen de fondo subida: ${uploaded.filename}`);
    } catch (err) {
      alert('Error subiendo imagen: ' + err.message);
    }
    csBgImageUpload.value = '';
  });
}

function saveCustomDraftToTarget() {
  const copy = { ...currentCustomDraft };
  if (editingCustomTarget) {
    Object.assign(editingCustomTarget, copy);
    saveActivePlaylist();
    if (editingCustomTargetSpace) {
      socket.emit('select-space', { spaceId: editingCustomTargetSpace.id, space: editingCustomTargetSpace });
    }
    return editingCustomTarget;
  }

  if (editingCustomTargetSpace) {
    if (!Array.isArray(editingCustomTargetSpace.items)) editingCustomTargetSpace.items = [];
    editingCustomTargetSpace.items.push(copy);
    saveActivePlaylist();
    socket.emit('select-space', { spaceId: editingCustomTargetSpace.id, space: editingCustomTargetSpace });
    editingCustomTarget = copy;
    return copy;
  }

  addItemToActivePlaylist(copy);
  editingCustomTarget = copy;
  return copy;
}

if (btnCsSave) {
  btnCsSave.addEventListener('click', () => {
    const saved = saveCustomDraftToTarget();
    customPreviewVideo.pause();
    customSlideModal.classList.add('hidden');
    showToast(`💾 Objeto editable guardado: "${saved.title || saved.text.slice(0, 25)}"`);
  });
}

if (btnCsProjectLive) {
  btnCsProjectLive.addEventListener('click', () => {
    const saved = saveCustomDraftToTarget();
    socket.emit('project-custom-slide', saved);
    customPreviewVideo.pause();
    customSlideModal.classList.add('hidden');
    showToast(`🔴 Proyectando en vivo: "${saved.title || saved.text.slice(0, 25)}"`);
  });
}

function renderPlaylistItems() {
  playlistItemsList.innerHTML = '';
  const items = (activePlaylist && activePlaylist.items) ? activePlaylist.items : [];
  playlistItemsCount.innerText = `${items.length} Elementos`;

  if (items.length === 0) {
    playlistItemsList.innerHTML = `
      <div style="color:#64748b; padding:16px; font-size:0.8rem; text-align:center;">
        Este repertorio está vacío.<br>Usa los botones <strong>➕ Canción</strong>, <strong>🗂️ + Espacio</strong> o <strong>🎨 + Editable</strong> arriba para armar tu servicio.
      </div>
    `;
    return;
  }

  items.forEach((item, idx) => {
    const card = document.createElement('div');
    const isActiveSong = item.type === 'song' && appState && appState.workspaceMode !== 'space' && appState.currentSongId === item.songId;
    const isActiveSpace = item.type === 'space' && appState && appState.workspaceMode === 'space' && appState.currentSpaceId === item.id;
    const isActiveCustom = item.type === 'custom' && appState && appState.mediaMode === 'custom' && appState.currentCustomSlide && appState.currentCustomSlide.id === item.id;
    card.className = `playlist-item-card ${(isActiveSong || isActiveSpace || isActiveCustom) ? 'active' : ''}`;

    let icon = '📄';
    let title = item.title || item.reference || item.filename || 'Elemento';
    let sub = '';

    const isImage = item.type === 'image' || (item.type === 'media' && item.mediaType === 'image');
    const isVideo = item.type === 'video' || (item.type === 'media' && item.mediaType === 'video');

    if (item.type === 'song') {
      icon = '🎵';
      sub = item.artist ? `Canción • ${item.artist}` : 'Canción';
    } else if (item.type === 'space') {
      icon = '🗂️';
      const count = Array.isArray(item.items) ? item.items.length : 0;
      sub = `Espacio Multimedia • ${count} elemento${count === 1 ? '' : 's'} (fotos/videos/editables)`;
    } else if (item.type === 'custom') {
      icon = '🎨';
      title = item.title ? `${item.title}` : (item.text || 'Objeto Editable').slice(0, 32);
      sub = `Editable • ${(item.text || '').replace(/\n/g, ' ').slice(0, 38)}`;
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
        ${item.type === 'custom' ? `<button class="btn-item-ctrl btn-edit-custom" title="Editar texto, fuente, tamaño y fondo" style="color:#f472b6; border-color:#f472b6;">✎</button>` : ''}
        <button class="btn-item-ctrl btn-move-up" title="Subir">▲</button>
        <button class="btn-item-ctrl btn-move-down" title="Bajar">▼</button>
        <button class="btn-item-ctrl btn-item-danger btn-remove-item" title="Eliminar">✕</button>
      </div>
    `;

    const btnEditCustom = card.querySelector('.btn-edit-custom');
    if (btnEditCustom) {
      btnEditCustom.addEventListener('click', (e) => {
        e.stopPropagation();
        openCustomSlideModal(item, null);
      });
    }

    // Allow dropping files directly onto a Space card in the sidebar too!
    if (item.type === 'space') {
      card.addEventListener('dragover', (e) => {
        e.preventDefault();
        card.style.borderColor = '#38bdf8';
        card.style.background = 'rgba(56, 189, 248, 0.18)';
      });
      card.addEventListener('dragleave', () => {
        card.style.borderColor = '';
        card.style.background = '';
      });
      card.addEventListener('drop', async (e) => {
        e.preventDefault();
        card.style.borderColor = '';
        card.style.background = '';
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) {
          await handleFilesDroppedIntoSpace(item, files);
        }
      });
    }

    // Click card to open / project
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
      showToast('Elemento removido del repertorio');
    });

    playlistItemsList.appendChild(card);
  });
}

async function handleFilesDroppedIntoSpace(space, files) {
  if (!space || !files || files.length === 0) return;
  if (!Array.isArray(space.items)) space.items = [];
  showToast(`⏳ Subiendo ${files.length} archivo(s) a "${space.title}"...`);
  let addedCount = 0;
  for (const file of files) {
    try {
      const uploaded = await uploadFileAndReturnMedia(file, 'media');
      space.items.push(uploaded);
      addedCount++;
    } catch (err) {
      console.error('Error subiendo archivo al espacio:', err);
    }
  }
  if (addedCount > 0) {
    saveActivePlaylist();
    socket.emit('select-space', { spaceId: space.id, space });
    showToast(`✅ ${addedCount} archivo(s) agregados a "${space.title}"`);
  }
}

function launchPlaylistItem(item) {
  const isImage = item.type === 'image' || (item.type === 'media' && item.mediaType === 'image');
  const isVideo = item.type === 'video' || (item.type === 'media' && item.mediaType === 'video');

  if (item.type === 'song') {
    socket.emit('select-song', { songId: item.songId, slideIndex: 0 });
    showToast(`🎵 Canción activa: ${item.title}`);
  } else if (item.type === 'space') {
    socket.emit('select-space', { spaceId: item.id, space: item });
    showToast(`🗂️ Espacio abierto: ${item.title}`);
  } else if (item.type === 'custom') {
    socket.emit('project-custom-slide', item);
    showToast(`🎨 Proyectando objeto editable: ${item.title || 'Diseño en vivo'}`);
  } else if (isImage) {
    socket.emit('project-media', { url: item.url, filename: item.filename || item.title, mediaType: 'image' });
    showToast(`🖼️ Proyectando imagen: ${item.filename || item.title}`);
  } else if (isVideo) {
    socket.emit('project-media', { url: item.url, filename: item.filename || item.title, mediaType: 'video' });
    showToast(`🎬 Proyectando video con audio: ${item.filename || item.title}`);
  } else if (item.type === 'bible') {
    socket.emit('project-bible', {
      reference: item.reference || item.title,
      displayRef: item.displayRef || item.reference || item.title,
      version: item.version || 'RVR1960',
      text: item.text
    });
    showToast(`📖 Proyectando: ${item.displayRef || item.reference || item.title}`);
  } else if (item.type === 'countdown') {
    const total = item.totalSeconds || item.duration || 300;
    const title = item.title || item.header || 'EL SERVICIO COMIENZA EN';
    socket.emit('countdown-start', {
      totalSeconds: total,
      title,
      endMessage: item.endMessage || '¡BIENVENIDOS!'
    });
    socket.emit('countdown-project', true);
    showToast('⏱️ Proyectando cuenta regresiva');
  }
}

function addItemToActivePlaylist(item) {
  if (!activePlaylist) {
    activePlaylist = { id: '17_10_2026', name: '17/10/2026', items: [] };
  }
  if (!Array.isArray(activePlaylist.items)) activePlaylist.items = [];
  activePlaylist.items.push(item);
  saveActivePlaylist();
  showToast(`➕ Añadido a Repertorio (${activePlaylist.name}): ${item.title || item.displayRef || item.filename || 'Elemento'}`);
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
    const isCurrent = appState && appState.workspaceMode !== 'space' && appState.mediaMode === 'lyrics' && appState.currentSongId === song.id;
    item.className = `song-item ${isCurrent ? 'active' : ''}`;
    item.dataset.id = song.id;

    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="flex:1; min-width:0;">
          <div class="song-item-title">${escapeHtml(song.title)}</div>
          <div class="song-item-artist">${escapeHtml(song.artist || 'Sin artista')}</div>
        </div>
        <button class="action-btn btn-sm btn-ghost btn-add-pl" title="Agregar al Repertorio activo" style="padding:4px 8px; font-size:0.72rem; margin-left:6px;">
          ➕ Repertorio
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
  if (chkAddSongToRepertorio) chkAddSongToRepertorio.checked = true;
  if (lblActiveRepertorioSong && activePlaylist) lblActiveRepertorioSong.innerText = activePlaylist.name;
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
      if (!chkAddSongToRepertorio || chkAddSongToRepertorio.checked) {
        addItemToActivePlaylist({
          type: 'song',
          songId: data.song.id,
          title: data.song.title,
          artist: data.song.artist
        });
      }
      socket.emit('select-song', { songId: data.song.id, slideIndex: 0 });
      showToast(`✅ Canción guardada: ${title}`);
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
        No hay fotos o videos en esta categoría.<br>Arrastra o sube imágenes (.jpg/.png) o videos (.mp4) abajo.
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
      : `<video src="${m.url}#t=0.5" class="media-thumb" muted preload="metadata"></video>`;

    card.innerHTML = `
      ${thumbHtml}
      <div class="media-card-info">
        <div class="media-title" title="${escapeHtml(m.filename)}">${escapeHtml(m.filename)}</div>
        <span class="media-type-tag ${isImage ? 'tag-image' : 'tag-video'}">${isImage ? '🖼️ FOTO / FLYER' : '🎬 VIDEO MP4'}</span>
      </div>
      <div class="media-card-btns">
        <button class="action-btn btn-sm btn-primary btn-proj-media" title="Proyectar ahora en pantalla">
          📽️ Proyectar
        </button>
        <button class="action-btn btn-sm btn-ghost btn-add-media-pl" title="Añadir al Espacio abierto o al Repertorio">
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

    // Add to active Space (if open) or Repertorio
    card.querySelector('.btn-add-media-pl').addEventListener('click', () => {
      if (appState && appState.workspaceMode === 'space' && appState.currentSpaceId && activePlaylist && Array.isArray(activePlaylist.items)) {
        const targetSpace = activePlaylist.items.find(it => it.type === 'space' && it.id === appState.currentSpaceId);
        if (targetSpace) {
          if (!Array.isArray(targetSpace.items)) targetSpace.items = [];
          targetSpace.items.push({
            id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: m.title || m.filename,
            filename: m.filename,
            url: m.url,
            mediaType: m.mediaType
          });
          saveActivePlaylist();
          socket.emit('select-space', { spaceId: targetSpace.id, space: targetSpace });
          showToast(`➕ Añadido al espacio "${targetSpace.title}": ${m.filename}`);
          return;
        }
      }
      addItemToActivePlaylist({
        type: isImage ? 'image' : 'video',
        url: m.url,
        filename: m.filename,
        mediaType: m.mediaType
      });
    });

    mediaListContainer.appendChild(card);
  });
}

inputMediaUpload.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  for (const file of files) {
    try {
      const uploaded = await uploadFileAndReturnMedia(file, 'media');
      showToast(`✅ Medio subido: ${uploaded.filename}`);
    } catch (err) {
      alert('Error al subir medio: ' + err.message);
    }
  }
  inputMediaUpload.value = '';
});

const mediaUploadDropzone = document.getElementById('media-upload-dropzone');
if (mediaUploadDropzone) {
  mediaUploadDropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    mediaUploadDropzone.style.background = 'rgba(56, 189, 248, 0.15)';
  });
  mediaUploadDropzone.addEventListener('dragleave', () => {
    mediaUploadDropzone.style.background = '';
  });
  mediaUploadDropzone.addEventListener('drop', async (e) => {
    e.preventDefault();
    mediaUploadDropzone.style.background = '';
    const files = Array.from(e.dataTransfer.files || []);
    for (const file of files) {
      try {
        const uploaded = await uploadFileAndReturnMedia(file, 'media');
        showToast(`✅ Medio subido: ${uploaded.filename}`);
      } catch (err) {
        alert('Error al subir medio: ' + err.message);
      }
    }
  });
}

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
// 6. VIDEOS & BACKGROUND LOOPS
// ==========================================
function renderVideosList(videos) {
  videosListContainer.innerHTML = '';
  if (!videos || videos.length === 0) {
    videosListContainer.innerHTML = '<div style="color:#64748b; padding:12px; font-size:0.8rem">No hay videos subidos. Sube uno abajo.</div>';
    return;
  }

  videos.forEach(v => {
    const item = document.createElement('div');
    item.className = 'video-card-item';
    item.dataset.url = v.url;

    item.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <video src="${v.url}#t=0.5" class="media-thumb" muted preload="metadata" style="width:54px; height:40px; border-radius:6px; object-fit:cover;"></video>
        <div class="video-card-title" title="${escapeHtml(v.filename)}" style="flex:1;">
          <span>${escapeHtml(v.filename)}</span>
        </div>
      </div>
      <div class="video-card-actions" style="margin-top:4px;">
        <button class="btn-video-audio" title="Proyectar video en pantalla con audio">
          ▶ Con Audio
        </button>
        <button class="btn-video-bg" title="Poner de fondo silencioso en bucle detrás de letras">
          🖼️ Fondo Loop
        </button>
        <button class="action-btn btn-sm btn-ghost btn-video-add-pl" title="Añadir al Espacio abierto o al Repertorio" style="padding:4px 8px;">
          ➕
        </button>
      </div>
    `;

    item.querySelector('.btn-video-audio').addEventListener('click', () => {
      socket.emit('project-media', {
        url: v.url,
        filename: v.filename,
        mediaType: 'video'
      });
      showToast(`🎬 Proyectando video con audio: ${v.filename}`);
    });

    item.querySelector('.btn-video-bg').addEventListener('click', () => {
      socket.emit('select-video', { url: v.url });
      showToast(`🖼️ Fondo en bucle activo: ${v.filename}`);
    });

    item.querySelector('.btn-video-add-pl').addEventListener('click', () => {
      if (appState && appState.workspaceMode === 'space' && appState.currentSpaceId && activePlaylist && Array.isArray(activePlaylist.items)) {
        const targetSpace = activePlaylist.items.find(it => it.type === 'space' && it.id === appState.currentSpaceId);
        if (targetSpace) {
          if (!Array.isArray(targetSpace.items)) targetSpace.items = [];
          targetSpace.items.push({
            id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: v.title || v.filename,
            filename: v.filename,
            url: v.url,
            mediaType: 'video'
          });
          saveActivePlaylist();
          socket.emit('select-space', { spaceId: targetSpace.id, space: targetSpace });
          showToast(`➕ Video añadido al espacio "${targetSpace.title}"`);
          return;
        }
      }
      addItemToActivePlaylist({
        type: 'video',
        url: v.url,
        filename: v.filename,
        mediaType: 'video'
      });
    });

    videosListContainer.appendChild(item);
  });
}

btnClearVideo.addEventListener('click', () => {
  socket.emit('select-video', { url: null });
  showToast('Fondo quitado (pantalla limpia)');
});

inputFileUpload.addEventListener('change', async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;

  for (const file of files) {
    try {
      const uploaded = await uploadFileAndReturnMedia(file, 'video_bg');
      showToast(`🎬 Video subido: ${uploaded.filename}`);
    } catch (err) {
      alert('Error al subir video: ' + err.message);
    }
  }
  inputFileUpload.value = '';
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
const customModePill = document.getElementById('custom-mode-pill');
const customPlaybackDeck = document.getElementById('custom-playback-deck');
const customDeckTitle = document.getElementById('custom-deck-title');
const customDeckText = document.getElementById('custom-deck-text');
const btnCustomDeckEdit = document.getElementById('btn-custom-deck-edit');
const btnCustomStop = document.getElementById('btn-custom-stop');

if (btnCustomStop) {
  btnCustomStop.addEventListener('click', () => socket.emit('stop-foreground-video'));
}

if (btnCustomDeckEdit) {
  btnCustomDeckEdit.addEventListener('click', () => {
    if (appState && appState.currentCustomSlide) {
      // Find matching item in activePlaylist if it exists so edits also save to playlist
      let targetItem = appState.currentCustomSlide;
      let targetSp = null;
      if (activePlaylist && Array.isArray(activePlaylist.items)) {
        const topMatch = activePlaylist.items.find(it => it.type === 'custom' && it.id === appState.currentCustomSlide.id);
        if (topMatch) {
          targetItem = topMatch;
        } else {
          for (const sp of activePlaylist.items) {
            if (sp.type === 'space' && Array.isArray(sp.items)) {
              const spMatch = sp.items.find(m => (m.type === 'custom' || m.mediaType === 'custom') && m.id === appState.currentCustomSlide.id);
              if (spMatch) {
                targetItem = spMatch;
                targetSp = sp;
                break;
              }
            }
          }
        }
      }
      openCustomSlideModal(targetItem, targetSp);
    }
  });
}

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
  if (customModePill) customModePill.classList.toggle('hidden', state.mediaMode !== 'custom');

  // 3. Center Workspace Decks Switching
  const mode = state.mediaMode || 'lyrics';
  const isSpaceWorkspace = state.workspaceMode === 'space';

  // Show/hide top media playback decks
  videoPlaybackDeck.classList.toggle('hidden', !(mode === 'video' && state.foregroundVideo && state.foregroundVideo.url));
  imagePlaybackDeck.classList.toggle('hidden', !(mode === 'image' && state.currentProgramMedia && !isSpaceWorkspace));
  biblePlaybackDeck.classList.toggle('hidden', !(mode === 'bible' && state.currentBible));
  countdownPlaybackDeck.classList.toggle('hidden', !(mode === 'countdown' && state.countdown));
  if (customPlaybackDeck) {
    customPlaybackDeck.classList.toggle('hidden', !(mode === 'custom' && state.currentCustomSlide && !isSpaceWorkspace));
  }

  // Keep slidesGridContainer visible when in lyrics mode OR when an Espacio is open!
  const showGrid = isSpaceWorkspace || mode === 'lyrics';
  slidesGridContainer.classList.toggle('hidden', !showGrid);

  if (mode === 'video' && state.foregroundVideo && state.foregroundVideo.url) {
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

    livePreviewText.innerText = `🎬 [VIDEO EN VIVO] ${state.foregroundVideo.filename || ''}`;
    nextPreviewText.innerText = isSpaceWorkspace
      ? 'Usa Siguiente ▶ o haz clic en otra tarjeta del Espacio'
      : 'Presiona "⏹ Detener y Volver a Letras" para reanudar';
  } else if (mode === 'image' && state.currentProgramMedia) {
    imgDeckFilename.innerText = state.currentProgramMedia.filename || 'imagen.jpg';
    imgDeckPreview.src = state.currentProgramMedia.url;

    livePreviewText.innerText = `🖼️ [IMAGEN EN VIVO] ${state.currentProgramMedia.filename || ''}`;
    nextPreviewText.innerText = isSpaceWorkspace
      ? 'Usa Siguiente ▶ o haz clic en otra tarjeta del Espacio'
      : 'Presiona "⏹ Quitar Imagen y Volver a Letras" para reanudar';
  } else if (mode === 'custom' && state.currentCustomSlide) {
    if (customDeckTitle) customDeckTitle.innerText = state.currentCustomSlide.title || 'Objeto Editable';
    if (customDeckText) customDeckText.innerText = state.currentCustomSlide.text || '';

    livePreviewText.innerText = `🎨 [EDITABLE EN VIVO] ${state.currentCustomSlide.title ? state.currentCustomSlide.title + ': ' : ''}${(state.currentCustomSlide.text || '').replace(/\n/g, ' / ')}`;
    nextPreviewText.innerText = isSpaceWorkspace
      ? 'Usa Siguiente ▶ o haz clic en "✎ Editar" en la tarjeta'
      : 'Haz clic en "🎨 Editar en Vivo Ahora" para modificar texto, fuente o fondo en vivo';
  } else if (mode === 'bible' && state.currentBible) {
    bibleDeckRef.innerText = `${state.currentBible.displayRef || state.currentBible.reference} (${state.currentBible.version || 'RVR1960'})`;
    bibleDeckText.innerText = state.currentBible.text;

    livePreviewText.innerText = `📖 [BIBLIA] ${state.currentBible.displayRef || state.currentBible.reference}: "${state.currentBible.text.substring(0, 50)}..."`;
    nextPreviewText.innerText = 'Presiona "⏹ Quitar Versículo y Volver a Letras" para reanudar';
  } else if (mode === 'countdown' && state.countdown) {
    countdownDeckTitle.innerText = state.countdown.title || 'EL SERVICIO COMIENZA EN';
    countdownDeckDigits.innerText = formatTime(state.countdown.remainingSeconds);
    btnCountdownDeckToggle.innerText = state.countdown.running ? '⏸ Pausar' : '▶ Iniciar';

    livePreviewText.innerText = `⏱️ [CONTADOR] ${state.countdown.title}: ${formatTime(state.countdown.remainingSeconds)}`;
    nextPreviewText.innerText = 'Presiona "⏹ Quitar Contador y Volver a Letras" para reanudar';
  }

  // Render Center Workspace Header & Grid (either Active Espacio OR Active Song)
  if (isSpaceWorkspace) {
    let activeSpace = state.currentSpace;
    if (activePlaylist && Array.isArray(activePlaylist.items) && state.currentSpaceId) {
      const found = activePlaylist.items.find(it => it.type === 'space' && it.id === state.currentSpaceId);
      if (found) activeSpace = found;
    }

    if (activeSpace) {
      const sItems = Array.isArray(activeSpace.items) ? activeSpace.items : [];
      const imgCount = sItems.filter(i => i.mediaType === 'image').length;
      const vidCount = sItems.filter(i => i.mediaType === 'video').length;
      const customCount = sItems.filter(i => i.type === 'custom' || i.mediaType === 'custom').length;

      currentSongTitle.innerText = `🗂️ ${activeSpace.title}`;
      currentSongArtist.innerText = `Espacio Multimedia • Repertorio: ${activePlaylist ? activePlaylist.name : ''} • Arrastra imágenes, videos o crea objetos editables`;
      badgeKey.innerText = `🖼️ Fotos: ${imgCount} • 🎨 Editables: ${customCount}`;
      badgeBpm.innerText = `🎬 Videos: ${vidCount}`;
      badgeCount.innerText = `${sItems.length} Elemento${sItems.length === 1 ? '' : 's'}`;

      renderSpaceCards(activeSpace, state.currentSpaceSlideIndex);
    }
  } else {
    // Lyrics workspace
    if (state.currentSong) {
      currentSongTitle.innerText = state.currentSong.title || 'Canción sin título';
      currentSongArtist.innerText = state.currentSong.artist || 'Sin artista';
      badgeKey.innerText = state.currentSong.key ? `Key: ${state.currentSong.key}` : 'Key: -';
      badgeBpm.innerText = state.currentSong.bpm ? `BPM: ${state.currentSong.bpm}` : 'BPM: -';
      badgeCount.innerText = `${(state.currentSong.slides || []).length} Diapositivas`;
    } else {
      currentSongTitle.innerText = 'Selecciona una canción o espacio';
      currentSongArtist.innerText = '-';
      badgeKey.innerText = 'Key: -';
      badgeBpm.innerText = 'BPM: -';
      badgeCount.innerText = '0 Diapositivas';
    }

    renderSlideCards(state.currentSong, state.currentSlideIndex);

    if (mode === 'lyrics') {
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

  // 5. Highlight active song in catalog & Repertorio
  document.querySelectorAll('.song-item').forEach(item => {
    if (!isSpaceWorkspace && state.mediaMode === 'lyrics' && item.dataset.id === state.currentSongId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  renderPlaylistItems();

  // 6. Highlight active background video in sidebar
  document.querySelectorAll('.video-card-item').forEach(item => {
    if (state.currentVideo && item.dataset.url === state.currentVideo) {
      item.classList.add('active-bg');
    } else {
      item.classList.remove('active-bg');
    }
  });
}

// Render Espacio Multimedia Cards + Drag & Drop Zone in Center Workspace
function renderSpaceCards(space, activeIndex) {
  slidesGridContainer.innerHTML = '';
  const items = Array.isArray(space.items) ? space.items : [];

  // 1. Full-width Drag & Drop Banner at top of the Espacio + Quick Custom Editable Button
  const dropBanner = document.createElement('div');
  dropBanner.className = 'space-dropzone-banner';
  dropBanner.innerHTML = `
    <div class="space-dropzone-inner" id="space-center-dropzone">
      <div class="space-dropzone-icon">📥🖼️🎬</div>
      <div class="space-dropzone-texts" style="flex:1;">
        <h4>Arrastra y suelta aquí tus Imágenes o Videos para "${escapeHtml(space.title)}"</h4>
        <p>Soporta múltiples fotos (.jpg, .png, .webp) y videos (.mp4, .mov, .webm) • O haz clic para elegir archivos</p>
      </div>
      <button type="button" id="btn-space-add-custom" class="action-btn btn-sm" style="background:linear-gradient(135deg,#ec4899,#8b5cf6); color:#fff; border:none; padding:10px 14px; font-weight:800; flex-shrink:0;">
        🎨 + Crear Diapositiva Editable Aquí
      </button>
      <input type="file" id="space-file-input" multiple accept="image/*,video/mp4,video/webm,video/quicktime" style="display:none">
    </div>
  `;

  const dzInner = dropBanner.querySelector('#space-center-dropzone');
  const fileInp = dropBanner.querySelector('#space-file-input');
  const btnSpaceAddCustom = dropBanner.querySelector('#btn-space-add-custom');

  if (btnSpaceAddCustom) {
    btnSpaceAddCustom.addEventListener('click', (e) => {
      e.stopPropagation();
      openCustomSlideModal(null, space);
    });
  }

  dzInner.addEventListener('click', (e) => {
    if (e.target.closest('#btn-space-add-custom')) return;
    fileInp.click();
  });

  fileInp.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await handleFilesDroppedIntoSpace(space, files);
    }
  });

  dzInner.addEventListener('dragover', (e) => {
    e.preventDefault();
    dzInner.classList.add('drag-over');
  });

  dzInner.addEventListener('dragleave', () => {
    dzInner.classList.remove('drag-over');
  });

  dzInner.addEventListener('drop', async (e) => {
    e.preventDefault();
    dzInner.classList.remove('drag-over');
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      await handleFilesDroppedIntoSpace(space, files);
    }
  });

  slidesGridContainer.appendChild(dropBanner);

  // 2. Render each image/video/custom card inside the Espacio
  if (items.length === 0) {
    const emptyHint = document.createElement('div');
    emptyHint.style.gridColumn = '1 / -1';
    emptyHint.style.textAlign = 'center';
    emptyHint.style.padding = '28px';
    emptyHint.style.color = '#94a3b8';
    emptyHint.innerHTML = 'Este espacio aún no tiene elementos. <strong>Arrastra fotos/videos arriba</strong> o usa <strong>🎨 + Crear Diapositiva Editable Aquí</strong>.';
    slidesGridContainer.appendChild(emptyHint);
    return;
  }

  items.forEach((mediaItem, idx) => {
    const card = document.createElement('div');
    const isCustom = mediaItem.type === 'custom' || mediaItem.mediaType === 'custom';
    const isImage = !isCustom && mediaItem.mediaType === 'image';
    const isLive = appState &&
      ((isCustom && appState.mediaMode === 'custom' && appState.currentCustomSlide && appState.currentCustomSlide.id === mediaItem.id) ||
       (isImage && appState.mediaMode === 'image' && appState.currentProgramMedia && appState.currentProgramMedia.url === mediaItem.url) ||
       (!isCustom && !isImage && appState.mediaMode === 'video' && appState.foregroundVideo && appState.foregroundVideo.url === mediaItem.url)) &&
      idx === activeIndex;

    card.className = `slide-card space-media-card ${isLive ? 'active' : ''}`;

    let previewHtml = '';
    if (isCustom) {
      const bgStyle = mediaItem.bgType === 'image'
        ? `background: url('${mediaItem.bgValue}') center/cover;`
        : (mediaItem.bgType === 'gradient' || mediaItem.bgType === 'color')
          ? `background: ${mediaItem.bgValue};`
          : `background: #0f172a;`;
      previewHtml = `
        <div style="width:100%; height:145px; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; overflow:hidden; ${bgStyle}">
          ${mediaItem.bgType === 'video' ? `<video src="${mediaItem.bgValue}#t=0.5" muted preload="metadata" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:0.65;"></video>` : ''}
          <div style="position:relative; z-index:2; text-align:${mediaItem.textAlign || 'center'}; font-family:${mediaItem.fontFamily || 'inherit'};">
            ${mediaItem.title ? `<div style="font-size:0.7rem; font-weight:800; color:${mediaItem.titleColor || '#fde047'}; text-transform:uppercase;">${escapeHtml(mediaItem.title)}</div>` : ''}
            <div style="font-size:0.86rem; font-weight:800; color:${mediaItem.textColor || '#fff'}; white-space:pre-line; line-height:1.25;">${escapeHtml((mediaItem.text || '').slice(0, 90))}</div>
          </div>
        </div>
      `;
    } else if (isImage) {
      previewHtml = `<img src="${mediaItem.url}" class="space-card-preview" alt="${escapeHtml(mediaItem.filename)}">`;
    } else {
      previewHtml = `<video src="${mediaItem.url}#t=0.5" class="space-card-preview" muted preload="metadata"></video>`;
    }

    const badgeLabel = isCustom ? '🎨 EDITABLE' : (isImage ? '🖼️ IMAGEN' : '🎬 VIDEO');
    const badgeClass = isCustom ? 'tag-puente' : (isImage ? 'tag-verso' : 'tag-pre-coro');

    card.innerHTML = `
      ${isLive ? '<span class="live-indicator-badge">EN VIVO</span>' : ''}
      <div class="slide-card-header">
        <span class="slide-section-tag ${badgeClass}">
          ${badgeLabel}
        </span>
        <div style="display:flex; align-items:center; gap:6px;">
          ${isCustom ? `<button class="btn-item-ctrl btn-edit-space-custom" title="Editar texto, fuente y fondo" style="padding:1px 6px; font-size:0.7rem; color:#f472b6; border-color:#f472b6;">✎ Editar</button>` : ''}
          <span class="slide-num">#${idx + 1}</span>
          <button class="btn-item-ctrl btn-item-danger btn-del-space-item" title="Quitar de este espacio" style="padding:1px 5px; font-size:0.68rem;">✕</button>
        </div>
      </div>
      <div class="space-card-media-wrap">
        ${previewHtml}
      </div>
      <div class="space-card-footer">
        <span class="space-card-filename" title="${escapeHtml(mediaItem.filename || mediaItem.title || mediaItem.text || '')}">
          ${escapeHtml(mediaItem.filename || mediaItem.title || (mediaItem.text || '').slice(0, 30))}
        </span>
      </div>
    `;

    const btnEditSpaceCustom = card.querySelector('.btn-edit-space-custom');
    if (btnEditSpaceCustom) {
      btnEditSpaceCustom.addEventListener('click', (e) => {
        e.stopPropagation();
        openCustomSlideModal(mediaItem, space);
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-del-space-item') || e.target.closest('.btn-edit-space-custom')) return;
      socket.emit('go-to-space-slide', { spaceId: space.id, index: idx });
      showToast(`📽️ Proyectando #${idx + 1}: ${mediaItem.filename || mediaItem.title || 'Objeto Editable'}`);
    });

    card.querySelector('.btn-del-space-item').addEventListener('click', (e) => {
      e.stopPropagation();
      items.splice(idx, 1);
      saveActivePlaylist();
      socket.emit('select-space', { spaceId: space.id, space });
      showToast('Elemento quitado del espacio');
    });

    slidesGridContainer.appendChild(card);
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
// 10. INITIALIZATION & MIDI VIA SOCKET
// ==========================================
const midiStatusPill = document.getElementById('midi-status-pill');
const midiStatusText = document.getElementById('midi-status-text');
const midiPeersBox = document.getElementById('midi-peers-box');
const midiLastEventBox = document.getElementById('midi-last-event-box');
const chkAutoAdvanceBpm = document.getElementById('chk-auto-advance-bpm');

if (midiStatusPill) {
  midiStatusPill.addEventListener('click', () => {
    switchTab('settings');
  });
}

if (chkAutoAdvanceBpm) {
  chkAutoAdvanceBpm.addEventListener('change', (e) => {
    socket.emit('toggle-auto-advance-bpm', e.target.checked);
  });
}

function updateMidiPeersUI(peers) {
  const list = peers || [];
  if (list.length > 0) {
    const names = list.map(p => p.name).join(', ');
    if (midiStatusPill) midiStatusPill.className = 'status-pill status-connected';
    if (midiStatusText) midiStatusText.innerText = `MIDI: ${names}`;
    if (midiPeersBox) {
      midiPeersBox.innerHTML = list.map(p => `🟢 <strong>${escapeHtml(p.name)}</strong> (${escapeHtml(p.ip)})`).join('<br>');
    }
  } else {
    if (midiStatusPill) midiStatusPill.className = 'status-pill status-disconnected';
    if (midiStatusText) midiStatusText.innerText = 'MIDI: Buscando...';
    if (midiPeersBox) {
      midiPeersBox.innerHTML = '🟡 Buscando dispositivos Apple MIDI en WiFi...';
    }
  }
}

function updateMidiEventUI(evt) {
  if (!evt || !midiLastEventBox) return;
  midiLastEventBox.innerHTML = `[${escapeHtml(evt.timestamp)}] <strong>${escapeHtml(evt.sourceName)}</strong>: ${escapeHtml(evt.noteName)} (Vel: ${evt.velocity ?? '-'})<br>👉 ${escapeHtml(evt.actionTaken)}`;
}

socket.on('init', (data) => {
  appState = data.state;
  songsList = data.songs || [];
  backgroundVideosList = data.backgroundVideos || data.videos || [];
  programMediaList = data.programMedia || [];
  playlistsList = data.playlists || [];
  activePlaylist = data.state ? data.state.activePlaylist : (playlistsList[0] || null);
  canonicalBooks = data.canonicalBooks || [];
  networkIps = data.ips || [];

  if (data.tunnelUrl) {
    updateTunnelUI(data.tunnelUrl);
  }
  if (data.midiPeers) {
    updateMidiPeersUI(data.midiPeers);
  }
  if (data.lastMidiEvent) {
    updateMidiEventUI(data.lastMidiEvent);
  }
  if (chkAutoAdvanceBpm && appState) {
    chkAutoAdvanceBpm.checked = !!appState.autoAdvanceBpm;
  }

  renderPlaylistSelector();
  renderPlaylistItems();
  renderSongsList(songsList);
  renderMediaList();
  populateBibleBooks(canonicalBooks);
  renderVideosList(backgroundVideosList);
  updateUI(appState);
});

socket.on('midi-status', (data) => {
  updateMidiPeersUI(data.peers);
  if (data.lastMidiEvent) updateMidiEventUI(data.lastMidiEvent);
});

socket.on('midi-event', (evt) => {
  updateMidiEventUI(evt);
});

socket.on('tunnel-status', (data) => {
  updateTunnelUI(data.tunnelUrl);
});

socket.on('state-changed', (state) => {
  if (chkAutoAdvanceBpm && state) {
    chkAutoAdvanceBpm.checked = !!state.autoAdvanceBpm;
  }
  if (state.activePlaylist) {
    activePlaylist = state.activePlaylist;
    renderPlaylistSelector();
    renderPlaylistItems();
  }
  updateUI(state);
});

socket.on('library-updated', (data) => {
  songsList = data.songs || [];
  backgroundVideosList = data.backgroundVideos || data.videos || [];
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
