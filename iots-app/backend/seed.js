require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
const { hash } = require('./passwords');
const roles = [
  ['chairman', 'Chairman'], ['senior-manager', 'Senior Manager'],
  ['general-manager', 'General Manager'], ['executive', 'Executive'],
  ['lead-manager', 'Lead Manager / Operations Manager'],
  ['business-development-executive', 'Business Development Executive'],
  ['creative-communication-executive', 'Creative Communication Executive'],
  ['creative-communication-associate', 'Creative Communication Associate'],
  ['it-system-analyst', 'IT System Analyst'], ['super-admin', 'Super Admin'], ['admin', 'Admin'],
];
const people = [
  ['vijay', 'Vijay Sarathi', ['chairman']],
  ['ipsheeta', 'Ipsheeta Barua', ['general-manager', 'senior-manager', 'executive']],
  ['manasa', 'Manasa B.', ['lead-manager']],
  ['bhavani', 'Bhavani Maddela', ['business-development-executive']],
  ['harshitha', 'Harshitha Goud', ['creative-communication-executive']],
  ['deepthi', 'Sai Deepthi', ['creative-communication-associate']],
  ['kanna', 'Kanna Praneeth Thogati', ['it-system-analyst']],
  ['manikanta', 'Deva Manikanta Sala', ['it-system-analyst']],
  ['superadmin', 'Super Admin (test account)', ['super-admin']],
  ['admin', 'Admin (test account)', ['admin']],
];
async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });
  try {
    await connection.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
    await connection.beginTransaction();
    for (const [code, label] of roles) {
      await connection.execute('INSERT IGNORE INTO roles (code,label) VALUES (?,?)', [code, label]);
    }
    for (const [username, name, assigned] of people) {
      await connection.execute('INSERT IGNORE INTO employees (username,name,password_hash) VALUES (?,?,?)', [username, name, hash('Iots@123')]);
      const [[employee]] = await connection.execute('SELECT id FROM employees WHERE username=?', [username]);
      for (const role of assigned) await connection.execute('INSERT IGNORE INTO employee_roles VALUES (?,?)', [employee.id, role]);
    }
    await connection.commit();
    console.log('Temporary database ready: 10 accounts, 11 roles. See AUTH_SETUP.md for credentials. Existing passwords are preserved.');
  } catch (error) { await connection.rollback(); throw error; }
  finally { await connection.end(); }
}
seed().catch((error) => { console.error('Database setup failed:', error.message); process.exitCode = 1; });
