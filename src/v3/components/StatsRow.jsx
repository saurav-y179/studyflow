import { motion } from 'framer-motion';
import { Award, CalendarDays, Flame, Radio, Target, Trophy } from 'lucide-react';
import { isDayComplete } from '../../utils/storage';

export const StatsRow = ({ entries, streak }) => {
  const activeDays = entries.filter((e) => e.todayTasks && e.todayTasks.length > 0).length;
  const completeDays = entries.filter((e) => isDayComplete(e)).length;
  const completionRate = activeDays > 0 ? Math.round((completeDays / activeDays) * 100) : 0;
  const streakGoal = 30;
  const streakProgress = Math.min(Math.max(streak.current / streakGoal, 0), 1);
  const streakPercent = Math.round(streakProgress * 100);
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setHours(0, 0, 0, 0);
  startOfThisWeek.setDate(now.getDate() - now.getDay());
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const getEntryDate = (entry) => {
    const date = new Date(`${entry.date}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const getWeekCompleteCount = (start, end) =>
    entries.filter((entry) => {
      const date = getEntryDate(entry);
      return date && date >= start && date < end && isDayComplete(entry);
    }).length;

  const thisWeekComplete = getWeekCompleteCount(startOfThisWeek, now);
  const lastWeekComplete = getWeekCompleteCount(startOfLastWeek, startOfThisWeek);
  const weeklyDelta = thisWeekComplete - lastWeekComplete;

  const activeDots = Array.from({ length: 7 }, (_, i) => i < Math.min(activeDays, 7));
  const streakChips = Array.from({ length: 10 }, (_, i) => i < Math.ceil(streakProgress * 10));

  const getAiInsight = () => {
    if (streak.current >= 7) return 'Streak engine is hot';
    if (streak.current >= 3) return 'Momentum is forming';
    if (completionRate >= 70) return 'Consistency signal strong';
    return 'Prime the first win';
  };

  const getAiSubtext = () => {
    if (weeklyDelta > 0) {
      return `${weeklyDelta} more complete day${weeklyDelta === 1 ? '' : 's'} than last week.`;
    }
    if (weeklyDelta < 0) {
      return `${Math.abs(weeklyDelta)} behind last week. A small task can restart the rhythm.`;
    }
    if (thisWeekComplete > 0) {
      return 'Holding steady with last week. Keep the chain warm.';
    }
    return 'Complete one task today to wake up the streak system.';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 px-4 sm:px-6 mb-5">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-[#16E2F5]/20 bg-[#030610]/70 p-4 shadow-[0_0_24px_rgba(22,226,245,0.08)] backdrop-blur-sm"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#16E2F5]/70 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#16E2F5]/10">
            <CalendarDays className="h-[18px] w-[18px] text-[#16E2F5]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#16E2F5]/70">Active</span>
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums text-white">{activeDays}</p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {activeDots.map((isLit, index) => (
            <div
              key={index}
              className="h-1.5 rounded-full"
              style={{ background: isLit ? '#16E2F5' : 'rgba(161,170,237,0.16)' }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#a1aaed]">tracked study days</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06, duration: 0.4 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-[#ff7a00]/35 bg-[#110704]/80 p-4 shadow-[0_0_28px_rgba(255,94,0,0.16)] backdrop-blur-sm"
      >
        <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-[#ff6a00]/20 blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffb000] to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ff6a00]/15">
            <Flame className="h-[18px] w-[18px] text-[#ff8a00]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffb000]/80">{streakPercent}%</span>
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums text-white">{streak.current}</p>
        <div className="mt-3 grid grid-cols-10 gap-1">
          {streakChips.map((isLit, index) => (
            <div
              key={index}
              className="h-1.5 rounded-full"
              style={{ background: isLit ? 'linear-gradient(90deg, #ff3d00, #ffb000)' : 'rgba(255,122,0,0.16)' }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#ffc36b]">30-day streak charge</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-[#ffc107]/25 bg-[#090812]/75 p-4 shadow-[0_0_24px_rgba(255,193,7,0.08)] backdrop-blur-sm"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ffc107]/70 to-transparent" />
        <div className="flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ffc107]/12">
            <Trophy className="h-[18px] w-[18px] text-[#ffc107]" />
          </div>
          <Award className="h-4 w-4 text-[#ffc107]/55" />
        </div>
        <p className="mt-3 text-2xl font-bold tabular-nums text-white">{streak.longest}</p>
        <div className="mt-3 h-1.5 rounded-full bg-[#ffc107]/12">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ffb000] to-[#ffe58a]"
            style={{ width: `${Math.min(Math.max((streak.longest / streakGoal) * 100, 8), 100)}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[#ffe08a]">personal best record</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="relative overflow-hidden rounded-2xl border border-[#00ffb2]/22 bg-[#03100d]/70 p-4 shadow-[0_0_24px_rgba(0,255,178,0.08)] backdrop-blur-sm"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00ffb2]/70 to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tabular-nums text-white">{completionRate}%</p>
            <p className="mt-0.5 text-[11px] text-[#95ffe1]">all-time completion</p>
          </div>
          <div
            className="grid h-11 w-11 place-items-center rounded-full"
            style={{
              background: `conic-gradient(#00ffb2 ${completionRate * 3.6}deg, rgba(0,255,178,0.14) 0deg)`,
            }}
          >
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#03100d]">
              <Target className="h-4 w-4 text-[#00ffb2]" />
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00ffb2]" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#00ffb2]/70">{completeDays}/{activeDays || 0} days clean</span>
        </div>
      </motion.div>

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4 }}
        className="relative col-span-2 overflow-hidden rounded-2xl border border-[#a78bfa]/22 bg-[#070516]/75 p-4 shadow-[0_0_24px_rgba(167,139,250,0.08)] backdrop-blur-sm sm:col-span-3 lg:col-span-1"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#a78bfa]/70 to-transparent" />
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-[#a78bfa]" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a78bfa]">AI Readout</span>
          </div>
          <span className="h-2 w-2 rounded-full bg-[#a78bfa] shadow-[0_0_10px_rgba(167,139,250,0.9)]" />
        </div>
        <p className="text-sm font-bold leading-snug text-white">{getAiInsight()}</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#c4b5fd]">{getAiSubtext()}</p>
      </motion.div>
    </div>
  );
};
