const STORAGE_KEYS = {
  USER: 'studyflow_user',
  ENTRIES: 'studyflow_entries',
};

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
  return d.toISOString().split('T')[0];
};

export const getToday = () => {
  return formatDate(new Date());
};

export const getTomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDate(d);
};

export const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDate(d);
};

export const createTask = (text, date, createdAt = new Date().toISOString()) => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  text: text.trim(),
  completed: false,
  date,
  createdAt,
});

export const getEntryByDate = (date) => {
  const entries = getEntries();
  return entries.find(e => e.date === date) || null;
};

export const saveEntry = (entry) => {
  const entries = getEntries();
  const existingIndex = entries.findIndex(e => e.date === entry.date);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  entries.sort((a, b) => new Date(a.date) - new Date(b.date));
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  
  return entries;
};

export const createEmptyEntry = (date) => ({
  date,
  todayTasks: [],
  tomorrowTasks: [],
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
  let entry = getEntryByDate(tomorrow);
  if (!entry) {
    entry = createEmptyEntry(tomorrow);
  }
  return entry;
};

export const getYesterdayEntry = () => {
  const yesterday = getYesterday();
  return getEntryByDate(yesterday);
};

export const canEditTask = (task, currentDate) => {
  const taskDate = task.date;
  const createdAt = new Date(task.createdAt);
  const current = new Date(currentDate);
  
  if (taskDate === currentDate) {
    const createdDate = formatDate(createdAt);
    if (createdDate === currentDate) {
      return { canEdit: true, reason: 'added_today' };
    } else {
      return { canEdit: false, reason: 'planned_yesterday' };
    }
  }
  
  if (taskDate === getTomorrow()) {
    return { canEdit: true, reason: 'planning_phase' };
  }
  
  if (taskDate < currentDate) {
    return { canEdit: false, reason: 'past_date' };
  }
  
  return { canEdit: false, reason: 'future_date' };
};

export const calculateStreak = (entries) => {
  if (!entries || entries.length === 0) return { current: 0, longest: 0 };
  
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = getToday();
  const yesterday = getYesterday();
  
  let current = 0;
  let longest = 0;
  let temp = 0;
  let hasEntryToday = false;
  let hasEntryYesterday = false;
  
  for (let i = 0; i < sortedEntries.length; i++) {
    const entry = sortedEntries[i];
    const entryDate = new Date(entry.date);
    const prevDate = i < sortedEntries.length - 1 ? new Date(sortedEntries[i + 1].date) : null;
    
    const hasCompletedTasks = (entry.todayTasks || []).some(t => t.completed);
    
    if (i === 0) {
      if (entry.date === today || entry.date === yesterday) {
        if (hasCompletedTasks) {
          current = 1;
          temp = 1;
        }
        if (entry.date === today) hasEntryToday = true;
        if (entry.date === yesterday) hasEntryYesterday = true;
      } else {
        break;
      }
    } else if (prevDate) {
      const diff = Math.floor((entryDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diff === 1 && hasCompletedTasks) {
        temp++;
        if (i === 0 || sortedEntries[0].date === today) {
          current = temp;
        }
      } else {
        longest = Math.max(longest, temp);
        if (hasCompletedTasks) temp = 1;
        else temp = 0;
      }
    }
  }
  
  longest = Math.max(longest, temp);
  
  if (!hasEntryToday && hasEntryYesterday) {
    current = temp;
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

export const getCompletionPercentage = (entry) => {
  if (!entry || !entry.todayTasks || entry.todayTasks.length === 0) return 0;
  const completed = entry.todayTasks.filter(t => t.completed).length;
  return Math.round((completed / entry.todayTasks.length) * 100);
};