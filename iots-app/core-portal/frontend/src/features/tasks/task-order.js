export function assignedTime(task) {
  const event = task.events?.find((event) => event.action === "Assigned");
  const value = Date.parse(task.assignedAt || event?.at || task.createdAt);
  return Number.isFinite(value) ? value : 0;
}

export function compareAssignedTasks(a, b) {
  return Number(b.status === "Assigned") - Number(a.status === "Assigned") ||
    assignedTime(b) - assignedTime(a) || a.id.localeCompare(b.id);
}
