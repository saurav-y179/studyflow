import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { getCompletionPercentage } from '../../utils/storage';

const ACTIVITY_COLORS = {
  completed: '#737fe3',
  study: '#152ad1',
  focus: '#ffc107',
  break: '#00ffb2',
};

export const HistoryPanel = ({ entries }) => {
  const sortedEntries = [...entries]
    .filter((e) => e.todayTasks && e.todayTasks.length > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const getActivityType = (entry) => {
    const pct = getCompletionPercentage(entry);
    const tasks = entry.todayTasks || [];

    if (pct >= 80) return { label: `Completed: ${tasks[0]?.text || 'Tasks'}`, color: ACTIVITY_COLORS.completed, time: '' };
    if (pct >= 50) return { label: `Focus Session`, color: ACTIVITY_COLORS.focus, time: '' };
    return { label: `Study: ${tasks[0]?.text || 'Session'}`, color: ACTIVITY_COLORS.study, time: '' };
  };

  return (
    <div className="bg-[#030610]/90 backdrop-blur-xl border-2 border-[#00FF00]/40 shadow-[0_0_20px_rgba(0,255,0,0.15)] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-[15px] tracking-tight flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#ffc107] shadow-[0_0_8px_rgba(255,193,7,0.5)]" />
          History
        </h3>
        <button className="text-[11px] text-[#a1aaed] hover:text-white transition-colors">View all</button>
      </div>

      <p className="text-[11px] text-[#a1aaed] uppercase tracking-wider font-medium mb-3">Recent Activities</p>

      {/* Activity list */}
      <div className="space-y-3">
        {sortedEntries.length === 0 ? (
          <p className="text-[#a1aaed]/70 text-sm text-center py-4">No entries yet</p>
        ) : (
          sortedEntries.map((entry) => {
            const activity = getActivityType(entry);
            const tasks = entry.todayTasks || [];
            const completed = tasks.filter((t) => t.completed).length;
            const totalMinutes = completed * 45;
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            return (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3"
              >
                {/* Color dot */}
                <div className="mt-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activity.color }} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.label}</p>
                  <p className="text-[10px] text-[#a1aaed]">
                    {format(parseISO(entry.date), 'EEEE')} · {completed}/{tasks.length} tasks
                  </p>
                </div>

                {/* Duration */}
                <span className="text-[11px] text-[#a1aaed] tabular-nums flex-shrink-0">{timeStr}</span>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
