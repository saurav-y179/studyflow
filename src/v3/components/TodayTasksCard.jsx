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
  saveEntry,
  getToday,
  createTask,
  canEditTask,
} from '../../utils/storage';

// Subject icons/colors for visual flair
const SUBJECT_COLORS = [
  { bg: 'rgba(115,127,227,0.15)', text: '#737fe3', dot: '#737fe3' },
  { bg: 'rgba(21,42,209,0.15)', text: '#a78bfa', dot: '#152ad1' },
  { bg: 'rgba(0,255,178,0.15)', text: '#00ffb2', dot: '#00ffb2' },
  { bg: 'rgba(255,193,7,0.15)', text: '#ffc107', dot: '#ffc107' },
  { bg: 'rgba(255,107,107,0.15)', text: '#ff6b6b', dot: '#ff6b6b' },
];

const getTaskColor = (index) => SUBJECT_COLORS[index % SUBJECT_COLORS.length];

// Auto-assign estimated duration based on task text
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
  const [entry, setEntry] = useState(() => getTodayEntry());
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
    const current = getTodayEntry();
    updateEntry({ ...current, todayTasks: [...(current.todayTasks || []), task] });
    setNewTaskText('');
  };

  const handleToggleTask = (task) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canToggle) return;
    const current = getTodayEntry();
    const nextTasks = (current.todayTasks || []).map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  const handleDeleteTask = (task) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canEdit) return;
    const current = getTodayEntry();
    const nextTasks = (current.todayTasks || []).filter((t) => t.id !== task.id);
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  return (
    <div className="bg-[#030610]/90 backdrop-blur-xl border-2 border-[#16E2F5]/40 shadow-[0_0_20px_rgba(22,226,245,0.15)] rounded-2xl overflow-hidden flex flex-col">

      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#737fe3] shadow-[0_0_8px_rgba(115,127,227,0.5)]" />
            <h3 className="text-white font-bold text-[15px] tracking-tight">Today's Tasks</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#a1aaed] bg-[#1a2240]/60 px-2.5 py-1 rounded-lg tabular-nums font-mono font-bold">
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-[#a1aaed]">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* Tasks list */}
      <div className="px-5 pb-2 flex-1 space-y-1.5 max-h-[280px] overflow-y-auto">
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
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                  task.completed
                    ? 'bg-[#737fe3]/5 border border-[#737fe3]/15'
                    : 'border border-transparent hover:border-[#4455da]/30 hover:bg-[#111b35]/50'
                }`}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleTask(task)}
                  className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed
                      ? 'bg-[#737fe3] border-[#737fe3]'
                      : isLocked
                      ? 'border-[#3d4d6e]/40'
                      : 'border-[#3d4d6e] hover:border-[#737fe3]'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3 text-[#0d1225]" />}
                </button>

                {/* Color dot */}
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color.dot }} />

                {/* Task text */}
                <span className={`flex-1 text-sm ${
                  task.completed ? 'line-through text-[#a1aaed]' : 'text-white'
                }`}>
                  {task.text}
                </span>

                {/* Duration badge */}
                <span className="text-xs text-[#a1aaed] tabular-nums font-mono">
                  {task.duration || estimateDuration(task.text)}
                </span>

                {/* Delete */}
                {!isLocked && (
                  <button
                    onClick={() => handleDeleteTask(task)}
                    className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff4d6a]/15 transition-all"
                  >
                    <X className="w-3 h-3 text-[#a1aaed] hover:text-[#ff4d6a]" />
                  </button>
                )}
                {isLocked && (
                  <Lock className="w-3 h-3 text-[#a1aaed]/70/40" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {allDisplayTasks.length === 0 && (
          <p className="text-center text-[#a1aaed]/70 text-sm py-6">No tasks yet</p>
        )}
      </div>

      {/* Add task input */}
      <div className="p-4 pt-2 border-t border-[#4455da]/30/50">
        <div className="flex items-center gap-2">
          <input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2.5 bg-[#152ad1]/10 border border-[#4455da]/30 rounded-xl text-white text-sm placeholder:text-[#a1aaed]/70 focus:outline-none focus:border-[#737fe3]/30 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            disabled={!newTaskText.trim()}
            className="w-10 h-10 bg-[#737fe3] hover:bg-[#4df0ff] rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#737fe3]/20"
          >
            <Plus className="w-4 h-4 text-[#0d1225]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
