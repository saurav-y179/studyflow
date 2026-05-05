import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar, CheckCircle, Circle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getCompletionPercentage } from '../utils/storage';

export const History = ({ entries }) => {
  const [expandedId, setExpandedId] = useState(null);

  const sortedEntries = [...entries]
    .filter((e) => e.todayTasks && e.todayTasks.length > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      <h3 className="text-lg font-bold text-text-primary mb-4 tracking-tight">History</h3>

      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
        {sortedEntries.length === 0 ? (
          <p className="text-text-tertiary/50 text-center py-8 text-sm">No entries yet</p>
        ) : (
          sortedEntries.map((entry) => {
            const pct = getCompletionPercentage(entry);
            const tasks = entry.todayTasks || [];
            const done = tasks.filter((t) => t.completed).length;
            const isExpanded = expandedId === entry.date;

            return (
              <motion.div
                key={entry.date}
                layout
                className="border border-glass-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : entry.date)}
                  className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-text-tertiary" />
                    <span className="text-text-primary font-medium text-sm">
                      {format(parseISO(entry.date), 'EEE, MMM d')}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${
                      pct >= 80
                        ? 'bg-primary/15 text-primary'
                        : pct >= 50
                        ? 'bg-warning/15 text-warning'
                        : 'bg-error/15 text-error'
                    }`}>
                      {done}/{tasks.length}
                    </span>
                  </div>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-text-tertiary" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-glass-border"
                    >
                      <div className="p-4 space-y-1.5">
                        {tasks.map((task) => (
                          <div key={task.id} className="flex items-center gap-2.5">
                            {task.completed ? (
                              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-text-tertiary/40 flex-shrink-0" />
                            )}
                            <span className={`text-sm ${
                              task.completed
                                ? 'text-text-secondary line-through'
                                : 'text-text-primary'
                            }`}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};