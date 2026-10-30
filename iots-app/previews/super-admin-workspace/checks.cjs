const assert = require("node:assert/strict"),
  path = require("node:path"),
  fs = require("node:fs");
const root = path.resolve(__dirname, "../../..");
const esbuild = require(
  path.join(root, ".local/preview-build/node_modules/esbuild"),
);
async function main() {
  const output = path.join(root, ".local/governance-review/api-check.cjs");
  await esbuild.build({
    stdin: {
      contents: `export * from './api'; export {defaultActor} from './seed';`,
      resolveDir: __dirname,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: output,
  });
  const storage = new Map();
  global.localStorage = {
    getItem: (k) => storage.get(k) || null,
    setItem: (k, v) => storage.set(k, v),
  };
  const {
    api,
    defaultActor: actor,
    ratio,
    filterRows,
    attendanceRows,
  } = require(output);
  const reason = "Reviewed the example source record";
  let d = await api.readWorkspace(actor);
  assert.equal(ratio(0, 0), "N/A");
  assert.equal(d.employees.find((e) => e.id === "EMP-003").roles.length, 2);
  d.employees[0].name = "Changed outside API";
  assert.notEqual(
    (await api.readWorkspace(actor)).employees[0].name,
    d.employees[0].name,
  );
  await assert.rejects(
    api.readWorkspace({ ...actor, activeRole: "Admin" }),
    /scope/,
  );
  await assert.rejects(api.createEmployee(actor, {}, "x"), /reason/);
  assert.equal(typeof api.approveLeave, "undefined");
  const e = await api.createEmployee(
    actor,
    {
      name: "Example Reviewer",
      email: "reviewer@example.test",
      roles: "Executive",
      family: "Execution",
      department: "Operations",
      designation: "Executive",
      office: "Hyderabad",
      managerId: "EMP-002",
    },
    reason,
  );
  assert.ok(e.id.startsWith("EMP-"));
  await assert.rejects(
    api.createEmployee(
      actor,
      {
        name: "Duplicate",
        email: e.email,
        roles: "Executive",
        family: "Execution",
        department: "Operations",
      },
      reason,
    ),
    /already/,
  );
  const issue = "ISS-201";
  await api.referToManager(actor, issue, reason);
  d = await api.readWorkspace(actor);
  assert.ok(
    d.notices.some((n) => n.recipientId === "EMP-002" && n.message === reason),
  );
  assert.equal(
    d.issues.find((i) => i.id === issue).decision,
    "Awaiting responsible manager review",
  );
  await api.decideAccountChange(actor, "AUTH-302", true, reason);
  d = await api.readWorkspace(actor);
  assert.equal(d.employees.find((e) => e.id === "EMP-008").active, false);
  assert.equal(d.changes.find((c) => c.id === "AUTH-302").status, "Authorised");
  await assert.rejects(
    api.decideAccountChange(actor, "AUTH-302", true, reason),
    /already/,
  );
  const original = d.attendance[6].location;
  await api.correctAttendance(
    actor,
    "ATT-7",
    "location",
    "Remote",
    reason,
    "ATT-7 original reading and manager note",
  );
  d = await api.readWorkspace(actor);
  assert.equal(d.attendance[6].location, original);
  assert.equal(d.attendance[6].corrections[0].after, "Remote");
  assert.equal(attendanceRows(d)[6].location, "Remote");
  assert.equal(attendanceRows(d)[6].originalLocation, original);
  const beforeTasks = d.tasks.length;
  await api.updateTask(
    actor,
    "TASK-102",
    { ownerId: "EMP-007", instructions: "Follow the source brief" },
    reason,
  );
  d = await api.readWorkspace(actor);
  assert.equal(d.tasks.length, beforeTasks);
  assert.equal(d.tasks.find((t) => t.id === "TASK-102").transfers.length, 4);
  const csv = await api.exportView(
    actor,
    "attendance",
    { location: "Remote", department: "Business Development" },
    "CSV",
  );
  const text = await csv.blob.text();
  assert.ok(text.includes("EMP-006"));
  assert.ok(!text.includes("EMP-004"));
  assert.ok(!text.includes("passwordChanged"));
  const excel = await api.exportView(actor, "employees", {}, "Excel");
  const bytes = new Uint8Array(await excel.blob.arrayBuffer());
  assert.equal(Buffer.from(bytes).subarray(0, 2).toString(), "PK");
  fs.writeFileSync(
    path.join(root, ".local/governance-review/checked.xlsx"),
    bytes,
  );
  await assert.rejects(
    api.generateReport(actor, {}, "EMP-003", reason),
    /disabled/,
  );
  await api.saveSettings(actor, { exportEmail: true }, reason);
  const report = await api.generateReport(actor, {}, "EMP-003", reason);
  assert.match(report.scope, /EMP-003/);
  await api.saveSettings(actor, { exportEnabled: false }, reason);
  await assert.rejects(
    api.exportView(actor, "employees", {}, "CSV"),
    /disabled/,
  );
  const next = await api.switchRole(actor, "IT System Analyst");
  assert.equal(next.activeRole, "IT System Analyst");
  d = await api.readWorkspace(next);
  assert.ok(
    d.audit.every(
      (a) =>
        a.actor.employeeId &&
        a.actor.activeRole &&
        a.reason &&
        "before" in a &&
        "after" in a,
    ),
  );
  assert.ok(
    filterRows(d.employees, { roles: "Creative Communication Executive" }).some(
      (e) => e.id === "EMP-003",
    ),
  );
  await api.editEmployee(
    actor,
    actor.employeeId,
    {
      name: "Manikanta Example",
      department: "IT",
      office: "Hyderabad",
      designation: "IT System Analyst",
      managerId: "EMP-001",
      availability: "Available",
    },
    reason,
  );
  const self = await api.readWorkspace(actor);
  assert.equal(
    self.employees.find((e) => e.id === actor.employeeId).name,
    "Manikanta Example",
  );
  assert.equal(self.audit[0].actor.name, "Manikanta Example");
  await api.saveSettings(
    actor,
    {
      exportEnabled: true,
      designations: [...self.settings.designations, "Example role"],
    },
    reason,
  );
  await assert.rejects(
    api.generateReport(actor, {}, "EMP-008", reason),
    /authorised/,
  );
  const definitions = await api.readWorkspace(actor);
  assert.deepEqual(definitions.settings.permissions["Example role"], ["View"]);
  await api.markAnnouncementRead(actor, "ANN-401");
  await assert.rejects(
    api.markAnnouncementRead(actor, "ANN-402"),
    /only for live/,
  );
  console.log(
    "PASS: typed mock boundary, role restrictions, mandatory reasons, authorisation, manager referral, immutable source corrections, stable task identity, filtered exports, XLSX container, recipient scope, export policy and append-only audit.",
  );
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
