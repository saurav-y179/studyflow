import { describe, it, expect, vi } from 'vitest';
import './setup.js';
import { mockGet, setNetworkDown, setNetworkUp, getPostLog } from './setup.js';

// Each test gets a pristine module instance so the internal server-
// availability cache (30s TTL) never leaks between scenarios.
const loadStorage = async () => {
  vi.resetModules();
  return import('../src/utils/storage.js');
};

const seedProfile = () => {
  localStorage.setItem('studyflow_profiles', JSON.stringify([{ id: 'p1', name: 'Tester' }]));
  localStorage.setItem('studyflow_active_profile', 'p1');
};

describe('syncFromServer reconciliation', () => {
  it('merges instead of clobbering newer local entries at startup', async () => {
    const now = Date.now();
    seedProfile();
    localStorage.setItem('studyflow_entries_p1', JSON.stringify([
      { date: '2026-01-01', timestamp: now, todayTasks: [{ id: 'local-task' }] },
      { date: '2026-01-02', timestamp: now - 1000, todayTasks: [] },
    ]));

    mockGet('/api/health', { status: 'ok' });
    mockGet('/api/profiles', [{ id: 'p1', name: 'Tester' }]);
    mockGet('/api/active', { activeId: 'p1' });
    mockGet('/api/promoted/p1', []);
    mockGet('/api/entries/p1', [
      // Stale on the server — local edit must survive
      { date: '2026-01-01', timestamp: now - 5000, todayTasks: [] },
      // Fresher on the server — must win
      { date: '2026-01-02', timestamp: now + 5000, todayTasks: [{ id: 'server-task' }] },
    ]);

    const storage = await loadStorage();
    expect(await storage.syncFromServer()).toBe(true);

    const merged = JSON.parse(localStorage.getItem('studyflow_entries_p1'));
    expect(merged.find((e) => e.date === '2026-01-01').todayTasks[0].id).toBe('local-task');
    expect(merged.find((e) => e.date === '2026-01-02').todayTasks[0].id).toBe('server-task');

    // The reconciled result is pushed back so the server converges
    const pushed = getPostLog().find((op) => op.path === '/api/entries/p1');
    expect(pushed).toBeTruthy();
    const pushedDates = Object.fromEntries(pushed.data.map((e) => [e.date, e.todayTasks[0]?.id]));
    expect(pushedDates['2026-01-01']).toBe('local-task');
    expect(pushedDates['2026-01-02']).toBe('server-task');
  });

  it('returns false and leaves data untouched when the server is down', async () => {
    seedProfile();
    localStorage.setItem('studyflow_entries_p1', '[]');
    setNetworkDown();

    const storage = await loadStorage();
    expect(await storage.syncFromServer()).toBe(false);
    expect(localStorage.getItem('studyflow_entries_p1')).toBe('[]');
  });
});

describe('offline write queue', () => {
  it('queues saves made offline and flushes them when back online', async () => {
    seedProfile();
    setNetworkDown();
    localStorage.setItem('studyflow_entries_p1', '[]');

    const storage = await loadStorage();
    storage.saveEntry({ date: '2026-06-01', todayTasks: [{ id: 't1' }], timestamp: Date.now() });

    // Nothing sent while offline
    expect(getPostLog()).toHaveLength(0);
    // But local state saved
    expect(JSON.parse(localStorage.getItem('studyflow_entries_p1'))).toHaveLength(1);

    // Back online
    setNetworkUp();
    mockGet('/api/health', { status: 'ok' });
    await storage.flushPendingSync();

    const pushes = getPostLog().filter((op) => op.path === '/api/entries/p1');
    expect(pushes).toHaveLength(1);
    expect(pushes[0].data[0].todayTasks[0].id).toBe('t1');
  });

  it('coalesces rapid writes to the same endpoint (latest wins)', async () => {
    seedProfile();
    setNetworkDown();
    localStorage.setItem('studyflow_entries_p1', '[]');

    const storage = await loadStorage();
    storage.saveEntry({ date: '2026-06-01', todayTasks: [{ id: 'first' }], timestamp: Date.now() });
    storage.saveEntry({ date: '2026-06-01', todayTasks: [{ id: 'first' }, { id: 'second' }], timestamp: Date.now() + 1 });

    setNetworkUp();
    mockGet('/api/health', { status: 'ok' });
    await storage.flushPendingSync();

    const pushes = getPostLog().filter((op) => op.path === '/api/entries/p1');
    expect(pushes).toHaveLength(1); // no out-of-order race possible
    expect(pushes[0].data[0].todayTasks).toHaveLength(2);
  });
});
