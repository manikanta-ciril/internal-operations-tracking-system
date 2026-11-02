const { requireNotPunchedOut, requireSignInLocation } = require('./workday');
const { openTodayPunch, requireSessionPunch, startRemote } = require('./attendance');
const { withSession, requireStage, requireCheck, requireCaptureTime } = require('../auth/session-state');
const { clientAddress, createLoginLimiter } = require('../auth/login-limiter');
const { loginUsername } = require('../auth/login-identity');
const express = require('express');
const { randomUUID, createHash } = require('node:crypto');
const pool = require('../database/connection');
const { verify } = require('../auth/passwords');
const { assessLocation } = require('../location/assess');
const { preparePhoto, storePhoto, photoRoot, photoDetails } = require('../evidence/photos');
const fs = require('node:fs/promises');
const path = require('node:path');
const router = express.Router();
const { organisationPolicy } = require('../workspace/organisation');
const digest = (token) => createHash('sha256').update(token).digest('hex');
const cookieOptions = { httpOnly: true, sameSite: 'strict', secure: false, path: '/api', maxAge: 12 * 60 * 60 * 1000 };
const tokenFrom = (req) => (req.headers.cookie || '').split(';').map(x => x.trim()).find(x => x.startsWith('iots_session='))?.slice(13);
router.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.headers.origin && !require('../config/origins').has(req.headers.origin)) return res.status(403).json({ message: 'Origin not allowed.' });
  next();
});
async function userData(id, activeRole, database = pool) {
  const [[employee]] = await database.execute('SELECT id,username,name,gender FROM employees WHERE id=?', [id]);
  const [roles] = await database.execute('SELECT r.code,r.label FROM roles r JOIN employee_roles er ON er.role_code=r.code WHERE er.employee_id=? ORDER BY r.label', [id]);
  return { ...employee, email: `${employee.username}@ciril.in`, roles, activeRole, organisation: organisationPolicy(activeRole) };
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
  finishAttempt(true);
  const user = await userData(employee.id);
  if (!user.roles.length) return res.status(403).json({ message: 'No role is assigned to this account.' });
  const activeRole = user.roles.find(r => r.code === 'general-manager')?.code || user.roles[0].code;
  const result = await require('./session-choice').beginSignIn(pool, employee, activeRole, req.headers['user-agent']);
  if (result.token) res.cookie('iots_session', result.token, cookieOptions).json({ requiresLocationCheck: true });
  else res.json(result);
});
require('./session-choice').registerSessionChoice(router, { pool, cookieOptions });
router.use('/api/auth', async (req, res, next) => {
  const token = tokenFrom(req);
  if (!token) return res.status(401).json({ message: 'Please sign in.' });
  const [[session]] = await pool.execute("SELECT s.*,sl.stage,sl.location_json FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash JOIN employee_roles er ON er.employee_id=s.employee_id AND er.role_code=s.active_role WHERE s.token_hash=? AND s.expires_at>NOW() AND (sl.stage='active' OR s.created_at>NOW()-INTERVAL 5 MINUTE)", [digest(token)]);
  if (!session) return res.status(401).json({ message: 'Your session has ended. Please sign in.' });
  if (session.stage === 'active') {
    try {
      await requireNotPunchedOut(pool, session.employee_id);
      await requireSignInLocation(pool, session.employee_id, session.location_json);
    } catch (error) {
      if (error.status !== 403) throw error;
      await withSession(pool, session.token_hash, async (connection, current) => {
        await connection.execute('UPDATE remote_work_sessions SET ended_at=LEAST(NOW(3),expires_at) WHERE session_hash=? AND ended_at IS NULL', [current.token_hash]);
        await connection.execute('DELETE FROM sessions WHERE token_hash=?', [current.token_hash]);
      });
      return res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).status(403).json({ message: error.message });
    }
  }
  req.session = session;
  next();
});
router.post('/api/auth/location', async (req, res) => {
  const p = req.body?.position;
  if (!p || ![p.latitude, p.longitude, p.timestamp].every(Number.isFinite) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180 || Math.abs(Date.now() - p.timestamp) > 120000) return res.status(400).json({ message: 'Allow location access and obtain a fresh location reading before continuing.' });
  const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
    requireStage(session, 'pending');
    const location = { ...assessLocation(p), checkId: randomUUID(), captureAfter: Date.now() };
    try {
      await requireNotPunchedOut(connection, session.employee_id);
      await requireSignInLocation(connection, session.employee_id, location);
    } catch (error) {
      if (error.status !== 403) throw error;
      await connection.execute('DELETE FROM sessions WHERE token_hash=?', [session.token_hash]);
      await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [session.employee_id, 'location_rejected']);
      return { blocked: true, message: error.message };
    }
    const existing = await openTodayPunch(connection, session.employee_id);
    if (existing) location.punchInPhotoId = existing.id;
    const needsConfirmation = location.status === 'offsite';
    await connection.execute("UPDATE session_locations SET stage=?,location_json=?,confirmed_at=? WHERE token_hash=?", [needsConfirmation ? 'awaiting_confirmation' : existing ? 'active' : 'awaiting_photo', JSON.stringify(location), needsConfirmation ? null : new Date(), session.token_hash]);
    await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'location_checked', JSON.stringify(location)]);
    if (needsConfirmation) return { requiresConfirmation: true, location };
    const employee = await userData(session.employee_id, session.active_role, connection);
    if (existing) {
      await startRemote(connection, session, location, existing.id);
      await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'session_resumed', JSON.stringify({ punchInPhotoId: existing.id, location })]);
      return { user: { ...employee, location }, resumedPunchIn: true };
    }
    return { requiresPhoto: true, employeeName: employee.name, employeeUsername: employee.username, employeeEmail: employee.email, location };
  });
  if (result.blocked) return res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).status(403).json({ message: result.message });
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
    await requireNotPunchedOut(connection, session.employee_id);
    await requireSignInLocation(connection, session.employee_id, location);
    const existing = await openTodayPunch(connection, session.employee_id);
    if (existing) location.punchInPhotoId = existing.id;
    await connection.execute("UPDATE session_locations SET stage=?,location_json=?,confirmed_at=NOW() WHERE token_hash=?", [existing ? 'active' : 'awaiting_photo', JSON.stringify(location), session.token_hash]);
    const employee = await userData(session.employee_id, session.active_role, connection);
    if (existing) {
      await startRemote(connection, session, location, existing.id);
      await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'session_resumed', JSON.stringify({ punchInPhotoId: existing.id, location })]);
      return { user: { ...employee, location }, resumedPunchIn: true };
    }
    return { requiresPhoto: true, employeeName: employee.name, employeeUsername: employee.username, employeeEmail: employee.email, location };
  });
  if (result.cancelled) res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' });
  res.json(result);
});
router.post('/api/auth/cancel', async (req, res) => {
  await withSession(pool, req.session.token_hash, async (connection, session) => {
    if (session.stage === 'active') throw Object.assign(new Error('Use punch-out to end an active session.'), { status: 409 });
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
      await requireNotPunchedOut(connection, session.employee_id);
      await requireSignInLocation(connection, session.employee_id, session.location_json);
      requireCheck(session.location_json, req.headers['x-location-check']);
      const capturedAt = Number(req.headers['x-captured-at']);
      requireCaptureTime(capturedAt, session.location_json);
      const employee = await userData(session.employee_id, session.active_role, connection);
      const details = photoDetails(capturedAt, session.location_json);
      photo = await storePhoto(buffer, employee, details);
      await connection.execute("UPDATE session_locations SET stage='active' WHERE token_hash=?", [session.token_hash]);
      await connection.execute('INSERT INTO photo_evidence (id,employee_id,session_hash,storage_path,file_size,sha256,captured_at) VALUES (?,?,?,?,?,?,?)', [photo.id, employee.id, session.token_hash, photo.storagePath, photo.size, photo.sha256, new Date(capturedAt)]);
      await connection.execute('INSERT INTO photo_evidence_details (photo_id,details) VALUES (?,?)', [photo.id, JSON.stringify(details)]);
      await startRemote(connection, session, session.location_json, photo.id);
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
  await requireSessionPunch(pool, req.session);
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
require('../workspace/routes')(router, { pool });
require('../messaging/routes')(router, { pool });
require('../checkout/routes')(router, { pool, userData });
module.exports = router;
