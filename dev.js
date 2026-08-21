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

const waitForPort = (port, path = '/', maxWaitMs = 30000) => new Promise((resolve) => {
  const start = Date.now();
  const check = () => {
    const req = http.get(`http://localhost:${port}${path}`, (res) => {
      if (res.statusCode < 500) return resolve(true);
      retry();
    });
    req.on('error', retry);
    req.setTimeout(800, () => { req.destroy(); retry(); });

    function retry() {
      if (Date.now() - start >= maxWaitMs) return resolve(false);
      setTimeout(check, 150);
    }
  };
  check();
});

// Resolve the local Vite binary so we skip the npx resolution layer.
const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

const run = async () => {
  // Spawn both servers concurrently — Vite is the slower one to boot and
  // the frontend works even while the API is still coming up, so waiting
  // for API health before spawning Vite only delays startup.
  const server = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
  });
  pids.push(server.pid);

  server.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  const vite = spawn(process.execPath, [viteBin, '--port', String(VITE_PORT)], {
    cwd: __dirname,
    stdio: 'inherit',
  });
  pids.push(vite.pid);

  vite.on('close', (code) => {
    safeKill(server.pid);
    process.exit(code ?? 0);
  });

  const apiReady = await waitForPort(API_PORT, '/api/health');
  console.log(apiReady
    ? `Express API ready on :${API_PORT}`
    : `Express API not responding yet on :${API_PORT}`);
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
