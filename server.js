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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const SONGS_DIR = path.join(__dirname, 'songs');
const VIDEOS_DIR = path.join(__dirname, 'videos');

// Ensure directories exist
if (!fs.existsSync(SONGS_DIR)) fs.mkdirSync(SONGS_DIR, { recursive: true });
if (!fs.existsSync(VIDEOS_DIR)) fs.mkdirSync(VIDEOS_DIR, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/videos', express.static(VIDEOS_DIR));
app.use('/songs-media', express.static(SONGS_DIR));

// Configure multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.mp4', '.webm', '.mov', '.mkv'].includes(ext)) {
      cb(null, VIDEOS_DIR);
    } else {
      cb(null, SONGS_DIR);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// Helper to get local network IPv4 addresses
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

// Parse song text format
function parseSongFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const filename = path.basename(filepath);
  const id = path.parse(filename).name;

  let title = id.replace(/^[0-9]+[-_]?/, '').replace(/[-_]/g, ' ');
  // Capitalize title
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

    // Parse header fields if at top
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

    // Section header e.g. [Verso 1] or [Coro]
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

    // Blank line might separate slides if not marked with [Section]
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

  // Push last slide
  if (currentLines.length > 0) {
    slides.push({
      id: `${id}-s${slides.length + 1}`,
      label: currentLabel,
      text: currentLines.join('\n').trim()
    });
  }

  return {
    id,
    filename,
    title,
    artist,
    key,
    bpm,
    slidesCount: slides.length,
    slides
  };
}

// Load all songs
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
      console.error(`Error parsing song file ${f}:`, err);
    }
  }
  return songs;
}

// Load all videos from ./videos and ./songs
function getVideosList() {
  const videoExts = ['.mp4', '.webm', '.mov', '.mkv', '.m4v'];
  const videos = [];

  const scanDir = (dir, urlPrefix) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      if (videoExts.includes(ext)) {
        videos.push({
          filename: f,
          url: `${urlPrefix}/${encodeURIComponent(f)}`,
          folder: path.basename(dir)
        });
      }
    }
  };

  scanDir(VIDEOS_DIR, '/videos');
  scanDir(SONGS_DIR, '/songs-media');
  return videos;
}

// ProPresenter global state
let presenterState = {
  currentSongId: null,
  currentSong: null,
  currentSlideIndex: -1,
  isBlackout: false,
  isTextCleared: false,
  currentVideo: null,
  videoPlaying: true,
  videoMuted: true,
  theme: 'cinematic',
  fontSize: 'medium', // small, medium, large, xlarge
  connectedDisplays: 0,
  connectedOperators: 0
};

// Initialize with first song if available
const initialSongs = getSongsList();
if (initialSongs.length > 0) {
  presenterState.currentSongId = initialSongs[0].id;
  presenterState.currentSong = initialSongs[0];
  presenterState.currentSlideIndex = 0;
}
const initialVideos = getVideosList();
if (initialVideos.length > 0) {
  presenterState.currentVideo = initialVideos[0].url;
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json({
    state: presenterState,
    ips: getLocalIpAddresses(),
    port: PORT
  });
});

app.get('/api/songs', (req, res) => {
  res.json(getSongsList());
});

app.get('/api/videos', (req, res) => {
  res.json(getVideosList());
});

app.post('/api/songs', (req, res) => {
  const { title, artist, key, bpm, content, filename } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  const safeFilename = (filename || `${Date.now()}-${title || 'cancion'}.txt`)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const filepath = path.join(SONGS_DIR, safeFilename);

  fs.writeFileSync(filepath, content, 'utf-8');
  const parsed = parseSongFile(filepath);
  broadcastLibraryUpdate();
  res.json({ success: true, song: parsed });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  broadcastLibraryUpdate();
  res.json({ success: true, file: req.file.filename });
});

// Broadcast library changes
function broadcastLibraryUpdate() {
  const songs = getSongsList();
  const videos = getVideosList();
  
  // Refresh current song reference if updated
  if (presenterState.currentSongId) {
    const updated = songs.find(s => s.id === presenterState.currentSongId);
    if (updated) presenterState.currentSong = updated;
  }

  io.emit('library-updated', { songs, videos, state: presenterState });
}

// Broadcast presenter state
function broadcastState() {
  io.emit('state-changed', presenterState);
}

