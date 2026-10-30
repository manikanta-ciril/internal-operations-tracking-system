const { workday } = require('../auth/workday');
const { remoteTime } = require('../auth/remote-work');
const { withSession, requireStage } = require('../auth/session-state');

function shiftReminder(day, now) {
  if (!day.closing) return null;
  const end = new Date(`${day.date}T${day.closing}:00+05:30`);
  if (now.getTime() < end.getTime() - 30 * 60000) return null;
  return {
    title: `Shift reminder · ${day.date}`,
    message: now < end
      ? `Your shift ends at ${day.closing} IST in about ${Math.ceil((end - now) / 60000)} minutes. Remember to punch out at the office when you finish. Sign-out is your choice.`
      : `Your scheduled shift ended at ${day.closing} IST. Punch out at the office when you finish. You will not be signed out automatically.`,
  };
}

async function workTime(pool, session, now = new Date()) {
  const day = workday(now);
  if (session.location_json.status === 'offsite') {
    const time = await remoteTime(pool, session.employee_id, now);
    return { ...time, mode: 'offsite', running: true, activeUntil: new Date(Math.min(new Date(session.expires_at).getTime(), day.end.getTime())).toISOString() };
  }
  const reminder = shiftReminder(day, now);
  if (reminder) await withSession(pool, session.token_hash, async (connection, current) => {
    requireStage(current, 'active');
    const [[existing]] = await connection.execute('SELECT id FROM employee_notifications WHERE employee_id=? AND title=? LIMIT 1', [current.employee_id, reminder.title]);
    if (!existing) await connection.execute('INSERT INTO employee_notifications (employee_id,title,message) VALUES (?,?,?)', [current.employee_id, reminder.title, reminder.message]);
  });
  return { ...day, mode: 'onsite', reminder: reminder?.message || null };
}
module.exports = { workTime, shiftReminder };
