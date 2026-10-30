const assert = require("node:assert/strict"),
  path = require("node:path"),
  esbuild = require("esbuild");
const loaded = { exports: {} };
new Function(
  "module",
  "exports",
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, "journey.js")],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  }).outputFiles[0].text,
)(loaded, loaded.exports);
const { journeyDates } = loaded.exports;
assert.deepEqual(
  journeyDates({ events: [] }),
  Array.from({ length: 4 }, () => ({ visits: 0 })),
);
const assigned = "2026-10-30T09:00:00Z",
  working = "2026-10-30T10:00:00Z",
  review = "2026-10-30T11:00:00Z",
  revision = "2026-10-30T12:00:00Z",
  resubmit = "2026-10-30T13:00:00Z";
const dates = journeyDates({
  events: [
    { action: "Assigned", at: assigned },
    { action: "Progress", after: { status: "In progress" }, at: working },
    { action: "In review", at: review },
    { action: "Work note", after: { status: "In review" }, at: review },
    { action: "In progress", at: revision },
    { action: "In review", at: resubmit },
    { action: "Unknown", at: "bad date" },
  ],
});
assert.equal(dates[0].stopped, working);
assert.equal(dates[1].started, revision);
assert.equal(dates[1].stopped, resubmit);
assert.equal(dates[1].visits, 2);
assert.equal(dates[2].started, resubmit);
assert.equal(dates[2].stopped, undefined);
assert.equal(dates[2].visits, 2);
assert.equal(
  journeyDates({
    createdAt: assigned,
    events: [{ action: "In progress", at: working }],
  })[0].started,
  assigned,
);
console.log(
  "PASS stage dates, repeated visits, stable equal-time ordering and unknown evidence.",
);
