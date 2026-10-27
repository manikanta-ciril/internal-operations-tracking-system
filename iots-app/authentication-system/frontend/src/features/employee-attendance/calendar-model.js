import { addDays, dateKey, dayRecord } from "./model.js";
import { MIN_CALENDAR_DATE } from "../../shared/ui/calendar-range.js";

// A calendar date is derived once per record; the grid is built from that index.
export function attendanceCalendar(
  punches,
  workingDays,
  end = dateKey(),
  days = 180,
) {
  const start = [MIN_CALENDAR_DATE, addDays(end, 1 - days)].sort().at(-1),
    byDate = new Map();
  for (const punch of punches) {
    const key = dateKey(punch.punchIn);
    if (key < start || key > end) continue;
    const group = byDate.get(key) || [];
    group.push(punch);
    byDate.set(key, group);
  }
  const offset = (new Date(`${start}T12:00:00Z`).getUTCDay() + 6) % 7;
  const first = addDays(start, -offset);
  const count = Math.max(
    0,
    Math.round(
      (new Date(`${end}T12:00:00Z`) - new Date(`${start}T12:00:00Z`)) /
        86400000,
    ) + 1,
  );
  const columns = Math.ceil((count + offset) / 7);
  const weeks = Array.from({ length: columns }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => {
      const date = addDays(first, week * 7 + day);
      return date < start || date > end
        ? null
        : dayRecord(date, byDate.get(date) || [], workingDays, end);
    }),
  );
  const months = [];
  weeks.forEach((week, index) => {
    const date = week.find(Boolean)?.date;
    if (!date) return;
    const month = date.slice(0, 7);
    const last = months.at(-1);
    if (last?.month === month) last.span++;
    else
      months.push({
        month,
        index,
        span: 1,
        label: new Date(`${date}T12:00:00Z`).toLocaleDateString("en-IN", {
          month: "short",
          timeZone: "UTC",
        }),
      });
  });
  const recorded = [...byDate.values()];
  return {
    start,
    end,
    weeks,
    months,
    recordedDays: recorded.length,
    openDays: recorded.filter((records) =>
      records.some((record) => !record.punchOut),
    ).length,
  };
}
