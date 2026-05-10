import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, eachDayOfInterval, subWeeks, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';

const INTENSITY_COLORS = [
  '#1E2530', // Level 0 - no activity
  '#164E45', // Level 1 - 1-30 min
  '#0B8A75', // Level 2 - 31-60 min
  '#1AB89B', // Level 3 - 61-120 min
  '#2EE6D8', // Level 4 - >120 min
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
      let totalMins = 0;

      if (entry) {
        const tasks = entry.todayTasks || [];
        const completed = tasks.filter((t) => t.completed).length;
        totalMins = completed * 45; // assuming 45 mins per task
        
        if (totalMins > 120) level = 4;
        else if (totalMins > 60) level = 3;
        else if (totalMins > 30) level = 2;
        else if (totalMins > 0) level = 1;
      }

      return { date, dateStr, level, totalMins, entry };
    });
  }, [entries]);

  const weeks = useMemo(() => {
    const result = [];
    let currentWeek = [];

    // Force start on a Sunday or align with the first day to create proper columns
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
      const month = format(firstDay.date, 'MMM'); // 'Jan', 'Feb', etc.
      if (month !== currentMonth) {
        result.push({ month, weekIndex });
        currentMonth = month;
      }
    });

    return result;
  }, [weeks]);

  // Calculate Top Subjects (mocked logic based on tasks if we don't have explicit subjects, or just show placeholders as requested by prompt)
  const topSubjects = useMemo(() => {
    return [
      { name: "Deep Work / Focus Session", percent: 85, color: "#2EE6D8" },
      { name: "Reading / Research", percent: 60, color: "#FFB443" },
      { name: "Planning & Strategy", percent: 35, color: "#4ADE80" },
    ];
  }, []);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleMouseEnter = (day) => (e) => {
    const rect = e.target.getBoundingClientRect();
    setTooltip({
      date: day.dateStr,
      mins: day.totalMins,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  return (
    <div className="bg-[#151A23]/70 backdrop-blur-[16px] border border-white/5 rounded-[20px] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-white/10 transition-all duration-400">
      <div className="flex items-center gap-2 mb-6">
        <Activity className="w-5 h-5 text-[#8B95A5]" />
        <h2 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#8B95A5]">
          Activity Heatmap
        </h2>
        <div className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-white/5 cursor-help" title="Shows your daily focus time over the last year.">
          <span className="text-[10px] text-[#8B95A5]">i</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Heatmap Section */}
        <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-[3px] min-w-max">
            {/* Day labels (Y-axis) */}
            <div className="flex flex-col gap-[3px] mr-2 mt-[19px]">
              {dayLabels.map((day, i) => (
                <div
                  key={day}
                  className="text-[10px] text-[#5B6574] flex items-center"
                  style={{ height: '14px', lineHeight: '14px' }}
                >
                  {i % 2 === 1 ? day : ''}
                </div>
              ))}
            </div>

            <div className="flex flex-col">
              {/* Month labels (X-axis) */}
              <div className="flex gap-[3px] mb-1.5 h-[14px] relative">
                {months.map((m, i) => {
                  const nextWeekIndex = months[i + 1]?.weekIndex || weeks.length;
                  const span = nextWeekIndex - m.weekIndex;
                  return (
                    <div
                      key={`${m.month}-${i}`}
                      className="text-[10px] text-[#8B95A5] absolute"
                      style={{ left: `${m.weekIndex * 17}px` }}
                    >
                      {span > 2 ? m.month : ''}
                    </div>
                  );
                })}
              </div>

              {/* Grid cells */}
              <div className="flex gap-[3px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[3px]">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                      const day = week.find((d) => d.date.getDay() === dayIndex);
                      if (!day) return <div key={dayIndex} className="w-[14px] h-[14px]" />;

                      return (
                        <motion.div
                          key={dayIndex}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: (weekIndex * 0.01) + (dayIndex * 0.005) }}
                          className="w-[14px] h-[14px] rounded-[3px] cursor-pointer hover:ring-1 hover:ring-white/30"
                          style={{ backgroundColor: INTENSITY_COLORS[day.level] }}
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

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-[#5B6574] mr-1">Less</span>
            {INTENSITY_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-[14px] h-[14px] rounded-[3px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span className="text-[10px] text-[#5B6574] ml-1">More</span>
          </div>
        </div>

        {/* Top Subjects Section */}
        <div className="w-full lg:w-[250px] flex-shrink-0 flex flex-col justify-center">
          <h3 className="text-[14px] font-semibold uppercase tracking-[0.05em] text-[#8B95A5] mb-4">
            Top Subjects
          </h3>
          <div className="flex flex-col gap-4">
            {topSubjects.map((sub, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#E9EDF2] whitespace-normal break-words leading-tight" title={sub.name}>
                    {sub.name}
                  </p>
                  <div className="w-full h-1.5 bg-[#1E2530] rounded-full mt-1.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sub.percent}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                  </div>
                </div>
                <div className="text-[12px] font-bold text-[#8B95A5] w-9 text-right tabular-nums">
                  {sub.percent}%
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-[#151A23]/90 backdrop-blur-md rounded-lg px-3 py-2 z-[60] pointer-events-none shadow-2xl border border-white/10"
          style={{
            left: tooltip.x,
            top: tooltip.y - 48,
            transform: 'translateX(-50%)',
          }}
        >
          <p className="text-[#E9EDF2] font-semibold text-[13px]">
            {format(parseISO(tooltip.date), 'MMM d, yyyy')}
          </p>
          <p className="text-[#8B95A5] text-[11px] mt-0.5">
            {tooltip.mins} mins focused
          </p>
        </div>
      )}
    </div>
  );
};