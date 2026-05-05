import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Check,
  Lock,
  X,
  Pencil,
  Calendar,
  Zap,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getTodayEntry,
  getTomorrowEntry,
  saveEntry,
  getToday,
  getTomorrow,
  createTask,
  canEditTask,
  getCompletionPercentage,
} from '../utils/storage';

export const DailySubmission = ({ onEntriesChange }) => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [tomorrowEntry, setTomorrowEntry] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTomorrowTask, setNewTomorrowTask] = useState('');

  const currentDate = getToday();
  const tomorrowDate = getTomorrow();

  useEffect(() => {
    // Task promotion is already handled by useStudyFlow on mount.
    // Just load the current state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayEntry(getTodayEntry());
    setTomorrowEntry(getTomorrowEntry());
  }, [currentDate]);

  const updateToday = (updated) => {
    saveEntry(updated);
    setTodayEntry(updated);
    onEntriesChange?.();
  };

  const updateTomorrow = (updated) => {
    saveEntry(updated);
    setTomorrowEntry(updated);
    onEntriesChange?.();
  };

  const handleAddTask = useCallback(
    (taskText, isForTomorrow = false) => {
      if (!taskText.trim()) return;
      if (isForTomorrow) {
        const task = createTask(taskText, tomorrowDate);
        const entry = getTomorrowEntry();
        updateTomorrow({ ...entry, todayTasks: [...(entry.todayTasks || []), task] });
        setNewTomorrowTask('');
        return;
      }
      const task = createTask(taskText, currentDate);
      const entry = getTodayEntry();
      updateToday({ ...entry, todayTasks: [...(entry.todayTasks || []), task] });
      setNewTaskText('');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDate, tomorrowDate]
  );

  const handleToggleTask = useCallback(
    (task, isForTomorrow = false) => {
      const permission = canEditTask(task, currentDate);
      if (!permission.canToggle) return;
      const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
      const setter = isForTomorrow ? updateTomorrow : updateToday;
      const nextTasks = (target?.todayTasks || []).map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      );
      setter({ ...target, todayTasks: nextTasks });
    },
    [currentDate]
  );

  const handleDeleteTask = useCallback(
    (task, isForTomorrow = false) => {
      const permission = canEditTask(task, currentDate);
      if (!permission.canEdit) return;
      const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
      const setter = isForTomorrow ? updateTomorrow : updateToday;
      const nextTasks = (target?.todayTasks || []).filter((t) => t.id !== task.id);
      setter({ ...target, todayTasks: nextTasks });
    },
    [currentDate]
  );

  const handleEditTask = useCallback(
    (task, newText, isForTomorrow = false) => {
      if (!newText.trim()) return;
      const permission = canEditTask(task, currentDate);
      if (!permission.canEdit) return;
      const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
      const setter = isForTomorrow ? updateTomorrow : updateToday;
      const nextTasks = (target?.todayTasks || []).map((t) =>
        t.id === task.id ? { ...t, text: newText.trim() } : t
      );
      setter({ ...target, todayTasks: nextTasks });
    },
    [currentDate]
  );

  if (!todayEntry || !tomorrowEntry) return null;

  const plannedTasks = todayEntry.todayTasks.filter(
    (t) => canEditTask(t, currentDate).reason === 'planned_yesterday'
  );
  const addedTodayTasks = todayEntry.todayTasks.filter(
    (t) => canEditTask(t, currentDate).reason === 'added_today'
  );
  const completionPercent = getCompletionPercentage(todayEntry);
  const totalTasks = todayEntry.todayTasks.length;
  const completedTasks = todayEntry.todayTasks.filter((t) => t.completed).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* ── Today Panel ──────────────────────────────────────── */}
      <div className="glass-strong rounded-2xl p-6 relative overflow-hidden flex flex-col">
        {/* Subtle top accent */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Today&apos;s Tasks
              </h2>
              <p className="text-text-tertiary text-sm">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>

          {/* Completion ring */}
          <CompletionRing percent={completionPercent} completed={completedTasks} total={totalTasks} />
        </div>

        {/* Progress bar */}
        <div className="mt-4 mb-6">
          <div className="h-1.5 bg-background/60 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Planned tasks section */}
        {plannedTasks.length > 0 && (
          <Section
            title="Planned Tasks"
            subtitle="From yesterday — locked"
            tasks={plannedTasks}
            locked
            onToggle={(t) => handleToggleTask(t)}
          />
        )}

        {/* Added today section */}
        <Section
          title="Added Today"
          subtitle="Editable"
          tasks={addedTodayTasks}
          onToggle={(t) => handleToggleTask(t)}
          onDelete={(t) => handleDeleteTask(t)}
          onEdit={(t, text) => handleEditTask(t, text)}
        />

        {/* Add new task input */}
        <div className="flex items-center gap-2 pt-3">
          <input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTaskText)}
            placeholder="Add a new task..."
            className="flex-1 px-4 py-3 bg-background/40 border border-glass-border rounded-xl text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10 transition-all duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddTask(newTaskText)}
            disabled={!newTaskText.trim()}
            className="px-4 py-3 bg-primary hover:bg-primary-glow text-background rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* ── Tomorrow Panel ───────────────────────────────────── */}
      <div className="glass-strong rounded-2xl overflow-hidden relative flex flex-col">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                Tomorrow&apos;s Plan
              </h2>
              <p className="text-text-tertiary text-sm">
                {(tomorrowEntry.todayTasks || []).length} task
                {(tomorrowEntry.todayTasks || []).length !== 1 ? 's' : ''} planned
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 flex-1 flex flex-col">
          <Section
            title="Planning"
            subtitle="These will be locked tomorrow"
            tasks={tomorrowEntry.todayTasks || []}
            onDelete={(t) => handleDeleteTask(t, true)}
            onEdit={(t, text) => handleEditTask(t, text, true)}
            isTomorrow
          />

          <div className="flex gap-2 mt-auto pt-4">
                  <input
                    value={newTomorrowTask}
                    onChange={(e) => setNewTomorrowTask(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === 'Enter' && handleAddTask(newTomorrowTask, true)
                    }
                    placeholder="Plan a task for tomorrow..."
                    className="flex-1 px-4 py-3 bg-background/40 border border-glass-border rounded-xl text-text-primary text-sm placeholder:text-text-tertiary focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/10 transition-all duration-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAddTask(newTomorrowTask, true)}
                    disabled={!newTomorrowTask.trim()}
                    className="px-4 py-3 bg-accent hover:bg-accent-glow text-background font-bold rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
        </div>
      </div>
    </div>
  );
};

