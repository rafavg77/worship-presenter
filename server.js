import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import path from 'path';
import os from 'os';
import cors from 'cors';
import multer from 'multer';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';
import { startTunnel } from 'untun';
import { RtpMidiManager } from './rtp-midi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const SONGS_DIR = path.join(__dirname, 'songs');
const VIDEOS_DIR = path.join(__dirname, 'videos');
const MEDIA_DIR = path.join(__dirname, 'media');
const PLAYLISTS_DIR = path.join(__dirname, 'playlists');
const BIBLES_DIR = path.join(__dirname, 'bibles');

// Ensure all required directories exist
[SONGS_DIR, VIDEOS_DIR, MEDIA_DIR, PLAYLISTS_DIR, BIBLES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(VIDEOS_DIR));
app.use('/media-store', express.static(MEDIA_DIR));
app.use('/songs-media', express.static(SONGS_DIR));
app.use('/bibles', express.static(BIBLES_DIR));

// Cloudflare Tunnel State
let tunnelInstance = null;
let tunnelUrl = null;
let isTunnelStarting = false;

async function startCloudflareTunnel() {
  if (tunnelUrl) return tunnelUrl;
  if (isTunnelStarting) return null;
  isTunnelStarting = true;
  try {
    console.log('\n 🚀 Conectando Túnel Cloudflare...');
    tunnelInstance = await startTunnel({
      port: PORT,
      acceptCloudflareNotice: true
    });
    tunnelUrl = await tunnelInstance.getURL();
    isTunnelStarting = false;
    console.log('\n================================================================');
    console.log(' 🌐 TÚNEL CLOUDFLARE PÚBLICO ACTIVO:');
    console.log(` 👉 ${tunnelUrl}`);
    console.log(' (Cualquier persona puede abrir este enlace desde 4G/WiFi)');
    console.log('================================================================\n');
    io.emit('tunnel-status', { tunnelUrl, active: true });
    return tunnelUrl;
  } catch (err) {
    isTunnelStarting = false;
    console.error('Error al iniciar el túnel de Cloudflare:', err.message);
    throw err;
  }
}

async function stopCloudflareTunnel() {
  if (tunnelInstance) {
    try { await tunnelInstance.close(); } catch (e) {}
    tunnelInstance = null;
  }
  tunnelUrl = null;
  isTunnelStarting = false;
  io.emit('tunnel-status', { tunnelUrl: null, active: false });
}

// Multer storage
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const target = req.query.target || 'auto';
    const ext = path.extname(file.originalname).toLowerCase();

    if (target === 'media') {
      cb(null, MEDIA_DIR);
    } else if (target === 'video_bg') {
      cb(null, VIDEOS_DIR);
    } else {
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        cb(null, MEDIA_DIR);
      } else if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) {
        cb(null, MEDIA_DIR);
      } else {
        cb(null, SONGS_DIR);
      }
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage: uploadStorage });

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({ interface: name, address: iface.address });
      }
    }
  }
  return addresses;
}

// Canonical Books of the Bible in Spanish
const CANONICAL_BOOKS = [
  // Antiguo Testamento
  { name: 'Génesis', test: 'AT', aliases: ['genesis', 'gen'] },
  { name: 'Éxodo', test: 'AT', aliases: ['exodo', 'ex'] },
  { name: 'Levítico', test: 'AT', aliases: ['levitico', 'lev'] },
  { name: 'Números', test: 'AT', aliases: ['numeros', 'num'] },
  { name: 'Deuteronomio', test: 'AT', aliases: ['deuteronomio', 'deut', 'dt'] },
  { name: 'Josué', test: 'AT', aliases: ['josue', 'jos'] },
  { name: 'Jueces', test: 'AT', aliases: ['jueces', 'jue'] },
  { name: 'Rut', test: 'AT', aliases: ['rut', 'rt'] },
  { name: '1 Samuel', test: 'AT', aliases: ['1 samuel', '1sam', '1s'] },
  { name: '2 Samuel', test: 'AT', aliases: ['2 samuel', '2sam', '2s'] },
  { name: '1 Reyes', test: 'AT', aliases: ['1 reyes', '1rey', '1r'] },
  { name: '2 Reyes', test: 'AT', aliases: ['2 reyes', '2rey', '2r'] },
  { name: '1 Crónicas', test: 'AT', aliases: ['1 cronicas', '1cron', '1cr'] },
  { name: '2 Crónicas', test: 'AT', aliases: ['2 cronicas', '2cron', '2cr'] },
  { name: 'Esdras', test: 'AT', aliases: ['esdras', 'esd'] },
  { name: 'Nehemías', test: 'AT', aliases: ['nehemias', 'neh'] },
  { name: 'Ester', test: 'AT', aliases: ['ester', 'est'] },
  { name: 'Job', test: 'AT', aliases: ['job', 'jb'] },
  { name: 'Salmos', test: 'AT', aliases: ['salmos', 'salmo', 'sal', 'ps'] },
  { name: 'Proverbios', test: 'AT', aliases: ['proverbios', 'prov', 'pr'] },
  { name: 'Eclesiastés', test: 'AT', aliases: ['eclesiastes', 'ecl', 'ec'] },
  { name: 'Cantares', test: 'AT', aliases: ['cantares', 'cantar', 'cnt'] },
  { name: 'Isaías', test: 'AT', aliases: ['isaias', 'isa', 'is'] },
  { name: 'Jeremías', test: 'AT', aliases: ['jeremias', 'jer', 'jr'] },
  { name: 'Lamentaciones', test: 'AT', aliases: ['lamentaciones', 'lam'] },
  { name: 'Ezequiel', test: 'AT', aliases: ['ezequiel', 'ez'] },
  { name: 'Daniel', test: 'AT', aliases: ['daniel', 'dan', 'dn'] },
  { name: 'Oseas', test: 'AT', aliases: ['oseas', 'os'] },
  { name: 'Joel', test: 'AT', aliases: ['joel', 'jl'] },
  { name: 'Amós', test: 'AT', aliases: ['amos', 'am'] },
  { name: 'Abdías', test: 'AT', aliases: ['abdias', 'abd'] },
  { name: 'Jonás', test: 'AT', aliases: ['jonas', 'jon'] },
  { name: 'Miqueas', test: 'AT', aliases: ['miqueas', 'miq'] },
  { name: 'Nahúm', test: 'AT', aliases: ['nahum', 'nah'] },
  { name: 'Habacuc', test: 'AT', aliases: ['habacuc', 'hab'] },
  { name: 'Sofonías', test: 'AT', aliases: ['sofonias', 'sof'] },
  { name: 'Hageo', test: 'AT', aliases: ['hageo', 'hag'] },
  { name: 'Zacarías', test: 'AT', aliases: ['zacarias', 'zac'] },
  { name: 'Malaquías', test: 'AT', aliases: ['malaquias', 'mal'] },
  // Nuevo Testamento
  { name: 'Mateo', test: 'NT', aliases: ['mateo', 's. mateo', 'san mateo', 'mt'] },
  { name: 'Marcos', test: 'NT', aliases: ['marcos', 's. marcos', 'san marcos', 'mr', 'mc'] },
  { name: 'Lucas', test: 'NT', aliases: ['lucas', 's. lucas', 'san lucas', 'lc'] },
  { name: 'Juan', test: 'NT', aliases: ['juan', 's.juan', 's. juan', 'san juan', 'jn'] },
  { name: 'Hechos', test: 'NT', aliases: ['hechos', 'hch'] },
  { name: 'Romanos', test: 'NT', aliases: ['romanos', 'rom', 'ro'] },
  { name: '1 Corintios', test: 'NT', aliases: ['1 corintios', '1cor', '1co'] },
  { name: '2 Corintios', test: 'NT', aliases: ['2 corintios', '2cor', '2co'] },
  { name: 'Gálatas', test: 'NT', aliases: ['galatas', 'gal', 'ga'] },
  { name: 'Efesios', test: 'NT', aliases: ['efesios', 'efe', 'ef'] },
  { name: 'Filipenses', test: 'NT', aliases: ['filipenses', 'fil', 'flp'] },
  { name: 'Colosenses', test: 'NT', aliases: ['colosenses', 'col'] },
  { name: '1 Tesalonicenses', test: 'NT', aliases: ['1 tesalonicenses', '1tes', '1ts'] },
  { name: '2 Tesalonicenses', test: 'NT', aliases: ['2 tesalonicenses', '2tes', '2ts'] },
  { name: '1 Timoteo', test: 'NT', aliases: ['1 timoteo', '1tim', '1ti'] },
  { name: '2 Timoteo', test: 'NT', aliases: ['2 timoteo', '2tim', '2ti'] },
  { name: 'Tito', test: 'NT', aliases: ['tito', 'tit'] },
  { name: 'Filemón', test: 'NT', aliases: ['filemon', 'flm'] },
  { name: 'Hebreos', test: 'NT', aliases: ['hebreos', 'heb'] },
  { name: 'Santiago', test: 'NT', aliases: ['santiago', 'stg'] },
  { name: '1 Pedro', test: 'NT', aliases: ['1 pedro', '1ped', '1p'] },
  { name: '2 Pedro', test: 'NT', aliases: ['2 pedro', '2ped', '2p'] },
  { name: '1 Juan', test: 'NT', aliases: ['1 juan', '1jn'] },
  { name: '2 Juan', test: 'NT', aliases: ['2 juan', '2jn'] },
  { name: '3 Juan', test: 'NT', aliases: ['3 juan', '3jn'] },
  { name: 'Judas', test: 'NT', aliases: ['judas', 'jud'] },
  { name: 'Apocalipsis', test: 'NT', aliases: ['apocalipsis', 'apoc', 'ap'] }
];

