import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';

const INTENSITY_COLORS = [
  '#1A1A1A', // Level 0 - no activity
  '#064E3B', // Level 1 - partial
  '#059669', // Level 2 - moderate
  '#10B981', // Level 3 - complete
  '#34D399', // Level 4 - exceeded
];

export const ContributionGrid = ({ entries }) => {
  const [tooltip, setTooltip] = useState(null);

  const gridData = useMemo(() => {
    const today = new Date();
    const startDate = subWeeks(today, 52);
    const days = eachDayOfInterval({ start: startDate, end: today });
    
    const entryMap = {};
    entries.forEach(entry => {
      entryMap[entry.date] = entry;
    });

    return days.map(date => {
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
      
      return {
        date,
        dateStr,
        level,
        entry,
      };
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
      y: rect.top - 10,
    });
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Activity</h3>
      
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          <div className="flex flex-col gap-1 mr-2">
            {dayLabels.map((day, i) => (
              <div
                key={day}
                className="h-3 text-xs text-text-tertiary flex items-center"
                style={{ height: '14px', lineHeight: '14px' }}
              >
                {i % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>
          
          <div className="flex flex-col">
            <div className="flex gap-1 mb-1">
              {months.map((m, i) => (
                <div
                  key={i}
                  className="text-xs text-text-tertiary"
                  style={{ width: `${m.weekIndex === 0 ? 14 : (months[i + 1]?.weekIndex || weeks.length) - m.weekIndex} * 14px` }}
                >
                  {m.month}
                </div>
              ))}
            </div>
            
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {dayLabels.map((_, dayIndex) => {
                    const day = week.find(d => d.date.getDay() === dayIndex);
                    if (!day) return <div key={dayIndex} className="w-3 h-3" />;
                    
                    return (
                      <motion.div
                        key={dayIndex}
                        className="w-3 h-3 rounded-sm cursor-pointer"
                        style={{ backgroundColor: INTENSITY_COLORS[day.level] }}
                        whileHover={{ scale: 1.2 }}
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

      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-text-tertiary">Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="text-xs text-text-tertiary">More</span>
      </div>

      {tooltip && (
        <div
          className="fixed bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 50,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-text-primary font-medium">
            {format(parseISO(tooltip.date), 'MMM d, yyyy')}
          </p>
          {tooltip.entry ? (
            <p className="text-text-secondary text-xs">
              {tooltip.level >= 3 ? '✓ Complete' : tooltip.level >= 1 ? '□ Partial' : '○ No activity'}
            </p>
          ) : (
            <p className="text-text-tertiary text-xs">No activity</p>
          )}
        </div>
      )}
    </div>
  );
};