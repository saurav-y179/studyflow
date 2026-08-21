import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, GripVertical } from 'lucide-react';
import { format, addDays } from 'date-fns';
import {
  getTomorrowEntry,
  saveEntry,
  getTomorrow,
  createTask,
} from '../../utils/storage';

const TAG_STYLES = {
  Focus: { bg: 'rgba(46,230,216,0.12)', text: '#2EE6D8', border: 'rgba(46,230,216,0.2)' },
  Study: { bg: 'rgba(255,180,67,0.12)', text: '#FFB443', border: 'rgba(255,180,67,0.2)' },
  Practice: { bg: 'rgba(74,222,128,0.12)', text: '#4ADE80', border: 'rgba(74,222,128,0.2)' },
  Test: { bg: 'rgba(248,113,113,0.12)', text: '#F87171', border: 'rgba(248,113,113,0.2)' },
  Creative: { bg: 'rgba(167,139,250,0.12)', text: '#A78BFA', border: 'rgba(167,139,250,0.2)' },
  Review: { bg: 'rgba(96,165,250,0.12)', text: '#60A5FA', border: 'rgba(96,165,250,0.2)' },
};

const PLAN_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

const detectTag = (text) => {
  const t = text.toLowerCase();
  if (t.includes('test') || t.includes('mock') || t.includes('exam') || t.includes('quiz')) return 'Test';
  if (t.includes('practice') || t.includes('exercise') || t.includes('problem')) return 'Practice';
  if (t.includes('study') || t.includes('chapter') || t.includes('read') || t.includes('learn')) return 'Study';
  if (t.includes('review') || t.includes('revise') || t.includes('recap')) return 'Review';
  if (t.includes('write') || t.includes('essay') || t.includes('project') || t.includes('build')) return 'Creative';
  return 'Focus';
};

const estimateDuration = (text) => {
  const t = text.toLowerCase();
  if (t.includes('revision') || t.includes('review') || t.includes('recap')) return '30m';
  if (t.includes('practice') || t.includes('exercise') || t.includes('quiz')) return '45m';
  if (t.includes('essay') || t.includes('writing') || t.includes('project')) return '60m';
  if (t.includes('mock') || t.includes('test') || t.includes('exam') || t.includes('full')) return '90m';
  return '45m';
};

