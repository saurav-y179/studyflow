import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, BookOpen } from 'lucide-react';
import { format, addDays } from 'date-fns';
import {
  getTomorrowEntry,
  saveEntry,
  getTomorrow,
  createTask,
} from '../../utils/storage';

// Tags for visual categorization
const TAG_STYLES = {
  Focus: { bg: 'rgba(21,42,209,0.2)', text: '#a78bfa' },
  Study: { bg: 'rgba(115,127,227,0.2)', text: '#737fe3' },
  Practice: { bg: 'rgba(0,255,178,0.2)', text: '#00ffb2' },
  Test: { bg: 'rgba(255,107,107,0.2)', text: '#ff6b6b' },
};

const PLAN_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

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
    // Assign a time slot
    const usedTimes = tasks.map(t => t.time).filter(Boolean);
    const nextTime = PLAN_TIMES.find(t => !usedTimes.includes(t)) || '';
    task.time = nextTime;
    // Auto-detect tag
    const text = newTaskText.toLowerCase();
    if (text.includes('test') || text.includes('mock') || text.includes('exam')) task.tag = 'Test';
    else if (text.includes('practice') || text.includes('exercise')) task.tag = 'Practice';
    else if (text.includes('study') || text.includes('chapter') || text.includes('equilibrium')) task.tag = 'Study';
    else task.tag = 'Focus';

    const current = getTomorrowEntry();
    updateEntry({ ...current, todayTasks: [...(current.todayTasks || []), task] });
    setNewTaskText('');
  };

  const handleDeleteTask = (task) => {
    const current = getTomorrowEntry();
    const nextTasks = (current.todayTasks || []).filter((t) => t.id !== task.id);
    updateEntry({ ...current, todayTasks: nextTasks });
  };

  // Build formatted tomorrow date
  const tomorrowFormatted = format(addDays(new Date(), 1), 'EEEE, MMMM d, yyyy');

  return (
    <div className="bg-[#030610]/90 backdrop-blur-xl border-2 border-[#00FF00]/40 shadow-[0_0_20px_rgba(0,255,0,0.15)] rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2.5 mb-0.5">
          <div className="w-2 h-2 rounded-full bg-[#00ffb2] shadow-[0_0_8px_rgba(0,255,178,0.5)]" />
          <h3 className="text-white font-bold text-[15px] tracking-tight">Tomorrow's Plan</h3>
        </div>
        <p className="text-[11px] text-[#a1aaed]">{tomorrowFormatted}</p>
      </div>

      {/* Plan label */}
      <div className="px-5 mb-2">
        <span className="text-[10px] text-[#a1aaed] font-bold uppercase tracking-[0.15em]">PLAN</span>
      </div>

      {/* Tasks with time slots */}
      <div className="px-5 pb-2 flex-1 space-y-1 max-h-[280px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => {
            const tagStyle = TAG_STYLES[task.tag] || TAG_STYLES.Focus;
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -15, height: 0 }}
                className="group flex items-center gap-3 py-2.5 border-b border-[#4455da]/30/30 last:border-0"
              >
                {/* Time */}
                <span className="text-[11px] text-[#a1aaed] tabular-nums w-[70px] flex-shrink-0 font-mono">
                  {task.time || '--:-- --'}
                </span>

                {/* Icon */}
                <div className="w-6 h-6 rounded-lg bg-[#1a2240]/60 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-3 h-3 text-[#a1aaed]" />
                </div>

                {/* Task text */}
                <span className="flex-1 text-sm text-white truncate">{task.text}</span>

                {/* Tag */}
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: tagStyle.bg, color: tagStyle.text }}
                >
                  {task.tag || 'Focus'}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteTask(task)}
                  className="w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#ff4d6a]/15 transition-all"
                >
                  <X className="w-3 h-3 text-[#a1aaed] hover:text-[#ff4d6a]" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {tasks.length === 0 && (
          <p className="text-center text-[#a1aaed]/70 text-sm py-6">No tasks planned yet</p>
        )}
      </div>

      {/* Add task input */}
      <div className="p-4 pt-2 border-t border-[#4455da]/30/50">
        <div className="flex items-center gap-2">
          <input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Plan a task for tomorrow..."
            className="flex-1 px-3 py-2.5 bg-[#152ad1]/10 border border-[#4455da]/30 rounded-xl text-white text-sm placeholder:text-[#a1aaed]/70 focus:outline-none focus:border-[#00ffb2]/30 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddTask}
            disabled={!newTaskText.trim()}
            className="w-10 h-10 bg-[#00ffb2] hover:bg-[#4dffc8] rounded-xl flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-[#00ffb2]/20"
          >
            <Plus className="w-4 h-4 text-[#0d1225]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};
