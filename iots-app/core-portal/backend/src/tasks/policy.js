const { randomUUID } = require("node:crypto");
const terminal = ["Completed", "Cancelled"];
const editable = ["Assigned", "In progress", "Changes requested"];

function fail(message, status = 400) {
  throw Object.assign(new Error(message), { status });
}
function requireThat(condition, message, status = 422) {
  if (!condition) fail(message, status);
}
function text(value, label, maximum = 4000) {
  requireThat(
    typeof value === "string" &&
      value.trim().length > 0 &&
      value.trim().length <= maximum,
    `Enter ${label} (up to ${maximum} characters).`,
  );
  return value.trim();
}
function optionalText(value, maximum = 4000) {
  if (value === undefined || value === null || value === "") return "";
  return text(value, "valid text", maximum);
}
function visible(task, actor) {
  return task.status === "Draft"
    ? actor.manager && task.createdBy === actor.id
    : actor.manager ||
        actor.oversight ||
        task.ownerId === actor.id ||
        task.contributorIds?.includes(actor.id);
}
function forViewer(task, actor) {
  if (actor.manager || actor.oversight) return task;
  const firstAssignment = task.events.findIndex(entry => entry.action === "assign");
  return { ...task, events: firstAssignment < 0 ? [] : task.events.slice(firstAssignment) };
}
function owner(task, actor) {
  requireThat(
    task.ownerId === actor.id && actor.execute,
    "Only the assigned employee can do this.",
    403,
  );
}
function manager(actor) {
  requireThat(
    actor.manager,
    "This action requires General Manager or Senior Manager access.",
    403,
  );
}
function active(task) {
  requireThat(
    !terminal.includes(task.status),
    "This task is closed. Its history is read-only.",
    409,
  );
}
function date(value) {
  requireThat(
    typeof value === "string" && Number.isFinite(Date.parse(value)),
    "Choose a valid deadline.",
  );
  return new Date(value).toISOString();
}
function lineItems(value, label) {
  requireThat(
    Array.isArray(value) && value.length <= 30,
    `Enter up to 30 ${label}.`,
  );
  return value.map((item) => text(item, label, 1000));
}
function event(task, actor, action, note = "") {
  task.events.push({
    id: randomUUID(),
    action,
    note,
    detail: note,
    by: actor.name,
    actorId: actor.id,
    role: actor.roles.map((role) => role.label).join(" / "),
    roles: actor.roles,
    at: new Date().toISOString(),
  });
}
function validateAssignment(task, users) {
  text(task.title, "a task title", 180);
  text(task.description, "a clear work brief");
  requireThat(
    users.some((user) => user.id === task.ownerId && user.execute && !user.oversight),
    "Choose an employee.",
  );
  requireThat(
    users.some((user) => user.id === task.reviewerId && user.manager),
    "Choose a management reviewer.",
  );
  requireThat(
    task.ownerId !== task.reviewerId,
    "The employee cannot review their own work.",
  );
  requireThat(
    task.criteria.length > 0,
    "Add at least one acceptance requirement.",
  );
  date(task.due);
  requireThat(
    Date.parse(task.due) > Date.now(),
    "Choose a future deadline before assigning.",
  );
}
function makeTask(body, actor) {
  manager(actor);
  const now = new Date().toISOString();
  return {
    id: `TSK-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`,
    title: text(body.title, "a task title", 180),
    description: optionalText(body.description || body.brief),
    ownerId: body.ownerId || "",
    reviewerId: body.reviewerId || "",
    priority: body.priority === "High" ? "High" : "Normal",
    due: body.due ? date(body.due) : "",
    originalDue: "",
    status: "Draft",
    revision: 1,
    category: optionalText(body.category, 100) || "General work",
    brief: optionalText(body.description || body.brief),
    deliverables: lineItems(body.deliverables || [], "deliverables"),
    notes: [],
    versions: [],
    workingDrafts: [],
    effortEntries: [],
    effortMinutes: 0,
    checklist: [],
    criteria: lineItems(body.criteria || [], "acceptance requirements"),
    references: lineItems(body.references || [], "references"),
    submissions: [],
    files: [],
    events: [],
    progress: 0,
    blocker: null,
    deadlineRequest: null,
    createdAt: now,
    assignedAt: null,
    createdBy: actor.id,
    referenceFiles: [],
    contributorIds: [],
    assignments: [],
    publicationRequired: body.publicationRequired === true,
  };
}