// Bible cache
const loadedBibles = {};

function getBibleData(version = 'rvr1960') {
  const normVer = version.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (loadedBibles[normVer]) return loadedBibles[normVer];

  let filename = `${normVer}.json`;
  let filePath = path.join(BIBLES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    // Try finding matching file
    const files = fs.readdirSync(BIBLES_DIR);
    const matched = files.find(f => f.toLowerCase().includes(normVer));
    if (matched) filePath = path.join(BIBLES_DIR, matched);
  }

  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      loadedBibles[normVer] = JSON.parse(content);
      return loadedBibles[normVer];
    } catch (err) {
      console.error(`Error loading bible ${filePath}:`, err.message);
    }
  }
  return null;
}

function resolveBookInBible(bibleData, bookQuery) {
  if (!bibleData || !bookQuery) return null;
  const qClean = bookQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  // 1. Direct exact match in bibleData keys
  for (const k of Object.keys(bibleData)) {
    const kClean = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (kClean === qClean) return { key: k, bookObj: bibleData[k], displayName: k };
  }

  // 2. Find matching canonical book for the query
  const canonical = CANONICAL_BOOKS.find(b => {
    const bNameClean = b.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (bNameClean === qClean) return true;
    return b.aliases.some(a => a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() === qClean);
  });

  if (canonical) {
    const canonicalAliases = [
      canonical.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(),
      ...canonical.aliases.map(a => a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim())
    ];

    // Priority 2a: Exact match between canonical name/aliases and bibleData keys
    for (const k of Object.keys(bibleData)) {
      const kClean = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      if (canonicalAliases.includes(kClean)) {
        return { key: k, bookObj: bibleData[k], displayName: canonical.name };
      }
    }
  }

  // 3. Fallback boundary regex match
  for (const k of Object.keys(bibleData)) {
    const kClean = k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const regex = new RegExp(`(^|\\b|s\\.)${qClean}($|\\b)`, 'i');
    if (regex.test(kClean)) {
      return { key: k, bookObj: bibleData[k], displayName: k };
    }
  }

  return null;
}

// Parse song text format
function parseSongFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const filename = path.basename(filepath);
  const id = path.parse(filename).name;

  let title = id.replace(/^[0-9]+[-_]?/, '').replace(/[-_]/g, ' ');
  title = title.replace(/\b\w/g, l => l.toUpperCase());
  let artist = '';
  let key = '';
  let bpm = '';

  const lines = content.split(/\r?\n/);
  const slides = [];
  let currentLabel = 'Intro';
  let currentLines = [];
  let headerFinished = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!headerFinished) {
      if (/^title:\s*/i.test(line)) {
        title = line.replace(/^title:\s*/i, '').trim();
        continue;
      }
      if (/^artist:\s*/i.test(line)) {
        artist = line.replace(/^artist:\s*/i, '').trim();
        continue;
      }
      if (/^key:\s*/i.test(line)) {
        key = line.replace(/^key:\s*/i, '').trim();
        continue;
      }
      if (/^bpm:\s*/i.test(line)) {
        bpm = line.replace(/^bpm:\s*/i, '').trim();
        continue;
      }
    }

    const sectionMatch = line.match(/^\[(.*?)\]$/);
    if (sectionMatch) {
      headerFinished = true;
      if (currentLines.length > 0) {
        slides.push({
          id: `${id}-s${slides.length + 1}`,
          label: currentLabel,
          text: currentLines.join('\n').trim()
        });
        currentLines = [];
      }
      currentLabel = sectionMatch[1].trim();
      continue;
    }

    if (line === '') {
      if (currentLines.length > 0) {
        slides.push({
          id: `${id}-s${slides.length + 1}`,
          label: currentLabel,
          text: currentLines.join('\n').trim()
        });
        currentLines = [];
      }
      continue;
    }

    headerFinished = true;
    currentLines.push(rawLine);
  }

  if (currentLines.length > 0) {
    slides.push({
      id: `${id}-s${slides.length + 1}`,
      label: currentLabel,
      text: currentLines.join('\n').trim()
    });
  }

  return { id, filename, title, artist, key, bpm, slidesCount: slides.length, slides };
}

