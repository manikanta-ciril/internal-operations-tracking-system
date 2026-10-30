import { useState } from "react";
import { api, filterRows, person, ratio } from "./api";
import { editEmployeeAction, announcementAction } from "./actions";
import {
  useApp,
  Dialog,
  Card,
  Tabs,
  Button,
  ExportMenu,
  DataTable,
  Status,
  Avatar,
  AvailabilityChip,
  Tooltip,
  Diff,
  Empty,
  Loading,
  RichBody,
  time,
  Field,
  type DrawerTarget,
} from "./ui";
function Calendar({ employeeId }: { employeeId: string }) {
  const { data: d } = useApp();
  const [month, setMonth] = useState(
      (d.attendance[0]?.date || new Date().toISOString()).slice(0, 7),
    ),
    [selected, setSelected] = useState("");
  const [year, number] = month.split("-").map(Number),
    days = new Date(year, number, 0).getDate(),
    start = (new Date(year, number - 1, 1).getDay() + 6) % 7;
  const record = d.attendance.find(
    (a) => a.employeeId === employeeId && a.date === selected,
  );
  return (
    <>
      <Field label="Attendance month">
        <input
          type="month"
          min="2025-01"
          value={month}
          onChange={(e) => {
            if (e.target.value >= "2025-01") setMonth(e.target.value);
          }}
        />
      </Field>
      <div
        className="gw-calendar"
        role="group"
        aria-label="Monthly attendance calendar"
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
        {Array.from({ length: start }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, "0")}`,
            a = d.attendance.find(
              (a) => a.employeeId === employeeId && a.date === date,
            );
          return (
            <Tooltip
              key={date}
              content={`${date}: ${a?.location || "No record"}`}
            >
              <button
                aria-label={`${date}: ${a?.location || "No record"}`}
                aria-pressed={selected === date}
                data-record={!!a}
                onClick={() => setSelected(date)}
              >
                {i + 1}
              </button>
            </Tooltip>
          );
        })}
      </div>
      {selected && (
        <p className="gw-callout">
          {selected} ·{" "}
          {record
            ? `${record.location}. In ${time(record.punchIn)} · Out ${time(record.punchOut)}`
            : "No record for this date."}
        </p>
      )}
    </>
  );
}
function Profile({ id }: { id: string }) {
  const { data: d, actor, edit, open } = useApp(),
    [tab, setTab] = useState("Overview & targets");
  const e = d.employees.find((e) => e.id === id);
  if (!e) return <Empty title="Employee not found" />;
  const tasks = d.tasks.filter((t) => t.ownerId === id),
    att = d.attendance.filter((a) => a.employeeId === id),
    done = tasks.filter((t) => t.state === "Completed & Closed").length;
  return (
    <>
      <div className="gw-profile-header">
        <Avatar name={e.name} large />
        <div>
          <h3>{e.name}</h3>
          <p>{e.roles.join(", ")}</p>
          <small>
            {e.id} · {e.department} · {e.office}
          </small>
        </div>
        <AvailabilityChip name={e.availability} />
      </div>
      <div className="gw-drawer-actions">
        <Button secondary onClick={() => edit(editEmployeeAction(d, actor, e))}>
          Edit profile
        </Button>
        <Button
          secondary
          onClick={() =>
            edit({
              title: "Send password reset link",
              description:
                "No password is displayed. This queues a reset-link request in the mock layer only.",
              fields: [],
              before: { employee: e.name },
              submit: (_, r) => api.resetPassword(actor, e.id, r),
            })
          }
        >
          Reset password
        </Button>
        <Button
          secondary
          disabled={e.id === actor.employeeId}
          onClick={() =>
            edit({
              title: e.active
                ? "Request account deactivation"
                : "Request account activation",
              fields: [],
              before: { active: e.active },
              initial: { active: String(!e.active) },
              submit: (_, r) =>
                api.queueAccountChange(
                  actor,
                  e.id,
                  e.active ? "Deactivate account" : "Activate account",
                  { active: !e.active },
                  r,
                ),
            })
          }
        >
          {e.active ? "Deactivate" : "Activate"}
        </Button>
        <ExportMenu
          view="profile"
          filters={{ id: e.id }}
          label="Export dossier"
        />
      </div>
      <Tabs
        items={[
          "Overview & targets",
          "Tasks & workflow trail",
          "Attendance",
          "Evidence & versions",
          "Blockers",
          "Feedback & evaluations",
          "Security & audit",
        ]}
        label="Employee profile sections"
        panelId="profile-panel"
        value={tab}
        onChange={setTab}
      />
      <div role="tabpanel" id="profile-panel" aria-label={tab} tabIndex={0}>
        {tab === "Overview & targets" && (
          <>
            <dl className="gw-definition">
              <dt>Email</dt>
              <dd>{e.email}</dd>
              <dt>Designation</dt>
              <dd>{e.designation}</dd>
              <dt>Reporting manager</dt>
              <dd>{person(d, e.managerId)}</dd>
              <dt>Workspace family</dt>
              <dd>{e.family}</dd>
              <dt>Task completion</dt>
              <dd>{ratio(done, tasks.length)}</dd>
              <dt>Target</dt>
              <dd>
                {e.target === null
                  ? "Target not configured"
                  : ratio(done, e.target)}
              </dd>
              <dt>Account</dt>
              <dd>{e.active ? "Active" : "Deactivated"}</dd>
            </dl>
            <p className="gw-callout">
              Leave and external blockers remain context. A platform role does
              not grant business approval.
            </p>
          </>
        )}
        {tab === "Tasks & workflow trail" && (
          <>
            <ExportMenu view="tasks" filters={{ ownerId: id }} />
            <DataTable
              caption="Employee tasks"
              headers={["Task", "State", "Deadline", ""]}
              rows={tasks.map((t) => ({
                id: t.id,
                cells: [
                  t.title,
                  t.state,
                  time(t.due),
                  <button
                    className="gw-link"
                    onClick={() => open({ kind: "task", id: t.id })}
                  >
                    View trail
                  </button>,
                ],
              }))}
            />
          </>
        )}
        {tab === "Attendance" && (
          <>
            <ExportMenu view="attendance" filters={{ employeeId: id }} />
            <Calendar employeeId={id} />
            <DataTable
              caption="Employee attendance log"
              headers={["Date", "Location", "Punch in / out", "Corrections"]}
              rows={att.map((a) => ({
                id: a.id,
                cells: [
                  a.date,
                  a.location,
                  <>
                    {time(a.punchIn)}
                    <small>{time(a.punchOut)}</small>
                  </>,
                  a.corrections.length
                    ? a.corrections.map((c) => (
                        <p key={c.at}>
                          {c.field}: {c.before} → {c.after}
                          <small>
                            {c.actor.name} · {time(c.at)} · {c.reason}
                          </small>
                        </p>
                      ))
                    : "None",
                ],
              }))}
            />
          </>
        )}
        {tab === "Evidence & versions" && (
          <>
            <p className="gw-callout">
              Read-only evidence oversight. Refer decisions to the responsible
              manager.
            </p>
            {tasks.flatMap((t) =>
              t.submissions.map((s) => (
                <article
                  className="gw-detail-entry"
                  key={`${t.id}-${s.version}`}
                >
                  <strong>
                    {s.file} · Version {s.version}
                  </strong>
                  <p>
                    {s.status} · {s.feedback}
                  </p>
                  <small>
                    {t.id} · {time(s.at)} · Reviewer: {person(d, t.reviewerId)}
                  </small>
                  <button
                    className="gw-link"
                    onClick={() => open({ kind: "task", id: t.id })}
                  >
                    View submission history
                  </button>
                  <button
                    className="gw-link"
                    onClick={() =>
                      edit({
                        title: "Refer evidence to responsible manager",
                        before: {
                          task: t.id,
                          version: s.version,
                          file: s.file,
                        },
                        fields: [],
                        submit: (_, reason) =>
                          api.referEmployeeRecord(
                            actor,
                            e.id,
                            `${t.id} evidence version ${s.version}`,
                            reason,
                          ),
                      })
                    }
                  >
                    Refer to responsible manager
                  </button>
                </article>
              )),
            )}
            {!tasks.some((t) => t.submissions.length) && (
              <Empty
                title="No evidence versions"
                description="Submissions will stay linked to their original task."
              />
            )}
          </>
        )}
        {tab === "Blockers" && (
          <DataTable
            caption="Employee blocker history"
            headers={["Issue", "Reason", "Decision", ""]}
            rows={d.issues
              .filter((i) => i.employeeId === id)
              .map((i) => ({
                id: i.id,
                cells: [
                  i.title,
                  i.reason,
                  i.decision,
                  <button
                    className="gw-link"
                    onClick={() => open({ kind: "issue", id: i.id })}
                  >
                    View context
                  </button>,
                ],
              }))}
          />
        )}
        {tab === "Feedback & evaluations" && (
          <>
            {d.feedback
              .filter((f) => f.employeeId === id)
              .map((f, i) => (
                <article className="gw-detail-entry" key={i}>
                  <strong>{f.period}</strong>
                  <p>{f.note}</p>
                  <small>
                    {f.qualifyingMonths} qualifying months · Chairman review
                    after {d.settings.recognitionMonths}
                  </small>
                </article>
              ))}
            <p className="gw-callout">
              Evaluations are manager-owned. No approval or recognition decision
              is available in this workspace.
            </p>
            <button
              className="gw-link"
              onClick={() =>
                edit({
                  title: "Refer evaluation to responsible manager",
                  fields: [],
                  before: { employee: e.name, manager: person(d, e.managerId) },
                  submit: (_, r) =>
                    api.referEmployeeRecord(
                      actor,
                      e.id,
                      `Evaluation for ${e.id}`,
                      r,
                    ),
                })
              }
            >
              Refer to responsible manager
            </button>
          </>
        )}
        {tab === "Security & audit" && (
          <>
            <p className="gw-quiet">
              Last password change: {time(e.passwordChangedAt)} · Changed by{" "}
              {e.passwordChangedBy || "Not recorded"}
            </p>
            <ExportMenu view="logins" filters={{ employeeId: id }} />
            <DataTable
              caption="Employee security log"
              headers={["When", "Device", "Location", "Result"]}
              rows={d.logins
                .filter((l) => l.employeeId === id)
                .map((l) => ({
                  id: l.id,
                  cells: [time(l.at), l.device, l.location, l.result],
                }))}
            />
            <h3>Related audit trail</h3>
            <ol className="gw-timeline">
              {d.audit
                .filter((a) => a.target === id || a.actor.employeeId === id)
                .map((a) => (
                  <li key={a.id}>
                    <strong>{a.action}</strong>
                    <span>{a.reason}</span>
                    <small>
                      {a.actor.name} · {a.actor.activeRole} · {time(a.at)}
                    </small>
                  </li>
                ))}
            </ol>
          </>
        )}
      </div>
    </>
  );
}
function TaskDetail({ id }: { id: string }) {
  const { data: d, actor, edit } = useApp();
  const t = d.tasks.find((t) => t.id === id);
  if (!t) return <Empty title="Task not found" />;
  return (
    <>
      <div className="gw-drawer-actions">
        <Status>{t.state}</Status>
        <ExportMenu view="tasks" filters={{ id }} />
        <Button
          secondary
          onClick={() =>
            edit({
              title: "Update task oversight",
              before: t,
              initial: {
                instructions: t.instructions,
                ownerId: t.ownerId,
                stop: t.stopped ? "yes" : "no",
              },
              fields: [
                {
                  name: "instructions",
                  label: "Instructions",
                  type: "textarea",
                  required: true,
                },
                {
                  name: "ownerId",
                  label: "Owner",
                  options: d.employees
                    .filter((e) => e.active)
                    .map((e) => ({ value: e.id, label: e.name })),
                  required: true,
                },
                {
                  name: "stop",
                  label: "Stop assignment",
                  options: [
                    { value: "no", label: "Keep assigned" },
                    { value: "yes", label: "Stop assignment" },
                  ],
                  required: true,
                },
              ],
              submit: (v, r) => api.updateTask(actor, id, v, r),
            })
          }
        >
          Update instructions / owner
        </Button>
      </div>
      <h3>{t.title}</h3>
      <dl className="gw-definition">
        <dt>Immutable task ID</dt>
        <dd>{t.id}</dd>
        <dt>Created by</dt>
        <dd>{person(d, t.creatorId)}</dd>
        <dt>Owner / reviewer</dt>
        <dd>
          {person(d, t.ownerId)} / {person(d, t.reviewerId)}
        </dd>
        <dt>Original deadline</dt>
        <dd>{time(t.originalDue)}</dd>
        <dt>Current deadline</dt>
        <dd>{time(t.due)}</dd>
        <dt>Business record</dt>
        <dd>{t.businessRecord}</dd>
        <dt>Deliverables</dt>
        <dd>{t.deliverables}</dd>
      </dl>
      <p className="gw-callout">
        Work acceptance and completion belong to the assigned reviewer’s
        mandate. This workspace cannot approve the deliverable.
      </p>
      <Button
        secondary
        onClick={() =>
          edit({
            title: "Refer task evidence to responsible manager",
            before: { task: t.id, owner: t.ownerId, reviewer: t.reviewerId },
            fields: [],
            submit: (_, reason) =>
              api.referEmployeeRecord(actor, t.ownerId, t.id, reason),
          })
        }
      >
        Refer to responsible manager
      </Button>
      <h3>State history & time</h3>
      <ol className="gw-timeline">
        {t.trail.map((event, i) => (
          <li key={i}>
            <strong>{event.state}</strong>
            <span>{time(event.at)}</span>
            <small>
              {Math.max(
                0,
                Math.round(
                  (new Date(t.trail[i + 1]?.at || new Date()).getTime() -
                    new Date(event.at).getTime()) /
                    3600000,
                ),
              )}{" "}
              hours in this state (example)
            </small>
          </li>
        ))}
      </ol>
      <h3>Transfers</h3>
      <DataTable
        caption="Task transfers"
        headers={["From", "To", "Reason", "When"]}
        rows={t.transfers.map((x, i) => ({
          id: String(i),
          cells: [person(d, x.from), person(d, x.to), x.reason, time(x.at)],
        }))}
      />
      <h3>Submission versions</h3>
      {t.submissions.length ? (
        t.submissions.map((s) => (
          <article key={s.version} className="gw-detail-entry">
            <strong>
              {s.file} · Version {s.version}
            </strong>
            <p>
              {s.status}: {s.feedback}
            </p>
            <small>{time(s.at)}</small>
          </article>
        ))
      ) : (
        <p className="gw-quiet">No submissions yet.</p>
      )}
      <h3>Linked blockers</h3>
      {d.issues
        .filter((i) => i.taskId === id)
        .map((i) => (
          <p key={i.id}>
            {i.id} · {i.reason}
          </p>
        ))}
    </>
  );
}
function IssueDetail({ id }: { id: string }) {
  const { data: d, actor, edit, open } = useApp();
  const i = d.issues.find((i) => i.id === id);
  if (!i) return <Empty title="Item not found" />;
  const e = d.employees.find((e) => e.id === i.employeeId)!;
  return (
    <>
      <Status>
        {i.severity} · {i.kind}
      </Status>
      <h3>{i.title}</h3>
      <p>{i.reason}</p>
      <dl className="gw-definition">
        <dt>Team</dt>
        <dd>{e.department}</dd>
        <dt>Employee</dt>
        <dd>
          <button
            className="gw-link"
            onClick={() => open({ kind: "profile", id: e.id })}
          >
            {e.name}
          </button>
        </dd>
        <dt>Task / request / attendance</dt>
        <dd>
          {i.taskId ? (
            <button
              className="gw-link"
              onClick={() => open({ kind: "task", id: i.taskId })}
            >
              {i.taskId} · View source trail
            </button>
          ) : (
            i.id
          )}
        </dd>
        <dt>Activity</dt>
        <dd>{i.reason}</dd>
        <dt>Evidence</dt>
        <dd>{i.evidence}</dd>
        <dt>Decision</dt>
        <dd>{i.decision}</dd>
        <dt>Responsible manager</dt>
        <dd>{person(d, i.managerId)}</dd>
      </dl>
      <Button
        onClick={() =>
          edit({
            title: "Refer to responsible manager",
            description: `Notify ${person(d, i.managerId)} in the preview, keeping this decision read-only.`,
            before: i,
            fields: [],
            submit: (_, r) => api.referToManager(actor, i.id, r),
          })
        }
      >
        Refer to responsible manager
      </Button>
      <p className="gw-callout">
        Technical privilege alone does not authorise business decisions.
      </p>
      <h3>Decision & audit history</h3>
      <ol className="gw-timeline">
        {d.audit
          .filter((a) => a.target === id || a.target === i.taskId)
          .map((a) => (
            <li key={a.id}>
              <strong>{a.action}</strong>
              <span>{a.reason}</span>
              <small>
                {a.actor.name} · {a.actor.activeRole} · {time(a.at)}
              </small>
            </li>
          ))}
      </ol>
    </>
  );
}
export function Drawers({
  target,
  onClose,
}: {
  target: DrawerTarget;
  onClose: () => void;
}) {
  const { data: d, actor, navigate, open, edit, perform } = useApp(),
    [search, setSearch] = useState(""),
    [state, setState] = useState("Normal");
  const title =
    target.kind === "profile"
      ? "Employee profile"
      : target.kind === "task"
        ? "Task trail"
        : target.kind === "issue"
          ? "Review context"
          : target.kind === "exports"
            ? "Recent exports"
            : target.kind === "notifications"
              ? "Notifications"
              : target.kind === "announcement"
                ? "Announcement"
                : "Find a record";
  const matches = [
    ...d.employees.map((e) => ({
      id: e.id,
      label: e.name,
      kind: "profile" as const,
    })),
    ...d.tasks.map((t) => ({
      id: t.id,
      label: t.title,
      kind: "task" as const,
    })),
    ...d.issues.map((i) => ({
      id: i.id,
      label: i.title,
      kind: "issue" as const,
    })),
    ...d.audit.map((a) => ({
      id: a.id,
      label: a.action,
      kind: "audit" as const,
    })),
  ].filter((r) =>
    `${r.id} ${r.label}`.toLowerCase().includes(search.toLowerCase()),
  );
  const announcement = d.announcements.find((a) => a.id === target.id);
  return (
    <div
      className={`gw-drawer-scope ${target.kind === "search" ? "gw-command-scope" : ""}`}
    >
      <Dialog title={title} onClose={onClose}>
        <label className="gw-state-control">
          Preview state{" "}
          <select value={state} onChange={(e) => setState(e.target.value)}>
            {["Normal", "Loading", "Empty", "Error", "Restricted"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        {state === "Loading" ? (
          <Loading />
        ) : state === "Empty" ? (
          <Empty
            title="No records in this view"
            action={
              <Button secondary onClick={() => setState("Normal")}>
                Load example records
              </Button>
            }
          />
        ) : state === "Error" ? (
          <Empty
            title="This view could not load"
            description="Retry to restore the example records."
            action={<Button onClick={() => setState("Normal")}>Retry</Button>}
          />
        ) : state === "Restricted" ? (
          <Empty
            title="Outside your data scope"
            description="Request the appropriate access from the platform owner."
            action={
              <Button secondary onClick={onClose}>
                Close view
              </Button>
            }
          />
        ) : (
          <>
            {target.kind === "profile" && <Profile id={target.id!} />}
            {target.kind === "task" && <TaskDetail id={target.id!} />}
            {target.kind === "issue" && <IssueDetail id={target.id!} />}
            {target.kind === "exports" && (
              <>
                <p className="gw-quiet">
                  Files are generated from the current filters. Each export is
                  recorded in the audit log.
                </p>
                <DataTable
                  caption="Recent exports"
                  headers={["View", "Format", "Rows", "Status", "When"]}
                  rows={d.exports.map((e) => ({
                    id: e.id,
                    cells: [e.view, e.format, e.count, e.status, time(e.at)],
                  }))}
                />
              </>
            )}
            {target.kind === "notifications" && (
              <div className="gw-notices">
                {d.notices
                  .filter((n) => n.recipientId === actor.employeeId)
                  .map((n) => (
                    <button
                      key={n.id}
                      onClick={async () => {
                        await perform(() => api.markNoticeRead(actor, n.id));
                        navigate(n.screen);
                        onClose();
                      }}
                    >
                      <Status>{n.read ? "Read" : "Unread"}</Status>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                    </button>
                  ))}
              </div>
            )}
            {target.kind === "search" && (
              <>
                <Field label="Search employees, tasks, issues and audit">
                  <input
                    type="search"
                    autoFocus
                    placeholder="Try Harshitha, TASK-102 or AUD"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </Field>
                <div className="gw-search-results">
                  {matches.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        if (r.kind === "audit") {
                          navigate("audit");
                          onClose();
                        } else open({ kind: r.kind, id: r.id });
                      }}
                    >
                      <span>{r.id}</span>
                      <strong>{r.label}</strong>
                    </button>
                  ))}
                </div>
              </>
            )}
            {target.kind === "announcement" && announcement && (
              <>
                <div className="gw-drawer-actions">
                  <Status>{announcement.priority}</Status>
                  <ExportMenu
                    view="announcements"
                    filters={{ id: announcement.id }}
                  />
                  <Button
                    secondary
                    onClick={() =>
                      edit(announcementAction(d, actor, announcement))
                    }
                  >
                    Edit
                  </Button>
                </div>
                <h3>{announcement.title}</h3>
                <p className="gw-quiet">
                  {announcement.audience} · {time(announcement.publishAt)}–
                  {time(announcement.expiresAt)}
                </p>
                <RichBody text={announcement.body} />
                <h3>Read receipts</h3>
                <Button
                  secondary
                  disabled={
                    announcement.readBy.includes(actor.employeeId) ||
                    new Date(announcement.publishAt) > new Date() ||
                    new Date(announcement.expiresAt) < new Date()
                  }
                  onClick={() =>
                    perform(() =>
                      api.markAnnouncementRead(actor, announcement.id),
                    )
                  }
                >
                  {announcement.readBy.includes(actor.employeeId)
                    ? "Read by you"
                    : "Mark as read"}
                </Button>
                <DataTable
                  caption="Announcement read receipts"
                  headers={["Employee", "State"]}
                  rows={d.employees
                    .filter(
                      (e) =>
                        announcement.audience === "All users" ||
                        e.id === announcement.audience ||
                        e.family === announcement.audience ||
                        e.department === announcement.audience ||
                        e.roles.includes(announcement.audience),
                    )
                    .map((e) => ({
                      id: e.id,
                      cells: [
                        e.name,
                        announcement.readBy.includes(e.id)
                          ? "Read"
                          : "Not read",
                      ],
                    }))}
                />
              </>
            )}
          </>
        )}
      </Dialog>
    </div>
  );
}
