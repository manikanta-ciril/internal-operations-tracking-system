const assert = require("node:assert/strict"),
  path = require("node:path"),
  esbuild = require("esbuild");
const m = { exports: {} };
new Function(
  "module",
  "exports",
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, "effort.js")],
    bundle: true,
    platform: "node",
    format: "cjs",
    write: false,
  }).outputFiles[0].text,
)(m, m.exports);
const { dailyEffort, effortMinutes, saveWorkUpdate } = m.exports;
const now = new Date("2026-10-30T00:15:00+05:30");
assert.equal(
  dailyEffort(
    {
      effortMinutes: 999,
      effortEntries: [
        { at: "2026-10-29T18:29:00Z", minutes: 40 },
        { at: "2026-10-29T18:31:00Z", minutes: 25 },
      ],
    },
    now,
  ),
  25,
);
assert.equal(effortMinutes(1.5, "hours"), 90);
assert.throws(() => effortMinutes(-1, "minutes"));
assert.throws(() => effortMinutes(0.1, "minutes"));
const state = {
  employee: { id: "u", name: "Designer", role: "Graphic Designer" },
  tasks: [
    { id: "t", ownerId: "u", status: "In progress", progress: 20, notes: [], events: [] },
  ],
};
saveWorkUpdate(state, "t", { note: "", progress: 30, amount: 1.5, unit: "hours" }, now);
assert.equal(state.tasks[0].progress, 30);
assert.equal(dailyEffort(state.tasks[0], now), 90);
assert.equal(state.tasks[0].events.length, 2);
assert.throws(() =>
  saveWorkUpdate(state, "t", { note: "", progress: 30, amount: 0, unit: "minutes" }, now),
);
console.log(
  "PASS IST daily boundary, unit conversion, combined progress/effort, no empty updates.",
);
