const { createHash } = require("node:crypto");
const { requireSessionPunch } = require("../auth/attendance");
const {
  requireNotPunchedOut,
  requireSignInLocation,
} = require("../auth/workday");
const { fail } = require("./policy");

module.exports = async function messagingSession(pool, headers) {
  const token = (headers.cookie || "")
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith("iots_session="))
    ?.slice(13);
  if (!token) throw fail(401, "Sign in to use messaging.");
  const hash = createHash("sha256").update(token).digest("hex");
  const [[session]] = await pool.execute(
    "SELECT s.*,sl.location_json FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash JOIN employee_roles er ON er.employee_id=s.employee_id AND er.role_code=s.active_role WHERE s.token_hash=? AND s.expires_at>NOW() AND sl.stage='active'",
    [hash],
  );
  if (!session) throw fail(401, "Your session has ended. Sign in again.");
  await requireNotPunchedOut(pool, session.employee_id);
  await requireSignInLocation(pool, session.employee_id, session.location_json);
  await requireSessionPunch(pool, session);
  return session;
};
