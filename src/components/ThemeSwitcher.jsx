import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';

const themes = [
  { id: 'editorial', label: 'Editorial' },
  { id: 'midnight', label: 'Midnight' },
  { id: 'forest', label: 'Forest' },
  { id: 'cyberpunk', label: 'Cyberpunk' },
];

export const ThemeSwitcher = () => {
  const [currentTheme, setCurrentTheme] = useState('editorial');

  useEffect(() => {
    const saved = localStorage.getItem('studyflow-theme') || 'editorial';
    setCurrentTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex].id;
    setCurrentTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('studyflow-theme', nextTheme);
  };

  return (
    <button 
      onClick={cycleTheme}
      className="flex items-center gap-2 text-paper/80 hover:text-paper transition-colors"
      title={`Current Theme: ${themes.find(t => t.id === currentTheme)?.label}`}
    >
      <Palette className="w-4 h-4" />
      <span className="text-sm font-sans uppercase tracking-wider font-bold hidden sm:block">
        Theme
      </span>
    </button>
  );
};
