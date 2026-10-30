import { seed, today, defaultActor } from "./seed";
import { availability } from "./types";
import { makeExport } from "./export";
import type {
  Actor,
  Snapshot,
  Filters,
  Employee,
  Task,
  Announcement,
  ExportView,
  ExportFormat,
  Screen,
  Settings,
  Severity,
  Availability,
} from "./types";
const key = "ciril-governance-preview-v1";
let data: Snapshot = seed();
try {
  const saved = JSON.parse(localStorage.getItem(key) || "null");
  if (
    saved?.version === 1 &&
    [
      "employees",
      "departments",
      "tasks",
      "attendance",
      "issues",
      "changes",
      "announcements",
      "audit",
      "notices",
      "exports",
      "logins",
      "crm",
      "feedback",
      "reportJobs",
      "history",
    ].every((key) => Array.isArray(saved[key])) &&
    saved.settings &&
    Array.isArray(saved.audit)
  )
    data = { ...seed(), ...saved };
} catch {
  /* Start with examples if storage is unavailable. */
}
const copy = <T>(v: T): T => structuredClone(v);
const id = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const delay = () => new Promise<void>((r) => setTimeout(r, 180));
const actorCheck = (actor: Actor) => {
  const employee = data.employees.find(
    (e) => e.id === actor.employeeId && e.active,
  );
  if (
    !employee ||
    !["Super Admin", "IT System Analyst"].includes(actor.activeRole) ||
    !employee.roles.includes(actor.activeRole)
  )
    throw Error("Outside your data scope");
};
const reasonCheck = (reason: string) => {
  if (reason.trim().length < 5)
    throw Error("Add a clear reason of at least 5 characters.");
};
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    throw Error(
      "Browser storage is full or unavailable. Export or clear this preview before saving.",
    );
  }
}
function record(
  actor: Actor,
  action: string,
  target: string,
  reason: string,
  before: unknown,
  after: unknown,
) {
  data.audit.unshift({
    id: id("AUD"),
    at: new Date().toISOString(),
    actor: {
      ...copy(actor),
      name: data.employees.find((e) => e.id === actor.employeeId)!.name,
    },
    action,
    target,
    reason,
    before: copy(before ?? null),
    after: copy(after ?? null),
  });
}
function notify(
  recipientId: string,
  title: string,
  message: string,
  screen: Screen,
) {
  data.notices.unshift({
    id: id("N"),
    recipientId,
    title,
    message,
    screen,
    read: false,
  });
}
async function mutate<T>(
  actor: Actor,
  reason: string,
  action: string,
  target: string,
  change: () => { before: unknown; after: unknown; result: T },
): Promise<T> {
  actorCheck(actor);
  reasonCheck(reason);
  const capability = action.startsWith("Exported")
    ? "Export"
    : action.startsWith("Authorised") || action.startsWith("Declined")
      ? "Authorise account changes"
      : action.startsWith("Created")
        ? "Create"
        : action.startsWith("Referred")
          ? "Delegate"
          : action.startsWith("Read ") ||
              action.startsWith("Switched") ||
              action.startsWith("Closed preview")
            ? "View"
            : "Edit";
  if (!data.settings.permissions[actor.activeRole]?.includes(capability))
    throw Error("Outside your data scope: this action is not permitted.");
  await delay();
  const backup = copy(data);
  try {
    const { before, after, result } = change();
    record(actor, action, target, reason, before, after);
    save();
    return copy(result);
  } catch (e) {
    data = backup;
    throw e;
  }
}
export const person = (d: Snapshot, id: string) =>
  d.employees.find((e) => e.id === id)?.name || id || "Not assigned";
export const ratio = (n: number, d: number) =>
  d ? `${n} of ${d} (${Math.round((n / d) * 100)}%)` : "N/A";
