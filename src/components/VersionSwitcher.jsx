import { Layers } from 'lucide-react';

export const VersionSwitcher = ({ onSwitchVersion, currentVersion }) => {
  const isV1 = currentVersion === 'v1';
  return (
    <button 
      onClick={() => onSwitchVersion(isV1 ? 'v2' : 'v1')}
      className="flex items-center gap-2 text-paper/80 hover:text-accent transition-colors"
      title={isV1 ? "Switch to V2 (Cinematic)" : "Switch to V1 (Editorial)"}
    >
      <Layers className="w-4 h-4" />
      <span className="text-sm font-sans uppercase tracking-wider font-bold hidden sm:block">
        {isV1 ? 'V2' : 'V1'}
      </span>
    </button>
  );
};
