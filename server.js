import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// ── API Key for simple auth ──────────────────────────────────────────
// Set STUDYFLOW_API_KEY env var to enable. If unset, auth is disabled (local dev).
const API_KEY = process.env.STUDYFLOW_API_KEY || '';

// ── Rate Limiting (simple in-memory) ─────────────────────────────────
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 60; // max requests per window per IP

const rateLimit = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(ip, { start: now, count: 1 });
    return next();
  }
  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
};

// Periodically clean up expired entries
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore) {
    if (now - entry.start > RATE_LIMIT_WINDOW) rateLimitStore.delete(ip);
  }
}, RATE_LIMIT_WINDOW);

// ── Middleware ─────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit);

// ── Simple API key auth middleware ────────────────────────────────────
const requireAuth = (req, res, next) => {
  if (!API_KEY) return next(); // no key configured = open (dev mode)
  const provided = req.headers['x-api-key'] || req.query.apiKey;
  if (!provided || !crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(API_KEY))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api', requireAuth);

// ── Ensure data directory exists ──────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Created data directory: ${DATA_DIR}`);
}

// ── Helpers ───────────────────────────────────────────────────────────
const readJSON = (filename, fallback = null) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(filepath)) {
      return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    }
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
  }
  return fallback;
};

const writeJSON = (filename, data) => {
  const filepath = path.join(DATA_DIR, filename);
  const tmppath = filepath + '.tmp';
  try {
    fs.writeFileSync(tmppath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tmppath, filepath);
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    try { fs.unlinkSync(tmppath); } catch { /* best-effort cleanup */ }
    return false;
  }
};

// Sanitize profile IDs to prevent path traversal
const sanitizeId = (id) => {
  if (!id || typeof id !== 'string') return 'default';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
};

const deleteIfExists = (filepath) => {
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (err) {
    console.warn(`Could not delete ${path.basename(filepath)}:`, err.message);
  }
};

// ── Input Validation Helpers ─────────────────────────────────────────────
const MAX_PAYLOAD_SIZE = 100 * 1024; // 100KB max per write
const MAX_ARRAY_ITEMS = 5000; // max items in arrays

const isValidProfile = (profile) => {
  if (!profile || typeof profile !== 'object') return false;
  if (!profile.id || typeof profile.id !== 'string') return false;
  if (profile.id.length > 100) return false;
  if (profile.name && typeof profile.name !== 'string') return false;
  if (profile.name && profile.name.length > 100) return false;
  if (profile.email && typeof profile.email !== 'string') return false;
  if (profile.email && profile.email.length > 200) return false;
  return true;
};

const isValidEntries = (entries) => {
  if (!Array.isArray(entries)) return false;
  if (entries.length > MAX_ARRAY_ITEMS) return false;
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') return false;
    if (!entry.date || typeof entry.date !== 'string') return false;
    if (entry.date.length > 20) return false;
    if (entry.todayTasks && !Array.isArray(entry.todayTasks)) return false;
    if (entry.todayTasks && entry.todayTasks.length > 100) return false;
    for (const task of (entry.todayTasks || [])) {
      if (!task || typeof task !== 'object') return false;
      if (task.text && typeof task.text !== 'string') return false;
      if (task.text && task.text.length > 500) return false;
    }
  }
  return true;
};

const isValidChat = (chat) => {
  if (!Array.isArray(chat)) return false;
  if (chat.length > 500) return false; // limit chat history
  for (const msg of chat) {
    if (!msg || typeof msg !== 'object') return false;
    if (!msg.role || typeof msg.role !== 'string') return false;
    if (!msg.content || typeof msg.content !== 'string') return false;
    if (msg.content.length > 2000) return false;
  }
  return true;
};

const isValidPromoted = (promoted) => {
  if (!Array.isArray(promoted)) return false;
  if (promoted.length > 100) return false;
  for (const date of promoted) {
    if (typeof date !== 'string') return false;
    if (date.length > 20) return false;
  }
  return true;
};

// ── PROFILES ──────────────────────────────────────────────────────────

// GET /api/profiles — list all profiles
app.get('/api/profiles', (req, res) => {
  const profiles = readJSON('profiles.json', []);
  res.json(profiles);
});

// POST /api/profiles — create or update a profile
app.post('/api/profiles', (req, res) => {
  const profile = req.body;
  if (!isValidProfile(profile)) {
    return res.status(400).json({ error: 'Invalid profile data' });
  }

  const profiles = readJSON('profiles.json', []);
  if (profiles.length > 50) {
    return res.status(400).json({ error: 'Too many profiles' });
  }
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }

  writeJSON('profiles.json', profiles);
  res.json({ ok: true, profile });
});