export const TomorrowPlanCard = ({ onEntriesChange }) => {
  const [entry, setEntry] = useState(() => getTomorrowEntry());
  const [newTaskText, setNewTaskText] = useState('');
  const tomorrowDate = getTomorrow();
  const tasks = entry?.todayTasks || [];

  const updateEntry = (updated) => {
    saveEntry(updated);
    setEntry(updated);
    onEntriesChange?.();
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    const task = createTask(newTaskText, tomorrowDate);
    const usedTimes = tasks.map(t => t.time).filter(Boolean);
    const nextTime = PLAN_TIMES.find(t => !usedTimes.includes(t)) || '';
    task.time = nextTime;
    task.tag = detectTag(newTaskText);
    task.duration = estimateDuration(newTaskText);

    const current = getTomorrowEntry();
    updateEntry({ ...current, todayTasks: [...(current.todayTasks || []), task] });
    setNewTaskText('');
  };

  const handleDeleteTask = (task) => {
    const current = getTomorrowEntry();
    const nextTasks = (current.todayTasks || []).filter((t) => t.id !== task.id);
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  const tomorrowFormatted = format(addDays(new Date(), 1), 'EEEE, MMMM d, yyyy');
  const taskCount = tasks.length;

  // Estimated total time
  const totalEstimated = useMemo(() => {
    const mins = tasks.reduce((sum, t) => {
      const d = t.duration || '45m';
      return sum + parseInt(d);
    }, 0);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }, [tasks]);

  // Tag distribution for visual indicator
  const tagCounts = useMemo(() => {
    const counts = {};
    tasks.forEach(t => {
      const tag = t.tag || 'Focus';
      counts[tag] = (counts[tag] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <motion.div
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[18px] overflow-hidden flex flex-col"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', borderColor: 'rgba(255,180,67,0.12)', transition: { duration: 0.2 } }}
    >

        {/* Header */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-[#FFB443]" />
                <div className="absolute -inset-1 rounded-full" style={{ background: 'rgba(255,180,67,0.2)', filter: 'blur(4px)' }} />
              </div>
              <h3 className="text-h2" style={{ color: '#E9EDF2' }}>Tomorrow's Plan</h3>
            </div>
            <div className="flex items-center gap-2">
              {taskCount > 0 && (
                <span className="flex items-center gap-1 text-micro font-mono px-2 py-1 rounded-md" style={{ background: 'rgba(255,180,67,0.04)', color: '#8B95A5' }}>
                  {totalEstimated}
                </span>
              )}
              <span className="text-micro font-mono px-2 py-1 rounded-md" style={{ background: 'rgba(255,180,67,0.06)', color: '#FFB443' }}>
                {taskCount} task{taskCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-caption" style={{ color: '#8B95A5' }}>{tomorrowFormatted}</p>

          {/* Tag distribution bar */}
          {taskCount > 0 && (
            <div className="flex gap-0.5 mt-3 h-1 rounded-full overflow-hidden">
              {Object.entries(tagCounts).map(([tag, count]) => {
                const style = TAG_STYLES[tag] || TAG_STYLES.Focus;
                const width = (count / taskCount) * 100;
                return (
                  <motion.div
                    key={tag}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: style.text }}
                    title={`${tag}: ${count}`}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks with time slots */}
        <div className="px-5 pb-2 flex-1 space-y-0.5 max-h-[280px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => {
              const tagStyle = TAG_STYLES[task.tag] || TAG_STYLES.Focus;
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -15, height: 0 }}
                  className="group flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all duration-200 hover:bg-[#1E2530]"
                  style={i < tasks.length - 1 ? { borderBottom: '1px solid rgba(255,180,67,0.04)' } : {}}
                >
                  {/* Drag handle hint */}
                  <GripVertical className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-30 transition-opacity" style={{ color: '#5B6574' }} />

                  {/* Time pill */}
                  <span className="text-micro w-[62px] flex-shrink-0 font-mono px-1.5 py-0.5 rounded text-center" style={{ background: 'rgba(255,180,67,0.04)', color: '#5B6574' }}>
                    {task.time || '--:--'}
                  </span>

                  {/* Colored tag bar */}
                  <div className="w-0.5 h-5 rounded-full flex-shrink-0" style={{ background: tagStyle.text }} />

                  {/* Task text */}
                  <span className="flex-1 text-body text-[#E9EDF2] truncate">{task.text}</span>

                  {/* Duration pill */}
                  {task.duration && (
                    <span className="text-micro font-mono px-1.5 py-0.5 rounded hidden group-hover:inline-block" style={{ background: 'rgba(255,255,255,0.04)', color: '#5B6574' }}>
                      {task.duration}
                    </span>
                  )}

                  {/* Tag */}
                  <span
                    className="text-micro font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: tagStyle.bg, color: tagStyle.text, border: `1px solid ${tagStyle.border}` }}
                  >
                    {task.tag || 'Focus'}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ef4444]/10 transition-all"
                  >
                    <X className="w-3 h-3 text-[#5B6574] hover:text-[#ef4444]" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {tasks.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 animate-float" style={{ background: 'rgba(255,180,67,0.06)' }}>
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="rgba(255,180,67,0.35)" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                </svg>
              </div>
              <p className="text-body font-medium text-[#E9EDF2]/60">Plan ahead</p>
              <p className="text-caption mt-1" style={{ color: '#5B6574' }}>What's your main goal for tomorrow?</p>
              {/* Quick suggestions */}
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {['Study session', 'Practice problems', 'Review notes'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setNewTaskText(s); }}
                    className="text-micro px-2.5 py-1 rounded-lg font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(255,180,67,0.06)', border: '1px solid rgba(255,180,67,0.1)', color: '#FFB443' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Add task input */}
        <div className="p-4 pt-2" style={{ borderTop: '1px solid rgba(255,180,67,0.06)' }}>
          <div className="flex items-center gap-2">
            <input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              placeholder="Plan a task for tomorrow..."
              className="flex-1 px-4 py-2.5 rounded-xl text-[#E9EDF2] text-body placeholder:text-[#5B6574] transition-all outline-none"
              style={{
                background: 'rgba(21,26,35,0.6)',
                border: '1px solid rgba(255,180,67,0.1)',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,180,67,0.3)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,180,67,0.06)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,180,67,0.1)'; e.target.style.boxShadow = 'none'; }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #FFB443, #E5972E)',
                boxShadow: '0 4px 12px rgba(255,180,67,0.25)',
              }}
            >
              <Plus className="w-4 h-4 text-[#0B0E14]" />
            </motion.button>
          </div>
      </div>
    </motion.div>
  );
};
