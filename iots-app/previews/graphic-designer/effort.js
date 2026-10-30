import { recordActivity } from "./workflow";
const day = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
export function dailyEffort(task, now) {
  return (task.effortEntries || [])
    .filter((e) => day(e.at) === day(now))
    .reduce((sum, e) => sum + Number(e.minutes || 0), 0);
}
export function effortMinutes(value, unit) {
  const minutes = Number(value) * (unit === "hours" ? 60 : 1);
  if (
    !Number.isFinite(minutes) ||
    !Number.isInteger(minutes) ||
    minutes < 0 ||
    minutes > 1440
  )
    throw Error("Enter whole minutes, up to 24 hours.");
  return minutes;
}
export function saveWorkUpdate(state, id, { note, progress, amount, unit }, now) {
  const task = state.tasks.find((t) => t.id === id),
    minutes = effortMinutes(amount, unit),
    changed = Number(progress) !== Number(task.progress || 0);
  if (!note.trim() && !changed && !minutes)
    throw Error("Add a note, change progress or log time.");
  if (dailyEffort(task, now) + minutes > 1440)
    throw Error("Today's task effort cannot exceed 24 hours.");
  if (changed)
    recordActivity(
      state,
      id,
      "Progress",
      { progress, note: note.trim() || "Progress updated." },
      now,
    );
  if (minutes)
    recordActivity(
      state,
      id,
      "Time logged",
      { minutes, note: note.trim() || "Time spent on this task." },
      now,
    );
  if (note.trim() && !changed && !minutes)
    recordActivity(state, id, "Work note", { note }, now);
}
