const assert = require("node:assert/strict"),
  path = require("node:path"),
  esbuild = require("esbuild");
const m = { exports: {} };
const code = esbuild.buildSync({
  entryPoints: [path.join(__dirname, "workflow.js")],
  write: false,
  bundle: true,
  platform: "node",
  format: "cjs",
}).outputFiles[0].text;
new Function("module", "exports", code)(m, m.exports);
const { recordActivity, stageOf, reportingState } = m.exports;
const state = {
    employee: {
      id: "designer-2",
      name: "New Designer",
      role: "Graphic Designer",
    },
    tasks: [
      {
        id: "D1",
        status: "Assigned",
        due: "2026-10-28T18:00:00+05:30",
        progress: 0,
        events: [],
        notes: [],
      },
    ],
  },
  now = new Date("2026-10-28T12:00:00+05:30"),
  t = state.tasks[0];
recordActivity(state, "D1", "Progress", { progress: 60, note: "Layout drafted" }, now);
assert.equal(t.status, "In progress");
assert.equal(t.events[0].by, "New Designer");
assert.equal(t.events[0].actorId, "designer-2");
assert.equal(t.events[0].before.progress, 0);
assert.equal(t.events[0].after.progress, 60);
assert.throws(() =>
  recordActivity(state, "D1", "Progress", { progress: 101, note: "Invalid" }, now),
);
assert.throws(() =>
  recordActivity(state, "D1", "Time logged", { minutes: -1, note: "Invalid" }, now),
);
recordActivity(state, "D1", "Time logged", { minutes: 45, note: "Prepared assets" }, now);
assert.equal(t.effortMinutes, 45);
recordActivity(
  state,
  "D1",
  "Blocker reported",
  { note: "Missing copy", severity: "High" },
  now,
);
assert.equal(t.status, "Blocked");
assert.equal(t.blocker.owner, "Reporting manager");
assert.throws(() => recordActivity(state, "D1", "Resume work", { note: "Resume" }, now));
t.blocker.open = false;
recordActivity(state, "D1", "Resume work", { note: "Source received" }, now);
assert.equal(t.status, "In progress");
assert.equal(reportingState(t, new Date("2026-10-29T12:00:00+05:30")), "Overdue");
assert.equal(t.status, "In progress");
assert.equal(stageOf({ status: "With Harshitha" }), "Waiting for review");
assert.equal(stageOf({ status: "With Harshitha", reviewOpened: true }), "Under review");
t.status = "Completed";
assert.throws(() =>
  recordActivity(state, "D1", "Work note", { note: "Cannot edit" }, now),
);
assert.equal(reportingState(t, now), "Completed");
console.log("Role identity, activity, blockers, stages and closed-task checks passed.");

const deadlineState = {
  employee: { id: "owner", name: "Another Designer", role: "Graphic Designer" },
  tasks: [
    {
      id: "REQ",
      ownerId: "owner",
      status: "In progress",
      due: "2026-10-28T18:00:00+05:30",
      originalDue: "2026-10-28T18:00:00+05:30",
      events: [],
      notes: [],
    },
  ],
};
const request = deadlineState.tasks[0];
recordActivity(
  deadlineState,
  "REQ",
  "Deadline request",
  {
    note: "Waiting for approved copy",
    requestedDue: "2026-10-29T18:00:00+05:30",
  },
  now,
);
assert.equal(request.due, request.originalDue);
assert.equal(request.deadlineRequest.status, "Awaiting manager decision");
assert.throws(() =>
  recordActivity(
    deadlineState,
    "REQ",
    "Deadline request",
    { note: "Invalid date", requestedDue: "invalid" },
    now,
  ),
);
request.ownerId = "other";
assert.throws(() =>
  recordActivity(
    deadlineState,
    "REQ",
    "Work note",
    { note: "Cannot edit transferred work" },
    now,
  ),
);
console.log("Extension requests preserve deadlines; transferred work rejects updates.");
