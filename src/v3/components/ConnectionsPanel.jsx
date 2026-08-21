import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ExternalLink, Trash2, Globe, Hash, Bot, Code, Music, Video, Image, Pencil, Save, Link2, Key, RefreshCw, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

const PLATFORM_OPTIONS = [
  { id: 'github', label: 'GitHub', icon: Code, autoFetch: true, placeholder: 'username', urlPlaceholder: 'https://github.com/username' },
  { id: 'huggingface', label: 'Hugging Face', icon: Bot, autoFetch: true, placeholder: 'username', urlPlaceholder: 'https://huggingface.co/username' },
  { id: 'reddit', label: 'Reddit', icon: Hash, autoFetch: true, placeholder: 'username', urlPlaceholder: 'https://reddit.com/u/username' },
  { id: 'twitter', label: 'X / Twitter', icon: Hash, autoFetch: false, placeholder: '@handle', urlPlaceholder: 'https://x.com/handle' },
  { id: 'youtube', label: 'YouTube', icon: Video, autoFetch: false, placeholder: 'Channel name', urlPlaceholder: 'https://youtube.com/@channel' },
  { id: 'instagram', label: 'Instagram', icon: Image, autoFetch: false, placeholder: 'username', urlPlaceholder: 'https://instagram.com/username' },
  { id: 'spotify', label: 'Spotify', icon: Music, autoFetch: false, placeholder: 'Playlist/Artist', urlPlaceholder: 'https://open.spotify.com/...' },
  { id: 'custom', label: 'Custom', icon: Globe, autoFetch: false, placeholder: 'Label', urlPlaceholder: 'https://...' },
];

const PLATFORM_COLORS = {
  github: '#6e40c9',
  huggingface: '#FFD21E',
  reddit: '#FF4500',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  instagram: '#E4405F',
  spotify: '#1DB954',
  custom: '#60a5fa',
};

const PLATFORM_STATS_CONFIG = {
  github: [
    { key: 'followers', label: 'Followers' },
    { key: 'publicRepos', label: 'Repos' },
    { key: 'totalStars', label: 'Stars' },
    { key: 'totalForks', label: 'Forks' },
  ],
  huggingface: [
    { key: 'models', label: 'Models' },
    { key: 'downloads', label: 'Downloads' },
    { key: 'likes', label: 'Likes' },
  ],
  reddit: [
    { key: 'linkKarma', label: 'Link Karma' },
    { key: 'commentKarma', label: 'Comment Karma' },
    { key: 'totalKarma', label: 'Total Karma' },
  ],
};

