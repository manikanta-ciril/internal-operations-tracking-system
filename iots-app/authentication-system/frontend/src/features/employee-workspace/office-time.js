// Uses the server's IST calendar date and office schedule, independent of device timezone.
export function officeTimeRemaining(schedule, now) {
  if (!schedule?.date || !now) return { phase: "loading", minutes: null };
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  if (date !== schedule.date) return { phase: "outdated", minutes: null };
  if (!schedule.opening || !schedule.closing)
    return { phase: "weekly-off", minutes: 0 };
  const opens = new Date(`${date}T${schedule.opening}:00+05:30`).getTime();
  const closes = new Date(`${date}T${schedule.closing}:00+05:30`).getTime();
  const current = now.getTime();
  return {
    phase:
      current < opens
        ? "before-hours"
        : current >= closes
          ? "after-hours"
          : "working-hours",
    minutes: Math.max(
      0,
      Math.ceil((closes - Math.max(current, opens)) / 60000),
    ),
  };
}
export function officeHoursLabel(value) {
  if (!value) return "";
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}

// Presentation stays independent of attendance and employee availability.
export function shiftPresentation(schedule, now) {
  if (schedule?.mode === 'offsite' && now) {
    const seconds = Math.max(0, Math.floor(schedule.elapsedSeconds || 0));
    return { phase: 'offsite', minutes: null, progress: null,
      status: 'Off-site session', countdown: `${Math.floor(seconds / 3600)}h ${Math.floor(seconds % 3600 / 60)}m worked`,
      hours: 'Today · No fixed shift', detail: 'Accumulated off-site session time today (IST). This is session duration, not task effort.' };
  }
  const remaining = officeTimeRemaining(schedule, now);
  const base = { ...remaining, progress: null, status: 'Updating schedule', countdown: 'Syncing', hours: 'Working hours', detail: 'Waiting for the office schedule' };
  if (remaining.minutes === null) return base;
  if (remaining.phase === 'weekly-off') return { ...base, status: 'No shift scheduled', countdown: 'No shift', hours: 'Weekly off', detail: 'No scheduled hours today' };
  const opening = officeHoursLabel(schedule.opening), closing = officeHoursLabel(schedule.closing);
  const before = remaining.phase === 'before-hours', after = remaining.phase === 'after-hours';
  const duration = (new Date(`${schedule.date}T${schedule.closing}:00+05:30`) - new Date(`${schedule.date}T${schedule.opening}:00+05:30`));
  const elapsed = now - new Date(`${schedule.date}T${schedule.opening}:00+05:30`);
  return { ...base,
    progress: Math.max(0, Math.min(100, elapsed / duration * 100)),
    status: before ? 'Upcoming shift' : after ? 'Shift completed' : 'On shift',
    countdown: before ? `Starts ${opening}` : after ? 'Shift completed' : `${Math.floor(remaining.minutes / 60)}h ${remaining.minutes % 60}m left`,
    hours: `${opening} \u2013 ${closing}`,
    detail: before ? `Starts at ${opening}` : after ? `Scheduled hours ended at ${closing}` : `Shift ends at ${closing}`,
  };
}
