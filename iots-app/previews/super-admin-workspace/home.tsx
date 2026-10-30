import { api, person, ratio, attendanceRows } from "./api";
import { today } from "./seed";
import { createEmployeeAction, announcementAction } from "./actions";
import {
  useApp,
  Heading,
  Card,
  Button,
  Status,
  Icon,
  Progress,
  ExportMenu,
  Trend,
  Chart,
  Diff,
  time,
  Empty,
  AnimatedNumber,
} from "./ui";
import { useState } from "react";
export function Home() {
  const { data: d, actor, navigate, edit, open } = useApp();
  const hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        hourCycle: "h23",
      }).format(new Date()),
    ),
    greeting =
      hour < 12
        ? "Good morning"
        : hour < 17
          ? "Good afternoon"
          : "Good evening";
  const pending = d.changes.filter((c) => c.status === "Awaiting"),
    overdue = d.tasks.filter(
      (t) =>
        t.state !== "Completed & Closed" &&
        !t.stopped &&
        new Date(t.due) < new Date(),
    ),
    [period, setPeriod] = useState("Day");
  const mix = [
    "On-site",
    "Remote",
    "Unknown location",
    "On leave",
    "Absent",
  ].map((name) => ({
    name,
    n: attendanceRows(d).filter((a) => a.location === name).length,
  }));
  const attendance = attendanceRows(d);
  const active = d.employees.filter((e) => e.active).length;
  const signal = d.logins.filter((l) => l.failed || l.jump).length;
  const pulse = [
    {
      name: "Workforce",
      value: active,
      detail: `${d.employees.length - active} deactivated`,
      delta: active - d.previousDay.workforce,
      to: "people",
    },
    {
      name: "Attendance today",
      value: attendance.filter((a) => a.punchIn).length,
      detail: mix
        .slice(0, 3)
        .map((m) => `${m.n} ${m.name.toLowerCase()}`)
        .join(" · "),
      delta:
        attendance.filter((a) => a.punchIn).length - d.previousDay.attendance,
      to: "attendance",
    },
    {
      name: "Work in flight",
      value: d.tasks.filter(
        (t) => t.state !== "Completed & Closed" && !t.stopped,
      ).length,
      detail: `${overdue.length} overdue · ${d.tasks.filter((t) => t.state === "In Progress").length} in progress`,
      delta:
        d.tasks.filter((t) => t.state !== "Completed & Closed" && !t.stopped)
          .length - d.previousDay.workInFlight,
      to: "tasks",
    },
    {
      name: "Needs attention",
      value: d.issues.length,
      detail: ["High", "Medium", "Low"]
        .map(
          (s) =>
            `${d.issues.filter((i) => i.severity === s).length} ${s.toLowerCase()}`,
        )
        .join(" · "),
      delta: d.issues.length - d.previousDay.attention,
      to: "reports",
    },
    {
      name: "Security signals",
      value: signal,
      detail: `${d.logins.filter((l) => l.failed).length} failed · ${d.logins.filter((l) => l.jump).length} location jump`,
      delta: signal - d.previousDay.security,
      to: "audit",
    },
  ];
  return (
    <>
      <div className="gw-date">
        {new Date().toLocaleDateString("en-IN", {
          timeZone: "Asia/Kolkata",
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        · Example snapshot
      </div>
      <Heading
        title={`${greeting}, ${actor.name.split(" ")[0]}.`}
        description={`${pending.length} account changes await your authorisation. ${d.issues.length} items need attention.`}
        actions={<ExportMenu view="reports" />}
      />
      <div className="gw-quick-actions">
        <Button
          onClick={() => edit(createEmployeeAction(d, actor))}
          icon="users"
        >
          Create user
        </Button>
        <Button
          secondary
          onClick={() => edit(announcementAction(d, actor))}
          icon="plus"
        >
          Publish announcement
        </Button>
        <button className="gw-link" onClick={() => navigate("audit")}>
          Open audit log <Icon name="arrow" size={14} />
        </button>
      </div>
      <div className="gw-pulse">
        {pulse.map((p) => (
          <button key={p.name} onClick={() => navigate(p.to as "people")}>
            <span>{p.name}</span>
            <div>
              <strong>
                <AnimatedNumber value={p.value} />
              </strong>
              <small>
                {p.delta > 0 ? "+" : ""}
                {p.delta} vs yesterday
              </small>
            </div>
            <p>{p.detail}</p>
            <Trend
              values={d.history
                .slice(-7)
                .map((h, i) =>
                  p.name === "Workforce"
                    ? h.onSite + h.remote + 2
                    : p.name === "Needs attention"
                      ? h.risk
                      : h.workload - (i % 2),
                )}
              label={`${p.name}: example daily comparison`}
            />
          </button>
        ))}
      </div>
      <Card
        title="Awaiting your authorisation"
        description="Account access only. Business decisions stay with the responsible manager."
        action={<ExportMenu view="changes" filters={{ status: "Awaiting" }} />}
      >
        {pending.length ? (
          pending.map((c) => (
            <div className="gw-authorisation" key={c.id}>
              <div>
                <span className="gw-record-id">{c.id}</span>
                <h3>
                  {c.kind} · {person(d, c.employeeId)}
                </h3>
                <p>
                  Requested by {c.requester} · {c.reason}
                </p>
                <details>
                  <summary>See before and after</summary>
                  <Diff before={c.before} after={c.after} />
                </details>
              </div>
              <div className="gw-actions">
                {[true, false].map((yes) => (
                  <Button
                    key={String(yes)}
                    secondary={!yes}
                    onClick={() =>
                      edit({
                        title: `${yes ? "Authorise" : "Decline"} this account change`,
                        before: c.before,
                        initial: { decision: yes ? "Authorise" : "Decline" },
                        fields: [],
                        description: c.reason,
                        submit: (_, r) =>
                          api.decideAccountChange(actor, c.id, yes, r),
                      })
                    }
                  >
                    {yes ? "Authorise" : "Decline"}
                  </Button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <Empty
            title="All account changes are reviewed"
            description="New high-level account requests will appear here."
            action={
              <Button secondary onClick={() => navigate("people")}>
                View accounts
              </Button>
            }
          />
        )}
      </Card>
      <div className="gw-two-columns">
        <Card
          title="Attendance mix"
          description="Attendance is separate from access sessions and task effort."
          action={
            <button className="gw-link" onClick={() => navigate("attendance")}>
              View records
            </button>
          }
        >
          <div
            className="gw-mix"
            role="img"
            aria-label={mix.map((m) => `${m.name}: ${m.n}`).join(", ")}
          >
            {mix
              .filter((m) => m.n)
              .map((m, i) => (
                <span
                  key={m.name}
                  className={`gw-mix-${i}`}
                  style={{
                    width: `${(m.n / Math.max(1, attendance.length)) * 100}%`,
                  }}
                  title={`${m.name}: ${m.n}`}
                />
              ))}
          </div>
          <ul className="gw-legend">
            {mix.map((m, i) => (
              <li key={m.name}>
                <i className={`gw-mix-${i}`} />
                {m.name}
                <strong>{m.n}</strong>
              </li>
            ))}
          </ul>
          <Chart
            title="Seven-day attendance trend. Use View data table for values."
            series={[
              {
                name: "Office",
                values: d.history.slice(-7).map((h) => h.onSite),
              },
              {
                name: "Remote",
                values: d.history.slice(-7).map((h) => h.remote),
              },
              {
                name: "Unknown",
                values: d.history.slice(-7).map((h) => h.unknown),
              },
            ]}
          />
        </Card>
        <Card
          title="Work completion by team"
          description="Unique tasks counted once, including after reassignment."
        >
          {d.departments.map((dep) => {
            const people = d.employees.filter((e) => e.department === dep.name),
              tasks = d.tasks.filter(
                (t) => people.some((e) => e.id === t.ownerId) && !t.stopped,
              ),
              done = tasks.filter(
                (t) => t.state === "Completed & Closed",
              ).length;
            return (
              <div className="gw-team-progress" key={dep.id}>
                <div>
                  <strong>{dep.name}</strong>
                  <span>{ratio(done, tasks.length)}</span>
                </div>
                <Progress
                  label={`${dep.name} completion`}
                  value={tasks.length ? (done / tasks.length) * 100 : 0}
                />
                <small>
                  {people.every((e) => e.target === null)
                    ? "Target not configured"
                    : `${people.filter((e) => e.target !== null).length} employees have targets`}
                </small>
              </div>
            );
          })}
        </Card>
      </div>
      <Card
        title="Requires attention"
        description="Rules identify risk. People decide the next action."
        action={<ExportMenu view="issues" />}
      >
        <div className="gw-attention-list">
          {[...d.issues]
            .sort(
              (a, b) =>
                ["High", "Medium", "Low"].indexOf(a.severity) -
                ["High", "Medium", "Low"].indexOf(b.severity),
            )
            .map((issue) => (
              <button
                key={issue.id}
                onClick={() => open({ kind: "issue", id: issue.id })}
              >
                <span className="gw-severity">
                  <Icon name="flag" size={17} />
                  {issue.severity}
                </span>
                <span>
                  <strong>{issue.title}</strong>
                  <small>
                    {person(d, issue.employeeId)} · {issue.reason}
                  </small>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
        </div>
      </Card>
      <Card
        title="Trends, with context"
        description="Illustrative history. Approved leave and external blockers remain visible."
        action={
          <div className="gw-segment">
            {["Day", "Week", "Month"].map((p) => (
              <button
                key={p}
                aria-pressed={period === p}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
        }
      >
        <div className="gw-trend-summary">
          {(["completed", "workload", "onSite", "risk"] as const).map(
            (key, i) => {
              const size = period === "Day" ? 1 : period === "Week" ? 7 : 30,
                now = d.history.slice(-size).reduce((n, h) => n + h[key], 0),
                before = d.history
                  .slice(-size * 2, -size)
                  .reduce((n, h) => n + h[key], 0);
              return (
                <div key={key}>
                  <span>
                    {
                      [
                        "Work completed",
                        "Workload",
                        "Office attendance",
                        "Risk flags",
                      ][i]
                    }
                  </span>
                  <strong>
                    {now}{" "}
                    <small>
                      {now - before >= 0 ? "+" : ""}
                      {now - before} vs previous {period.toLowerCase()}
                    </small>
                  </strong>
                </div>
              );
            },
          )}
        </div>
        <Chart
          title="Operations trend with table fallback"
          series={[
            {
              name: "Workload",
              values: d.history.slice(-7).map((h) => h.workload),
            },
            {
              name: "Completed",
              values: d.history.slice(-7).map((h) => h.completed),
            },
          ]}
        />
      </Card>
      <div className="gw-two-columns">
        <Card
          title="Governance feed"
          action={
            <button className="gw-link" onClick={() => navigate("audit")}>
              View full log
            </button>
          }
        >
          <ol className="gw-timeline">
            {d.audit.slice(0, 5).map((a) => (
              <li key={a.id}>
                <strong>{a.action}</strong>
                <span>
                  {a.actor.name} · {a.actor.activeRole}
                </span>
                <small>
                  {time(a.at)} · {a.reason}
                </small>
              </li>
            ))}
          </ol>
        </Card>
        <Card
          title="Scheduled and live"
          description="Schedules and publications from the example workspace."
        >
          <div className="gw-schedule-list">
            {[
              ["Daily report", d.settings.dailyReport],
              ["Weekly report", d.settings.weeklyReport],
              ["Monthly report", d.settings.monthlyReport],
            ].map(([title, schedule]) => (
              <div key={title}>
                <Icon name="clock" size={16} />
                <span>{title}</span>
                <strong>{schedule} IST</strong>
              </div>
            ))}
          </div>
          {d.announcements
            .filter(
              (a) =>
                new Date(a.publishAt) <= new Date() &&
                new Date(a.expiresAt) > new Date(),
            )
            .map((a) => (
              <button
                className="gw-announcement-link"
                key={a.id}
                onClick={() => open({ kind: "announcement", id: a.id })}
              >
                <Status>{a.priority}</Status>
                <strong>{a.title}</strong>
                <small>Expires {time(a.expiresAt)}</small>
              </button>
            ))}
        </Card>
      </div>
    </>
  );
}
