import { VersionSwitcher } from '../../components/VersionSwitcher';
import { Shield } from 'lucide-react';

export const HeaderV2 = ({ user, onSwitchVersion, currentVersion }) => {
  return (
    <header className="w-full flex items-center justify-between px-6 md:px-12 py-6 relative z-50">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-[#10b981]" />
        <span className="text-xl font-bold tracking-widest uppercase text-white/90">
          StudyFlow<span className="text-[#10b981]">OS</span>
        </span>
      </div>

      <div className="flex items-center gap-8">
        <VersionSwitcher onSwitchVersion={onSwitchVersion} currentVersion={currentVersion} />
        
        <div className="flex items-center gap-3 pl-8 border-l border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#10b981] to-[#047857] flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-xs font-bold text-white uppercase">{user?.name?.charAt(0) || 'U'}</span>
          </div>
          <span className="text-sm font-medium tracking-wide text-white/70 uppercase">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};
