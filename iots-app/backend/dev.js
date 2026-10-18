// One local command starts the isolated MySQL database, API, and Vite.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const mysql = require('mysql2/promise');
const root = path.resolve(__dirname, '../..');
const local = path.join(root, '.local');
const basedir = path.join(local, 'mysql-8.4.11-winx64');
const data = path.join(local, 'mysql-data');
const children = [];
let stopping = false;
let ownedDatabase;
function launch(exe, args, cwd = __dirname) {
  const child = spawn(exe, args, { cwd, stdio: 'inherit', windowsHide: true });
  children.push(child);
  child.on('error', error => { console.error(error.message); stop(1); });
  return child;
}
function run(exe, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = launch(exe, args, cwd);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Setup exited with code ${code}`)));
  });
}
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  // Ask our isolated database to shut down cleanly before ending the process tree.
  try {
    if (!ownedDatabase) throw new Error('No database started by this process.');
    const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: 'IotsLocalRoot!2026', connectTimeout: 1500 });
    await conn.query('SHUTDOWN'); await conn.end();
    if (ownedDatabase.exitCode === null) {
      await new Promise(resolve => {
        const timeout = setTimeout(resolve, 8000);
        ownedDatabase.once('exit', () => { clearTimeout(timeout); resolve(); });
      });
    }
  } catch { /* It may already have stopped. */ }
  for (const child of children) if (child.exitCode === null) child.kill();
  process.exitCode = code;
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
async function main() {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  if (!fs.existsSync(path.join(basedir, 'bin/mysqld.exe'))) throw new Error('Portable MySQL is missing. See AUTH_SETUP.md.');
  // Never take over another listener or stop an unrelated database.
  await new Promise((resolve, reject) => {
    const check = net.createServer();
    check.once('error', () => reject(new Error('Port 3307 is already in use. Stop the other IOTS dev command first.')));
    check.listen(3307, '127.0.0.1', () => check.close(resolve));
  });
  const args = [`--basedir=${basedir}`, `--datadir=${data}`];
  if (!fs.existsSync(path.join(data, 'mysql'))) {
    fs.mkdirSync(data, { recursive: true });
    await run(path.join(basedir, 'bin/mysqld.exe'), ['--no-defaults', ...args, '--initialize-insecure', '--console']);
  }
  const database = launch(path.join(basedir, 'bin/mysqld.exe'), ['--no-defaults', ...args, '--port=3307', '--bind-address=127.0.0.1', '--mysqlx=OFF', '--console']);
  ownedDatabase = database;
  let connection;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (database.exitCode !== null) throw new Error('MySQL failed to start. Check its output above.');
    try { connection = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: 'IotsLocalRoot!2026' }); break; }
    catch {
      try {
        connection = await mysql.createConnection({ host: '127.0.0.1', port: 3307, user: 'root', password: '' });
        await connection.query("ALTER USER 'root'@'localhost' IDENTIFIED BY 'IotsLocalRoot!2026'");
        break;
      } catch { await new Promise(resolve => setTimeout(resolve, 500)); }
    }
  }
  if (!connection) throw new Error('MySQL did not become ready.');
  // Dedicated database account: the API does not use the database administrator.
  await connection.query("CREATE USER IF NOT EXISTS 'iots_dev'@'localhost' IDENTIFIED BY 'IotsLocalDb!2026'");
  await connection.query('CREATE DATABASE IF NOT EXISTS iots_auth_temp');
  await connection.query("GRANT ALL ON iots_auth_temp.* TO 'iots_dev'@'localhost'");
  await connection.end();
  Object.assign(process.env, { DB_HOST: '127.0.0.1', DB_PORT: '3307', DB_USER: 'iots_dev', DB_PASSWORD: 'IotsLocalDb!2026', DB_NAME: 'iots_auth_temp', PORT: '3001' });
  await run(process.execPath, [path.join(__dirname, 'seed.js')]);
  const api = launch(process.execPath, ['--watch', path.join(__dirname, 'index.js')]);
  api.on('exit', code => { if (!stopping) stop(code || 1); });
  const vite = launch(process.execPath, [path.join(root, 'iots-app/frontend/node_modules/vite/bin/vite.js')], path.join(root, 'iots-app/frontend'));
  vite.on('exit', code => { if (!stopping) stop(code || 0); });
}
main().catch(error => { console.error(error.message); stop(1); });
