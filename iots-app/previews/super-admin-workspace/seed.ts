import type { Snapshot, Employee, Actor } from "./types";
import { availability, states } from "./types";
import { roleNames as allRoles } from "../super-admin/catalog";
export const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
export const at = (time: string, days = 0) =>
  new Date(
    new Date(`${today}T${time}:00+05:30`).getTime() + days * 86400000,
  ).toISOString();
export const defaultActor: Actor = {
  employeeId: "EMP-004",
  name: "Deva Manikanta Sala",
  activeRole: "Super Admin",
};
const employee = (
  id: string,
  name: string,
  roles: string[],
  department: string,
  family: Employee["family"],
  location: Employee["location"],
  managerId = "EMP-002",
  target: number | null = 3,
): Employee => ({
  id,
  name,
  roles,
  department,
  family,
  location,
  managerId,
  target,
  email: `${name.split(" ")[0].toLowerCase()}@ciril.in`,
  designation: roles[0],
  office: "Hyderabad",
  availability: location === "Remote" ? "Working Remotely" : "Available",
  active: true,
  passwordChangedAt: at("10:00", -12),
  passwordChangedBy: "Self",
});
export function seed(): Snapshot {
  const employees = [
    employee(
      "EMP-001",
      "Vijay Sarathi",
      ["Chairman"],
      "Management",
      "Management",
      "On-site",
      "",
      null,
    ),
    employee(
      "EMP-002",
      "Manasa",
      ["Lead / Operations Manager"],
      "Operations",
      "Management",
      "On-site",
      "EMP-001",
      4,
    ),
    employee(
      "EMP-003",
      "Harshitha",
      ["Creative Communication Associate", "Creative Communication Executive"],
      "Creatives",
      "Execution",
      "On-site",
      "EMP-002",
      3,
    ),
    employee(
      "EMP-004",
      "Deva Manikanta Sala",
      ["Super Admin", "IT System Analyst"],
      "IT",
      "Administrative",
      "On-site",
      "EMP-001",
      null,
    ),
    employee(
      "EMP-005",
      "Ipsheeta",
      ["General Manager", "Senior Manager", "Executive"],
      "Management",
      "Management",
      "Remote",
      "EMP-001",
      4,
    ),
    employee(
      "EMP-006",
      "Bhavani",
      ["Business Development Executive"],
      "Business Development",
      "Execution",
      "Remote",
      "EMP-002",
      3,
    ),
    employee(
      "EMP-007",
      "Deepthi",
      ["Creative Communication Associate"],
      "Creatives",
      "Execution",
      "Unknown location",
      "EMP-002",
      2,
    ),
    employee(
      "EMP-008",
      "Platform Admin",
      ["Admin"],
      "IT",
      "Administrative",
      "On leave",
      "EMP-004",
      null,
    ),
  ];
  const tasks = Array.from({ length: 12 }, (_, i) => ({
    id: `TASK-${101 + i}`,
    title: [
      "Prepare member welcome kit",
      "Publish property campaign",
      "Follow up on member renewals",
      "Review CRM field mapping",
      "Deliver event artwork",
      "Prepare weekly member report",
      "Check brochure print proof",
      "Update office asset list",
      "Reconcile source deal references",
      "Write campaign delivery summary",
      "Send member meeting notes",
      "Archive final creative files",
    ][i],
    ownerId: ["EMP-003", "EMP-003", "EMP-006", "EMP-004", "EMP-007", "EMP-002"][
      i % 6
    ],
    reviewerId: "EMP-002",
    creatorId: "EMP-002",
    businessRecord: i % 2 ? "CRM-LEAD-204" : "CAMPAIGN-018",
    deliverables: "Final file, source link and delivery note",
    priority: (i < 2 ? "High" : i < 6 ? "Medium" : "Low") as
      "High" | "Medium" | "Low",
    state: states[i % states.length],
    originalDue: at("18:00", i < 3 ? -2 : 2),
    due: at("18:00", i === 1 ? 1 : i < 3 ? -2 : 2),
    instructions:
      "Keep the approved brief and attach the final delivery proof.",
    stopped: false,
    transfers:
      i === 1
        ? [
            {
              from: "EMP-003",
              to: "EMP-007",
              reason: "Balance artwork workload",
              at: at("11:00", -3),
            },
            {
              from: "EMP-007",
              to: "EMP-003",
              reason: "Original designer to make corrections",
              at: at("15:00", -2),
            },
            {
              from: "EMP-003",
              to: "EMP-003",
              reason: "Reviewer changed; owner retained",
              at: at("12:00", -1),
            },
          ]
        : [],
    submissions:
      i === 1
        ? [
            {
              version: 1,
              file: "campaign-v1.pdf",
              status: "Changes requested",
              feedback: "Use the approved property measurements.",
              at: at("13:00", -2),
            },
            {
              version: 2,
              file: "campaign-v2.pdf",
              status: "Changes requested",
              feedback: "Add the source reference before review.",
              at: at("15:00", -1),
            },
          ]
        : [],
    trail: [
      { state: "Assigned/Pending", at: at("10:00", -3) },
      { state: states[i % states.length], at: at("11:00", -1) },
    ],
  }));
  return {
    previousDay: {
      workforce: 7,
      attendance: 6,
      workInFlight: 11,
      attention: 2,
      security: 2,
    },
    version: 1,
    employees,
    departments: [
      "Operations",
      "Business Development",
      "Creatives",
      "IT",
      "Management",
    ].map((name, i) => ({
      id: `DEP-${i + 1}`,
      name,
      headId:
        name === "IT"
          ? "EMP-004"
          : name === "Management"
            ? "EMP-001"
            : "EMP-002",
    })),
    tasks,
    attendance: employees.map((e, i) => ({
      id: `ATT-${i + 1}`,
      employeeId: e.id,
      date: today,
      location: e.location,
      punchIn:
        e.location === "On leave" ? null : at(i === 6 ? "10:05" : "09:28"),
      punchOut: i === 2 ? at("17:50") : null,
      sessionMinutes: 180 + i * 11,
      taskMinutes: 90 + i * 8,
      late: i === 6,
      flag:
        i === 6
          ? "Location could not be verified"
          : i === 5
            ? "Off-site session to review"
            : "",
      corrections: [],
    })),
    issues: [
      {
        id: "ISS-201",
        title: "Repeated task transfers",
        severity: "High",
        employeeId: "EMP-003",
        managerId: "EMP-002",
        taskId: "TASK-102",
        reason:
          "Three transfers and two rejected versions need a manager review.",
        kind: "Evidence",
        evidence: "campaign-v2.pdf · version history retained",
        decision: "Awaiting responsible manager review",
      },
      {
        id: "ISS-202",
        title: "Location needs context",
        severity: "Medium",
        employeeId: "EMP-007",
        managerId: "EMP-002",
        taskId: "",
        reason:
          "A sign-in has an unknown location; the original reading must be kept.",
        kind: "Attendance",
        evidence: "ATT-7 · original location reading",
        decision: "No correction recorded",
      },
      {
        id: "ISS-203",
        title: "Deadline extension request",
        severity: "Low",
        employeeId: "EMP-006",
        managerId: "EMP-002",
        taskId: "TASK-103",
        reason: "Member response is pending. External blocker is recorded.",
        kind: "Request",
        evidence: "REQ-041 · member follow-up note",
        decision: "Assigned to Operations manager",
      },
    ],
    changes: [
      {
        id: "AUTH-301",
        employeeId: "EMP-006",
        requester: "Manasa",
        kind: "Change access",
        reason: "Add export access to assigned member reports.",
        before: { scope: "Own records" },
        after: { scope: "Assigned team" },
        status: "Awaiting",
      },
      {
        id: "AUTH-302",
        employeeId: "EMP-008",
        requester: "IT System Analyst",
        kind: "Deactivate account",
        reason: "Temporary administrative account is no longer required.",
        before: { active: true },
        after: { active: false },
        status: "Awaiting",
      },
    ],
    announcements: [
      {
        id: "ANN-401",
        title: "Keep source links with completed work",
        body: "**Before sharing a final file**, add its source link and delivery note.\n- Keep earlier versions\n- Ask your manager if a brief changes",
        priority: "Important",
        audience: "All users",
        publishAt: at("09:00", -1),
        expiresAt: at("18:00", 4),
        readBy: ["EMP-002", "EMP-003", "EMP-004"],
        author: "Manasa",
      },
      {
        id: "ANN-402",
        title: "Monthly report review",
        body: "Team leads: prepare the month-end work summary with evidence references.",
        priority: "Normal",
        audience: "Management",
        publishAt: at("09:00", 1),
        expiresAt: at("18:00", 7),
        readBy: [],
        author: "Platform Admin",
      },
    ],
    audit: [
      {
        id: "AUD-501",
        at: at("10:00", -1),
        actor: defaultActor,
        action: "Updated office radius",
        target: "Hyderabad",
        reason: "Use the approved office boundary",
        before: { radius: 50 },
        after: { radius: 75 },
      },
      {
        id: "AUD-502",
        at: at("12:00", -1),
        actor: { ...defaultActor, activeRole: "IT System Analyst" },
        action: "Reviewed access scope",
        target: "EMP-008",
        reason: "Quarterly access check",
        before: { scope: "Organisation" },
        after: { scope: "Assigned team" },
      },
    ],
    notices: [
      {
        id: "N-1",
        recipientId: "EMP-004",
        title: "2 account changes await authorisation",
        message: "Review the requester, reason and before/after values.",
        screen: "home",
        read: false,
      },
      {
        id: "N-2",
        recipientId: "EMP-004",
        title: "Creative work needs manager review",
        message:
          "Repeated transfers and rejected evidence are linked to ISS-201.",
        screen: "tasks",
        read: false,
      },
    ],
    exports: [],
    logins: [
      {
        id: "LOGIN-601",
        employeeId: "EMP-004",
        at: at("09:28"),
        device: "Edge on Windows",
        network: "Office network (example)",
        location: "On-site",
        result: "Successful",
        active: true,
        failed: false,
        jump: false,
      },
      {
        id: "LOGIN-602",
        employeeId: "EMP-007",
        at: at("10:05"),
        device: "Chrome on Android",
        network: "Mobile network (example)",
        location: "Unknown location",
        result: "Needs review",
        active: true,
        failed: false,
        jump: true,
      },
      {
        id: "LOGIN-603",
        employeeId: "EMP-006",
        at: at("09:35"),
        device: "Chrome on Windows",
        network: "Remote network (example)",
        location: "Remote",
        result: "Incorrect password",
        active: false,
        failed: true,
        jump: false,
      },
    ],
    settings: {
      organisation: "CIRIL",
      officeLatitude: "17.4303611",
      officeLongitude: "78.4566389",
      radius: "75",
      weekdayStart: "09:30",
      weekdayEnd: "18:00",
      saturdayEnd: "16:00",
      grace: "10",
      breakMinutes: "30",
      leavePolicy:
        "Leave decisions belong to the assigned manager. Approved leave stays visible in reports.",
      dailyReport: "18:15",
      weeklyReport: "Saturday 16:15",
      monthlyReport: "Last working day 18:30",
      emailTemplate:
        "Hello {name}, your {report} is ready. Open IOTS to view records within your access scope.",
      notificationTemplate: "{actor} updated {record}. Reason: {reason}",
      exportEnabled: true,
      exportEmail: false,
      exportPersonalData: false,
      recognitionMonths: "3",
      recognitionRule:
        "Three qualifying months → Chairman review. Missing targets remain unscored.",
      holidays: [
        { date: `${today.slice(0, 4)}-01-26`, name: "Republic Day" },
        { date: `${today.slice(0, 4)}-08-15`, name: "Independence Day" },
      ],
      statuses: availability.map((name, order) => ({
        name,
        enabled: true,
        order,
        appearance: order % 2 ? "Neutral" : "Gold",
      })),
      permissions: Object.fromEntries(
        allRoles.map((role) => [
          role,
          ["Super Admin", "IT System Analyst"].includes(role)
            ? [
                "View",
                "Create",
                "Edit",
                "Export",
                "Delegate",
                "Authorise account changes",
              ]
            : role === "Admin"
              ? ["View", "Edit"]
              : ["View"],
        ]),
      ),
      scopes: Object.fromEntries(
        allRoles.map((role) => [
          role,
          ["Super Admin", "IT System Analyst"].includes(role)
            ? "Organisation"
            : role === "Admin"
              ? "Assigned team"
              : "Own records",
        ]),
      ),
      designations: [...allRoles],
    },
    crm: [
      {
        id: "CRM-DEAL-204",
        name: "Hyderabad leasing reference",
        status: "Source verification pending",
        royaltyDue: "Not verified",
        royaltyCollected: "Not verified",
        source: "CIRIL CRM · example source reference",
        verifiedAt: "",
      },
    ],
    feedback: [
      {
        employeeId: "EMP-003",
        period: "Previous month",
        note: "Delivery proof needs consistent source references.",
        qualifyingMonths: 2,
      },
      {
        employeeId: "EMP-006",
        period: "Previous month",
        note: "Approved external blocker retained as context.",
        qualifyingMonths: 3,
      },
    ],
    reportJobs: [],
    history: Array.from({ length: 60 }, (_, i) => ({
      date: at("12:00", i - 59).slice(0, 10),
      onSite: 3 + (i % 2),
      remote: 1 + (i % 2),
      unknown: i % 4 === 0 ? 1 : 0,
      completed: 1 + (i % 3),
      workload: 8 + (i % 5),
      risk: 1 + (i % 3),
    })),
  };
}
