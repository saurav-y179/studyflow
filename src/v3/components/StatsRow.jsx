import { motion } from 'framer-motion';
import { CalendarDays, Flame, Radio, Target, Trophy } from 'lucide-react';
import { isDayComplete } from '../../utils/storage';
import { AnimatedCounter, Sparkline, TrendArrow } from './AnimatedCounter';

const CARD_ACCENTS = [
  { gradient: 'linear-gradient(135deg, #2EE6D8, #1CC9B8)', icon: CalendarDays, label: 'Active Days', dotColor: '#2EE6D8' },
  { gradient: 'linear-gradient(135deg, #FFB443, #E5972E)', icon: Flame, label: 'Streak', dotColor: '#FFB443' },
  { gradient: 'linear-gradient(135deg, #4ADE80, #34C759)', icon: Trophy, label: 'Best', dotColor: '#4ADE80' },
  { gradient: 'linear-gradient(135deg, #F87171, #EF4444)', icon: Target, label: 'Completion', dotColor: '#F87171' },
];

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
  // Generate 7-day sparkline data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const entry = entries.find(e => e.date === dateStr);
    const tasks = entry?.todayTasks || [];
    return tasks.length > 0 ? tasks.filter(t => t.completed).length / tasks.length * 100 : 0;
  });

  const last7DaysActive = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const entry = entries.find(e => e.date === dateStr);
    return (entry?.todayTasks?.length || 0) > 0 ? 1 : 0;
  });

  // Calculate weekly delta percentage
  const weeklyDeltaPct = lastWeekComplete > 0
    ? Math.round(((thisWeekComplete - lastWeekComplete) / lastWeekComplete) * 100)
    : thisWeekComplete > 0 ? 100 : 0;

  const stats = [
    {
      value: activeDays,
      sub: 'tracked study days',
      dotCount: 7,
      dotFill: Math.min(activeDays, 7),
      extra: null,
      sparklineData: last7DaysActive,
      trend: weeklyDeltaPct,
    },
    {
      value: streak.current,
      sub: '30-day streak charge',
      dotCount: 10,
      dotFill: Math.ceil(streakProgress * 10),
      badge: `${streakPercent}%`,
      extra: null,
      sparklineData: last7Days,
    },
    {
      value: streak.longest,
      sub: 'personal best record',
      dotCount: null,
      dotFill: null,
      extra: (
        <div className="mt-3 h-1.5 rounded-full bg-[#1E2530] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max((streak.longest / streakGoal) * 100, 8), 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #4ADE80, #34C759)' }}
          />
        </div>
      ),
    },
    {
      value: completionRate,
      valueSuffix: '%',
      sub: 'all-time completion',
      dotCount: null,
      dotFill: null,
      sparklineData: last7Days,
      extra: (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" />
            <span className="text-micro text-[#5B6574]">{completeDays}/{activeDays || 0} days</span>
          </div>
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#1E2530" strokeWidth="3" />
              <motion.circle
                cx="20" cy="20" r="16" fill="none" stroke="#F87171" strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 16}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 16 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 16 * (1 - completionRate / 100) }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 sm:px-6 mb-6">
      {/* Persistent solid tray around the stat islands — same on every page */}
      <div
        className="rounded-[22px] p-3"
        style={{ background: '#070B12', border: '1px solid #2A3550' }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {stats.map((stat, i) => {
            const accent = CARD_ACCENTS[i];
            if (!accent) return null;
            const Icon = accent.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.5)', borderColor: `${accent.dotColor}55`, transition: { duration: 0.2 } }}
                className="rounded-[16px] p-4"
                style={{
                  background: '#0D1421',
                  border: `1px solid ${accent.dotColor}33`,
                }}
              >

              <div className="flex items-center justify-between">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl relative"
                  style={{ background: `${accent.dotColor}12` }}
                >
                  <Icon className="h-[18px] w-[18px]" style={{ color: accent.dotColor }} />
                  <div className="absolute inset-0 rounded-xl" style={{ background: `radial-gradient(circle at center, ${accent.dotColor}22, transparent)`, filter: 'blur(4px)' }} />
                </div>
                {stat.badge && (
                  <span className="text-micro font-semibold tabular-nums" style={{ color: accent.dotColor }}>
                    {stat.badge}
                  </span>
                )}
                {!stat.badge && i !== 2 && (
                  <span className="text-overline" style={{ color: '#5B6574', fontSize: '0.5625rem' }}>
                    {accent.label}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-3">
                <AnimatedCounter
                  value={typeof stat.value === 'string' ? parseFloat(stat.value) : stat.value}
                  suffix={stat.valueSuffix || ''}
                  className="text-[1.75rem] font-bold tracking-tight"
                  style={{ color: 'var(--text-bright)', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}
                />
                {stat.sparklineData && (
                  <Sparkline data={stat.sparklineData} color={accent.dotColor} width={60} height={22} />
                )}
              </div>
              {stat.trend !== undefined && stat.trend !== 0 && (
                <div className="mt-1">
                  <TrendArrow value={stat.trend} className="text-micro" />
                  <span className="text-micro ml-1" style={{ color: 'var(--text-muted)' }}>vs last week</span>
                </div>
              )}

              {stat.dotCount && (
                <div className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${stat.dotCount}, 1fr)` }}>
                  {Array.from({ length: stat.dotCount }, (_, di) => (
                    <motion.div
                      key={di}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.06 + di * 0.03, duration: 0.2 }}
                      className="h-1.5 rounded-full"
                      style={{ background: di < stat.dotFill ? accent.dotColor : '#1E2530' }}
                    />
                  ))}
                </div>
              )}

              {stat.extra}

              <p className="mt-1.5 text-caption" style={{ color: 'var(--text-muted)' }}>{stat.sub}</p>
          </motion.div>
        );
      })}

      {/* AI Insight Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.5)', borderColor: 'rgba(46,230,216,0.4)', transition: { duration: 0.2 } }}
        className="rounded-[16px] p-4 sm:col-span-1 lg:col-span-1 relative overflow-hidden"
        style={{
          background: '#0D1421',
          border: '1px solid rgba(46,230,216,0.33)',
        }}
      >
          {/* Animated gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
            background: 'linear-gradient(90deg, #2EE6D8, #A78BFA, #FFB443, #2EE6D8)',
            backgroundSize: '200% 100%',
            animation: 'shimmer-sweep 3s ease-in-out infinite',
          }} />

          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Radio className="h-3.5 w-3.5 text-[#2EE6D8]" />
                <div className="absolute -inset-1 rounded-full" style={{ background: 'rgba(46,230,216,0.15)', filter: 'blur(4px)' }} />
              </div>
              <span className="text-overline" style={{ color: '#2EE6D8', fontSize: '0.5625rem' }}>AI Pulse</span>
            </div>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#2EE6D8' }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: '#2EE6D8' }} />
            </span>
          </div>

          <p className="text-body font-semibold leading-snug" style={{ color: '#E9EDF2', fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}>
            {streak.current >= 7 ? 'Streak engine is hot' : streak.current >= 3 ? 'Momentum is forming' : completionRate >= 70 ? 'Consistency signal strong' : 'Prime the first win'}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Sparkline data={last7Days} color="#2EE6D8" width={50} height={18} />
            {weeklyDeltaPct !== 0 && <TrendArrow value={weeklyDeltaPct} />}
          </div>

          <p className="mt-1.5 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {thisWeekComplete > 0 ? `${thisWeekComplete} complete day${thisWeekComplete === 1 ? '' : 's'} this week` : 'Complete one task today'}
          </p>
      </motion.div>
        </div>
      </div>
    </div>
  );
};
