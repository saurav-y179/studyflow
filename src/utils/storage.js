// ── Storage Layer ─────────────────────────────────────────────────────
// Uses localStorage as a fast in-memory cache.
// Syncs data to/from the Express API server (file-based) in background.
// Falls back to localStorage-only if the API is unreachable.

const STORAGE_KEYS = {
  USER: 'studyflow_user',
  ENTRIES: 'studyflow_entries',
  PROMOTED: 'studyflow_promoted',
};

export const COMPLETION_THRESHOLD = 0.8;

// ── Server sync helpers ───────────────────────────────────────────────
const API_BASE = '/api';
let _serverAvailable = null;
let _lastServerCheck = 0;
const SERVER_CHECK_TTL = 30000; // re-check every 30s

const checkServer = async () => {
  const now = Date.now();
  if (_serverAvailable !== null && (now - _lastServerCheck) < SERVER_CHECK_TTL) return _serverAvailable;
  _lastServerCheck = now;
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    _serverAvailable = res.ok;
  } catch {
    _serverAvailable = false;
  }
  return _serverAvailable;
};

const apiGet = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn(`API GET ${endpoint} failed:`, err);
  }
  return null;
};

// ── Pending-sync queue ────────────────────────────────────────────────
// Writes that fail while the API server is unreachable are persisted to
// localStorage and retried automatically, so local edits are never
// silently dropped from the server copy.
const PENDING_SYNC_KEY = 'studyflow_pending_sync';
const MAX_PENDING_OPS = 25;

const loadPendingSync = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistPendingSync = (ops) => {
  if (ops.length === 0) localStorage.removeItem(PENDING_SYNC_KEY);
  else localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(ops));
};