function getSongsList() {
  if (!fs.existsSync(SONGS_DIR)) return [];
  const files = fs.readdirSync(SONGS_DIR);
  const songFiles = files.filter(f => /\.(txt|md)$/i.test(f)).sort();

  const songs = [];
  for (const f of songFiles) {
    try {
      const parsed = parseSongFile(path.join(SONGS_DIR, f));
      songs.push(parsed);
    } catch (err) {
      console.error(`Error parsing song ${f}:`, err);
    }
  }
  return songs;
}

// Background worship video loops (scans both ./videos and ./media)
function getBackgroundVideosList() {
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.m4v'];
  const videos = [];
  const seen = new Set();

  const scanDir = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (videoExts.includes(path.extname(f).toLowerCase()) && !seen.has(f)) {
        seen.add(f);
        videos.push({
          filename: f,
          title: path.parse(f).name.replace(/[-_]/g, ' '),
          url: `${prefix}/${encodeURIComponent(f)}`,
          type: 'video',
          mediaType: 'video'
        });
      }
    }
  };

  scanDir(VIDEOS_DIR, '/videos');
  scanDir(MEDIA_DIR, '/media-store');
  return videos;
}

// Standalone Program Media (Photos and Videos from both ./media and ./videos)
function getProgramMediaList() {
  const imgExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  const vidExts = ['.mp4', '.webm', '.mov', '.mkv', '.m4v'];
  const list = [];
  const seen = new Set();

  const scanDir = (dir, prefix) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (seen.has(f)) continue;
      const ext = path.extname(f).toLowerCase();
      if (imgExts.includes(ext)) {
        seen.add(f);
        list.push({
          filename: f,
          title: path.parse(f).name.replace(/[-_]/g, ' '),
          url: `${prefix}/${encodeURIComponent(f)}`,
          mediaType: 'image'
        });
      } else if (vidExts.includes(ext)) {
        seen.add(f);
        list.push({
          filename: f,
          title: path.parse(f).name.replace(/[-_]/g, ' '),
          url: `${prefix}/${encodeURIComponent(f)}`,
          mediaType: 'video'
        });
      }
    }
  };

  scanDir(MEDIA_DIR, '/media-store');
  scanDir(VIDEOS_DIR, '/videos');
  return list;
}

// Playlists / Repertorios
function getPlaylistsList() {
  const list = [];
  if (fs.existsSync(PLAYLISTS_DIR)) {
    const files = fs.readdirSync(PLAYLISTS_DIR).sort();
    for (const f of files) {
      if (f.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(PLAYLISTS_DIR, f), 'utf-8'));
          list.push(content);
        } catch (e) {}
      }
    }
  }
  return list;
}

function loadInitialPlaylist() {
  const preferredFiles = ['17_10_2026.json', 'servicio_sanacion.json'];
  for (const fname of preferredFiles) {
    const p = path.join(PLAYLISTS_DIR, fname);
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
      } catch (e) {}
    }
  }
  const all = getPlaylistsList();
  if (all.length > 0) return all[0];
  return {
    id: '17_10_2026',
    name: '17/10/2026',
    items: []
  };
}

// ProPresenter global state
let presenterState = {
  mediaMode: 'lyrics', // 'lyrics' | 'video' | 'image' | 'bible' | 'countdown'
  workspaceMode: 'lyrics', // 'lyrics' | 'space'
  currentSongId: null,
  currentSong: null,
  currentSlideIndex: -1,
  currentSpaceId: null,
  currentSpace: null,
  currentSpaceSlideIndex: -1,
  isBlackout: false,
  isTextCleared: false,
  currentVideo: null, // worship background loop behind slides
  videoPlaying: true,
  videoMuted: true,
  currentProgramMedia: null, // { url, filename, mediaType }
  foregroundVideo: {
    url: null,
    filename: null,
    playing: false,
    volume: 1.0,
    muted: false,
    currentTime: 0,
    duration: 0,
    loop: false
  },
  currentBible: {
    reference: 'S.Juan 3:16',
    displayRef: 'Juan 3:16',
    version: 'RVR1960',
    text: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.'
  },
  countdown: {
    active: false,
    running: false,
    totalSeconds: 300,
    remainingSeconds: 300,
    title: 'EL SERVICIO COMIENZA EN',
    endMessage: '¡BIENVENIDOS!'
  },
  activePlaylist: loadInitialPlaylist(),
  theme: 'cinematic',
  fontSize: 'medium',
  connectedDisplays: 0,
  connectedOperators: 0,
  midiConnectedPeers: [],
  lastMidiEvent: null,
  autoAdvanceBpm: true,
  playbackRunning: false
};

// Initialize with first song
const initialSongs = getSongsList();
if (initialSongs.length > 0) {
  presenterState.currentSongId = initialSongs[0].id;
  presenterState.currentSong = initialSongs[0];
  presenterState.currentSlideIndex = 0;
}
const bgVids = getBackgroundVideosList();
if (bgVids.length > 0) {
  presenterState.currentVideo = bgVids[0].url;
}

// ================================================================
//  🎹 APPLE NETWORK MIDI (RTP-MIDI) & PLAYBACK AUTOMATION ENGINE
// ================================================================
const rtpMidi = new RtpMidiManager({
  sessionName: 'Worship Presenter',
  controlPort: 5004,
  dataPort: 5005
});

let autoAdvanceTimer = null;

