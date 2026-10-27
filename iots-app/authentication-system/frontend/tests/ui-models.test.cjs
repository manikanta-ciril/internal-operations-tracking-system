const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const path = require("node:path");
(async () => {
  const base = path.resolve(__dirname, "../src");
  const { attendanceCalendar } = await import(
    pathToFileURL(
      path.join(base, "features/employee-attendance/calendar-model.js"),
    )
  );
  const { dateKey } = await import(
    pathToFileURL(path.join(base, "features/employee-attendance/model.js"))
  );
  const punches = [
    {
      id: "1",
      punchIn: "2026-10-26T10:00:00+05:30",
      punchOut: "2026-10-26T12:00:00+05:30",
    },
    { id: "2", punchIn: "2026-10-26T13:00:00+05:30", punchOut: null },
    {
      id: "3",
      punchIn: "2026-10-24T09:30:00+05:30",
      punchOut: "2026-10-24T16:00:00+05:30",
    },
    { id: "4", punchIn: "2026-10-23T09:30:00+05:30", punchOut: null },
    { id: "old", punchIn: "2025-01-01T09:30:00+05:30", punchOut: null },
  ];
  const model = attendanceCalendar(
    punches,
    [1, 2, 3, 4, 5, 6],
    "2026-10-26",
    180,
  );
  const dates = model.weeks.flat().filter(Boolean);
  assert.equal(dates.length, 180);
  assert.equal(new Set(dates.map((day) => day.date)).size, 180);
  assert.equal(model.recordedDays, 3);
  assert.equal(model.openDays, 2);
  assert.equal(
    dates.find((day) => day.date === "2026-10-24").state,
    "recorded",
  );
  assert.equal(dates.find((day) => day.date === "2026-10-25").state, "off");
  assert.equal(
    dates.find((day) => day.date === "2026-10-26").records.length,
    2,
  );
  assert.equal(dates.find((day) => day.date === "2026-10-22").state, "missing");
  assert.equal(
    model.months.reduce((sum, m) => sum + m.span, 0),
    model.weeks.length,
  );
  assert.equal(
    attendanceCalendar([], [1, 2, 3, 4, 5, 6], "2028-03-15", 90)
      .weeks.flat()
      .filter(Boolean)
      .some((day) => day.date === "2028-02-29"),
    true,
  );
  assert.equal(dateKey("2026-10-25T20:00:00Z"), "2026-10-26");
  const { tooltipPosition } = await import(
    pathToFileURL(path.join(base, "shared/ui/tooltip-position.js"))
  );
  const anchor = { left: 180, top: 300, bottom: 322, width: 22 };
  const hint = tooltipPosition(
    anchor,
    { width: 180, height: 90 },
    { width: 375, height: 812 },
  );
  assert.equal(hint.placement, "top");
  assert.equal(anchor.top - hint.top - 90, 6);
  const flipped = tooltipPosition(
    { ...anchor, top: 10, bottom: 32 },
    { width: 180, height: 90 },
    { width: 375, height: 812 },
  );
  assert.equal(flipped.placement, "bottom");
  assert.equal(flipped.top - 32, 6);
  for (const left of [0, 365]) {
    const edge = tooltipPosition(
      { ...anchor, left },
      { width: 180, height: 90 },
      { width: 375, height: 812 },
    );
    assert.ok(edge.left >= 8 && edge.left + 180 <= 367);
    assert.ok(edge.arrow >= 12 && edge.arrow <= 168);
  }
  const { officeTimeRemaining, shiftPresentation } = await import(
    pathToFileURL(path.join(base, "features/employee-workspace/office-time.js"))
  );
  const friday = { date: "2026-10-23", opening: "09:30", closing: "18:00" };
  assert.deepEqual(
    officeTimeRemaining(friday, new Date("2026-10-23T09:00:00+05:30")),
    { phase: "before-hours", minutes: 510 },
  );
  assert.deepEqual(
    officeTimeRemaining(friday, new Date("2026-10-23T17:00:00+05:30")),
    { phase: "working-hours", minutes: 60 },
  );
  assert.deepEqual(
    officeTimeRemaining(friday, new Date("2026-10-23T18:00:00+05:30")),
    { phase: "after-hours", minutes: 0 },
  );
  const saturday = { date: "2026-10-24", opening: "09:30", closing: "16:00" };
  assert.equal(
    officeTimeRemaining(saturday, new Date("2026-10-24T09:30:00+05:30"))
      .minutes,
    390,
  );
  assert.equal(
    officeTimeRemaining(saturday, new Date("2026-10-24T15:00:00+05:30"))
      .minutes,
    60,
  );
  assert.equal(
    officeTimeRemaining(
      { date: "2026-10-25", opening: null, closing: null },
      new Date("2026-10-25T12:00:00+05:30"),
    ).phase,
    "weekly-off",
  );
  assert.equal(
    officeTimeRemaining(friday, new Date("2026-10-24T00:00:00+05:30")).phase,
    "outdated",
  );
  for (const [time, status, progress] of [['09:00','Upcoming shift',0], ['09:30','On shift',0], ['13:45','On shift',50], ['18:00','Shift completed',100], ['20:00','Shift completed',100]]) {
    const model = shiftPresentation(friday, new Date('2026-10-23T'+time+':00+05:30'));
    assert.equal(model.status, status);
    assert.equal(model.progress, progress);
    assert.ok(model.minutes >= 0);
  }
  assert.equal(shiftPresentation({date:'2026-10-25'}, new Date('2026-10-25T12:00:00+05:30')).status, 'No shift scheduled');
  const range = await import(pathToFileURL(path.join(base, 'shared/ui/calendar-range.js')));
  assert.equal(range.calendarDate('2024-12-31'), '2025-01-01');
  assert.equal(range.calendarDate('2026-02-30'), '2025-01-01');
  assert.equal(range.calendarDate('2027-01-01'), '2027-01-01');
  const bounded = attendanceCalendar([], [1,2,3,4,5,6], '2025-01-03', 180);
  assert.equal(bounded.start,'2025-01-01');
  assert.equal(bounded.weeks.flat().filter(Boolean).length,3);
  const operations = await import(
    pathToFileURL(path.join(base, "shared/feedback/operations.js"))
  );
  let changes = 0;
  const unsubscribe = operations.subscribe(() => changes++);
  const finishA = operations.beginOperation("A"),
    finishB = operations.beginOperation("B");
  assert.equal(operations.getSnapshot().count, 2);
  assert.equal(operations.getSnapshot().label, "B");
  finishA();
  finishA();
  assert.equal(operations.getSnapshot().count, 1);
  await assert.rejects(
    operations.trackOperation("Failure", async () => {
      throw Error("expected");
    }),
  );
  assert.equal(operations.getSnapshot().count, 1);
  finishB();
  assert.equal(operations.getSnapshot().count, 0);
  assert.ok(changes >= 5);
  unsubscribe();
  console.log(
    "PASS: calendar boundaries, leap day, IST dates, Saturday workdays, record-derived states and concurrent/error-safe loading feedback.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
