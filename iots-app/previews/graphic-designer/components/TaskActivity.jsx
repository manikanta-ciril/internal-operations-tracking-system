import { useState } from "react";
import { History, ShieldCheck } from "lucide-react";
import { Badge } from "./ui/badge";
import { Choice, Blank } from "./WorkspaceUI";
import { format } from "../presentation";
function eventStage(event) {
  if (event.action === "Completed") return "Completed";
  if (event.action === "Deadline request") return "Extension requested";
  if (event.action === "Working draft saved") return "Working draft";
  return event.after?.status || event.action;
}
export default function TaskActivity({ task }) {
  const [actor, setActor] = useState("All people"),
    [type, setType] = useState("All activity");
  const decision = (event) =>
    /request|deadline|reassign|approv|complet|resolved/i.test(event.action);
  const events = task.events
    .map((event, index) => ({ ...event, order: index }))
    .sort((a, b) => new Date(b.at) - new Date(a.at) || b.order - a.order)
    .filter(
      (event) =>
        (actor === "All people" || event.by === actor) &&
        (type === "All activity" ||
          (type === "Decisions" ? decision(event) : !decision(event))),
    );
  return (
    <>
      <div className="activity-path-heading">
        <h3>Activity path</h3>
        <span>Latest first</span>
      </div>
      <div className="history-filters">
        <Choice
          label="Filter activity by person"
          value={actor}
          onChange={setActor}
          options={["All people", ...new Set(task.events.map((e) => e.by))]}
        />
        <Choice
          label="Filter activity type"
          value={type}
          onChange={setType}
          options={["All activity", "Decisions", "Work updates"]}
        />
      </div>
      {events.length ? (
        <ol className="task-activity-path">
          {events.map((event, index) => {
            const completed = event.action === "Completed";
            return (
              <li key={`${event.at}-${index}`} data-completed={completed}>
                <span className="activity-path-node" aria-hidden="true">
                  {completed ? <ShieldCheck size={16} /> : <History size={14} />}
                </span>
                <article>
                  <div className="activity-path-title">
                    <strong>{completed ? "Completed & approved" : event.action}</strong>
                    <time dateTime={event.at}>{format(event.at)}</time>
                  </div>
                  <p>{event.detail || "Task stage recorded."}</p>
                  {event.before && event.after && (
                    <p className="activity-path-delta">
                      {event.before.status} to {event.after.status}
                      {event.after.progress != null ? ` / ${event.after.progress}%` : ""}
                    </p>
                  )}
                  <small>
                    {completed ? "Approved by " : ""}
                    {event.by || "Actor not recorded"}
                    {event.role ? ` / ${event.role}` : ""}
                  </small>
                  <details>
                    <summary>Record details</summary>
                    <dl className="record-metadata">
                      <dt>Timestamp</dt>
                      <dd>{event.at}</dd>
                      <dt>Actor ID</dt>
                      <dd>{event.actorId || "Not recorded"}</dd>
                      <dt>Source</dt>
                      <dd>{event.source || "Example record"}</dd>
                    </dl>
                  </details>
                </article>
                <span className="activity-path-status">
                  <span aria-hidden="true" />
                  <Badge variant="outline">{eventStage(event)}</Badge>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <Blank
          title="No matching activity"
          text="Choose another person or activity type."
        />
      )}
      <p className="preview-footnote">
        Browser history is a preview record, not an immutable server audit.
      </p>
    </>
  );
}
