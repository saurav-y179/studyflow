import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Sparkles } from 'lucide-react';

const GREETINGS = {
  morning:   { text: 'Good Morning', sub: 'Early start — winners build momentum first thing.', icon: '☀️' },
  afternoon: { text: 'Good Afternoon', sub: 'Peak focus hours — lock in and execute.', icon: '🔥' },
  evening:   { text: 'Good Evening', sub: 'Wind-down mode — review your wins today.', icon: '🌙' },
  night:     { text: 'Late Night',    sub: 'Night owl session — stay sharp and rest well after.', icon: '⭐' },
};

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
};

const MOTIVATIONAL_TIPS = [
  "Small wins stack into massive breakthroughs.",
  "Consistency beats intensity every single time.",
  "Your future self is counting on today's effort.",
  "Focus is a superpower — protect it ruthlessly.",
  "The streak doesn't define you, but it reveals your discipline.",
  "Every task completed is proof that you can.",
  "Study like you mean it. Rest like you've earned it.",
  "Momentum is fragile. Feed it daily.",
];

export const GreetingBanner = ({ user, entries, streak }) => {
  const timeOfDay = getTimeOfDay();
  const greeting = GREETINGS[timeOfDay];
  const userName = user?.name || 'there';

  const todayStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayEntry = entries?.find(e => e.date === today);
    const tasks = todayEntry?.todayTasks || [];
    const completed = tasks.filter(t => t.completed).length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, pct };
  }, [entries]);

  // Deterministic "tip of the day" — rotates daily
  const dayIndex = Math.floor(new Date().getTime() / 86400000);
  const tip = MOTIVATIONAL_TIPS[dayIndex % MOTIVATIONAL_TIPS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 sm:px-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        {/* Left: Greeting */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-xl">{greeting.icon}</span>
            <h1 className="text-display" style={{ color: 'var(--text-primary)' }}>
              {greeting.text}, <span style={{ color: 'var(--accent)' }}>{userName}</span>
            </h1>
          </div>
          <p className="text-body" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>{greeting.sub}</p>
        </div>

        {/* Right: Quick stats pills */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Today's Progress */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(46,230,216,0.08)', border: '1px solid rgba(46,230,216,0.12)' }}
          >
            <Target className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-caption font-semibold tabular-nums" style={{ color: 'var(--accent)' }}>
              {todayStats.completed}/{todayStats.total}
            </span>
            <span className="text-overline" style={{ color: 'var(--text-muted)', fontSize: '0.5625rem', letterSpacing: '0.08em' }}>today</span>
          </motion.div>

          {/* Streak */}
          {streak?.current > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: 'rgba(255,180,67,0.08)', border: '1px solid rgba(255,180,67,0.12)' }}
            >
              <span className="text-sm animate-fire">🔥</span>
              <span className="text-caption font-semibold tabular-nums" style={{ color: 'var(--accent-alt)' }}>
                {streak.current}
              </span>
              <span className="text-overline" style={{ color: 'var(--text-muted)', fontSize: '0.5625rem', letterSpacing: '0.08em' }}>streak</span>
            </motion.div>
          )}

          {/* Motivational tip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-xl max-w-[280px]"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.1)' }}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#A78BFA' }} />
            <span className="text-caption truncate" style={{ color: '#A78BFA' }}>{tip}</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
