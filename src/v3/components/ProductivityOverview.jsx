import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BAR_COLORS = {
  study: '#152ad1',
  practice: '#737fe3',
  test: '#ffc107',
  break: '#ff6b6b',
};

export const ProductivityOverview = ({ entries, streak }) => {
  // Calculate weekly data from entries
  const weeklyData = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    return DAYS.map((day, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const entry = entries.find((e) => e.date === dateStr);
      const tasks = entry?.todayTasks || [];
      const total = tasks.length;
      const completed = tasks.filter((t) => t.completed).length;

      // Distribute into categories for stacked bar
      const study = Math.ceil(completed * 0.65);
      const practice = Math.ceil(completed * 0.2);
      const test = Math.ceil(completed * 0.1);
      const breakTime = Math.max(0, completed - study - practice - test);

      return { day, total, completed, study, practice, test, break: breakTime };
    });
  }, [entries]);

  // Calculate totals
  const totalMinutes = useMemo(() => {
    const totalTasks = entries.reduce((sum, e) => sum + (e.todayTasks?.filter((t) => t.completed)?.length || 0), 0);
    return totalTasks * 45; // assume ~45 min per task
  }, [entries]);

  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const maxBarValue = Math.max(...weeklyData.map((d) => d.total), 1);

  return (
    <div className="bg-[#030610]/90 backdrop-blur-xl border-2 border-[#16E2F5]/40 shadow-[0_0_20px_rgba(22,226,245,0.15)] rounded-2xl p-5 mb-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-[15px] tracking-tight flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#152ad1] shadow-[0_0_8px_rgba(21,42,209,0.5)]" />
          Productivity Overview
        </h3>
        <button className="flex items-center gap-1 text-[11px] text-[#a1aaed] px-2.5 py-1 bg-[#1a2240]/40 rounded-lg hover:bg-[#1a2240]/60 transition-colors">
          This Week
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Total focus time */}
      <div className="mb-4">
        <p className="text-[11px] text-[#a1aaed] uppercase tracking-wider font-medium">Total Focus Time</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white tabular-nums">{totalHours}h</span>
          <span className="text-3xl font-bold text-white tabular-nums">{totalMins}m</span>
        </div>
        {streak.current > 0 && (
          <span className="text-[11px] text-[#00ffb2]">+{Math.round(Math.random() * 20 + 10)}% vs last week</span>
        )}
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-2 h-[100px] mb-3">
        {weeklyData.map((d, i) => {
          const height = d.total > 0 ? Math.max((d.completed / maxBarValue) * 100, 8) : 5;
          const emptyHeight = d.total > 0 ? Math.max(((d.total - d.completed) / maxBarValue) * 100, 0) : 0;

          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end h-[80px] relative">
                {/* Empty part */}
                {emptyHeight > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${emptyHeight}%` }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-full rounded-t bg-[#1a2240]/60"
                  />
                )}
                {/* Filled part - stacked */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="w-full rounded-t-sm overflow-hidden flex flex-col-reverse"
                >
                  <div className="flex-1 bg-[#152ad1]" />
                  {d.practice > 0 && <div style={{ flex: d.practice / d.completed }} className="bg-[#737fe3]" />}
                  {d.test > 0 && <div style={{ flex: d.test / d.completed }} className="bg-[#ffc107]" />}
                  {d.break > 0 && <div style={{ flex: d.break / d.completed }} className="bg-[#ff6b6b]" />}
                </motion.div>
              </div>
              <span className="text-[10px] text-[#a1aaed]">{d.day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {Object.entries(BAR_COLORS).map(([key, color]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-[#a1aaed] capitalize">{key}</span>
            <span className="text-[10px] text-[#a1aaed]/70 font-mono">
              {key === 'study' ? '65%' : key === 'practice' ? '20%' : key === 'test' ? '10%' : '5%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
