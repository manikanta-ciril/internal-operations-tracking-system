const express = require("express");
const { randomUUID } = require("node:crypto");
const repository = require("./repository");
const policy = require("./policy");
const files = require("./files");
const base = "/api/auth/tasks";
const permissions = (actor) => ({
  manage: !!actor.manager,
  oversight: !!actor.oversight,
  execute: !!actor.execute,
  report: !!actor.execute && !actor.oversight,
});
const fingerprint = (req) =>
  `${req.method}:${req.originalUrl}:${JSON.stringify(req.body)}`;
const reportFiles = (value, strict = false) => {
  const ids = new Set();
  const walk = (item) => {
    if (!item || typeof item !== "object") return;
    if (
      typeof item.id === "string" &&
      item.name &&
      (item.server || item.size !== undefined)
    )
      ids.add(item.id);
    for (const [key, child] of Object.entries(item)) {
      if (strict && ["proofs", "attachments"].includes(key)) {
        policy.requireThat(
          Array.isArray(child),
          "Choose saved report evidence.",
        );
        for (const proof of child)
          policy.requireThat(
            proof &&
              typeof proof === "object" &&
              /^[a-f0-9-]{36}$/.test(proof.id || "") &&
              proof.server === true,
            "Upload evidence before saving the report.",
          );
      }
      walk(child);
    }
  };
  walk(value);
  return [...ids];
};
module.exports = function registerTasks(router, { pool }) {
  const scoped = (req, callback) =>
    repository.context(pool, req.session, async (connection, actor, employees) => {
      const result = await callback(connection, actor, employees);
      if (result?.task) result.task = policy.forViewer(result.task, actor);
      if (result?.tasks) result.tasks = result.tasks.map(task => policy.forViewer(task, actor));
      return result;
    });
  const writes = new Map();
  router.use(base, (req, res, next) => {
    if (req.method === "GET") return next();
    const now = Date.now();
    for (const [id, entry] of writes)
      if (now - entry.since >= 60000) writes.delete(id);
    const entry = writes.get(req.session.employee_id) || {
      since: now,
      count: 0,
    };
    writes.set(req.session.employee_id, entry);
    if (++entry.count > 120)
      return res
        .status(429)
        .json({ message: "Too many work changes. Wait a minute and retry." });
    next();
  });
  const validateAssignees = (body, employees) => {
    if (body.ownerId)
      policy.requireThat(
        Number.isSafeInteger(body.ownerId) &&
          employees.some((user) => user.id === body.ownerId && user.execute && !user.oversight),
        "Choose an eligible employee.",
      );
    if (body.reviewerId)
      policy.requireThat(
        Number.isSafeInteger(body.reviewerId) &&
          employees.some((user) => user.id === body.reviewerId && user.manager),
        "Choose a General Manager or Senior Manager reviewer.",
      );
  };
  router.get(base, async (req, res) => {
    const result = await scoped(req, async (connection, actor, employees) => {
      const [rows] = await connection.execute(
        "SELECT payload FROM work_tasks WHERE (status='Draft' AND created_by=? AND ?=1) OR (status<>'Draft' AND (?=1 OR owner_id=? OR JSON_CONTAINS(payload,CAST(? AS JSON),'$.contributorIds'))) ORDER BY updated_at DESC",
        [
          actor.id,
          actor.manager ? 1 : 0,
          actor.manager || actor.oversight ? 1 : 0,
          actor.id,
          JSON.stringify(actor.id),
        ],
      );
      const tasks = rows
        .map((row) => repository.parse(row.payload))
        .filter((task) => policy.visible(task, actor));
      const [reports] = await connection.execute(
        "SELECT employee_id AS employeeId,work_date AS date,revision,state,payload FROM work_daily_reports WHERE employee_id=? OR (?=1 AND state=?) ORDER BY work_date DESC LIMIT 500",
        [actor.id, actor.manager || actor.oversight ? 1 : 0, "Submitted"],
      );
      return {
        tasks,
        employees:
          actor.manager || actor.oversight
            ? employees
            : employees.filter((user) => user.id === actor.id || user.manager),
        currentUser: actor,
        permissions: permissions(actor),
        reports: reports.map((row) => ({
          employeeId: row.employeeId,
          date: repository.parse(row.payload).date,
          revision: row.revision,
          state: row.state,
          report: { ...repository.parse(row.payload), revision: row.revision },
        })),
      };
    });
    res.json(result);
  });
  router.get(`${base}/:id`, async (req, res) =>
    res.json(
      await scoped(req, async (connection, actor) => ({
        task: await repository.getTask(connection, req.params.id, actor),
      })),
    ),
  );
  router.post(base, async (req, res) => {
    const key = repository.commandKey(req);
    const result = await scoped(req, async (connection, actor, employees) => {
      policy.manager(actor);
      return repository.command(
        connection,
        actor,
        key,
        fingerprint(req),
        async () => {
          validateAssignees(req.body || {}, employees);
          const task = policy.makeTask(req.body || {}, actor);
          policy.event(task, actor, "Created", "Draft saved.");
          await repository.saveTask(connection, task);
          await repository.audit(connection, task, key);
          return { task };
        },
      );
    });
    res.status(201).json(result);
  });
  router.post(`${base}/:id/actions`, async (req, res) => {
    const key = repository.commandKey(req);
    const result = await scoped(req, async (connection, actor, employees) => {
      await repository.getTask(connection, req.params.id, actor);
      return repository.command(
        connection,
        actor,
        key,
        fingerprint(req),
        async () => {
          const task = await repository.getTask(
            connection,
            req.params.id,
            actor,
            true,
          );
          if (req.body?.action === "edit")
            validateAssignees(req.body, employees);
          if (
            ["effort", "work-update"].includes(req.body?.action) &&
            req.body.minutes > 0
          ) {
            const workDate =
              (req.body.action === "effort" && req.body.date) ||
              new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Kolkata",
              }).format(new Date());
            const [records] = await connection.execute(
              "SELECT payload FROM work_tasks WHERE owner_id=? OR JSON_CONTAINS(payload,CAST(? AS JSON),'$.contributorIds')",
              [actor.id, JSON.stringify(actor.id)],
            );
            const total = records
              .map((row) => repository.parse(row.payload))
              .flatMap((item) => item.effortEntries || [])
              .filter(
                (entry) =>
                  entry.actorId === actor.id && entry.date === workDate,
              )
              .reduce((sum, entry) => sum + entry.minutes, 0);
            policy.requireThat(
              Number.isInteger(req.body.minutes) &&
                total + req.body.minutes <= 1440,
              "Total daily effort cannot exceed 1440 minutes.",
            );
          }
          policy.applyAction(task, actor, req.body || {}, employees);
          await repository.saveTask(connection, task);
          await repository.audit(connection, task, key);
          return { task };
        },
      );
    });
    res.json(result);
  });
  async function upload(req, res, reportUpload) {
    const key = repository.commandKey(req);
    let written;
    const metadata = await files.prepare(req.headers["x-file-name"], req.body);
    try {
      const result = await scoped(req, async (connection, actor) => {
        policy.requireThat(
          actor.execute && !actor.oversight,
          "Only employees with a work role may upload evidence.",
          403,
        );
        return repository.command(
          connection,
          actor,
          key,
          `${req.originalUrl}:${req.headers["x-file-purpose"] || "evidence"}:${metadata.name}:${metadata.sha256}`,
          async () => {
            let task;
            if (!reportUpload) {
              task = await repository.getTask(
                connection,
                req.params.id,
                actor,
                true,
              );
              policy.active(task);
              if (task.status === "Draft")
                policy.requireThat(
                  actor.manager &&
                    task.createdBy === actor.id &&
                    req.headers["x-file-purpose"] === "reference",
                  "Only the creator can attach draft reference files.",
                  403,
                );
              else {
                policy.owner(task, actor);
                const publicationUpload =
                  req.headers["x-file-purpose"] === "publication" &&
                  task.publicationRequired &&
                  task.status === "In review";
                policy.requireThat(
                  ["In progress", "Changes requested"].includes(task.status) ||
                    publicationUpload,
                  "Upload evidence while working on the task.",
                  409,
                );
              }
              policy.requireThat(
                task.files.length < 100,
                "This task already has 100 evidence files.",
              );
            }
            const [[quota]] = await connection.execute(
              "SELECT COUNT(*) AS count FROM work_files WHERE uploaded_by=? AND created_at>NOW()-INTERVAL 1 DAY",
              [actor.id],
            );
            policy.requireThat(
              quota.count < 200,
              "Daily evidence upload limit reached. Contact your manager.",
              429,
            );
            await files.write(metadata, req.body);
            written = metadata.id;
            await connection.execute(
              "INSERT INTO work_files(id,task_id,uploaded_by,name,media_type,bytes,sha256) VALUES (?,?,?,?,?,?,?)",
              [
                metadata.id,
                task?.id || null,
                actor.id,
                metadata.name,
                metadata.type,
                metadata.size,
                metadata.sha256,
              ],
            );
            const file = {
              ...metadata,
              uploaderId: actor.id,
              uploadedAt: new Date().toISOString(),
              purpose:
                task?.status === "Draft"
                  ? "reference"
                  : req.headers["x-file-purpose"] === "publication"
                    ? "publication"
                    : "evidence",
            };
            if (task) {
              task.files.push(file);
              if (file.purpose === "reference") {
                task.referenceFiles ??= [];
                task.referenceFiles.push(file);
              }
              task.revision += 1;
              policy.event(task, actor, "File uploaded", file.name);
              await repository.saveTask(connection, task);
              await repository.audit(connection, task, key);
            }
            return { file, ...(task ? { task } : {}) };
          },
        );
      });
      res.status(201).json(result);
    } catch (error) {
      if (written) await files.remove(written);
      throw error;
    }
  }
  router.post(
    `${base}/report-files`,
    express.raw({ type: () => true, limit: "30mb" }),
    (req, res) => upload(req, res, true),
  );
  router.post(
    `${base}/:id/files`,
    express.raw({ type: () => true, limit: "30mb" }),
    (req, res) => upload(req, res, false),
  );
  router.get(`${base}/files/:id`, async (req, res, next) => {
    const file = await scoped(req, async (connection, actor) => {
      policy.requireThat(
        /^[a-f0-9-]{36}$/.test(req.params.id),
        "File not available.",
        404,
      );
      const [[file]] = await connection.execute(
        "SELECT * FROM work_files WHERE id=?",
        [req.params.id],
      );
      policy.requireThat(file, "File not available.", 404);
      if (file.task_id)
        await repository.getTask(connection, file.task_id, actor);
      else if (file.uploaded_by !== actor.id) {
        policy.requireThat(
          actor.manager || actor.oversight,
          "File not available.",
          404,
        );
        const [reports] = await connection.execute(
          "SELECT payload FROM work_daily_reports WHERE employee_id=? AND state=?",
          [file.uploaded_by, "Submitted"],
        );
        policy.requireThat(
          reports.some((report) =>
            reportFiles(repository.parse(report.payload)).includes(file.id),
          ),
          "File not available.",
          404,
        );
      }
      return file;
    });
    const preview = req.query.preview === "1";
    const previewType = files.previewType(file.name);
    policy.requireThat(!preview || previewType, "This source format is available to download, but cannot be previewed safely.", 415);
    res
      .set("Content-Type", preview ? previewType : "application/octet-stream")
      .set(
        "Content-Disposition",
        `${preview ? 'inline' : 'attachment'}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      )
      .set("X-Content-Type-Options", "nosniff")
      .set("Content-Security-Policy", "default-src 'none'; sandbox")
      .set("Cross-Origin-Resource-Policy", "same-origin")
      .set("X-Preview-Supported", previewType ? "true" : "false");
    // Use a root-relative generated key: absolute paths below .local are otherwise
    // rejected by sendFile's dotfile guard even though the key itself is safe.
    res.sendFile(file.id, { root: files.storageRoot, dotfiles: "deny" }, error => {
      if (!error) return;
      if (!res.headersSent && error.status === 404) return res.status(404).json({ message: "This saved file is unavailable in storage. Contact your manager." });
      next(error);
    });
  });
  router.post(`${base}/reports`, async (req, res) => {
    const key = repository.commandKey(req);
    const result = await scoped(req, async (connection, actor, employees) => {
      policy.requireThat(
        permissions(actor).report,
        "Daily reports are available to operational employees.",
        403,
      );
      return repository.command(
        connection,
        actor,
        key,
        fingerprint(req),
        async () => {
          const input = req.body?.report;
          policy.requireThat(
            input && typeof input === "object" && !Array.isArray(input),
            "Enter a report.",
          );
          const today = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
          }).format(new Date());
          const reportDate = Date.parse(`${input.date}T00:00:00Z`);
          policy.requireThat(
            /^\d{4}-\d{2}-\d{2}$/.test(input.date || "") &&
              Number.isFinite(reportDate) &&
              new Date(reportDate).toISOString().slice(0, 10) === input.date &&
              input.date <= today,
            "Choose a valid report date that is not in the future.",
          );
          const [[saved]] = await connection.execute(
            "SELECT * FROM work_daily_reports WHERE employee_id=? AND work_date=? FOR UPDATE",
            [actor.id, input.date],
          );
          policy.requireThat(
            (req.body.revision || 0) === (saved?.revision || 0),
            "This report changed. Reload before saving.",
            409,
          );
          policy.requireThat(
            saved?.state !== "Submitted",
            "The submitted report is read-only. Its saved evidence remains available.",
            409,
          );
          const entries = input.entries || {};
          policy.requireThat(
            entries &&
              typeof entries === "object" &&
              !Array.isArray(entries) &&
              Object.keys(entries).length <= 100,
            "Choose up to 100 task entries.",
          );
          const facts = [];
          for (const id of Object.keys(entries)) {
            const task = await repository.getTask(connection, id, actor);
            policy.requireThat(
              task.ownerId === actor.id ||
                task.contributorIds?.includes(actor.id),
              "Report only work you contributed to.",
              403,
            );
            const entry = entries[id];
            policy.requireThat(
              entry &&
                typeof entry === "object" &&
                typeof entry.note === "string" &&
                entry.note.length <= 4000,
              "Use a short work note.",
            );
            entry.title = task.title;
            facts.push({
              taskId: task.id,
              title: task.title,
              status: task.status,
              revision: task.revision,
              progress: task.progress,
              effortMinutes: task.effortEntries
                .filter(
                  (entry) =>
                    entry.actorId === actor.id && entry.date === input.date,
                )
                .reduce((total, entry) => total + entry.minutes, 0),
            });
          }
          input.other = policy.optionalText(input.other);
          input.remarks = policy.optionalText(input.remarks);
          const ids = reportFiles(input, true);
          policy.requireThat(ids.length <= 50, "Attach up to 50 report files.");
          for (const id of ids) {
            const [[file]] = await connection.execute(
              "SELECT uploaded_by,task_id FROM work_files WHERE id=?",
              [id],
            );
            policy.requireThat(
              file && file.uploaded_by === actor.id,
              "Choose your own saved evidence.",
            );
            if (file.task_id)
              await repository.getTask(connection, file.task_id, actor);
          }
          const submitted = req.body.submit === true;
          policy.requireThat(
            !submitted ||
              Object.keys(entries).length > 0 ||
              String(input.other || "").trim(),
            "Add work details before submitting.",
          );
          const report = {
            ...input,
            author: { id: actor.id, name: actor.name, role: actor.roles.map(role => role.label).join(' / '), email: `${actor.username}@ciril.in` },
            id: saved?.id || randomUUID(),
            employeeId: actor.id,
            date: input.date,
            revision: (saved?.revision || 0) + 1,
            state: submitted ? "Submitted" : "Draft",
            taskFacts: facts,
            recipients: employees
              .filter(
                (user) =>
                  (actor.manager ? user.oversight : user.manager) &&
                  user.id !== actor.id,
              )
              .map((user) => ({ id: user.id, name: user.name })),
            savedAt: new Date().toISOString(),
            submittedAt: submitted ? new Date().toISOString() : null,
            delivery: "Saved in the portal. Email delivery is not configured.",
          };
          await connection.execute(
            "INSERT INTO work_daily_reports(id,employee_id,work_date,revision,state,payload) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE revision=VALUES(revision),state=VALUES(state),payload=VALUES(payload),updated_at=NOW(3)",
            [
              report.id,
              actor.id,
              report.date,
              report.revision,
              report.state,
              JSON.stringify(report),
            ],
          );
          if (submitted)
            for (const recipient of report.recipients)
              await connection.execute(
                "INSERT INTO employee_notifications(employee_id,title,message) VALUES (?,?,?)",
                [
                  recipient.id,
                  "Daily report submitted",
                  `${actor.name} submitted their work report for ${report.date}.`,
                ],
              );
          return { report };
        },
      );
    });
    res.json(result);
  });
  router.use(base, (error, req, res, next) => {
    if (error.code === "ENOENT")
      return res
        .status(404)
        .json({
          message:
            "Evidence file is unavailable. Ask your manager to check the stored attachment.",
        });
    if (error.type === "entity.too.large")
      return res
        .status(413)
        .json({ message: "Evidence files must be 30 MB or smaller." });
    if (error.status && error.status < 500)
      return res.status(error.status).json({ message: error.message });
    next(error);
  });
};