// DELETE /api/profiles/:id — delete a profile and its data
app.delete('/api/profiles/:id', (req, res) => {
  const id = sanitizeId(req.params.id);
  let profiles = readJSON('profiles.json', []);
  profiles = profiles.filter(p => p.id !== id);
  writeJSON('profiles.json', profiles);

  // Also delete associated data files
  const entriesFile = path.join(DATA_DIR, `entries_${id}.json`);
  const promotedFile = path.join(DATA_DIR, `promoted_${id}.json`);
  const chatFile = path.join(DATA_DIR, `chat_${id}.json`);
  deleteIfExists(entriesFile);
  deleteIfExists(promotedFile);
  deleteIfExists(chatFile);

  res.json({ ok: true });
});

// ── ACTIVE PROFILE ────────────────────────────────────────────────────

// GET /api/active — get active profile ID
app.get('/api/active', (req, res) => {
  const data = readJSON('active.json', { activeId: null });
  res.json(data);
});

// POST /api/active — set active profile ID
app.post('/api/active', (req, res) => {
  const { activeId } = req.body;
  if (activeId !== null && typeof activeId !== 'string') {
    return res.status(400).json({ error: 'Invalid activeId' });
  }
  if (activeId && activeId.length > 100) {
    return res.status(400).json({ error: 'Invalid activeId' });
  }
  writeJSON('active.json', { activeId });
  res.json({ ok: true });
});

// ── ENTRIES ───────────────────────────────────────────────────────────

// GET /api/entries/:profileId — get entries for a profile
app.get('/api/entries/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const entries = readJSON(`entries_${id}.json`, []);
  res.json(entries);
});

// POST /api/entries/:profileId — save entries for a profile
app.post('/api/entries/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const entries = req.body;
  if (!isValidEntries(entries)) {
    return res.status(400).json({ error: 'Invalid entries data' });
  }
  const payloadSize = JSON.stringify(entries).length;
  if (payloadSize > MAX_PAYLOAD_SIZE) {
    return res.status(400).json({ error: 'Payload too large' });
  }
  writeJSON(`entries_${id}.json`, entries);
  res.json({ ok: true });
});

// ── PROMOTED ──────────────────────────────────────────────────────────

// GET /api/promoted/:profileId — get promotion records
app.get('/api/promoted/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const promoted = readJSON(`promoted_${id}.json`, []);
  res.json(promoted);
});

// POST /api/promoted/:profileId — save promotion records
app.post('/api/promoted/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const promoted = req.body;
  if (!isValidPromoted(promoted)) {
    return res.status(400).json({ error: 'Invalid promoted data' });
  }
  writeJSON(`promoted_${id}.json`, promoted);
  res.json({ ok: true });
});

// ── CHAT HISTORY ──────────────────────────────────────────────────────

// GET /api/chat/:profileId — get chat history
app.get('/api/chat/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const chat = readJSON(`chat_${id}.json`, []);
  res.json(chat);
});

// POST /api/chat/:profileId — save chat history
app.post('/api/chat/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const chat = req.body;
  if (!isValidChat(chat)) {
    return res.status(400).json({ error: 'Invalid chat data' });
  }
  writeJSON(`chat_${id}.json`, chat);
  res.json({ ok: true });
});

// ── CONNECTIONS (flexible external platform stats) ────────────────────

const isValidConnections = (connections) => {
  if (!Array.isArray(connections)) return false;
  if (connections.length > 50) return false;
  for (const conn of connections) {
    if (!conn || typeof conn !== 'object') return false;
    if (!conn.id || typeof conn.id !== 'string') return false;
    if (!conn.platform || typeof conn.platform !== 'string') return false;
    if (conn.platform.length > 50) return false;
    if (conn.label && typeof conn.label !== 'string') return false;
    if (conn.label && conn.label.length > 100) return false;
  }
  return true;
};

app.get('/api/connections/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const connections = readJSON(`connections_${id}.json`, []);
  res.json(connections);
});

app.post('/api/connections/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const connections = req.body;
  if (!isValidConnections(connections)) {
    return res.status(400).json({ error: 'Invalid connections data' });
  }
  const payloadSize = JSON.stringify(connections).length;
  if (payloadSize > MAX_PAYLOAD_SIZE) {
    return res.status(400).json({ error: 'Payload too large' });
  }
  writeJSON(`connections_${id}.json`, connections);
  res.json({ ok: true });
});

