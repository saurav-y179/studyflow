import { motion } from 'framer-motion';
import { History as HistoryIcon, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const History = ({ entries }) => {
  const sortedEntries = [...entries]
    .filter((e) => e.todayTasks && e.todayTasks.some(t => t.completed))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  return (
    <div className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[var(--card-border-10)] transition-all duration-400">
      
      <div className="flex items-center gap-2 mb-6">
        <HistoryIcon className="w-5 h-5 text-[var(--text-muted)]" />
        <h2 className="text-body font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)]">
          Recent Activity Timeline
        </h2>
      </div>

      <div className="relative pl-6 space-y-6">
        {/* The continuous vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/50 to-transparent" />

        {sortedEntries.length === 0 ? (
          <p className="text-body text-[var(--text-muted2)] italic relative z-10">No completed tasks yet.</p>
        ) : (
          sortedEntries.map((entry, index) => {
            const completedTasks = entry.todayTasks.filter(t => t.completed);
            const mainTask = completedTasks[0];
            
            // Alternate colors for a bit of visual interest
            const dotColors = ['#2EE6D8', '#FFB443', '#4ADE80'];
            const dotColor = dotColors[index % dotColors.length];

            return (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative z-10 group"
              >
                {/* The Timeline Dot */}
                <div 
                  className="absolute -left-[30px] top-1.5 w-[10px] h-[10px] rounded-full ring-4 ring-[var(--ring-bg)] transition-transform group-hover:scale-125"
                  style={{ backgroundColor: dotColor }}
                />

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-caption font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {format(parseISO(entry.date), 'EEEE')}
                    </span>
                    <span className="text-caption text-[var(--text-muted2)]">
                      {format(parseISO(entry.date), 'MMM d')}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-alt-2)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-body text-[var(--text-bright)] font-medium leading-snug">
                        Completed: {mainTask.text}
                      </p>
                      {completedTasks.length > 1 && (
                        <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
                          + {completedTasks.length - 1} more tasks
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};