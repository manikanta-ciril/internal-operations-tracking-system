import { taskApi } from "../task-api.js";
import { designerRole } from "../../creative-associate/workspace/role-policy.js";

export class ServerTaskAdapter {
  constructor(employee) {
    this.employee = employee;
  }
  async load() {
    const records = await taskApi();
    const tasks = records.tasks.filter(
      (task) =>
        (task.ownerId === this.employee.id ||
          task.contributorIds?.includes(this.employee.id)) &&
        task.status !== "Draft",
    );
    return {
      version: 1,
      employee: this.employee,
      workspace: {
        ...structuredClone(designerRole),
        id: this.employee.activeRole,
        reviewStages: [
          {
            id: "management-review",
            label: "Assigned manager",
            optional: false,
          },
        ],
        reportAudience: [
          records.permissions.manage
            ? "Chairman"
            : "General Manager / Senior Manager",
        ],
      },
      tasks,
      manualReports: Object.fromEntries(
        (records.reports || [])
          .filter(
            (report) => Number(report.employeeId) === Number(this.employee.id),
          )
          .map((report) => [
            report.date,
            { ...(report.report || report), revision: report.revision },
          ]),
      ),
      deliveries: [],
      remarks: {},
      extraWork: [],
      dismissedReminders: [],
      serverBacked: true,
      permissions: records.permissions,
    };
  }
  async saveDailyReport(report, submit) {
    const result = await taskApi("/reports", {
      body: { report, revision: report.revision || 0, submit },
    });
    return result.report;
  }
  save() {
    throw new Error(
      "Shared records require a specific work or report action. Reload before retrying.",
    );
  }
}
