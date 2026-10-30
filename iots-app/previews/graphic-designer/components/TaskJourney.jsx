import { journeyDates } from "../journey";
import { Check, ClipboardList, Palette, Eye, BadgeCheck } from "lucide-react";
import { format } from "../presentation";
import { isInReview } from "../role-policy";
export default function TaskJourney({ task }) {
  const progress = Math.min(100, Math.max(0, Number(task.progress) || 0));
  const closed = task.status === "Completed";
  const step = closed
    ? 3
    : isInReview(task) || task.status === "Changes requested"
      ? 2
      : task.status === "Assigned"
        ? 0
        : 1;
  const approval = [...task.events]
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .find((e) => /completed|approved/i.test(e.action));
  const dates = journeyDates(task);
  const icons = [ClipboardList, Palette, Eye, BadgeCheck];
  const labels = [
    "Assigned",
    "Working / In progress",
    "Review / Reassignment",
    "Completed / Closed",
  ];
  const notes = [
    "Brief and ownership confirmed",
    task.status === "Blocked"
      ? "Blocked: waiting for input"
      : "Design execution and updates",
    task.status === "Changes requested"
      ? "Changes requested. Revise and resubmit."
      : "Review decisions and revision cycles",
    closed
      ? approval
        ? `Approved by ${approval.by} / ${format(approval.at)}`
        : "Approval details not recorded"
      : "Awaiting final approval",
  ];
  return (
    <aside className="task-journey" aria-label="Task progress and status">
      <div className="journey-progress">
        <div>
          <h2>Work progress</h2>
          <p>Reported completion</p>
        </div>
        <div
          className="progress-dial"
          role="progressbar"
          aria-label="Reported task progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle className="dial-track" cx="50" cy="50" r="42" />
            <circle
              className="dial-value"
              cx="50"
              cy="50"
              r="42"
              pathLength="100"
              strokeDasharray={`${progress} 100`}
            />
          </svg>
          <strong>{progress}%</strong>
        </div>
      </div>
      <p className="journey-note">
        Progress tracks work done. Closure requires approval.
      </p>
      <h2>Task status</h2>
      <ol className="journey-steps">
        {labels.map((label, i) => {
          const StageIcon = icons[i];
          return (
            <li
              key={label}
              tabIndex={0}
              data-current={i === step}
              data-state={i < step || closed ? "done" : i === step ? "current" : "next"}
              aria-current={i === step ? "step" : undefined}
            >
              <span className="journey-dot">
                {i < step ? <Check size={18} /> : <StageIcon size={19} />}
              </span>
              <div className="journey-stage-content">
                <strong>{label}</strong>
                <p>{notes[i]}</p>
                <dl className="journey-dates">
                  {dates[i].started ? (
                    <>
                      <dt>Started</dt>
                      <dd>
                        <time dateTime={dates[i].started}>
                          {format(dates[i].started)}
                        </time>
                      </dd>
                      {dates[i].stopped && i !== step ? (
                        <>
                          <dt>Moved on</dt>
                          <dd>
                            <time dateTime={dates[i].stopped}>
                              {format(dates[i].stopped)}
                            </time>
                          </dd>
                        </>
                      ) : (
                        i === step && (
                          <>
                            <dt>Status</dt>
                            <dd>{closed ? "Closed" : "Current stage"}</dd>
                          </>
                        )
                      )}
                      {dates[i].visits > 1 && (
                        <>
                          <dt>Visits</dt>
                          <dd>{dates[i].visits} · full history in Activity</dd>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <dt>Timing</dt>
                      <dd>{i > step ? "Not reached" : "Date not recorded"}</dd>
                    </>
                  )}
                </dl>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="journey-note">
        Current state: {task.status}. Earlier review and transfer records remain in
        Activity.
      </p>
    </aside>
  );
}
