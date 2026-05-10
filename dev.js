// dev.js — Starts both the Express API server and Vite dev server concurrently.
// This is the entry point for `npm run dev`.

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isWindows = process.platform === 'win32';

// Start Express API server
const server = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: isWindows,
});

// Small delay to let Express start first, then start Vite
setTimeout(() => {
  const vite = spawn('npx', ['vite'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: isWindows,
  });

  vite.on('close', (code) => {
    console.log(`\nVite exited with code ${code}`);
    server.kill();
    process.exit(code);
  });
}, 1000);

// Clean shutdown
process.on('SIGINT', () => {
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});
