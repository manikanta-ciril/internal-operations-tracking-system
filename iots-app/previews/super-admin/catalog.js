// Stable system IDs follow the first detailed inventory in system-configuration.txt.
export const roleNames = [
  "Chairman",
  "Senior Manager",
  "General Manager",
  "Executive",
  "Lead / Operations Manager",
  "Business Development Executive",
  "Creative Communication Executive",
  "Creative Communication Associate",
  "IT System Analyst",
  "Super Admin",
  "Admin",
];
export const groups = [
  "Access & people",
  "Daily work",
  "Communication",
  "Reports & reviews",
  "Business",
  "Platform",
];
const module = (id, name, group, description, fields, rules = []) => ({
  id,
  name,
  group,
  description,
  fields,
  rules,
});
const field = (key, label, type = "text", hint = "", initial = "") => ({
  key,
  label,
  type,
  hint,
  initial,
});
export const systems = [
  module(
    "S01",
    "Sign-in & sessions",
    groups[0],
    "Help employees sign in and manage their devices.",
    [
      field(
        "hours",
        "Session length (hours)",
        "number",
        "Current application default: 12 hours.",
        "12",
      ),
    ],
    [
      "Ask before replacing an existing session.",
      "Never store passwords in this preview.",
    ],
  ),
  module(
    "S02",
    "Office locations",
    groups[0],
    "Choose where office sign-ins are allowed.",
    [
      field(
        "radius",
        "Office radius (metres)",
        "number",
        "Current office rule: 75 metres.",
        "75",
      ),
    ],
    [
      "Current sign-in policy is office only.",
      "Location is captured for sign-in and punch evidence, not continuous tracking.",
    ],
  ),
  module(
    "S03",
    "Roles & approval rights",
    groups[0],
    "Choose who can see records and make decisions.",
    [
      field(
        "reviewDays",
        "Review access every (days)",
        "number",
        "Choose a review interval.",
      ),
    ],
    [
      "A platform role does not automatically approve leave or business work.",
      "IT System Analyst and Super Admin share platform privileges.",
    ],
  ),
  module(
    "S04",
    "Change history",
    groups[0],
    "Keep a record of important actions and the reasons behind them.",
    [field("reviewer", "History review contact")],
    [
      "Record who acted, their role, what changed, when and why.",
      "Corrections add history; they do not rewrite old records.",
    ],
  ),
  module(
    "S05",
    "Linked records",
    groups[1],
    "Connect work to a member, CRM lead, campaign or incident.",
    [
      field(
        "prefix",
        "Internal record prefix",
        "text",
        "Example: IOTS.",
        "IOTS",
      ),
    ],
    [
      "A task keeps the same ID after reassignment.",
      "CRM IDs and IOTS employee IDs are separate.",
    ],
  ),
  module(
    "S06",
    "Tasks & deadlines",
    groups[1],
    "Assign work, set due dates and follow its progress.",
    [
      field(
        "remindHours",
        "Deadline reminder (hours before)",
        "number",
        "Choose when a reminder should be sent.",
      ),
    ],
    [
      "Notes and uploads do not change the formal task state.",
      "Keep the original deadline and transfer history.",
    ],
  ),
  module(
    "S07",
    "Evidence & review",
    groups[1],
    "Collect files and proof before work is approved.",
    [
      field(
        "types",
        "Allowed file types",
        "text",
        "Separate file extensions with commas.",
        "pdf, jpg, png, webp, docx",
      ),
    ],
    [
      "Keep previous versions and rejection reasons.",
      "Required evidence must be accepted by someone other than its submitter.",
    ],
  ),
  module(
    "S08",
    "Attendance & availability",
    groups[1],
    "Track punches, breaks, leave and daily working hours.",
    [
      field(
        "grace",
        "Late arrival grace (minutes)",
        "number",
        "Set a company-approved grace period.",
      ),
    ],
    [
      "Attendance, session activity and task effort are separate records.",
      "Use the working hours and approved holidays in Work rules.",
    ],
  ),
  module(
    "S09",
    "Requests & approvals",
    groups[1],
    "Handle leave, corrections, extensions and resource requests.",
    [field("responseHours", "Expected response time (hours)", "number")],
    [
      "Each request has an assigned approver and a decision reason.",
      "Approvers need the relevant business mandate.",
    ],
  ),
  module(
    "S10",
    "Blockers & escalations",
    groups[1],
    "Make sure unresolved problems reach the right person.",
    [
      field("urgentContact", "Urgent escalation contact"),
      field("reviewHours", "Review unresolved issues every (hours)", "number"),
    ],
    ["Keep an owner, severity, business impact and next review date."],
  ),
  module(
    "S11",
    "Feedback & recognition",
    groups[3],
    "Review work fairly and recognise consistent performance.",
    [
      field(
        "months",
        "Qualifying months before recognition review",
        "number",
        "The source workflow uses three qualifying months.",
        "3",
      ),
    ],
    [
      "Targets and weights need approval and version history.",
      "An authorised person makes the final recognition decision.",
    ],
  ),
  module(
    "S12",
    "Notifications & reminders",
    groups[2],
    "Notify people when work or a decision needs their attention.",
    [field("digest", "Daily reminder time", "time", "Time in IST.", "09:30")],
    [
      "Every notice links to its source record.",
      "Keep delivery and read status.",
    ],
  ),
  module(
    "S13",
    "Work conversations",
    groups[2],
    "Keep messages attached to the work they discuss.",
    [field("owner", "Communication policy contact")],
    ["Thread access follows the linked record's permissions."],
  ),
  module(
    "S14",
    "Email delivery",
    groups[2],
    "Send approved notices, reminders and reports.",
    [
      field("sender", "Sender email", "email"),
      field("retries", "Maximum delivery retries", "number", "", "3"),
    ],
    [
      "Email is a delivery channel; the IOTS record remains the source.",
      "Mail credentials must be configured securely on the server.",
    ],
  ),
  module(
    "S15",
    "Measures & trends",
    groups[3],
    "Use consistent numbers across dashboards and reports.",
    [field("sample", "Minimum records for a percentage", "number")],
    [
      "Show N/A for a zero denominator.",
      "Show Not configured when a target is missing.",
    ],
  ),
  module(
    "S16",
    "Risks & attention",
    groups[3],
    "Flag overdue work, delays and missing evidence.",
    [field("reviewTime", "Daily risk review time", "time", "Time in IST.")],
    [
      "Explain each flag with its source records.",
      "A risk flag supports a decision; it does not make one.",
    ],
  ),
  module(
    "S17",
    "Reports & exports",
    groups[3],
    "Prepare reports for the people allowed to receive them.",
    [
      field("reportTime", "Daily report time", "time", "Time in IST."),
      field("recipient", "Report review contact"),
    ],
    ["Keep the report scope, data time, requester and delivery history."],
  ),
  module(
    "S18",
    "Member follow-ups",
    groups[4],
    "Track research, outreach, meetings and membership coordination.",
    [field("days", "Default follow-up interval (days)", "number")],
    [
      "Member companies are external network partners, not internal departments.",
      "Membership fees need a confirmed source and policy.",
    ],
  ),
  module(
    "S19",
    "Deals & royalty follow-ups",
    groups[4],
    "Follow CRM-linked deals and outstanding royalty actions.",
    [field("contact", "Royalty review contact")],
    [
      "The current CRM calculates 7.5% of each party's brokerage share.",
      "Calculated royalty and confirmed payment are different facts.",
      "IOTS does not replace the CRM's financial records.",
    ],
  ),
  module(
    "S20",
    "Creative work",
    groups[4],
    "Take designs from a brief through review to final delivery.",
    [
      field("publisher", "Publishing responsibility"),
      field(
        "proof",
        "Required final delivery proof",
        "text",
        "Example: published link or print receipt.",
      ),
    ],
    [
      "Associate submits; Creative Communication Executive reviews.",
      "Keep drafts, corrections, acceptance and final proof.",
    ],
  ),
  module(
    "S21",
    "Company commitments",
    groups[4],
    "Follow board actions, agreements, filings and renewals.",
    [field("days", "Renewal reminder (days before)", "number")],
    ["Every commitment needs an owner, due date and completion evidence."],
  ),
  module(
    "S22",
    "Employee directory",
    groups[0],
    "Maintain employees, teams, offices and reporting relationships.",
    [field("contact", "Employee records contact")],
    [
      "A person may have several assigned roles.",
      "Job title, manager and approval authority are separate settings.",
    ],
  ),
  module(
    "S23",
    "Company policies",
    groups[5],
    "Keep rules and their effective dates in one place.",
    [field("effective", "Default policy effective date", "date")],
    [
      "Record the approver and reason for changes.",
      "Keep earlier versions and rollback history.",
    ],
  ),
  module(
    "S24",
    "Files & retention",
    groups[5],
    "Protect files and define how long they are kept.",
    [
      field(
        "days",
        "Evidence retention (days)",
        "number",
        "Use an approved retention period, not a guess.",
      ),
    ],
    ["Check access, file hashes, scan state and retention policy."],
  ),
  module(
    "S25",
    "CRM connection",
    groups[5],
    "Map CRM records and monitor how fresh the data is.",
    [field("minutes", "Planned sync interval (minutes)", "number")],
    [
      "Start with a reviewed read-only connection.",
      "Do not call the CRM's calculation screens as read-only APIs.",
    ],
  ),
  module(
    "S26",
    "Service health & incidents",
    groups[5],
    "Follow service errors, incidents, backups and recovery checks.",
    [
      field("contact", "Technical incident contact"),
      field("backup", "Backup review time", "time"),
    ],
    [
      "Show real measurements and the last successful check.",
      "A saved setup does not mean a service is running.",
    ],
  ),
  module(
    "S27",
    "Privacy & access reviews",
    groups[5],
    "Control sensitive records, exports and privileged access.",
    [field("days", "Access review interval (days)", "number")],
    [
      "Use the minimum personal data needed.",
      "No keystroke, screen or continuous location monitoring.",
    ],
  ),
];
export const navigation = [
  { id: "home", label: "Overview", icon: "dashboard", group: "Workspace" },
  {
    id: "company",
    label: "Company details",
    icon: "settings",
    group: "Set up your company",
  },
  {
    id: "offices",
    label: "Offices",
    icon: "location",
    group: "Set up your company",
  },
  {
    id: "departments",
    label: "Departments",
    icon: "building",
    group: "Set up your company",
  },
  {
    id: "people",
    label: "People",
    icon: "users",
    group: "Set up your company",
  },
  {
    id: "roles",
    label: "Roles & access",
    icon: "lock",
    group: "Set up your company",
  },
  {
    id: "work-rules",
    label: "Work rules",
    icon: "calendar",
    group: "Set up your company",
  },
  {
    id: "business",
    label: "Members & business",
    icon: "briefcase",
    group: "Manage",
  },
  { id: "systems", label: "All systems", icon: "layers", group: "Manage" },
  { id: "connection", label: "CRM connection", icon: "link", group: "Manage" },
  { id: "activity", label: "Setup history", icon: "clock", group: "Manage" },
];
export const accessActions = [
  "View records",
  "Add and edit records",
  "Export records",
  "Manage employee access",
  "Change company settings",
];
export const defaultRoles = roleNames.map((name) => ({
  id: name,
  name,
  scope:
    name === "Super Admin" || name === "IT System Analyst"
      ? "Whole company"
      : "Assigned team",
  actions:
    name === "Super Admin" || name === "IT System Analyst"
      ? [...accessActions]
      : ["View records"],
  approval: false,
  mandate: "",
  reviewed: false,
}));
