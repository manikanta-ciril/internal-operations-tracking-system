import { ArrowUpRight, CalendarDays, Paperclip, ArrowRight } from "lucide-react";
import { Progress } from "./ui/progress";
import { StatusBadge } from "./WorkspaceUI";
import { reportingState } from "../workflow";
import { format } from "../presentation";
import { isInReview, reviewLabel } from "../role-policy";
import { useRolePolicy } from "../RoleContext";
import { cn } from "../lib/utils";
export default function TaskCard({ task, now, onOpen }) {
  const policy = useRolePolicy(),
    overdue = reportingState(task, now) === "Overdue";
  const context =
    task.status === "Changes requested"
      ? task.returnNote
      : task.status === "Blocked"
        ? task.blocker?.open === false
          ? "The missing input is ready. You can resume work."
          : task.blocker?.reason
        : isInReview(task)
          ? `${reviewLabel(task, policy)} is ${task.reviewOpened ? "reviewing your submission." : "next to review your submission."}`
          : task.brief;
  const action =
    task.status === "Assigned"
      ? "View brief"
      : task.status === "Changes requested"
        ? "Review feedback"
        : task.status === "Blocked"
          ? task.blocker?.open === false
            ? "Resume work"
            : "View blocker"
          : isInReview(task)
            ? "View submission"
            : task.status === "Completed"
              ? "View final work"
              : "Continue work";
  return (
    <button
      className={cn("task-card", overdue && "task-card-overdue")}
      onClick={() => onOpen(task.id)}
      aria-label={`${task.title}, ${action}`}
    >
      <span className="task-card-top">
        <span className="task-card-id">{task.id}</span>
        <span>{task.category}</span>
        <ArrowUpRight size={17} />
      </span>
      <strong className="task-card-title">{task.title}</strong>
      <span className="task-card-state">
        <StatusBadge task={task} />
        {task.priority === "High" && (
          <span className="priority-label">High priority</span>
        )}
      </span>
      <span className="task-card-context">{context}</span>
      <span className="task-card-progress">
        <span>
          Progress<strong>{task.progress || 0}%</strong>
        </span>
        <Progress value={task.progress || 0} aria-label={`${task.title} progress`} />
      </span>
      <span className="task-card-meta">
        <span className={cn(overdue && "overdue-text")}>
          <CalendarDays size={14} />
          {format(task.due)}
          {overdue && <strong>Overdue</strong>}
        </span>
        <span>
          <Paperclip size={13} />
          {task.versions.length}
          <span className="sr-only">submission versions</span>
        </span>
      </span>
      <span className="task-card-bottom">
        <span>{task.id}</span>
        <strong>
          {action}
          <ArrowRight size={14} />
        </strong>
      </span>
    </button>
  );
}