function stopAutoAdvanceTimer() {
  if (autoAdvanceTimer) {
    clearInterval(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
}

function startAutoAdvanceByBpm() {
  stopAutoAdvanceTimer();
  if (!presenterState.autoAdvanceBpm || !presenterState.currentSong) return;
  const bpm = parseFloat(presenterState.currentSong.bpm) || 72;
  // 4 bars (16 beats) per slide
  const intervalMs = Math.round((60 / bpm) * 16 * 1000);
  autoAdvanceTimer = setInterval(() => {
    if (!presenterState.currentSong || presenterState.mediaMode !== 'lyrics') return;
    const slides = presenterState.currentSong.slides || [];
    if (presenterState.currentSlideIndex < slides.length - 1) {
      presenterState.currentSlideIndex++;
      presenterState.isTextCleared = false;
      console.log(` ⏱️ [Auto-Sync BPM ${bpm}] Avanzando a Diapositiva #${presenterState.currentSlideIndex + 1} (${slides[presenterState.currentSlideIndex]?.label || ''})`);
      broadcastState();
    } else {
      stopAutoAdvanceTimer();
    }
  }, intervalMs);
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
function formatMidiNoteName(note) {
  if (typeof note !== 'number') return '-';
  const name = NOTE_NAMES[note % 12];
  const octave = Math.floor(note / 12) - 2;
  return `${name}${octave} (${note})`;
}

function resolveSongByIndex(zeroBasedIdx) {
  const songs = getSongsList();
  // First check songs in activePlaylist
  if (presenterState.activePlaylist && Array.isArray(presenterState.activePlaylist.items)) {
    const playlistSongs = presenterState.activePlaylist.items.filter(i => i.type === 'song');
    if (playlistSongs[zeroBasedIdx]) {
      const found = songs.find(s => s.id === playlistSongs[zeroBasedIdx].songId);
      if (found) return found;
    }
  }
  return songs[zeroBasedIdx] || null;
}

rtpMidi.on('peers', (peers) => {
  presenterState.midiConnectedPeers = peers;
  io.emit('midi-status', {
    peers,
    lastMidiEvent: presenterState.lastMidiEvent
  });
});

rtpMidi.on('midi', (evt) => {
  let actionTaken = '';

  if (evt.type === 'start') {
    presenterState.mediaMode = 'lyrics';
    presenterState.isBlackout = false;
    presenterState.isTextCleared = false;
    presenterState.playbackRunning = true;
    presenterState.currentSlideIndex = 0;
    const songTitle = presenterState.currentSong ? presenterState.currentSong.title : '';
    actionTaken = `▶ PLAY desde Inicio -> ${songTitle} (Slide #1)`;
    if (presenterState.autoAdvanceBpm) {
      startAutoAdvanceByBpm();
    }
    broadcastState();
  } else if (evt.type === 'continue') {
    presenterState.mediaMode = 'lyrics';
    presenterState.isBlackout = false;
    presenterState.isTextCleared = false;
    presenterState.playbackRunning = true;
    const slides = presenterState.currentSong?.slides || [];
    if (presenterState.currentSlideIndex < 0 || presenterState.currentSlideIndex >= slides.length - 1) {
      presenterState.currentSlideIndex = 0;
    }
    actionTaken = `▶ CONTINUE (Slide #${presenterState.currentSlideIndex + 1})`;
    if (presenterState.autoAdvanceBpm) {
      startAutoAdvanceByBpm();
    }
    broadcastState();
  } else if (evt.type === 'stop') {
    presenterState.playbackRunning = false;
    stopAutoAdvanceTimer();
    actionTaken = '⏹ STOP (Secuencia en Pausa)';
    broadcastState();
  } else if (evt.type === 'spp') {
    if (presenterState.currentSong && presenterState.currentSong.slides) {
      const slides = presenterState.currentSong.slides;
      const targetSlide = evt.velocity === 0 ? 0 : Math.min(Math.floor(evt.velocity / 64), slides.length - 1);
      presenterState.mediaMode = 'lyrics';
      presenterState.currentSlideIndex = targetSlide;
      presenterState.isBlackout = false;
      presenterState.isTextCleared = false;
      actionTaken = `⏩ Posición de Secuencia -> Slide #${targetSlide + 1}`;
      broadcastState();
    }
  } else if (evt.type === 'songselect' || evt.type === 'pc') {
    const idx = evt.type === 'pc' ? evt.program : evt.velocity;
    const targetSong = resolveSongByIndex(idx);
    if (targetSong) {
      presenterState.mediaMode = 'lyrics';
      presenterState.currentSongId = targetSong.id;
      presenterState.currentSong = targetSong;
      presenterState.currentSlideIndex = 0;
      presenterState.isTextCleared = false;
      actionTaken = `🎵 Canción #${idx + 1}: ${targetSong.title}`;
      broadcastState();
    }
  } else if (evt.type === 'noteon') {
    // Explicit MIDI note cue received -> stop fallback timer so explicit cues drive slides
    stopAutoAdvanceTimer();
    const { note, velocity } = evt;

    if (note === 0) {
      presenterState.isBlackout = true;
      actionTaken = '⬛ Blackout (Nota 0)';
      broadcastState();
    } else if (note === 1) {
      presenterState.isTextCleared = true;
      actionTaken = '🚫 Limpiar Letra (Nota 1)';
      broadcastState();
    } else if (note === 18) {
      actionTaken = `📂 Seleccionar Repertorio #${velocity} (Nota 18)`;
    } else if (note === 19) {
      const songIdx = Math.max(0, velocity - 1);
      const targetSong = resolveSongByIndex(songIdx);
      if (targetSong) {
        presenterState.mediaMode = 'lyrics';
        presenterState.currentSongId = targetSong.id;
        presenterState.currentSong = targetSong;
        presenterState.currentSlideIndex = 0;
        presenterState.isBlackout = false;
        presenterState.isTextCleared = false;
        actionTaken = `🎵 Canción #${velocity}: ${targetSong.title}`;
        broadcastState();
      } else {
        actionTaken = `⚠️ Canción #${velocity} no encontrada (Nota 19)`;
      }
    } else if (note === 20) {
      if (presenterState.currentSong && presenterState.currentSong.slides) {
        const slides = presenterState.currentSong.slides;
        const slideIdx = Math.min(Math.max(0, velocity - 1), slides.length - 1);
        presenterState.mediaMode = 'lyrics';
        presenterState.currentSlideIndex = slideIdx;
        presenterState.isBlackout = false;
        presenterState.isTextCleared = false;
        const lbl = slides[slideIdx]?.label || `Slide ${slideIdx + 1}`;
        actionTaken = `⏭️ Diapositiva #${slideIdx + 1} [${lbl}]`;
        broadcastState();
      }
    } else if (note === 21) {
      if (presenterState.currentSong && presenterState.currentSong.slides) {
        const slides = presenterState.currentSong.slides;
        if (presenterState.currentSlideIndex < slides.length - 1) {
          presenterState.currentSlideIndex++;
        }
        presenterState.mediaMode = 'lyrics';
        presenterState.isBlackout = false;
        presenterState.isTextCleared = false;
        actionTaken = `▶ Siguiente Diapositiva (#${presenterState.currentSlideIndex + 1})`;
        broadcastState();
      }
    } else if (note === 22) {
      if (presenterState.currentSong && presenterState.currentSong.slides) {
        if (presenterState.currentSlideIndex > 0) {
          presenterState.currentSlideIndex--;
        }
        presenterState.mediaMode = 'lyrics';
        presenterState.isBlackout = false;
        presenterState.isTextCleared = false;
        actionTaken = `◀ Diapositiva Anterior (#${presenterState.currentSlideIndex + 1})`;
        broadcastState();
      }
    } else {
      if (presenterState.currentSong && presenterState.currentSong.slides) {
        const slides = presenterState.currentSong.slides;
        presenterState.mediaMode = 'lyrics';
        presenterState.isBlackout = false;
        presenterState.isTextCleared = false;

        if (velocity >= 1 && velocity <= slides.length && velocity < 60) {
          presenterState.currentSlideIndex = velocity - 1;
          const lbl = slides[presenterState.currentSlideIndex]?.label || '';
          actionTaken = `⏭️ Diapositiva #${velocity} [${lbl}] (${formatMidiNoteName(note)})`;
        } else {
          if (presenterState.currentSlideIndex < slides.length - 1) {
            presenterState.currentSlideIndex++;
          } else {
            presenterState.currentSlideIndex = 0;
          }
          const lbl = slides[presenterState.currentSlideIndex]?.label || '';
          actionTaken = `▶ Siguiente -> #${presenterState.currentSlideIndex + 1} [${lbl}] (${formatMidiNoteName(note)})`;
        }
        broadcastState();
      }
    }
  }

  if (['noteon', 'pc', 'start', 'continue', 'stop', 'spp', 'songselect'].includes(evt.type)) {
    const summary = {
      timestamp: new Date().toLocaleTimeString(),
      sourceName: evt.sourceName,
      sourceIp: evt.sourceIp,
      type: evt.type,
      channel: evt.channel,
      note: evt.note,
      noteName: evt.note !== null ? formatMidiNoteName(evt.note) : evt.type.toUpperCase(),
      velocity: evt.velocity,
      actionTaken: actionTaken || 'Recibido'
    };
    presenterState.lastMidiEvent = summary;
    console.log(` 🎹 [MIDI ${summary.sourceName}] Ch:${summary.channel} ${summary.noteName} Vel:${summary.velocity ?? '-'} -> ${summary.actionTaken}`);
    io.emit('midi-event', summary);
  }
});

// Countdown timer interval
let countdownInterval = null;

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  presenterState.countdown.running = true;
  countdownInterval = setInterval(() => {
    if (presenterState.countdown.remainingSeconds > 0) {
      presenterState.countdown.remainingSeconds--;
      io.emit('countdown-tick', {
        remainingSeconds: presenterState.countdown.remainingSeconds,
        totalSeconds: presenterState.countdown.totalSeconds,
        running: presenterState.countdown.running
      });
    } else {
      presenterState.countdown.running = false;
      clearInterval(countdownInterval);
      countdownInterval = null;
      io.emit('countdown-ended');
      broadcastState();
    }
  }, 1000);
  broadcastState();
}

function pauseCountdown() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  presenterState.countdown.running = false;
  broadcastState();
}

function resetCountdown() {
  pauseCountdown();
  presenterState.countdown.remainingSeconds = presenterState.countdown.totalSeconds;
  broadcastState();
}

// Helper to project a media item (image or video)
function projectMediaItem(mediaItem) {
  if (!mediaItem) return;
  const mType = mediaItem.mediaType || (/\.(mp4|webm|mov|mkv|m4v)$/i.test(mediaItem.filename || mediaItem.url || '') ? 'video' : 'image');
  if (mType === 'image') {
    presenterState.mediaMode = 'image';
    presenterState.currentProgramMedia = {
      url: mediaItem.url,
      filename: mediaItem.filename || mediaItem.title || path.basename(mediaItem.url),
      title: mediaItem.title || mediaItem.filename,
      mediaType: 'image'
    };
    presenterState.foregroundVideo.playing = false;
    presenterState.isTextCleared = false;
  } else {
    presenterState.mediaMode = 'video';
    presenterState.currentProgramMedia = {
      url: mediaItem.url,
      filename: mediaItem.filename || mediaItem.title || path.basename(mediaItem.url),
      title: mediaItem.title || mediaItem.filename,
      mediaType: 'video'
    };
    presenterState.foregroundVideo.url = mediaItem.url;
    presenterState.foregroundVideo.filename = mediaItem.filename || mediaItem.title || path.basename(mediaItem.url);
    presenterState.foregroundVideo.playing = true;
    presenterState.foregroundVideo.volume = 1.0;
    presenterState.foregroundVideo.muted = false;
    presenterState.foregroundVideo.currentTime = 0;
    presenterState.foregroundVideo.loop = !!mediaItem.loop;
    presenterState.isTextCleared = false;
  }
}

// Broadcasts
function broadcastLibraryUpdate() {
  const songs = getSongsList();
  const backgroundVideos = getBackgroundVideosList();
  const programMedia = getProgramMediaList();
  const playlists = getPlaylistsList();

  if (presenterState.currentSongId) {
    const updated = songs.find(s => s.id === presenterState.currentSongId);
    if (updated) presenterState.currentSong = updated;
  }

  if (presenterState.currentSpaceId && presenterState.activePlaylist && Array.isArray(presenterState.activePlaylist.items)) {
    const updatedSpace = presenterState.activePlaylist.items.find(it => it.type === 'space' && it.id === presenterState.currentSpaceId);
    if (updatedSpace) presenterState.currentSpace = updatedSpace;
  }

  io.emit('library-updated', {
    songs,
    videos: backgroundVideos,
    backgroundVideos,
    programMedia,
    playlists,
    state: presenterState
  });
}

function broadcastState() {
  io.emit('state-changed', presenterState);
}

// Chokidar file watcher
const watcher = chokidar.watch([SONGS_DIR, VIDEOS_DIR, MEDIA_DIR, PLAYLISTS_DIR], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 250, pollInterval: 100 }
});
watcher.on('all', () => broadcastLibraryUpdate());

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    state: presenterState,
    ips: getLocalIpAddresses(),
    port: PORT,
    tunnelUrl,
    isTunnelStarting,
    midiPeers: rtpMidi.getConnectedPeers()
  });
});

