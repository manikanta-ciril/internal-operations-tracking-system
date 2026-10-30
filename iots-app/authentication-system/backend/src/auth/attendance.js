const { workday } = require('./workday');
const { httpError } = require('./session-state');

async function openTodayPunch(connection, employeeId) {
  const day = workday();
  const [[punch]] = await connection.execute(
    "SELECT p.id FROM photo_evidence p JOIN photo_evidence_details d ON d.photo_id=p.id LEFT JOIN checkout_evidence c ON c.sign_in_photo_id=p.id WHERE p.employee_id=? AND p.captured_at>=? AND p.captured_at<? AND c.id IS NULL AND JSON_UNQUOTE(JSON_EXTRACT(d.details,'$.location.status')) IN ('onsite','offsite') ORDER BY p.captured_at ASC LIMIT 1",
    [employeeId, day.start, day.end],
  );
  return punch;
}
async function sessionPunch(connection, session) {
  const [[punch]] = await connection.execute(
    'SELECT p.id,d.details FROM photo_evidence p JOIN photo_evidence_details d ON d.photo_id=p.id LEFT JOIN checkout_evidence c ON c.sign_in_photo_id=p.id WHERE p.employee_id=? AND (p.session_hash=? OR p.id=?) AND c.id IS NULL LIMIT 1',
    [session.employee_id, session.token_hash, session.location_json?.punchInPhotoId || null],
  );
  return punch;
}
async function requireSessionPunch(connection, session) {
  const punch = await sessionPunch(connection, session);
  if (!punch) throw httpError(403, 'Please sign in again to capture your punch-in photo evidence.');
  return punch;
}
async function startRemote(connection, session, location, photoId) {
  if (location.status !== 'offsite') return;
  await connection.execute('INSERT INTO remote_work_sessions (session_hash,employee_id,expires_at) VALUES (?,?,?)', [session.token_hash, session.employee_id, session.expires_at]);
  await connection.execute('INSERT INTO login_events (employee_id,event,details) VALUES (?,?,?)', [session.employee_id, 'remote_session_started', JSON.stringify({ photoId, location })]);
}
module.exports = { openTodayPunch, sessionPunch, requireSessionPunch, startRemote };
