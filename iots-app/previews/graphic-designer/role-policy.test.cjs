const assert = require("node:assert/strict"),
  path = require("node:path"),
  esbuild = require("esbuild");
function load(file) {
  const m = { exports: {} };
  new Function(
    "module",
    "exports",
    esbuild.buildSync({
      entryPoints: [path.join(__dirname, file)],
      bundle: true,
      write: false,
      platform: "node",
      format: "cjs",
    }).outputFiles[0].text,
  )(m, m.exports);
  return m.exports;
}
const { initialState, submitTask, dailyReport, queueDailyReport } = load("model.js");
const { canAccessReport, workspaceApi } = load("api.js");
const { designerRole } = load("role-policy.js");
const now = new Date("2026-10-28T12:00:00+05:30");
const s = initialState(now, {
  id: "another-employee",
  name: "Another employee",
  role: "Graphic Designer",
});
s.workspace.reviewStages[0] = {
  id: "brand-review",
  label: "Brand reviewer",
  mandate: "brand-review",
  optional: false,
};
s.workspace.reportAudience = ["Operations manager", "Company director"];
submitTask(s, "DES-104", "layout.pdf", "Draft supplied", now);
assert.equal(s.tasks[0].status, "In review");
assert.equal(s.tasks[0].reviewStageId, "brand-review");
assert.equal(s.tasks[0].events.at(-1).actorId, "another-employee");
assert.equal(dailyReport(s, "2026-10-28").completed.length, 0);
queueDailyReport(s, now, true);
assert.deepEqual(s.deliveries[0].recipients, ["Operations manager", "Company director"]);
assert.equal(
  canAccessReport(s.employee, { id: "reviewer", roleId: "creative-reviewer" }),
  false,
);
assert.equal(
  canAccessReport(s.employee, { id: "manager", roleId: "general-manager" }),
  false,
);
assert.equal(
  canAccessReport(s.employee, {
    id: "manager",
    grants: [{ capability: "report.read", employeeIds: ["someone-else"] }],
  }),
  false,
);
assert.equal(
  canAccessReport(s.employee, {
    id: "manager",
    grants: [{ capability: "report.read", employeeIds: [s.employee.id] }],
  }),
  true,
);
assert.equal(canAccessReport(s.employee, s.employee), true);
const denied = initialState(now);
denied.workspace.capabilities = denied.workspace.capabilities.filter(
  (c) => c !== "task.submit.own",
);
assert.throws(
  () => submitTask(denied, "DES-104", "a.pdf", "Draft", now),
  /role cannot submit/,
);
const legacy = initialState(now);
delete legacy.workspace;
legacy.tasks[0].status = "With previous reviewer";
global.localStorage = { getItem: () => JSON.stringify(legacy) };
workspaceApi.load().then((result) => {
  assert.equal(result.tasks[0].status, "In review");
  assert.equal(result.tasks[0].reviewStageId, designerRole.reviewStages[0].id);
  assert.equal(result.tasks[0].legacyStatus, "With previous reviewer");
  console.log(
    "Role configuration, alternative employee, scoped report grants and legacy migration passed.",
  );
});
