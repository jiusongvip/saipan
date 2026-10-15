// 跨平台的 env 前缀执行器：node scripts/with-env.mjs INCLUDE_DRAFTS=1 astro build
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import process from 'node:process';

const argv = process.argv.slice(2);
const env = { ...process.env };
let i = 0;
for (; i < argv.length; i += 1) {
  const token = argv[i];
  const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(token);
  if (!match) break;
  env[match[1]] = match[2];
}
const [cmd, ...rest] = argv.slice(i);
if (!cmd) {
  console.error('with-env: nothing to run');
  process.exit(2);
}

// Windows 上 node_modules/.bin/<cmd>.CMD 经 cmd.exe 解析时会被正斜杠截断成 "node_modules"，
// 因此直接用 node 跑包自身的 bin 入口；找不到才退回 .bin 壳。
function localBinEntry() {
  try {
    const pkg = JSON.parse(readFileSync(join('node_modules', cmd, 'package.json'), 'utf8'));
    const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[cmd];
    if (!bin) return null;
    return resolve(join('node_modules', cmd, bin));
  } catch {
    return null;
  }
}

const entry = localBinEntry();
const isWin = process.platform === 'win32';
const child = entry
  ? spawn(process.execPath, [entry, ...rest], { stdio: 'inherit', env })
  : spawn(isWin ? `node_modules\\.bin\\${cmd}.cmd` : `node_modules/.bin/${cmd}`, rest, { stdio: 'inherit', env, shell: isWin });

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
