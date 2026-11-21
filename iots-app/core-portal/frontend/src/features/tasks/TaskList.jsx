import creativeArtistFemale from "../creative-associate/workspace/assets/creative-artist-female.svg";
import creativeArtistMale from "../creative-associate/workspace/assets/creative-artist-male.svg";
// Designer animation: Priyanshu Rijhwani, https://lottiefiles.com/free-animation/designer-5j1hWRVfcX
import EmployeeGreeting from "../../shared/workspace/EmployeeGreeting.jsx";

import {
  Search,
  LayoutGrid,
  List,
  AlertCircle,
  MessageSquare,
  CheckCheck,
} from "lucide-react";
import { Button } from "../../shared/work-ui/button.jsx";
import { Input } from "../../shared/work-ui/input.jsx";
import { Blank } from "../creative-associate/workspace/WorkspaceUI.jsx";
import TaskCard from "./TaskCard.jsx";
import { reportingState } from "./workflow.js";
import { taskGroup } from "./task-groups.js";
import { isInReview } from "../creative-associate/workspace/role-policy.js";
import { compareAssignedTasks } from "./task-order.js";
function rank(task, now) {
  return reportingState(task, now) === "Overdue"
    ? 0
    : task.status === "Changes requested"
      ? 1
      : task.status === "Blocked" && task.blocker?.open !== false
        ? 2
        : 3;
}

export default function TaskList({
  tasks,
  employee,
  view,
  now,
  onOpen,
  viewState = {},
  onViewChange,
}) {
  const creative = employee.activeRole === "creative-communication-associate";
  const creativeArtist =
    employee.gender?.toLowerCase() === "male"
      ? creativeArtistMale
      : employee.gender?.toLowerCase() === "female"
        ? creativeArtistFemale
        : null;
  const { query = "", layout = "grid" } = viewState;
  const setQuery = (query) => onViewChange({ query });
  const summaries = [
    {
      id: "active",
      label: creative ? "Creative work" : "Active work",
      description: "Assigned and in progress",
      icon: LayoutGrid,
      matches: (t) => taskGroup(t) === "work",
    },
    {
      id: "attention",
      label: "Needs your attention",
      description: "Revisions, blockers and overdue work",
      icon: AlertCircle,
      matches: (t) => t.status !== "Completed" && rank(t, now) < 3,
    },
    {
      id: "reviews",
      label: "With reviewers",
      description: "Submitted work awaiting a decision",
      icon: MessageSquare,
      matches: (t) => isInReview(t),
    },
    {
      id: "completed",
      label: creative ? "Approved designs" : "Completed work",
      description: "Reviewed, accepted and closed",
      icon: CheckCheck,
      matches: (t) => t.status === "Completed",
    },
  ];
  const relevant = tasks.filter((t) =>
    view === "work"
      ? true
      : taskGroup(t) === view ||
        (view === "reviews" && t.status === "Changes requested"),
  );
  const shown = relevant
    .filter((t) =>
      `${t.id} ${t.title} ${t.category}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .sort(compareAssignedTasks);
  const copy = {
    work: "Your briefs, feedback and next steps, together.",
    reviews: "Follow submitted work and pick up requested changes.",
    history: "Approved deliverables and their complete work history.",
  };
  return (
    <>
      <div className="page-heading">
        <div>
          {view === "work" ? (
            <EmployeeGreeting employee={employee} now={now} />
          ) : (
            <>
              <h1>{view === "reviews" ? "Reviews" : "Work history"}</h1>
              <p>{copy[view]}</p>
            </>
          )}
        </div>
      </div>
      <div className="work-layout">
        <section className="work-primary" aria-label="Task workspace">
          {view === "work" && (
            <div
              className="design-summary"
              aria-label={creative ? "Creative work overview" : "Work overview"}
            >
              {summaries.map(
                ({ id, label, description, icon: Icon, matches }) => (
                  <div key={id} className="design-summary-card" data-kind={id}>
                    <span className="summary-label">
                      <Icon size={17} />
                      {label}
                    </span>
                    <strong>{tasks.filter(matches).length}</strong>
                    <span className="summary-description">{description}</span>
                    {creative && creativeArtist && id === "completed" && (
                      <img
                        className="summary-creative-artist"
                        src={creativeArtist}
                        alt=""
                        aria-hidden="true"
                        draggable="false"
                      />
                    )}
                  </div>
                ),
              )}
            </div>
          )}
          {view === "work" && creative && (
            <p className="creative-scope">
              Social media & newsletters <span>&middot;</span> Presentations &
              reports <span>&middot;</span> Member materials{" "}
              <span>&middot;</span> Event branding
            </p>
          )}
          <div className="work-list-heading">
            <div>
              <h2>
                {view === "work"
                  ? creative
                    ? "All creative work"
                    : "All my work"
                  : view === "reviews"
                    ? "Review queue"
                    : "Approved work"}
              </h2>
              <span>
                {shown.length} {shown.length === 1 ? "task" : "tasks"} &middot;
                New assignments first
              </span>
            </div>
            <div className="view-switch" aria-label="Work layout">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="List view"
                aria-pressed={layout === "list"}
                onClick={() => onViewChange({ layout: "list" })}
              >
                <List size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Grid view"
                aria-pressed={layout === "grid"}
                onClick={() => onViewChange({ layout: "grid" })}
              >
                <LayoutGrid size={16} />
              </Button>
            </div>
            <div className="task-search">
              <Search size={16} />
              <Input
                aria-label="Search tasks"
                placeholder="Find a task"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                }}
              >
                Show all
              </Button>
            )}
          </div>
          {shown.length ? (
            <div
              className={`task-collection ${layout === "list" ? "task-collection-list" : ""}`}
            >
              {shown.map((task) => (
                <TaskCard key={task.id} task={task} now={now} onOpen={onOpen} />
              ))}
            </div>
          ) : (
            <Blank
              icon={Search}
              title={query ? "No matching work" : "Nothing here yet"}
              text={
                query
                  ? "Try a task title, category or ID."
                  : creative
                    ? "Work will appear here as it moves through the creative workflow."
                    : "Your assigned tasks will appear here."
              }
              action="Show all work"
              onAction={() =>
                onViewChange({
                  filter: "all",
                  query: "",
                  vertical: "",
                  category: "",
                  assigned: "",
                  deadline: "",
                })
              }
            />
          )}
          <p className="work-results">
            {shown.length} of {relevant.length} tasks
            <span>Changes and submissions keep their full history.</span>
          </p>
        </section>
      </div>
    </>
  );
}
