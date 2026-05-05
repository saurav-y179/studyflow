import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, Lock, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { 
  getTodayEntry, 
  getTomorrowEntry, 
  getYesterdayEntry, 
  saveEntry, 
  getToday, 
  getTomorrow, 
  createTask, 
  canEditTask, 
  getCompletionPercentage,
  formatDate
} from '../utils/storage';

export const DailySubmission = () => {
  const [todayEntry, setTodayEntry] = useState(null);
  const [tomorrowEntry, setTomorrowEntry] = useState(null);
  const [yesterdayTasks, setYesterdayTasks] = useState([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTomorrowTask, setNewTomorrowTask] = useState('');
  const [showTomorrowPanel, setShowTomorrowPanel] = useState(false);

  const currentDate = getToday();
  const tomorrowDate = getTomorrow();

  useEffect(() => {
    const today = getTodayEntry();
    const tomorrow = getTomorrowEntry();
    const yesterday = getYesterdayEntry();
    
    setTodayEntry(today);
    setTomorrowEntry(tomorrow);
    setYesterdayTasks(yesterday?.todayTasks || []);
  }, []);

  const handleAddTask = useCallback((taskText, isForTomorrow = false) => {
    if (!taskText.trim()) return;
    
    if (isForTomorrow) {
      const task = createTask(taskText, tomorrowDate);
      const updated = {
        ...tomorrowEntry,
        todayTasks: [...(tomorrowEntry.todayTasks || []), task],
        timestamp: Date.now(),
      };
      saveEntry(updated);
      setTomorrowEntry(updated);
    } else {
      const task = createTask(taskText, currentDate);
      const updated = {
        ...todayEntry,
        todayTasks: [...(todayEntry.todayTasks || []), task],
        tomorrowTasks: todayEntry.tomorrowTasks || [],
        timestamp: Date.now(),
      };
      saveEntry(updated);
      setTodayEntry(updated);
    }
    
    setNewTaskText('');
    setNewTomorrowTask('');
  }, [currentDate, tomorrowDate, todayEntry, tomorrowEntry]);

  const handleToggleTask = useCallback((task, isForTomorrow = false) => {
    const taskIndex = isForTomorrow 
      ? tomorrowEntry.todayTasks.findIndex(t => t.id === task.id)
      : todayEntry.todayTasks.findIndex(t => t.id === task.id);
    
    if (taskIndex === -1) return;
    
    const updatedTask = { ...task, completed: !task.completed };
    
    if (isForTomorrow) {
      const newTasks = [...tomorrowEntry.todayTasks];
      newTasks[taskIndex] = updatedTask;
      const updated = { ...tomorrowEntry, todayTasks: newTasks, timestamp: Date.now() };
      saveEntry(updated);
      setTomorrowEntry(updated);
    } else {
      const newTasks = [...todayEntry.todayTasks];
      newTasks[taskIndex] = updatedTask;
      const updated = { ...todayEntry, todayTasks: newTasks, timestamp: Date.now() };
      saveEntry(updated);
      setTodayEntry(updated);
    }
  }, [todayEntry, tomorrowEntry]);

  const handleDeleteTask = useCallback((task, isForTomorrow = false) => {
    if (isForTomorrow) {
      const newTasks = tomorrowEntry.todayTasks.filter(t => t.id !== task.id);
      const updated = { ...tomorrowEntry, todayTasks: newTasks, timestamp: Date.now() };
      saveEntry(updated);
      setTomorrowEntry(updated);
    } else {
      const newTasks = todayEntry.todayTasks.filter(t => t.id !== task.id);
      const updated = { ...todayEntry, todayTasks: newTasks, timestamp: Date.now() };
      saveEntry(updated);
      setTodayEntry(updated);
    }
  }, [todayEntry, tomorrowEntry]);

  const getPlannedTasks = () => {
    const plannedTasks = yesterdayTasks.filter(t => {
      const permission = canEditTask(t, currentDate);
      return permission.reason === 'planned_yesterday';
    });
    return plannedTasks;
  };

  const getAddedTodayTasks = () => {
    const addedTasks = (todayEntry?.todayTasks || []).filter(t => {
      const permission = canEditTask(t, currentDate);
      return permission.reason === 'added_today';
    });
    return addedTasks;
  };

  const plannedTasks = getPlannedTasks();
  const addedTodayTasks = getAddedTodayTasks();
  const allTodayTasks = [...plannedTasks, ...addedTodayTasks];
  const completionPercent = allTodayTasks.length > 0 
    ? Math.round((allTodayTasks.filter(t => t.completed).length / allTodayTasks.length) * 100)
    : 0;

  const todayDisplay = format(new Date(), 'EEEE, MMMM d, yyyy');
  const tomorrowDisplay = format(new Date(Date.now() + 86400000), 'EEEE, MMMM d, yyyy');

  return (
    <div className="space-y-6">
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Today's Tasks</h2>
            <p className="text-text-secondary text-sm">{todayDisplay}</p>
          </div>
          {allTodayTasks.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <div className="w-24 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className={`text-sm font-mono font-semibold ${
                completionPercent === 100 ? 'text-primary' : 'text-text-secondary'
              }`}>
                {completionPercent}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {plannedTasks.length > 0 && (
            <div>
              <h3 className="text-text-tertiary text-xs uppercase tracking-wider mb-3">
                Planned Tasks (locked)
              </h3>
              <div className="space-y-2">
                {plannedTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    locked={true}
                    onToggle={(t) => handleToggleTask(t, false)}
                  />
                ))}
              </div>
            </div>
          )}

          {addedTodayTasks.length > 0 && (
            <div>
              <h3 className="text-text-tertiary text-xs uppercase tracking-wider mb-3">
                Added Today
              </h3>
              <div className="space-y-2">
                {addedTodayTasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    locked={false}
                    onToggle={(t) => handleToggleTask(t, false)}
                    onDelete={(t) => handleDeleteTask(t, false)}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTaskText, false)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary text-sm"
            />
            <button
              onClick={() => handleAddTask(newTaskText, false)}
              disabled={!newTaskText.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-glow disabled:opacity-50 text-background font-medium rounded-xl text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6">
        <button
          onClick={() => setShowTomorrowPanel(!showTomorrowPanel)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-secondary" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-text-primary">Tomorrow's Tasks</h2>
              <p className="text-text-secondary text-sm">{tomorrowDisplay}</p>
            </div>
          </div>
          {showTomorrowPanel ? (
            <ChevronUp className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-secondary" />
          )}
        </button>

        <AnimatePresence>
          {showTomorrowPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                <p className="text-text-secondary text-sm mb-4">
                  Plan tomorrow's tasks now. They will be locked once the date changes.
                </p>
                
                {(tomorrowEntry?.todayTasks || []).length > 0 && (
                  <div className="space-y-2">
                    {(tomorrowEntry.todayTasks || []).map(task => (
                      <TaskItem 
                        key={task.id} 
                        task={task} 
                        locked={false}
                        onToggle={(t) => handleToggleTask(t, true)}
                        onDelete={(t) => handleDeleteTask(t, true)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTomorrowTask}
                    onChange={(e) => setNewTomorrowTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask(newTomorrowTask, true)}
                    placeholder="Plan a task for tomorrow..."
                    className="flex-1 px-4 py-2 bg-background border border-border rounded-xl text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-secondary text-sm"
                  />
                  <button
                    onClick={() => handleAddTask(newTomorrowTask, true)}
                    disabled={!newTomorrowTask.trim()}
                    className="px-4 py-2 bg-secondary hover:opacity-90 disabled:opacity-50 text-white font-medium rounded-xl text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const TaskItem = ({ task, locked, onToggle, onDelete }) => {
  const { canEdit } = canEditTask(task, formatDate(new Date()));
  const isLocked = locked || !canEdit;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 bg-background border rounded-xl transition-all ${
      task.completed 
        ? 'border-primary/30 bg-primary/5' 
        : isLocked 
          ? 'border-border opacity-70' 
          : 'border-border hover:border-primary/50'
    }`}>
      <button
        onClick={() => onToggle(task)}
        className={`w-5 h-5 rounded-md flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
          task.completed
            ? 'bg-primary border-primary'
            : 'border-border hover:border-primary'
        }`}
      >
        {task.completed && <Check className="w-3 h-3 text-background" />}
      </button>
      
      <span className={`flex-1 text-sm ${
        task.completed 
          ? 'line-through text-text-tertiary' 
          : 'text-text-primary'
      }`}>
        {task.text}
      </span>
      
      {isLocked && (
        <Lock className="w-4 h-4 text-text-tertiary flex-shrink-0" />
      )}
      
      {!isLocked && (
        <button
          onClick={() => onDelete(task)}
          className="w-6 h-6 rounded hover:bg-error/20 flex items-center justify-center text-text-tertiary hover:text-error transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};