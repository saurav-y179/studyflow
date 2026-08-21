import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { Clock, CheckCircle2, BookOpen, Coffee } from 'lucide-react';
import { getCompletionPercentage } from '../../utils/storage';

const ACTIVITY_ICONS = {
  completed: { icon: CheckCircle2, color: '#2EE6D8' },
  study: { icon: BookOpen, color: '#FFB443' },
  focus: { icon: Coffee, color: '#4ADE80' },
  break: { icon: Clock, color: '#8B95A5' },
};

export const HistoryPanel = ({ entries }) => {
  const [showAll, setShowAll] = useState(false);
  const displayCount = showAll ? entries.length : 6;

  const sortedEntries = useMemo(() => {
    return [...entries]
      .filter((e) => e.todayTasks && e.todayTasks.length > 0)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, displayCount);
  }, [entries, displayCount]);

  const hasMore = useMemo(() => {
    return entries.filter((e) => e.todayTasks && e.todayTasks.length > 0).length > 6;
  }, [entries]);

  const getActivityType = (entry) => {
    const pct = getCompletionPercentage(entry);
    const tasks = entry.todayTasks || [];
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;

    if (pct >= 80) return { label: `${completed}/${total} tasks done`, type: 'completed', color: ACTIVITY_ICONS.completed.color, Icon: ACTIVITY_ICONS.completed.icon };
    if (pct >= 50) return { label: `${completed}/${total} completed`, type: 'focus', color: ACTIVITY_ICONS.focus.color, Icon: ACTIVITY_ICONS.focus.icon };
    return { label: `${completed}/${total} tasks`, type: 'study', color: ACTIVITY_ICONS.study.color, Icon: ACTIVITY_ICONS.study.icon };
  };

  const getDateLabel = (dateStr) => {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  };

  // Group entries by date proximity for visual grouping
  const groupedEntries = useMemo(
    () =>
      sortedEntries.map((entry, i) => {
        const dateLabel = getDateLabel(entry.date);
        const prevLabel = i > 0 ? getDateLabel(sortedEntries[i - 1].date) : null;
        return { ...entry, dateLabel, showDateGroup: dateLabel !== prevLabel };
      }),
    [sortedEntries]
  );

  return (
    <motion.div
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[18px] p-5"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', borderColor: 'rgba(255,180,67,0.12)', transition: { duration: 0.2 } }}
    >

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h2 tracking-tight flex items-center gap-2" style={{ color: '#E9EDF2' }}>
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-[#FFB443]" />
              <div className="absolute -inset-1 rounded-full" style={{ background: 'rgba(255,180,67,0.2)', filter: 'blur(4px)' }} />
            </div>
            History
          </h3>
          <div className="flex items-center gap-2">
            {sortedEntries.length > 0 && (
              <span className="text-micro font-medium tabular-nums" style={{ color: '#5B6574' }}>
                {entries.filter(e => e.todayTasks?.length > 0).length} total
              </span>
            )}
            {hasMore && (
              <button onClick={() => setShowAll(!showAll)} className="text-micro font-medium transition-colors hover:text-[#E9EDF2]" style={{ color: showAll ? '#2EE6D8' : '#8B95A5' }}>
                {showAll ? 'Less' : 'All'}
              </button>
            )}
          </div>
        </div>

        {/* Timeline history list */}
        <div className="relative">
          {/* Timeline line */}
          {sortedEntries.length > 1 && (
            <div className="absolute left-[13px] top-4 bottom-4 w-px" style={{ background: 'rgba(255,180,67,0.1)' }} />
          )}

          <div className="space-y-0.5">
            <AnimatePresence mode="popLayout">
              {groupedEntries.map((entry, i) => {
                const activity = getActivityType(entry);
                const pct = getCompletionPercentage(entry);
                const Icon = activity.Icon;

                return (
                  <div key={entry.date}>
                    {/* Date group header */}
                    {entry.showDateGroup && (
                      <div className="flex items-center gap-2 py-1.5 pl-8">
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#5B6574' }}>
                          {entry.dateLabel}
                        </span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                      </div>
                    )}

                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="group flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all duration-200 hover:bg-[#1E2530] relative"
                    >
                      {/* Timeline node */}
                      <div
                        className="w-[22px] h-[22px] rounded-lg flex items-center justify-center flex-shrink-0 relative z-10 transition-all"
                        style={{ background: `${activity.color}15`, border: `1px solid ${activity.color}25` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: activity.color }} />
                      </div>

                      {/* Activity info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-body text-[#E9EDF2] truncate leading-tight font-medium">{activity.label}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Mini progress bar */}
                          <div className="w-12 h-1 rounded-full bg-[#1E2530] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, delay: i * 0.03 }}
                              className="h-full rounded-full"
                              style={{ background: activity.color }}
                            />
                          </div>
                          <span className="text-[9px] tabular-nums font-medium" style={{ color: activity.color }}>{pct}%</span>
                        </div>
                      </div>

                      {/* Completion ring */}
                      <div className="relative w-7 h-7 flex-shrink-0">
                        <svg className="w-7 h-7 -rotate-90" viewBox="0 0 28 28">
                          <circle cx="14" cy="14" r="11" fill="none" stroke="#1E2530" strokeWidth="2.5" />
                          <motion.circle
                            cx="14" cy="14" r="11" fill="none" stroke={activity.color} strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 11}`}
                            initial={{ strokeDashoffset: 2 * Math.PI * 11 }}
                            animate={{ strokeDashoffset: 2 * Math.PI * 11 * (1 - pct / 100) }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </AnimatePresence>

            {sortedEntries.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,180,67,0.06)' }}>
                  <Clock className="w-6 h-6" style={{ color: 'rgba(255,180,67,0.3)' }} />
                </div>
                <p className="text-sm font-medium text-[#E9EDF2]/60">No history yet</p>
                <p className="text-[11px] mt-1" style={{ color: '#5B6574' }}>Complete some tasks to see your activity</p>
              </motion.div>
            )}
        </div>
      </div>
    </motion.div>
  );
};