const ConnectionModal = ({ onClose, onSave, existing }) => {
  const isEdit = !!existing;
  const [platform, setPlatform] = useState(existing?.platform || 'github');
  const [label, setLabel] = useState(existing?.label || '');
  const [metaUrl, setMetaUrl] = useState(existing?.meta?.url || '');
  const [username, setUsername] = useState(existing?.meta?.username || '');
  const [apiKey, setApiKey] = useState(existing?.credentials?.apiKey || '');

  const platformConfig = PLATFORM_OPTIONS.find(p => p.id === platform) || PLATFORM_OPTIONS[PLATFORM_OPTIONS.length - 1];

  const handlePlatformChange = (id) => {
    setPlatform(id);
    if (!isEdit) {
      const cfg = PLATFORM_OPTIONS.find(p => p.id === id);
      setLabel(cfg?.label || '');
      setUsername('');
      setMetaUrl('');
    }
  };

  const handleSave = () => {
    if (!label.trim()) return;
    const credentials = apiKey.trim() ? { apiKey: apiKey.trim() } : {};
    const meta = {};
    if (metaUrl.trim()) meta.url = metaUrl.trim();
    if (username.trim()) meta.username = username.trim();
    // Auto-detect username from URL if not provided
    if (!username.trim() && metaUrl.trim()) {
      const url = metaUrl.trim().replace(/\/+$/, '');
      const parts = url.split('/');
      if (parts.length > 0) meta.username = parts[parts.length - 1];
    }

    const result = {
      ...(isEdit ? { id: existing.id } : {}),
      platform,
      label: label.trim(),
      meta: Object.keys(meta).length > 0 ? meta : undefined,
      credentials: Object.keys(credentials).length > 0 ? credentials : undefined,
    };
    onSave(result);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg-solid)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="text-white font-bold text-sm tracking-wide">{isEdit ? 'Edit Connection' : 'Add Connection'}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Platform selector */}
          <div>
            <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-2 block">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {PLATFORM_OPTIONS.map((p) => {
                const Icon = p.icon;
                const active = platform === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePlatformChange(p.id)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all cursor-pointer"
                    style={{
                      background: active ? `${PLATFORM_COLORS[p.id]}20` : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${active ? PLATFORM_COLORS[p.id] : 'transparent'}`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: PLATFORM_COLORS[p.id] }} />
                    <span className="text-[9px] font-medium text-white/70">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-1.5 block">Display Name</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={platformConfig.placeholder || 'My Account'}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors"
            />
          </div>

          {/* Username (for auto-fetch platforms) */}
          {platformConfig.autoFetch && (
            <div>
              <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-1.5 block">
                Username <span className="text-white/30">(for live stats)</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={platformConfig.placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors font-mono"
              />
              <p className="text-[9px] text-white/30 mt-1.5">
                {platform === 'github' && 'Your GitHub username (e.g., "torvalds")'}
                {platform === 'huggingface' && 'Your HuggingFace username (e.g., "google")'}
                {platform === 'reddit' && 'Your Reddit username (e.g., "spez")'}
              </p>
            </div>
          )}

          {/* Profile URL */}
          <div>
            <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-1.5 block">Profile URL (optional)</label>
            <input
              type="text"
              value={metaUrl}
              onChange={(e) => setMetaUrl(e.target.value)}
              placeholder={platformConfig.urlPlaceholder}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors"
            />
          </div>

          {/* API Key */}
          <div>
            <label className="text-micro font-bold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3 h-3" /> API Key / Token (optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={platform === 'github' ? 'ghp_...' : platform === 'huggingface' ? 'hf_...' : 'API key or token'}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#ef4444]/50 transition-colors font-mono"
            />
            <p className="text-[9px] text-white/30 mt-1.5">
              {platformConfig.autoFetch
                ? 'Optional. Enables access to private data and higher rate limits.'
                : 'Stored locally. Used for API access if needed.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!label.trim()}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-40 transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2EE6D8, #1CC9B8)', color: '#0B0E14', boxShadow: '0 4px 14px rgba(46,230,216,0.3)' }}
          >
            <Save className="w-4 h-4" /> {isEdit ? 'Save' : 'Add Connection'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Connection Card ────────────────────────────────────────────────
const formatTimeSince = (ts) => {
  if (!ts) return null;
  const now = Date.now();
  const mins = Math.floor((now - ts) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const ConnectionCard = ({ conn, color, onRefresh, onEdit, onRemove }) => {
  const platformInfo = PLATFORM_OPTIONS.find(p => p.id === conn.platform) || PLATFORM_OPTIONS[PLATFORM_OPTIONS.length - 1];
  const Icon = platformInfo.icon;
  const statsConfig = PLATFORM_STATS_CONFIG[conn.platform] || [];
  const isRefreshing = conn._refreshing;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--card-bg)] backdrop-blur-[16px] border-[var(--card-border)] rounded-[20px] p-5 group"
      whileHover={{ borderColor: `${color}33`, transition: { duration: 0.2 } }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}15` }}>
            <Icon className="w-[20px] h-[20px]" style={{ color }} />
            <div className="absolute inset-0 rounded-xl" style={{ background: `radial-gradient(circle at center, ${color}22, transparent)`, filter: 'blur(6px)' }} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">{conn.label}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              {conn.meta?.url ? (
                <a href={conn.meta.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-micro hover:underline transition-colors" style={{ color: `${color}99` }}>
                  <ExternalLink className="w-3 h-3" /> View profile
                </a>
              ) : conn.meta?.username ? (
                <span className="text-micro" style={{ color: `${color}99` }}>{conn.meta.username}</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: conn.fetchError ? '#fbbf24' : '#4ADE80', boxShadow: conn.fetchError ? '0 0 4px rgba(251,191,36,0.4)' : '0 0 4px rgba(74,222,128,0.4)' }} />
                  <span className="text-micro text-white/30">{conn.fetchError ? 'Error' : 'Connected'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {platformInfo.autoFetch && (
            <button
              onClick={() => onRefresh(conn.id)}
              disabled={isRefreshing}
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 cursor-pointer disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: `${color}99` }} />
            </button>
          )}
          <button
            onClick={() => onEdit(conn)}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" style={{ color: `${color}99` }} />
          </button>
          <button
            onClick={() => onRemove(conn.id)}
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400/70 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Stats display */}
      {statsConfig.length > 0 && conn.stats && !conn.fetchError && (
        <div className="grid grid-cols-3 gap-3 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {statsConfig.map(s => (
            <div key={s.key} className="text-center">
              <AnimatedCounter
                value={typeof conn.stats[s.key] === 'number' ? conn.stats[s.key] : parseInt(conn.stats[s.key]) || 0}
                className="text-lg font-bold"
                style={{ color }}
                duration={1500}
              />
              <p className="text-micro text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isRefreshing && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color }} />
          <span className="text-xs text-white/50">Fetching stats...</span>
        </div>
      )}

      {/* Error state */}
      {conn.fetchError && !isRefreshing && (
        <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <AlertTriangle className="w-4 h-4 text-yellow-500/70 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-yellow-500/80 truncate">{conn.fetchError}</p>
            {conn.meta?.username && (
              <p className="text-micro text-white/30 mt-0.5">Check that "{conn.meta.username}" is a valid {conn.label} username</p>
            )}
          </div>
        </div>
      )}

      {/* No stats yet for auto-fetch platforms */}
      {statsConfig.length > 0 && !conn.stats && !conn.fetchError && !isRefreshing && (
        <div className="flex items-center justify-center gap-2 mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => onRefresh(conn.id)}
            className="flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
            style={{ color: `${color}99` }}
          >
            <RefreshCw className="w-3.5 h-3.5" /> Fetch stats now
          </button>
        </div>
      )}

      {/* Last fetched */}
      {conn.lastFetched && (
        <div className="flex items-center gap-1 mt-2">
          <Clock className="w-3 h-3 text-white/20" />
          <span className="text-[9px] text-white/20">Updated {formatTimeSince(conn.lastFetched)}</span>
        </div>
      )}
    </motion.div>
  );
};

