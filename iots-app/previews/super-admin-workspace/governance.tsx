import { useState } from "react";
import { api, filterRows, person, reportRows } from "./api";
import type { Settings } from "./types";
import {
  useApp,
  Heading,
  Card,
  Tabs,
  Filters,
  DataTable,
  Button,
  ExportMenu,
  Status,
  Chart,
  Diff,
  time,
  Field,
  Empty,
  Icon,
} from "./ui";
export function Reports() {
  const { data: d, actor, edit } = useApp(),
    [tab, setTab] = useState("Performance"),
    [filters, setFilters] = useState<Record<string, string>>({});
  const rows = filterRows(reportRows(d), filters);
  return (
    <>
      <Heading
        title="Reports & intelligence"
        description="Understand the work. Keep the context. Layer 3 reporting and records."
        actions={<ExportMenu view="reports" filters={filters} />}
      />
      <Tabs
        items={[
          "Performance",
          "Task & Workload",
          "Attendance",
          "Exception & Risk",
          "Trends & History",
          "Business & Recognition",
        ]}
        value={tab}
        onChange={setTab}
        label="Report pillars"
        panelId="reports-panel"
      />
      <div role="tabpanel" id="reports-panel" aria-label={tab} tabIndex={0}>
        <details className="gw-report-filters">
          <summary>Report filters</summary>
          <Filters
            values={filters}
            onChange={setFilters}
            options={{
              employeeId: d.employees.map((e) => ({
                value: e.id,
                label: e.name,
              })),
              managerId: d.employees.map((e) => ({
                value: e.id,
                label: e.name,
              })),
              team: d.departments.map((x) => x.name),
              role: d.settings.designations,
              department: d.departments.map((x) => x.name),
              branch: ["Hyderabad"],
              priority: ["High", "Medium", "Low"],
              status: ["Active", "Inactive"],
              request: ["Has request", "None"],
              attendance: [
                "On-site",
                "Remote",
                "Unknown location",
                "On leave",
                "Absent",
              ],
              risk: ["High", "Medium", "Low"],
            }}
          />
          <div className="gw-inline-fields">
            <Field label="From">
              <input
                type="date"
                min="2025-01-01"
                value={filters.from || ""}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </Field>
            <Field label="To">
              <input
                type="date"
                min="2025-01-01"
                value={filters.to || ""}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </Field>
          </div>
        </details>
        {tab === "Business & Recognition" ? (
          <>
            <Card
              title="CRM-sourced business records"
              description="Read-only. IOTS does not recalculate brokerage or royalty."
            >
              <DataTable
                caption="CRM business verification"
                headers={[
                  "Source record",
                  "State",
                  "Royalty due",
                  "Collected",
                  "Source / verification",
                ]}
                rows={d.crm.map((c) => ({
                  id: c.id,
                  cells: [
                    <>
                      {c.name}
                      <small>{c.id}</small>
                    </>,
                    c.status,
                    c.royaltyDue,
                    c.royaltyCollected,
                    <>
                      {c.source}
                      <small>
                        {c.verifiedAt
                          ? time(c.verifiedAt)
                          : "Not verified · no live connection"}
                      </small>
                    </>,
                  ],
                }))}
              />
            </Card>
            <Card
              title="Recognition review"
              description="Three qualifying months lead to Chairman review, not automatic recognition."
            >
              <DataTable
                caption="Recognition standings"
                headers={[
                  "Employee",
                  "Period",
                  "Context",
                  "Qualifying months",
                  "Next step",
                ]}
                rows={d.feedback.map((f, i) => ({
                  id: String(i),
                  cells: [
                    person(d, f.employeeId),
                    f.period,
                    f.note,
                    f.qualifyingMonths,
                    f.qualifyingMonths >= Number(d.settings.recognitionMonths)
                      ? "Chairman review"
                      : "Continue monthly evaluation",
                  ],
                }))}
              />
            </Card>
          </>
        ) : tab === "Trends & History" ? (
          <Card
            title="Period trends"
            description="Original deadlines, approved changes and overdue history are retained."
          >
            <Chart
              title="60-day example history, last week shown"
              series={[
                {
                  name: "Workload",
                  values: d.history.slice(-7).map((h) => h.workload),
                },
                {
                  name: "Completed",
                  values: d.history.slice(-7).map((h) => h.completed),
                },
                {
                  name: "Risk flags",
                  values: d.history.slice(-7).map((h) => h.risk),
                },
              ]}
            />
          </Card>
        ) : (
          <Card
            title={`${tab} preview`}
            description="N/A means no denominator. Missing targets stay unscored."
          >
            <DataTable
              caption={`${tab} report`}
              headers={
                tab === "Task & Workload"
                  ? [
                      "Employee",
                      "Team",
                      "Open tasks",
                      "Overdue",
                      "Transfers",
                      "Completion",
                    ]
                  : tab === "Attendance"
                    ? [
                        "Employee",
                        "Team",
                        "Location",
                        "Punch in / out",
                        "Access session",
                        "Task effort",
                      ]
                    : tab === "Exception & Risk"
                      ? [
                          "Employee",
                          "Team",
                          "Risk",
                          "Context",
                          "Responsible manager",
                        ]
                      : [
                          "Employee",
                          "Team",
                          "Performance",
                          "Task completion",
                          "Workload",
                          "Context",
                        ]
              }
              rows={rows.map((r) => ({
                id: r.id,
                cells:
                  tab === "Task & Workload"
                    ? [
                        r.name,
                        r.department,
                        r.openTasks,
                        r.overdueTasks,
                        r.transferCount,
                        r.completion,
                      ]
                    : tab === "Attendance"
                      ? [
                          r.name,
                          r.department,
                          r.attendance,
                          <>
                            {time(r.punchIn)}
                            <small>{time(r.punchOut)}</small>
                          </>,
                          `${r.sessionMinutes} min`,
                          `${r.taskMinutes} min`,
                        ]
                      : tab === "Exception & Risk"
                        ? [
                            r.name,
                            r.department,
                            <Status>{r.risk}</Status>,
                            r.context,
                            person(d, r.managerId),
                          ]
                        : [
                            r.name,
                            r.department,
                            r.performance,
                            r.completion,
                            r.workload,
                            r.context,
                          ],
              }))}
            />
            <p className="gw-callout">
              Approved leave and external blockers remain context. Deadline
              changes do not erase the original deadline or its overdue history.
            </p>
          </Card>
        )}
        <Card
          title="Build a report"
          description="Review the filtered preview above before generating a report."
          action={
            <Button
              onClick={() =>
                edit({
                  title: "Generate a scoped report",
                  before: { filters, records: rows.length },
                  fields: [
                    {
                      name: "recipient",
                      label: "Email recipient (optional)",
                      options: d.employees
                        .filter((e) => e.active)
                        .map((e) => ({ value: e.id, label: e.name })),
                      hint: "Email must be enabled. Recipient own, team or organisation scope is applied before queuing.",
                    },
                  ],
                  submit: (v, r) =>
                    api.generateReport(actor, filters, v.recipient || "", r),
                })
              }
            >
              Generate report
            </Button>
          }
        >
          <DataTable
            caption="Generated example reports"
            headers={["Report", "Scope", "Recipient", "Status", "Created"]}
            rows={d.reportJobs.map((r) => ({
              id: r.id,
              cells: [r.id, r.scope, r.recipient, r.status, time(r.at)],
            }))}
          />
          <p className="gw-quiet">
            For a file, use Export view: PDF, Excel or CSV. Email delivery stays
            in the mock queue.
          </p>
        </Card>
      </div>
    </>
  );
}
export function Audit() {
  const { data: d, actor, edit } = useApp(),
    [tab, setTab] = useState("Login & security"),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [selected, setSelected] = useState("");
  const logs = filterRows(
      d.audit.map((a) => ({
        ...a,
        employeeId: a.actor.employeeId,
        role: a.actor.activeRole,
      })),
      filters,
    ),
    logins = filterRows(d.logins, filters);
  return (
    <>
      <Heading
        title="Security & audit viewer"
        description="Read-only history. Every change names the employee identity and active role."
        actions={
          <ExportMenu
            view={tab === "Work & account changes" ? "audit" : "logins"}
            filters={
              tab === "Investigations" ? { ...filters, signal: "yes" } : filters
            }
          />
        }
      />
      <Tabs
        items={["Login & security", "Work & account changes", "Investigations"]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setFilters({});
        }}
        label="Audit views"
        panelId="audit-panel"
      />
      <div role="tabpanel" id="audit-panel" aria-label={tab} tabIndex={0}>
        <Filters
          values={filters}
          onChange={setFilters}
          options={{
            employeeId: d.employees.map((e) => ({
              value: e.id,
              label: e.name,
            })),
            ...(tab === "Work & account changes"
              ? {
                  role: ["Super Admin", "IT System Analyst"],
                  action: [...new Set(d.audit.map((a) => a.action))],
                }
              : {}),
          }}
        />
        <div className="gw-inline-fields">
          <Field label="From date">
            <input
              type="date"
              min="2025-01-01"
              value={filters.from || ""}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
            />
          </Field>
          <Field label="To date">
            <input
              type="date"
              min="2025-01-01"
              value={filters.to || ""}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
            />
          </Field>
        </div>
        {tab === "Login & security" && (
          <>
            <Card title="Login, location & network history">
              <DataTable
                caption="Security history"
                headers={[
                  "Employee",
                  "When",
                  "Device / network",
                  "Location",
                  "Result",
                  "Session",
                ]}
                rows={logins.map((l) => ({
                  id: l.id,
                  cells: [
                    person(d, l.employeeId),
                    time(l.at),
                    <>
                      {l.device}
                      <small>{l.network}</small>
                    </>,
                    l.location,
                    l.result,
                    l.active ? (
                      <button
                        className="gw-link"
                        onClick={() =>
                          edit({
                            title: "Force terminate session",
                            before: l,
                            fields: [],
                            description:
                              "This affects only the example session. The employee will be notified in the mock layer.",
                            submit: (_, r) =>
                              api.forceTerminateSession(actor, l.id, r),
                          })
                        }
                      >
                        Force terminate session
                      </button>
                    ) : (
                      "Ended"
                    ),
                  ],
                }))}
              />
            </Card>
            <Card
              title="Password change history"
              description="Exact timestamp and changed-by identity only. Passwords are never displayed."
            >
              <DataTable
                caption="Password change history"
                headers={["Employee", "Changed at (IST)", "Changed by"]}
                rows={d.employees.map((e) => ({
                  id: e.id,
                  cells: [
                    e.name,
                    time(e.passwordChangedAt),
                    e.passwordChangedBy || "Not recorded",
                  ],
                }))}
              />
            </Card>
          </>
        )}
        {tab === "Work & account changes" && (
          <Card
            title="Append-only example audit history"
            description="The production system must enforce immutability on the server; browser storage is not tamper-proof."
          >
            <DataTable
              caption="Configuration and work audit"
              headers={[
                "Record / action",
                "Employee / active role",
                "When",
                "Reason",
                "",
              ]}
              rows={logs.map((a) => ({
                id: a.id,
                cells: [
                  <>
                    {a.action}
                    <small>
                      {a.target} · {a.id}
                    </small>
                  </>,
                  <>
                    {a.actor.name}
                    <small>{a.actor.activeRole}</small>
                  </>,
                  time(a.at),
                  a.reason,
                  <button
                    className="gw-link"
                    onClick={() => setSelected(selected === a.id ? "" : a.id)}
                  >
                    View diff
                  </button>,
                ],
              }))}
            />
            {logs
              .filter((a) => a.id === selected)
              .map((a) => (
                <Diff key={a.id} before={a.before} after={a.after} />
              ))}
          </Card>
        )}
        {tab === "Investigations" && (
          <Card
            title="Refer a technical incident"
            description="Investigations are assigned to IT System Analyst. Historical records remain unchanged."
          >
            <DataTable
              caption="Technical signals"
              headers={["Signal", "Employee", "Context", ""]}
              rows={logins
                .filter((l) => l.failed || l.jump)
                .map((l) => ({
                  id: l.id,
                  cells: [
                    l.jump ? "Location jump" : "Failed sign-in",
                    person(d, l.employeeId),
                    `${l.result} · ${l.device}`,
                    <button
                      className="gw-link"
                      onClick={() =>
                        edit({
                          title: "Refer technical incident to IT",
                          before: l,
                          fields: [],
                          submit: (_, r) =>
                            api.referTechnicalIncident(actor, l.id, r),
                        })
                      }
                    >
                      Refer to IT System Analyst
                    </button>,
                  ],
                }))}
            />
          </Card>
        )}
      </div>
    </>
  );
}
export function SettingsPage() {
  const { data: d, actor, edit } = useApp(),
    [tab, setTab] = useState("Company"),
    s = d.settings;
  function configure(
    title: string,
    keys: { name: keyof Settings; label: string; type?: string }[],
  ) {
    edit({
      title,
      before: Object.fromEntries(keys.map((k) => [k.name, s[k.name]])),
      initial: Object.fromEntries(keys.map((k) => [k.name, String(s[k.name])])),
      fields: keys.map((k) => ({ ...k, required: true })),
      submit: (v, r) => api.saveSettings(actor, v as Partial<Settings>, r),
    });
  }
  return (
    <>
      <Heading
        title="System settings"
        description="Set company-wide rules. Review every change before saving."
        actions={<ExportMenu view="settings" />}
      />
      <Tabs
        items={[
          "Company",
          "Work rules",
          "Reports",
          "Export policy",
          "Availability",
          "Templates",
          "Leave & holidays",
          "Recognition",
          "Roles & designations",
        ]}
        value={tab}
        onChange={setTab}
        label="Settings sections"
        panelId="settings-panel"
      />
      <div role="tabpanel" id="settings-panel" aria-label={tab} tabIndex={0}>
        {tab === "Company" && (
          <Card
            title="Company identity"
            action={
              <Button
                secondary
                onClick={() =>
                  configure("Edit company details", [
                    { name: "organisation", label: "Company name" },
                  ])
                }
              >
                Edit company
              </Button>
            }
          >
            <dl className="gw-definition">
              <dt>Organisation</dt>
              <dd>{s.organisation}</dd>
              <dt>Time zone</dt>
              <dd>Asia/Kolkata · IST</dd>
              <dt>Public registration</dt>
              <dd>Not available</dd>
              <dt>Platform privileges</dt>
              <dd>Super Admin = IT System Analyst</dd>
            </dl>
          </Card>
        )}
        {tab === "Work rules" && (
          <Card
            title="Shifts, grace & breaks"
            action={
              <Button
                secondary
                onClick={() =>
                  configure("Edit working hours", [
                    { name: "weekdayStart", label: "Day starts", type: "time" },
                    { name: "weekdayEnd", label: "Weekday ends", type: "time" },
                    {
                      name: "saturdayEnd",
                      label: "Saturday ends",
                      type: "time",
                    },
                    {
                      name: "grace",
                      label: "Grace in minutes",
                      type: "number",
                    },
                    {
                      name: "breakMinutes",
                      label: "Break guidance in minutes",
                      type: "number",
                    },
                  ])
                }
              >
                Edit work rules
              </Button>
            }
          >
            <dl className="gw-definition">
              <dt>Monday–Friday</dt>
              <dd>
                {s.weekdayStart}–{s.weekdayEnd}
              </dd>
              <dt>Saturday</dt>
              <dd>
                {s.weekdayStart}–{s.saturdayEnd}
              </dd>
              <dt>Grace / breaks</dt>
              <dd>
                {s.grace} / {s.breakMinutes} minutes
              </dd>
              <dt>Sunday</dt>
              <dd>Weekly off</dd>
            </dl>
          </Card>
        )}
        {tab === "Reports" && (
          <Card
            title="Automated report timing"
            description="Schedules are saved in the preview. No background deliveries run here."
            action={
              <Button
                secondary
                onClick={() =>
                  configure("Change report timing", [
                    {
                      name: "dailyReport",
                      label: "Daily report",
                      type: "time",
                    },
                    { name: "weeklyReport", label: "Weekly schedule" },
                    { name: "monthlyReport", label: "Monthly schedule" },
                  ])
                }
              >
                Edit schedule
              </Button>
            }
          >
            <dl className="gw-definition">
              <dt>Daily</dt>
              <dd>{s.dailyReport} IST</dd>
              <dt>Weekly</dt>
              <dd>{s.weeklyReport} IST</dd>
              <dt>Monthly</dt>
              <dd>{s.monthlyReport} IST</dd>
            </dl>
          </Card>
        )}
        {tab === "Export policy" && (
          <Card
            title="Export policy"
            description="Every export checks this policy and records its filters, format and actor."
          >
            {(
              ["exportEnabled", "exportEmail", "exportPersonalData"] as const
            ).map((key, i) => (
              <div className="gw-setting-row" key={key}>
                <div>
                  <strong>
                    {
                      [
                        "Allow file exports",
                        "Allow report email queue",
                        "Include personal email & password-change metadata",
                      ][i]
                    }
                  </strong>
                  <small>
                    {
                      [
                        "PDF, Excel and CSV for permitted roles.",
                        "Recipients outside platform roles are restricted to their own records.",
                        "Off by default. Passwords are never exported.",
                      ][i]
                    }
                  </small>
                </div>
                <Button
                  secondary
                  onClick={() =>
                    edit({
                      title: `${s[key] ? "Disable" : "Enable"} ${["exports", "report email", "personal metadata"][i]}`,
                      fields: [],
                      before: { [key]: s[key] },
                      initial: { [key]: String(!s[key]) },
                      submit: (_, r) =>
                        api.saveSettings(actor, { [key]: !s[key] }, r),
                    })
                  }
                >
                  {s[key] ? "Enabled" : "Disabled"}
                </Button>
              </div>
            ))}
          </Card>
        )}
        {tab === "Availability" && (
          <Card
            title="Availability status builder"
            description="Canonical status names stay stable. Presentation and order can be changed."
          >
            <DataTable
              caption="Availability statuses"
              headers={["Status", "Order", "Appearance", "Enabled", ""]}
              rows={[...s.statuses]
                .sort((a, b) => a.order - b.order)
                .map((status) => ({
                  id: status.name,
                  cells: [
                    <>
                      {status.label || status.name}
                      <small>Canonical: {status.name}</small>
                    </>,
                    status.order + 1,
                    status.appearance,
                    status.enabled ? "Yes" : "No",
                    <button
                      className="gw-link"
                      onClick={() =>
                        edit({
                          title: `Edit ${status.name}`,
                          before: status,
                          initial: {
                            label: status.label || status.name,
                            appearance: status.appearance,
                            order: String(status.order + 1),
                            enabled: String(status.enabled),
                          },
                          fields: [
                            {
                              name: "label",
                              label: "Display name",
                              required: true,
                            },
                            {
                              name: "appearance",
                              label: "Presentation",
                              options: ["Gold", "Neutral", "Charcoal"],
                              required: true,
                            },
                            {
                              name: "order",
                              label: "Display order",
                              type: "number",
                              required: true,
                            },
                            {
                              name: "enabled",
                              label: "Enabled",
                              options: ["true", "false"],
                              required: true,
                            },
                          ],
                          submit: (v, r) =>
                            api.saveSettings(
                              actor,
                              {
                                statuses: (() => {
                                  const rows = [...s.statuses]
                                    .sort((a, b) => a.order - b.order)
                                    .filter((x) => x.name !== status.name);
                                  rows.splice(
                                    Math.max(
                                      0,
                                      Math.min(
                                        rows.length,
                                        Number(v.order) - 1,
                                      ),
                                    ),
                                    0,
                                    {
                                      ...status,
                                      label: v.label,
                                      appearance: v.appearance,
                                      enabled: v.enabled === "true",
                                    },
                                  );
                                  return rows.map((x, order) => ({
                                    ...x,
                                    order,
                                  }));
                                })(),
                              },
                              r,
                            ),
                        })
                      }
                    >
                      Edit
                    </button>,
                  ],
                }))}
            />
          </Card>
        )}
        {tab === "Templates" && (
          <Card
            title="Email & notification templates"
            description="These are templates, not sent messages."
            action={
              <Button
                secondary
                onClick={() =>
                  configure("Edit templates", [
                    {
                      name: "emailTemplate",
                      label: "Email template",
                      type: "textarea",
                    },
                    {
                      name: "notificationTemplate",
                      label: "Notification template",
                      type: "textarea",
                    },
                  ])
                }
              >
                Edit templates
              </Button>
            }
          >
            <h3>Email</h3>
            <p className="gw-template">{s.emailTemplate}</p>
            <h3>Notification</h3>
            <p className="gw-template">{s.notificationTemplate}</p>
          </Card>
        )}
        {tab === "Leave & holidays" && (
          <>
            <Card
              title="Leave policy"
              action={
                <Button
                  secondary
                  onClick={() =>
                    configure("Edit leave policy", [
                      {
                        name: "leavePolicy",
                        label: "Policy",
                        type: "textarea",
                      },
                    ])
                  }
                >
                  Edit policy
                </Button>
              }
            >
              <p>{s.leavePolicy}</p>
              <p className="gw-callout">
                Leave approval belongs to the designated manager. This setting
                does not grant a business mandate.
              </p>
            </Card>
            <Card
              title="Company holidays"
              action={
                <Button
                  secondary
                  onClick={() =>
                    edit({
                      title: "Add a company holiday",
                      fields: [
                        { name: "name", label: "Holiday name", required: true },
                        {
                          name: "date",
                          label: "Date",
                          type: "date",
                          required: true,
                        },
                      ],
                      before: s.holidays,
                      submit: (v, r) =>
                        api.saveSettings(
                          actor,
                          {
                            holidays: [
                              ...s.holidays,
                              { name: v.name, date: v.date },
                            ],
                          },
                          r,
                        ),
                    })
                  }
                >
                  Add holiday
                </Button>
              }
            >
              <DataTable
                caption="Company holidays"
                headers={["Date", "Holiday"]}
                rows={s.holidays.map((h, i) => ({
                  id: String(i),
                  cells: [h.date, h.name],
                }))}
              />
            </Card>
          </>
        )}
        {tab === "Recognition" && (
          <Card
            title="Recognition scoring"
            action={
              <Button
                secondary
                onClick={() =>
                  configure("Edit recognition rules", [
                    {
                      name: "recognitionMonths",
                      label: "Qualifying months",
                      type: "number",
                    },
                    {
                      name: "recognitionRule",
                      label: "Scoring and review rule",
                      type: "textarea",
                    },
                  ])
                }
              >
                Edit recognition
              </Button>
            }
          >
            <p>{s.recognitionRule}</p>
            <p className="gw-callout">
              Zero denominator: N/A. Missing target: Target not configured.
              Rules flag; authorised people decide.
            </p>
          </Card>
        )}
        {tab === "Roles & designations" && (
          <Card
            title="Role definitions & delegated scope"
            description="Workspaces are not a reporting hierarchy. Business approvals remain locked without a separate mandate."
            action={
              <Button
                secondary
                onClick={() =>
                  edit({
                    title: "Edit designation list",
                    before: s.designations,
                    initial: { names: s.designations.join(", ") },
                    fields: [
                      {
                        name: "names",
                        label: "Designations, separated by commas",
                        required: true,
                      },
                    ],
                    submit: (v, r) =>
                      api.saveSettings(
                        actor,
                        {
                          designations: v.names
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        },
                        r,
                      ),
                  })
                }
              >
                Edit designations
              </Button>
            }
          >
            <DataTable
              caption="Role scopes"
              headers={["Role", "Scope", "Delegation"]}
              rows={Object.entries(s.scopes).map(([role, scope]) => ({
                id: role,
                cells: [
                  role,
                  scope,
                  s.permissions[role]?.includes("Delegate")
                    ? "Permitted within scope"
                    : "Not delegated",
                ],
              }))}
            />
            <p className="gw-quiet">
              Use User Management → Roles & Permissions to review the capability
              matrix.
            </p>
          </Card>
        )}
      </div>
    </>
  );
}
