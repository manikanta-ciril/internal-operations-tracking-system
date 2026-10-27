const { httpError } = require("./session-state");
const TIMEZONE = "Asia/Kolkata";
function workday(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const start = new Date(`${date}T00:00:00+05:30`);
  const weekday = new Date(`${date}T12:00:00+05:30`).getUTCDay();
  return {
    date,
    start,
    end: new Date(start.getTime() + 86400000),
    timezone: TIMEZONE,
    opening: weekday ? "09:30" : null,
    closing: weekday === 6 ? "16:00" : weekday ? "18:00" : null,
    serverTime: now.toISOString(),
  };
}
async function requireNotPunchedOut(connection, employeeId, now = new Date()) {
  const day = workday(now);
  const [[record]] = await connection.execute(
    "SELECT id FROM checkout_evidence WHERE employee_id=? AND checked_out_at>=? AND checked_out_at<? LIMIT 1",
    [employeeId, day.start, day.end],
  );
  if (record)
    throw httpError(
      403,
      "You have already punched out today. You cannot sign in again until tomorrow (IST), regardless of location.",
    );
}
function requireOfficeLocation(location) {
  if (location?.status === "onsite") return;
  if (location?.status !== "offsite")
    throw httpError(
      403,
      "Your office location could not be verified. Get a fresh location reading at the office and try again.",
    );
  const distance = Number.isFinite(location.distanceMeters)
    ? location.distanceMeters > 500
      ? `${(location.distanceMeters / 1000).toFixed(2)} KM`
      : `${Math.round(location.distanceMeters)} m`
    : null;
  throw httpError(
    403,
    `Off-site sign-in is not allowed.${distance ? ` You are ${distance} from the office.` : ""} Sign in within the office radius.`,
  );
}
function deviceLabel(userAgent = "") {
  const ua = String(userAgent).slice(0, 512);
  const os = /Android/i.test(ua)
    ? "Android"
    : /iPhone|iPad/i.test(ua)
      ? "iOS"
      : /Windows/i.test(ua)
        ? "Windows"
        : /Macintosh/i.test(ua)
          ? "macOS"
          : /Linux/i.test(ua)
            ? "Linux"
            : "Unknown device";
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /OPR\//.test(ua)
      ? "Opera"
      : /Chrome|CriOS/.test(ua)
        ? "Chrome"
        : /Firefox|FxiOS/.test(ua)
          ? "Firefox"
          : /Safari/.test(ua)
            ? "Safari"
            : "Browser";
  return `${browser} on ${os}`;
}
module.exports = {
  workday,
  requireNotPunchedOut,
  requireOfficeLocation,
  deviceLabel,
};
