const assert = require("node:assert/strict"),
  path = require("node:path");
const esbuild = require("esbuild");
const result = esbuild.buildSync({
  entryPoints: [path.join(__dirname, "model.js")],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
});
const m = { exports: {} };
new Function("module", "exports", result.outputFiles[0].text)(m, m.exports);
const {
  initialState,
  shiftFor,
  reportReminder,
  queueDailyReport,
  dailyReport,
  submitTask,
  returnForChanges,
} = m.exports;
const wed = new Date("2026-10-28T17:29:00+05:30"),
  s = initialState(wed);
assert.equal(reportReminder(s, wed), false);
assert.equal(reportReminder(s, new Date("2026-10-28T17:30:00+05:30")), true);
assert.equal(
  shiftFor(new Date("2026-10-31T12:00:00+05:30")).remindAt.toISOString(),
  "2026-10-31T10:00:00.000Z",
);
assert.equal(shiftFor(new Date("2026-11-01T12:00:00+05:30")).end, null);
assert.equal(queueDailyReport(s, wed), false);
assert.throws(() => submitTask(s, "DES-102", "", "", wed));
submitTask(s, "DES-102", "version2.pdf", "Corrected spacing", wed);
assert.equal(s.tasks[1].status, "In review");
const original = s.tasks[1].originalDue;
assert.throws(() =>
  returnForChanges(
    s,
    "DES-102",
    "management-review",
    "",
    "Retain",
    null,
    "Time remains",
    wed,
  ),
);
returnForChanges(
  s,
  "DES-102",
  "management-review",
  "Adjust headline",
  "Extend",
  "2026-10-29T18:00:00+05:30",
  "Extra revision",
  wed,
);
assert.equal(s.tasks[1].originalDue, original);
assert.equal(dailyReport(s, "2026-10-28").completed.length, 0);
assert.equal(queueDailyReport(s, new Date("2026-10-28T18:00:00+05:30")), true);
assert.equal(queueDailyReport(s, new Date("2026-10-28T19:00:00+05:30")), false);
s.remarks["2026-10-28"] = "New remark";
assert.equal(s.deliveries[0].report.remarks.includes("New remark"), false);
console.log("Designer report and reminder checks passed.");