// ── Main Panel ─────────────────────────────────────────────────────
export const ConnectionsPanel = ({ connections, onSave, onRemove, onRefreshStats }) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshingIds, setRefreshingIds] = useState(new Set());

  const handleAdd = (data) => {
    onSave(data);
    setShowModal(false);
  };

  const handleEdit = (data) => {
    onSave(data);
    setEditing(null);
  };

  const handleRefresh = async (connId) => {
    setRefreshingIds(prev => new Set([...prev, connId]));
    if (onRefreshStats) {
      await onRefreshStats(connId);
    }
    setRefreshingIds(prev => {
      const next = new Set(prev);
      next.delete(connId);
      return next;
    });
  };

  const supportedCount = connections.filter(c =>
    PLATFORM_OPTIONS.find(p => p.id === c.platform)?.autoFetch
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">External Connections</h2>
          <p className="text-xs text-white/50 mt-0.5">
            {supportedCount > 0
              ? `${supportedCount} platform${supportedCount === 1 ? '' : 's'} with live stats`
              : 'Link your platforms to showcase stats here'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90 cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #2EE6D8, #1CC9B8)', color: '#0B0E14', boxShadow: '0 4px 14px rgba(46,230,216,0.3)' }}
        >
          <Plus className="w-4 h-4" /> Connect
        </button>
      </div>

      {connections.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}
        >
          <Link2 className="w-14 h-14 mb-4" style={{ color: 'rgba(255,255,255,0.1)' }} />
          <p className="text-sm text-white/40 text-center max-w-xs font-medium">
            No external connections yet.
          </p>
          <p className="text-xs text-white/30 text-center mt-1 max-w-xs">
            Connect GitHub, Hugging Face, or Reddit to auto-fetch your stats.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-5 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #2EE6D8, #1CC9B8)', color: '#0B0E14', boxShadow: '0 4px 14px rgba(46,230,216,0.3)' }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Connection
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {connections.map((conn) => {
            const color = PLATFORM_COLORS[conn.platform] || '#60a5fa';
            return (
              <ConnectionCard
                key={conn.id}
                conn={{ ...conn, _refreshing: refreshingIds.has(conn.id) }}
                color={color}
                onRefresh={handleRefresh}
                onEdit={setEditing}
                onRemove={onRemove}
              />
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <ConnectionModal
            onClose={() => setShowModal(false)}
            onSave={handleAdd}
          />
        )}
        {editing && (
          <ConnectionModal
            key={editing.id}
            existing={editing}
            onClose={() => setEditing(null)}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
