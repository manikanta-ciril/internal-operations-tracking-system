const { randomBytes, createHash } = require("node:crypto");
const { httpError } = require("./session-state");
const { deviceLabel, requireNotPunchedOut } = require("./workday");
const digest = (token) => createHash("sha256").update(token).digest("hex");
async function liveSessions(connection, id) {
  const [rows] = await connection.execute(
    "SELECT s.token_hash, COALESCE(d.device_label,'Previously signed-in device') AS device, s.created_at AS startedAt FROM sessions s JOIN session_locations sl ON sl.token_hash=s.token_hash LEFT JOIN session_devices d ON d.token_hash=s.token_hash WHERE s.employee_id=? AND s.expires_at>NOW() AND (sl.stage='active' OR s.created_at>NOW()-INTERVAL 5 MINUTE) ORDER BY s.token_hash",
    [id],
  );
  return rows;
}
async function createSession(connection, employeeId, role, device) {
  const token = randomBytes(32).toString("hex");
  await connection.execute(
    "INSERT INTO sessions (token_hash,employee_id,active_role,expires_at) VALUES (?,?,?,?)",
    [digest(token), employeeId, role, new Date(Date.now() + 12 * 3600000)],
  );
  await connection.execute(
    "INSERT INTO session_locations (token_hash) VALUES (?)",
    [digest(token)],
  );
  await connection.execute(
    "INSERT INTO session_devices (token_hash,device_label) VALUES (?,?)",
    [digest(token), device],
  );
  return token;
}
async function beginSignIn(pool, employee, role, ua) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[locked]] = await connection.execute(
      "SELECT password_hash FROM employees WHERE id=? FOR UPDATE",
      [employee.id],
    );
    if (locked.password_hash !== employee.password_hash)
      throw httpError(401, "Your password changed. Please sign in again.");

    await requireNotPunchedOut(connection, employee.id);
    const sessions = await liveSessions(connection, employee.id);
    const device = deviceLabel(ua);
    let result;
    if (sessions.length) {
      const challenge = randomBytes(32).toString("hex");
      await connection.execute(
        "DELETE FROM signin_challenges WHERE expires_at<NOW()",
      );
      await connection.execute(
        "INSERT INTO signin_challenges (token_hash,employee_id,active_role,device_label,session_snapshot,expires_at) VALUES (?,?,?,?,?,?)",
        [
          digest(challenge),
          employee.id,
          role,
          device,
          JSON.stringify(sessions.map((s) => s.token_hash)),
          new Date(Date.now() + 300000),
        ],
      );
      result = {
        requiresSessionChoice: true,
        challenge,
        devices: sessions.map(({ device, startedAt }) => ({
          device,
          startedAt,
        })),
      };
    } else
      result = {
        token: await createSession(connection, employee.id, role, device),
      };
    await connection.execute(
      "INSERT INTO login_events (employee_id,event) VALUES (?,?)",
      [employee.id, "credentials_verified"],
    );
    await connection.commit();
    return result;
  } catch (e) {
    await connection.rollback();
    throw e;
  } finally {
    connection.release();
  }
}
function registerSessionChoice(router, { pool, cookieOptions }) {
  router.post("/api/auth/session-choice", async (req, res) => {
    const { challenge, proceed } = req.body || {};
    if (
      typeof challenge !== "string" ||
      !/^[a-f0-9]{64}$/.test(challenge) ||
      typeof proceed !== "boolean"
    )
      throw httpError(400, "Choose whether to continue sign-in.");
    const hash = digest(challenge);
    const [[owner]] = await pool.execute(
      "SELECT employee_id FROM signin_challenges WHERE token_hash=? AND expires_at>NOW()",
      [hash],
    );
    if (!owner)
      throw httpError(
        401,
        "This sign-in request expired. Please sign in again.",
      );
    const connection = await pool.getConnection();
    let token;
    try {
      await connection.beginTransaction();
      await connection.execute(
        "SELECT id FROM employees WHERE id=? FOR UPDATE",
        [owner.employee_id],
      );
      const [[request]] = await connection.execute(
        "SELECT * FROM signin_challenges WHERE token_hash=? AND expires_at>NOW() FOR UPDATE",
        [hash],
      );
      if (!request)
        throw httpError(
          401,
          "This sign-in request expired. Please sign in again.",
        );
      if (proceed) {
        await requireNotPunchedOut(connection, request.employee_id);
        const sessions = await liveSessions(connection, request.employee_id);
        if (
          JSON.stringify(sessions.map((s) => s.token_hash)) !==
          JSON.stringify(request.session_snapshot)
        )
          throw httpError(
            409,
            "Your sessions changed. Please sign in again to review them.",
          );
        await require("./remote-work").closeRemote(
          connection,
          request.employee_id,
        );
        await connection.execute("DELETE FROM sessions WHERE employee_id=?", [
          request.employee_id,
        ]);
        token = await createSession(
          connection,
          request.employee_id,
          request.active_role,
          request.device_label,
        );
        await connection.execute(
          "INSERT INTO employee_notifications (employee_id,title,message) VALUES (?,?,?)",
          [
            request.employee_id,
            "Sign-in moved to another device",
            `You chose to continue on ${request.device_label}. Previous sessions were ended; no punch-out was recorded.`,
          ],
        );
        await connection.execute(
          "INSERT INTO login_events (employee_id,event) VALUES (?,?)",
          [request.employee_id, "session_taken_over"],
        );
        await connection.execute(
          "DELETE FROM signin_challenges WHERE employee_id=?",
          [request.employee_id],
        );
      } else
        await connection.execute(
          "DELETE FROM signin_challenges WHERE token_hash=?",
          [hash],
        );
      await connection.commit();
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
    if (token)
      res
        .cookie("iots_session", token, cookieOptions)
        .json({ requiresLocationCheck: true });
    else res.json({ cancelled: true });
  });
}
module.exports = { beginSignIn, registerSessionChoice };
