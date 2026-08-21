import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subMonths, parseISO } from 'date-fns';


const INTENSITY_COLORS = [
  '#1E2530',   // Level 0 - no activity
  '#2a3345',   // Level 1 - very low
  '#3b4559',   // Level 2 - low  
  '#2EE6D8',   // Level 3 - moderate
  '#5FFBEF',   // Level 4 - high
  '#A8FEF5',   // Level 5 - very high
];

export const ActivityHeatmap = ({ entries }) => {
  const [tooltip, setTooltip] = useState(null);
  const [timeRange] = useState('1 Year');

  const gridData = useMemo(() => {
    const today = new Date();
    const monthsToSubtract = timeRange === '1 Year' ? 12 : 6;
    const startDate = subMonths(today, monthsToSubtract);
    const days = eachDayOfInterval({ start: startDate, end: today });

    const entryMap = {};
    entries.forEach((entry) => {
      entryMap[entry.date] = entry;
    });

    return days.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = entryMap[dateStr];
      let level = 0;

      if (entry) {
        const tasks = entry.todayTasks || [];
        if (tasks.length > 0) {
          const ratio = tasks.filter((t) => t.completed).length / tasks.length;
          if (ratio >= 1) level = 5;
          else if (ratio >= 0.8) level = 4;
          else if (ratio >= 0.6) level = 3;
          else if (ratio >= 0.4) level = 2;
          else level = 1;
        }
      }

      return { date, dateStr, level, entry };
    });
  }, [entries, timeRange]);

  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = [];

    gridData.forEach((day, index) => {
      currentWeek.push(day);
      if (day.date.getDay() === 6 || index === gridData.length - 1) {
        if (currentWeek.length > 0) {
          result.push(currentWeek);
        }
        currentWeek = [];
      }
    });

    return result;
  }, [gridData]);

  const months = useMemo(() => {
    const result = [];
    let currentMonth = '';

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const month = format(firstDay.date, 'MMM');
      if (month !== currentMonth) {
        result.push({ month, weekIndex });
        currentMonth = month;
      }
    });

    return result;
  }, [weeks]);

  const dayLabels = ['Mon', '', 'Wed', '', 'Fri', '', ''];

  const topSubjects = useMemo(() => {
    const subjects = {};
    entries.forEach((entry) => {
      const tasks = entry.todayTasks || [];
      tasks.forEach((task) => {
        const parts = task.text.split(/[–\-:]/);
        const subject = parts[0]?.trim() || 'General';
        if (!subjects[subject]) subjects[subject] = 0;
        subjects[subject]++;
      });
    });

    const sorted = Object.entries(subjects)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const total = sorted.reduce((sum, [, count]) => sum + count, 0) || 1;
    const colors = ['#2EE6D8', '#FFB443', '#4ADE80', '#F87171'];

    return sorted.map(([name, count], i) => ({
      name,
      percent: Math.round((count / total) * 100),
      color: colors[i] || '#8B95A5',
    }));
  }, [entries]);

  return (
    <motion.div
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[18px] p-5"
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', borderColor: 'rgba(46,230,216,0.12)', transition: { duration: 0.2 } }}
    >

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-h2 tracking-tight flex items-center gap-2" style={{ color: '#E9EDF2' }}>
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-[#2EE6D8]" />
              <div className="absolute -inset-1 rounded-full" style={{ background: 'rgba(46,230,216,0.2)', filter: 'blur(4px)' }} />
            </div>
            Activity Heatmap
          </h3>
          {/* Contribution count */}
          <span className="text-caption font-medium tabular-nums" style={{ color: '#8B95A5' }}>
            {entries.filter(e => e.todayTasks?.length > 0).length} contributions this year
          </span>
        </div>

        {entries.length > 0 && (() => {
          // Calculate streak for milestone display
          const completeDates = new Set();
          entries.forEach(e => {
            const tasks = e.todayTasks || [];
            if (tasks.length > 0 && tasks.filter(t => t.completed).length / tasks.length >= 0.8) {
              completeDates.add(e.date);
            }
          });
          const sorted = [...completeDates].sort();
          let currentStreak = 0;
          if (sorted.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            let cursor = today;
            if (!completeDates.has(cursor)) {
              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - 1);
              cursor = yesterday.toISOString().slice(0, 10);
            }
            while (completeDates.has(cursor)) {
              currentStreak++;
              const d = new Date(`${cursor}T00:00:00`);
              d.setDate(d.getDate() - 1);
              cursor = d.toISOString().slice(0, 10);
            }
          }
          const milestone = [30, 21, 14, 7].find(m => currentStreak >= m);
          if (!milestone) return null;
          const MILESTONES = {
            7: { emoji: '🔥', text: '1 Week Streak!', color: '#FFB443' },
            14: { emoji: '⚡', text: '2 Week Streak!', color: '#A78BFA' },
            21: { emoji: '🚀', text: '3 Week Streak!', color: '#60A5FA' },
            30: { emoji: '👑', text: 'Monthly Streak!', color: '#4ADE80' },
          };
          const m = MILESTONES[milestone];
          return (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 px-3 py-2 rounded-xl flex items-center gap-2"
              style={{ background: `${m.color}10`, border: `1px solid ${m.color}20` }}
            >
              <span className="text-base animate-fire">{m.emoji}</span>
              <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.text}</span>
              <span className="text-micro ml-auto tabular-nums" style={{ color: `${m.color}80` }}>{currentStreak} days</span>
            </motion.div>
          );
        })()}

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-8">
        {/* Heatmap grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[2px] min-w-max">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1.5">
              {dayLabels.map((day, i) => (
                <div
                  key={`label-${i}`}
                  className="text-[9px] text-[#5B6574] flex items-center"
                  style={{ height: '11px', lineHeight: '11px' }}
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              {/* Month labels */}
              <div className="flex gap-[2px] mb-1 h-3">
                {months.map((m, i) => {
                  const nextWeekIndex = months[i + 1]?.weekIndex || weeks.length;
                  const span = nextWeekIndex - m.weekIndex;
                  return (
                    <div
                      key={`${m.month}-${i}`}
                      className="text-[9px] text-[#5B6574]"
                      style={{ width: `${span * 13}px` }}
                    >
                      {m.month}
                    </div>
                  );
                })}
              </div>

              {/* Grid cells */}
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {[1, 2, 3, 4, 5, 6, 0].map((dayIndex) => {
                      const day = week.find((d) => d.date.getDay() === dayIndex);
                      if (!day) return <div key={dayIndex} className="w-[11px] h-[11px]" />;

                      return (
                        <motion.div
                          key={dayIndex}
                          className="w-[11px] h-[11px] rounded-[2px] cursor-pointer relative"
                          style={{ backgroundColor: INTENSITY_COLORS[day.level] }}
                          whileHover={{ scale: 1.6 }}
                          onMouseEnter={(e) => {
                            const rect = e.target.getBoundingClientRect();
                            setTooltip({
                              date: day.dateStr,
                              level: day.level,
                              x: rect.left + rect.width / 2,
                              y: rect.top,
                            });
                          }}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          {day.level >= 3 && (
                            <div
                              className="absolute inset-0 rounded-[2px] opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{
                                background: `radial-gradient(circle at center, ${INTENSITY_COLORS[day.level]}66, transparent)`,
                                filter: 'blur(3px)',
                              }}
                            />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[9px] text-[#5B6574] mr-0.5">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[9px] text-[#5B6574] ml-0.5">More</span>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="w-[180px] flex-shrink-0">
          <p className="text-overline mb-3" style={{ color: '#8B95A5', fontSize: '0.625rem' }}>Top Subjects</p>
          <div className="space-y-2.5">
            {topSubjects.length === 0 ? (
              <p className="text-[#5B6574] text-xs">No data yet</p>
            ) : (
              topSubjects.map((subject) => (
                <div key={subject.name} className="flex items-center gap-2">
                  <span className="text-xs text-[#5B6574] flex-1 truncate">{subject.name}</span>
                  <div className="w-[60px] h-1.5 bg-[#1E2530] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                  <span className="text-micro text-[#5B6574] tabular-nums w-[30px] text-right">{subject.percent}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed z-[60] pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 52,
            transform: 'translateX(-50%)',
          }}
        >
          <div className="relative rounded-xl px-3.5 py-2.5 shadow-2xl" style={{ background: '#1E2530', border: '1px solid rgba(46,230,216,0.15)' }}>
            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ background: '#1E2530', borderRight: '1px solid rgba(46,230,216,0.15)', borderBottom: '1px solid rgba(46,230,216,0.15)' }} />
            <p className="text-[#E9EDF2] font-semibold text-xs">{format(parseISO(tooltip.date), 'MMM d, yyyy')}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 rounded-[2px]" style={{ background: INTENSITY_COLORS[tooltip.level] }} />
              <span className="text-micro font-medium" style={{ color: tooltip.level >= 3 ? '#2EE6D8' : '#5B6574' }}>
                {tooltip.level >= 4 ? 'Fully complete' : tooltip.level >= 2 ? 'Partially done' : 'No activity'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
