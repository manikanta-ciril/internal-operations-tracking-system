import { designerRole, isInReview } from "./role-policy.js";
import { initialState, istDate } from "../../tasks/model.js";
import { employeeProfile } from "../../tasks/workflow.js";

function ensureBriefChecklist(task) {
  task.checklist ??= [];
  const known = new Set(task.checklist.map((item) => item.id));
  (task.criteria || []).forEach((text, index) => {
    const id = `brief-${index + 1}`;
    if (!known.has(id)) task.checklist.push({ id, text, checked: false });
  });
}

export function prepare(state) {
  if (
    state?.version !== 1 ||
    !Array.isArray(state.tasks) ||
    !state.employee ||
    !state.remarks ||
    !Array.isArray(state.deliveries) ||
    !Array.isArray(state.extraWork) ||
    !Array.isArray(state.dismissedReminders)
  )
    throw Error(
      "This saved workspace could not be read. Your original browser data has been kept.",
    );
  if (
    state.tasks.some(
      (t) =>
        !t.id ||
        !t.title ||
        !t.status ||
        !Array.isArray(t.events) ||
        !Array.isArray(t.notes) ||
        !Array.isArray(t.versions),
    )
  )
    throw Error(
      "A saved task is incomplete. Your original browser data has been kept.",
    );
  state.employee = employeeProfile(state);
  state.workspace ??= structuredClone(designerRole);
  state.workspace.reportAudience = [...designerRole.reportAudience];
  state.manualReports ??= {};
  state.settings ??= { availability: "Available", snoozedUntil: null };
  state.readNotifications ??= [];
  state.tasks.forEach((t) => {
    t.ownerId ??= state.employee.id;
    if (isInReview(t)) {
      if (t.status !== "In review") t.legacyStatus = t.status;
      t.status = "In review";
      t.reviewStageId ??= state.workspace.reviewStages[0].id;
    }
    t.reviewer ??= "Creative reviewer";
    t.manager ??= "Reporting manager";
    t.references ??= [];
    t.criteria ??= [];
    ensureBriefChecklist(t);
    t.effortEntries ??= [];
  });
  return state;
}
export function examples(employee) {
  const s = prepare(initialState(new Date(), employee));
  const now = new Date(),
    date = istDate(now);
  const t = s.tasks;
  t[0].criteria = [
    "Visiting card, signature and letterhead are included",
    "Editable source and print-ready PDF are supplied",
  ];
  t[1].priority = "High";
  t[1].progress = 85;
  t[1].criteria = [
    "Square and story formats are included",
    "Headline and logo spacing follow reviewer feedback",
  ];
  t[2].criteria = [
    "Keep all supplied member information and wording",
    "Apply the current CIRIL presentation template",
    "Provide an editable deck and a review PDF",
  ];
  t[2].events = [
    {
      at: t[2].createdAt,
      by: "Reporting manager",
      action: "Assigned",
      detail: t[2].brief,
    },
  ];
  t[2].events.push({
    at: now.toISOString(),
    by: "Reporting manager",
    action: "Reassigned",
    detail:
      "Reallocated from Creative reviewer to the designer for layout execution. Handover: approved copy is ready; rebuild the presentation layout. Deadline retained after reviewing available time.",
    after: { status: "Assigned", progress: 0 },
    source: "Example manager decision",
  });
  t[3].reviewOpened = true;
  t[3].criteria = [
    "Verify each market figure against the supplied data",
    "Keep every slide readable in carousel format",
    "Attach the source data reference",
  ];
  t[4].criteria = [
    "Export print-ready artwork at approved dimensions",
    "Include the final delivery proof",
  ];
  t[4].versions = [
    {
      number: 1,
      file: "conference-backdrop-final.pdf",
      note: "Accepted final artwork; example file record.",
      at: t[4].events.at(-1).at,
    },
  ];
  const blocked = structuredClone(t[0]);
  Object.assign(blocked, {
    id: "DES-108",
    title: "Member listing creative",
    brief:
      "Create a property listing visual using approved photographs and property details. Supply square and portrait layouts with editable source files.",
    category: "Social media",
    status: "Blocked",
    progress: 30,
    due: new Date(now.getTime() - 3600000).toISOString(),
    versions: [],
    notes: [],
    criteria: [
      "Use the approved property details and images",
      "Deliver square and portrait artwork",
      "Include editable source files",
    ],
    blocker: {
      id: "ISS-108",
      reason: "The team is waiting for the approved property images.",
      severity: "Medium",
      owner: "Reporting manager",
      open: true,
    },
  });
  blocked.originalDue = blocked.due;
  blocked.events = [
    {
      at: now.toISOString(),
      by: s.employee.name,
      action: "Blocked",
      detail: blocked.blocker.reason,
    },
  ];
  t.push(blocked);
  const ready = structuredClone(blocked);
  Object.assign(ready, {
    id: "DES-109",
    title: "Zonal meeting carousel",
    brief:
      "Build a carousel covering the zonal meeting highlights. Use the approved event photographs and include the final call to action.",
    due: `${date}T18:00:00+05:30`,
    progress: 50,
    blocker: {
      id: "ISS-109",
      reason: "Zonal photographs were missing.",
      severity: "Low",
      owner: "Reporting manager",
      open: false,
      resolution: "Approved photographs received. Resume the layout.",
    },
    events: [
      {
        at: now.toISOString(),
        by: "Reporting manager",
        action: "Issue resolved",
        detail: "Approved photographs received.",
        after: { status: "Blocked", progress: 50 },
      },
    ],
  });
  ready.originalDue = ready.due;
  t.push(ready);
  const waiting = structuredClone(t[3]);
  Object.assign(waiting, {
    id: "DES-110",
    title: "Monthly member newsletter",
    brief:
      "Prepare the monthly member newsletter with approved headlines, updates and accessible links. Supply an editable layout and review PDF.",
    category: "Reports & documents",
    reviewOpened: false,
    events: [
      {
        at: now.toISOString(),
        by: s.employee.name,
        action: "In review",
        detail: "Submitted newsletter layout for first review.",
      },
    ],
    versions: [
      {
        number: 1,
        file: "newsletter-v1.pdf",
        note: "First review submission; example file record.",
        at: now.toISOString(),
      },
    ],
  });
  t.push(waiting);
  s.tasks.forEach(ensureBriefChecklist);
  return s;
}
export const availabilityOptions = [
  "Available",
  "Busy",
  "In Meeting",
  "On Break",
  "In Training",
  "Do Not Disturb",
  "Working Remotely",
  "On Leave",
  "Absent",
  "Offline",
];
export function canAccessReport(employee, viewer) {
  return (
    viewer.id === employee.id ||
    (!/chairman/i.test(viewer.role || "") &&
      (viewer.grants || []).some(
        (g) =>
          g.capability === "report.read" &&
          g.employeeIds?.includes(employee.id),
      ))
  );
}
