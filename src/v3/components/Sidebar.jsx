import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ListTodo,
  CalendarRange,
  BarChart3,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ActivePikachu } from './ActivePikachu';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'plan', label: 'Plan', icon: CalendarRange },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export const Sidebar = ({ activeNav, onNavChange, onPikachuClick, recentActivity, isMinimized, onToggleMinimize }) => {
  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col z-50 overflow-y-auto overflow-x-hidden scrollbar-hide transition-[width] duration-300"
      style={{
        width: isMinimized ? '48px' : '200px',
        background: `linear-gradient(175deg,
          rgba(0,2,255,0.82) 0%,
          rgba(9,9,255,0.78) 15%,
          rgba(31,69,252,0.75) 30%,
          rgba(37,84,199,0.72) 45%,
          rgba(21,105,199,0.7) 60%,
          rgba(43,96,222,0.72) 75%,
          rgba(43,101,236,0.75) 88%,
          rgba(0,89,255,0.8) 100%
        )`,
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '4px 0 24px rgba(0,2,255,0.15), inset -1px 0 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top Header with Logo and Minimize */}
      <div className={`flex items-center ${isMinimized ? 'flex-col gap-4' : 'justify-between'} px-2 py-4 transition-all duration-300`}>
        <div className={`flex items-center ${isMinimized ? 'justify-center' : 'gap-2.5 px-2'}`}>
          <div
            className="w-8 h-8 rounded-[10px] flex-shrink-0 flex items-center justify-center shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #152ad1 0%, #4455da 100%)',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 10px 24px rgba(21,42,209,0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round"/>
            </svg>
          </div>
          {!isMinimized && <span className="text-[15px] font-bold text-white tracking-tight">StudyFlow</span>}
        </div>
        <button 
          onClick={onToggleMinimize}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
        >
          {isMinimized ? <ChevronRight className="w-4 h-4 text-white" /> : <ChevronLeft className="w-4 h-4 text-white/70 hover:text-white" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isMinimized ? 'px-1' : 'px-3'} mt-1`}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              whileHover={{ x: 2 }}
              className={`w-full flex items-center ${isMinimized ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'} rounded-xl text-sm font-medium transition-all duration-200 mb-0.5 ${
                isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
              style={
                isActive
                  ? {
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!isMinimized && item.label}
            </motion.button>
          );
        })}
      </nav>

      {/* Pikachu Mascot Area */}
      <div className={`py-3 ${isMinimized ? 'px-1' : 'px-4'}`}>
        <div className={isMinimized ? 'hidden' : 'block'}>
          <ActivePikachu recentActivity={recentActivity} />
        </div>

        <div className="flex flex-col items-center mt-2">
          <motion.button
            onClick={onPikachuClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center justify-center ${isMinimized ? 'w-10 h-10 p-0 rounded-xl' : 'w-full max-w-[140px] gap-2 px-4 py-3 rounded-xl'} font-bold uppercase tracking-wider text-[11px] transition-all`}
            style={{
              background: 'linear-gradient(135deg, #BDF516 0%, #64E986 100%)',
              color: '#0a1a00',
              boxShadow: '0 8px 24px rgba(189,245,22,0.5), inset 0 2px 0 rgba(255,255,255,0.4)',
              border: 'none'
            }}
          >
            <MessageCircle className={`${isMinimized ? 'w-5 h-5' : 'w-4 h-4'} flex-shrink-0`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
            {!isMinimized && "Ask Pikachu"}
          </motion.button>
        </div>
      </div>
    </aside>
  );
};
