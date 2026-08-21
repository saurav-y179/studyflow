import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target } from 'lucide-react';
import { isDayComplete } from '../utils/storage';

export const Dashboard = ({ entries, streak, dailyGoal = 4 }) => {
  const activeDays = entries.filter((e) => e.todayTasks && e.todayTasks.length > 0).length;
  const completeDays = entries.filter((e) => isDayComplete(e)).length;
  const completionRate = activeDays > 0 ? Math.round((completeDays / activeDays) * 100) : 0;

  // Calculate focus time based on proper week boundaries (Mon-Sun)
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() + mondayOffset);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

  let totalTasksCompletedThisWeek = 0;
  let totalTasksCompletedLastWeek = 0;

  entries.forEach(e => {
    const d = new Date(e.date + 'T00:00:00');
    const completedCount = e.todayTasks?.filter(t => t.completed).length || 0;

    if (d >= startOfThisWeek && d < endOfThisWeek) {
      totalTasksCompletedThisWeek += completedCount;
    } else if (d >= startOfLastWeek && d < startOfThisWeek) {
      totalTasksCompletedLastWeek += completedCount;
    }
  });

  const totalMinutes = totalTasksCompletedThisWeek * 45;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  const lastWeekMinutes = totalTasksCompletedLastWeek * 45;
  let percentChange = 0;
  if (lastWeekMinutes === 0 && totalMinutes > 0) percentChange = 100;
  else if (lastWeekMinutes > 0) {
    percentChange = Math.round(((totalMinutes - lastWeekMinutes) / lastWeekMinutes) * 100);
  }

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const goalMinutes = dailyGoal * 60;
  const percent = Math.min((totalMinutes / goalMinutes) * 100, 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex flex-col gap-6">
      {/* Top 4 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Active Days', value: activeDays, icon: Target, color: '#2EE6D8' },
          { label: 'Current Streak', value: streak.current, icon: TrendingUp, color: '#FFB443' },
          { label: 'Longest Streak', value: streak.longest, icon: AwardIcon, color: '#4ADE80' },
          { label: 'Completion', value: `${completionRate}%`, icon: Clock, color: '#F87171' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.1)' }}
            className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-h1 font-bold text-[var(--text-bright)] tracking-tight leading-none mb-1">{stat.value}</p>
              <p className="text-[13px] text-[var(--text-muted)]">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Productivity Overview */}
      <div className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-6 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[var(--card-border-10)] transition-all duration-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-6">
            <div className="relative flex items-center justify-center w-[120px] h-[120px]">
              <svg width="120" height="120" className="-rotate-90">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--card-alt)" strokeWidth="8" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: offset }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Target className="w-5 h-5 text-[var(--text-muted)] mb-1" />
              </div>
            </div>

            <div>
              <p className="text-body font-semibold uppercase tracking-[0.05em] text-[var(--text-muted)] mb-2">Total focus time this week</p>
              <div className="text-[36px] font-bold text-[var(--text-bright)] tracking-tight leading-none">
                {hours}h {mins}m
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {percentChange >= 0 ? (
              <div className="px-3 py-1.5 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] text-[13px] font-semibold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{percentChange}% vs last week
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-full bg-[#F87171]/15 text-[#F87171] text-[13px] font-semibold flex items-center gap-1">
                <TrendingDownIcon className="w-4 h-4" />
                {percentChange}% vs last week
              </div>
            )}
            
            {/* AI Insight Coach Card directly inside the Dashboard for immediate visibility */}
            <div className="mt-2 bg-[var(--card-bg-80)] border-[var(--card-border)] rounded-xl p-4 flex gap-4 max-w-[320px] relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#2EE6D8] to-[#FFB443] group-hover:shadow-[0_0_15px_#2EE6D8] transition-shadow duration-500" />
              <div className="w-10 h-10 rounded-full bg-[#FFB443]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">⚡</span>
              </div>
              <div>
              <p className="text-body text-[var(--text-bright)] font-medium leading-tight mb-2">
                {percentChange > 0
                  ? `Great consistency! You're ${percentChange}% more productive this week.`
                  : percentChange < 0
                  ? `You're down ${Math.abs(percentChange)}% this week. A small task can restart the rhythm.`
                  : 'Complete one task today to start building momentum.'}
              </p>
                <button className="text-[13px] text-[#2EE6D8] hover:text-[#5FFBEF] font-semibold transition-colors">
                  See more insights →
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Icons not imported from lucide-react above
const AwardIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>
);

const TrendingDownIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
);