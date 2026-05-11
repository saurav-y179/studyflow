import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subMonths, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';

const INTENSITY_COLORS = [
  'rgba(26,34,64,0.5)',   // Level 0 - no activity
  '#1a2845',              // Level 1 - very low
  '#1a4a60',              // Level 2 - low  
  '#00a0d4',              // Level 3 - moderate
  '#737fe3',              // Level 4 - high
  '#00ffb2',              // Level 5 - very high
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

  // Calculate top subjects from tasks
  const topSubjects = useMemo(() => {
    const subjects = {};
    entries.forEach((entry) => {
      const tasks = entry.todayTasks || [];
      tasks.forEach((task) => {
        // Extract subject from task text (first word or dash-separated)
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
    const colors = ['#152ad1', '#737fe3', '#00ffb2', '#ff6b6b'];

    return sorted.map(([name, count], i) => ({
      name,
      percent: Math.round((count / total) * 100),
      color: colors[i] || '#6b7da0',
    }));
  }, [entries]);

  return (
    <div className="bg-[#030610]/90 backdrop-blur-xl border-2 border-[#16E2F5]/40 shadow-[0_0_20px_rgba(22,226,245,0.15)] rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-[15px] tracking-tight flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#737fe3] shadow-[0_0_8px_rgba(115,127,227,0.5)]" />
          Activity Heatmap
        </h3>
        <button className="flex items-center gap-1 text-[11px] text-[#a1aaed] px-2.5 py-1 bg-[#1a2240]/40 rounded-lg hover:bg-[#1a2240]/60 transition-colors">
          {timeRange}
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-[1fr_auto] gap-8">
        {/* Heatmap grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[2px] min-w-max">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1.5">
              {dayLabels.map((day, i) => (
                <div
                  key={`label-${i}`}
                  className="text-[9px] text-[#a1aaed]/70 flex items-center"
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
                      className="text-[9px] text-[#a1aaed]/70"
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
                          className="w-[11px] h-[11px] rounded-[2px] cursor-pointer"
                          style={{ backgroundColor: INTENSITY_COLORS[day.level] }}
                          whileHover={{ scale: 1.5 }}
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
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[9px] text-[#a1aaed]/70 mr-0.5">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-[11px] h-[11px] rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[9px] text-[#a1aaed]/70 ml-0.5">More</span>
          </div>
        </div>

        {/* Top Subjects */}
        <div className="w-[180px] flex-shrink-0">
          <p className="text-[11px] text-[#a1aaed] font-bold uppercase tracking-wider mb-3">Top Subjects</p>
          <div className="space-y-2.5">
            {topSubjects.length === 0 ? (
              <p className="text-[#a1aaed]/70 text-xs">No data yet</p>
            ) : (
              topSubjects.map((subject) => (
                <div key={subject.name} className="flex items-center gap-2">
                  <span className="text-xs text-[#8ba0c8] flex-1 truncate">{subject.name}</span>
                  <div className="w-[60px] h-1.5 bg-[#1a2240] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${subject.percent}%` }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                  <span className="text-[10px] text-[#a1aaed] tabular-nums w-[30px] text-right">{subject.percent}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-[#152ad1]/20 backdrop-blur-xl rounded-lg px-3 py-2 z-[60] pointer-events-none shadow-xl shadow-black/40 border border-[#4455da]/30"
          style={{
            left: tooltip.x,
            top: tooltip.y - 48,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-white font-medium text-xs">
            {format(parseISO(tooltip.date), 'MMM d, yyyy')}
          </p>
          <p className="text-[#a1aaed] text-[10px] mt-0.5">
            {tooltip.level >= 4
              ? '✓ Complete'
              : tooltip.level >= 2
              ? '◐ Partial'
              : '○ No activity'}
          </p>
        </div>
      )}
    </div>
  );
};
