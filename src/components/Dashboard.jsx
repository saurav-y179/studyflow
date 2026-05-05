import { Flame, Target, TrendingUp, Award } from 'lucide-react';

export const Dashboard = ({ entries, streak }) => {
  const totalDays = entries.length;
  
  const completedEntries = entries.filter((e) => {
    const tasks = e.todayTasks || [];
    if (!tasks.length) return false;
    return (tasks.filter((t) => t.completed).length / tasks.length) >= 0.8;
  });
  
  const completionRate = totalDays > 0 
    ? Math.round((completedEntries.length / totalDays) * 100) 
    : 0;

  const stats = [
    {
      label: 'Active Days',
      value: totalDays,
      icon: Flame,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
    },
    {
      label: 'Current Streak',
      value: streak.current,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'bg-warning/20',
    },
    {
      label: 'Longest Streak',
      value: streak.longest,
      icon: Award,
      color: 'text-secondary',
      bgColor: 'bg-secondary/20',
    },
    {
      label: 'Completion',
      value: `${completionRate}%`,
      icon: Target,
      color: 'text-primary-glow',
      bgColor: 'bg-primary-glow/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-surface/90 border border-border rounded-2xl p-5 shadow-[0_0_20px_rgba(45,91,255,0.08)] hover:shadow-[0_0_24px_rgba(0,240,255,0.15)] transition-shadow"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary font-mono">{stat.value}</p>
          <p className="text-text-secondary text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};