import { motion } from 'framer-motion';
import { Flame, Target, TrendingUp, Award } from 'lucide-react';
import { isDayComplete } from '../utils/storage';

export const Dashboard = ({ entries, streak }) => {
  const activeDays = entries.filter(
    (e) => e.todayTasks && e.todayTasks.length > 0
  ).length;

  const completeDays = entries.filter((e) => isDayComplete(e)).length;
  const completionRate =
    activeDays > 0 ? Math.round((completeDays / activeDays) * 100) : 0;

  const stats = [
    { label: 'Active Days', value: activeDays, icon: Flame, color: 'text-primary', bgColor: 'bg-primary/10', gradient: 'from-primary/20 to-transparent' },
    { label: 'Current Streak', value: streak.current, icon: TrendingUp, color: 'text-warning', bgColor: 'bg-warning/10', gradient: 'from-warning/20 to-transparent' },
    { label: 'Longest Streak', value: streak.longest, icon: Award, color: 'text-secondary', bgColor: 'bg-secondary/10', gradient: 'from-secondary/20 to-transparent' },
    { label: 'Completion', value: `${completionRate}%`, icon: Target, color: 'text-primary-glow', bgColor: 'bg-primary-glow/10', gradient: 'from-primary-glow/20 to-transparent' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="glass-strong rounded-2xl p-5 relative overflow-hidden group cursor-default"
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
          <div className="relative z-10">
            <div className={`w-10 h-10 ${stat.bgColor} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-bold text-text-primary font-mono tabular-nums">{stat.value}</p>
            <p className="text-text-tertiary text-sm mt-0.5">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};