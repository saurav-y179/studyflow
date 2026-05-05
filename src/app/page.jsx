"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// --- SVGs & Icons (Custom, clean minimal shapes as requested) ---

const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" className="stroke-white/80" strokeWidth="2" />
    <path d="M8 12L11 15L16 9" className="stroke-blue-400" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FlameIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 16.5 6.5 16.5 11.5C16.5 15.5 13.5 18.5 12 21.5C10.5 18.5 7.5 15.5 7.5 11.5C7.5 6.5 12 2 12 2Z" 
          className="fill-blue-500/20 stroke-blue-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11C12 11 13.5 12.5 13.5 14.5C13.5 16 12.5 17 12 18C11.5 17 10.5 16 10.5 14.5C10.5 12.5 12 11 12 11Z" 
          className="fill-blue-300" />
  </svg>
);

const RabbitIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
          className="stroke-white/40" strokeWidth="1.5" />
    <path d="M9 10C9 10 9 5 10.5 5C12 5 12 10 12 10" className="stroke-white/80" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M15 10C15 10 15 5 13.5 5C12 5 12 10 12 10" className="stroke-white/80" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="10" cy="14" r="1" fill="white" />
    <circle cx="14" cy="14" r="1" fill="white" />
    <path d="M11 16H13" className="stroke-white/80" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CheckCircle = ({ checked }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" className={checked ? "stroke-blue-500 fill-blue-500/10" : "stroke-white/20"} strokeWidth="1.5" />
    {checked && <path d="M8 12L11 15L16 9" className="stroke-blue-400" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

// --- Particle Background ---

const ParticleBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-800/10 blur-[150px] rounded-full mix-blend-screen" />
      
      {/* Simple pure CSS particles for a subtle starfield effect */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)'
      }} />
    </div>
  );
};

// --- Components ---

const Navbar = () => (
  <motion.nav 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-black/40 border-b border-white/5"
  >
    <div className="flex items-center gap-2">
      <LogoIcon />
      <span className="text-white font-medium tracking-wide">StudyFlow</span>
    </div>
    
    <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
      <a href="#product" className="hover:text-white transition-colors">Product</a>
      <a href="#features" className="hover:text-white transition-colors">Features</a>
      <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
    </div>

    <button className="px-5 py-2 text-sm font-medium text-black bg-white rounded-full hover:bg-blue-50 hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)]">
      Get Started
    </button>
  </motion.nav>
);

const Hero = () => (
  <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="inline-flex items-center gap-2 px-3 py-1 mb-8 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium tracking-wider uppercase"
    >
      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
      Momentum Engine Live
    </motion.div>

    <motion.h1 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="text-5xl md:text-7xl font-semibold text-white tracking-tight leading-tight max-w-4xl"
    >
      Build <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">Unbreakable Streaks</span>
    </motion.h1>

    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl font-light"
    >
      Turn daily tasks into momentum. Never break the chain. AI-powered insights keep you consistent and focused on what matters.
    </motion.p>

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="flex flex-col sm:flex-row items-center gap-4 mt-10"
    >
      <button className="px-8 py-3.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]">
        Start Building Streaks
      </button>
      <button className="px-8 py-3.5 rounded-full border border-white/10 text-white/80 font-medium hover:bg-white/5 hover:text-white hover:scale-105 transition-all">
        Watch Demo
      </button>
    </motion.div>
  </div>
);

const FloatingCards = () => {
  return (
    <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[600px] mt-12 mb-32 perspective-1000">
      
      {/* Card 1: Streak Display */}
      <motion.div 
        initial={{ opacity: 0, x: -50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
        transition={{ 
          opacity: { duration: 1, delay: 0.6 },
          x: { duration: 1, delay: 0.6, type: "spring" },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }}
        className="absolute left-[5%] top-[10%] z-20 w-64 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30">
            <FlameIcon />
          </div>
          <div>
            <div className="text-2xl font-semibold text-white">42 Day Streak</div>
            <div className="text-xs text-blue-400 font-medium uppercase tracking-wider">On Fire</div>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Today's Tasks */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8, type: "spring" }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="absolute left-1/2 transform -translate-x-1/2 top-[5%] z-30 w-80 md:w-96 p-6 rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(59,130,246,0.1)]"
      >
        <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-widest">Today's Focus</h3>
        
        <div className="space-y-3">
          {[
            { text: "Complete architecture review", done: true },
            { text: "Write landing page copy", done: true },
            { text: "Implement floating animations", done: false },
            { text: "Deploy to production", done: false }
          ].map((task, i) => (
            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <CheckCircle checked={task.done} />
              <span className={`text-sm ${task.done ? 'text-white/30 line-through' : 'text-white/90'}`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex justify-between text-xs text-white/50 mb-2">
            <span>Daily Progress</span>
            <span className="text-blue-400">50%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '50%' }}
              transition={{ duration: 1, delay: 1.5 }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Card 3: Heatmap */}
      <motion.div 
        initial={{ opacity: 0, x: 50, y: 50 }}
        animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
        transition={{ 
          opacity: { duration: 1, delay: 0.7 },
          x: { duration: 1, delay: 0.7, type: "spring" },
          y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }
        }}
        className="absolute right-[5%] top-[25%] z-20 w-72 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="text-xs text-white/50 mb-3 uppercase tracking-widest">Activity Heatmap</div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => {
            // Randomize intensities for demo
            const intensity = [0, 0, 1, 2, 3, 4][Math.floor(Math.random() * 6)];
            const colors = ['bg-white/5', 'bg-blue-900/40', 'bg-blue-700/60', 'bg-blue-500/80', 'bg-blue-400'];
            return (
              <div key={i} className={`w-full aspect-square rounded-[2px] ${colors[intensity]}`} />
            );
          })}
        </div>
      </motion.div>

      {/* AI Assistant Preview */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute right-[15%] bottom-[5%] z-40 flex items-end gap-3"
      >
        <div className="max-w-[200px] p-3 rounded-2xl rounded-br-sm border border-white/10 bg-[#0f1015]/90 backdrop-blur-md shadow-xl">
          <p className="text-xs text-white/80 leading-relaxed">
            You planned 6 tasks. Completed 4. Improve consistency tomorrow.
          </p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <RabbitIcon />
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030305] text-white overflow-hidden font-sans selection:bg-blue-500/30">
      {/* Subtle Interactive Cursor Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(29, 78, 216, 0.05), transparent 40%)`
        }}
      />

      <ParticleBackground />
      <Navbar />
      
      <main className="pt-20">
        <Hero />
        <FloatingCards />
      </main>
      
    </div>
  );
}