export function filterRows<T extends object>(rows: T[], filters: Filters): T[] {
  return rows.filter((row) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const r = row as Record<string, unknown>;
      if (key === "status" && value === "Late" && "late" in r) return !!r.late;
      if (key === "status" && value === "Missing checkout" && "punchIn" in r)
        return !!r.punchIn && !r.punchOut;
      if (key === "search")
        return JSON.stringify(r).toLowerCase().includes(value.toLowerCase());
      if (key === "from")
        return String(r.date || r.at || r.due || "").slice(0, 10) >= value;
      if (key === "to")
        return String(r.date || r.at || r.due || "").slice(0, 10) <= value;
      if (key === "role" || key === "roles") {
        const roles = r.roles;
        return Array.isArray(roles)
          ? roles.includes(value)
          : String(roles || r.role || "")
              .split(",")
              .map((x) => x.trim())
              .includes(value);
      }
      const field = r[key];
      return Array.isArray(field)
        ? field.includes(value)
        : String(field ?? "") === value;
    }),
  );
}
export function reportRows(d: Snapshot) {
  return d.employees.map((e) => {
    const tasks = d.tasks.filter((t) => t.ownerId === e.id && !t.stopped),
      done = tasks.filter((t) => t.state === "Completed & Closed").length,
      a = attendanceRows(d).find((a) => a.employeeId === e.id);
    return {
      id: e.id,
      date: d.attendance[0]?.date || today,
      name: e.name,
      employeeId: e.id,
      managerId: e.managerId,
      team: e.department,
      department: e.department,
      role: e.roles[0],
      roles: e.roles,
      branch: e.office,
      priority: tasks.some((t) => t.priority === "High") ? "High" : "Low",
      status: e.active ? "Active" : "Inactive",
      request: d.issues.some(
        (i) => i.employeeId === e.id && i.kind === "Request",
      )
        ? "Has request"
        : "None",
      attendance: a?.location || "Absent",
      risk: d.issues.find((i) => i.employeeId === e.id)?.severity || "Low",
      performance:
        e.target === null ? "Target not configured" : ratio(done, e.target),
      workload: tasks.length,
      openTasks: tasks.length - done,
      overdueTasks: tasks.filter(
        (t) => t.state !== "Completed & Closed" && new Date(t.due) < new Date(),
      ).length,
      transferCount: tasks.reduce((sum, t) => sum + t.transfers.length, 0),
      taskStates: tasks.map((t) => t.state),
      punchIn: a?.punchIn || null,
      punchOut: a?.punchOut || null,
      context:
        d.issues
          .filter((i) => i.employeeId === e.id)
          .map((i) => i.reason)
          .join(" ") ||
        (e.location === "On leave"
          ? "Leave context retained"
          : "No exception recorded"),
      completion: ratio(done, tasks.length),
      sessionMinutes: a?.sessionMinutes || 0,
      taskMinutes: a?.taskMinutes || 0,
    };
  });
}
export const publicationStatus = (a: {
  publishAt: string;
  expiresAt: string;
}) =>
  new Date(a.expiresAt) < new Date()
    ? "Expired"
    : new Date(a.publishAt) > new Date()
      ? "Scheduled"
      : "Live";