// ── Completion Ring ─────────────────────────────────────────────────
const CompletionRing = ({ percent, completed, total }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="60" height="60" className="-rotate-90">
        <circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="4"
        />
        <motion.circle
          cx="30"
          cy="30"
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-text-primary font-mono">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
};

// ── Section ─────────────────────────────────────────────────────────
const Section = ({ title, subtitle, tasks, locked = false, isTomorrow = false, onToggle, onDelete, onEdit }) => (
  <div className="mb-5">
    <div className="flex items-center gap-2 mb-3">
      <h3 className="text-xs font-semibold uppercase text-text-tertiary tracking-wider">
        {title}
      </h3>
      {subtitle && (
        <span className="text-xs text-text-tertiary/60">· {subtitle}</span>
      )}
    </div>
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            locked={locked}
            isTomorrow={isTomorrow}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </AnimatePresence>
      {tasks.length === 0 && (
        <p className="text-text-tertiary/50 text-sm py-3 text-center">
          No tasks yet
        </p>
      )}
    </div>
  </div>
);

// ── Task Item ───────────────────────────────────────────────────────
const TaskItem = ({ task, locked, isTomorrow, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSaveEdit = () => {
    if (editText.trim() && editText.trim() !== task.text) {
      onEdit?.(task, editText);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveEdit();
    if (e.key === 'Escape') {
      setEditText(task.text);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ 
        opacity: task.completed ? 0.6 : 1, 
        y: 0, 
        scale: 1,
        transition: { duration: 0.3 }
      }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      whileHover={!locked ? { y: -3, boxShadow: '0 8px 20px -4px rgba(0,0,0,0.5)', scale: 1.01 } : {}}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-300 ${
        locked
          ? 'opacity-50 border-glass-border bg-background/30 backdrop-blur-md'
          : task.completed
          ? 'border-primary/30 bg-primary/10'
          : 'border-glass-border bg-surface-elevated/40 hover:border-primary/50'
      }`}
    >
      {/* Checkbox — only for today's tasks (not tomorrow planning) */}
      {!isTomorrow && (
        <button
          onClick={() => onToggle?.(task)}
          className={`relative flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? 'bg-primary border-primary shadow-[0_0_10px_rgba(247,37,133,0.5)]'
              : 'border-text-tertiary/40 hover:border-primary'
          }`}
        >
          <AnimatePresence>
            {task.completed && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="w-4 h-4 text-background font-bold" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      )}

      {/* Task text / editing */}
      {isEditing ? (
        <input
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-primary/30 text-text-primary text-sm py-0.5 focus:outline-none"
        />
      ) : (
        <span
          className={`flex-1 text-sm transition-colors ${
            task.completed
              ? 'line-through text-primary/70'
              : 'text-text-primary'
          }`}
          onDoubleClick={() => {
            if (!locked && (onEdit)) {
              setEditText(task.text);
              setIsEditing(true);
            }
          }}
        >
          {task.text}
        </span>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {locked && (
          <div className="w-7 h-7 rounded-lg bg-surface/50 flex items-center justify-center shadow-inner">
            <Lock className="w-3.5 h-3.5 text-text-tertiary/60" />
          </div>
        )}
        {!locked && onEdit && !isEditing && (
          <button
            onClick={() => {
              setEditText(task.text);
              setIsEditing(true);
            }}
            className="w-7 h-7 rounded-lg hover:bg-surface-elevated flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-text-tertiary" />
          </button>
        )}
        {!locked && onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="w-7 h-7 rounded-lg hover:bg-error/15 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5 text-text-tertiary hover:text-error" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
