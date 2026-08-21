// Shared test setup: localStorage + fetch stubs for the storage layer.
import { beforeEach } from 'vitest';

class MemoryStorage {
  constructor() {
    this.map = new Map();
  }
  getItem(key) {
    return this.map.has(key) ? this.map.get(key) : null;
  }
  setItem(key, value) {
    this.map.set(String(key), String(value));
  }
  removeItem(key) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
}

global.localStorage = new MemoryStorage();

// ── Fetch stub ────────────────────────────────────────────────────────
let mockGets = new Map();
let networkDown = false;
const postLog = [];

export const mockGet = (path, body) => {
  mockGets.set(path, { ok: true, json: async () => structuredClone(body) });
};

export const setNetworkDown = () => {
  networkDown = true;
};

export const setNetworkUp = () => {
  networkDown = false;
};

export const getPostLog = () => postLog;

// Pristine fetch, captured before stubbing — used by server tests that
// need to talk to a real listening socket.
export const realFetch = globalThis.fetch.bind(globalThis);

global.fetch = async (input, init) => {
  if (networkDown) throw new Error('network unavailable');
  const path = String(input).replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  const method = (init?.method || 'GET').toUpperCase();

  if (method === 'POST') {
    postLog.push({ path, data: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({}) };
  }

  const match = mockGets.get(path);
  if (match) return match;
  return { ok: false, status: 404, json: async () => ({}) };
};

beforeEach(() => {
  localStorage.clear();
  mockGets = new Map();
  networkDown = false;
  postLog.length = 0;
});
