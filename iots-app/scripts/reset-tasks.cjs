// Local task-data maintenance. Preview by default; --confirm applies the reset.
const path = require('node:path');
const fs = require('node:fs/promises');
const { createRequire } = require('node:module');
const backend = path.resolve(__dirname, '../core-portal/backend');
const requireBackend = createRequire(path.join(backend, 'package.json'));
requireBackend('dotenv').config({ path: path.join(backend, '.env') });
const mysql = requireBackend('mysql2/promise');
const local = path.resolve(__dirname, '../../.local');
const taskRoot = path.resolve(process.env.IOTS_TASK_ROOT || path.join(local, 'task-evidence'));
const confirmed = process.argv.includes('--confirm');
const identifier = value => '`' + value + '`';

async function main() {
  if (process.argv.slice(2).some(arg => arg !== '--confirm')) throw Error('Usage: node scripts/reset-tasks.cjs [--confirm]');
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || 'iots_dev',
    password: process.env.DB_PASSWORD || 'IotsLocalDb!2026',
    database: process.env.DB_NAME || 'iots_auth_temp',
    dateStrings: true,
  });
  let committed = false;
  try {
    await db.beginTransaction();
    const data = {};
    for (const table of ['work_tasks', 'work_task_events', 'work_files', 'work_commands', 'work_daily_reports']) {
      [data[table]] = await db.query('SELECT * FROM ' + identifier(table) + ' FOR UPDATE');
    }
    const reportText = data.work_daily_reports.map(row => JSON.stringify(row.payload)).join('\n');
    const taskFiles = data.work_files.filter(row => row.task_id !== null);
    const retained = taskFiles.filter(row => reportText.includes(row.id));
    const removable = taskFiles.filter(row => !reportText.includes(row.id));
    const commands = data.work_commands.filter(row => {
      const response = typeof row.response === 'string' ? JSON.parse(row.response) : row.response;
      return Boolean(response?.task);
    });
    const [notifications] = await db.query("SELECT * FROM employee_notifications WHERE title LIKE 'Task %' AND title NOT LIKE 'Task review delegated%' FOR UPDATE");
    // Only clear notifications containing one of the task IDs being reset.
    const ids = new Set(data.work_tasks.map(row => row.id));
    const taskNotifications = notifications.filter(row => [...ids].some(id => row.message.startsWith(id + ':')));
    console.log(JSON.stringify({ mode: confirmed ? 'reset' : 'preview', database: process.env.DB_NAME || 'iots_auth_temp', tasks: data.work_tasks.length, events: data.work_task_events.length, files: removable.length, filesKeptForReports: retained.length, commandReceipts: commands.length, notifications: taskNotifications.length, dailyReportsPreserved: data.work_daily_reports.length }, null, 2));
    if (!confirmed) {
      await db.rollback();
      console.log('Nothing changed. Add --confirm to reset these task records.');
      return;
    }
    const backup = path.join(local, 'backups', 'task-reset-' + new Date().toISOString().replace(/[:.]/g, '-'));
    await fs.mkdir(path.join(backup, 'files'), { recursive: true });
    const affected = { work_tasks: data.work_tasks, work_task_events: data.work_task_events, work_files: taskFiles, work_commands: commands, employee_notifications: taskNotifications };
    const statements = ['SET FOREIGN_KEY_CHECKS=0;', 'START TRANSACTION;'];
    for (const [table, rows] of Object.entries(affected)) {
      for (const row of rows) {
        const columns = Object.keys(row);
        statements.push('REPLACE INTO ' + identifier(table) + ' (' + columns.map(identifier).join(',') + ') VALUES (' + columns.map(key => mysql.escape(typeof row[key] === 'object' && row[key] !== null ? JSON.stringify(row[key]) : row[key])).join(',') + ');');
      }
    }
    statements.push('COMMIT;', 'SET FOREIGN_KEY_CHECKS=1;');
    await fs.writeFile(path.join(backup, 'restore.sql'), statements.join('\n'));
    await fs.writeFile(path.join(backup, 'manifest.json'), JSON.stringify({ database: process.env.DB_NAME || 'iots_auth_temp', taskRoot, affected }, null, 2));
    for (const file of removable) {
      if (!/^[a-f0-9-]{36}$/i.test(file.id)) throw Error('Unexpected stored file ID; reset cancelled.');
      const source = path.resolve(taskRoot, file.id);
      if (path.dirname(source) !== taskRoot) throw Error('Unsafe file path.');
      await fs.copyFile(source, path.join(backup, 'files', file.id));
    }
    await db.query('DELETE FROM work_task_events');
    for (const file of retained) await db.execute('UPDATE work_files SET task_id=NULL WHERE id=?', [file.id]);
    for (const file of removable) await db.execute('DELETE FROM work_files WHERE id=?', [file.id]);
    await db.query('DELETE FROM work_tasks');
    for (const command of commands) await db.execute('DELETE FROM work_commands WHERE actor_id=? AND command_key=?', [command.actor_id, command.command_key]);
    for (const notification of taskNotifications) await db.execute('DELETE FROM employee_notifications WHERE id=?', [notification.id]);
    await db.commit();
    committed = true;
    for (const file of removable) {
      await fs.unlink(path.join(taskRoot, file.id)).catch(error => console.warn('Record removed, but file cleanup needs attention:', file.id, error.code));
    }
    console.log('Task reset complete. Backup: ' + backup);
    console.log('Accounts, settings, chats, attendance and daily reports preserved. Refresh open dashboards. Browser-only archives are unchanged.');
  } catch (error) {
    if (!committed) await db.rollback();
    throw error;
  } finally {
    await db.end();
  }
}
main().catch(error => { console.error('Reset failed:', error.message); process.exitCode = 1; });
