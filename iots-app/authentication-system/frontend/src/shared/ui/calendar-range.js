export const MIN_CALENDAR_DATE = "2025-01-01";
export const calendarMaxYear = () =>
  Number(
    new Intl.DateTimeFormat("en", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
    }).format(new Date()),
  ) + 1;
export function calendarDate(value, fallback = MIN_CALENDAR_DATE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return fallback;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return fallback;
  if (value < MIN_CALENDAR_DATE) return MIN_CALENDAR_DATE;
  const maximum = `${calendarMaxYear()}-12-31`;
  return value > maximum ? maximum : value;
}
