const express = require("express");
const sharp = require("sharp");
const { defaults, validateSettings, statuses } = require("./settings");
const { withSession, requireStage } = require("../auth/session-state");

// Mount only after the existing active-session AND photo-evidence guards.
module.exports = function registerWorkspace(router, { pool }) {
  require("./account-routes")(router, { pool });
  require("../calendar/routes")(router, { pool });
  router.get("/api/auth/workspace", async (req, res) => {
    const employeeId = req.session.employee_id;
    const [[settings]] = await pool.execute(
      "SELECT settings, avatar_updated_at FROM employee_workspace WHERE employee_id=?",
      [employeeId],
    );
    const [punches] = await pool.execute(
      `SELECT p.id, p.captured_at AS punchIn, c.id AS punchOutId,
      c.captured_at AS punchOut, d.details AS location
      FROM photo_evidence p LEFT JOIN checkout_evidence c ON c.sign_in_photo_id=p.id
      LEFT JOIN photo_evidence_details d ON d.photo_id=p.id
      WHERE p.employee_id=? AND p.captured_at>=DATE_SUB(NOW(), INTERVAL 180 DAY)
      ORDER BY p.captured_at DESC LIMIT 1000`,
      [employeeId],
    );
    const [sessions] = await pool.execute(
      `SELECT s.created_at AS startedAt, s.expires_at AS expiresAt,
      COALESCE(d.device_label,'Previously signed-in device') AS device, r.label AS role, (s.token_hash=?) AS current FROM sessions s LEFT JOIN session_devices d ON d.token_hash=s.token_hash
      JOIN roles r ON r.code=s.active_role JOIN session_locations sl ON sl.token_hash=s.token_hash
      WHERE s.employee_id=? AND s.expires_at>NOW() AND sl.stage='active'
      AND EXISTS (SELECT 1 FROM photo_evidence p WHERE p.employee_id=s.employee_id AND (p.session_hash=s.token_hash OR p.id=JSON_UNQUOTE(JSON_EXTRACT(sl.location_json,'$.punchInPhotoId'))))
      ORDER BY s.created_at DESC`,
      [req.session.token_hash, employeeId],
    );
    const [activity] = await pool.execute(
      `SELECT id,event,created_at AS occurredAt FROM login_events
      WHERE employee_id=? AND event IN ('session_logged_out','session_resumed','remote_session_started','remote_session_ended','password_updated','session_taken_over','photo_evidence_accepted','checkout_completed','workspace_profile_updated','workspace_availability_updated','workspace_preferences_updated','workspace_avatar_updated')
      ORDER BY id DESC LIMIT 50`,
      [employeeId],
    );
    const saved = settings?.settings || {};
    const base = defaults();
    res.json({
      settings: {
        profile: { ...base.profile, ...saved.profile },
        availability: { ...base.availability, ...saved.availability },
        preferences: {
          ...base.preferences,
          ...saved.preferences,
          "Security notices": true,
        },
      },
      workday: require("../auth/workday").workday(),
      avatarVersion: settings?.avatar_updated_at || null,
      punches,
      sessions,
      activity,
      policy: {
        workingDays: [1, 2, 3, 4, 5, 6],
        timezone: "Asia/Kolkata",
        statuses,
      },
    });
  });
  router.post("/api/auth/workspace/settings/:section", async (req, res) => {
    const section = req.params.section;
    const value = validateSettings(section, req.body);
    await withSession(
      pool,
      req.session.token_hash,
      async (connection, session) => {
        requireStage(session, "active");
        await connection.execute(
          "INSERT IGNORE INTO employee_workspace (employee_id,settings) VALUES (?,?)",
          [session.employee_id, JSON.stringify(defaults())],
        );
        await connection.execute(
          "UPDATE employee_workspace SET settings=JSON_SET(settings, ?, CAST(? AS JSON)) WHERE employee_id=?",
          [`$.${section}`, JSON.stringify(value), session.employee_id],
        );
        await connection.execute(
          "INSERT INTO login_events (employee_id,event) VALUES (?,?)",
          [session.employee_id, `workspace_${section}_updated`],
        );
      },
    );
    res.json({ value });
  });
  router.get("/api/auth/workspace/avatar", async (req, res) => {
    const [[row]] = await pool.execute(
      "SELECT avatar FROM employee_workspace WHERE employee_id=?",
      [req.session.employee_id],
    );
    if (!row?.avatar) return res.status(404).end();
    res
      .set("X-Content-Type-Options", "nosniff")
      .type("image/webp")
      .send(row.avatar);
  });
  router.post(
    "/api/auth/workspace/avatar",
    express.raw({
      type: ["image/jpeg", "image/png", "image/webp"],
      limit: "2mb",
    }),
    async (req, res) => {
      let avatar;
      try {
        if (!Buffer.isBuffer(req.body)) throw new Error("Image required");
        avatar = await sharp(req.body, { limitInputPixels: 20000000 })
          .rotate()
          .resize(256, 256, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();
      } catch {
        return res
          .status(400)
          .json({ message: "Choose a JPEG, PNG or WebP image under 2 MB." });
      }
      await withSession(
        pool,
        req.session.token_hash,
        async (connection, session) => {
          requireStage(session, "active");
          await connection.execute(
            "INSERT IGNORE INTO employee_workspace (employee_id,settings) VALUES (?,?)",
            [session.employee_id, JSON.stringify(defaults())],
          );
          await connection.execute(
            "UPDATE employee_workspace SET avatar=?,avatar_updated_at=CURRENT_TIMESTAMP(3) WHERE employee_id=?",
            [avatar, session.employee_id],
          );
          await connection.execute(
            "INSERT INTO login_events (employee_id,event) VALUES (?,?)",
            [session.employee_id, "workspace_avatar_updated"],
          );
        },
      );
      res.json({ avatarVersion: new Date().toISOString() });
    },
  );
};
