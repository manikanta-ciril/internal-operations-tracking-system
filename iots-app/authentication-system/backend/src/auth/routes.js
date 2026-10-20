const { withSession, requireStage, requireCheck, requireCaptureTime } = require('../auth/session-state');
const { clientAddress, createLoginLimiter } = require('../auth/login-limiter');
const { loginUsername } = require('../auth/login-identity');
const express = require('express');
const { randomBytes, randomUUID, createHash } = require('node:crypto');
const pool = require('../database/connection');
const { verify } = require('../auth/passwords');
const { assessLocation } = require('../location/assess');
const { preparePhoto, storePhoto, photoRoot, photoDetails } = require('../evidence/photos');
const fs = require('node:fs/promises');
const path = require('node:path');
const router = express.Router();
const digest = (token) => createHash('sha256').update(token).digest('hex');
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: false, path: '/api', maxAge: 8 * 60 * 60 * 1000 };
const tokenFrom = (req) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('iots_session='))?.slice(13);
router.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.headers.origin && !['http://localhost:5174', 'http://127.0.0.1:5174'].includes(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed.' });
  next();
});
async function userData(id, activeRole, database = pool) {
  const [[employee]] = await database.execute('SELECT id,username,name FROM employees WHERE id=?', [id]);
  const [roles] = await database.execute('SELECT r.code,r.label FROM roles r JOIN employee_roles er ON er.role_code=r.code WHERE er.employee_id=? ORDER BY r.label', [id]);
  return { ...employee, email: `${employee.username}@ciril.in`, roles, activeRole };
}
const limiter = createLoginLimiter();
router.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string' || username.length > 254 || password.length > 200) return res.status(400).json({ message: 'Enter your username and password.' });
  const account = loginUsername(username);
  const finishAttempt = limiter.consume(clientAddress(req), account);
  if (!finishAttempt) return res.status(429).json({ message: 'Too many attempts. Please wait one minute.' });
  const [[employee]] = await pool.execute('SELECT * FROM employees WHERE username=?', [account]);
  const valid = await verify(password, employee?.password_hash);
  if (!employee || !valid) {
    finishAttempt(false);
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
  finishAttempt(true);
  res.cookie('iots_session', token, cookieOptions).json({ requiresLocationCheck: true });
});
router.use('/api/auth', async (req, res, next) => {
  const token = tokenFrom(req);
  if (!token) return res.status(401).json({ message: 'Please sign in.' });
  const [[session]] = await pool.execute("SELECT s.*,sl.stage,sl.location_json FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash JOIN employee_roles er ON er.employee_id=s.employee_id AND er.role_code=s.active_role WHERE s.token_hash=? AND s.expires_at>NOW() AND (sl.stage='active' OR s.created_at>NOW()-INTERVAL 5 MINUTE)", [digest(token)]);
  if (!session) return res.status(401).json({ message: 'Your session has ended. Please sign in.' });
  req.session = session;
  next();
});
router.post('/api/auth/location', async (req, res) => {
  const p = req.body?.position;
  if (!p || ![p.latitude, p.longitude, p.accuracy, p.timestamp].every(Number.isFinite) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180 || p.accuracy < 0 || Math.abs(Date.now() - p.timestamp) > 120000) return res.status(400).json({ message: 'Allow location access and obtain a fresh location reading before continuing.' });
  const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
    requireStage(session, 'pending');
    const location = { ...assessLocation(p), checkId: randomUUID(), captureAfter: Date.now() };
    const stage = location.status === 'onsite' ? 'awaiting_photo' : 'awaiting_confirmation';
    await connection.execute('UPDATE session_locations SET stage=?,location_json=?,confirmed_at=? WHERE token_hash=?', [stage, JSON.stringify(location), stage === 'awaiting_photo' ? new Date() : null, session.token_hash]);
    await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'location_checked', JSON.stringify(location)]);
    if (stage !== 'awaiting_photo') return { requiresConfirmation: true, location };
    const employee = await userData(session.employee_id, session.active_role, connection);
    return { requiresPhoto: true, employeeName: employee.name, employeeUsername: employee.username, employeeEmail: employee.email, location };
  });
  res.json(result);
});
router.post('/api/auth/location/confirm', async (req, res) => {
  if (typeof req.body?.proceed !== 'boolean') return res.status(400).json({ message: 'Choose whether to continue.' });
  const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
    requireStage(session, 'awaiting_confirmation');
    requireCheck(session.location_json, req.body.checkId);
    await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, req.body.proceed ? 'location_exception_accepted' : 'location_exception_cancelled', JSON.stringify(session.location_json)]);
    if (!req.body.proceed) {
      await connection.execute('DELETE FROM sessions WHERE token_hash=?', [session.token_hash]);
      return { cancelled: true, message: 'Sign-in cancelled. No workspace session was opened.' };
    }
    const location = { ...session.location_json, captureAfter: Date.now() };
    await connection.execute("UPDATE session_locations SET stage='awaiting_photo',location_json=?,confirmed_at=NOW() WHERE token_hash=?", [JSON.stringify(location), session.token_hash]);
    const employee = await userData(session.employee_id, session.active_role, connection);
    return { requiresPhoto: true, employeeName: employee.name, employeeUsername: employee.username, employeeEmail: employee.email, location };
  });
  if (result.cancelled) res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' });
  res.json(result);
});
router.post('/api/auth/cancel', async (req, res) => {
  await withSession(pool, req.session.token_hash, async (connection, session) => {
    if (session.stage === 'active') throw Object.assign(new Error('Use checkout to end an active session.'), { status: 409 });
    await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [session.employee_id, 'sign_in_cancelled']);
    await connection.execute('DELETE FROM sessions WHERE token_hash=?', [session.token_hash]);
  });
  res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).json({ message: 'Sign-in cancelled.' });
});
router.post('/api/auth/photo', express.raw({ type: 'image/jpeg', limit: '2mb' }), async (req, res) => {
  let buffer;
  try { buffer = await preparePhoto(req.body); }
  catch { return res.status(400).json({ message: 'The photo could not be read. Please retake it using your camera.' }); }
  let photo;
  try {
    const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
      requireStage(session, 'awaiting_photo');
      requireCheck(session.location_json, req.headers['x-location-check']);
      const capturedAt = Number(req.headers['x-captured-at']);
      requireCaptureTime(capturedAt, session.location_json);
      const employee = await userData(session.employee_id, session.active_role, connection);
      const details = photoDetails(capturedAt, session.location_json);
      photo = await storePhoto(buffer, employee, details);
      await connection.execute("UPDATE session_locations SET stage='active' WHERE token_hash=?", [session.token_hash]);
      await connection.execute('INSERT INTO photo_evidence (id,employee_id,session_hash,storage_path,file_size,sha256,captured_at) VALUES (?,?,?,?,?,?,?)', [photo.id, employee.id, session.token_hash, photo.storagePath, photo.size, photo.sha256, new Date(capturedAt)]);
      await connection.execute('INSERT INTO photo_evidence_details (photo_id,details) VALUES (?,?)', [photo.id, JSON.stringify(details)]);
      await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [employee.id, 'photo_evidence_accepted', JSON.stringify({ photoId: photo.id })]);
      return { user: { ...employee, location: session.location_json }, photoId: photo.id };
    });
    res.json(result);
  } catch (error) {
    if (photo) await fs.unlink(photo.absolutePath).catch(() => {});
    throw error;
  }
});
router.use('/api/auth', (req, res, next) => {
  if (req.session.stage !== 'active') return res.status(403).json({ message: 'Finish your location check and photo capture before opening the workspace.' });
  next();
});
router.use('/api/auth', async (req, res, next) => {
  const [[photo]] = await pool.execute('SELECT id FROM photo_evidence WHERE session_hash=?', [req.session.token_hash]);
  if (!photo) return res.status(403).json({ message: 'Please sign in again to capture your photo evidence.' });
  next();
});
router.get('/api/auth/photos/:id', async (req, res) => {
  const [[photo]] = await pool.execute('SELECT storage_path FROM photo_evidence WHERE id=? AND employee_id=?', [req.params.id, req.session.employee_id]);
  if (!photo) return res.status(404).json({ message: 'Photo not found.' });
  res.set('Content-Disposition', 'inline');
  res.set('X-Content-Type-Options', 'nosniff');
  res.sendFile(path.join(photoRoot, photo.storage_path), { dotfiles: 'allow' });
});
router.get('/api/auth/me', async (req, res) => res.json({ user: { ...await userData(req.session.employee_id, req.session.active_role), location: req.session.location_json } }));
router.post('/api/auth/role', async (req, res) => {
  const role = req.body?.role;
  if (typeof role !== 'string') return res.status(400).json({ message: 'Choose a role.' });
  const user = await userData(req.session.employee_id, req.session.active_role);
  if (!user.roles.some(r => r.code === role)) return res.status(403).json({ message: 'This role is not assigned to you.' });
  await pool.execute('UPDATE sessions SET active_role=? WHERE token_hash=?', [role, req.session.token_hash]);
  res.json({ user: { ...user, activeRole: role, location: req.session.location_json } });
});
require('../checkout/routes')(router, { pool, userData });
module.exports = router;
