function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

async function withSession(pool, tokenHash, action) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[session]] = await connection.execute("SELECT s.*,sl.stage,sl.location_json FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash JOIN employee_roles er ON er.employee_id=s.employee_id AND er.role_code=s.active_role WHERE s.token_hash=? AND s.expires_at>NOW() AND (sl.stage='active' OR s.created_at>NOW()-INTERVAL 5 MINUTE) FOR UPDATE", [tokenHash]);
    if (!session) throw httpError(401, 'Your session has ended. Please sign in.');
    const result = await action(connection, session);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}

function requireStage(session, expected) {
  if (session.stage !== expected) throw httpError(409, 'This sign-in step has changed. Please retry the current step.');
}

function requireCheck(location, checkId) {
  if (!location?.checkId || location.checkId !== checkId) throw httpError(409, 'Obtain a fresh location check before continuing.');
}

function requireCaptureTime(capturedAt, location) {
  // Allow one second of clock/transport precision; never accept an older-stage photo.
  if (!Number.isFinite(capturedAt) || !Number.isFinite(location?.captureAfter) || capturedAt < location.captureAfter - 1000 || Math.abs(Date.now() - capturedAt) > 120000) {
    throw httpError(400, 'Take a new photo after completing the location check.');
  }
}

module.exports = { withSession, requireStage, requireCheck, requireCaptureTime, httpError };
