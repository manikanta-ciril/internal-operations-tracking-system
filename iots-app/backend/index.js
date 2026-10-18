const express = require('express');
const { randomBytes, createHash } = require('node:crypto');
const pool = require('./db');
const { verify } = require('./passwords');
const { assessLocation } = require('./location');
const { preparePhoto, storePhoto, photoRoot, photoDetails } = require('./photos');
const fs = require('node:fs/promises');
const path = require('node:path');
const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '8kb' }));
const digest = (token) => createHash('sha256').update(token).digest('hex');
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: false, path: '/api', maxAge: 8 * 60 * 60 * 1000 };
const tokenFrom = (req) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('iots_session='))?.slice(13);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.headers.origin && !['http://localhost:5174', 'http://127.0.0.1:5174'].includes(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed.' });
  next();
});
async function userData(id, activeRole) {
  const [[employee]] = await pool.execute('SELECT id,username,name FROM employees WHERE id=?', [id]);
  const [roles] = await pool.execute('SELECT r.code,r.label FROM roles r JOIN employee_roles er ON er.role_code=r.code WHERE er.employee_id=? ORDER BY r.label', [id]);
  return { ...employee, roles, activeRole };
}
const attempts = new Map();
setInterval(() => { for (const [key, value] of attempts) if (value.until < Date.now()) attempts.delete(key); }, 60000).unref();
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 80 || password.length > 200) return res.status(400).json({ message: 'Enter your username and password.' });
  const key = req.ip;
  let count = attempts.get(key);
  if (!count || count.until < Date.now()) { count = { failures: 0, until: Date.now() + 60000 }; attempts.set(key, count); }
  if (count.failures >= 10) return res.status(429).json({ message: 'Too many attempts. Please wait one minute.' });
  const [[employee]] = await pool.execute('SELECT * FROM employees WHERE username=?', [username.trim().toLowerCase()]);
  if (!employee || !verify(password, employee.password_hash)) {
    count.failures++;
    await pool.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [employee?.id || null, 'credentials_rejected']);
    return res.status(401).json({ message: 'Username or password is incorrect.' });
  }
  const user = await userData(employee.id);
  if (!user.roles.length) return res.status(403).json({ message: 'No role is assigned to this account.' });
  const activeRole = user.roles.find(r => r.code === 'general-manager')?.code || user.roles[0].code;
  const old = tokenFrom(req);
  if (old) await pool.execute('DELETE FROM sessions WHERE token_hash=?', [digest(old)]);
  const token = randomBytes(32).toString('hex');
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('INSERT INTO sessions (token_hash,employee_id,active_role,expires_at) VALUES (?,?,?,?)', [digest(token), employee.id, activeRole, new Date(Date.now() + cookieOptions.maxAge)]);
    await connection.execute('INSERT INTO session_locations (token_hash) VALUES (?)', [digest(token)]);
    await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [employee.id, 'credentials_verified']);
    await connection.commit();
  } catch (error) { await connection.rollback(); throw error; }
  finally { connection.release(); }
  attempts.delete(key);
  res.cookie('iots_session', token, cookieOptions).json({ requiresLocationCheck: true });
});
app.use('/api/auth', async (req, res, next) => {
  const token = tokenFrom(req);
  if (!token) return res.status(401).json({ message: 'Please sign in.' });
  const [[session]] = await pool.execute("SELECT s.*,sl.stage,sl.location_json FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash JOIN employee_roles er ON er.employee_id=s.employee_id AND er.role_code=s.active_role WHERE s.token_hash=? AND s.expires_at>NOW() AND (sl.stage='active' OR s.created_at>NOW()-INTERVAL 5 MINUTE)", [digest(token)]);
  if (!session) return res.status(401).json({ message: 'Your session has ended. Please sign in.' });
  req.session = session;
  next();
});
app.post('/api/auth/location', async (req, res) => {
  if (req.session.stage !== 'pending') return res.status(409).json({ message: 'This location check has already been submitted.' });
  const p = req.body?.position;
  if (!p || ![p.latitude, p.longitude, p.accuracy, p.timestamp].every(Number.isFinite) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180 || p.accuracy < 0 || Math.abs(Date.now() - p.timestamp) > 120000) return res.status(400).json({ message: 'Allow location access and obtain a fresh location reading before continuing.' });
  const location = assessLocation(req.body?.position);
  const stage = location.status === 'onsite' ? 'awaiting_photo' : 'awaiting_confirmation';
  await pool.execute('UPDATE session_locations SET stage=?,location_json=? WHERE token_hash=?', [stage, JSON.stringify(location), req.session.token_hash]);
  await pool.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [req.session.employee_id, 'location_checked', JSON.stringify(location)]);
  if (stage !== 'awaiting_photo') return res.json({ requiresConfirmation: true, location });
  const employee = await userData(req.session.employee_id, req.session.active_role);
  res.json({ requiresPhoto: true, employeeName: employee.name, location });
});
app.post('/api/auth/location/confirm', async (req, res) => {
  if (req.session.stage !== 'awaiting_confirmation') return res.status(409).json({ message: 'There is no location decision waiting.' });
  if (typeof req.body?.proceed !== 'boolean') return res.status(400).json({ message: 'Choose whether to continue.' });
  await pool.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [req.session.employee_id, req.body.proceed ? 'location_exception_accepted' : 'location_exception_cancelled', JSON.stringify(req.session.location_json)]);
  if (!req.body.proceed) {
    await pool.execute('DELETE FROM sessions WHERE token_hash=?', [req.session.token_hash]);
    return res.clearCookie('iots_session', { ...cookieOptions, maxAge: undefined }).json({ message: 'Sign-in cancelled. No workspace session was opened.' });
  }
  await pool.execute("UPDATE session_locations SET stage='awaiting_photo',confirmed_at=NOW() WHERE token_hash=?", [req.session.token_hash]);
  const employee = await userData(req.session.employee_id, req.session.active_role);
  res.json({ requiresPhoto: true, employeeName: employee.name, location: req.session.location_json });
});
app.post('/api/auth/cancel', async (req, res) => {
  await pool.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [req.session.employee_id, 'sign_in_cancelled']);
  await pool.execute('DELETE FROM sessions WHERE token_hash=?', [req.session.token_hash]);
  res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).json({ message: 'Sign-in cancelled.' });
});
app.post('/api/auth/photo', express.raw({ type: 'image/jpeg', limit: '2mb' }), async (req, res) => {
  if (req.session.stage !== 'awaiting_photo') return res.status(409).json({ message: 'Complete your credentials and location check before taking a photo.' });
  const capturedAt = Number(req.headers['x-captured-at']);
  if (!Number.isFinite(capturedAt) || Math.abs(Date.now() - capturedAt) > 120000) return res.status(400).json({ message: 'This photo has expired. Please take a new one.' });
  let buffer;
  try { buffer = await preparePhoto(req.body); }
  catch { return res.status(400).json({ message: 'The photo could not be read. Please retake it using your camera.' }); }
  const employee = await userData(req.session.employee_id, req.session.active_role);
  const details = photoDetails(capturedAt, req.session.location_json);
  const connection = await pool.getConnection();
  let photo;
  try {
    photo = await storePhoto(buffer, employee, details);
    await connection.beginTransaction();
    const [updated] = await connection.execute("UPDATE session_locations SET stage='active' WHERE token_hash=? AND stage='awaiting_photo'", [req.session.token_hash]);
    if (!updated.affectedRows) throw new Error('Session no longer waiting for a photo.');
    await connection.execute('INSERT INTO photo_evidence (id,employee_id,session_hash,storage_path,file_size,sha256,captured_at) VALUES (?,?,?,?,?,?,?)', [photo.id, employee.id, req.session.token_hash, photo.storagePath, photo.size, photo.sha256, new Date(capturedAt)]);
    await connection.execute('INSERT INTO photo_evidence_details (photo_id,details) VALUES (?,?)', [photo.id, JSON.stringify(details)]);
    await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [employee.id, 'photo_evidence_accepted', JSON.stringify({ photoId: photo.id })]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    if (photo) await fs.unlink(photo.absolutePath).catch(() => {});
    throw error;
  } finally { connection.release(); }
  res.json({ user: { ...employee, location: req.session.location_json }, photoId: photo.id });
});
app.use('/api/auth', (req, res, next) => {
  if (req.session.stage !== 'active') return res.status(403).json({ message: 'Finish your location check and photo capture before opening the workspace.' });
  next();
});
app.use('/api/auth', async (req, res, next) => {
  const [[photo]] = await pool.execute('SELECT id FROM photo_evidence WHERE session_hash=?', [req.session.token_hash]);
  if (!photo) return res.status(403).json({ message: 'Please sign in again to capture your photo evidence.' });
  next();
});
app.get('/api/auth/photos/:id', async (req, res) => {
  const [[photo]] = await pool.execute('SELECT storage_path FROM photo_evidence WHERE id=? AND employee_id=?', [req.params.id, req.session.employee_id]);
  if (!photo) return res.status(404).json({ message: 'Photo not found.' });
  res.set('Content-Disposition', 'inline');
  res.set('X-Content-Type-Options', 'nosniff');
  res.sendFile(path.join(photoRoot, photo.storage_path), { dotfiles: 'allow' });
});
app.get('/api/auth/me', async (req, res) => res.json({ user: { ...await userData(req.session.employee_id, req.session.active_role), location: req.session.location_json } }));
app.post('/api/auth/role', async (req, res) => {
  const role = req.body?.role;
  if (typeof role !== 'string') return res.status(400).json({ message: 'Choose a role.' });
  const user = await userData(req.session.employee_id, req.session.active_role);
  if (!user.roles.some(r => r.code === role)) return res.status(403).json({ message: 'This role is not assigned to you.' });
  await pool.execute('UPDATE sessions SET active_role=? WHERE token_hash=?', [role, req.session.token_hash]);
  res.json({ user: { ...user, activeRole: role, location: req.session.location_json } });
});
app.post('/api/auth/logout', async (req, res) => {
  await pool.execute('DELETE FROM sessions WHERE token_hash=?', [req.session.token_hash]);
  res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).json({ message: 'Signed out.' });
});
app.use((error, req, res, next) => {
  console.error('API error:', error.code || error.message);
  if (error.type === 'entity.too.large') return res.status(413).json({ message: 'Photo is too large. Retake it and try again.' });
  if (error.status === 404) return res.status(404).json({ message: 'Photo file not found.' });
  res.status(error.status === 400 ? 400 : 503).json({ message: error.status === 400 ? 'Invalid request.' : 'Cannot reach the login database. Check MySQL and the backend configuration.' });
});
const server = app.listen(Number(process.env.PORT || 3001), '127.0.0.1', () => console.log('IOTS API: http://127.0.0.1:' + (process.env.PORT || 3001)));
module.exports = { app, server };
