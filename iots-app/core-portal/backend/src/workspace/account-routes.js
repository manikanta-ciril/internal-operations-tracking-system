const {
  withSession,
  requireStage,
  httpError,
} = require("../auth/session-state");
const { verify } = require("../auth/passwords");
const { randomBytes, scrypt } = require("node:crypto");
const { promisify } = require("node:util");
const { createLoginLimiter } = require("../auth/login-limiter");
const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const key = await promisify(scrypt)(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
};
module.exports = (router, { pool }) => {
  const limiter = createLoginLimiter();
  router.get("/api/auth/workspace/time", async (req, res) =>
    res.json(await require("./work-time").workTime(pool, req.session)),
  );
  router.post("/api/auth/workspace/password", async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (
      typeof currentPassword !== "string" ||
      currentPassword.length > 200 ||
      typeof newPassword !== "string" ||
      newPassword.length < 12 ||
      newPassword.length > 128
    )
      throw httpError(400, "Use a new password between 12 and 128 characters.");
    const finish = limiter.consume(
      String(req.session.employee_id),
      String(req.session.employee_id),
    );
    if (!finish)
      throw httpError(
        429,
        "Too many password attempts. Please wait one minute.",
      );
    const [[employee]] = await pool.execute(
      "SELECT password_hash FROM employees WHERE id=?",
      [req.session.employee_id],
    );
    if (!(await verify(currentPassword, employee.password_hash))) {
      finish(false);
      throw httpError(400, "Current password is incorrect.");
    }
    if (currentPassword === newPassword) {
      finish(false);
      throw httpError(400, "Choose a different password.");
    }
    const passwordHash = await hashPassword(newPassword);
    await withSession(
      pool,
      req.session.token_hash,
      async (connection, session) => {
        requireStage(session, "active");
        const [[locked]] = await connection.execute(
          "SELECT password_hash FROM employees WHERE id=?",
          [session.employee_id],
        );
        if (locked.password_hash !== employee.password_hash)
          throw httpError(
            409,
            "Your password changed. Enter the current password again.",
          );
        await connection.execute(
          "UPDATE employees SET password_hash=? WHERE id=?",
          [passwordHash, session.employee_id],
        );
        await require("../auth/remote-work").closeRemote(
          connection,
          session.employee_id,
          session.token_hash,
        );
        await connection.execute(
          "DELETE FROM sessions WHERE employee_id=? AND token_hash<>?",
          [session.employee_id, session.token_hash],
        );
        await connection.execute(
          "DELETE FROM signin_challenges WHERE employee_id=?",
          [session.employee_id],
        );
        await connection.execute(
          "INSERT INTO login_events (employee_id,event) VALUES (?,?)",
          [session.employee_id, "password_updated"],
        );
        await connection.execute(
          "INSERT INTO employee_notifications (employee_id,title,message) VALUES (?,?,?)",
          [
            session.employee_id,
            "Password updated",
            "Your password was changed. Other sign-in sessions were ended.",
          ],
        );
      },
    );
    finish(true);
    res.json({
      message: "Password updated. Other sessions have been signed out.",
    });
  });
  router.get("/api/auth/workspace/notifications", async (req, res) => {
    const [notifications] = await pool.execute(
      "SELECT id,title,message,created_at AS createdAt,read_at AS readAt FROM employee_notifications WHERE employee_id=? ORDER BY id DESC LIMIT 100",
      [req.session.employee_id],
    );
    const [[count]] = await pool.execute(
      "SELECT COUNT(*) AS unread FROM employee_notifications WHERE employee_id=? AND read_at IS NULL",
      [req.session.employee_id],
    );
    res.json({ notifications, unread: count.unread });
  });
  router.post("/api/auth/workspace/notifications/read", async (req, res) => {
    const ids = req.body?.ids;
    if (
      !Array.isArray(ids) ||
      ids.length > 100 ||
      ids.some((id) => !Number.isSafeInteger(id) || id < 1)
    )
      throw httpError(400, "Choose valid notifications.");
    if (ids.length)
      await pool.execute(
        `UPDATE employee_notifications SET read_at=COALESCE(read_at,NOW()) WHERE employee_id=? AND id IN (${ids.map(() => "?").join(",")})`,
        [req.session.employee_id, ...ids],
      );
    res.json({ saved: true });
  });
};
