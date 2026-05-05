import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, CheckCircle, Circle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const History = ({ entries }) => {
  const [expandedId, setExpandedId] = useState(null);

  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">History</h3>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <p className="text-text-tertiary text-center py-8">No entries yet</p>
        ) : (
          sortedEntries.map((entry) => (
            <motion.div
              key={entry.date}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpandedId(expandedId === entry.date ? null : entry.date)}
                className="w-full flex items-center justify-between p-4 hover:bg-surface-elevated transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-text-tertiary" />
                  <span className="text-text-primary font-medium">
                    {format(parseISO(entry.date), 'EEEE, MMM d')}
                  </span>
                  {entry.completedTasks && entry.completedTasks.length > 0 && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                      {entry.completedTasks.length} completed
                    </span>
                  )}
                </div>
                {expandedId === entry.date ? (
                  <ChevronUp className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              
              <AnimatePresence>
                {expandedId === entry.date && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-4">
                      <div>
                        <h4 className="text-text-secondary text-sm mb-2">Completed:</h4>
                        <p className="text-text-primary">
                          {entry.completed || 'No details provided'}
                        </p>
                      </div>
                      
                      {entry.planned && (
                        <div>
                          <h4 className="text-text-secondary text-sm mb-2">Planned:</h4>
                          <p className="text-text-primary">
                            {entry.planned}
                          </p>
                        </div>
                      )}
                      
                      {entry.completedTasks && entry.completedTasks.length > 0 && (
                        <div>
                          <h4 className="text-text-secondary text-sm mb-2">Tasks Completed:</h4>
                          <div className="space-y-1">
                            {entry.completedTasks.map((task, i) => (
                              <div key={i} className="flex items-center gap-2 text-text-primary">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                <span>{task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};