app.get('/api/midi', (req, res) => {
  res.json({
    sessionName: rtpMidi.sessionName,
    controlPort: rtpMidi.controlPort,
    dataPort: rtpMidi.dataPort,
    peers: rtpMidi.getConnectedPeers(),
    lastMidiEvent: presenterState.lastMidiEvent,
    autoAdvanceBpm: presenterState.autoAdvanceBpm
  });
});

app.post('/api/midi/connect', (req, res) => {
  const { ip, port, name } = req.body;
  if (!ip) return res.status(400).json({ error: 'IP requerida' });
  rtpMidi.ensurePeerInvited(ip.trim(), parseInt(port, 10) || 5004, name || ip.trim());
  res.json({ success: true, peers: rtpMidi.getConnectedPeers() });
});

app.get('/api/tunnel', (req, res) => {
  res.json({ active: !!tunnelUrl, tunnelUrl, isStarting: isTunnelStarting });
});

app.post('/api/tunnel/start', async (req, res) => {
  try {
    const url = await startCloudflareTunnel();
    res.json({ success: true, tunnelUrl: url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tunnel/stop', async (req, res) => {
  await stopCloudflareTunnel();
  res.json({ success: true });
});

app.get('/api/songs', (req, res) => res.json(getSongsList()));
app.get('/api/videos', (req, res) => res.json(getBackgroundVideosList()));
app.get('/api/background-videos', (req, res) => res.json(getBackgroundVideosList()));
app.get('/api/media', (req, res) => res.json(getProgramMediaList()));
app.get('/api/playlists', (req, res) => res.json(getPlaylistsList()));

// Playlists API
app.post('/api/playlists', (req, res) => {
  const { id, name, items } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const safeId = (id || name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')) || `repertorio_${Date.now()}`;
  const playlistObj = {
    id: safeId,
    name,
    updatedAt: new Date().toISOString(),
    items: Array.isArray(items) ? items : []
  };

  fs.writeFileSync(path.join(PLAYLISTS_DIR, `${safeId}.json`), JSON.stringify(playlistObj, null, 2), 'utf-8');
  presenterState.activePlaylist = playlistObj;
  broadcastLibraryUpdate();
  res.json({ success: true, playlist: playlistObj });
});

app.post('/api/playlists/active', (req, res) => {
  const { id } = req.body;
  const pPath = path.join(PLAYLISTS_DIR, `${id}.json`);
  if (fs.existsSync(pPath)) {
    presenterState.activePlaylist = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
    broadcastState();
    res.json({ success: true, playlist: presenterState.activePlaylist });
  } else {
    res.status(404).json({ error: 'Playlist not found' });
  }
});

// Bible API
app.get('/api/bible/versions', (req, res) => {
  const files = fs.readdirSync(BIBLES_DIR);
  const versions = [
    { id: 'rvr1960', name: 'Reina Valera 1960 (RVR1960)', downloaded: files.some(f => f.includes('rvr1960')) },
    { id: 'rva', name: 'Reina Valera Actualizada (RVA)', downloaded: files.some(f => f.includes('rva')) },
    { id: 'ntv', name: 'Nueva Traducción Viviente (NTV)', downloaded: files.some(f => f.includes('ntv')) },
    { id: 'nvi', name: 'Nueva Versión Internacional (NVI)', downloaded: files.some(f => f.includes('nvi')) }
  ];
  res.json(versions);
});

app.get('/api/bible/books', (req, res) => {
  res.json(CANONICAL_BOOKS);
});

app.get('/api/bible/query', (req, res) => {
  const { version = 'rvr1960', book, chapter = '1', verse = '1', verseEnd } = req.query;
  const bible = getBibleData(version);
  if (!bible) return res.status(404).json({ error: `Versión ${version} no encontrada en el servidor` });

  const resolved = resolveBookInBible(bible, book);
  if (!resolved || !resolved.bookObj) {
    return res.status(404).json({ error: `Libro '${book}' no encontrado en la versión` });
  }

  const chObj = resolved.bookObj[String(chapter)];
  if (!chObj) {
    return res.status(404).json({ error: `Capítulo ${chapter} no encontrado en ${book}` });
  }

  const vStart = parseInt(verse, 10);
  const vEnd = verseEnd ? parseInt(verseEnd, 10) : vStart;

  let combinedText = [];
  for (let v = vStart; v <= vEnd; v++) {
    const text = chObj[String(v)];
    if (text) {
      combinedText.push(vStart === vEnd ? text.trim() : `(${v}) ${text.trim()}`);
    }
  }

  if (combinedText.length === 0) {
    return res.status(404).json({ error: `Versículo ${verse} no encontrado en ${book} ${chapter}` });
  }

  const dispBook = resolved.displayName || book;
  const refString = vStart === vEnd ? `${dispBook} ${chapter}:${vStart}` : `${dispBook} ${chapter}:${vStart}-${vEnd}`;

  res.json({
    success: true,
    reference: refString,
    displayRef: refString,
    book: dispBook,
    chapter: parseInt(chapter, 10),
    verseStart: vStart,
    verseEnd: vEnd,
    text: combinedText.join(' '),
    version: version.toUpperCase()
  });
});

app.post('/api/bible/download', async (req, res) => {
  const { version } = req.body;
  const verClean = (version || '').toLowerCase().trim();
  const remoteMap = {
    'ntv': 'https://raw.githubusercontent.com/mrk214/bible-data-es-spa/main/data/es___spa___spa/NTV_vid_127.json',
    'nvi': 'https://raw.githubusercontent.com/mrk214/bible-data-es-spa/main/data/es___spa___spa/NVI_vid_128.json',
    'rvr1960': 'https://raw.githubusercontent.com/dscottpi/bibles/master/RVR1960-Spanish.json',
    'rva': 'https://raw.githubusercontent.com/dscottpi/bibles/master/RVA.json'
  };

  const remoteUrl = remoteMap[verClean];
  if (!remoteUrl) return res.status(400).json({ error: 'Versión desconocida o no disponible para descarga' });

  try {
    const dest = path.join(BIBLES_DIR, `${verClean}.json`);
    const resp = await fetch(remoteUrl);
    if (!resp.ok) throw new Error(`HTTP error ${resp.status}`);
    const data = await resp.text();
    fs.writeFileSync(dest, data, 'utf-8');
    delete loadedBibles[verClean]; // invalidate cache
    res.json({ success: true, message: `Versión ${version} descargada con éxito` });
  } catch (err) {
    res.status(500).json({ error: `Error descargando versión: ${err.message}` });
  }
});

app.post('/api/songs', (req, res) => {
  const { title, artist, key, bpm, content, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const safeFilename = (filename || `${Date.now()}-${title || 'cancion'}.txt`).replace(/[^a-zA-Z0-9._-]/g, '_');
  const filepath = path.join(SONGS_DIR, safeFilename);

  fs.writeFileSync(filepath, content, 'utf-8');
  const parsed = parseSongFile(filepath);
  broadcastLibraryUpdate();
  res.json({ success: true, song: parsed });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const folder = path.basename(req.file.destination);
  const ext = path.extname(req.file.filename).toLowerCase();
  const isVideo = ['.mp4', '.webm', '.mov', '.mkv', '.m4v'].includes(ext);
  const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
  const prefix = folder === 'videos' ? '/videos' : (folder === 'media' ? '/media-store' : '/songs-media');
  const url = `${prefix}/${encodeURIComponent(req.file.filename)}`;
  const mediaType = isVideo ? 'video' : (isImage ? 'image' : 'file');

  broadcastLibraryUpdate();
  res.json({
    success: true,
    file: req.file.filename,
    title: path.parse(req.file.filename).name.replace(/[-_]/g, ' '),
    folder,
    url,
    mediaType
  });
});

// Socket.IO event handling
io.on('connection', (socket) => {
  const clientType = socket.handshake.query.type || 'operator';
  if (clientType === 'display') {
    presenterState.connectedDisplays++;
  } else {
    presenterState.connectedOperators++;
  }

  const bgVideos = getBackgroundVideosList();
  socket.emit('init', {
    state: presenterState,
    songs: getSongsList(),
    videos: bgVideos,
    backgroundVideos: bgVideos,
    programMedia: getProgramMediaList(),
    playlists: getPlaylistsList(),
    canonicalBooks: CANONICAL_BOOKS,
    ips: getLocalIpAddresses(),
    tunnelUrl,
    midiPeers: rtpMidi.getConnectedPeers(),
    lastMidiEvent: presenterState.lastMidiEvent
  });

  io.emit('displays-count', {
    displays: presenterState.connectedDisplays,
    operators: presenterState.connectedOperators
  });

  // Song controls
  socket.on('select-song', (data) => {
    const songs = getSongsList();
    const song = songs.find(s => s.id === data.songId);
    if (song) {
      presenterState.workspaceMode = 'lyrics';
      presenterState.mediaMode = 'lyrics';
      presenterState.currentSongId = song.id;
      presenterState.currentSong = song;
      presenterState.currentSlideIndex = typeof data.slideIndex === 'number' ? data.slideIndex : 0;
      presenterState.isTextCleared = false;
      presenterState.foregroundVideo.playing = false;
      broadcastState();
    }
  });

  // Repertorio Space ("Espacio") controls
  socket.on('select-space', (data) => {
    if (!data || !data.spaceId) return;
    const items = (presenterState.activePlaylist && presenterState.activePlaylist.items) || [];
    const space = items.find(it => it.type === 'space' && it.id === data.spaceId) || data.space;
    if (space) {
      presenterState.workspaceMode = 'space';
      presenterState.currentSpaceId = space.id;
      presenterState.currentSpace = space;
      const spaceItems = space.items || [];
      if (typeof data.slideIndex === 'number' && data.slideIndex >= 0 && spaceItems[data.slideIndex]) {
        presenterState.currentSpaceSlideIndex = data.slideIndex;
        projectMediaItem(spaceItems[data.slideIndex]);
      } else if (data.autoProjectFirst && spaceItems.length > 0) {
        presenterState.currentSpaceSlideIndex = 0;
        projectMediaItem(spaceItems[0]);
      } else {
        presenterState.currentSpaceSlideIndex = -1;
      }
      broadcastState();
    }
  });

  socket.on('go-to-space-slide', (data) => {
    if (!presenterState.currentSpace && data && data.spaceId && presenterState.activePlaylist) {
      presenterState.currentSpace = (presenterState.activePlaylist.items || []).find(
        it => it.type === 'space' && it.id === data.spaceId
      );
      if (presenterState.currentSpace) presenterState.currentSpaceId = presenterState.currentSpace.id;
    }
    if (!presenterState.currentSpace || !Array.isArray(presenterState.currentSpace.items)) return;
    const spaceItems = presenterState.currentSpace.items;
    if (spaceItems.length === 0) return;

    let idx = parseInt(data.index, 10);
    if (isNaN(idx) || idx < 0) idx = 0;
    if (idx >= spaceItems.length) idx = spaceItems.length - 1;

    presenterState.workspaceMode = 'space';
    presenterState.currentSpaceSlideIndex = idx;
    projectMediaItem(spaceItems[idx]);
    broadcastState();
  });

  socket.on('go-to-slide', (data) => {
    if (!presenterState.currentSong) return;
    presenterState.workspaceMode = 'lyrics';
    presenterState.mediaMode = 'lyrics';
    const maxIdx = presenterState.currentSong.slides.length - 1;
    let idx = parseInt(data.index, 10);
    if (isNaN(idx)) idx = 0;
    if (idx < 0) idx = 0;
    if (idx > maxIdx) idx = maxIdx;

    presenterState.currentSlideIndex = idx;
    presenterState.isTextCleared = false;
    broadcastState();
  });

  socket.on('next-slide', () => {
    if (presenterState.workspaceMode === 'space' && presenterState.currentSpace && Array.isArray(presenterState.currentSpace.items)) {
      const spaceItems = presenterState.currentSpace.items;
      if (spaceItems.length > 0 && presenterState.currentSpaceSlideIndex < spaceItems.length - 1) {
        presenterState.currentSpaceSlideIndex++;
        projectMediaItem(spaceItems[presenterState.currentSpaceSlideIndex]);
        broadcastState();
      }
      return;
    }
    if (presenterState.mediaMode !== 'lyrics') return;
    if (!presenterState.currentSong) return;
    const slides = presenterState.currentSong.slides;
    if (presenterState.currentSlideIndex < slides.length - 1) {
      presenterState.currentSlideIndex++;
      presenterState.isTextCleared = false;
      broadcastState();
    }
  });

  socket.on('prev-slide', () => {
    if (presenterState.workspaceMode === 'space' && presenterState.currentSpace && Array.isArray(presenterState.currentSpace.items)) {
      const spaceItems = presenterState.currentSpace.items;
      if (spaceItems.length > 0 && presenterState.currentSpaceSlideIndex > 0) {
        presenterState.currentSpaceSlideIndex--;
        projectMediaItem(spaceItems[presenterState.currentSpaceSlideIndex]);
        broadcastState();
      }
      return;
    }
    if (presenterState.mediaMode !== 'lyrics') return;
    if (!presenterState.currentSong) return;
    if (presenterState.currentSlideIndex > 0) {
      presenterState.currentSlideIndex--;
      presenterState.isTextCleared = false;
      broadcastState();
    }
  });

  socket.on('toggle-blackout', (val) => {
    presenterState.isBlackout = typeof val === 'boolean' ? val : !presenterState.isBlackout;
    broadcastState();
  });

  socket.on('toggle-clear-text', (val) => {
    presenterState.isTextCleared = typeof val === 'boolean' ? val : !presenterState.isTextCleared;
    broadcastState();
  });

  // Background video loop behind lyrics
  socket.on('select-video', (data) => {
    presenterState.currentVideo = data.url || null;
    presenterState.videoPlaying = true;
    broadcastState();
  });

  // Program Media Projection (Image or Video)
  socket.on('project-media', (data) => {
    if (data && data.spaceId && typeof data.slideIndex === 'number') {
      presenterState.workspaceMode = 'space';
      presenterState.currentSpaceId = data.spaceId;
      presenterState.currentSpaceSlideIndex = data.slideIndex;
    }
    projectMediaItem(data);
    broadcastState();
  });

  socket.on('stop-foreground-video', () => {
    presenterState.mediaMode = 'lyrics';
    presenterState.foregroundVideo.playing = false;
    presenterState.foregroundVideo.url = null;
    broadcastState();
  });

  socket.on('control-foreground-video', (data) => {
    if (data.action === 'play') presenterState.foregroundVideo.playing = true;
    else if (data.action === 'pause') presenterState.foregroundVideo.playing = false;
    else if (data.action === 'toggle') presenterState.foregroundVideo.playing = !presenterState.foregroundVideo.playing;
    else if (data.action === 'volume') presenterState.foregroundVideo.volume = data.value;
    else if (data.action === 'mute-toggle') presenterState.foregroundVideo.muted = !presenterState.foregroundVideo.muted;
    else if (data.action === 'loop-toggle') presenterState.foregroundVideo.loop = !presenterState.foregroundVideo.loop;
    else if (data.action === 'seek') {
      presenterState.foregroundVideo.currentTime = data.value;
      io.emit('seek-foreground-video', { time: data.value });
    }
    broadcastState();
  });

  socket.on('sync-video-time', (data) => {
    presenterState.foregroundVideo.currentTime = data.currentTime;
    presenterState.foregroundVideo.duration = data.duration;
    io.emit('video-time-update', data);
  });

  // Bible Projection
  socket.on('project-bible', (data) => {
    presenterState.mediaMode = 'bible';
    presenterState.currentBible = {
      reference: data.reference,
      displayRef: data.displayRef || data.reference,
      version: data.version || 'RVR1960',
      text: data.text
    };
    presenterState.isTextCleared = false;
    broadcastState();
  });

  // Countdown Controls
  socket.on('countdown-config', (data) => {
    presenterState.countdown.totalSeconds = data.totalSeconds || 300;
    presenterState.countdown.remainingSeconds = data.totalSeconds || 300;
    if (data.title) presenterState.countdown.title = data.title;
    if (data.endMessage) presenterState.countdown.endMessage = data.endMessage;
    broadcastState();
  });

  socket.on('countdown-start', (data) => {
    if (data && data.totalSeconds) {
      presenterState.countdown.totalSeconds = data.totalSeconds;
      presenterState.countdown.remainingSeconds = data.totalSeconds;
      if (data.title) presenterState.countdown.title = data.title;
      if (data.endMessage) presenterState.countdown.endMessage = data.endMessage;
    }
    presenterState.countdown.active = true;
    startCountdown();
  });

  socket.on('countdown-pause', () => pauseCountdown());
  socket.on('countdown-resume', () => startCountdown());
  socket.on('countdown-reset', () => resetCountdown());
  
  socket.on('countdown-project', (val) => {
    if (typeof val === 'boolean') {
      presenterState.mediaMode = val ? 'countdown' : 'lyrics';
      presenterState.countdown.active = val;
    } else {
      presenterState.mediaMode = presenterState.mediaMode === 'countdown' ? 'lyrics' : 'countdown';
      presenterState.countdown.active = (presenterState.mediaMode === 'countdown');
    }
    broadcastState();
  });

  // Playlist management via Socket
  socket.on('update-active-playlist', (playlist) => {
    presenterState.activePlaylist = playlist;
    if (presenterState.currentSpaceId && Array.isArray(playlist.items)) {
      const updatedSpace = playlist.items.find(it => it.type === 'space' && it.id === presenterState.currentSpaceId);
      if (updatedSpace) {
        presenterState.currentSpace = updatedSpace;
      }
    }
    const pPath = path.join(PLAYLISTS_DIR, `${playlist.id}.json`);
    fs.writeFileSync(pPath, JSON.stringify(playlist, null, 2), 'utf-8');
    broadcastState();
  });

  socket.on('set-theme', (theme) => {
    presenterState.theme = theme;
    broadcastState();
  });

  socket.on('set-font-size', (fontSize) => {
    presenterState.fontSize = fontSize;
    broadcastState();
  });

  socket.on('toggle-auto-advance-bpm', (val) => {
    presenterState.autoAdvanceBpm = typeof val === 'boolean' ? val : !presenterState.autoAdvanceBpm;
    if (!presenterState.autoAdvanceBpm) {
      stopAutoAdvanceTimer();
    }
    broadcastState();
  });

  socket.on('midi-connect-ip', (data) => {
    if (data && data.ip) {
      rtpMidi.ensurePeerInvited(data.ip.trim(), parseInt(data.port, 10) || 5004, data.name || data.ip.trim());
    }
  });

  socket.on('disconnect', () => {
    if (clientType === 'display') {
      presenterState.connectedDisplays = Math.max(0, presenterState.connectedDisplays - 1);
    } else {
      presenterState.connectedOperators = Math.max(0, presenterState.connectedOperators - 1);
    }
    io.emit('displays-count', {
      displays: presenterState.connectedDisplays,
      operators: presenterState.connectedOperators
    });
  });
});

app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

const shouldStartTunnel = process.argv.includes('--tunnel') ||
                          process.argv.includes('-t') ||
                          process.argv.includes('--cloudflare') ||
                          process.env.TUNNEL === 'true' ||
                          process.env.TUNNEL === '1';

server.listen(PORT, '0.0.0.0', async () => {
  const ips = getLocalIpAddresses();
  console.log('\n================================================================');
  console.log('   🕊️  SANACIÓN SIN LÍMITES - SISTEMA DE PROYECCIÓN WORSHIP 2.0  ');
  console.log('================================================================');
  console.log(` 💻 Panel de Control (Laptop):      http://localhost:${PORT}`);
  console.log(` 📽️ Pantalla Proyector (HDMI):      http://localhost:${PORT}/display`);
  console.log(' 📱 Control Remoto (Celular/WiFi):');
  if (ips.length === 0) {
    console.log(`    (Conecta tu laptop a una red WiFi para obtener IP local)`);
  } else {
    for (const ip of ips) {
      console.log(`    👉 http://${ip.address}:${PORT} (${ip.interface})`);
    }
  }

  if (shouldStartTunnel) {
    try {
      await startCloudflareTunnel();
    } catch (err) {
      console.error('Error al auto-iniciar el túnel:', err.message);
    }
  } else {
    console.log(' 🌐 Túnel Cloudflare:               Desactivado (usa --tunnel para activarlo)');
  }

  console.log('----------------------------------------------------------------');
  console.log(` 📂 Canciones:      ${SONGS_DIR}`);
  console.log(` 🎬 Fondos Loop:    ${VIDEOS_DIR}`);
  console.log(` 🖼️ Medios Programa:${MEDIA_DIR}`);
  console.log(` 📜 Playlists:      ${PLAYLISTS_DIR}`);
  console.log(` 📖 Biblias:        ${BIBLES_DIR}`);
  console.log('----------------------------------------------------------------');
  rtpMidi.start();
  console.log('================================================================\n');
});
