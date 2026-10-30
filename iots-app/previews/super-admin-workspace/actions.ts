import { api } from "./api";
import type { Snapshot, Actor, Employee, Announcement } from "./types";
import type { Action } from "./ui";
const localInput = (value: string) => {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
const options = (d: Snapshot) =>
  d.employees
    .filter((e) => e.active)
    .map((e) => ({ value: e.id, label: e.name }));
export const createEmployeeAction = (d: Snapshot, a: Actor): Action => ({
  title: "Create an employee",
  description:
    "No public registration. Create one identity, then assign its workspaces.",
  fields: [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Company email", type: "email", required: true },
    {
      name: "designation",
      label: "Designation",
      options: d.settings.designations,
      required: true,
    },
    {
      name: "roles",
      label: "Assigned roles",
      required: true,
      hint: "Separate existing role names with commas. The first role is the primary workspace.",
    },
    {
      name: "family",
      label: "Workspace family",
      options: ["Administrative", "Management", "Execution"],
      required: true,
    },
    {
      name: "department",
      label: "Department",
      options: d.departments.map((x) => x.name),
      required: true,
    },
    { name: "office", label: "Office / branch", required: true },
    { name: "managerId", label: "Reporting manager", options: options(d) },
  ],
  initial: { office: "Hyderabad", family: "Execution" },
  submit: (v, r) => api.createEmployee(a, v, r),
});
export const editEmployeeAction = (
  d: Snapshot,
  a: Actor,
  e: Employee,
): Action => ({
  title: `Edit ${e.name}`,
  before: e,
  fields: [
    { name: "name", label: "Name", required: true },
    {
      name: "designation",
      label: "Designation",
      options: d.settings.designations,
      required: true,
    },
    {
      name: "department",
      label: "Department",
      options: d.departments.map((x) => x.name),
      required: true,
    },
    { name: "office", label: "Office / branch", required: true },
    {
      name: "managerId",
      label: "Reporting manager",
      options: options(d).filter((x) => x.value !== e.id),
    },
    {
      name: "availability",
      label: "Availability",
      options: d.settings.statuses.filter((s) => s.enabled).map((s) => s.name),
    },
  ],
  initial: {
    name: e.name,
    designation: e.designation,
    department: e.department,
    office: e.office,
    managerId: e.managerId,
    availability: e.availability,
  },
  submit: (v, r) => api.editEmployee(a, e.id, v, r),
});
export const createTaskAction = (d: Snapshot, a: Actor): Action => ({
  title: "Create and assign a task",
  description: "The task ID and original deadline stay in its history.",
  fields: [
    { name: "title", label: "Task title", required: true },
    {
      name: "deliverables",
      label: "What must be delivered?",
      type: "textarea",
      required: true,
    },
    { name: "businessRecord", label: "Linked business record", required: true },
    { name: "ownerId", label: "Assignee", options: options(d), required: true },
    {
      name: "reviewerId",
      label: "Reviewer",
      options: options(d),
      required: true,
    },
    {
      name: "priority",
      label: "Priority",
      options: ["Low", "Medium", "High"],
      required: true,
    },
    {
      name: "due",
      label: "Due date and time",
      type: "datetime-local",
      required: true,
    },
    {
      name: "capacity",
      label: "Capacity check",
      options: [
        { value: "yes", label: "I reviewed the assignee’s open workload" },
        { value: "no", label: "Not reviewed yet" },
      ],
      required: true,
      hint: "Three or more open tasks require a capacity acknowledgement.",
    },
  ],
  initial: { priority: "Medium" },
  submit: (v, r) => api.createTask(a, v, r),
});
export const announcementAction = (
  d: Snapshot,
  a: Actor,
  item?: Announcement,
): Action => ({
  title: item ? "Edit announcement" : "Publish an announcement",
  description:
    "Formatting supports bold, italic and lists. Delivery is simulated in this preview.",
  before: item,
  fields: [
    { name: "title", label: "Title", required: true },
    { name: "body", label: "Message", type: "richtext", required: true },
    {
      name: "priority",
      label: "Priority",
      options: ["Normal", "Important", "Urgent"],
      required: true,
    },
    {
      name: "audience",
      label: "Audience",
      options: [
        "All users",
        "Administrative",
        "Management",
        "Execution",
        ...d.departments.map((x) => x.name),
        ...d.settings.designations,
        ...d.employees.map((e) => ({ value: e.id, label: e.name })),
      ],
      required: true,
    },
    {
      name: "publishAt",
      label: "Publish at (this device’s time)",
      type: "datetime-local",
      required: true,
    },
    {
      name: "expiresAt",
      label: "Expires at (this device’s time)",
      type: "datetime-local",
      required: true,
    },
  ],
  initial: item
    ? {
        ...item,
        publishAt: localInput(item.publishAt),
        expiresAt: localInput(item.expiresAt),
        readBy: "",
      }
    : { priority: "Normal", audience: "All users" },
  submit: (v, r) => api.publishAnnouncement(a, v, r),
});
