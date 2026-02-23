const { spawn, spawnSync } = require('node:child_process');

const major = Number.parseInt(process.versions.node.split('.')[0], 10);
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';
const viteCmd = isWin ? 'npx.cmd' : 'npx';

function readArg(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

const host = readArg('--host', null);
const port = readArg('--port', '5173');
const hasHostArg = process.argv.some((arg) => arg === '--host' || arg.startsWith('--host='));

if (major >= 20) {
  // Native dev server path for supported Node versions.
  const child = spawn(viteCmd, ['vite', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
} else {
  // Compatibility mode for Node 18:
  // always perform a fresh production build, then serve dist statically.
  const hostLabel = host ?? 'all interfaces';
  console.log(
    `[dev compatibility] Node ${process.version} detected. Building then serving dist on ${hostLabel}:${port}`,
  );

  const build = spawnSync(npmCmd, ['run', 'build'], {
    stdio: 'inherit',
    env: process.env,
  });
  if (build.status && build.status !== 0) {
    process.exit(build.status);
  }

  const serverArgs = ['./scripts/serve-dist.cjs', '--port', port];
  if (hasHostArg && host) {
    serverArgs.push('--host', host);
  }

  const server = spawn('node', serverArgs, {
    stdio: 'inherit',
    env: process.env,
  });

  server.on('exit', (code) => process.exit(code ?? 0));
}
