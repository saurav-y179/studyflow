import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_DIR = path.join(__dirname, 'data');

// ── Middleware ─────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

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
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filename}:`, err.message);
    return false;
  }
};

// Sanitize profile IDs to prevent path traversal
const sanitizeId = (id) => {
  if (!id || typeof id !== 'string') return 'default';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_');
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
  if (!profile || !profile.id) {
    return res.status(400).json({ error: 'Profile must have an id' });
  }

  const profiles = readJSON('profiles.json', []);
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
  profiles = profiles.filter(p => p.id !== id && p.id !== req.params.id);
  writeJSON('profiles.json', profiles);

  // Also delete associated data files
  const entriesFile = path.join(DATA_DIR, `entries_${id}.json`);
  const promotedFile = path.join(DATA_DIR, `promoted_${id}.json`);
  const chatFile = path.join(DATA_DIR, `chat_${id}.json`);
  try { if (fs.existsSync(entriesFile)) fs.unlinkSync(entriesFile); } catch {}
  try { if (fs.existsSync(promotedFile)) fs.unlinkSync(promotedFile); } catch {}
  try { if (fs.existsSync(chatFile)) fs.unlinkSync(chatFile); } catch {}

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
  writeJSON(`chat_${id}.json`, chat);
  res.json({ ok: true });
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
  res.json({ status: 'ok', dataDir: DATA_DIR });
});

// ── Production: serve built frontend ──────────────────────────────────
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Fallback: serve index.html for any non-API route (SPA support)
  app.use((req, res, next) => {
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
