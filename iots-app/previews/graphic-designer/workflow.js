import { isInReview, rolePolicy, hasCapability } from "./role-policy";
export function employeeProfile(state) {
  return typeof state.employee === "string"
    ? { id: "preview-designer", name: state.employee, role: "Graphic Designer" }
    : state.employee;
}
export const stages = [
  "Assigned",
  "In progress",
  "Blocked",
  "Issue resolved",
  "Waiting for review",
  "Under review",
  "Changes requested",
  "Completed",
];
export function stageOf(task) {
  if (task.status === "Blocked" && task.blocker?.open === false) return "Issue resolved";
  if (isInReview(task)) return task.reviewOpened ? "Under review" : "Waiting for review";
  return task.status;
}
export function reportingState(task, now = new Date()) {
  if (task.status === "Completed") return "Completed";
  if (new Date(task.due) < now) return "Overdue";
  return task.status === "Assigned" ? "Assigned" : "Pending";
}
export function recordActivity(state, id, kind, values, now = new Date()) {
  const task = state.tasks.find((t) => t.id === id);
  if (!task || task.status === "Completed")
    throw Error("This task is closed. Its history is read-only.");
  if (task.ownerId && task.ownerId !== employeeProfile(state).id)
    throw Error(
      "This task belongs to another employee. Your contribution history is read-only.",
    );
  if (
    !hasCapability(
      rolePolicy(state),
      kind === "Time logged"
        ? "task.effort.own"
        : kind === "Blocker reported"
          ? "issue.raise.own"
          : kind === "Deadline request"
            ? "deadline.request.own"
            : "task.update.own",
    )
  )
    throw Error("This action is outside your role permissions.");
  if (!values.note?.trim()) throw Error("Add a short explanation.");
  const before = { status: task.status, progress: task.progress || 0 };
  let detail = values.note.trim();
  if (kind === "Progress") {
    if (!["Assigned", "In progress", "Changes requested"].includes(task.status))
      throw Error("Progress can be updated while you are working on a task.");
    if (
      !Number.isFinite(Number(values.progress)) ||
      values.progress < 0 ||
      values.progress > 100
    )
      throw Error("Enter progress between 0 and 100.");
    task.progress = Number(values.progress);
    task.status = "In progress";
    detail = `${before.progress}% to ${task.progress}%. ${detail}`;
  } else if (kind === "Time logged") {
    if (
      !Number.isInteger(Number(values.minutes)) ||
      values.minutes <= 0 ||
      values.minutes > 1440
    )
      throw Error("Enter between 1 and 1440 minutes.");
    task.effortMinutes = (task.effortMinutes || 0) + Number(values.minutes);
    task.effortEntries ??= [];
    task.effortEntries.push({
      at: now.toISOString(),
      minutes: Number(values.minutes),
      note: detail,
      actorId: employeeProfile(state).id,
    });
    detail = `${values.minutes} minutes. ${detail}`;
  } else if (kind === "Blocker reported") {
    if (!["Assigned", "In progress", "Changes requested"].includes(task.status))
      throw Error("A blocker can be raised on active work.");
    if (!["Low", "Medium", "High"].includes(values.severity))
      throw Error("Choose a severity.");
    task.status = "Blocked";
    task.blocker = {
      id: `ISS-${task.id}-${task.events.length}`,
      reason: detail,
      category: values.blockType || "Other",
      severity: values.severity,
      owner: task.manager || "Reporting manager",
      open: true,
    };
    detail = `${task.blocker.id} · ${values.severity} · Reporting manager. ${detail}`;
  } else if (kind === "Resume work") {
    if (task.status !== "Blocked" || task.blocker?.open)
      throw Error("Your manager must resolve the blocker before work resumes.");
    task.status = "In progress";
  } else if (kind === "Deadline request") {
    if (
      !values.requestedDue ||
      !Number.isFinite(new Date(values.requestedDue).getTime()) ||
      new Date(values.requestedDue) <= new Date(task.due) ||
      new Date(values.requestedDue) <= now
    )
      throw Error("Request a deadline later than the current deadline and now.");
    task.deadlineRequest = {
      requestedDue: new Date(values.requestedDue).toISOString(),
      reason: detail,
      status: "Awaiting manager decision",
      at: now.toISOString(),
    };
    detail = `Requested ${task.deadlineRequest.requestedDue}. ${detail}`;
  } else if (kind !== "Work note") throw Error("Unsupported activity.");
  const employee = employeeProfile(state);
  task.notes.push({ at: now.toISOString(), text: detail });
  task.events.push({
    at: now.toISOString(),
    actorId: employee.id,
    by: employee.name,
    role: employee.role,
    source: "User action · Preview",
    action: kind,
    before,
    after: { status: task.status, progress: task.progress || 0 },
    detail,
  });
}