export function attendanceRows(d: Snapshot) {
  return d.attendance.map((a) => {
    const latest = (field: "location" | "punchIn" | "punchOut") =>
      [...a.corrections].reverse().find((c) => c.field === field)?.after ??
      a[field];
    return {
      ...a,
      originalLocation: a.location,
      originalPunchIn: a.punchIn,
      originalPunchOut: a.punchOut,
      location: latest("location"),
      punchIn: latest("punchIn"),
      punchOut: latest("punchOut"),
      department:
        d.employees.find((e) => e.id === a.employeeId)?.department || "",
      status: a.corrections.length
        ? "Corrected"
        : a.flag
          ? "Flagged"
          : a.punchIn && !a.punchOut
            ? "Missing checkout"
            : a.late
              ? "Late"
              : "Recorded",
    };
  });
}
function exportRows(view: ExportView, filters: Filters) {
  let rows: Record<string, unknown>[];
  switch (view) {
    case "employees":
      rows = data.employees.map((e) => ({ ...e, roles: e.roles.join(", ") }));
      break;
    case "profile":
      rows = data.employees.flatMap(
        (e) =>
          [
            { id: e.id, recordId: e.id, section: "Account", details: e },
            ...data.tasks
              .filter((t) => t.ownerId === e.id)
              .map((t) => ({
                id: e.id,
                recordId: t.id,
                section: "Task and evidence",
                details: t,
              })),
            ...data.attendance
              .filter((a) => a.employeeId === e.id)
              .map((a) => ({
                id: e.id,
                recordId: a.id,
                section: "Attendance",
                details: a,
              })),
            ...data.logins
              .filter((l) => l.employeeId === e.id)
              .map((l) => ({
                id: e.id,
                recordId: l.id,
                section: "Security",
                details: l,
              })),
            ...data.issues
              .filter((i) => i.employeeId === e.id)
              .map((i) => ({
                id: e.id,
                recordId: i.id,
                section: "Blocker or request",
                details: i,
              })),
            ...data.feedback
              .filter((f) => f.employeeId === e.id)
              .map((f, index) => ({
                id: e.id,
                recordId: `Feedback-${index}`,
                section: "Feedback",
                details: f,
              })),
            ...data.audit
              .filter((a) => a.target === e.id || a.actor.employeeId === e.id)
              .map((a) => ({
                id: e.id,
                recordId: a.id,
                section: "Audit",
                details: a,
              })),
          ] as Record<string, unknown>[],
      );
      break;
    case "tasks":
      rows = data.tasks.map((t) => ({ ...t, owner: person(data, t.ownerId) }));
      break;
    case "transfers":
      rows = data.tasks.flatMap((t) =>
        t.transfers.map((x) => ({
          ...x,
          taskId: t.id,
          title: t.title,
          state: t.state,
          priority: t.priority,
          ownerId: t.ownerId,
          from: person(data, x.from),
          to: person(data, x.to),
        })),
      );
      break;
    case "roles":
      rows = Object.entries(data.settings.permissions).map(
        ([role, permissions]) => ({
          role,
          permissions: permissions.join(", "),
          scope: data.settings.scopes[role],
        }),
      );
      break;
    case "reports":
      rows = reportRows(data);
      break;
    case "attendance":
      rows = attendanceRows(data);
      break;
    case "announcements":
      rows = data.announcements.map((a) => ({
        ...a,
        status: publicationStatus(a),
      }));
      break;
    case "audit":
      rows = data.audit.map((a) => ({
        ...a,
        employeeId: a.actor.employeeId,
        role: a.actor.activeRole,
      }));
      break;
    case "logins":
      rows = data.logins.map((l) => ({
        ...l,
        signal: l.failed || l.jump ? "yes" : "no",
      }));
      break;
    case "settings":
      rows = Object.entries(data.settings).map(([setting, value]) => ({
        setting,
        value,
      }));
      break;
    default:
      rows = data[view] as unknown as Record<string, unknown>[];
  }
  rows = filterRows(rows, filters);
  const redact = (value: unknown): unknown =>
    Array.isArray(value)
      ? value.map(redact)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .filter(
                ([key]) =>
                  !["email", "passwordChangedAt", "passwordChangedBy"].includes(
                    key,
                  ),
              )
              .map(([key, v]) => [key, redact(v)]),
          )
        : value;
  return data.settings.exportPersonalData
    ? rows
    : rows.map((row) => redact(row) as Record<string, unknown>);
}
export const api = {
  async readWorkspace(actor: Actor) {
    actorCheck(actor);
    await delay();
    return copy(data);
  },
  async switchRole(actor: Actor, role: Actor["activeRole"]) {
    return mutate(
      actor,
      "Employee selected an assigned workspace",
      "Switched active role",
      actor.employeeId,
      () => {
        const next = { ...actor, activeRole: role };
        actorCheck(next);
        return { before: actor.activeRole, after: role, result: next };
      },
    );
  },
  async closePreviewSession(actor: Actor) {
    return mutate(
      actor,
      "Employee closed the example workspace",
      "Closed preview session",
      actor.employeeId,
      () => ({ before: { open: true }, after: { open: false }, result: true }),
    );
  },
  async createEmployee(
    actor: Actor,
    values: Record<string, string>,
    reason: string,
  ) {
    return mutate(
      actor,
      reason,
      "Created employee profile",
      values.name,
      () => {
        if (!values.name?.trim() || !/^\S+@\S+\.\S+$/.test(values.email || ""))
          throw Error("Enter a name and a valid email.");
        if (
          data.employees.some(
            (e) => e.email.toLowerCase() === values.email.toLowerCase(),
          )
        )
          throw Error("An employee already uses this email.");
        if (
          !["Administrative", "Management", "Execution"].includes(values.family)
        )
          throw Error("Choose a valid workspace family.");
        if (!data.departments.some((d) => d.name === values.department))
          throw Error("Choose an existing department.");
        const roles = values.roles
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (
          !roles.length ||
          roles.some((r) => !data.settings.designations.includes(r))
        )
          throw Error("Choose existing roles, separated by commas.");
        const e: Employee = {
          id: id("EMP"),
          name: values.name.trim(),
          email: values.email.trim(),
          designation: values.designation || roles[0],
          roles,
          department: values.department,
          office: values.office || "Hyderabad",
          managerId: values.managerId || "",
          family: values.family as Employee["family"],
          availability: "Available",
          location: "Absent",
          active: true,
          target: null,
          passwordChangedAt: "",
          passwordChangedBy: "",
        };
        data.employees.push(e);
        notify(e.id, "Your profile was created", reason, "people");
        return { before: null, after: e, result: e };
      },
    );
  },
  async editEmployee(
    actor: Actor,
    employeeId: string,
    values: Record<string, string>,
    reason: string,
  ) {
    return mutate(actor, reason, "Updated employee profile", employeeId, () => {
      const e = data.employees.find((e) => e.id === employeeId);
      if (!e) throw Error("Employee not found.");
      if (values.managerId === e.id)
        throw Error("An employee cannot report to themselves.");
      const seen = new Set([e.id]);
      let manager = values.managerId;
      while (manager) {
        if (seen.has(manager))
          throw Error("This reporting line creates a loop.");
        seen.add(manager);
        manager = data.employees.find((p) => p.id === manager)?.managerId || "";
      }
      const before = copy(e);
      Object.assign(e, {
        name: values.name || e.name,
        designation: values.designation || e.designation,
        department: values.department || e.department,
        office: values.office || e.office,
        managerId: values.managerId || "",
        availability: (values.availability || e.availability) as Availability,
      });
      notify(e.id, "Your profile was updated", reason, "people");
      return { before, after: e, result: e };
    });
  },
  async queueAccountChange(
    actor: Actor,
    employeeId: string,
    kind: "Deactivate account" | "Activate account" | "Change access",
    after: Record<string, unknown>,
    reason: string,
  ) {
    return mutate(
      actor,
      reason,
      "Requested high-level account change",
      employeeId,
      () => {
        const e = data.employees.find((e) => e.id === employeeId);
        if (!e) throw Error("Employee not found.");
        if (employeeId === actor.employeeId && kind === "Deactivate account")
          throw Error("You cannot deactivate your current account.");
        if (
          data.changes.some(
            (c) =>
              c.employeeId === employeeId &&
              c.kind === kind &&
              c.status === "Awaiting",
          )
        )
          throw Error("A matching change is already awaiting authorisation.");
        const change = {
          id: id("AUTH"),
          employeeId,
          requester: actor.name,
          kind,
          reason,
          before:
            kind === "Deactivate account" || kind === "Activate account"
              ? { active: e.active }
              : { roles: e.roles },
          after,
          status: "Awaiting" as const,
        };
        data.changes.push(change);
        notify(
          defaultActor.employeeId,
          "Account change awaits authorisation",
          `${person(data, employeeId)} · ${reason}`,
          "home",
        );
        return { before: null, after: change, result: change };
      },
    );
  },
  async decideAccountChange(
    actor: Actor,
    changeId: string,
    authorise: boolean,
    reason: string,
  ) {
    return mutate(
      actor,
      reason,
      authorise ? "Authorised account change" : "Declined account change",
      changeId,
      () => {
        const c = data.changes.find((c) => c.id === changeId);
        if (!c || c.status !== "Awaiting")
          throw Error("This change has already been handled.");
        const before = copy(c);
        if (authorise) {
          const e = data.employees.find((e) => e.id === c.employeeId)!;
          if (
            c.kind === "Deactivate account" ||
            c.kind === "Activate account"
          ) {
            if (e.id === actor.employeeId)
              throw Error("You cannot deactivate your active identity.");
            e.active = c.kind === "Activate account";
            data.logins
              .filter((l) => l.employeeId === e.id)
              .forEach((l) => (l.active = false));
          } else if (c.after.roles) {
            const roles = c.after.roles as string[];
            if (roles.some((r) => !data.settings.designations.includes(r)))
              throw Error("Unknown role.");
            if (e.id === actor.employeeId && !roles.includes(actor.activeRole))
              throw Error("Keep the active role on your current account.");
            e.roles = roles;
          }
          if (c.after.scope) e.scope = String(c.after.scope);
        }
        c.status = authorise ? "Authorised" : "Declined";
        c.comment = reason;
        notify(
          c.employeeId,
          "Account change reviewed",
          `${c.status}: ${reason}`,
          "people",
        );
        return { before, after: c, result: c };
      },
    );
  },
  async resetPassword(actor: Actor, employeeId: string, reason: string) {
    return mutate(
      actor,
      reason,
      "Queued password reset link",
      employeeId,
      () => {
        const e = data.employees.find((e) => e.id === employeeId);
        if (!e) throw Error("Employee not found.");
        notify(
          e.id,
          "Password reset requested",
          "A reset-link request was queued in the preview. No email was sent.",
          "people",
        );
        return {
          before: { requested: false },
          after: { requested: true, delivery: "Preview only" },
          result: {
            message: "Reset link queued in the preview. No email was sent.",
          },
        };
      },
    );
  },
  async saveDepartment(
    actor: Actor,
    values: Record<string, string>,
    reason: string,
  ) {
    return mutate(actor, reason, "Saved department", values.name, () => {
      if (!values.name.trim()) throw Error("Enter a department name.");
      const existing = data.departments.find((d) => d.id === values.id),
        before = copy(existing || null);
      if (
        data.departments.some(
          (d) =>
            d.id !== values.id &&
            d.name.toLowerCase() === values.name.toLowerCase(),
        )
      )
        throw Error("This department already exists.");
      if (existing) {
        const old = existing.name;
        existing.name = values.name;
        existing.headId = values.headId;
        data.employees
          .filter((e) => e.department === old)
          .forEach((e) => (e.department = values.name));
      } else
        data.departments.push({
          id: id("DEP"),
          name: values.name,
          headId: values.headId,
        });
      return { before, after: values, result: values };
    });
  },
  async createTask(actor: Actor, v: Record<string, string>, reason: string) {
    return mutate(actor, reason, "Created and assigned task", v.title, () => {
      if (!v.title.trim() || !v.deliverables.trim())
        throw Error("Add a title and deliverables.");
      if (!Number.isFinite(Date.parse(v.due)))
        throw Error("Choose a valid due date.");
      if (!["Low", "Medium", "High"].includes(v.priority))
        throw Error("Choose a valid priority.");
      if (v.ownerId === v.reviewerId)
        throw Error("Choose a reviewer other than the assignee.");
      if (
        !data.employees.some((e) => e.id === v.ownerId && e.active) ||
        !data.employees.some((e) => e.id === v.reviewerId && e.active)
      )
        throw Error("Choose active employees.");
      const load = data.tasks.filter(
        (t) =>
          t.ownerId === v.ownerId &&
          t.state !== "Completed & Closed" &&
          !t.stopped,
      ).length;
      if (load >= 3 && v.capacity !== "yes")
        throw Error(
          "This person has three or more open tasks. Confirm the capacity check.",
        );
      const t: Task = {
        id: id("TASK"),
        title: v.title,
        deliverables: v.deliverables,
        businessRecord: v.businessRecord,
        priority: v.priority as Severity,
        ownerId: v.ownerId,
        reviewerId: v.reviewerId,
        creatorId: actor.employeeId,
        state: "Assigned/Pending",
        originalDue: new Date(v.due).toISOString(),
        due: new Date(v.due).toISOString(),
        instructions: v.instructions || "",
        stopped: false,
        transfers: [],
        submissions: [],
        trail: [{ state: "Assigned/Pending", at: new Date().toISOString() }],
      };
      data.tasks.push(t);
      notify(
        t.ownerId,
        "A task was assigned to you",
        `${t.id}: ${reason}`,
        "tasks",
      );
      return { before: null, after: t, result: t };
    });
  },
  async updateTask(
    actor: Actor,
    taskId: string,
    v: Record<string, string>,
    reason: string,
  ) {
    return mutate(actor, reason, "Updated task oversight", taskId, () => {
      const t = data.tasks.find((t) => t.id === taskId);
      if (!t) throw Error("Task not found.");
      const before = copy(t);
      if (
        v.ownerId &&
        !data.employees.some((e) => e.id === v.ownerId && e.active)
      )
        throw Error("Choose an active owner.");
      if (v.ownerId && v.ownerId !== t.ownerId) {
        if (v.ownerId === t.reviewerId)
          throw Error("Owner and reviewer must be different.");
        t.transfers.push({
          from: t.ownerId,
          to: v.ownerId,
          reason,
          at: new Date().toISOString(),
        });
        notify(t.ownerId, "Task transferred", `${taskId}: ${reason}`, "tasks");
        t.ownerId = v.ownerId;
      }
      if (v.instructions !== undefined) t.instructions = v.instructions;
      if (v.stop === "yes") t.stopped = true;
      notify(t.ownerId, "Task instructions changed", reason, "tasks");
      return { before, after: t, result: t };
    });
  },
  async referToManager(actor: Actor, issueId: string, reason: string) {
    return mutate(
      actor,
      reason,
      "Referred item to responsible manager",
      issueId,
      () => {
        const issue = data.issues.find((i) => i.id === issueId);
        if (!issue) throw Error("Item not found.");
        notify(
          issue.managerId,
          `Review requested: ${issue.title}`,
          reason,
          "tasks",
        );
        return {
          before: { referred: false },
          after: { referredTo: issue.managerId, reason },
          result: {
            message: `Referred to ${person(data, issue.managerId)} in the preview.`,
          },
        };
      },
    );
  },
  async referEmployeeRecord(
    actor: Actor,
    employeeId: string,
    recordId: string,
    reason: string,
  ) {
    return mutate(
      actor,
      reason,
      "Referred employee record to responsible manager",
      recordId,
      () => {
        const employee = data.employees.find((e) => e.id === employeeId);
        if (!employee?.managerId)
          throw Error(
            "Assign a responsible manager before referring this record.",
          );
        notify(
          employee.managerId,
          `Review ${recordId} for ${employee.name}`,
          reason,
          "people",
        );
        return {
          before: null,
          after: { referredTo: employee.managerId, recordId },
          result: true,
        };
      },
    );
  },
  async correctAttendance(
    actor: Actor,
    attendanceId: string,
    field: string,
    value: string,
    reason: string,
    evidence: string,
  ) {
    return mutate(
      actor,
      reason,
      "Added attendance correction",
      attendanceId,
      () => {
        const a = data.attendance.find((a) => a.id === attendanceId);
        if (!a) throw Error("Attendance not found.");
        if (!evidence.trim())
          throw Error("Add the source evidence reference for this correction.");
        if (!["location", "punchIn", "punchOut"].includes(field))
          throw Error("Choose a permitted attendance field.");
        if (
          field === "location" &&
          ![
            "On-site",
            "Remote",
            "Unknown location",
            "On leave",
            "Absent",
          ].includes(value)
        )
          throw Error("Choose a valid location state.");
        if (field !== "location" && Number.isNaN(Date.parse(value)))
          throw Error("Enter a valid date and time.");
        const original = String(
          a[field as "location" | "punchIn" | "punchOut"] || "Not recorded",
        );
        const correction = {
          field,
          before: original,
          after: value,
          reason,
          evidence,
          at: new Date().toISOString(),
          actor: copy(actor),
        };
        a.corrections.push(correction);
        notify(
          a.employeeId,
          "Attendance correction added",
          reason,
          "attendance",
        );
        const related = data.issues.filter(
          (issue) =>
            issue.employeeId === a.employeeId && issue.kind === "Attendance",
        );
        const previousDecisions = related.map((issue) => ({
          id: issue.id,
          decision: issue.decision,
        }));
        related.forEach(
          (issue) =>
            (issue.decision =
              "Correction recorded; original source and audit retained."),
        );
        return {
          before: { original, related: previousDecisions },
          after: {
            ...correction,
            related: related.map((issue) => ({
              id: issue.id,
              decision: issue.decision,
            })),
          },
          result: correction,
        };
      },
    );
  },
  async publishAnnouncement(
    actor: Actor,
    v: Record<string, string>,
    reason: string,
  ) {
    return mutate(actor, reason, "Saved announcement", v.title, () => {
      if (!v.title.trim() || !v.body.trim())
        throw Error("Add a title and message.");
      if (!(new Date(v.expiresAt) > new Date(v.publishAt)))
        throw Error("Expiry must be later than publication.");
      const previous = data.announcements.find((a) => a.id === v.id),
        before = copy(previous || null);
      const item: Announcement = {
        id: previous?.id || id("ANN"),
        title: v.title,
        body: v.body,
        priority: v.priority as Announcement["priority"],
        audience: v.audience,
        publishAt: new Date(v.publishAt).toISOString(),
        expiresAt: new Date(v.expiresAt).toISOString(),
        readBy: previous?.readBy || [],
        author: actor.name,
      };
      if (previous) Object.assign(previous, item);
      else data.announcements.push(item);
      data.employees
        .filter(
          (e) =>
            e.active &&
            (item.audience === "All users" ||
              item.audience === e.family ||
              item.audience === e.department ||
              item.audience === e.id ||
              e.roles.includes(item.audience)),
        )
        .forEach((e) =>
          notify(
            e.id,
            item.title,
            "Announcement saved in the preview. Scheduled delivery is simulated.",
            "announcements",
          ),
        );
      return { before, after: item, result: item };
    });
  },
  async forceTerminateSession(actor: Actor, loginId: string, reason: string) {
    return mutate(actor, reason, "Terminated example session", loginId, () => {
      const l = data.logins.find((l) => l.id === loginId);
      if (!l || !l.active) throw Error("This session has already ended.");
      const before = copy(l);
      l.active = false;
      notify(
        l.employeeId,
        "Session ended by platform administrator",
        reason,
        "audit",
      );
      return { before, after: l, result: l };
    });
  },
  async referTechnicalIncident(actor: Actor, target: string, reason: string) {
    return mutate(actor, reason, "Referred technical incident", target, () => {
      notify(
        "EMP-004",
        "Technical incident referred",
        `${target}: ${reason}`,
        "audit",
      );
      return {
        before: null,
        after: { referredTo: "IT System Analyst", target, reason },
        result: { message: "Technical incident referred in the preview." },
      };
    });
  },
  async saveSettings(actor: Actor, patch: Partial<Settings>, reason: string) {
    return mutate(
      actor,
      reason,
      "Updated system settings",
      "Company governance",
      () => {
        const before = copy(data.settings);
        if (
          patch.weekdayStart &&
          patch.weekdayEnd &&
          patch.weekdayStart >= patch.weekdayEnd
        )
          throw Error("Weekday end must be later than the start.");
        if (
          patch.weekdayStart &&
          patch.saturdayEnd &&
          patch.weekdayStart >= patch.saturdayEnd
        )
          throw Error("Saturday end must be later than the start.");
        for (const key of [
          "grace",
          "breakMinutes",
          "recognitionMonths",
        ] as const)
          if (
            patch[key] !== undefined &&
            (!Number.isFinite(Number(patch[key])) || Number(patch[key]) < 0)
          )
            throw Error("Enter a non-negative number.");
        if (
          patch.permissions &&
          (!patch.permissions[actor.activeRole]?.includes("View") ||
            !patch.permissions[actor.activeRole]?.includes("Edit"))
        )
          throw Error("Keep core platform View and Edit permissions.");
        if (
          patch.holidays?.some(
            (h) =>
              !h.name.trim() ||
              h.date < "2025-01-01" ||
              Number.isNaN(Date.parse(h.date)),
          )
        )
          throw Error("Choose valid named holidays from 2025 onwards.");
        if (
          patch.designations &&
          data.employees.some((e) =>
            e.roles.some((r) => !patch.designations!.includes(r)),
          )
        )
          throw Error("Keep designations that are assigned to employees.");
        if (
          patch.statuses &&
          (patch.statuses.length !== availability.length ||
            new Set(patch.statuses.map((s) => s.name)).size !==
              availability.length ||
            patch.statuses.some((s) => !availability.includes(s.name)))
        )
          throw Error("Keep the ten canonical availability states.");
        if (
          patch.radius &&
          !(Number(patch.radius) > 0 && Number(patch.radius) <= 10000)
        )
          throw Error("Office radius must be between 1 and 10,000 metres.");
        if (
          patch.officeLatitude &&
          (Math.abs(Number(patch.officeLatitude)) > 90 ||
            !Number.isFinite(Number(patch.officeLatitude)))
        )
          throw Error("Enter a valid latitude.");
        if (
          patch.officeLongitude &&
          (Math.abs(Number(patch.officeLongitude)) > 180 ||
            !Number.isFinite(Number(patch.officeLongitude)))
        )
          throw Error("Enter a valid longitude.");
        data.settings = { ...data.settings, ...patch };
        if (patch.designations)
          for (const role of patch.designations) {
            data.settings.permissions[role] ??= ["View"];
            data.settings.scopes[role] ??= "Own records";
          }
        if (patch.permissions) {
          const permissions = patch.permissions[actor.activeRole];
          data.settings.permissions["Super Admin"] = [...permissions];
          data.settings.permissions["IT System Analyst"] = [...permissions];
        }
        return { before, after: data.settings, result: data.settings };
      },
    );
  },
  async generateReport(
    actor: Actor,
    filters: Filters,
    recipient: string,
    reason: string,
  ) {
    return mutate(
      actor,
      reason,
      "Queued scoped report",
      "Reports & intelligence",
      () => {
        if (!data.settings.exportEnabled)
          throw Error("Exports are disabled by policy.");
        if (recipient && !data.settings.exportEmail)
          throw Error("Email reports are disabled by export policy.");
        const employee = data.employees.find((e) => e.id === recipient);
        if (recipient && (!employee || !employee.active))
          throw Error("Choose an authorised employee recipient.");
        const recipientScope =
          employee?.scope ||
          data.settings.scopes[employee?.roles[0] || ""] ||
          "Own records";
        let scope = { ...filters };
        if (employee && recipientScope === "Own records")
          scope = {
            ...filters,
            employeeId:
              filters.employeeId && filters.employeeId !== recipient
                ? "__outside_scope__"
                : recipient,
          };
        if (employee && recipientScope === "Assigned team")
          scope = {
            ...filters,
            department:
              filters.department && filters.department !== employee.department
                ? "__outside_scope__"
                : employee.department,
          };
        const report = {
          id: id("REPORT"),
          title: "Scoped operations report",
          scope: JSON.stringify(scope),
          recipient: employee?.name || actor.name,
          status: recipient
            ? "Preview email queue · not sent"
            : "Ready in preview",
          at: new Date().toISOString(),
        };
        data.reportJobs.unshift(report);
        if (recipient)
          notify(
            recipient,
            "Report queued for your scope",
            report.scope,
            "reports",
          );
        return { before: null, after: report, result: report };
      },
    );
  },
  async exportView(
    actor: Actor,
    view: ExportView,
    filters: Filters,
    format: ExportFormat,
  ) {
    actorCheck(actor);
    if (
      !data.settings.exportEnabled ||
      !data.settings.permissions[actor.activeRole]?.includes("Export")
    )
      throw Error("Exports are disabled by the current policy or role.");
    const rows = copy(exportRows(view, filters));
    const blob = await makeExport(format, `${view} · ${today}`, rows);
    await mutate(
      actor,
      "User exported the current filtered view",
      "Exported filtered records",
      view,
      () => {
        const item = {
          id: id("EXPORT"),
          at: new Date().toISOString(),
          format,
          view,
          count: rows.length,
          status: "Ready",
          actor: copy(actor),
        };
        data.exports.unshift(item);
        return {
          before: { filters, format },
          after: { count: rows.length },
          result: item,
        };
      },
    );
    return {
      blob,
      filename: `ciril-${view}-${today}.${format === "Excel" ? "xlsx" : format.toLowerCase()}`,
    };
  },
  async markNoticeRead(actor: Actor, noticeId: string) {
    return mutate(
      actor,
      "User opened the notification",
      "Read notification",
      noticeId,
      () => {
        const n = data.notices.find(
          (n) => n.id === noticeId && n.recipientId === actor.employeeId,
        );
        if (!n) throw Error("Outside your data scope");
        const before = copy(n);
        n.read = true;
        return { before, after: n, result: n };
      },
    );
  },
  async markAnnouncementRead(actor: Actor, announcementId: string) {
    return mutate(
      actor,
      "Employee acknowledged the live announcement",
      "Read announcement",
      announcementId,
      () => {
        const a = data.announcements.find((a) => a.id === announcementId),
          employee = data.employees.find((e) => e.id === actor.employeeId)!;
        if (!a) throw Error("Announcement not found.");
        if (publicationStatus(a) !== "Live")
          throw Error(
            "Read receipts are available only for live announcements.",
          );
        if (!(
          a.audience === "All users" ||
          a.audience === employee.id ||
          a.audience === employee.family ||
          a.audience === employee.department ||
          employee.roles.includes(a.audience)
        ))
          throw Error(
            "You are viewing platform oversight, not an audience receipt.",
          );
        const before = [...a.readBy];
        if (!a.readBy.includes(actor.employeeId))
          a.readBy.push(actor.employeeId);
        return { before, after: a.readBy, result: a };
      },
    );
  },
};