// Watchers for automatic hot-reloading of folder content
const watcher = chokidar.watch([SONGS_DIR, VIDEOS_DIR], {
  ignoreInitial: true,
  awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 }
});
watcher.on('all', () => {
  broadcastLibraryUpdate();
});

// Socket.IO event handling
io.on('connection', (socket) => {
  const clientType = socket.handshake.query.type || 'operator';
  if (clientType === 'display') {
    presenterState.connectedDisplays++;
  } else {
    presenterState.connectedOperators++;
  }

  // Send current state and library to newly connected client
  socket.emit('init', {
    state: presenterState,
    songs: getSongsList(),
    videos: getVideosList(),
    ips: getLocalIpAddresses()
  });

  // Notify all operators of display count
  io.emit('displays-count', {
    displays: presenterState.connectedDisplays,
    operators: presenterState.connectedOperators
  });

  // Select song
  socket.on('select-song', (data) => {
    const songs = getSongsList();
    const song = songs.find(s => s.id === data.songId);
    if (song) {
      presenterState.currentSongId = song.id;
      presenterState.currentSong = song;
      presenterState.currentSlideIndex = typeof data.slideIndex === 'number' ? data.slideIndex : 0;
      presenterState.isTextCleared = false;
      broadcastState();
    }
  });

  // Jump to specific slide
  socket.on('go-to-slide', (data) => {
    if (!presenterState.currentSong) return;
    const maxIdx = presenterState.currentSong.slides.length - 1;
    let idx = parseInt(data.index, 10);
    if (isNaN(idx)) idx = 0;
    if (idx < 0) idx = 0;
    if (idx > maxIdx) idx = maxIdx;

    presenterState.currentSlideIndex = idx;
    presenterState.isTextCleared = false;
    broadcastState();
  });

  // Next slide
  socket.on('next-slide', () => {
    if (!presenterState.currentSong) return;
    const slides = presenterState.currentSong.slides;
    if (presenterState.currentSlideIndex < slides.length - 1) {
      presenterState.currentSlideIndex++;
      presenterState.isTextCleared = false;
      broadcastState();
    }
  });

  // Previous slide
  socket.on('prev-slide', () => {
    if (!presenterState.currentSong) return;
    if (presenterState.currentSlideIndex > 0) {
      presenterState.currentSlideIndex--;
      presenterState.isTextCleared = false;
      broadcastState();
    }
  });

  // Blackout toggle / set
  socket.on('toggle-blackout', (val) => {
    presenterState.isBlackout = typeof val === 'boolean' ? val : !presenterState.isBlackout;
    broadcastState();
  });

  // Clear text toggle / set
  socket.on('toggle-clear-text', (val) => {
    presenterState.isTextCleared = typeof val === 'boolean' ? val : !presenterState.isTextCleared;
    broadcastState();
  });

  // Select video
  socket.on('select-video', (data) => {
    presenterState.currentVideo = data.url || null;
    presenterState.videoPlaying = true;
    broadcastState();
  });

  // Control video (play, pause, stop, toggle)
  socket.on('video-control', (action) => {
    if (action === 'toggle') {
      presenterState.videoPlaying = !presenterState.videoPlaying;
    } else if (action === 'play') {
      presenterState.videoPlaying = true;
    } else if (action === 'pause') {
      presenterState.videoPlaying = false;
    } else if (action === 'stop' || action === 'clear') {
      presenterState.currentVideo = null;
    } else if (action === 'mute-toggle') {
      presenterState.videoMuted = !presenterState.videoMuted;
    }
    broadcastState();
  });

  // Visual styling
  socket.on('set-theme', (theme) => {
    presenterState.theme = theme;
    broadcastState();
  });

  socket.on('set-font-size', (fontSize) => {
    presenterState.fontSize = fontSize;
    broadcastState();
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

// Direct route for display
app.get('/display', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'display.html'));
});

// Start listening on 0.0.0.0
server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log('\n================================================================');
  console.log('   🕊️  SANACIÓN SIN LÍMITES - SISTEMA DE PROYECCIÓN WORSHIP   ');
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
  console.log('----------------------------------------------------------------');
  console.log(` 📂 Carpeta de Canciones:  ${SONGS_DIR}`);
  console.log(` 🎬 Carpeta de Videos:     ${VIDEOS_DIR}`);
  console.log('================================================================\n');
});
