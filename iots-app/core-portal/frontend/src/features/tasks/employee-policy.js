export const employeeRoles = new Set([
  "general-manager",
  "senior-manager",
  "executive",
  "coordinator",
  "lead-manager",
  "business-development-executive",
  "creative-communication-associate",
  "it-system-analyst",
]);
export const hasEmployeeWork = (role) => employeeRoles.has(role);

export function workRoute(path) {
  const [section = "", encodedId] = path.slice(1).split("/");
  const view = {
    "": "work",
    tasks: "work",
    reviews: "reviews",
    history: "history",
    report: "report",
    blockers: "blockers",
    requests: "requests",
    scope: "scope",
  }[section];
  return view
    ? { view, id: encodedId ? decodeURIComponent(encodedId) : null }
    : null;
}

export function workPath(view) {
  const [section, id] = view.split("/");
  const route = {
    work: "tasks",
    report: "report",
    reviews: "reviews",
    history: "history",
    blockers: "blockers",
    requests: "requests",
    scope: "scope",
  }[section];
  return route ? `/${route}${id ? "/" + encodeURIComponent(id) : ""}` : "/";
}
