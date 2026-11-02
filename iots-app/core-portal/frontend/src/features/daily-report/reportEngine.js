import { istDate } from "../tasks/model.js";
export function dailyReport(state, date = istDate()) {
  const dayOf = (t) => istDate(new Date(t));
  const atEnd = new Date(`${date}T23:59:59.999+05:30`).getTime();
  const rows = state.tasks
    .filter((t) => new Date(t.createdAt).getTime() <= atEnd)
    .map((t) => {
      const events = t.events
        .filter((e) => new Date(e.at).getTime() <= atEnd)
        .map((e) => {
          const action = e.after?.status || e.action;
          return {
            ...e,
            action: action.startsWith("With ") ? "In review" : action,
          };
        })
        .sort((a, b) => new Date(a.at) - new Date(b.at));
      const status =
        [...events]
          .reverse()
          .find((e) =>
            [
              "Assigned",
              "In progress",
              "Changes requested",
              "Blocked",
              "In review",
              "Completed",
            ].includes(e.action),
          )?.action || "Assigned";
      return { ...t, status };
    });
  const relevant = rows.filter(
    (t) =>
      t.status !== "Completed" ||
      t.events.some((e) => e.action === "Completed" && dayOf(e.at) === date),
  );
  const line = (t) => `${t.id} · ${t.title}`;
  const notes = state.tasks.flatMap((t) =>
    t.notes
      .filter((n) => dayOf(n.at) === date)
      .map((n) => `${t.id}: ${n.text}`),
  );
  return {
    date,
    day: new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
    }),
    planned: relevant.map(line),
    completed: relevant.filter((t) => t.status === "Completed").map(line),
    progress: relevant
      .filter((t) => ["In progress", "In review"].includes(t.status))
      .map((t) => `${line(t)} · ${t.status}`),
    pending: relevant
      .filter((t) =>
        ["Assigned", "Changes requested", "Blocked"].includes(t.status),
      )
      .map(
        (t) =>
          `${line(t)}${t.status === "Changes requested" ? " · Corrections needed" : ""}`,
      ),
    newTasks: rows
      .filter((t) => dayOf(t.createdAt) === date)
      .map(line)
      .concat(
        state.extraWork.filter((n) => n.date === date).map((n) => n.text),
      ),
    remarks: [...notes, state.remarks[date] || ""].filter(Boolean),
  };
}