function applyAction(task, actor, body, users) {
  requireThat(
    Number.isInteger(body.revision) && body.revision === task.revision,
    "This task changed. Reload it before trying again.",
    409,
  );
  if (body.action !== "rate") active(task);
  const trackedFields = ["title", "brief", "category", "ownerId", "reviewerId", "priority", "due", "originalDue", "criteria", "deliverables", "references", "publicationRequired", "status", "assignedAt"];
  const trackChanges = ["edit", "assign", "reassign", "delegate-reviewer", "decide-deadline", "cancel"].includes(body.action);
  const beforeFields = trackChanges ? Object.fromEntries(trackedFields.map(field => [field, structuredClone(task[field] ?? null)])) : null;
  const note = () => text(body.note, "a short explanation");
  let description = "";
  switch (body.action) {
    case "assign":
      manager(actor);
      requireThat(task.status === "Draft", "Only drafts can be assigned.", 409);
      validateAssignment(task, users);
      task.status = "Assigned";
      task.assignedAt = new Date().toISOString();
      task.originalDue = task.due;
      task.assignedBy = actor.name;
      task.manager = users.find((user) => user.id === task.reviewerId).name;
      task.reviewer = task.manager;
      task.reviewerName = task.manager;
      task.contributorIds = [task.ownerId];
      task.assignments.push({
        ownerId: task.ownerId,
        by: actor.id,
        at: task.assignedAt,
      });
      task.checklist = task.criteria.map((text, index) => ({
        id: `brief-${index + 1}`,
        text,
        checked: false,
      }));
      description = `Assigned to ${users.find((user) => user.id === task.ownerId).name}.`;
      break;
    case "start":
      owner(task, actor);
      requireThat(task.status === "Assigned", "Start an assigned task.", 409);
      task.status = "In progress";
      task.startedAt = new Date().toISOString();
      description = "Work started.";
      break;
    case "note":
      owner(task, actor);
      requireThat(task.status !== "Draft", "Assign this task first.", 409);
      description = note();
      task.notes.push({
        at: new Date().toISOString(),
        text: description,
        actorId: actor.id,
      });
      break;
    case "progress":
      owner(task, actor);
      requireThat(
        editable.includes(task.status),
        "Progress can be updated on active work.",
        409,
      );
      requireThat(
        Number.isInteger(body.progress) &&
          body.progress >= 0 &&
          body.progress <= 100,
        "Enter progress from 0 to 100.",
      );
      task.progress = body.progress;
      description = `${task.progress}% reported. ${note()}`;
      break;
    case "block":
      owner(task, actor);
      requireThat(
        editable.includes(task.status),
        "Only active work can be blocked.",
        409,
      );
      requireThat(
        body.severity === undefined ||
          ["Low", "Medium", "High"].includes(body.severity),
        "Choose a valid severity.",
      );
      task.blocker = {
        id: randomUUID(),
        reason: note(),
        severity: body.severity || "Medium",
        category: optionalText(body.blockType, 100) || "Other",
        owner: task.manager,
        open: true,
        at: new Date().toISOString(),
        resolvedAt: null,
      };
      task.status = "Blocked";
      description = task.blocker.reason;
      break;
    case "resolve":
      manager(actor);
      requireThat(
        task.status === "Blocked" && task.blocker?.open,
        "No open blocker to resolve.",
        409,
      );
      description = note();
      task.blocker.open = false;
      task.blocker.resolution = description;
      task.blocker.resolvedAt = new Date().toISOString();
      break;
    case "resume":
      owner(task, actor);
      requireThat(
        task.status === "Blocked" && task.blocker?.open === false,
        "A manager must resolve the blocker first.",
        409,
      );
      task.status = "In progress";
      description = "Employee resumed work after blocker resolution.";
      break;
    case "request-deadline":
      owner(task, actor);
      requireThat(task.status !== "Draft", "Assign this task first.", 409);
      requireThat(
        task.deadlineRequest?.status !== "Pending",
        "A deadline request is already waiting for a decision.",
        409,
      );
      requireThat(
        Date.parse(body.requestedDue) > Date.parse(task.due) &&
          Date.parse(body.requestedDue) > Date.now(),
        "Request a later future deadline.",
      );
      task.deadlineRequest = {
        requestedDue: date(body.requestedDue),
        reason: note(),
        status: "Pending",
        at: new Date().toISOString(),
        requesterId: actor.id,
      };
      description = task.deadlineRequest.reason;
      break;
    case "decide-deadline":
      manager(actor);
      requireThat(
        task.deadlineRequest?.status === "Pending",
        "No pending deadline request.",
        409,
      );
      requireThat(
        task.deadlineRequest.requesterId !== actor.id,
        "You cannot approve your own request.",
        403,
      );
      requireThat(
        ["approve", "decline"].includes(body.decision),
        "Choose approve or decline.",
      );
      description = note();
      if (body.decision === "approve")
        task.due = task.deadlineRequest.requestedDue;
      Object.assign(task.deadlineRequest, {
        status: body.decision === "approve" ? "Approved" : "Declined",
        decisionNote: description,
        decidedBy: actor.id,
        decidedAt: new Date().toISOString(),
      });
      break;
    case "submit": {
      owner(task, actor);
      requireThat(
        ["In progress", "Changes requested"].includes(task.status),
        "Start work or address requested changes before submitting.",
        409,
      );
      requireThat(
        Array.isArray(body.fileIds) &&
          body.fileIds.length > 0 &&
          body.fileIds.length <= 10,
        "Attach at least one ready evidence file.",
      );
      const ids = [...new Set(body.fileIds)];
      requireThat(
        ids.every((id) =>
          task.files.some(
            (file) =>
              file.id === id &&
              file.uploaderId === actor.id &&
              file.purpose !== "reference",
          ),
        ),
        "Choose accessible evidence uploaded by you.",
      );
      if (body.draftId) {
        const draft = task.workingDrafts.find(
          (draft) => draft.id === body.draftId && draft.actorId === actor.id,
        );
        requireThat(draft, "Choose your saved working draft.");
        requireThat(
          !body.draftResolution ||
            ["discard", "note"].includes(body.draftResolution),
          "Choose whether to discard the working draft or retain it as a note.",
        );
        if (body.draftResolution === "note")
          task.notes.push({
            at: new Date().toISOString(),
            actorId: actor.id,
            text: `Working draft retained: ${draft.file}. ${draft.note} ${text(body.remark, "a note explaining the retained draft")}`,
            attachments: structuredClone(draft.attachments),
          });
        task.workingDrafts = task.workingDrafts.filter(
          (draft) => draft.id !== body.draftId,
        );
      }
      description = note();
      const at = new Date().toISOString();
      task.submissions.push({
        id: randomUUID(),
        version: task.submissions.length + 1,
        fileIds: ids,
        note: description,
        submittedBy: actor.id,
        submittedAt: at,
        status: "Waiting for review",
      });
      task.versions.push({
        number: task.submissions.length,
        file:
          optionalText(body.file, 180) ||
          task.files.find((file) => file.id === ids[0]).name,
        note: description,
        at,
        actorId: actor.id,
        attachments: ids.map((id) => ({
          ...task.files.find((file) => file.id === id),
          server: true,
        })),
      });
      task.status = "In review";
      task.reviewOpened = false;
      task.reviewStageId = "management-review";
      break;
    }
    case "approve":
    case "changes": {
      manager(actor);
      requireThat(
        task.reviewerId === actor.id,
        "Only the named reviewer can make this decision.",
        403,
      );
      requireThat(
        task.ownerId !== actor.id,
        "You cannot approve your own work.",
        403,
      );
      requireThat(
        task.status === "In review",
        "No submission is waiting for review.",
        409,
      );
      if (body.action === "approve")
        requireThat(
          body.acceptanceConfirmed === true,
          "Confirm the evidence meets the acceptance checklist and required deliverables.",
        );
      description = note();
      const submission = task.submissions.at(-1);
      requireThat(
        submission && submission.submittedBy !== actor.id,
        "A different person must review this evidence.",
        403,
      );
      Object.assign(submission, {
        status: body.action === "approve" ? "Approved" : "Changes requested",
        reviewNote: description,
        reviewedBy: actor.id,
        reviewedAt: new Date().toISOString(),
      });
      if (body.action === "approve")
        submission.acceptance = {
          criteria: [...task.criteria],
          deliverables: [...task.deliverables],
          confirmedBy: actor.id,
          confirmedAt: submission.reviewedAt,
        };
      task.status =
        body.action === "approve" ? "Completed" : "Changes requested";
      if (body.action === "approve" && task.publicationRequired)
        requireThat(
          task.publicationProof?.fileIds?.length > 0,
          "Publication proof is required before this task can be closed.",
          409,
        );
      if (body.action === "changes") {
        task.returnNote = description;
        task.returnedBy = actor.name;
      }
      if (body.action === "approve")
        task.completedAt = new Date().toISOString();
      break;
    }
    case "reassign":
      manager(actor);
      requireThat(
        ["In progress", "Changes requested"].includes(task.status),
        "Resolve the open review before reassigning.",
        409,
      );
      requireThat(
        users.some((user) => user.id === body.ownerId && user.execute && !user.oversight) &&
          body.ownerId !== task.reviewerId,
        "Choose an eligible employee other than the reviewer.",
      );
      description = `${task.ownerId} to ${body.ownerId}. ${note()}`;
      task.contributorIds = [
        ...new Set([
          ...(task.contributorIds || []),
          task.ownerId,
          body.ownerId,
        ]),
      ];
      task.assignments ??= [];
      task.assignments.push({
        previousOwnerId: task.ownerId,
        ownerId: body.ownerId,
        by: actor.id,
        at: new Date().toISOString(),
        reason: description,
      });
      task.ownerId = body.ownerId;
      task.assignedAt = new Date().toISOString();
      task.status = "Assigned";
      task.blocker = null;
      if (task.deadlineRequest?.status === "Pending")
        Object.assign(task.deadlineRequest, {
          status: "Withdrawn",
          decisionNote: "Ownership changed before a decision.",
          decidedBy: actor.id,
          decidedAt: task.assignedAt,
        });
      break;
    case "rate":
      manager(actor);
      requireThat(task.status === "Completed", "Rate the work after it is completed.", 409);
      requireThat(task.reviewerId === actor.id && task.ownerId !== actor.id, "Only the named independent reviewer can rate this work.", 403);
      requireThat(!task.rating, "A saved rating is part of this task's history and cannot be replaced.", 409);
      requireThat(Number.isInteger(body.score) && body.score >= 1 && body.score <= 5, "Choose a whole-number rating from 1 to 5.");
      description = note();
      task.rating = { score: body.score, note: description, actorId: actor.id, by: actor.name, at: new Date().toISOString(), version: task.versions.at(-1)?.number || task.submissions.length };
      break;
    case "cancel":
      manager(actor);
      description = note();
      task.status = "Cancelled";
      break;
    case "edit":
      manager(actor);
      requireThat(
        task.status === "Draft",
        "Only an unassigned draft can be edited.",
        409,
      );
      for (const field of ["title", "description", "brief", "category"])
        if (body[field] !== undefined)
          task[field] = optionalText(
            body[field],
            field === "title" ? 180 : 4000,
          );
      task.description = body.description ?? body.brief ?? task.description;
      task.brief = task.description;
      for (const field of ["ownerId", "reviewerId"])
        if (body[field] !== undefined) task[field] = body[field];
      if (body.due !== undefined) task.due = date(body.due);
      if (body.criteria !== undefined)
        task.criteria = lineItems(body.criteria, "acceptance requirements");
      if (body.deliverables !== undefined)
        task.deliverables = lineItems(body.deliverables, "deliverables");
      if (body.references !== undefined)
        task.references = lineItems(body.references, "references");
      if (body.priority !== undefined) {
        requireThat(
          ["Normal", "High"].includes(body.priority),
          "Choose Normal or High priority.",
        );
        task.priority = body.priority;
      }
      if (body.publicationRequired !== undefined) {
        requireThat(
          typeof body.publicationRequired === "boolean",
          "Choose a valid publication requirement.",
        );
        task.publicationRequired = body.publicationRequired;
      }
      description = "Draft updated.";
      break;
    case "review-start":
      manager(actor);
      requireThat(
        task.reviewerId === actor.id && task.ownerId !== actor.id,
        "Only the named independent reviewer can open review.",
        403,
      );
      requireThat(
        task.status === "In review",
        "No submission is waiting for review.",
        409,
      );
      task.reviewOpened = true;
      description = "Review opened.";
      break;
    case "delegate-reviewer":
      manager(actor);
      requireThat(task.status !== "Draft", "Assign the task first.", 409);
      requireThat(
        users.some((user) => user.id === body.reviewerId && user.manager) &&
          body.reviewerId !== task.ownerId,
        "Choose a different eligible management reviewer.",
      );
      task.reviewerId = body.reviewerId;
      task.reviewer = users.find((user) => user.id === body.reviewerId).name;
      task.manager = task.reviewer;
      task.reviewerName = task.reviewer;
      task.reviewOpened = false;
      description = note();
      break;
    case "effort": {
      owner(task, actor);
      requireThat(
        task.status !== "Draft" && task.status !== "In review",
        "Log effort while working on an assigned task.",
        409,
      );
      requireThat(
        Number.isInteger(body.minutes) &&
          body.minutes > 0 &&
          body.minutes <= 1440,
        "Enter between 1 and 1440 minutes.",
      );
      const workDate =
        body.date ||
        new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
          new Date(),
        );
      const dateValue = Date.parse(workDate);
      requireThat(
        /^\d{4}-\d{2}-\d{2}$/.test(workDate) &&
          Number.isFinite(dateValue) &&
          new Date(dateValue).toISOString().slice(0, 10) === workDate &&
          dateValue <= Date.now(),
        "Choose a valid work date that is not in the future.",
      );
      const total = task.effortEntries
        .filter(
          (entry) => entry.date === workDate && entry.actorId === actor.id,
        )
        .reduce((sum, entry) => sum + entry.minutes, 0);
      requireThat(
        total + body.minutes <= 1440,
        "Daily effort for this task cannot exceed 1440 minutes.",
      );
      description = note();
      task.effortEntries.push({
        id: randomUUID(),
        at: new Date().toISOString(),
        date: workDate,
        minutes: body.minutes,
        note: description,
        actorId: actor.id,
      });
      task.effortMinutes += body.minutes;
      break;
    }
    case "work-update": {
      owner(task, actor);
      requireThat(task.status !== "Draft", "Assign this task first.", 409);
      requireThat(task.status !== "Assigned", "Start the task first.", 409);
      const update = optionalText(body.note);
      const progress =
        body.progress === undefined ? task.progress : body.progress;
      const minutes = body.minutes === undefined ? 0 : body.minutes;
      requireThat(
        Number.isInteger(progress) && progress >= 0 && progress <= 100,
        "Enter progress from 0 to 100.",
      );
      requireThat(
        Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440,
        "Enter up to 1440 minutes.",
      );
      requireThat(
        update || progress !== task.progress || minutes > 0,
        "Add a work note, change progress or enter time.",
      );
      if (progress !== task.progress) {
        const consumed = new Set(task.progressEvidenceFileIds || []);
        const evidence = (task.files || []).filter(file => file.uploaderId === actor.id && file.purpose === "evidence" && !consumed.has(file.id));
        const recentNote = (task.notes || []).some(entry => entry.actorId === actor.id && entry.text?.trim().length >= 3 && Date.parse(entry.at) > Date.parse(task.progressUpdatedAt || "1970-01-01"));
        requireThat(update.length >= 3 || recentNote || evidence.length > 0, "Describe the work you completed or upload new evidence before changing progress.");
        task.progressEvidenceFileIds = [...consumed, ...evidence.map(file => file.id)];
        task.progressUpdatedAt = new Date().toISOString();
      }
      if (progress !== task.progress)
        requireThat(
          editable.includes(task.status),
          "Progress can be updated on active work.",
          409,
        );
      if (minutes > 0)
        requireThat(
          task.status !== "In review",
          "Log effort while working on the task.",
          409,
        );
      const at = new Date().toISOString();
      if (update) task.notes.push({ at, text: update, actorId: actor.id });
      task.progress = progress;
      if (minutes > 0) {
        const workDate = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Kolkata",
        }).format(new Date());
        const total = task.effortEntries
          .filter(
            (entry) => entry.date === workDate && entry.actorId === actor.id,
          )
          .reduce((sum, entry) => sum + entry.minutes, 0);
        requireThat(
          total + minutes <= 1440,
          "Daily effort for this task cannot exceed 1440 minutes.",
        );
        task.effortEntries.push({
          id: randomUUID(),
          at,
          date: workDate,
          minutes,
          note: update || "Work time recorded.",
          actorId: actor.id,
        });
        task.effortMinutes += minutes;
      }
      description = `${progress}% progress${minutes ? `; ${minutes} minutes recorded` : ""}${update ? `. ${update}` : "."}`;
      break;
    }
    case "checklist": {
      owner(task, actor);
      requireThat(
        editable.includes(task.status),
        "Update requirements while working on the task.",
        409,
      );
      const item = task.checklist.find((item) => item.id === body.itemId);
      requireThat(
        item && typeof body.checked === "boolean",
        "Choose a valid requirement.",
      );
      item.checked = body.checked;
      description = `${item.text}: ${body.checked ? "checked" : "unchecked"}`;
      break;
    }
    case "save-draft": {
      owner(task, actor);
      requireThat(
        ["In progress", "Changes requested"].includes(task.status),
        "Save a draft while working on the task.",
        409,
      );
      requireThat(
        Array.isArray(body.fileIds) &&
          body.fileIds.length > 0 &&
          body.fileIds.every((id) =>
            task.files.some(
              (file) => file.id === id && file.uploaderId === actor.id,
            ),
          ),
        "Attach accessible evidence uploaded by you.",
      );
      const previous =
        body.draftId &&
        task.workingDrafts.find(
          (draft) => draft.id === body.draftId && draft.actorId === actor.id,
        );
      requireThat(
        !body.draftId || previous,
        "Choose your saved working draft.",
      );
      const draft = {
        id: previous?.id || randomUUID(),
        actorId: actor.id,
        file: optionalText(body.file, 180),
        note: note(),
        at: new Date().toISOString(),
        attachments: body.fileIds.map((id) => ({
          ...task.files.find((file) => file.id === id),
          server: true,
        })),
      };
      if (previous)
        task.workingDrafts = task.workingDrafts.map((item) =>
          item.id === previous.id ? draft : item,
        );
      else task.workingDrafts.push(draft);
      description = draft.note;
      break;
    }
    case "publication-proof":
      owner(task, actor);
      requireThat(
        task.publicationRequired && task.status !== "Draft",
        "This task does not need publication proof.",
        409,
      );
      requireThat(
        Array.isArray(body.fileIds) &&
          body.fileIds.length > 0 &&
          body.fileIds.every((id) =>
            task.files.some(
              (file) =>
                file.id === id &&
                file.uploaderId === actor.id &&
                file.purpose !== "reference",
            ),
          ),
        "Choose your saved publication evidence.",
      );
      task.publicationProof = {
        fileIds: [...new Set(body.fileIds)],
        note: note(),
        at: new Date().toISOString(),
        actorId: actor.id,
      };
      description = task.publicationProof.note;
      break;
    default:
      fail("Unknown task action.", 400);
  }
  task.revision += 1;
  task.updatedAt = new Date().toISOString();
  event(task, actor, body.action, description);
  if (beforeFields) {
    const entry = task.events.at(-1);
    entry.source = "manager-command";
    entry.changes = trackedFields.filter(field => JSON.stringify(beforeFields[field]) !== JSON.stringify(task[field] ?? null)).map(field => ({ field, before: beforeFields[field], after: structuredClone(task[field] ?? null) }));
  }
  return task;
}

module.exports = {
  fail,
  requireThat,
  text,
  optionalText,
  visible,
  forViewer,
  owner,
  manager,
  active,
  date,
  lineItems,
  event,
  makeTask,
  applyAction,
};
