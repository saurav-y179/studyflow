const STORAGE_KEYS = {
  USER: 'studyflow_user',
  ENTRIES: 'studyflow_entries',
};

export const COMPLETION_THRESHOLD = 0.8;

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

export const getEntries = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

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
  date: executionDate,
  source: 'planned',
});

export const getEntryByDate = (date) => getEntries().find((e) => e.date === date) || null;

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

export const createEmptyEntry = (date) => ({ date, todayTasks: [], timestamp: Date.now() });

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

export const canEditTask = (task, currentDate = getToday()) => {
  const tomorrow = addDaysDateStr(currentDate, 1);
  const taskDayStart = getLocalDayStart(`${task.date}T00:00:00`).getTime();
  const currentDayStart = getLocalDayStart(`${currentDate}T00:00:00`).getTime();
  const tomorrowDayStart = getLocalDayStart(`${tomorrow}T00:00:00`).getTime();

  if (taskDayStart === currentDayStart) {
    const createdAt = new Date(task.createdAt).getTime();
    if (createdAt < currentDayStart) return { canEdit: false, reason: 'planned_yesterday', canToggle: true };
    return { canEdit: true, reason: 'added_today', canToggle: true };
  }

  if (taskDayStart === tomorrowDayStart) return { canEdit: true, reason: 'planning_phase', canToggle: true };
  if (taskDayStart < currentDayStart) return { canEdit: false, reason: 'past_date', canToggle: false };
  return { canEdit: false, reason: 'future_date', canToggle: false };
};

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

export const calculateMomentum = (streak) => {
  const maxStreak = 30;
  const momentum = Math.min((streak / maxStreak) * 100, 100);

  let color = '#EF4444';
  if (momentum > 60) color = '#10B981';
  else if (momentum > 30) color = '#F59E0B';

  return { momentum, color };
};
