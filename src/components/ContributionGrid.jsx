import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';

const INTENSITY_COLORS = [
  'rgba(0,153,212,0.06)',  // Level 0 - no activity
  '#0A2540',               // Level 1 - partial (deep navy)
  '#005F8A',               // Level 2 - moderate (steel blue)
  '#0099D4',               // Level 3 - complete (Porsche blue)
  '#AAFF00',               // Level 4 - exceeded (punchy lime)
];

export const ContributionGrid = ({ entries }) => {
  const [tooltip, setTooltip] = useState(null);

  const gridData = useMemo(() => {
    const today = new Date();
    const startDate = subWeeks(today, 52);
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
          if (ratio >= 1) level = 4;
          else if (ratio >= 0.8) level = 3;
          else if (ratio >= 0.5) level = 2;
          else level = 1;
        }
      }

      return { date, dateStr, level, entry };
    });
  }, [entries]);

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

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseEnter = (day) => (e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      date: day.dateStr,
      level: day.level,
      entry: day.entry,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <h3 className="text-lg font-bold text-text-primary mb-5 tracking-tight">Activity</h3>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-[3px] min-w-max">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-2">
            {dayLabels.map((day, i) => (
              <div
                key={day}
                className="text-[10px] text-text-tertiary/60 flex items-center"
                style={{ height: '13px', lineHeight: '13px' }}
              >
                {i % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex gap-[3px] mb-1.5 h-4">
              {months.map((m, i) => {
                const nextWeekIndex = months[i + 1]?.weekIndex || weeks.length;
                const span = nextWeekIndex - m.weekIndex;
                return (
                  <div
                    key={`${m.month}-${i}`}
                    className="text-[10px] text-text-tertiary/60"
                    style={{ width: `${span * 16}px` }}
                  >
                    {m.month}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-[3px]">
                  {dayLabels.map((_, dayIndex) => {
                    const day = week.find((d) => d.date.getDay() === dayIndex);
                    if (!day) return <div key={dayIndex} className="w-[13px] h-[13px]" />;

                    return (
                      <motion.div
                        key={dayIndex}
                        className="w-[13px] h-[13px] rounded-[3px] cursor-pointer"
                        style={{ backgroundColor: INTENSITY_COLORS[day.level] }}
                        whileHover={{ scale: 1.4 }}
                        onMouseEnter={handleMouseEnter(day)}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4">
        <span className="text-[10px] text-text-tertiary/60 mr-1">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-[13px] h-[13px] rounded-[3px]"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-[10px] text-text-tertiary/60 ml-1">More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed glass-strong rounded-lg px-3 py-2 z-[60] pointer-events-none shadow-xl shadow-black/30"
          style={{
            left: tooltip.x,
            top: tooltip.y - 52,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-text-primary font-medium text-xs">
            {format(parseISO(tooltip.date), 'MMM d, yyyy')}
          </p>
          <p className="text-text-tertiary text-[10px] mt-0.5">
            {tooltip.level >= 3
              ? '✓ Complete'
              : tooltip.level >= 1
              ? '◐ Partial'
              : '○ No activity'}
          </p>
        </div>
      )}
    </div>
  );
};