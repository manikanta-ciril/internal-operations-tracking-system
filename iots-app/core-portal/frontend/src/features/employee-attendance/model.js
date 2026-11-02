export const TIMEZONE = "Asia/Kolkata";
export const dateKey = (value = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
export const dateLabel = (value) =>
  new Date(`${value}T12:00:00Z`).toLocaleDateString("en-IN", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export const timeLabel = (value) =>
  value
    ? new Date(value).toLocaleTimeString("en-IN", {
        timeZone: TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";
export function addDays(date, amount) {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + amount);
  return next.toISOString().slice(0, 10);
}
export function dayRecord(date, punches, workingDays, today = dateKey()) {
  const records = punches.filter((punch) => dateKey(punch.punchIn) === date);
  const weeklyOff = !workingDays.includes(
    new Date(`${date}T12:00:00Z`).getUTCDay(),
  );
  const state =
    date > today
      ? "future"
      : records.length
        ? records.some((record) => !record.punchOut)
          ? "open"
          : "recorded"
        : weeklyOff
          ? "off"
          : "missing";
  const labels = {
    future: "Upcoming",
    open: "Open punch",
    recorded: "Punches recorded",
    off: "Weekly off",
    missing: "No record",
  };
  return { date, records, state, label: labels[state] };
}
