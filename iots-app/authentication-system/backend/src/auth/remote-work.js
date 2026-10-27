const { workday } = require("./workday");
async function closeRemote(connection, employeeId, except = null) {
  await connection.execute(
    "UPDATE remote_work_sessions SET ended_at=LEAST(NOW(3),expires_at) WHERE employee_id=? AND ended_at IS NULL AND (? IS NULL OR session_hash<>?)",
    [employeeId, except, except],
  );
}
async function remoteTime(connection, employeeId, now = new Date()) {
  const day = workday(now);
  const [[row]] = await connection.execute(
    "SELECT COALESCE(SUM(GREATEST(0,TIMESTAMPDIFF(SECOND,GREATEST(started_at,?),LEAST(COALESCE(ended_at,?),expires_at,?)))),0) AS seconds FROM remote_work_sessions WHERE employee_id=? AND started_at<? AND expires_at>?",
    [day.start, now, day.end, employeeId, day.end, day.start],
  );
  return {
    ...day,
    elapsedSeconds: Number(row.seconds),
    targetSeconds: day.closing === "16:00" ? 23400 : day.closing ? 30600 : 0,
  };
}
module.exports = { closeRemote, remoteTime };
