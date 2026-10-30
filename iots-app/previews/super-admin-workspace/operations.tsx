import { useState } from "react";
import { api, filterRows, person, attendanceRows } from "./api";
import { states } from "./types";
import { createTaskAction, announcementAction } from "./actions";
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
  Icon,
  time,
  Empty,
  RichBody,
  Field,
} from "./ui";
export function Tasks() {
  const { data: d, actor, edit, open } = useApp(),
    [tab, setTab] = useState("Table"),
    [filters, setFilters] = useState<Record<string, string>>({});
  const tasks = filterRows(d.tasks, filters);
  return (
    <>
      <Heading
        title="Global task oversight"
        description="Follow ownership and delivery. Business reviews stay with the assigned reviewer."
        actions={
          <>
            <ExportMenu
              view={tab === "Transfer log" ? "transfers" : "tasks"}
              filters={filters}
            />
            <Button
              icon="plus"
              onClick={() => edit(createTaskAction(d, actor))}
            >
              Create & assign task
            </Button>
          </>
        }
      />
      <Tabs
        items={["Table", "Kanban", "Transfer log"]}
        value={tab}
        onChange={setTab}
        label="Task views"
        panelId="tasks-panel"
      />
      <div role="tabpanel" id="tasks-panel" aria-label={tab} tabIndex={0}>
        <Filters
          values={filters}
          onChange={setFilters}
          options={{
            state: [...states],
            priority: ["High", "Medium", "Low"],
            ownerId: d.employees.map((e) => ({ value: e.id, label: e.name })),
          }}
        />
        {tab === "Table" && (
          <Card title={`${tasks.length} tasks`}>
            <DataTable
              caption="Task oversight"
              headers={[
                "Task",
                "Owner / reviewer",
                "State",
                "Deadline",
                "Priority",
                "",
              ]}
              rows={tasks.map((t) => ({
                id: t.id,
                cells: [
                  <>
                    <strong>{t.title}</strong>
                    <small>
                      {t.id} · {t.businessRecord}
                    </small>
                  </>,
                  <>
                    {person(d, t.ownerId)}
                    <small>Review: {person(d, t.reviewerId)}</small>
                  </>,
                  <Status>{t.stopped ? "Assignment stopped" : t.state}</Status>,
                  <>
                    {time(t.due)}
                    {t.due !== t.originalDue && (
                      <small>Original: {time(t.originalDue)}</small>
                    )}
                  </>,
                  t.priority,
                  <button
                    className="gw-link"
                    onClick={() => open({ kind: "task", id: t.id })}
                  >
                    View trail
                  </button>,
                ],
              }))}
            />
          </Card>
        )}
        {tab === "Kanban" && (
          <div className="gw-kanban">
            {states.map((state) => (
              <section key={state}>
                <h2>
                  {state}
                  <span>{tasks.filter((t) => t.state === state).length}</span>
                </h2>
                {tasks
                  .filter((t) => t.state === state)
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => open({ kind: "task", id: t.id })}
                    >
                      <small>
                        {t.id} · {t.priority}
                      </small>
                      <strong>{t.title}</strong>
                      <span>{person(d, t.ownerId)}</span>
                      <small>Due {time(t.due)}</small>
                    </button>
                  ))}
              </section>
            ))}
          </div>
        )}
        {tab === "Transfer log" && (
          <Card title="Transfers, without losing the original task">
            <DataTable
              caption="Task transfer log"
              headers={["Task ID", "From", "To", "Reason", "Time"]}
              rows={tasks.flatMap((t) =>
                t.transfers.map((tr, i) => ({
                  id: `${t.id}-${i}`,
                  cells: [
                    <button
                      className="gw-link"
                      onClick={() => open({ kind: "task", id: t.id })}
                    >
                      {t.id}
                    </button>,
                    person(d, tr.from),
                    person(d, tr.to),
                    tr.reason,
                    time(tr.at),
                  ],
                })),
              )}
            />
          </Card>
        )}
        <Card
          title="Requests, evidence & feedback"
          description="Read-only oversight. These items are not an approval queue."
        >
          <DataTable
            caption="Manager-owned decisions"
            headers={["Item", "Owner", "Responsible manager", "Decision", ""]}
            rows={d.issues.map((i) => ({
              id: i.id,
              cells: [
                <>
                  {i.title}
                  <small>
                    {i.kind} · {i.id}
                  </small>
                </>,
                person(d, i.employeeId),
                person(d, i.managerId),
                i.decision,
                <button
                  className="gw-link"
                  onClick={() => open({ kind: "issue", id: i.id })}
                >
                  Review context
                </button>,
              ],
            }))}
          />
        </Card>
      </div>
    </>
  );
}
export function Attendance() {
  const { data: d, actor, edit } = useApp(),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [date, setDate] = useState(d.attendance[0]?.date || "");
  const rows = filterRows(
    attendanceRows(d).filter((a) => a.date === date),
    filters,
  );
  return (
    <>
      <Heading
        title="Location & attendance"
        description="Original evidence stays intact. Corrections are added beside it, with a reason."
        actions={
          <ExportMenu view="attendance" filters={{ ...filters, date }} />
        }
      />
      <div className="gw-attendance-date">
        <Field label="Attendance date">
          <input
            type="date"
            min="2025-01-01"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </Field>
      </div>
      <Filters
        values={filters}
        onChange={setFilters}
        options={{
          department: d.departments.map((x) => x.name),
          location: [
            "On-site",
            "Remote",
            "Unknown location",
            "On leave",
            "Absent",
          ],
          status: [
            "Flagged",
            "Missing checkout",
            "Late",
            "Recorded",
            "Corrected",
          ],
        }}
      />
      <Card title="Attendance records">
        <DataTable
          caption="Attendance and corrections"
          headers={[
            "Employee",
            "Location",
            "Punches (IST)",
            "Access session",
            "Task effort",
            "Flag / correction",
            "",
          ]}
          rows={rows.map((a) => ({
            id: a.id,
            cells: [
              person(d, a.employeeId),
              <>
                <Status>{a.location}</Status>
                {a.location !== a.originalLocation && (
                  <small>Original: {a.originalLocation}</small>
                )}
              </>,
              <>
                <span>In: {time(a.punchIn)}</span>
                <small>Out: {time(a.punchOut)}</small>
              </>,
              `${a.sessionMinutes} min`,
              `${a.taskMinutes} min`,
              <>
                {a.flag || "No flag"}
                {a.corrections.map((c, i) => (
                  <small key={i}>
                    {c.field}: {c.before} → {c.after} · {c.reason}
                  </small>
                ))}
              </>,
              <button
                className="gw-link"
                onClick={() =>
                  edit({
                    title: "Add an attendance correction",
                    description:
                      "The source reading and original punch remain unchanged.",
                    before: a,
                    fields: [
                      {
                        name: "field",
                        label: "Field",
                        options: ["location", "punchIn", "punchOut"],
                        required: true,
                      },
                      {
                        name: "value",
                        label: "Corrected value",
                        required: true,
                        hint: "Location state, or an ISO date/time for a punch.",
                      },
                      {
                        name: "evidence",
                        label: "Source evidence",
                        required: true,
                        hint: "Reference the original reading, photo or authorised correction note.",
                      },
                    ],
                    submit: (v, r) =>
                      api.correctAttendance(
                        actor,
                        a.id,
                        v.field,
                        v.value,
                        r,
                        v.evidence,
                      ),
                  })
                }
              >
                Add correction
              </button>,
            ],
          }))}
        />
      </Card>
      <div className="gw-two-columns">
        <Card
          title="Office boundary"
          description="Approved office location from company settings."
        >
          <div
            className="gw-radius-preview"
            role="img"
            aria-label={`Office radius ${d.settings.radius} metres around ${d.settings.officeLatitude}, ${d.settings.officeLongitude}`}
          >
            <div
              style={{
                width: `${Math.max(100, Math.min(220, Number(d.settings.radius) * 1.5))}px`,
                height: `${Math.max(100, Math.min(220, Number(d.settings.radius) * 1.5))}px`,
              }}
            >
              <Icon name="location" size={26} />
              <strong>{d.settings.radius} m</strong>
            </div>
          </div>
          <p className="gw-quiet">
            {d.settings.officeLatitude}, {d.settings.officeLongitude} ·
            Schematic, not a map
          </p>
          <button
            className="gw-link"
            onClick={() =>
              edit({
                title: "Configure office boundary",
                before: {
                  latitude: d.settings.officeLatitude,
                  longitude: d.settings.officeLongitude,
                  radius: d.settings.radius,
                },
                initial: {
                  officeLatitude: d.settings.officeLatitude,
                  officeLongitude: d.settings.officeLongitude,
                  radius: d.settings.radius,
                },
                fields: [
                  { name: "officeLatitude", label: "Latitude", required: true },
                  {
                    name: "officeLongitude",
                    label: "Longitude",
                    required: true,
                  },
                  {
                    name: "radius",
                    label: "Radius in metres",
                    type: "number",
                    required: true,
                  },
                ],
                submit: (v, r) => api.saveSettings(actor, v, r),
              })
            }
          >
            Edit boundary
          </button>
        </Card>
        <Card title="Working hours & breaks">
          <dl className="gw-definition">
            <dt>Monday–Friday</dt>
            <dd>
              {d.settings.weekdayStart}–{d.settings.weekdayEnd}
            </dd>
            <dt>Saturday</dt>
            <dd>
              {d.settings.weekdayStart}–{d.settings.saturdayEnd}
            </dd>
            <dt>Grace period</dt>
            <dd>{d.settings.grace} minutes</dd>
            <dt>Break guidance</dt>
            <dd>{d.settings.breakMinutes} minutes</dd>
          </dl>
          <p className="gw-callout">
            Attendance is not session activity. Session activity is not task
            effort. Each remains a separate record.
          </p>
        </Card>
      </div>
    </>
  );
}
export const announcementState = (a: {
  publishAt: string;
  expiresAt: string;
}) =>
  new Date(a.expiresAt) < new Date()
    ? "Expired"
    : new Date(a.publishAt) > new Date()
      ? "Scheduled"
      : "Live";
