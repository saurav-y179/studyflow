import { describe, it, expect, afterAll, vi } from 'vitest';
import { realFetch as fetch } from './setup.js';

const startApp = async () => {
  vi.resetModules();
  const { default: app } = await import('../server.js');
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  return {
    server,
    url: (p) => `http://127.0.0.1:${server.address().port}${p}`,
  };
};

const running = [];

const withApp = async () => {
  const inst = await startApp();
  running.push(inst.server);
  return inst;
};

afterAll(() => {
  for (const s of running) s.close();
});

describe('API auth', () => {
  it('is open when no API key is configured (dev mode)', async () => {
    delete process.env.STUDYFLOW_API_KEY;
    const { server, url } = await withApp();
    const res = await fetch(url('/api/health'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    server.close();
  });

  describe('when STUDYFLOW_API_KEY is set', () => {
    it('rejects requests without a key', async () => {
      process.env.STUDYFLOW_API_KEY = 'secret-key-123';
      const { server, url } = await withApp();
      const res = await fetch(url('/api/health'));
      expect(res.status).toBe(401);
      server.close();
    });

    it('returns 401 — not a crash — for wrong-length keys', async () => {
      // Regression: crypto.timingSafeEqual throws on length mismatch,
      // which used to surface as a 500 instead of a clean 401.
      process.env.STUDYFLOW_API_KEY = 'secret-key-123';
      const { server, url } = await withApp();

      const short = await fetch(url('/api/health'), { headers: { 'x-api-key': 'abc' } });
      expect(short.status).toBe(401);

      const long = await fetch(url('/api/health'), {
        headers: { 'x-api-key': 'a'.repeat(200) },
      });
      expect(long.status).toBe(401);
      server.close();
    });

    it('accepts the correct key', async () => {
      process.env.STUDYFLOW_API_KEY = 'secret-key-123';
      const { server, url } = await withApp();
      const res = await fetch(url('/api/health'), { headers: { 'x-api-key': 'secret-key-123' } });
      expect(res.status).toBe(200);
      server.close();
    });

    it('rejects equal-length but wrong keys', async () => {
      process.env.STUDYFLOW_API_KEY = 'secret-key-123';
      const { server, url } = await withApp();
      const res = await fetch(url('/api/health'), { headers: { 'x-api-key': 'xxxxxx-key-123' } });
      expect(res.status).toBe(401);
      server.close();
    });
  });
});
