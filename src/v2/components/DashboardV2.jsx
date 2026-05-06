import { motion } from 'framer-motion';
import { Activity, Zap, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';
import { ContributionGridV2 } from './ContributionGridV2';

const Card = ({ children, className = "", delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    className={`bg-white/[0.02] border border-white/[0.05] rounded-[2rem] p-8 backdrop-blur-xl relative overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
    <motion.div 
      className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"
      style={{ background: 'radial-gradient(800px circle at center, rgba(16,185,129,0.03), transparent 40%)' }}
    />
    <div className="relative z-10">{children}</div>
  </motion.div>
);

export const DashboardV2 = ({ entries, streak, momentum, refreshEntries }) => {
  const today = entries.find(e => e.date === new Date().toISOString().slice(0, 10)) || { todayTasks: [] };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Momentum Core (Left Side Large) */}
      <Card className="lg:col-span-8" delay={0.1}>
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Core Momentum</h2>
          <Zap className="w-4 h-4 text-[#ea580c]" />
        </div>
        
        <div className="flex flex-col items-center justify-center py-4 relative">
           {/* Glowing core visualization */}
           <div className="relative w-48 h-48 flex items-center justify-center">
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 rounded-full border border-[#10b981]/20 border-t-[#10b981]/80 shadow-[0_0_30px_rgba(16,185,129,0.1)]"
             />
             <motion.div 
               animate={{ rotate: -360 }} 
               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
               className="absolute inset-4 rounded-full border border-[#ea580c]/10 border-b-[#ea580c]/60"
             />
             <div className="absolute inset-0 rounded-full shadow-[0_0_80px_rgba(16,185,129,0.1)] pointer-events-none" />
             
             <div className="text-center flex flex-col items-center">
               <span className="text-6xl font-light tracking-tighter text-white/90">{momentum.momentum}</span>
               <span className="text-sm font-bold tracking-widest text-white/30 uppercase mt-1">Percent</span>
             </div>
           </div>
           
           <div className="mt-16 w-full max-w-md">
             <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40 mb-3">
               <span>Energy Level</span>
               <span className="text-[#10b981] animate-pulse">Stable</span>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${momentum.momentum}%` }}
                 transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                 className="h-full bg-gradient-to-r from-[#10b981] to-[#34d399] relative"
               >
                 <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
               </motion.div>
             </div>
           </div>
        </div>
      </Card>

      {/* Streak Engine (Right Side Top) */}
      <Card className="lg:col-span-4" delay={0.2}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Streak Engine</h2>
          <Activity className="w-4 h-4 text-[#10b981]" />
        </div>
        
        <div className="flex flex-col gap-8">
          <div className="flex items-baseline gap-3">
            <span className="text-8xl font-light tracking-tighter text-white/90">{streak.current}</span>
            <span className="text-sm font-bold uppercase tracking-widest text-white/30">Days</span>
          </div>
          
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10b981]/10 to-transparent border border-[#10b981]/20 flex items-start gap-4 backdrop-blur-md">
            <div className="w-2 h-2 rounded-full bg-[#10b981] mt-1.5 shadow-[0_0_10px_#10b981] animate-pulse" />
            <p className="text-xs text-white/60 leading-relaxed font-light tracking-wide">
              System efficiency is optimal. Maintain daily directives to preserve core power grid.
            </p>
          </div>
        </div>
      </Card>

      {/* Task Matrix (Full Width Bottom) */}
      <Card className="lg:col-span-12" delay={0.3}>
         <div className="flex items-center justify-between mb-8">
          <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50">Active Directives</h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#ea580c] bg-[#ea580c]/10 px-3 py-1 rounded-full border border-[#ea580c]/20">
            {today.todayTasks.filter(t => t.completed).length} / {today.todayTasks.length} Completed
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {today.todayTasks.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-white/30 font-light tracking-wider uppercase">
              No directives assigned for current cycle.
            </div>
          )}
          {today.todayTasks.map((task, i) => (
            <motion.div 
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
              whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.04)" }}
              className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 border ${
                task.completed 
                  ? 'bg-white/[0.01] border-white/[0.02] opacity-40' 
                  : 'bg-gradient-to-r from-[#10b981]/5 to-transparent border-white/[0.05] shadow-[inset_2px_0_0_rgba(16,185,129,0.5)]'
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-white/20 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#10b981] shrink-0" />
              )}
              <span className={`text-sm tracking-wide font-light ${task.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                {task.text}
              </span>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Activity Heatmap */}
      <Card className="lg:col-span-12" delay={0.4}>
        <ContributionGridV2 entries={entries} />
      </Card>
    </div>
  );
};
