import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Lock,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getTodayEntry,
  getOrCreateTodayEntry,
  saveEntry,
  getToday,
  createTask,
  canEditTask,
} from '../../utils/storage';

const SUBJECT_COLORS = [
  { bg: 'rgba(115,127,227,0.15)', text: '#737fe3', dot: '#737fe3' },
  { bg: 'rgba(21,42,209,0.15)', text: '#a78bfa', dot: '#152ad1' },
  { bg: 'rgba(0,255,178,0.15)', text: '#00ffb2', dot: '#00ffb2' },
  { bg: 'rgba(255,193,7,0.15)', text: '#ffc107', dot: '#ffc107' },
  { bg: 'rgba(255,107,107,0.15)', text: '#ff6b6b', dot: '#ff6b6b' },
];

const getTaskColor = (index) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

const estimateDuration = (text) => {
  const t = text.toLowerCase();
  if (t.includes('revision') || t.includes('review') || t.includes('workout')) return '30m';
  if (t.includes('practice') || t.includes('exercise') || t.includes('quiz')) return '45m';
  if (t.includes('essay') || t.includes('writing') || t.includes('english')) return '60m';
  if (t.includes('mock') || t.includes('test') || t.includes('exam') || t.includes('full')) return '90m';
  if (t.includes('data') || t.includes('algorithm') || t.includes('cs')) return '90m';
  if (t.includes('physics') || t.includes('chemistry') || t.includes('thermo')) return '60m';
  if (t.includes('calculus') || t.includes('math') || t.includes('derivative') || t.includes('integral')) return '45m';
  return '45m';
};

