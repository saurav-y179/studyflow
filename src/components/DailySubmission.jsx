import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Lock, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
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
  buildPlannedTask,
  getEntryByDate,
  getYesterday,
} from '../utils/storage';

export const DailySubmission = ({ onEntriesChange }) => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [tomorrowEntry, setTomorrowEntry] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTomorrowTask, setNewTomorrowTask] = useState('');
  const [showTomorrowPanel, setShowTomorrowPanel] = useState(false);

  const currentDate = getToday();
  const tomorrowDate = getTomorrow();

  useEffect(() => {
    const today = getTodayEntry();
    const tomorrow = getTomorrowEntry();
    const yesterday = getEntryByDate(getYesterday());
    const planned = (yesterday?.todayTasks || [])
      .filter((task) => !task.completed)
      .map((task) => buildPlannedTask(task, currentDate));

    const addedToday = (today.todayTasks || []).filter((t) => canEditTask(t, currentDate).reason === 'added_today');
    const mergedToday = { ...today, todayTasks: [...planned, ...addedToday] };
    if ((today.todayTasks || []).length !== mergedToday.todayTasks.length) {
      saveEntry(mergedToday);
    }

    setTodayEntry(mergedToday);
    setTomorrowEntry(tomorrow);
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

  const handleAddTask = useCallback((taskText, isForTomorrow = false) => {
    if (!taskText.trim()) return;
    if (isForTomorrow) {
      const task = createTask(taskText, tomorrowDate);
      updateTomorrow({ ...tomorrowEntry, todayTasks: [...(tomorrowEntry?.todayTasks || []), task] });
      setNewTomorrowTask('');
      return;
    }
    const task = createTask(taskText, currentDate);
    updateToday({ ...todayEntry, todayTasks: [...(todayEntry?.todayTasks || []), task] });
    setNewTaskText('');
  }, [currentDate, tomorrowDate, todayEntry, tomorrowEntry]);

  const handleToggleTask = useCallback((task, isForTomorrow = false) => {
    const permission = canEditTask(task, currentDate);
    if (!permission.canToggle) return;
    const target = isForTomorrow ? tomorrowEntry : todayEntry;
    const setter = isForTomorrow ? updateTomorrow : updateToday;
    const nextTasks = (target?.todayTasks || []).map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t));
    setter({ ...target, todayTasks: nextTasks });
  }, [todayEntry, tomorrowEntry, currentDate]);

  const handleDeleteTask = useCallback((task, isForTomorrow = false) => {
    const target = isForTomorrow ? tomorrowEntry : todayEntry;
    const setter = isForTomorrow ? updateTomorrow : updateToday;
    const nextTasks = (target?.todayTasks || []).filter((t) => t.id !== task.id);
    setter({ ...target, todayTasks: nextTasks });
  }, [todayEntry, tomorrowEntry]);

  if (!todayEntry || !tomorrowEntry) return null;

  const plannedTasks = todayEntry.todayTasks.filter((t) => canEditTask(t, currentDate).reason === 'planned_yesterday');
  const addedTodayTasks = todayEntry.todayTasks.filter((t) => canEditTask(t, currentDate).reason === 'added_today');
  const completionPercent = getCompletionPercentage(todayEntry);

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-text-primary">Today's Tasks</h2>
        <p className="text-text-secondary text-sm mb-4">{format(new Date(), 'EEEE, MMMM d, yyyy')} · {completionPercent}% complete</p>

        <Section title="Planned Tasks" tasks={plannedTasks} locked onToggle={(t) => handleToggleTask(t)} />
        <Section title="Added Today" tasks={addedTodayTasks} onToggle={(t) => handleToggleTask(t)} onDelete={(t) => handleDeleteTask(t)} />

        <div className="flex items-center gap-2 pt-2">
          <input value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTaskText)} placeholder="Add a new task..." className="flex-1 px-4 py-2 bg-background border border-border rounded-xl" />
          <button onClick={() => handleAddTask(newTaskText)} disabled={!newTaskText.trim()} className="px-4 py-2 bg-primary text-background rounded-xl"><Plus className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <button onClick={() => setShowTomorrowPanel(!showTomorrowPanel)} className="w-full flex justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Tomorrow's Tasks</h2>
          {showTomorrowPanel ? <ChevronUp /> : <ChevronDown />}
        </button>
        <AnimatePresence>
          {showTomorrowPanel && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden pt-4">
              <Section title="Planning" tasks={tomorrowEntry.todayTasks || []} onToggle={(t) => handleToggleTask(t, true)} onDelete={(t) => handleDeleteTask(t, true)} />
              <div className="flex gap-2 mt-2">
                <input value={newTomorrowTask} onChange={(e) => setNewTomorrowTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTomorrowTask, true)} placeholder="Plan a task for tomorrow..." className="flex-1 px-4 py-2 bg-background border border-border rounded-xl" />
                <button onClick={() => handleAddTask(newTomorrowTask, true)} disabled={!newTomorrowTask.trim()} className="px-4 py-2 bg-secondary text-white rounded-xl"><Plus className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Section = ({ title, tasks, locked = false, onToggle, onDelete }) => (
  <div className="mb-4">
    <h3 className="text-xs uppercase text-text-tertiary mb-2">{title}</h3>
    <div className="space-y-2">
      {tasks.map((task) => <TaskItem key={task.id} task={task} locked={locked} onToggle={onToggle} onDelete={onDelete} />)}
    </div>
  </div>
);

const TaskItem = ({ task, locked, onToggle, onDelete }) => (
  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${locked ? 'opacity-70' : ''} ${task.completed ? 'bg-primary/5 border-primary/30' : 'border-border'}`}>
    <button onClick={() => onToggle(task)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${task.completed ? 'bg-primary border-primary' : 'border-border'}`}>
      {task.completed && <Check className="w-3 h-3 text-background" />}
    </button>
    <span className={`flex-1 text-sm ${task.completed ? 'line-through text-green-500' : 'text-text-primary'}`}>{task.text}</span>
    {locked && <Lock className="w-4 h-4 text-text-tertiary" />}
    {!locked && onDelete && (
      <button onClick={() => onDelete(task)} className="w-6 h-6 rounded hover:bg-error/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
    )}
  </div>
);
