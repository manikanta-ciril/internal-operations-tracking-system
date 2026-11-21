import { ScrollShadow } from "@heroui/scroll-shadow";
import { AlertCircle, MessageSquare, Clock3 } from "lucide-react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../shared/work-ui/alert.jsx";
import { format } from "./presentation.js";
export default function TaskAttention({ task, overdue, reviewer }) {
  const hasAlerts =
    overdue ||
    (task.returnNote && task.status === "Changes requested") ||
    (task.blocker && task.status === "Blocked") ||
    task.deadlineRequest;
  return (
    <section className="task-attention" aria-label="Task updates and attention">
      <h2>Updates & attention</h2>
      <ScrollShadow
        size={28}
        hideScrollBar={false}
        className="task-attention-scroll"
        tabIndex={0}
        role="region"
        aria-label="Task alert list"
      >
        {overdue && (
          <Alert>
            <AlertCircle />
            <AlertTitle>Manager action needed</AlertTitle>
            <AlertDescription>
              The deadline has passed. Your manager can extend, reassign,
              escalate or adjust scope. Earlier deadlines and your current stage
              stay recorded.
            </AlertDescription>
          </Alert>
        )}
        {task.returnNote && task.status === "Changes requested" && (
          <Alert className="feedback-alert">
            <MessageSquare />
            <AlertTitle>{task.returnedBy} requested changes</AlertTitle>
            <AlertDescription>
              <p>{task.returnNote}</p>
              <p>{task.deadlineDecision}</p>
              <span>Revise and resubmit through {reviewer.toLowerCase()}.</span>
            </AlertDescription>
          </Alert>
        )}
        {task.blocker && task.status === "Blocked" && (
          <Alert>
            <AlertCircle />
            <AlertTitle>
              {task.blocker.open
                ? "Waiting for input"
                : "Input received — ready to continue"}
            </AlertTitle>
            <AlertDescription>
              <p>
                {task.blocker.open
                  ? task.blocker.reason
                  : task.blocker.resolution ||
                    "Your manager resolved the issue."}
              </p>
              <small>
                {task.blocker.id} · {task.blocker.severity} ·{" "}
                {task.blocker.owner}
              </small>
            </AlertDescription>
          </Alert>
        )}
        {task.deadlineRequest && (
          <Alert>
            <Clock3 />
            <AlertTitle>Extension requested</AlertTitle>
            <AlertDescription>
              {task.deadlineRequest.status} · Requested{" "}
              {format(task.deadlineRequest.requestedDue)}.{" "}
              {task.deadlineRequest.status === "Approved"
                ? "Approved deadline:"
                : "Current deadline:"}{" "}
              {format(task.due)}.
            </AlertDescription>
          </Alert>
        )}
        {!hasAlerts && (
          <p className="muted-copy">
            No alerts for this task. Your next step is in Details.
          </p>
        )}
      </ScrollShadow>
    </section>
  );
}
