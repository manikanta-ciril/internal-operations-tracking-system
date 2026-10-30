export type Screen =
  | "home"
  | "people"
  | "tasks"
  | "attendance"
  | "announcements"
  | "reports"
  | "audit"
  | "settings";
export type Family = "Administrative" | "Management" | "Execution";
export type WorkState =
  | "Assigned/Pending"
  | "In Progress"
  | "Waiting for Review"
  | "Under Review"
  | "Changes Requested"
  | "Completed & Closed";
export type Severity = "Low" | "Medium" | "High";
export type Location =
  "On-site" | "Remote" | "Unknown location" | "On leave" | "Absent";
export type Availability =
  | "Available"
  | "Busy"
  | "In Meeting"
  | "On Break"
  | "In Training"
  | "Do Not Disturb"
  | "Working Remotely"
  | "On Leave"
  | "Absent"
  | "Offline";
export type Filters = Record<string, string>;
export interface Actor {
  employeeId: string;
  name: string;
  activeRole: "Super Admin" | "IT System Analyst";
}
export interface Employee {
  id: string;
  name: string;
  email: string;
  roles: string[];
  designation: string;
  family: Family;
  department: string;
  office: string;
  managerId: string;
  availability: Availability;
  location: Location;
  active: boolean;
  target: number | null;
  passwordChangedAt: string;
  passwordChangedBy: string;
  scope?: string;
}
export interface Department {
  id: string;
  name: string;
  headId: string;
}
export interface Submission {
  version: number;
  file: string;
  status: string;
  feedback: string;
  at: string;
}
export interface Transfer {
  from: string;
  to: string;
  reason: string;
  at: string;
}
export interface Task {
  id: string;
  title: string;
  ownerId: string;
  reviewerId: string;
  creatorId: string;
  businessRecord: string;
  deliverables: string;
  priority: Severity;
  state: WorkState;
  originalDue: string;
  due: string;
  instructions: string;
  stopped: boolean;
  transfers: Transfer[];
  submissions: Submission[];
  trail: { state: string; at: string }[];
}
export interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  location: Location;
  punchIn: string | null;
  punchOut: string | null;
  sessionMinutes: number;
  taskMinutes: number;
  late: boolean;
  flag: string;
  corrections: {
    field: string;
    before: string;
    after: string;
    reason: string;
    evidence: string;
    at: string;
    actor: Actor;
  }[];
}
export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  employeeId: string;
  managerId: string;
  taskId: string;
  reason: string;
  kind: "Task" | "Attendance" | "Request" | "Evidence" | "Feedback";
  evidence: string;
  decision: string;
}
export interface AccountChange {
  id: string;
  employeeId: string;
  requester: string;
  kind: "Deactivate account" | "Activate account" | "Change access";
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  status: "Awaiting" | "Authorised" | "Declined";
  comment?: string;
}
export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: "Normal" | "Important" | "Urgent";
  audience: string;
  publishAt: string;
  expiresAt: string;
  readBy: string[];
  author: string;
}
export interface Audit {
  id: string;
  at: string;
  actor: Actor;
  action: string;
  target: string;
  reason: string;
  before: unknown;
  after: unknown;
}
export interface Notice {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  screen: Screen;
  read: boolean;
}
export interface ExportRecord {
  id: string;
  at: string;
  format: string;
  view: string;
  count: number;
  status: string;
  actor: Actor;
}
export interface Settings {
  organisation: string;
  officeLatitude: string;
  officeLongitude: string;
  radius: string;
  weekdayStart: string;
  weekdayEnd: string;
  saturdayEnd: string;
  grace: string;
  breakMinutes: string;
  leavePolicy: string;
  dailyReport: string;
  weeklyReport: string;
  monthlyReport: string;
  emailTemplate: string;
  notificationTemplate: string;
  exportEnabled: boolean;
  exportEmail: boolean;
  exportPersonalData: boolean;
  recognitionMonths: string;
  recognitionRule: string;
  holidays: { date: string; name: string }[];
  statuses: {
    name: Availability;
    label?: string;
    enabled: boolean;
    order: number;
    appearance: string;
  }[];
  permissions: Record<string, string[]>;
  scopes: Record<string, string>;
  designations: string[];
}
export interface LoginRecord {
  id: string;
  employeeId: string;
  at: string;
  device: string;
  network: string;
  location: string;
  result: string;
  active: boolean;
  failed: boolean;
  jump: boolean;
}
export interface Snapshot {
  previousDay: {
    workforce: number;
    attendance: number;
    workInFlight: number;
    attention: number;
    security: number;
  };
  version: 1;
  employees: Employee[];
  departments: Department[];
  tasks: Task[];
  attendance: Attendance[];
  issues: Issue[];
  changes: AccountChange[];
  announcements: Announcement[];
  audit: Audit[];
  notices: Notice[];
  exports: ExportRecord[];
  logins: LoginRecord[];
  settings: Settings;
  crm: {
    id: string;
    name: string;
    status: string;
    royaltyDue: string;
    royaltyCollected: string;
    source: string;
    verifiedAt: string;
  }[];
  feedback: {
    employeeId: string;
    period: string;
    note: string;
    qualifyingMonths: number;
  }[];
  reportJobs: {
    id: string;
    title: string;
    scope: string;
    recipient: string;
    status: string;
    at: string;
  }[];
  history: {
    date: string;
    onSite: number;
    remote: number;
    unknown: number;
    completed: number;
    workload: number;
    risk: number;
  }[];
}
export type ExportView =
  | "employees"
  | "departments"
  | "roles"
  | "tasks"
  | "transfers"
  | "attendance"
  | "announcements"
  | "reports"
  | "audit"
  | "issues"
  | "changes"
  | "profile"
  | "logins"
  | "settings";
export type ExportFormat = "CSV" | "Excel" | "PDF";
export const availability: Availability[] = [
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
export const states: WorkState[] = [
  "Assigned/Pending",
  "In Progress",
  "Waiting for Review",
  "Under Review",
  "Changes Requested",
  "Completed & Closed",
];
