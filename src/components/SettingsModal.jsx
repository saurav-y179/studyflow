import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, X, Plus, Users } from 'lucide-react';
import { getProfiles, switchProfile, createNewProfile } from '../utils/storage';

export const SettingsModal = ({ user, onSave, onClose }) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [goal, setGoal] = useState(user?.dailyGoal || '4');
  const [profiles] = useState(() => getProfiles());
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({ ...user, name: name.trim(), email: email.trim(), dailyGoal: goal });
    }
  };

  const handleSwitchProfile = (profileId) => {
    switchProfile(profileId);
    window.location.reload();
  };

  const handleCreateNewProfile = () => {
    createNewProfile();
    window.location.reload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
      exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(2, 6, 18, 0.92)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        initial={{ scale: 0.94, opacity: 0, y: 24, filter: 'blur(6px)' }}
        animate={{ scale: 1, opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ scale: 0.96, opacity: 0, y: 18, filter: 'blur(4px)' }}
        transition={{ type: 'spring', stiffness: 420, damping: 34, mass: 0.75 }}
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(8, 12, 30, 0.85) 50%, rgba(14, 165, 233, 0.05) 100%)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 30px rgba(14, 165, 233, 0.04), 0 16px 48px rgba(0,0,0,0.6), 0 0 80px rgba(14, 165, 233, 0.08)',
          backdropFilter: 'blur(32px) saturate(1.6)',
        }}
      >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(14, 165, 233, 0.08)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(14, 165, 233, 0.08)'}
          >
            <X className="w-4 h-4" style={{ color: '#7dd3fc' }} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div
              className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(14, 165, 233, 0.15)' }}
            >
              <Settings className="w-6 h-6" style={{ color: '#38bdf8' }} />
              <div
                className="absolute inset-0 rounded-2xl animate-pulse-glow"
                style={{ background: 'rgba(14, 165, 233, 0.1)' }}
              />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#f0f9ff' }}>
                Settings
              </h1>
              <p className="text-sm mt-0.5" style={{ color: '#7dd3fc' }}>
                Update your personal details
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#bae6fd' }}>
                Your Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: 'rgba(8, 12, 30, 0.6)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  color: '#f0f9ff',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#bae6fd' }}>
                Email <span style={{ color: '#64748b' }}>(optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: 'rgba(8, 12, 30, 0.6)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  color: '#f0f9ff',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#bae6fd' }}>
                Daily Study Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: 'rgba(8, 12, 30, 0.6)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                  color: '#f0f9ff',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
                color: '#020617',
                boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 30px rgba(14, 165, 233, 0.45)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(14, 165, 233, 0.3)'}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </form>

          {/* Profile Switcher Section */}
          <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid rgba(14, 165, 233, 0.15)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4" style={{ color: '#7dd3fc' }} />
              <h3 className="text-sm font-medium" style={{ color: '#bae6fd' }}>Switch Profile</h3>
            </div>

            <div className="space-y-2">
              {profiles.map(p => (
                <button
                  key={p.id}
                  onClick={() => handleSwitchProfile(p.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200"
                  style={{
                    background: p.id === user.id ? 'rgba(14, 165, 233, 0.1)' : 'rgba(8, 12, 30, 0.5)',
                    border: p.id === user.id ? '1px solid rgba(14, 165, 233, 0.4)' : '1px solid rgba(14, 165, 233, 0.1)',
                    color: p.id === user.id ? '#f0f9ff' : '#94a3b8',
                  }}
                  onMouseEnter={e => {
                    if (p.id !== user.id) {
                      e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                      e.currentTarget.style.color = '#e2e8f0';
                    }
                  }}
                  onMouseLeave={e => {
                    if (p.id !== user.id) {
                      e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.1)';
                      e.currentTarget.style.color = '#94a3b8';
                    }
                  }}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs opacity-70">{p.email || 'No email'}</span>
                  </div>
                  {p.id === user.id && (
                    <span
                      className="text-xs px-2 py-1 rounded-md font-medium"
                      style={{ background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8' }}
                    >
                      Active
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleCreateNewProfile}
                className="w-full mt-2 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                style={{
                  border: '1px dashed rgba(14, 165, 233, 0.2)',
                  color: '#7dd3fc',
                  background: 'transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.4)';
                  e.currentTarget.style.color = '#bae6fd';
                  e.currentTarget.style.background = 'rgba(14, 165, 233, 0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.2)';
                  e.currentTarget.style.color = '#7dd3fc';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Plus className="w-4 h-4" />
                Create New Profile
              </button>
            </div>
          </div>
      </motion.div>
    </motion.div>
  );
};
