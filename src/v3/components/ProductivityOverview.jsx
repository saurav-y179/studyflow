import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const localDateStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ProductivityOverview = ({ entries, streak }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);

    return DAYS.map((day, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = localDateStr(date);
      const entry = entries.find((e) => e.date === dateStr);
      const tasks = entry?.todayTasks || [];
      const total = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { day, total, completed, pct, dateStr };
    });
  }, [entries]);

  const totalMinutes = useMemo(() => {
    const totalTasks = entries.reduce((sum, e) => sum + (e.todayTasks?.filter((t) => t.completed)?.length || 0), 0);
    return totalTasks * 45;
  }, [entries]);

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const maxBarValue = Math.max(...weeklyData.map((d) => d.total), 1);

  // Daily average line
  const avgCompleted = useMemo(() => {
    const daysWithData = weeklyData.filter(d => d.total > 0);
    if (daysWithData.length === 0) return 0;
    return daysWithData.reduce((sum, d) => sum + d.completed, 0) / daysWithData.length;
  }, [weeklyData]);

  const avgLineY = maxBarValue > 0 ? (1 - avgCompleted / maxBarValue) * 80 : 80;

  const lastWeekDelta = useMemo(() => {
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setHours(0, 0, 0, 0);
    startOfThisWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

    const thisWeekCompleted = entries
      .filter(e => {
        const d = new Date(`${e.date}T00:00:00`);
        return d >= startOfThisWeek && e.todayTasks?.some(t => t.completed);
      })
      .reduce((sum, e) => sum + e.todayTasks.filter(t => t.completed).length, 0);

    const lastWeekCompleted = entries
      .filter(e => {
        const d = new Date(`${e.date}T00:00:00`);
        return d >= startOfLastWeek && d < startOfThisWeek && e.todayTasks?.some(t => t.completed);
      })
      .reduce((sum, e) => sum + e.todayTasks.filter(t => t.completed).length, 0);

    if (lastWeekCompleted === 0 && thisWeekCompleted > 0) return 100;
    if (lastWeekCompleted === 0) return 0;
    return Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100);
  }, [entries]);

  // Week completion donut
  const weekCompletion = useMemo(() => {
    const total = weeklyData.reduce((s, d) => s + d.total, 0);
    const completed = weeklyData.reduce((s, d) => s + d.completed, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [weeklyData]);

  const donutRadius = 18;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference * (1 - weekCompletion / 100);

  return (
    <motion.div
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[18px] p-5 mb-3"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', borderColor: 'rgba(46,230,216,0.12)', transition: { duration: 0.2 } }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-h2 tracking-tight flex items-center gap-2" style={{ color: '#E9EDF2' }}>
          <div className="w-2 h-2 rounded-full bg-[#2EE6D8]" />
          Productivity
        </h3>
        {/* Week completion donut */}
        <div className="relative flex items-center gap-2">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r={donutRadius} fill="none" stroke="#1E2530" strokeWidth="3" />
            <motion.circle
              cx="22" cy="22" r={donutRadius} fill="none" stroke="#2EE6D8" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={donutCircumference}
              initial={{ strokeDashoffset: donutCircumference }}
              animate={{ strokeDashoffset: donutOffset }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[8px] font-bold tabular-nums" style={{ color: '#2EE6D8' }}>{weekCompletion}%</span>
          </div>
        </div>
      </div>

      {/* Total focus time */}
      <div className="mb-4">
        <p className="text-overline" style={{ color: '#8B95A5', fontSize: '0.625rem' }}>Total Focus Time</p>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter value={totalHours} className="text-3xl font-semibold tabular-nums" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }} />
          <span className="text-3xl font-semibold" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>h</span>
          <AnimatedCounter value={totalMins} className="text-3xl font-semibold tabular-nums" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }} />
          <span className="text-3xl font-semibold" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>m</span>
        </div>
        {streak.current > 0 && (
          <span className="text-caption" style={{ color: lastWeekDelta >= 0 ? '#4ADE80' : '#F87171' }}>
            {lastWeekDelta >= 0 ? '+' : ''}{lastWeekDelta}% vs last week
          </span>
        )}
      </div>

      {/* Bar chart with hover tooltips */}
      <div className="flex items-end gap-2 h-[100px] mb-3 relative">
        {/* Daily average line */}
        {avgCompleted > 0 && (
          <div
            className="absolute left-0 right-0 border-t border-dashed pointer-events-none z-10"
            style={{
              top: `${avgLineY}px`,
              borderColor: 'rgba(255,180,67,0.3)',
            }}
          >
            <span className="absolute -top-3 right-0 text-[8px] font-medium" style={{ color: '#FFB443' }}>avg</span>
          </div>
        )}

        {weeklyData.map((d, i) => {
          const height = d.total > 0 ? Math.max((d.completed / maxBarValue) * 100, 8) : 5;
          const emptyHeight = d.total > 0 ? Math.max(((d.total - d.completed) / maxBarValue) * 100, 0) : 0;
          const isHovered = hoveredBar === i;
          const isToday = d.dateStr === localDateStr(new Date());

          return (
            <div
              key={d.day}
              className="flex-1 flex flex-col items-center gap-1 relative"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {/* Tooltip */}
              <AnimatePresence>
                {isHovered && d.total > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg z-20 whitespace-nowrap"
                    style={{ background: 'var(--card-bg-95)', border: '1px solid var(--card-border-10)' }}
                  >
                    <span className="text-micro font-semibold tabular-nums" style={{ color: '#E9EDF2' }}>
                      {d.completed}/{d.total}
                    </span>
                    <span className="text-micro ml-1" style={{ color: '#5B6574' }}>
                      ({d.pct}%)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full flex flex-col justify-end h-[80px] relative cursor-pointer">
                {emptyHeight > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${emptyHeight}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t bg-[#1E2530]"
                  />
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="w-full rounded-t-sm transition-all duration-200"
                  style={{
                    background: d.completed > 0
                      ? isHovered ? '#5FFBEF' : '#2EE6D8'
                      : '#0B0E14',
                    boxShadow: isHovered && d.completed > 0 ? '0 0 12px rgba(46,230,216,0.3)' : 'none',
                  }}
                />
              </div>
              <span className={`text-micro font-medium ${isToday ? 'text-[#2EE6D8]' : 'text-[#5B6574]'}`}>
                {d.day}
              </span>
              {isToday && <div className="w-1 h-1 rounded-full bg-[#2EE6D8] -mt-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-micro text-[#5B6574]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[#2EE6D8]" />
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-sm bg-[#1E2530]" />
          Remaining
        </div>
        {avgCompleted > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0 border-t border-dashed" style={{ borderColor: '#FFB443' }} />
            <span>Daily avg</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
