const MIN_YEAR = 2025;
const WEEK = 7 * 86400000;
const CACHE_SCHEMA = `CREATE TABLE IF NOT EXISTS calendar_holiday_cache (
  year SMALLINT PRIMARY KEY, payload JSON NOT NULL, fetched_at DATETIME(3) NOT NULL
)`;

function validateYear(value, now = new Date()) {
  const max =
    Number(
      new Intl.DateTimeFormat("en", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
      }).format(now),
    ) + 1;
  if (
    !/^\d{4}$/.test(String(value)) ||
    Number(value) < MIN_YEAR ||
    Number(value) > max
  )
    throw Object.assign(
      new Error(`Choose a year from ${MIN_YEAR} to ${max}.`),
      { status: 400 },
    );
  return Number(value);
}

function normalizeHolidays(rows, year) {
  if (!Array.isArray(rows)) throw new Error("Invalid holiday response");
  const unique = new Map();
  for (const row of rows) {
    const date = row.date?.iso?.slice(0, 10);
    if (
      !date ||
      !date.startsWith(`${year}-`) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) ||
      new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date ||
      !row.name
    )
      continue;
    const regions = Array.isArray(row.states)
      ? row.states.map((s) => ({
          code: String(s.id || "").toLowerCase(),
          name: String(s.name || ""),
        }))
      : [];
    // Keep nationwide events and Telangana events; do not show other states' holidays as local ones.
    if (
      regions.length &&
      !regions.some(
        (s) => /telangana/i.test(s.name) || ["in-tg", "in-ts"].includes(s.code),
      )
    )
      continue;
    const types = Array.isArray(row.type) ? row.type.map(String) : [];
    const event = {
      date,
      name: String(row.name).slice(0, 200),
      description: String(row.description || "").slice(0, 1000),
      types,
      category: String(row.primary_type || types[0] || "Observance"),
      region: regions.length ? "Telangana" : String(row.locations || "India"),
      affectsAttendance: false,
    };
    unique.set(`${date}:${event.name}`, event);
  }
  return [...unique.values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name),
  );
}

function createHolidayService({
  pool,
  fetcher = fetch,
  now = () => new Date(),
  key = () => process.env.CALENDARIFIC_API_KEY,
}) {
  let schema;
  const pending = new Map(),
    failures = new Map();
  const envelope = (year, payload, fetchedAt, stale) => ({
    year,
    country: "IN",
    region: "Telangana",
    minimumDate: "2025-01-01",
    events: payload,
    fetchedAt,
    stale,
    source: "Calendarific",
    attributionUrl: "https://calendarific.com/",
    attendancePolicy: "Company working-day rules apply independently.",
  });
  async function load(year) {
    schema ||= pool.execute(CACHE_SCHEMA).catch((error) => {
      schema = null;
      throw error;
    });
    await schema;
    const [[stored]] = await pool.execute(
      "SELECT payload, fetched_at FROM calendar_holiday_cache WHERE year=?",
      [year],
    );
    const saved =
      stored &&
      (typeof stored.payload === "string"
        ? JSON.parse(stored.payload)
        : stored.payload);
    const fresh = stored && now() - new Date(stored.fetched_at) < WEEK;
    if (fresh) return envelope(year, saved, stored.fetched_at, false);
    const unavailable = () =>
      Object.assign(
        new Error(
          "Holiday details are temporarily unavailable. Attendance records remain available.",
        ),
        { status: 503 },
      );
    if (failures.get(year) > now().getTime()) {
      if (stored) return envelope(year, saved, stored.fetched_at, true);
      throw unavailable();
    }
    try {
      if (!key()) throw new Error("Holiday integration is not configured");
      const url = new URL("https://calendarific.com/api/v2/holidays");
      url.search = new URLSearchParams({
        api_key: key(),
        country: "IN",
        year: String(year),
      });
      const response = await fetcher(url, {
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw new Error("Provider unavailable");
      const body = await response.json();
      if (
        body.meta?.code !== 200 ||
        !Array.isArray(body.response?.holidays) ||
        !body.response.holidays.length
      )
        throw new Error("Year unavailable");
      const events = normalizeHolidays(body.response.holidays, year),
        timestamp = now();
      await pool.execute(
        "INSERT INTO calendar_holiday_cache (year,payload,fetched_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE payload=VALUES(payload),fetched_at=VALUES(fetched_at)",
        [year, JSON.stringify(events), timestamp],
      );
      failures.delete(year);
      return envelope(year, events, timestamp.toISOString(), false);
    } catch {
      // Never forward upstream error messages or URLs: they may contain the API key.
      failures.set(year, now().getTime() + 3600000);
      if (stored) return envelope(year, saved, stored.fetched_at, true);
      throw unavailable();
    }
  }
  return {
    get(value) {
      const year = validateYear(value, now());
      if (!pending.has(year))
        pending.set(
          year,
          load(year).finally(() => pending.delete(year)),
        );
      return pending.get(year);
    },
  };
}
module.exports = {
  MIN_YEAR,
  validateYear,
  normalizeHolidays,
  createHolidayService,
};
