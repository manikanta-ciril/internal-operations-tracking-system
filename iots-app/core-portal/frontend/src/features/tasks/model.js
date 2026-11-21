import { dailyReport } from "../daily-report/reportEngine.js";
export { dailyReport } from "../daily-report/reportEngine.js";
import {
  designerRole,
  rolePolicy,
  firstReviewer,
  hasCapability,
} from "../creative-associate/workspace/role-policy.js";
import { employeeProfile } from "./workflow.js";
export function istDate(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function shiftFor(now = new Date()) {
  const date = istDate(now),
    weekday = new Date(`${date}T12:00:00+05:30`).getUTCDay();
  if (weekday === 0) return { date, end: null, remindAt: null };
  const end = new Date(`${date}T${weekday === 6 ? "16" : "18"}:00:00+05:30`);
  return { date, end, remindAt: new Date(end.getTime() - 1800000) };
}
export const recipients = designerRole.reportAudience;
const hour = (date, time) => new Date(`${date}T${time}:00+05:30`).toISOString();
export function initialState(now, employee) {
  const date = istDate(now),
    yesterday = istDate(new Date(now.getTime() - 86400000));
  const task = (id, title, category, status, due, assignedBy, brief) => ({
    id,
    title,
    category,
    status,
    due,
    originalDue: due,
    priority: "Normal",
    progress:
      status === "Completed"
        ? 100
        : status === "In progress"
          ? 40
          : status === "In review"
            ? 100
            : 0,
    effortMinutes: 0,
    assignedBy,
    brief,
    createdAt: hour(yesterday, "10:00"),
    versions: [],
    notes: [],
    events: [
      {
        at: hour(yesterday, "10:00"),
        by: assignedBy,
        action: "Assigned",
        detail: brief,
      },
      {
        at: hour(date, "09:30"),
        by:
          status === "Changes requested" ? "Reporting manager" : employee.name,
        action: status,
        detail:
          status === "Changes requested"
            ? "Keep the headline short and increase the logo spacing."
            : "",
      },
    ],
  });
  return {
    version: 1,
    workspace: structuredClone(designerRole),
    employee,
    remarks: {},
    extraWork: [],
    deliveries: [],
    dismissedReminders: [],
    tasks: [
      {
        ...task(
          "DES-104",
          "Member welcome stationery",
          "Member materials",
          "In progress",
          hour(date, "17:00"),
          "Reporting manager",
          "Prepare the visiting card, email signature and letterhead. Use the approved member details. Deliver print-ready PDF and editable files.",
        ),
        notes: [
          {
            at: hour(date, "11:00"),
            text: "Visiting card draft prepared. Waiting for the final member phone number.",
          },
        ],
      },
      {
        ...task(
          "DES-102",
          "Festive greeting creative",
          "Social media",
          "Changes requested",
          hour(date, "18:00"),
          "Creative reviewer",
          "Create the festive greeting using CIRIL’s approved colours. Supply square and story formats.",
        ),
        returnNote: "Keep the headline short and increase the logo spacing.",
        returnedBy: "Reporting manager",
        deadlineDecision:
          "Retained by Reporting manager: enough time remains for these two corrections.",
        versions: [
          {
            number: 1,
            file: "festive-greeting-v1.pdf",
            note: "Initial layout",
            at: hour(yesterday, "15:00"),
          },
        ],
      },
      {
        ...task(
          "DES-106",
          "Redesign the member induction slides",
          "Presentation",
          "Assigned",
          hour(istDate(new Date(now.getTime() + 86400000)), "16:00"),
          "Reporting manager",
          "Redesign the raw presentation supplied by the team. Preserve the source content and use the current CIRIL template.",
        ),
        createdAt: hour(date, "10:00"),
      },
      {
        ...task(
          "DES-101",
          "Market trends carousel",
          "Social media",
          "In review",
          hour(date, "16:30"),
          "Creative reviewer",
          "Prepare a carousel using the supplied zonal market data. Attach the source reference.",
        ),
        versions: [
          {
            number: 1,
            file: "market-trends-v1.pdf",
            note: "First review submission",
            at: hour(date, "12:00"),
          },
        ],
        events: [
          {
            at: hour(yesterday, "10:00"),
            by: "Creative reviewer",
            action: "Assigned",
            detail: "Prepare the zonal carousel.",
          },
          {
            at: hour(date, "12:00"),
            by: employee.name,
            action: "In review",
            detail: "Submitted version 1 for first review.",
          },
        ],
      },
      {
        ...task(
          "DES-098",
          "Annual conference backdrop",
          "Event branding",
          "Completed",
          hour(yesterday, "18:00"),
          "Reporting manager",
          "Prepare print-ready backdrop artwork and retain the final delivery proof.",
        ),
        events: [
          {
            at: hour(yesterday, "09:30"),
            by: employee.name,
            action: "In progress",
            detail: "Prepared the final layout.",
          },
          {
            at: hour(yesterday, "17:00"),
            by: "Reporting manager",
            action: "Completed",
            detail: "Accepted final artwork and delivery proof.",
          },
        ],
      },
    ],
  };
}
export function addNote(state, id, text, now = new Date()) {
  if (!text.trim()) throw Error("Write a short progress update.");
  const task = state.tasks.find((t) => t.id === id);
  if (!task) throw Error("Task not found.");
  task.notes.push({ at: now.toISOString(), text: text.trim() });
  task.events.push({
    at: now.toISOString(),
    by: employeeProfile(state).name,
    action: "Progress note",
    detail: text.trim(),
  });
}
export function startTask(state, id, now = new Date()) {
  const t = state.tasks.find((t) => t.id === id);
  if (!t || t.status !== "Assigned")
    throw Error("This task has already moved ahead.");
  if (t.ownerId && t.ownerId !== employeeProfile(state).id)
    throw Error("Only the current task owner can start work.");
  if (!hasCapability(rolePolicy(state), "task.update.own"))
    throw Error("This action is outside your role permissions.");
  const before = { status: t.status, progress: t.progress || 0 };
  t.status = "In progress";
  t.events.push({
    at: now.toISOString(),
    by: employeeProfile(state).name,
    action: "In progress",
    actorId: employeeProfile(state).id,
    role: employeeProfile(state).role,
    source: "User action · Preview",
    before,
    after: { status: t.status, progress: t.progress || 0 },
    detail: "Started the assigned work.",
  });
}
export function setBriefChecklistItem(
  state,
  id,
  itemId,
  checked,
  now = new Date(),
) {
  const task = state.tasks.find((item) => item.id === id);
  if (!task || task.status === "Completed")
    throw Error("This task is closed. Its brief checklist is read-only.");
  if (task.ownerId && task.ownerId !== employeeProfile(state).id)
    throw Error("Only the current task owner can update this checklist.");
  if (!hasCapability(rolePolicy(state), "task.update.own"))
    throw Error("This action is outside your role permissions.");
  if (task.status === "Blocked" && task.blocker?.open)
    throw Error("Resolve the blocker before updating this task checklist.");
  const item = task.checklist?.find((entry) => entry.id === itemId);
  if (!item) throw Error("This brief checklist item is no longer available.");
  item.checked = Boolean(checked);
  const employee = employeeProfile(state);
  task.events.push({
    at: now.toISOString(),
    actorId: employee.id,
    by: employee.name,
    role: employee.role,
    source: "User action · Preview",
    action: "Brief checklist updated",
    detail: `${item.checked ? "Completed" : "Reopened"}: ${item.text}`,
  });
}
export function submitTask(state, id, file, note, now = new Date()) {
  const t = state.tasks.find((t) => t.id === id);
  if (
    !t ||
    !["In progress", "Changes requested"].includes(t.status)
  )
    throw Error("This task is already in review.");
  if (t.ownerId && t.ownerId !== employeeProfile(state).id)
    throw Error("Only the current task owner can submit work.");
  if (!hasCapability(rolePolicy(state), "task.submit.own"))
    throw Error("Your role cannot submit this task.");
  if (!file?.trim() || !note.trim())
    throw Error("Attach a file or source link and add a submission note.");
  const before = { status: t.status, progress: t.progress || 0 };
  t.versions.push({
    number: t.versions.length + 1,
    file: file.trim(),
    note: note.trim(),
    at: now.toISOString(),
  });
  t.status = "In review";
  t.reviewStageId = firstReviewer(state).id;
  t.reviewOpened = false;
  t.progress = 100;
  t.events.push({
    at: now.toISOString(),
    by: employeeProfile(state).name,
    action: "In review",
    actorId: employeeProfile(state).id,
    role: employeeProfile(state).role,
    source: "User action · Preview",
    before,
    after: { status: t.status, progress: t.progress },
    detail: `Submitted version ${t.versions.length}. ${note.trim()}`,
  });
}
export function returnForChanges(
  state,
  id,
  by,
  reason,
  decision,
  newDue,
  deadlineReason,
  now = new Date(),
) {
  const t = state.tasks.find((t) => t.id === id);
  const reviewer = rolePolicy(state).reviewStages.find(
    (stage) => stage.id === (typeof by === "string" ? by : by.stageId),
  );
  if (!t || !reviewer)
    throw Error("Only the assigned review chain can return work.");
  if (!reason.trim() || !deadlineReason.trim())
    throw Error("Explain the changes and the deadline decision.");
  if (!["Retain", "Extend"].includes(decision))
    throw Error("Choose Retain or Extend.");
  if (
    decision === "Extend" &&
    (!(new Date(newDue) > new Date(t.due)) || new Date(newDue) <= now)
  )
    throw Error("Choose a later deadline.");
  if (decision === "Extend") t.due = new Date(newDue).toISOString();
  t.status = "Changes requested";
  t.returnNote = reason;
  t.returnedBy = typeof by === "object" ? by.name : reviewer.label;
  t.returnedByRole = reviewer.label;
  t.deadlineDecision = `${decision === "Retain" ? "Retained" : "Extended"} by ${reviewer.label}: ${deadlineReason}`;
  t.events.push({
    at: now.toISOString(),
    by: typeof by === "object" ? by.name : reviewer.label,
    role: reviewer.label,
    action: "Changes requested",
    detail: `${reason} Deadline ${decision.toLowerCase()}: ${deadlineReason}. Current due: ${t.due}`,
  });
}
export function reportReminder(state, now = new Date()) {
  const shift = shiftFor(now);
  return (
    !!shift.remindAt &&
    now >= shift.remindAt &&
    (!state.settings?.snoozedUntil ||
      now >= new Date(state.settings.snoozedUntil)) &&
    !state.dismissedReminders.includes(shift.date)
  );
}
export function queueDailyReport(state, now = new Date(), manual = false) {
  const shift = shiftFor(now);
  if (!manual && (!shift.end || now < shift.end)) return false;
  if (state.deliveries.some((d) => d.date === shift.date)) return false;
  const report =
    state.manualReports?.[shift.date] || dailyReport(state, shift.date);
  state.deliveries.push({
    date: shift.date,
    at: now.toISOString(),
    recipients: [
      ...(state.workspace?.reportAudience || designerRole.reportAudience),
    ],
    status: "Queued in preview",
    report: structuredClone(report),
  });
  return true;
}
