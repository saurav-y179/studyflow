import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import './setup.js';

import {
  mergeEntries,
  calculateStreak,
  calculateMomentum,
  getCompletionPercentage,
  isDayComplete,
  canEditTask,
  createTask,
  buildPlannedTask,
  formatDate,
  addDaysDateStr,
  getToday,
} from '../src/utils/storage.js';

const day = (offset) => formatDate(new Date(Date.now() + offset * 86400000));

describe('mergeEntries', () => {
  it('keeps the server entry when no local entry exists for a date', () => {
    const server = [{ date: '2026-01-01', timestamp: 100, todayTasks: [] }];
    const merged = mergeEntries([], server);
    expect(merged).toHaveLength(1);
    expect(merged[0].timestamp).toBe(100);
  });

  it('keeps newer local edits over older server data', () => {
    const local = [{ date: '2026-01-01', timestamp: 200, todayTasks: [{ id: 'a' }] }];
    const server = [{ date: '2026-01-01', timestamp: 100, todayTasks: [] }];
    const merged = mergeEntries(local, server);
    expect(merged[0].timestamp).toBe(200);
    expect(merged[0].todayTasks).toHaveLength(1);
  });

  it('takes newer server data over stale local data', () => {
    const local = [{ date: '2026-01-01', timestamp: 50, todayTasks: [] }];
    const server = [{ date: '2026-01-01', timestamp: 500, todayTasks: [{ id: 'b' }] }];
    const merged = mergeEntries(local, server);
    expect(merged[0].timestamp).toBe(500);
    expect(merged[0].todayTasks).toHaveLength(1);
  });

  it('prefers local on equal timestamps', () => {
    const local = [{ date: '2026-01-01', timestamp: 100, todayTasks: [{ id: 'local' }] }];
    const server = [{ date: '2026-01-01', timestamp: 100, todayTasks: [{ id: 'server' }] }];
    const merged = mergeEntries(local, server);
    expect(merged[0].todayTasks[0].id).toBe('local');
  });

  it('unions dates from both sides and sorts chronologically', () => {
    const local = [
      { date: '2026-01-03', timestamp: 1, todayTasks: [] },
      { date: '2026-01-05', timestamp: 9, todayTasks: [] },
    ];
    const server = [
      { date: '2026-01-01', timestamp: 2, todayTasks: [] },
      { date: '2026-01-03', timestamp: 8, todayTasks: [] },
    ];
    const merged = mergeEntries(local, server);
    expect(merged.map((e) => e.date)).toEqual(['2026-01-01', '2026-01-03', '2026-01-05']);
    // Jan 3: server is newer
    expect(merged.find((e) => e.date === '2026-01-03').timestamp).toBe(8);
  });
});

describe('calculateStreak', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns zeros for empty input', () => {
    expect(calculateStreak([])).toEqual({ current: 0, longest: 0 });
    expect(calculateStreak(null)).toEqual({ current: 0, longest: 0 });
  });

  it('counts consecutive complete days including yesterday grace', () => {
    const entries = [-2, -1].map((o) => ({
      date: day(o),
      todayTasks: [
        { completed: true },
        { completed: true },
      ],
    }));
    const { current } = calculateStreak(entries);
    expect(current).toBe(2); // today not yet done, but yesterday keeps streak alive
  });

  it('breaks current streak on gaps but keeps longest', () => {
    const entries = [-5, -4, -3, -1].map((o) => ({
      date: day(o),
      todayTasks: [{ completed: true }],
    }));
    const { current, longest } = calculateStreak(entries);
    expect(current).toBe(1); // only yesterday
    expect(longest).toBe(3);
  });

  it('does not count days below completion threshold', () => {
    const entries = [{
      date: day(-1),
      todayTasks: [{ completed: true }, { completed: false }, { completed: false }, { completed: false }, { completed: false }],
    }];
    expect(calculateStreak(entries).current).toBe(0);
  });
});

describe('completion helpers', () => {
  it('computes percentage correctly', () => {
    const entry = { todayTasks: [{ completed: true }, { completed: true }, { completed: false }, { completed: false }] };
    expect(getCompletionPercentage(entry)).toBe(50);
    expect(getCompletionPercentage({ todayTasks: [] })).toBe(0);
    expect(getCompletionPercentage(null)).toBe(0);
  });

  it('enforces the 80% day-completion threshold', () => {
    const fourOfFive = { todayTasks: Array.from({ length: 5 }, (_, i) => ({ completed: i < 4 })) };
    const threeOfFive = { todayTasks: Array.from({ length: 5 }, (_, i) => ({ completed: i < 3 })) };
    expect(isDayComplete(fourOfFive)).toBe(true);
    expect(isDayComplete(threeOfFive)).toBe(false);
  });
});

describe('momentum', () => {
  it('scales to 30-day max with color bands', () => {
    expect(calculateMomentum(0).momentum).toBe(0);
    expect(calculateMomentum(15).color).toBe('#0099D4');
    expect(calculateMomentum(20).color).toBe('#AAFF00');
    expect(calculateMomentum(45)).toEqual({ momentum: 100, color: '#AAFF00' });
  });
});

describe('time-lock rules (canEditTask)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-10T12:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows editing tasks added today', () => {
    const task = { date: getToday(), createdAt: new Date().toISOString(), source: 'added_today' };
    expect(canEditTask(task)).toMatchObject({ canEdit: true, reason: 'added_today' });
  });

  it('locks planned tasks from toggling-off but allows completing', () => {
    const task = createTask('study math', getToday());
    const planned = buildPlannedTask(task, getToday());
    expect(planned.source).toBe('planned');
    expect(planned.id.startsWith('planned-')).toBe(true);
    expect(canEditTask(planned)).toMatchObject({ canEdit: false, canToggle: true });
  });

  it('permits planning tomorrow without completing', () => {
    const tomorrow = addDaysDateStr(getToday(), 1);
    const task = createTask('plan ahead', tomorrow);
    expect(canEditTask(task)).toMatchObject({ canEdit: true, reason: 'planning_phase', canToggle: false });
  });

  it('fully locks past tasks', () => {
    const task = { date: addDaysDateStr(getToday(), -2), createdAt: new Date().toISOString(), source: 'added_today' };
    expect(canEditTask(task)).toMatchObject({ canEdit: false, reason: 'past_date', canToggle: false });
  });

  it('rejects tasks beyond tomorrow', () => {
    const task = { date: addDaysDateStr(getToday(), 3), createdAt: new Date().toISOString(), source: 'added_today' };
    expect(canEditTask(task)).toMatchObject({ canEdit: false, reason: 'future_date', canToggle: false });
  });
});
