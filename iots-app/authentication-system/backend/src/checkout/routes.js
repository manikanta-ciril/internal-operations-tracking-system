const { randomUUID } = require('node:crypto');
const { withSession, requireStage, requireCheck, requireCaptureTime, httpError } = require('../auth/session-state');
const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const { assessLocation } = require('../location/assess');
const { preparePhoto, storePhoto, photoDetails, checkoutPhotoRoot } = require('../evidence/photos');

// Registered after the active-session and sign-in-evidence guards.
module.exports = function registerCheckout(app, { pool, userData }) {
  app.post('/api/auth/checkout/location', async (req, res) => {
    const assessed = assessLocation(req.body?.position);
    if (!Number.isFinite(assessed.latitude)) return res.status(400).json({ message: 'Allow location and obtain a fresh reading before checking out.' });
    const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
      requireStage(session, 'active');
      const location = { ...assessed, checkId: randomUUID(), captureAfter: Date.now() };
      const stage = location.status === 'onsite' ? 'awaiting_photo' : 'awaiting_confirmation';
      await connection.execute('INSERT INTO checkout_checks (session_hash,stage,location_json) VALUES (?,?,?) ON DUPLICATE KEY UPDATE stage=VALUES(stage),location_json=VALUES(location_json),checked_at=CURRENT_TIMESTAMP', [session.token_hash, stage, JSON.stringify(location)]);
      await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'checkout_location_checked', JSON.stringify(location)]);
      return { requiresConfirmation: stage === 'awaiting_confirmation', requiresPhoto: stage === 'awaiting_photo', location };
    });
    res.json(result);
  });
  async function currentCheck(connection, session, checkId) {
    const [[check]] = await connection.execute('SELECT * FROM checkout_checks WHERE session_hash=? AND checked_at>NOW()-INTERVAL 5 MINUTE FOR UPDATE', [session.token_hash]);
    if (!check) throw httpError(409, 'Obtain a new checkout location reading.');
    requireCheck(check.location_json, checkId);
    return check;
  }
  app.post('/api/auth/checkout/confirm', async (req, res) => {
    if (typeof req.body?.proceed !== 'boolean') return res.status(400).json({ message: 'Choose whether to continue checkout.' });
    const result = await withSession(pool, req.session.token_hash, async (connection, session) => {
      requireStage(session, 'active');
      const check = await currentCheck(connection, session, req.body.checkId);
      requireStage(check, 'awaiting_confirmation');
      if (!req.body.proceed) {
        await connection.execute('DELETE FROM checkout_checks WHERE session_hash=?', [session.token_hash]);
        await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [session.employee_id, 'checkout_cancelled']);
        return { cancelled: true };
      }
      const location = { ...check.location_json, captureAfter: Date.now() };
      await connection.execute("UPDATE checkout_checks SET stage='awaiting_photo',location_json=? WHERE session_hash=?", [JSON.stringify(location), session.token_hash]);
      await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [session.employee_id, 'checkout_exception_accepted']);
      return { requiresPhoto: true, location };
    });
    res.json(result);
  });
  app.post('/api/auth/checkout/cancel', async (req, res) => {
    await withSession(pool, req.session.token_hash, async (connection, session) => {
      requireStage(session, 'active');
      if (req.body?.checkId) await currentCheck(connection, session, req.body.checkId);
      await connection.execute('DELETE FROM checkout_checks WHERE session_hash=?', [session.token_hash]);
      await connection.execute('INSERT INTO login_events (employee_id,event) VALUES (?,?)', [session.employee_id, 'checkout_cancelled']);
    });
    res.json({ cancelled: true });
  });
  app.post('/api/auth/checkout/photo', express.raw({ type: 'image/jpeg', limit: '2mb' }), async (req, res) => {
    let buffer;
    try { buffer = await preparePhoto(req.body); }
    catch { return res.status(400).json({ message: 'Retake your checkout photo using the camera.' }); }
    let photo;
    try {
      await withSession(pool, req.session.token_hash, async (connection, session) => {
        requireStage(session, 'active');
        const check = await currentCheck(connection, session, req.headers['x-location-check']);
        requireStage(check, 'awaiting_photo');
        const capturedAt = Number(req.headers['x-captured-at']);
        requireCaptureTime(capturedAt, check.location_json);
        const employee = await userData(session.employee_id, session.active_role, connection);
        const [[signIn]] = await connection.execute('SELECT id FROM photo_evidence WHERE session_hash=?', [session.token_hash]);
        const details = { ...photoDetails(capturedAt, check.location_json), kind: 'checkout', signInPhotoId: signIn.id };
        photo = await storePhoto(buffer, employee, details);
        await connection.execute('INSERT INTO checkout_evidence (id,employee_id,session_hash,sign_in_photo_id,storage_path,file_size,sha256,captured_at,details) VALUES (?,?,?,?,?,?,?,?,?)', [photo.id, employee.id, session.token_hash, signIn.id, photo.storagePath, photo.size, photo.sha256, new Date(capturedAt), JSON.stringify(details)]);
        await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [employee.id, 'checkout_completed', JSON.stringify({ photoId: photo.id, signInPhotoId: signIn.id })]);
        await connection.execute('DELETE FROM sessions WHERE token_hash=?', [session.token_hash]);
      });
    } catch (error) {
      if (photo) await fs.unlink(photo.absolutePath).catch(() => {});
      throw error;
    }
    res.clearCookie('iots_session', { path: '/api', httpOnly: true, sameSite: 'strict' }).json({ checkedOut: true, photoId: photo.id });
  });
  app.get('/api/auth/checkout/photos/:id', async (req, res) => {
    const [[photo]] = await pool.execute('SELECT storage_path FROM checkout_evidence WHERE id=? AND employee_id=?', [req.params.id, req.session.employee_id]);
    if (!photo) return res.status(404).json({ message: 'Checkout photo not found.' });
    res.set('Content-Disposition', 'inline'); res.set('X-Content-Type-Options', 'nosniff');
    res.sendFile(path.join(checkoutPhotoRoot, photo.storage_path), { dotfiles: 'allow' });
  });
  app.post('/api/auth/logout', (req, res) => res.status(409).json({ message: 'Complete the checkout location check and photo capture to log out.', requiresCheckout: true }));
};
