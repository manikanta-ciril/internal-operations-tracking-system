import { defaultRoles } from "./catalog";
export const STORAGE_KEY = "ciril-superadmin-preview-v1";
export function emptyDraft() {
  return {
    version: 1,
    company: { name: "", legalName: "", email: "", website: "" },
    offices: [],
    departments: [],
    people: [],
    members: [],
    roles: structuredClone(defaultRoles),
    rules: { start: "09:30", end: "18:00", saturdayEnd: "16:00", saved: false },
    holidays: [],
    modules: {},
    connection: {
      url: "",
      source: "CIRIL CRM",
      mode: "Read only",
      saved: false,
    },
    activity: [],
  };
}
export function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || saved.version !== 1) return emptyDraft();
    const fresh = emptyDraft();
    for (const key of [
      "offices",
      "departments",
      "people",
      "members",
      "roles",
      "holidays",
      "activity",
    ])
      if (
        !Array.isArray(saved[key]) ||
        saved[key].some((v) => !v || typeof v !== "object")
      )
        return fresh;
    if (
      !saved.company ||
      typeof saved.company.name !== "string" ||
      !saved.rules ||
      !saved.modules ||
      typeof saved.modules !== "object"
    )
      return fresh;
    return {
      ...fresh,
      ...saved,
      company: { ...fresh.company, ...saved.company },
      rules: { ...fresh.rules, ...saved.rules },
      connection: { ...fresh.connection, ...saved.connection },
    };
  } catch {
    return emptyDraft();
  }
}
export const newId = () =>
  crypto.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function setupSteps(draft) {
  return [
    {
      id: "company",
      name: "Add your company",
      detail: "Name and contact details",
      done: !!draft.company.name,
    },
    {
      id: "offices",
      name: "Add an office",
      detail: "Address and sign-in location",
      done: !!draft.offices.length,
    },
    {
      id: "departments",
      name: "Create departments",
      detail: "Organise how your team works",
      done: !!draft.departments.length,
    },
    {
      id: "people",
      name: "Add your employees",
      detail: "Office, department and assigned roles",
      done: !!draft.people.length,
    },
    {
      id: "roles",
      name: "Review access",
      detail: "Permissions and approval responsibilities",
      done: draft.roles.some((r) => r.reviewed),
    },
    {
      id: "work-rules",
      name: "Set working hours",
      detail: "Weekdays, Saturdays and holidays",
      done: !!draft.rules.saved,
    },
  ];
}
export function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, "");
  return raw || "home";
}
export const dateText = (date) =>
  new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }) + " IST";
export function uniqueName(rows, name, exclude) {
  return !rows.some(
    (r) =>
      r.id !== exclude &&
      r.name?.trim().toLowerCase() === name.trim().toLowerCase(),
  );
}
