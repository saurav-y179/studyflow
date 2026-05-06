import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export const ContributionGridV2 = ({ entries }) => {
  const today = new Date();
  const daysToRender = 105; // 15 weeks * 7 days
  const startDate = subDays(today, daysToRender - 1);
  const dateRange = eachDayOfInterval({ start: startDate, end: today });

  const getActivityLevel = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === dateStr);
    if (!entry || !entry.todayTasks || entry.todayTasks.length === 0) return 0;
    const completed = entry.todayTasks.filter(t => t.completed).length;
    const total = entry.todayTasks.length;
    const ratio = completed / total;
    if (ratio === 0) return 0;
    if (ratio <= 0.4) return 1;
    if (ratio <= 0.7) return 2;
    return 3;
  };

  const getIntensityColor = (level) => {
    switch (level) {
      case 1: return 'bg-[#10b981]/20 border border-[#10b981]/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      case 2: return 'bg-[#10b981]/50 border border-[#10b981]/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
      case 3: return 'bg-[#10b981] border border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.5)]';
      default: return 'bg-white/[0.02] border border-white/[0.05]';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Activity Matrix</h2>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase text-white/30 tracking-widest">Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(level => (
              <div key={level} className={`w-3 h-3 rounded-[3px] ${getIntensityColor(level)}`} />
            ))}
          </div>
          <span className="text-[10px] uppercase text-white/30 tracking-widest">More</span>
        </div>
      </div>

      <div className="relative overflow-hidden w-full">
        {/* Glow behind grid */}
        <div className="absolute inset-0 bg-[#10b981]/5 blur-3xl rounded-full mix-blend-screen pointer-events-none" />
        
        <div className="grid grid-flow-col gap-1.5 overflow-x-auto pb-4 scrollbar-hide relative z-10" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr))' }}>
          {dateRange.map((date, i) => {
            const level = getActivityLevel(date);
            return (
              <motion.div
                key={date.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.005 }}
                whileHover={{ scale: 1.2, zIndex: 10 }}
                className={`w-[14px] h-[14px] rounded-[4px] cursor-crosshair transition-all duration-300 ${getIntensityColor(level)}`}
                title={`${format(date, 'MMM d, yyyy')}: Level ${level}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
