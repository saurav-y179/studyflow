import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Lock, X, Pencil, Calendar, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import {
  getTodayEntry,
  getOrCreateTodayEntry,
  getTomorrowEntry,
  saveEntry,
  getToday,
  getTomorrow,
  createTask,
  canEditTask,
} from '../utils/storage';

export const DailySubmission = ({ onEntriesChange }) => {
  const [todayEntry, setTodayEntry] = useState(() => getTodayEntry() || getOrCreateTodayEntry());
  const [tomorrowEntry, setTomorrowEntry] = useState(() => getTomorrowEntry());
  const [newTaskText, setNewTaskText] = useState('');
  const [newTomorrowTask, setNewTomorrowTask] = useState('');

  const currentDate = getToday();
  const tomorrowDate = getTomorrow();

  const updateToday = useCallback((updated) => {
    saveEntry(updated);
    setTodayEntry(updated);
    onEntriesChange?.();
  }, [onEntriesChange]);

  const updateTomorrow = useCallback((updated) => {
    saveEntry(updated);
    setTomorrowEntry(updated);
    onEntriesChange?.();
  }, [onEntriesChange]);

  const handleAddTask = useCallback((taskText, isForTomorrow = false) => {
    if (!taskText.trim()) return;
    if (isForTomorrow) {
      const task = createTask(taskText, tomorrowDate);
      const entry = getTomorrowEntry();
      updateTomorrow({ ...entry, todayTasks: [...(entry.todayTasks || []), task] });
      setNewTomorrowTask('');
      return;
    }
    const task = createTask(taskText, currentDate);
    const entry = getOrCreateTodayEntry();
    updateToday({ ...entry, todayTasks: [...(entry.todayTasks || []), task] });
    setNewTaskText('');
  }, [currentDate, tomorrowDate, updateToday, updateTomorrow]);

  const handleToggleTask = useCallback((task, isForTomorrow = false) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canToggle) return;
    const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
    const setter = isForTomorrow ? updateTomorrow : updateToday;
    const nextTasks = (target?.todayTasks || []).map((t) =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    );
    setter({ ...target, todayTasks: nextTasks });
  }, [currentDate, updateToday, updateTomorrow]);

  const handleDeleteTask = useCallback((task, isForTomorrow = false) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canEdit) return;
    const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
    const setter = isForTomorrow ? updateTomorrow : updateToday;
    const nextTasks = (target?.todayTasks || []).filter((t) => t.id !== task.id);
    setter({ ...target, todayTasks: nextTasks });
  }, [currentDate, updateToday, updateTomorrow]);

  const handleEditTask = useCallback((task, newText, isForTomorrow = false) => {
    if (!newText.trim()) return;
    const permission = canEditTask(task, currentDate);
    if (!permission.canEdit) return;
    const target = isForTomorrow ? getTomorrowEntry() : getTodayEntry();
    const setter = isForTomorrow ? updateTomorrow : updateToday;
    const nextTasks = (target?.todayTasks || []).map((t) =>
      t.id === task.id ? { ...t, text: newText.trim() } : t
    );
    setter({ ...target, todayTasks: nextTasks });
  }, [currentDate, updateToday, updateTomorrow]);

  if (!todayEntry || !tomorrowEntry) return null;

  const todayTasks = todayEntry.todayTasks || [];
  const tomorrowTasks = tomorrowEntry.todayTasks || [];

  return (
    <>
      {/* TODAY CARD */}
      <div className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-5 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[var(--card-border-10)] transition-all duration-400">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="text-body font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
            Today's Tasks
          </h2>
        </div>
        <p className="text-[13px] text-[var(--text-muted2)] mb-5">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>

        {/* Task List */}
        <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
          <AnimatePresence>
            {todayTasks.map((task) => {
              const locked = !canEditTask(task, currentDate).canEdit;
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  locked={locked}
                  onToggle={(t) => handleToggleTask(t)}
                  onDelete={(t) => handleDeleteTask(t)}
                  onEdit={(t, text) => handleEditTask(t, text)}
                />
              )
            })}
          </AnimatePresence>

          {todayTasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="relative w-14 h-14 mb-4">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--accent-dim-bg)', boxShadow: 'var(--accent-dim-shadow)' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center">
                  <ClipboardList className="w-7 h-7" style={{ color: 'var(--accent-dim-color)' }} />
                </div>
              </div>
              <p className="text-h3 font-semibold text-[var(--text-bright)]">Your day is wide open ✨</p>
              <p className="text-caption text-[var(--text-muted2)] mt-1.5">Add your first focus task below.</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 relative">
          <input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTaskText)}
            placeholder="Add a new task... (e.g., Study calculus for 2h)"
            className="w-full bg-[var(--input-bg)] border-[var(--card-border-10)] rounded-xl py-3 pl-4 pr-12 text-h3 text-[var(--text-bright)] placeholder:text-[var(--text-muted2)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-shadow)] transition-all"
          />
          <button
            onClick={() => handleAddTask(newTaskText)}
            disabled={!newTaskText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center hover:bg-[var(--accent)] hover:text-[var(--card-surface)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TOMORROW CARD */}
      <div className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-5 flex flex-col hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[var(--card-border-10)] transition-all duration-400">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
          <h2 className="text-body font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
            Tomorrow's Plan
          </h2>
        </div>
        <p className="text-[13px] text-[var(--text-muted2)] mb-5">
          {format(new Date(tomorrowDate), 'EEEE, MMMM d, yyyy')}
        </p>

        {/* Task List */}
        <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
          <AnimatePresence>
            {tomorrowTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                locked={false}
                isTomorrow
                onDelete={(t) => handleDeleteTask(t, true)}
                onEdit={(t, text) => handleEditTask(t, text, true)}
              />
            ))}
          </AnimatePresence>

          {tomorrowTasks.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="relative w-14 h-14 mb-4">
                <div className="absolute inset-0 rounded-2xl" style={{ background: 'var(--accent-alt-dim-bg)', boxShadow: 'var(--accent-alt-dim-shadow)' }} />
                <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center">
                  <ClipboardList className="w-7 h-7" style={{ color: 'var(--accent-alt-dim-color)' }} />
                </div>
              </div>
              <p className="text-h3 font-semibold text-[var(--text-bright)]">Plan ahead ✨</p>
              <p className="text-caption text-[var(--text-muted2)] mt-1.5">What's your main goal for tomorrow?</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 relative">
          <input
            value={newTomorrowTask}
            onChange={(e) => setNewTomorrowTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTomorrowTask, true)}
            placeholder="Plan a task for tomorrow..."
            className="w-full bg-[var(--input-bg)] border-[var(--card-border-10)] rounded-xl py-3 pl-4 pr-12 text-h3 text-[var(--text-bright)] placeholder:text-[var(--text-muted2)] focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-shadow)] transition-all"
          />
          <button
            onClick={() => handleAddTask(newTomorrowTask, true)}
            disabled={!newTomorrowTask.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[var(--accent-alt)]/10 text-[var(--accent-alt)] flex items-center justify-center hover:bg-[var(--accent-alt)] hover:text-[var(--card-surface)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

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
      initial={{ opacity: 0, height: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        height: 'auto',
        scale: 1,
        transition: { duration: 0.2 }
      }}
      exit={{ opacity: 0, height: 0, scale: 0.9 }}
      whileHover={!locked ? { y: -1, backgroundColor: 'rgba(255,255,255,0.06)' } : {}}
      className={`group flex items-center gap-3 px-4 py-3 rounded-[14px] bg-[var(--input-bg)] border-[var(--card-border)] transition-all duration-300 ${
        locked ? 'opacity-60' : ''
      }`}
    >
      {/* Checkbox */}
      {!isTomorrow && (
        <button
          onClick={() => onToggle?.(task)}
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${
            task.completed
              ? 'bg-[var(--accent-alt-2)] border-[var(--accent-alt-2)] scale-110'
              : 'border-2 border-[var(--text-muted2)] hover:border-[var(--accent)]'
          }`}
        >
          {task.completed && <Check className="w-3.5 h-3.5 text-[var(--card-surface)] stroke-[3]" />}
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
          className="flex-1 bg-transparent border-b border-[var(--accent)] text-[var(--text-bright)] text-h3 focus:outline-none"
        />
      ) : (
        <span
          className={`flex-1 text-h3 transition-colors ${
            task.completed
              ? 'line-through text-[var(--text-muted)] opacity-50'
              : 'text-[var(--text-bright)]'
          }`}
          onDoubleClick={() => {
            if (!locked && onEdit) {
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
          <Lock className="w-4 h-4 text-[var(--text-muted2)]" />
        )}
        {!locked && onEdit && !isEditing && (
          <button
            onClick={() => {
              setEditText(task.text);
              setIsEditing(true);
            }}
            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        )}
        {!locked && onDelete && (
          <button
            onClick={() => onDelete(task)}
            className="w-7 h-7 rounded-lg hover:bg-[#F87171]/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-[var(--text-muted)] hover:text-[#F87171]" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