// One serialized flush pass: posts everything currently queued. Failures
// stay queued for the next triggered pass.
const runFlushPass = async () => {
  const ops = loadPendingSync();
  if (ops.length === 0) return;

  // Force a fresh availability probe: a previous "down" verdict may be
  // stale, and this is the retry path.
  _serverAvailable = null;
  _lastServerCheck = 0;
  if (!(await checkServer())) return;

  const remaining = [];
  for (const op of ops) {
    try {
      const res = await fetch(`${API_BASE}${op.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(op.data),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) remaining.push(op);
    } catch {
      remaining.push(op);
    }
  }
  persistPendingSync(remaining);
};

// Flush requests serialize behind any in-flight pass so a retry request
// is never swallowed by one that's mid-failure.
let _flushChain = Promise.resolve();

// Attempts every queued write once; safe to call repeatedly.
export const flushPendingSync = async () => {
  const pass = _flushChain.then(runFlushPass, runFlushPass);
  _flushChain = pass.catch(() => {});
  return pass;
};

// Enqueues a full-snapshot write. Ops for the same endpoint coalesce
// (latest snapshot wins), which also eliminates out-of-order races.
const syncToServer = (endpoint, data) => {
  const ops = loadPendingSync().filter((op) => op.endpoint !== endpoint);
  ops.push({ endpoint, data, queuedAt: Date.now() });
  persistPendingSync(ops.slice(-MAX_PENDING_OPS));
  flushPendingSync();
};

const pushToServer = async (endpoint, data) => {
  syncToServer(endpoint, data);
  await flushPendingSync();
};

// ── Entry reconciliation ──────────────────────────────────────────────
// Per-date merge where the entry with the newest timestamp wins. Local
// edits win ties, since that is what the user is currently looking at.
export const mergeEntries = (localEntries = [], serverEntries = []) => {
  const byDate = new Map();
  for (const entry of serverEntries) {
    if (entry?.date) byDate.set(entry.date, entry);
  }
  for (const entry of localEntries) {
    if (!entry?.date) continue;
    const existing = byDate.get(entry.date);
    if (!existing || (entry.timestamp || 0) >= (existing.timestamp || 0)) {
      byDate.set(entry.date, entry);
    }
  }
  return [...byDate.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
};

const entriesSignature = (entries) =>
  entries.map((e) => `${e.date}:${e.timestamp || 0}`).sort().join('|');

// ── Initial sync from server ──────────────────────────────────────────
// Called once on app startup to reconcile file-based data into
// localStorage. Local-only changes made while offline are preserved and
// pushed back, so neither side ever clobbers fresher work.
export const syncFromServer = async () => {
  const isAvailable = await checkServer();
  if (!isAvailable) return false;

  try {
    // Only sync profiles if localStorage doesn't already have them
    // (prevents overwriting recent changes that haven't finished syncing to server)
    const existingProfiles = localStorage.getItem('studyflow_profiles');
    if (!existingProfiles) {
      const profiles = await apiGet('/profiles');
      if (profiles && Array.isArray(profiles)) {
        localStorage.setItem('studyflow_profiles', JSON.stringify(profiles));
      }
    }

    // Only sync active profile if nothing is set in localStorage
    const existingActive = localStorage.getItem('studyflow_active_profile');
    if (!existingActive) {
      const active = await apiGet('/active');
      if (active && active.activeId) {
        localStorage.setItem('studyflow_active_profile', active.activeId);
      }
    }

    // Reconcile (not overwrite) entries/promoted for the active profile
    const activeId = localStorage.getItem('studyflow_active_profile');
    if (activeId) {
      const entryKey = getKeyForId(STORAGE_KEYS.ENTRIES, activeId);
      const promotedKey = getKeyForId(STORAGE_KEYS.PROMOTED, activeId);

      const [serverEntries, serverPromoted] = await Promise.all([
        apiGet(`/entries/${activeId}`),
        apiGet(`/promoted/${activeId}`),
      ]);

      if (serverEntries && Array.isArray(serverEntries)) {
        const localEntries = JSON.parse(localStorage.getItem(entryKey) || '[]');
        const merged = mergeEntries(localEntries, serverEntries);
        localStorage.setItem(entryKey, JSON.stringify(merged));
        if (entriesSignature(merged) !== entriesSignature(serverEntries)) {
          syncToServer(`/entries/${activeId}`, merged);
        }
      }

      if (serverPromoted && Array.isArray(serverPromoted)) {
        const localPromoted = JSON.parse(localStorage.getItem(promotedKey) || '[]');
        const mergedPromoted = [...new Set([...localPromoted, ...serverPromoted])].slice(-7);
        localStorage.setItem(promotedKey, JSON.stringify(mergedPromoted));
      }
    }

    // Retry anything that failed to sync previously (e.g. offline session)
    await flushPendingSync();

    return true;
  } catch {
    return false;
  }
};

// ── Profile / User Management ─────────────────────────────────────────
export const getProfiles = () => {
  try {
    const data = localStorage.getItem('studyflow_profiles');
    if (data) return JSON.parse(data);

    // Migration: Check if there is an existing legacy user
    const legacyUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (legacyUser) {
      const parsed = JSON.parse(legacyUser);
      const profile = { ...parsed, id: 'default' };
      localStorage.setItem('studyflow_profiles', JSON.stringify([profile]));
      localStorage.setItem('studyflow_active_profile', 'default');
      return [profile];
    }
    return [];
  } catch {
    return [];
  }
};

export const getActiveProfileId = () => {
  return localStorage.getItem('studyflow_active_profile');
};

export const switchProfile = async (profileId) => {
  localStorage.setItem('studyflow_active_profile', profileId);
  syncToServer('/active', { activeId: profileId });

  // Pull this profile's data BEFORE returning so callers never render a
  // previous profile's entries. Merge instead of overwrite so unsynced
  // local edits survive.
  if (!(await checkServer())) return;

  const entryKey = getKeyForId(STORAGE_KEYS.ENTRIES, profileId);
  const promotedKey = getKeyForId(STORAGE_KEYS.PROMOTED, profileId);

  const [entries, promoted] = await Promise.all([
    apiGet(`/entries/${profileId}`),
    apiGet(`/promoted/${profileId}`),
  ]);

  if (entries && Array.isArray(entries)) {
    const localEntries = JSON.parse(localStorage.getItem(entryKey) || '[]');
    const merged = mergeEntries(localEntries, entries);
    localStorage.setItem(entryKey, JSON.stringify(merged));
  }

  if (promoted && Array.isArray(promoted)) {
    const localPromoted = JSON.parse(localStorage.getItem(promotedKey) || '[]');
    const mergedPromoted = [...new Set([...localPromoted, ...promoted])].slice(-7);
    localStorage.setItem(promotedKey, JSON.stringify(mergedPromoted));
  }
};

export const createNewProfile = () => {
  localStorage.removeItem('studyflow_active_profile');
  syncToServer('/active', { activeId: null });
};

const getKeyForId = (baseKey, profileId) => {
  if (!profileId || profileId === 'default') return baseKey;
  return `${baseKey}_${profileId}`;
};

const getKey = (baseKey) => {
  const profileId = getActiveProfileId();
  return getKeyForId(baseKey, profileId);
};

export const getUser = () => {
  const activeId = getActiveProfileId();
  if (!activeId) return null;
  const profiles = getProfiles();
  return profiles.find(p => p.id === activeId) || null;
};

export const saveUser = async (user) => {
  let profiles = getProfiles();
  const isNew = !user.id;

  const userToSave = { ...user };
  if (isNew) {
    userToSave.id = `profile_${Date.now()}`;
  }

  const existingIndex = profiles.findIndex(p => p.id === userToSave.id);
  if (existingIndex >= 0) {
    profiles[existingIndex] = userToSave;
  } else {
    profiles.push(userToSave);
  }

  localStorage.setItem('studyflow_profiles', JSON.stringify(profiles));
  localStorage.setItem('studyflow_active_profile', userToSave.id);

  // also save legacy for backwards compat
  if (userToSave.id === 'default') {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSave));
  }

  // Sync to server - waits for the queue flush so data is saved before
  // the user closes the app. If unreachable, it stays queued for retry.
  await pushToServer('/profiles', userToSave);
  await pushToServer('/active', { activeId: userToSave.id });
};

// ── Logout (safe — only clears session, not data) ────────────────────
export const logout = () => {
  // Only clear the active session marker, NOT the actual data
  localStorage.removeItem('studyflow_active_profile');
  syncToServer('/active', { activeId: null });
};

// ── Date helpers ──────────────────────────────────────────────────────
export const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getLocalDayStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getToday = () => formatDate(getLocalDayStart());

export const getTomorrow = () => {
  const d = getLocalDayStart();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
};

export const getYesterday = () => {
  const d = getLocalDayStart();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

export const addDaysDateStr = (dateStr, days) => {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return formatDate(d);
};

// ── Entries CRUD ──────────────────────────────────────────────────────
export const getEntries = () => {
  try {
    const data = localStorage.getItem(getKey(STORAGE_KEYS.ENTRIES));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getEntryByDate = (date) =>
  getEntries().find((e) => e.date === date) || null;

export const saveEntry = (entry) => {
  const entries = getEntries();
  const existingIndex = entries.findIndex((e) => e.date === entry.date);
  const cleanEntry = {
    date: entry.date,
    todayTasks: entry.todayTasks || [],
    timestamp: Date.now(),
  };

  if (existingIndex >= 0) entries[existingIndex] = cleanEntry;
  else entries.push(cleanEntry);

  entries.sort((a, b) => new Date(a.date) - new Date(b.date));

  const key = getKey(STORAGE_KEYS.ENTRIES);
  localStorage.setItem(key, JSON.stringify(entries));

  // Sync entries to server
  const profileId = getActiveProfileId();
  if (profileId) {
    syncToServer(`/entries/${profileId}`, entries);
  }

  return entries;
};

export const createEmptyEntry = (date) => ({
  date,
  todayTasks: [],
  timestamp: Date.now(),
});

export const getTodayEntry = () => {
  return getEntryByDate(getToday());
};

export const getOrCreateTodayEntry = () => {
  const today = getToday();
  let entry = getEntryByDate(today);
  if (!entry) {
    entry = createEmptyEntry(today);
    saveEntry(entry);
  }
  return entry;
};

export const getTomorrowEntry = () => {
  const tomorrow = getTomorrow();
  const existing = getEntryByDate(tomorrow);
  if (existing) return existing;
  const entry = createEmptyEntry(tomorrow);
  saveEntry(entry);
  return entry;
};

// ── Local datetime string (consistent with formatDate's local timezone) ─
export const getLocalDateTimeString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// ── Task factory ──────────────────────────────────────────────────────
export const createTask = (text, date, createdAt = getLocalDateTimeString()) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  text: text.trim(),
  date,
  createdAt,
  completed: false,
  source: 'added_today',
});

export const buildPlannedTask = (task, executionDate) => ({
  ...task,
  id: task.id.startsWith('planned-') ? task.id : `planned-${task.id}`,
  date: executionDate,
  source: 'planned',
  completed: false,
});

// ── Task editing ──────────────────────────────────────────────────────
export const updateTaskInEntry = (dateStr, taskId, updates) => {
  const entry = getEntryByDate(dateStr);
  if (!entry) return null;
  const nextTasks = entry.todayTasks.map((t) =>
    t.id === taskId ? { ...t, ...updates } : t
  );
  const updated = { ...entry, todayTasks: nextTasks };
  saveEntry(updated);
  return updated;
};

// ── Planned task promotion (idempotent, runs once per day) ────────────
export const promotePlannedTasks = (currentDate = getToday()) => {
  const promotedKey = getKey(STORAGE_KEYS.PROMOTED);
  const alreadyPromoted = JSON.parse(localStorage.getItem(promotedKey) || '[]');

  if (alreadyPromoted.includes(currentDate)) return; // already done today

  const yesterday = addDaysDateStr(currentDate, -1);
  const yesterdayEntry = getEntryByDate(yesterday);
  const todayEntry = getOrCreateTodayEntry();

  if (yesterdayEntry) {
    // Get uncompleted tasks from yesterday that were planned for today
    // (i.e., tasks in yesterday's entry that haven't been completed)
    const tasksToPromote = (yesterdayEntry.todayTasks || [])
      .filter((t) => !t.completed)
      .map((t) => buildPlannedTask(t, currentDate));

    // Filter out any that are already present (by planned-id)
    const existingIds = new Set((todayEntry.todayTasks || []).map((t) => t.id));
    const newPlanned = tasksToPromote.filter((t) => !existingIds.has(t.id));

    if (newPlanned.length > 0) {
      const merged = [...newPlanned, ...(todayEntry.todayTasks || [])];
      saveEntry({ ...todayEntry, todayTasks: merged });
    }
  }

  // Also promote tasks that were explicitly planned for today (created yesterday via Tomorrow panel)
  // These are tasks where task.date === currentDate and were created before today
  const tomorrowPlanned = getEntryByDate(currentDate);
  if (tomorrowPlanned) {
    const currentDayStart = getLocalDayStart(`${currentDate}T00:00:00`).getTime();
    const tasks = tomorrowPlanned.todayTasks || [];
    const updated = tasks.map((t) => {
      const createdAt = new Date(t.createdAt).getTime();
      if (createdAt < currentDayStart && t.source !== 'planned') {
        return { ...t, source: 'planned' };
      }
      return t;
    });
    if (JSON.stringify(updated) !== JSON.stringify(tasks)) {
      saveEntry({ ...tomorrowPlanned, todayTasks: updated });
    }
  }

  alreadyPromoted.push(currentDate);
  // Keep only last 7 days of promotion records
  const trimmed = alreadyPromoted.slice(-7);
  localStorage.setItem(promotedKey, JSON.stringify(trimmed));

  // Sync promoted records to server
  const profileId = getActiveProfileId();
  if (profileId) {
    syncToServer(`/promoted/${profileId}`, trimmed);
  }
};

// ── Time-lock rules ──────────────────────────────────────────────────
export const canEditTask = (task, currentDate = getToday()) => {
  const tomorrow = addDaysDateStr(currentDate, 1);
  const taskDayStart = getLocalDayStart(`${task.date}T00:00:00`).getTime();
  const currentDayStart = getLocalDayStart(`${currentDate}T00:00:00`).getTime();
  const tomorrowDayStart = getLocalDayStart(`${tomorrow}T00:00:00`).getTime();

  // Rule 1: task.date == currentDate
  if (taskDayStart === currentDayStart) {
    const createdAt = new Date(task.createdAt).getTime();
    if (createdAt < currentDayStart || task.source === 'planned') {
      return { canEdit: false, reason: 'planned_yesterday', canToggle: true };
    }
    return { canEdit: true, reason: 'added_today', canToggle: true };
  }

  // Rule 2: task.date == currentDate + 1 (planning phase)
  if (taskDayStart === tomorrowDayStart) {
    return { canEdit: true, reason: 'planning_phase', canToggle: false };
  }

  // Rule 3: task.date < currentDate (history — fully locked)
  if (taskDayStart < currentDayStart) {
    return { canEdit: false, reason: 'past_date', canToggle: false };
  }

  // Rule 4: task.date > currentDate + 1 (not allowed)
  return { canEdit: false, reason: 'future_date', canToggle: false };
};

// ── Completion helpers ───────────────────────────────────────────────
export const getCompletionPercentage = (entry) => {
  const tasks = entry?.todayTasks || [];
  if (tasks.length === 0) return 0;
  const completed = tasks.filter((t) => t.completed).length;
  return Math.round((completed / tasks.length) * 100);
};

export const isDayComplete = (entry, threshold = COMPLETION_THRESHOLD) => {
  const tasks = entry?.todayTasks || [];
  if (tasks.length === 0) return false;
  const completed = tasks.filter((t) => t.completed).length;
  return completed / tasks.length >= threshold;
};

// ── Streak calculation ───────────────────────────────────────────────
export const calculateStreak = (entries) => {
  if (!entries?.length) return { current: 0, longest: 0 };
  // Wrap (not pass) isDayComplete: filter forwards (element, index, array),
  // which would leak the index into isDayComplete's `threshold` parameter
  // and corrupt streak math.
  const completeDates = new Set(entries.filter((e) => isDayComplete(e)).map((e) => e.date));
  if (!completeDates.size) return { current: 0, longest: 0 };

  const sorted = [...completeDates].sort();
  let longest = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDaysDateStr(sorted[i - 1], 1) === sorted[i]) run += 1;
    else run = 1;
    longest = Math.max(longest, run);
  }

  let current = 0;
  let cursor = getToday();
  if (!completeDates.has(cursor)) cursor = getYesterday();
  while (completeDates.has(cursor)) {
    current += 1;
    cursor = addDaysDateStr(cursor, -1);
  }

  return { current, longest };
};

// ── External Connections (flexible stats from any platform) ────────
const CONNECTIONS_KEY = 'studyflow_connections';

export const getConnections = () => {
  try {
    const profileId = getActiveProfileId();
    if (!profileId) return [];
    const key = profileId === 'default' ? CONNECTIONS_KEY : `${CONNECTIONS_KEY}_${profileId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveConnection = (connection) => {
  const connections = getConnections();
  if (!connection.id) {
    connection.id = `conn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    connection.createdAt = Date.now();
  }
  connection.updatedAt = Date.now();
  const idx = connections.findIndex((c) => c.id === connection.id);
  if (idx >= 0) connections[idx] = connection;
  else connections.push(connection);
  persistConnections(connections);
  return connections;
};

export const removeConnection = (connectionId) => {
  const connections = getConnections().filter((c) => c.id !== connectionId);
  persistConnections(connections);
  return connections;
};

const persistConnections = (connections) => {
  const profileId = getActiveProfileId();
  if (!profileId) return;
  const key = profileId === 'default' ? CONNECTIONS_KEY : `${CONNECTIONS_KEY}_${profileId}`;
  localStorage.setItem(key, JSON.stringify(connections));
  syncToServer(`/connections/${profileId}`, connections);
};

// ── Connection Stats Refresh ─────────────────────────────────────────
// Fetches live stats from the server-side proxy for a single connection.
export const fetchConnectionStats = async (connectionId) => {
  const profileId = getActiveProfileId();
  if (!profileId) return null;

  try {
    const res = await fetch(`${API_BASE}/connections/${profileId}/${connectionId}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to refresh');

    // Update local state with fetched stats
    const connections = getConnections();
    const conn = connections.find(c => c.id === connectionId);
    if (conn) {
      conn.stats = data.stats;
      conn.lastFetched = data.lastFetched;
      conn.fetchError = null;
      persistConnections(connections);
    }
    return data.stats;
  } catch (err) {
    // Mark the connection with the error
    const connections = getConnections();
    const conn = connections.find(c => c.id === connectionId);
    if (conn) {
      conn.fetchError = err.message;
      conn.lastFetched = Date.now();
      persistConnections(connections);
    }
    return null;
  }
};

// Refresh all connections that support auto-fetch (github, huggingface, reddit)
// Skips connections refreshed within the last 30 minutes.
export const refreshAllConnections = async () => {
  const connections = getConnections();
  const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
  const now = Date.now();

  const needsRefresh = connections.filter(c => {
    if (c.platform !== 'github' && c.platform !== 'huggingface' && c.platform !== 'reddit') return false;
    if (!c.meta?.url && !c.meta?.username) return false;
    if (c.lastFetched && (now - c.lastFetched) < REFRESH_INTERVAL) return false;
    return true;
  });

  if (needsRefresh.length === 0) return;

  await Promise.allSettled(
    needsRefresh.map(c => fetchConnectionStats(c.id))
  );
};

export const createConnection = (platform, label, stats, meta = {}) => ({
  id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
  platform,
  label,
  stats,
  meta,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// ── Momentum ─────────────────────────────────────────────────────────
export const calculateMomentum = (streak) => {
  const maxStreak = 30;
  const momentum = Math.min((streak / maxStreak) * 100, 100);

  let color = '#355470'; // muted steel — low
  if (momentum > 60) color = '#AAFF00'; // punchy lime — high
  else if (momentum > 30) color = '#0099D4'; // Porsche blue — mid

  return { momentum, color };
};