// ── CONNECTION STATS REFRESH (server-side proxy) ──────────────────────
// POST /api/connections/:profileId/:connId/refresh
// Fetches live stats from the platform API and updates the connection.
const fetchGitHubStats = async (username, token) => {
  const headers = { 'User-Agent': 'StudyFlow-App' };
  if (token) headers['Authorization'] = `token ${token}`;

  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers }),
    fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`, { headers }),
  ]);

  if (!userRes.ok) throw new Error(`GitHub API ${userRes.status}`);
  const user = await userRes.json();
  const repos = reposRes.ok ? await reposRes.json() : [];

  const totalStars = repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((sum, r) => sum + (r.forks_count || 0), 0);

  return {
    followers: user.followers || 0,
    following: user.following || 0,
    publicRepos: user.public_repos || 0,
    totalStars,
    totalForks,
    avatarUrl: user.avatar_url || '',
  };
};

const fetchHuggingFaceStats = async (username, token) => {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const [userRes, modelsRes] = await Promise.all([
    fetch(`https://huggingface.co/api/models?author=${username}&limit=100`, { headers }),
    fetch(`https://huggingface.co/api/users/${username}`, { headers }),
  ]);

  const models = userRes.ok ? await userRes.json() : [];
  const userInfo = modelsRes.ok ? await modelsRes.json() : {};

  return {
    models: models.length,
    downloads: models.reduce((sum, m) => sum + (m.downloads || 0), 0),
    likes: models.reduce((sum, m) => sum + (m.likes || 0), 0),
    fullName: userInfo.fullname || username,
  };
};

const fetchRedditStats = async (username) => {
  const res = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
    headers: { 'User-Agent': 'StudyFlow/1.0' },
  });
  if (!res.ok) throw new Error(`Reddit API ${res.status}`);
  const data = await res.json();
  const d = data.data || {};
  return {
    linkKarma: d.link_karma || 0,
    commentKarma: d.comment_karma || 0,
    totalKarma: (d.link_karma || 0) + (d.comment_karma || 0),
    cakeDay: d.created_utc ? new Date(d.created_utc * 1000).toISOString().slice(0, 10) : '',
  };
};

const STATS_FETCHERS = {
  github: fetchGitHubStats,
  huggingface: fetchHuggingFaceStats,
  reddit: fetchRedditStats,
};

app.post('/api/connections/:profileId/:connId/refresh', async (req, res) => {
  const id = sanitizeId(req.params.profileId);
  const connId = sanitizeId(req.params.connId);
  const connections = readJSON(`connections_${id}.json`, []);
  const conn = connections.find(c => c.id === connId);

  if (!conn) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  const fetcher = STATS_FETCHERS[conn.platform];
  if (!fetcher) {
    return res.status(400).json({ error: `Auto-fetch not supported for ${conn.platform}. Add stats manually.` });
  }

  try {
    // Extract username from URL if not provided
    let username = conn.meta?.username;
    if (!username && conn.meta?.url) {
      // Try to extract username from common URL patterns
      const url = conn.meta.url.replace(/\/+$/, '');
      const parts = url.split('/');
      username = parts[parts.length - 1];
    }

    if (!username) {
      return res.status(400).json({ error: 'No username found. Add a profile URL or username.' });
    }

    const token = conn.credentials?.apiKey || undefined;
    const stats = await fetcher(username, token);

    // Update connection with fetched stats
    conn.stats = stats;
    conn.lastFetched = Date.now();
    conn.fetchError = null;
    writeJSON(`connections_${id}.json`, connections);

    res.json({ ok: true, stats, lastFetched: conn.lastFetched });
  } catch (err) {
    conn.fetchError = err.message;
    conn.lastFetched = Date.now();
    writeJSON(`connections_${id}.json`, connections);
    res.status(502).json({ error: `Failed to fetch stats: ${err.message}` });
  }
});

// ── BULK SYNC ─────────────────────────────────────────────────────────
// GET /api/sync/:profileId — get all data for a profile in one call
app.get('/api/sync/:profileId', (req, res) => {
  const id = sanitizeId(req.params.profileId);
  res.json({
    profiles: readJSON('profiles.json', []),
    active: readJSON('active.json', { activeId: null }),
    entries: readJSON(`entries_${id}.json`, []),
    promoted: readJSON(`promoted_${id}.json`, []),
    chat: readJSON(`chat_${id}.json`, []),
  });
});

// ── HEALTH CHECK ──────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── Production: serve built frontend ──────────────────────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback: serve index.html for any non-API route (SPA support)
  app.use((req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 StudyFlow API server running on http://localhost:${PORT}`);
  console.log(`📂 Data stored in: ${DATA_DIR}`);
  console.log(`💡 Health check: http://localhost:${PORT}/api/health\n`);
});
