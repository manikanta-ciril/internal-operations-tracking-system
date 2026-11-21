const pendingCommands = new Map();
const uploadCommands = new WeakMap();
const actionLabels = {
  assign: "Assigned",
  start: "In progress",
  resume: "In progress",
  submit: "In review",
  approve: "Completed",
  changes: "Changes requested",
  block: "Blocked",
  resolve: "Issue resolved",
  "request-deadline": "Deadline request",
  "decide-deadline": "Deadline decision",
  reassign: "Reassigned",
  "delegate-reviewer": "Reviewer changed",
  "review-start": "Under review",
  cancel: "Cancelled",
  "save-draft": "Working draft saved",
  "work-update": "Work update",
  effort: "Time logged",
  note: "Work note",
  rate: "Work rated",
  edit: "Brief updated",
  checklist: "Checklist updated",
  "publication-proof": "Publication evidence saved",
};
function presentTask(task) {
  return {
    ...task,
    events: task.events.map((event) => ({
      ...event,
      command: event.command || event.action,
      action: actionLabels[event.action] || event.action,
      source: event.source || "Authenticated server command",
    })),
  };
}

export async function taskApi(
  path = "",
  { body, file, headers = {}, signal } = {},
) {
  const writing = body !== undefined || Boolean(file);
  const intent = file ? file : `${path}:${JSON.stringify(body)}`;
  const commands = file ? uploadCommands : pendingCommands;
  if (writing && !commands.has(intent))
    commands.set(intent, crypto.randomUUID());
  let response;
  try {
    response = await fetch(`/api/auth/tasks${path}`, {
      method: writing ? "POST" : "GET",
      credentials: "same-origin",
      signal,
      headers: {
        ...(writing ? { "Idempotency-Key": commands.get(intent) } : {}),
        ...(file
          ? {
              "Content-Type": file.type || "application/octet-stream",
              "X-File-Name": encodeURIComponent(file.name),
            }
          : body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: file || (body === undefined ? undefined : JSON.stringify(body)),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "The server could not be reached. Your input is retained. Retry when connected.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (response.ok || response.status < 500) commands.delete(intent);
  if (!response.ok)
    throw Object.assign(
      new Error(data.message || "Work could not be saved. Reload and retry."),
      { status: response.status },
    );
  if (data.task) data.task = presentTask(data.task);
  if (data.tasks) data.tasks = data.tasks.map(presentTask);
  return data;
}

export const taskCommand = (task, action, values = {}) =>
  taskApi(`/${encodeURIComponent(task.id)}/actions`, {
    body: { action, revision: task.revision, ...values },
  });

export async function readTaskFile(proof, preview = false) {
  const response = await fetch(
    `/api/auth/tasks/files/${encodeURIComponent(proof.id)}${preview ? "?preview=1" : ""}`,
    { credentials: "same-origin" },
  );
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.message || (response.status === 401 ? "Sign in again to open this file." : "This file could not be opened. Refresh the work record and retry."));
  }
  return response.blob();
}

export async function downloadTaskFile(proof) {
  const url = URL.createObjectURL(await readTaskFile(proof));
  const link = document.createElement("a");
  link.href = url;
  link.download = proof.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
