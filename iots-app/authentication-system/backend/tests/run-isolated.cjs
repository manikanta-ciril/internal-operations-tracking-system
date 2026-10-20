const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const net = require('node:net');
const mysql = require('mysql2/promise');

const backend = path.resolve(__dirname, '..');
const workspace = path.resolve(backend, '../../..');
const database = 'iots_auth_fix_test';
const storage = path.join(workspace, '.local', 'auth-fix-test-uploads');
const env = { ...process.env, NODE_ENV: 'test', DB_HOST: '127.0.0.1', DB_PORT: '3307', DB_NAME: database,
  DB_USER: 'iots_dev', DB_PASSWORD: 'IotsLocalDb!2026', IOTS_EVIDENCE_ROOT: storage };
let api;
async function run(file, extra = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], { cwd: backend, env: { ...env, ...extra }, stdio: 'inherit', windowsHide: true });
    child.once('error', reject);
    child.once('exit', code => code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`)));
  });
}
async function clear(connection) {
  assert.equal(database, 'iots_auth_fix_test');
  await connection.query('USE iots_auth_fix_test');
  await connection.beginTransaction();
  try {
    for (const table of ['sessions', 'checkout_evidence', 'photo_evidence', 'login_events']) await connection.query(`DELETE FROM ${table}`);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  const resolved = path.resolve(storage);
  assert.equal(resolved, path.join(workspace, '.local', 'auth-fix-test-uploads'));
  await fs.rm(resolved, { recursive: true, force: true });
}
async function freePort() {
  const listener = net.createServer();
  await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  return String(port);
}

(async () => {
  const admin = await mysql.createConnection({ host: '127.0.0.1', port: 3307,
    user: process.env.IOTS_TEST_ADMIN_USER || 'root', password: process.env.IOTS_TEST_ADMIN_PASSWORD || 'IotsLocalRoot!2026' });
  try {
    await admin.query('CREATE DATABASE IF NOT EXISTS iots_auth_fix_test');
    await admin.query("GRANT ALL ON iots_auth_fix_test.* TO 'iots_dev'@'localhost'");
    await run(path.join(backend, 'database/seed.js'));
    await clear(admin);
    env.PORT = await freePort();
    env.IOTS_TEST_BASE_URL = `http://127.0.0.1:${env.PORT}/api/auth/`;
    await new Promise((resolve, reject) => {
      api = spawn(process.execPath, ['src/server.js'], { cwd: backend, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
      const timer = setTimeout(() => reject(new Error('Isolated API did not start.')), 10000);
      api.stdout.on('data', buffer => { if (buffer.toString().includes('IOTS API:')) { clearTimeout(timer); resolve(); } });
      api.stderr.on('data', buffer => process.stderr.write(buffer));
      api.once('error', reject);
      api.once('exit', code => { clearTimeout(timer); reject(new Error(`Isolated API exited ${code}`)); });
    });
    await run(path.join(backend, 'tests/test-security.js'));
    await run(path.join(backend, 'tests/test-transitions.cjs'));
    await run(path.join(backend, 'tests/test-auth.js'));
    await run(path.join(backend, 'tests/test-checkout.js'));
    await run(path.join(workspace, 'iots-app/authentication-system/frontend/tests/auth-regressions.cjs'));
    console.log('PASS: isolated authentication suite; manual-test database and photos were not used.');
  } finally {
    if (api && api.exitCode === null) {
      const stopped = new Promise(resolve => api.once('exit', resolve)); api.kill(); await stopped;
    }
    try { await clear(admin); } finally { await admin.end(); }
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