export const TodayTasksCard = ({ onEntriesChange }) => {
  const [entry, setEntry] = useState(() => getTodayEntry() || getOrCreateTodayEntry());
  const [newTaskText, setNewTaskText] = useState('');

  const currentDate = getToday();
  const tasks = entry?.todayTasks || [];
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;

  const plannedTasks = tasks.filter(
    (t) => canEditTask(t, currentDate).reason === 'planned_yesterday'
  );
  const addedTodayTasks = tasks.filter(
    (t) => canEditTask(t, currentDate).reason === 'added_today'
  );
  const allDisplayTasks = [...plannedTasks, ...addedTodayTasks];

  const updateEntry = (updated) => {
    saveEntry(updated);
    setEntry(updated);
    onEntriesChange?.();
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const task = createTask(newTaskText, currentDate);
    task.duration = estimateDuration(newTaskText);
    const current = getOrCreateTodayEntry();
    updateEntry({ ...current, todayTasks: [...(current.todayTasks || []), task] });
    setNewTaskText('');
  };

  const handleToggleTask = (task) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canToggle) return;
    const current = getOrCreateTodayEntry();
    const nextTasks = (current.todayTasks || []).map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  const handleDeleteTask = (task) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canEdit) return;
    const current = getOrCreateTodayEntry();
    const nextTasks = (current.todayTasks || []).filter((t) => t.id !== task.id);
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[18px] overflow-hidden flex flex-col"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', borderColor: 'rgba(46,230,216,0.12)', transition: { duration: 0.2 } }}
    >

        {/* Header with progress ring */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[#2EE6D8]" />
                <div className="absolute -inset-1 rounded-full" style={{ background: 'rgba(46,230,216,0.2)', filter: 'blur(4px)' }} />
              </div>
              <h3 className="text-h2" style={{ color: '#E9EDF2' }}>Today's Tasks</h3>
            </div>
            <div className="flex items-center gap-2.5">
              {/* Mini ring progress */}
              <div className="relative w-9 h-9">
                <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#0B0E14" strokeWidth="3" />
                  <motion.circle
                    cx="18" cy="18" r="14" fill="none" stroke="#2EE6D8" strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 14 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 14 * (1 - progressPct / 100) }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-micro font-bold" style={{ color: '#E9EDF2' }}>
                  {completedTasks}
                </span>
              </div>
            </div>
          </div>
          <p className="text-caption" style={{ color: '#8B95A5' }}>{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>

          {/* Progress bar with gradient */}
          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-overline" style={{ color: '#8B95A5', fontSize: '0.5625rem' }}>
                  {completedTasks}/{totalTasks} completed
                </span>
                <span className="text-micro font-bold" style={{ color: progressPct >= 100 ? '#4ADE80' : '#2EE6D8' }}>
                  {progressPct === 100 ? '✨ ' : ''}{progressPct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1E2530] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{
                    background: progressPct >= 100
                      ? 'linear-gradient(90deg, #4ADE80, #34C759)'
                      : 'linear-gradient(90deg, #2EE6D8, #1CC9B8)',
                    boxShadow: progressPct >= 100 ? '0 0 8px rgba(74,222,128,0.4)' : 'none',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tasks list */}
        <div className="px-5 pb-2 flex-1 space-y-1 max-h-[280px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {allDisplayTasks.map((task, index) => {
              const permission = canEditTask(task, currentDate);
              const isLocked = permission.reason === 'planned_yesterday';
              const color = getTaskColor(index);

              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: task.completed ? 0.5 : 1, y: 0 }}
                  exit={{ opacity: 0, x: -15, height: 0 }}
                  className={`group flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    task.completed
                      ? 'bg-[#1E2530]'
                      : 'hover:bg-[#1E2530]'
                  }`}
                  style={!task.completed && !isLocked ? { border: '1px solid transparent', borderColor: 'rgba(46,230,216,0)' } : {}}
                  onMouseEnter={e => { if (!task.completed && !isLocked) e.currentTarget.style.borderColor = 'rgba(46,230,216,0.1)'; }}
                  onMouseLeave={e => { if (!task.completed && !isLocked) e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleTask(task)}
                    title={isLocked ? 'Planned yesterday — can only toggle completion' : 'Toggle task'}
                    className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? 'bg-[#2EE6D8] border-[#2EE6D8] shadow-[0_0_8px_rgba(46,230,216,0.3)]'
                        : isLocked
                        ? 'border-[#5B6574] hover:border-[#2EE6D8] hover:shadow-[0_0_6px_rgba(46,230,216,0.15)]'
                        : 'border-[#5B6574] hover:border-[#2EE6D8] hover:shadow-[0_0_6px_rgba(46,230,216,0.15)]'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 text-[#E9EDF2]" strokeWidth={3} />}
                  </button>

                  {/* Color dot */}
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                  {/* Task text */}
                  <span className={`flex-1 text-body ${
                    task.completed ? 'line-through text-[#5B6574]' : 'text-[#E9EDF2]'
                  }`}>
                    {task.text}
                  </span>

                  {/* Duration badge */}
                  <span className="text-micro font-mono tabular-nums px-2 py-0.5 rounded-[8px]" style={{ background: '#1E2530', color: '#5B6574' }}>
                    {task.duration || estimateDuration(task.text)}
                  </span>

                  {/* Delete */}
                  {!isLocked && (
                    <button
                      onClick={() => handleDeleteTask(task)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ef4444]/10 transition-all"
                    >
                      <X className="w-3 h-3 text-[#5B6574] hover:text-[#ef4444]" />
                    </button>
                  )}
                  {isLocked && (
                    <span className="relative group">
                      <Lock className="w-3 h-3" style={{ color: '#5B6574' }} />
                      <span className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded-lg text-micro whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20" style={{ background: '#1E2530', border: '1px solid rgba(46,230,216,0.2)', color: '#8B95A5' }}>
                        Planned yesterday — can only toggle
                      </span>
                    </span>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {allDisplayTasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
              <div className="relative w-14 h-14 mb-4 animate-float">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'rgba(46,230,216,0.08)', boxShadow: '0 0 24px rgba(46,230,216,0.15)' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="rgba(46,230,216,0.5)" strokeWidth="1.5">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    <line x1="10" y1="14" x2="14" y2="14" />
                    <line x1="12" y1="12" x2="12" y2="16" />
                  </svg>
                </div>
              </div>
              <p className="text-body font-semibold text-[#E9EDF2]/70">Your day is clear ✨</p>
              <p className="text-caption mt-1.5" style={{ color: '#5B6574' }}>Add your first focus task below</p>
              {/* Quick suggestions */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {['Math practice', 'Read chapter', 'Review notes'].map(s => (
                  <button
                    key={s}
                    onClick={() => setNewTaskText(s)}
                    className="text-micro px-2.5 py-1 rounded-lg font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(46,230,216,0.06)', border: '1px solid rgba(46,230,216,0.1)', color: '#2EE6D8' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Add task input */}
        <div className="p-4 pt-2" style={{ borderTop: '1px solid rgba(46,230,216,0.06)' }}>
          <div className="flex items-center gap-2">
            <input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2.5 rounded-xl text-[#E9EDF2] text-body placeholder:text-[#5B6574] transition-all outline-none"
              style={{
                background: 'rgba(21,26,35,0.6)',
                border: '1px solid rgba(46,230,216,0.1)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(46,230,216,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(46,230,216,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(46,230,216,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #2EE6D8, #1CC9B8)',
                boxShadow: '0 4px 12px rgba(46,230,216,0.25)',
              }}
            >
              <Plus className="w-4 h-4 text-[#0B0E14]" />
            </motion.button>
          </div>
      </div>
    </motion.div>
  );
};