export function Announcements() {
  const { data: d, actor, edit, open } = useApp(),
    [filters, setFilters] = useState<Record<string, string>>({});
  const rows = filterRows(
    d.announcements.map((a) => ({ ...a, status: announcementState(a) })),
    filters,
  );
  return (
    <>
      <Heading
        title="Global announcements"
        description="Send a clear message to the people who need it."
        actions={
          <>
            <ExportMenu view="announcements" filters={filters} />
            <Button
              icon="plus"
              onClick={() => edit(announcementAction(d, actor))}
            >
              New announcement
            </Button>
          </>
        }
      />
      <Filters
        values={filters}
        onChange={setFilters}
        options={{
          priority: ["Normal", "Important", "Urgent"],
          status: ["Live", "Scheduled", "Expired"],
        }}
      />
      <Card title={`${rows.length} announcements`}>
        <DataTable
          caption="Announcement history"
          headers={[
            "Message",
            "Audience",
            "Status",
            "Published / expiry",
            "Read receipts",
            "",
          ]}
          rows={rows.map((a) => ({
            id: a.id,
            cells: [
              <button
                className="gw-title-button"
                onClick={() => open({ kind: "announcement", id: a.id })}
              >
                <strong>{a.title}</strong>
                <small>{a.priority}</small>
              </button>,
              a.audience,
              <Status>{a.status}</Status>,
              <>
                {time(a.publishAt)}
                <small>Until {time(a.expiresAt)}</small>
              </>,
              `${a.readBy.length} read`,
              <button
                className="gw-link"
                onClick={() => edit(announcementAction(d, actor, a))}
              >
                Edit
              </button>,
            ],
          }))}
        />
      </Card>
      <p className="gw-callout">
        Publication, read receipts and notifications are example data. This
        preview does not send messages to real employees.
      </p>
    </>
  );
}
