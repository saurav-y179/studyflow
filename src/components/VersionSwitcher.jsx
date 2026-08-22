import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';

const ACCENT = '#34D399';

export const VersionSwitcher = ({ onSwitchVersion, currentVersion }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const versions = [
    { id: 'v3', label: 'Pikachu Blue', description: 'Signature electric workspace' },
    { id: 'v1', label: 'Scandinavian', description: 'Minimal light layout' },
  ];

  const current = versions.find((v) => v.id === currentVersion) || versions[0];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger — current layout name */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        title="Switch layout"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.09] hover:border-white/20 transition-all duration-200"
      >
        <span className="text-xs font-semibold text-white/90">{current.label}</span>
        <ChevronDown
          className={`w-3 h-3 text-white/40 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full mt-2 w-60 bg-[#10141d] rounded-xl overflow-hidden shadow-2xl border border-white/10"
            style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)' }}
          >
            {/* Panel header */}
            <div className="px-3 pt-2.5 pb-1.5">
              <span className="text-overline font-mono uppercase tracking-widest text-white/25" style={{ fontSize: '0.5625rem' }}>
                Interface Layout
              </span>
            </div>

            <div className="p-1.5 pt-0">
              {versions.map((version) => {
                const isActive = currentVersion === version.id;
                return (
                  <button
                    key={version.id}
                    onClick={() => {
                      onSwitchVersion(version.id);
                      setShowDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-left ${
                      isActive ? '' : 'hover:bg-white/[0.06]'
                    }`}
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, rgba(52,211,153,0.13), rgba(16,185,129,0.05))',
                            boxShadow: 'inset 0 0 0 1px rgba(52,211,153,0.3)',
                          }
                        : undefined
                    }
                  >
                    {/* Label + description */}
                    <span className="flex-1 min-w-0">
                      <span
                        className="block text-[13px] font-semibold leading-tight"
                        style={{ color: isActive ? ACCENT : 'rgba(255,255,255,0.85)' }}
                      >
                        {version.label}
                      </span>
                      <span
                        className="block text-[10px] leading-tight mt-0.5"
                        style={{ color: isActive ? 'rgba(52,211,153,0.65)' : 'rgba(255,255,255,0.3)' }}
                      >
                        {version.description}
                      </span>
                    </span>

                    {/* Active check */}
                    {isActive && (
                      <Check
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: ACCENT, filter: `drop-shadow(0 0 6px ${ACCENT}88)` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
