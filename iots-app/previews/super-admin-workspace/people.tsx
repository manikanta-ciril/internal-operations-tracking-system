import { useState } from "react";
import { api, filterRows, person, ratio } from "./api";
import { availability } from "./types";
import { createEmployeeAction } from "./actions";
import {
  useApp,
  Heading,
  Card,
  Tabs,
  Filters,
  DataTable,
  Button,
  ExportMenu,
  Avatar,
  AvailabilityChip,
  Status,
  Progress,
  Icon,
  Tooltip,
} from "./ui";
export function People() {
  const { data: d, actor, edit, open } = useApp(),
    [tab, setTab] = useState("Accounts"),
    [filters, setFilters] = useState<Record<string, string>>({});
  const employees = filterRows(d.employees, filters);
  return (
    <>
      <Heading
        title="User management"
        description="One employee identity. The right workspaces and a clear data scope."
        actions={
          <>
            <ExportMenu
              view={
                tab === "Departments"
                  ? "departments"
                  : tab === "Roles & Permissions"
                    ? "roles"
                    : "employees"
              }
              filters={filters}
            />
            <Button
              icon="plus"
              onClick={() => edit(createEmployeeAction(d, actor))}
            >
              Create user
            </Button>
          </>
        }
      />
      <Tabs
        items={[
          "Accounts",
          "Employee Directory",
          "Departments",
          "Roles & Permissions",
        ]}
        value={tab}
        onChange={(v) => {
          setTab(v);
          setFilters({});
        }}
        label="User management views"
        panelId="people-panel"
      />
      <div role="tabpanel" id="people-panel" aria-label={tab} tabIndex={0}>
        {(tab === "Accounts" || tab === "Employee Directory") && (
          <>
            <Filters
              values={filters}
              onChange={setFilters}
              options={{
                department: d.departments.map((x) => x.name),
                roles: d.settings.designations,
                availability: [...availability],
                location: [
                  "On-site",
                  "Remote",
                  "Unknown location",
                  "On leave",
                  "Absent",
                ],
              }}
            />
            {tab === "Accounts" ? (
              <Card title={`${employees.length} employee accounts`}>
                <DataTable
                  caption="Employee accounts"
                  headers={[
                    "Employee",
                    "Roles & workspace",
                    "Department / office",
                    "Status",
                    "Actions",
                  ]}
                  rows={employees.map((e) => ({
                    id: e.id,
                    cells: [
                      <button
                        className="gw-person-link"
                        onClick={() => open({ kind: "profile", id: e.id })}
                      >
                        <Avatar name={e.name} />
                        <span>
                          <strong>{e.name}</strong>
                          <small>
                            {e.id} · {e.email}
                          </small>
                        </span>
                      </button>,
                      <>
                        <strong>{e.roles.join(", ")}</strong>
                        <small>{e.family}</small>
                      </>,
                      <>
                        {e.department}
                        <small>{e.office}</small>
                      </>,
                      <Status done={e.active}>
                        {e.active ? "Active" : "Deactivated"}
                      </Status>,
                      <div className="gw-row-actions">
                        <button
                          onClick={() => open({ kind: "profile", id: e.id })}
                        >
                          Open profile
                        </button>
                        <button
                          onClick={() =>
                            edit({
                              title: "Request account access change",
                              before: { roles: e.roles },
                              fields: [
                                {
                                  name: "roles",
                                  label:
                                    "Assigned roles (separate with commas)",
                                  required: true,
                                },
                              ],
                              initial: { roles: e.roles.join(", ") },
                              submit: (v, r) =>
                                api.queueAccountChange(
                                  actor,
                                  e.id,
                                  "Change access",
                                  {
                                    roles: v.roles
                                      .split(",")
                                      .map((s) => s.trim()),
                                  },
                                  r,
                                ),
                            })
                          }
                        >
                          Change access
                        </button>
                      </div>,
                    ],
                  }))}
                />
              </Card>
            ) : (
              <>
                {(["Administrative", "Management", "Execution"] as const).map(
                  (family) => (
                    <section key={family} className="gw-directory-section">
                      <h2>{family} workspaces</h2>
                      <div className="gw-directory-grid">
                        {employees
                          .filter((e) => e.family === family)
                          .map((e) => {
                            const tasks = d.tasks.filter(
                                (t) => t.ownerId === e.id && !t.stopped,
                              ),
                              done = tasks.filter(
                                (t) => t.state === "Completed & Closed",
                              ).length;
                            return (
                              <button
                                className="gw-person-card"
                                key={e.id}
                                onClick={() =>
                                  open({ kind: "profile", id: e.id })
                                }
                              >
                                <div>
                                  <Avatar name={e.name} />
                                  <AvailabilityChip name={e.availability} />
                                </div>
                                <h3>{e.name}</h3>
                                <p>{e.roles.join(", ")}</p>
                                <span className="gw-quiet">
                                  {e.department} · {e.location}
                                </span>
                                <div className="gw-person-work">
                                  <strong>
                                    {tasks.length - done} active tasks
                                  </strong>
                                  <small>{ratio(done, tasks.length)}</small>
                                  <Progress
                                    value={
                                      tasks.length
                                        ? (done / tasks.length) * 100
                                        : 0
                                    }
                                  />
                                </div>
                              </button>
                            );
                          })}
                      </div>
                      {!employees.some((e) => e.family === family) && (
                        <p className="gw-quiet">
                          No matching employees in this workspace family.
                        </p>
                      )}
                    </section>
                  ),
                )}
              </>
            )}
          </>
        )}
        {tab === "Departments" && (
          <Card
            title="Departments"
            description="Reporting lines are configured separately from workspace families."
            action={
              <Button
                secondary
                icon="plus"
                onClick={() =>
                  edit({
                    title: "Create department",
                    fields: [
                      {
                        name: "name",
                        label: "Department name",
                        required: true,
                      },
                      {
                        name: "headId",
                        label: "Department head",
                        options: d.employees.map((e) => ({
                          value: e.id,
                          label: e.name,
                        })),
                        required: true,
                      },
                    ],
                    submit: (v, r) => api.saveDepartment(actor, v, r),
                  })
                }
              >
                Add department
              </Button>
            }
          >
            <DataTable
              caption="Departments"
              headers={["Department", "Head", "Members", ""]}
              rows={d.departments.map((dep) => ({
                id: dep.id,
                cells: [
                  dep.name,
                  person(d, dep.headId),
                  d.employees.filter((e) => e.department === dep.name).length,
                  <button
                    className="gw-link"
                    onClick={() =>
                      edit({
                        title: "Edit department",
                        before: dep,
                        initial: { ...dep },
                        fields: [
                          { name: "name", label: "Name", required: true },
                          {
                            name: "headId",
                            label: "Head",
                            options: d.employees.map((e) => ({
                              value: e.id,
                              label: e.name,
                            })),
                            required: true,
                          },
                        ],
                        submit: (v, r) => api.saveDepartment(actor, v, r),
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
        {tab === "Roles & Permissions" && <Permissions />}
      </div>
    </>
  );
}
export function Permissions() {
  const { data: d, actor, edit } = useApp();
  const [permissions, setPermissions] = useState(
    structuredClone(d.settings.permissions),
  );
  const [scopes, setScopes] = useState({ ...d.settings.scopes });
  const capabilities = [
    "View",
    "Create",
    "Edit",
    "Export",
    "Delegate",
    "Authorise account changes",
  ];
  return (
    <Card
      title="Roles & permissions"
      description="Super Admin and IT System Analyst have equal platform privileges. Business approval is a separate mandate."
      action={
        <Button
          onClick={() =>
            edit({
              title: "Review permission changes",
              fields: [],
              before: {
                permissions: d.settings.permissions,
                scopes: d.settings.scopes,
              },
              initial: {
                permissions: JSON.stringify(permissions),
                scopes: JSON.stringify(scopes),
              },
              submit: (_, r) =>
                api.saveSettings(actor, { permissions, scopes }, r),
            })
          }
        >
          Review permissions
        </Button>
      }
    >
      <div className="gw-table-scroll">
        <table className="gw-table">
          <caption className="sr-only">Role capability matrix</caption>
          <thead>
            <tr>
              <th>Role / scope</th>
              {capabilities.map((c) => (
                <th key={c}>{c}</th>
              ))}
              <th>Business approval</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(permissions).map((role) => (
              <tr key={role}>
                <th scope="row">
                  {role}
                  <select
                    aria-label={`${role}: scope`}
                    disabled={["Super Admin", "IT System Analyst"].includes(
                      role,
                    )}
                    value={scopes[role]}
                    onChange={(e) =>
                      setScopes({ ...scopes, [role]: e.target.value })
                    }
                  >
                    {["Own records", "Assigned team", "Organisation"].map(
                      (scope) => (
                        <option key={scope}>{scope}</option>
                      ),
                    )}
                  </select>
                </th>
                {capabilities.map((cap) => (
                  <td key={cap}>
                    <input
                      type="checkbox"
                      aria-label={`${role}: ${cap}`}
                      checked={permissions[role].includes(cap)}
                      disabled={
                        ["Super Admin", "IT System Analyst"].includes(role) &&
                        ["View", "Edit"].includes(cap)
                      }
                      onChange={(e) => {
                        const next = {
                          ...permissions,
                          [role]: e.target.checked
                            ? [...permissions[role], cap]
                            : permissions[role].filter((c) => c !== cap),
                        };
                        if (
                          ["Super Admin", "IT System Analyst"].includes(role)
                        ) {
                          next["Super Admin"] = [...next[role]];
                          next["IT System Analyst"] = [...next[role]];
                        }
                        setPermissions(next);
                      }}
                    />
                  </td>
                ))}
                <td>
                  <Tooltip content="Technical privilege is not a business mandate.">
                    <span className="gw-locked">
                      <Icon name="lock" size={14} />
                      Locked
                    </span>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gw-callout">
        Leave, brokerage terms, evidence and deliverables cannot be approved
        here. Refer these decisions to the responsible manager.
      </p>
    </Card>
  );
}
