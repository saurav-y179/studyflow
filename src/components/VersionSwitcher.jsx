import { Layers, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const VersionSwitcher = ({ onSwitchVersion, currentVersion }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const versions = [
    { id: 'v3', label: 'T3', description: 'Dashboard' },
    { id: 'app', label: 'T1', description: 'Video Background' },
    { id: 'v1', label: 'T2', description: 'Editorial' },
  ];

  const currentLabel = versions.find(v => v.id === currentVersion)?.label || 'T1';

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
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
      >
        <Layers className="w-4 h-4 text-white/50" />
        <span className="text-sm font-bold text-white font-mono">
          {currentLabel}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-40 bg-[#0a0a0c]/90 backdrop-blur-xl rounded-xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-1">
              {versions.map((version) => (
                <button
                  key={version.id}
                  onClick={() => {
                    onSwitchVersion(version.id);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-3 py-2.5 flex flex-col items-start rounded-lg transition-all duration-150 text-sm ${
                    currentVersion === version.id
                      ? 'bg-[#10b981]/20 text-[#10b981]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="font-bold font-mono">{version.label}</span>
                  <span className={`text-xs ${currentVersion === version.id ? 'text-[#10b981]/70' : 'text-white/30'}`}>
                    {version.description}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
