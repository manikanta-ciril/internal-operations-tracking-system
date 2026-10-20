// Keep subsystem dependency trees independent so future systems can be added separately.
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const npm = process.env.npm_execpath;
if (!npm) throw new Error('Run this script using npm run setup.');
for (const area of ['backend', 'frontend']) {
  const cwd = path.resolve(__dirname, '../authentication-system', area);
  const result = spawnSync(process.execPath, [npm, 'ci'], { cwd, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}
