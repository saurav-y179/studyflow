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
let _serverAvailable = null; // null = unknown, true/false after check

const checkServer = async () => {
  if (_serverAvailable !== null) return _serverAvailable;
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
  } catch {}
  return null;
};

const apiPost = async (endpoint, data) => {
  try {
    await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {}
};

// Fire-and-forget background sync (doesn't block the UI)
const syncToServer = (endpoint, data) => {
  apiPost(endpoint, data).catch(() => {});
};

// ── Initial sync from server ──────────────────────────────────────────
// Called once on app startup to pull file-based data into localStorage.
export const syncFromServer = async () => {
  const isAvailable = await checkServer();
  if (!isAvailable) return false;

  try {
    // Pull profiles
    const profiles = await apiGet('/profiles');
    if (profiles && Array.isArray(profiles)) {
      localStorage.setItem('studyflow_profiles', JSON.stringify(profiles));
    }

    // Pull active profile
    const active = await apiGet('/active');
    if (active && active.activeId) {
      localStorage.setItem('studyflow_active_profile', active.activeId);

      // Pull entries + promoted for active profile
      const id = active.activeId;
      const entries = await apiGet(`/entries/${id}`);
      if (entries && Array.isArray(entries)) {
        localStorage.setItem(getKeyForId(STORAGE_KEYS.ENTRIES, id), JSON.stringify(entries));
      }

      const promoted = await apiGet(`/promoted/${id}`);
      if (promoted && Array.isArray(promoted)) {
        localStorage.setItem(getKeyForId(STORAGE_KEYS.PROMOTED, id), JSON.stringify(promoted));
      }
    }

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

export const switchProfile = (profileId) => {
  localStorage.setItem('studyflow_active_profile', profileId);
  syncToServer('/active', { activeId: profileId });

  // Also pull entries for the new profile from server
  if (_serverAvailable) {
    apiGet(`/entries/${profileId}`).then(entries => {
      if (entries && Array.isArray(entries)) {
        localStorage.setItem(getKeyForId(STORAGE_KEYS.ENTRIES, profileId), JSON.stringify(entries));
      }
    }).catch(() => {});
    apiGet(`/promoted/${profileId}`).then(promoted => {
      if (promoted && Array.isArray(promoted)) {
        localStorage.setItem(getKeyForId(STORAGE_KEYS.PROMOTED, profileId), JSON.stringify(promoted));
      }
    }).catch(() => {});
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

export const saveUser = (user) => {
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

  // Sync to server
  syncToServer('/profiles', userToSave);
  syncToServer('/active', { activeId: userToSave.id });
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
  return getEntryByDate(tomorrow) || createEmptyEntry(tomorrow);
};

// ── Task factory ──────────────────────────────────────────────────────
export const createTask = (text, date, createdAt = new Date().toISOString()) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
  text: text.trim(),
  date,
  createdAt,
  completed: false,
  source: 'added_today',
});

export const buildPlannedTask = (task, executionDate) => ({
  ...task,
  id: `planned-${task.id}`, // new stable ID so we can detect duplicates
  date: executionDate,
  source: 'planned',
  completed: false, // reset completion for the new day
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
  const todayEntry = getTodayEntry();

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
  const completeDates = new Set(entries.filter(isDayComplete).map((e) => e.date));
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

// ── Momentum ─────────────────────────────────────────────────────────
export const calculateMomentum = (streak) => {
  const maxStreak = 30;
  const momentum = Math.min((streak / maxStreak) * 100, 100);

  let color = '#355470'; // muted steel — low
  if (momentum > 60) color = '#AAFF00'; // punchy lime — high
  else if (momentum > 30) color = '#0099D4'; // Porsche blue — mid

  return { momentum, color };
};
