const assert = require("node:assert/strict");
const {
  validateYear,
  normalizeHolidays,
  createHolidayService,
} = require("../src/calendar/holidays");
const now = new Date("2026-10-27T12:00:00+05:30");
const fixture = (name, states = "All", date = "2027-01-26") => ({
  name,
  date: { iso: date },
  type: ["National holiday"],
  states,
});
(async () => {
  for (const invalid of [2024, 0, "2027x", ["2027", "2026"], 2028])
    assert.throws(() => validateYear(invalid, now));
  assert.equal(validateYear("2025", now), 2025);
  const rows = [
    fixture("Republic Day"),
    fixture("Republic Day"),
    fixture("State event", [{ id: "in-tg", name: "Telangana" }]),
    fixture("Other state", [{ id: "in-mh", name: "Maharashtra" }]),
    fixture("Old event", "All", "2024-01-26"),
    fixture("Invalid date", "All", "2027-02-30"),
  ];
  assert.equal(normalizeHolidays(rows, 2027).length, 2);
  assert.ok(
    normalizeHolidays(rows, 2027).every((e) => e.affectsAttendance === false),
  );
  let stored,
    calls = 0,
    fail = false,
    clock = now;
  const pool = {
    execute: async (sql, values) => {
      if (sql.startsWith("SELECT")) return [[stored].filter(Boolean)];
      if (sql.startsWith("INSERT"))
        stored = { payload: JSON.parse(values[1]), fetched_at: values[2] };
      return [[]];
    },
  };
  const service = createHolidayService({
    pool,
    now: () => clock,
    key: () => "test-secret",
    fetcher: async (url) => {
      calls++;
      assert.equal(url.searchParams.get("country"), "IN");
      if (fail) throw Error("secret upstream URL");
      return {
        ok: true,
        json: async () => ({
          meta: { code: 200 },
          response: { holidays: rows },
        }),
      };
    },
  });
  const [a, b] = await Promise.all([service.get(2027), service.get(2027)]);
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
  await service.get(2027);
  assert.equal(calls, 1);
  clock = new Date(now.getTime() + 8 * 86400000);
  fail = true;
  assert.equal((await service.get(2027)).stale, true);
  assert.equal(calls, 2);
  await service.get(2027);
  assert.equal(calls, 2);
  stored = undefined;
  await assert.rejects(
    service.get(2027),
    (error) => error.status === 503 && !error.message.includes("secret"),
  );
  console.log(
    "PASS: calendar year limits, regional filtering, invalid dates, concurrency, persistent cache, stale fallback, quota backoff and secret-safe errors.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
