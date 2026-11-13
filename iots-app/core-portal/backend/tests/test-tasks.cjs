const test = require("node:test");
const assert = require("node:assert/strict");
const mysql = require("mysql2/promise");
const express = require("express");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { once } = require("node:events");

test("authenticated task engine: MySQL lifecycle, separation, evidence, reports and idempotency", async (t) => {
  const database = `iots_tasks_test_${Date.now()}`;
  assert.match(database, /^iots_tasks_test_\d+$/);
  const admin = await mysql.createConnection({
    host: "127.0.0.1",
    port: Number(process.env.IOTS_TEST_DB_PORT || 3307),
    user: process.env.IOTS_TEST_ADMIN_USER || "root",
    password: process.env.IOTS_TEST_ADMIN_PASSWORD || "IotsLocalRoot!2026",
    multipleStatements: true,
  });
  let pool, server;
  const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "iots-task-test-"));
  const storage = path.join(temporaryRoot, '.local', 'task-evidence');
  process.env.IOTS_TASK_ROOT = storage;
  t.after(async () => {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (pool) await pool.end();
    await admin.query(`DROP DATABASE IF EXISTS ${database}`);
    await admin.end();
    assert.ok(path.basename(temporaryRoot).startsWith("iots-task-test-"));
    await fs.rm(temporaryRoot, { recursive: true, force: true });
  });
  const schema = (
    await fs.readFile(path.join(__dirname, "../database/schema.sql"), "utf8")
  ).replaceAll("iots_auth_temp", database);
  await admin.query(schema);
  const taskSchema = await fs.readFile(
    path.join(__dirname, "../database/tasks-schema.sql"),
    "utf8",
  );
  await admin.query(taskSchema);
  for (const [id, name] of [
    [1, "Manager One"],
    [2, "Manager Two"],
    [3, "Designer"],
    [4, "Lead"],
    [5, "Chair"],
    [6, "Executive"],
  ])
    await admin.execute(
      "INSERT INTO employees(id,username,name,password_hash) VALUES (?,?,?,?)",
      [id, `task_test_${id}`, name, "not-a-login-password"],
    );
  for (const code of [
    "general-manager",
    "senior-manager",
    "creative-communication-associate",
    "lead-manager",
    "chairman",
    "executive",
  ])
    await admin.execute("INSERT INTO roles(code,label) VALUES (?,?)", [
      code,
      code,
    ]);
  for (const [id, role] of [
    [1, "general-manager"],
    [1, "executive"],
    [2, "senior-manager"],
    [3, "creative-communication-associate"],
    [4, "lead-manager"],
    [5, "chairman"],
    [6, "executive"],
  ])
    await admin.execute(
      "INSERT INTO employee_roles(employee_id,role_code) VALUES (?,?)",
      [id, role],
    );
  for (const [id, role] of [
    [1, "general-manager"],
    [2, "senior-manager"],
    [3, "creative-communication-associate"],
    [4, "lead-manager"],
    [5, "chairman"],
    [6, "executive"],
  ]) {
    await admin.execute(
      "INSERT INTO sessions(token_hash,employee_id,active_role,expires_at) VALUES (?,?,?,DATE_ADD(NOW(),INTERVAL 1 DAY))",
      [String(id).repeat(64), id, role],
    );
    await admin.execute(
      "INSERT INTO session_locations(token_hash,stage) VALUES (?,?)",
      [String(id).repeat(64), "active"],
    );
  }
  pool = mysql.createPool({
    host: "127.0.0.1",
    port: Number(process.env.IOTS_TEST_DB_PORT || 3307),
    user: process.env.IOTS_TEST_ADMIN_USER || "root",
    password: process.env.IOTS_TEST_ADMIN_PASSWORD || "IotsLocalRoot!2026",
    database,
    connectionLimit: 8,
  });
  const app = express();
  app.use(express.json({ limit: "512kb" }));
  // Isolated harness supplies real DB sessions, never installed in the application.
  app.use((req, res, next) => {
    const id = Number(req.headers["x-test-actor"]);
    req.session = { token_hash: String(id).repeat(64), employee_id: id };
    next();
  });
  require("../src/tasks/routes")(app, { pool });
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(error.status || 500).json({ message: error.message });
  });
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}/api/auth/tasks`;
  const request = async (
    actor,
    suffix = "",
    body,
    key = randomUUID(),
    raw = false,
    headers = {},
  ) => {
    const response = await fetch(base + suffix, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        "x-test-actor": String(actor),
        "idempotency-key": key,
        ...(body === undefined
          ? {}
          : raw
            ? {
                "content-type": "application/octet-stream",
                "x-file-name": "evidence.txt",
              }
            : { "content-type": "application/json" }),
        ...headers,
      },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
    return {
      code: response.status,
      headers: response.headers,
      body: response.headers.get("content-type")?.startsWith("application/json")
        ? await response.json()
        : await response.text(),
    };
  };
  const action = (actor, task, action, extra = {}, key) =>
    request(
      actor,
      `/${task.id}/actions`,
      { action, revision: task.revision, ...extra },
      key,
    );
  const definition = {
    title: "Welcome creative",
    brief: "Create an approved member welcome graphic",
    category: "Member materials",
    ownerId: 3,
    reviewerId: 2,
    due: new Date(Date.now() + 2 * 86400000).toISOString(),
    criteria: ["Use approved branding"],
    deliverables: ["Final artwork"],
  };
  await admin.execute('INSERT INTO employee_roles(employee_id,role_code) VALUES (5,?)', ['executive']);
  assert.equal((await request(1, '', { ...definition, ownerId: 5 })).code, 422);
  assert.equal((await request(4, "", definition)).code, 403);
  assert.equal((await request(6, "", definition)).code, 403);
  const key = randomUUID();
  const created = await request(1, "", definition, key);
  assert.equal(created.code, 201);
  let task = created.body.task;
  assert.equal((await action(1, task, 'edit', { ownerId: 5 })).code, 422);
  const reference = await request(
    1,
    `/${task.id}/files`,
    Buffer.from("Manager reference brief"),
    undefined,
    true,
    { "x-file-purpose": "reference" },
  );
  assert.equal(reference.code, 201);
  task = reference.body.task;
  assert.equal(task.referenceFiles[0].purpose, "reference");
  assert.match(task.referenceFiles[0].sha256, /^[a-f0-9]{64}$/);
  assert.equal((await request(1, "", definition, key)).body.task.id, task.id);
  assert.equal(
    (await request(1, "", { ...definition, title: "Different request" }, key))
      .code,
    409,
  );
  assert.equal((await request(2)).body.tasks.length, 0);
  assert.equal((await request(3)).body.tasks.length, 0);
  task = (await action(1, task, 'edit', { brief: 'Prepare the revised welcome artwork with the new approved logo.' })).body.task;
  const draftEdit = task.events.at(-1);
  assert.equal(draftEdit.source, 'manager-command');
  assert.deepEqual(draftEdit.changes.find(change => change.field === 'brief'), { field: 'brief', before: definition.brief, after: 'Prepare the revised welcome artwork with the new approved logo.' });
  task = (await action(1, task, "assign")).body.task;
  const employeeHistory = (await request(3, `/${task.id}`)).body.task.events;
  assert.equal(employeeHistory.some(entry => entry.id === draftEdit.id || entry.action === 'Created'), false);
  assert.ok(employeeHistory.at(-1).changes.some(change => change.field === 'status' && change.before === 'Draft' && change.after === 'Assigned'));
  assert.equal((await request(5)).body.tasks.length, 1);
  assert.equal((await request(4)).body.tasks.length, 0);
  assert.equal((await action(5, task, "cancel", { note: "No" })).code, 403);
  assert.equal((await action(3, task, "work-update", { progress:10, note:"Made a layout" })).code,409);
  assert.equal((await action(3, task, "submit", { note:"Review" })).code,409);
  const stale = task;
  task = (await action(3, task, "start")).body.task;
  assert.equal((await action(3, stale, "start")).code, 409);
  assert.equal((await action(3, task, "work-update", { progress:10 })).code,422);
  task = (
    await action(3, task, "progress", { progress: 45, note: "Layout ready" })
  ).body.task;
  assert.equal(task.status, "In progress");
  const updateRevision = task.revision;
  task = (
    await action(3, task, "work-update", {
      progress: 55,
      minutes: 15,
      note: "Adjusted the member heading",
    })
  ).body.task;
  assert.equal(task.revision, updateRevision + 1);
  assert.equal(task.status, "In progress");
  assert.equal(task.notes.at(-1).text, "Adjusted the member heading");
  task = (
    await action(3, task, "effort", { minutes: 45, note: "Prepared artwork" })
  ).body.task;
  assert.equal(task.effortMinutes, 60);
  task = (
    await action(3, task, "block", { note: "Need correct member details" })
  ).body.task;
  assert.equal((await action(3, task, "resume")).code, 409);
  task = (await action(1, task, "resolve", { note: "Details confirmed" })).body
    .task;
  task = (await action(3, task, "resume")).body.task;
  const originalDue = task.due;
  task = (
    await action(3, task, "request-deadline", {
      requestedDue: new Date(Date.now() + 3 * 86400000).toISOString(),
      note: "Extra output required",
    })
  ).body.task;
  task = (
    await action(2, task, "decide-deadline", {
      decision: "approve",
      note: "Agreed",
    })
  ).body.task;
  assert.equal(task.originalDue, originalDue);
  assert.notEqual(task.due, originalDue);
  const uploaded = await request(
    3,
    `/${task.id}/files`,
    Buffer.from("Final file proof"),
    undefined,
    true,
  );
  assert.equal(uploaded.code, 201);
  task = uploaded.body.task;
  const fileId = uploaded.body.file.id;
  assert.equal((await request(4, `/files/${fileId}`)).code, 404);
  assert.equal((await request(2, `/files/${fileId}`)).body, "Final file proof");
  for (const actor of [1, 2, 3, 5]) {
    const savedDownload = await request(actor, `/files/${fileId}`);
    assert.equal(savedDownload.code, 200); assert.equal(savedDownload.body, 'Final file proof');
    assert.match(savedDownload.headers.get('content-disposition'), /^attachment;/);
    const preview = await request(actor, `/files/${fileId}?preview=1`);
    assert.equal(preview.code, 200); assert.match(preview.headers.get('content-type'), /^text\/plain/);
    assert.match(preview.headers.get('content-disposition'), /^inline;/);
  }
  assert.equal((await request(4, `/files/${fileId}?preview=1`)).code, 404);
  task = (
    await action(3, task, "save-draft", {
      note: "Working version",
      fileIds: [fileId],
      file: "evidence.txt",
    })
  ).body.task;
  const draftId = task.workingDrafts[0].id;
  task = (
    await action(3, task, "save-draft", {
      note: "Updated working version",
      fileIds: [fileId],
      file: "evidence.txt",
      draftId,
    })
  ).body.task;
  assert.equal(task.workingDrafts.length, 1);
  assert.equal(task.workingDrafts[0].id, draftId);
  task = (
    await action(3, task, "submit", {
      note: "Please review",
      fileIds: [fileId],
      file: "evidence.txt",
      draftId,
    })
  ).body.task;
  assert.equal(task.workingDrafts.length, 0);
  assert.equal(task.versions[0].attachments[0].id, fileId);
  assert.equal(
    (await action(1, task, "approve", { note: "Not my review" })).code,
    403,
  );
  task = (await action(2, task, "changes", { note: "Increase heading size" }))
    .body.task;
  task = (
    await action(3, task, "submit", {
      note: "Corrected heading",
      fileIds: [fileId],
    })
  ).body.task;
  assert.equal(
    (await action(2, task, "approve", { note: "No acceptance confirmation" }))
      .code,
    422,
  );
  const decisions = await Promise.all([
    action(2, task, "approve", { acceptanceConfirmed: true, note: "Approved" }),
    action(2, task, "changes", { note: "Another request" }),
  ]);
  assert.deepEqual(decisions.map((result) => result.code).sort(), [200, 409]);
  let transferred = (
    await request(1, "", {
      ...definition,
      title: "Transferred task",
      publicationRequired: true,
    })
  ).body.task;
  transferred = (await action(1, transferred, "assign")).body.task;
  transferred = (await action(3, transferred, "start")).body.task;
  assert.equal((await action(1, transferred, 'reassign', { ownerId: 5, note: 'Cannot assign strategic oversight work' })).code, 422);
  transferred = (
    await action(3, transferred, "note", {
      note: "Prepared first handover notes",
    })
  ).body.task;
  transferred = (
    await action(1, transferred, "reassign", {
      ownerId: 6,
      note: "Continue with Executive",
    })
  ).body.task;
  assert.equal((await request(3, `/${transferred.id}`)).code, 200);
  assert.equal((await action(3, transferred, "start")).code, 403);
  assert.ok(
    (await request(3)).body.tasks.some((item) => item.id === transferred.id),
  );
  transferred = (await action(6, transferred, "start")).body.task;
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';
  const source = await request(
    6,
    `/${transferred.id}/files`,
    Buffer.from(svg),
    undefined,
    true,
    { "x-file-name": "source.svg" },
  );
  assert.equal(source.code, 201);
  transferred = source.body.task;
  const download = await request(6, `/files/${source.body.file.id}`);
  assert.equal(
    download.headers.get("content-type"),
    "application/octet-stream",
  );
  assert.match(download.headers.get("content-disposition"), /^attachment;/);
  assert.match(download.headers.get("content-security-policy"), /sandbox/);
  assert.equal((await request(6, `/files/${source.body.file.id}?preview=1`)).code, 415);
  assert.equal(
    (
      await request(
        6,
        `/${transferred.id}/files`,
        Buffer.from("not a PDF"),
        undefined,
        true,
        { "x-file-name": "fake.pdf" },
      )
    ).code,
    422,
  );
  transferred = (
    await action(6, transferred, "submit", {
      note: "Final source",
      fileIds: [source.body.file.id],
    })
  ).body.task;
  assert.equal(
    (
      await action(2, transferred, "approve", {
        acceptanceConfirmed: true,
        note: "Approved",
      })
    ).code,
    409,
  );
  transferred = (
    await action(6, transferred, "publication-proof", {
      note: "Published with the approved outcome",
      fileIds: [source.body.file.id],
    })
  ).body.task;
  transferred = (
    await action(2, transferred, "approve", {
      acceptanceConfirmed: true,
      note: "Proof reviewed",
    })
  ).body.task;
  assert.equal(transferred.status, "Completed");
  assert.equal((await action(1, transferred, 'rate', { score: 5, note: 'Not the named reviewer' })).code, 403);
  assert.equal((await action(6, transferred, 'rate', { score: 5, note: 'Cannot rate own work' })).code, 403);
  for (const score of [0, 6, 2.5, '5']) assert.equal((await action(2, transferred, 'rate', { score, note: 'Invalid score' })).code, 422);
  assert.equal((await action(2, transferred, 'rate', { score: 4, note: '' })).code, 422);
  const ratedVersion = transferred.versions.at(-1).number;
  transferred = (await action(2, transferred, 'rate', { score: 4, note: 'The final work meets the brief clearly.' })).body.task;
  assert.equal(transferred.rating.score, 4); assert.equal(transferred.rating.actorId, 2); assert.equal(transferred.rating.version, ratedVersion);
  assert.equal((await action(2, transferred, 'rate', { score: 5, note: 'Cannot rewrite history' })).code, 409);
  assert.equal((await request(6, `/${transferred.id}`)).body.task.rating.score, 4);
  const reportUpload = await request(
    3,
    "/report-files",
    Buffer.from("Daily evidence"),
    undefined,
    true,
  );
  assert.equal(reportUpload.code, 201);
  assert.equal(
    (await request(1, `/files/${reportUpload.body.file.id}`)).code,
    404,
  );
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  const report = {
    date,
    entries: {
      [task.id]: {
        title: task.title,
        note: "Prepared and submitted the member welcome artwork.",
        proofs: [uploaded.body.file],
      },
    },
    other: "",
    proofs: [reportUpload.body.file],
  };
  const saved = await request(3, "/reports", {
    report,
    revision: 0,
    submit: true,
  });
  assert.equal(saved.code, 200);
  assert.equal(saved.body.report.state, "Submitted");
  assert.equal(
    (await request(1, `/files/${reportUpload.body.file.id}`)).body,
    "Daily evidence",
  );
  assert.equal(
    (await request(4, `/files/${reportUpload.body.file.id}`)).code,
    404,
  );
  assert.equal((await request(1)).body.reports.length, 1);
  assert.equal((await request(4)).body.reports.length, 0);
  assert.equal(
    (
      await request(3, "/reports", {
        report,
        revision: saved.body.report.revision,
        submit: false,
      })
    ).code,
    409,
  );
  const invalidReport = { ...report, date: "2026-02-31" };
  assert.equal(
    (await request(3, "/reports", { report: invalidReport, revision: 0 })).code,
    422,
  );
  const unsavedProof = {
    ...report,
    date: "2026-01-01",
    proofs: [{ id: randomUUID(), name: "not-saved.pdf", server: false }],
  };
  assert.equal(
    (await request(3, "/reports", { report: unsavedProof, revision: 0 })).code,
    422,
  );
  // Removing management roles takes effect without re-authenticating or changing activeRole.
  await admin.execute("UPDATE sessions SET active_role=? WHERE employee_id=1", [
    "executive",
  ]);
  await admin.execute(
    "DELETE FROM employee_roles WHERE employee_id=1 AND role_code=?",
    ["general-manager"],
  );
  assert.equal((await request(1, "", definition)).code, 403);
  const [[counts]] = await admin.execute(
    "SELECT COUNT(*) AS count FROM work_tasks",
  );
  assert.equal(counts.count, 2);
  const [[history]] = await admin.execute(
    "SELECT COUNT(*) AS count FROM work_task_events",
  );
  assert.ok(history.count >= 10);
});
