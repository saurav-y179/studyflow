const STORAGE_KEYS = {
  USER: 'studyflow_user',
  ENTRIES: 'studyflow_entries',
  PROMOTED: 'studyflow_promoted', // tracks which dates have had tasks promoted
};

export const COMPLETION_THRESHOLD = 0.8;

// ── User ──────────────────────────────────────────────────────────────
export const getUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

export const saveUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
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
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
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
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
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
  const promotedKey = STORAGE_KEYS.PROMOTED;
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

  let color = '#4361EE';
  if (momentum > 60) color = '#F72585';
  else if (momentum > 30) color = '#B5179E';

  return { momentum, color };
};
