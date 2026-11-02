const { httpError } = require("../auth/session-state");

const statuses = [
  "Available",
  "Busy",
  "In Meeting",
  "On Break",
  "In Training",
  "Do Not Disturb",
];
const preferenceKeys = [
  "Task updates",
  "Deadline reminders",
  "Request decisions",
  "Company announcements",
  "Email summaries",
];
const defaults = () => ({
  profile: { preferred: "", phone: "", personal: "" },
  availability: { status: "Available", message: "", returnAt: "" },
  preferences: Object.fromEntries(
    [...preferenceKeys, "Security notices"].map((key) => [
      key,
      key !== "Email summaries",
    ]),
  ),
});

function validateSettings(section, input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw httpError(400, "Enter valid settings.");
  const text = (key, max) => {
    if (typeof input[key] !== "string" || input[key].length > max)
      throw httpError(400, `Check ${key}.`);
    return input[key].trim();
  };
  if (section === "profile") {
    const value = {
      preferred: text("preferred", 60),
      phone: text("phone", 40),
      personal: text("personal", 254),
    };
    if (
      !value.preferred ||
      (value.personal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.personal))
    )
      throw httpError(400, "Enter a preferred name and a valid contact email.");
    return value;
  }
  if (section === "availability") {
    const value = {
      status: text("status", 30),
      message: text("message", 100),
      returnAt: text("returnAt", 5),
    };
    if (
      !statuses.includes(value.status) ||
      (value.returnAt && !/^([01]\d|2[0-3]):[0-5]\d$/.test(value.returnAt))
    )
      throw httpError(400, "Choose a valid status and return time.");
    return { ...value, updatedAt: new Date().toISOString() };
  }
  if (section === "preferences") {
    if (preferenceKeys.some((key) => typeof input[key] !== "boolean"))
      throw httpError(400, "Choose valid notification preferences.");
    return {
      ...Object.fromEntries(preferenceKeys.map((key) => [key, input[key]])),
      "Security notices": true,
    };
  }
  throw httpError(400, "Unknown settings section.");
}
module.exports = { defaults, validateSettings, statuses };
