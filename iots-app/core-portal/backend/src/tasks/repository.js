const { withSession, requireStage } = require("../auth/session-state");
const policy = require("./policy");
const { createHash } = require("node:crypto");
const parse = (value) =>
  typeof value === "string" ? JSON.parse(value) : value;
const executionRoles = new Set([
  "general-manager",
  "senior-manager",
  "executive",
  "coordinator",
  "lead-manager",
  "business-development-executive",
  "creative-communication-associate",
  "it-system-analyst",
]);

async function directory(connection) {
  const [rows] = await connection.execute(
    "SELECT e.id,e.name,e.username,r.code,r.label FROM employees e JOIN employee_roles er ON er.employee_id=e.id JOIN roles r ON r.code=er.role_code ORDER BY e.name,r.label",
  );
  const result = new Map();
  for (const row of rows) {
    const user = result.get(row.id) || {
      id: row.id,
      name: row.name,
      username: row.username,
      roles: [],
    };
    user.roles.push({ code: row.code, label: row.label });
    result.set(row.id, user);
  }
  return [...result.values()].map((user) => ({
    ...user,
    manager: user.roles.some((role) =>
      ["general-manager", "senior-manager"].includes(role.code),
    ),
    oversight: user.roles.some((role) => role.code === "chairman"),
    execute: !user.roles.some((role) => role.code === "chairman") && user.roles.some((role) => executionRoles.has(role.code)),
  }));
}
async function context(pool, session, callback) {
  return withSession(pool, session.token_hash, async (connection, current) => {
    requireStage(current, "active");
    const employees = await directory(connection);
    const actor = employees.find((user) => user.id === current.employee_id);
    policy.requireThat(
      actor,
      "Your assigned roles have changed. Sign in again.",
      403,
    );
    return callback(connection, actor, employees);
  });
}
async function getTask(connection, id, actor, lock = false) {
  const [[row]] = await connection.execute(
    `SELECT payload FROM work_tasks WHERE id=?${lock ? " FOR UPDATE" : ""}`,
    [id],
  );
  const task = row && parse(row.payload);
  policy.requireThat(
    task && policy.visible(task, actor),
    "Task not available.",
    404,
  );
  return task;
}
async function saveTask(connection, task) {
  await connection.execute(
    "INSERT INTO work_tasks (id,owner_id,reviewer_id,created_by,status,revision,due_at,payload) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE owner_id=VALUES(owner_id),reviewer_id=VALUES(reviewer_id),status=VALUES(status),revision=VALUES(revision),due_at=VALUES(due_at),payload=VALUES(payload),updated_at=NOW(3)",
    [
      task.id,
      task.ownerId || null,
      task.reviewerId || null,
      task.createdBy,
      task.status,
      task.revision,
      task.due ? new Date(task.due) : null,
      JSON.stringify(task),
    ],
  );
}
async function audit(connection, task, key) {
  const entry = task.events.at(-1);
  await connection.execute(
    "INSERT INTO work_task_events(id,task_id,actor_id,command_key,payload) VALUES (?,?,?,?,?)",
    [entry.id, task.id, entry.actorId, key, JSON.stringify(entry)],
  );
  const recipient = ["submit", "request-deadline", "block"].includes(
    entry.action,
  )
    ? task.reviewerId
    : [
          "assign",
          "reassign",
          "changes",
          "approve",
          "resolve",
          "decide-deadline",
          "delegate-reviewer",
          "cancel",
            "rate",
        ].includes(entry.action)
      ? task.ownerId
      : null;
  if (recipient && recipient !== entry.actorId)
    await connection.execute(
      "INSERT INTO employee_notifications(employee_id,title,message) VALUES (?,?,?)",
      [
        recipient,
        `Task ${entry.action}: ${task.title}`.slice(0, 160),
        `${task.id}: ${entry.detail}`.slice(0, 500),
      ],
    );
  if (
    entry.action === "delegate-reviewer" &&
    task.reviewerId !== entry.actorId &&
    task.reviewerId !== recipient
  )
    await connection.execute(
      "INSERT INTO employee_notifications(employee_id,title,message) VALUES (?,?,?)",
      [
        task.reviewerId,
        "Task review delegated",
        `${task.id}: ${task.title}`.slice(0, 500),
      ],
    );
}
function commandKey(req) {
  const key = req.headers["idempotency-key"];
  policy.requireThat(
    typeof key === "string" && /^[A-Za-z0-9_-]{12,80}$/.test(key),
    "A unique Idempotency-Key is required for this change.",
  );
  return key;
}
async function command(connection, actor, key, fingerprint, callback) {
  const hash = createHash("sha256").update(fingerprint).digest("hex");
  const [[previous]] = await connection.execute(
    "SELECT request_hash,response FROM work_commands WHERE actor_id=? AND command_key=?",
    [actor.id, key],
  );
  if (previous) {
    policy.requireThat(
      previous.request_hash === hash,
      "This request key was already used for a different change.",
      409,
    );
    return parse(previous.response);
  }
  const result = await callback();
  await connection.execute(
    "INSERT INTO work_commands(actor_id,command_key,request_hash,response) VALUES (?,?,?,?)",
    [actor.id, key, hash, JSON.stringify(result)],
  );
  return result;
}
module.exports = {
  parse,
  context,
  getTask,
  saveTask,
  audit,
  command,
  commandKey,
};
