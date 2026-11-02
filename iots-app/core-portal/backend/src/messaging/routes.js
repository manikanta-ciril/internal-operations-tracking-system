const express = require("express");
const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID, createHash } = require("node:crypto");
const repository = require("./repository");
const {
  canCreateGroup,
  attachmentName,
  identifier,
  fail,
} = require("./policy");
const storageRoot = path.resolve(
  process.env.IOTS_CHAT_ROOT ||
    path.join(require("../config/paths").local, "chat-uploads"),
);

module.exports = function registerMessaging(router, { pool }) {
  const base = "/api/auth/messaging";
  const writes = new Map();
  router.use(base, (req, res, next) => {
    if (req.method === "GET") return next();
    const now = Date.now();
    for (const [id, entry] of writes)
      if (now - entry.started > 60000) writes.delete(id);
    const id = req.session.employee_id;
    const entry = writes.get(id) || { started: now, count: 0 };
    writes.set(id, entry);
    if (++entry.count > 120)
      return res.status(429).json({
        message: "Too many messaging changes. Wait a minute and retry.",
      });
    next();
  });
  router.get(base, async (req, res) => {
    const [directory] = await pool.execute(
      "SELECT e.id,e.name,e.username,p.last_seen AS lastSeen,w.avatar_updated_at AS avatarVersion FROM employees e LEFT JOIN chat_presence p ON p.employee_id=e.id LEFT JOIN employee_workspace w ON w.employee_id=e.id ORDER BY e.name",
    );
    const employees = directory.map((employee) => ({
      ...employee,
      online: req.app.get("messagingPresence")?.(employee.id) || false,
    }));
    res.json({
      employees,
      conversations: await repository.listConversations(
        pool,
        req.session.employee_id,
      ),
      permissions: {
        createGroup: canCreateGroup(req.session.active_role),
        createChannel: false,
      },
    });
  });
  router.post(`${base}/conversations`, async (req, res) => {
    const conversation = await repository.createConversation(
      pool,
      req.session,
      req.body,
    );
    req.app.get("messagingNotify")?.(conversation.members, conversation.id);
    res.status(201).json({ id: conversation.id });
  });
  router.get(`${base}/employees/:id/avatar`, async (req, res) => {
    if (
      !Number.isSafeInteger(Number(req.params.id)) ||
      Number(req.params.id) < 1
    )
      throw fail(400, "Choose a valid employee.");
    const [[profile]] = await pool.execute(
      "SELECT avatar FROM employee_workspace WHERE employee_id=?",
      [Number(req.params.id)],
    );
    if (!profile?.avatar)
      return res.status(404).json({ message: "Profile photo not available." });
    res
      .set({
        "Content-Type": "image/webp",
        "X-Content-Type-Options": "nosniff",
      })
      .send(profile.avatar);
  });
  for (const [action, update] of Object.entries(require("./interactions"))) {
    router.post(`${base}/messages/:id/${action}`, async (req, res) => {
      const changed = await update(pool, req.session, {
        ...req.body,
        messageId: Number(req.params.id),
      });
      req.app.get("messagingNotify")?.(changed.members, changed.conversationId);
      res.json({ saved: true });
    });
  }
  router.get(`${base}/conversations/:id/messages`, async (req, res) => {
    const messages = await repository.history(
      pool,
      req.params.id,
      req.session.employee_id,
      req.query.before,
    );
    const [pendingAttachments] = await pool.execute(
      "SELECT id,name,size,media_type AS mediaType FROM chat_attachments WHERE conversation_id=? AND uploaded_by=? AND message_id IS NULL ORDER BY created_at",
      [req.params.id, req.session.employee_id],
    );
    res.json({ messages, pendingAttachments });
  });
  router.post(`${base}/conversations/:id/read`, async (req, res) => {
    await repository.markRead(
      pool,
      req.params.id,
      req.session.employee_id,
      req.body?.lastId,
    );
    req.app.get("messagingNotify")?.([req.session.employee_id], req.params.id);
    res.json({ saved: true });
  });
  router.post(
    `${base}/conversations/:id/attachments`,
    express.raw({ type: "application/octet-stream", limit: "30mb" }),
    async (req, res) => {
      await repository.requireMember(
        pool,
        req.params.id,
        req.session.employee_id,
      );
      const name = attachmentName(
        req.headers["x-file-name"],
        req.headers["x-attachment-kind"],
      );
      if (!Buffer.isBuffer(req.body) || !req.body.length)
        throw fail(400, "Choose a nonempty file up to 30 MB.");
      const mediaType = await require("./images").imageMediaType(
        name,
        req.body,
      );
      const [[pending]] = await pool.execute(
        "SELECT COUNT(*) AS total FROM chat_attachments WHERE uploaded_by=? AND message_id IS NULL",
        [req.session.employee_id],
      );
      if (pending.total >= 100)
        throw fail(
          429,
          "Too many unused uploads. Send your pending files first.",
        );
      const id = randomUUID();
      const destination = path.join(storageRoot, id);
      await fs.mkdir(storageRoot, { recursive: true });
      await fs.writeFile(destination, req.body, { flag: "wx" });
      try {
        await pool.execute(
          "INSERT INTO chat_attachments (id,conversation_id,uploaded_by,name,size,sha256,media_type) VALUES (?,?,?,?,?,?,?)",
          [
            id,
            req.params.id,
            req.session.employee_id,
            name,
            req.body.length,
            createHash("sha256").update(req.body).digest("hex"),
            mediaType,
          ],
        );
      } catch (error) {
        await fs.unlink(destination).catch(() => {});
        throw error;
      }
      res.status(201).json({ id, name, size: req.body.length, mediaType });
    },
  );
  router.delete(`${base}/attachments/:id`, async (req, res) => {
    const id = identifier(req.params.id);
    // Lock against sendMessage so a file cannot disappear while it is being attached.
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [[file]] = await connection.execute(
        "SELECT id FROM chat_attachments WHERE id=? AND uploaded_by=? AND message_id IS NULL FOR UPDATE",
        [id, req.session.employee_id],
      );
      if (!file)
        throw fail(403, "Only your unsent attachments can be removed.");
      await connection.execute("DELETE FROM chat_attachments WHERE id=?", [id]);
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
    await fs.unlink(path.join(storageRoot, id)).catch((error) => {
      if (error.code !== "ENOENT")
        console.error("Unused chat file cleanup failed:", error.code);
    });
    res.json({ removed: true });
  });
  router.get(`${base}/attachments/:id`, async (req, res) => {
    const id = identifier(req.params.id);
    const [[file]] = await pool.execute(
      "SELECT * FROM chat_attachments WHERE id=?",
      [id],
    );
    if (!file)
      return res.status(404).json({ message: "Attachment not found." });
    await repository.requireMember(
      pool,
      file.conversation_id,
      req.session.employee_id,
    );
    if (!file.message_id && file.uploaded_by !== req.session.employee_id)
      throw fail(403, "This attachment has not been sent.");
    if (req.query.preview && !file.media_type) {
      file.media_type = await require("./images").imageMediaType(
        file.name,
        await fs.readFile(path.join(storageRoot, id)),
      );
      if (file.media_type)
        await pool.execute(
          "UPDATE chat_attachments SET media_type=? WHERE id=?",
          [file.media_type, id],
        );
    }
    if (req.query.preview && !file.media_type?.startsWith("image/"))
      throw fail(400, "This attachment has no image preview.");
    res.set({
      "Content-Type": req.query.preview
        ? file.media_type
        : "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "sandbox; default-src 'none'",
      "Content-Disposition": `${req.query.preview ? "inline" : "attachment"}; filename="attachment"; filename*=UTF-8''${encodeURIComponent(file.name).replace(/'/g, "%27")}`,
    });
    res.sendFile(path.join(storageRoot, id), { dotfiles: "allow" });
  });
  router.use(base, (error, req, res, next) => {
    if (error.code === "ENOENT")
      return res
        .status(404)
        .json({ message: "The attachment is missing from server storage." });
    if (error.type === "entity.too.large")
      return res.status(413).json({ message: "Choose a file up to 30 MB." });
    if ([400, 401, 403, 404, 409, 429].includes(error.status))
      return res.status(error.status).json({ message: error.message });
    next(error);
  });
};
