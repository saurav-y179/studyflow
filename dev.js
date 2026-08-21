import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isWindows = process.platform === 'win32';

const API_PORT = 3001;
const VITE_PORT = 5173;

const pids = [];

const safeKill = (pid) => {
  try {
    if (isWindows) {
      spawn('taskkill', ['/PID', String(pid), '/F'], { stdio: 'ignore' });
    } else {
      process.kill(pid, 'SIGTERM');
    }
  } catch { /* process may have already exited */ }
};

const waitForPort = (port, maxWaitMs = 30000) => new Promise((resolve) => {
  const start = Date.now();
  const check = () => {
    const req = http.get(`http://localhost:${port}/api/health`, (res) => {
      if (res.statusCode === 200) return resolve(true);
      retry();
    });
    req.on('error', retry);
    req.setTimeout(2000, () => { req.destroy(); retry(); });

    function retry() {
      if (Date.now() - start >= maxWaitMs) return resolve(false);
      setTimeout(check, 300);
    }
  };
  check();
});

const run = async () => {
  const server = spawn('node', ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: isWindows,
  });
  pids.push(server.pid);

  server.on('exit', (code) => {
    process.exit(code);
  });

  const apiReady = await waitForPort(API_PORT);
  if (!apiReady) {
    console.error('Express API server failed to start.');
    process.exit(1);
  }
  console.log(`Express API ready on :${API_PORT}`);

  const vite = spawn('npx', ['vite', '--port', String(VITE_PORT)], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: isWindows,
  });
  pids.push(vite.pid);

  vite.on('close', (code) => {
    server.kill();
    process.exit(code);
  });
};

run();

process.on('SIGINT', () => {
  pids.forEach(safeKill);
  process.exit(0);
});

process.on('SIGTERM', () => {
  pids.forEach(safeKill);
  process.exit(0);
});

process.on('exit', () => {
  pids.forEach(safeKill);
});
