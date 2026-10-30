import creativeArtistFemale from "../assets/creative-artist-female.svg";
import creativeArtistMale from "../assets/creative-artist-male.svg";
import EmployeeGreeting, { isOperationalEmployeeRole } from "../employee-greetings";

import {
  Search,
  LayoutGrid,
  List,
  AlertCircle,
  MessageSquare,
  CheckCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Blank } from "./WorkspaceUI";
import TaskCard from "./TaskCard";
import { reportingState } from "../workflow";
import { isInReview } from "../role-policy";
export function taskGroup(t) {
  return t.status === "Completed" ? "history" : isInReview(t) ? "reviews" : "work";
}
function rank(t, now) {
  return reportingState(t, now) === "Overdue"
    ? 0
    : t.status === "Changes requested"
      ? 1
      : t.status === "Blocked" && t.blocker?.open !== false
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
  const creativeArtist =
    employee.gender?.toLowerCase() === "male" ? creativeArtistMale : creativeArtistFemale;
  const { query = "", layout = "grid" } = viewState;
  const setQuery = (query) => onViewChange({ query });
  const summaries = [
    {
      id: "active",
      label: "Creative work",
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
      description: "Submitted designs awaiting a decision",
      icon: MessageSquare,
      matches: (t) => isInReview(t),
    },
    {
      id: "completed",
      label: "Approved designs",
      description: "Reviewed, accepted and closed",
      icon: CheckCheck,
      matches: (t) => t.status === "Completed",
    },
  ];
  const relevant = tasks.filter((t) =>
    view === "work"
      ? true
      : taskGroup(t) === view || (view === "reviews" && t.status === "Changes requested"),
  );
  const shown = relevant
    .filter((t) =>
      `${t.id} ${t.title} ${t.category}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => rank(a, now) - rank(b, now) || new Date(a.due) - new Date(b.due));
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
            isOperationalEmployeeRole(employee) ? (
              <EmployeeGreeting employee={employee} now={now} />
            ) : (
              <>
                <h1>My work</h1>
                <p>Assigned operational priorities and active tasks.</p>
              </>
            )
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
            <div className="design-summary" aria-label="Creative work overview">
              {summaries.map(({ id, label, description, icon: Icon, matches }) => (
                <div key={id} className="design-summary-card" data-kind={id}>
                  <span className="summary-label">
                    <Icon size={17} />
                    {label}
                  </span>
                  <strong>{tasks.filter(matches).length}</strong>
                  <span className="summary-description">{description}</span>
                  {id === "completed" && (
                    <img
                      className="summary-creative-artist"
                      src={creativeArtist}
                      alt=""
                      aria-hidden="true"
                      draggable="false"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
          {view === "work" && (
            <p className="creative-scope">
              Social media & newsletters <span>&middot;</span> Presentations & reports{" "}
              <span>&middot;</span> Member materials <span>&middot;</span> Event branding
            </p>
          )}
          <div className="work-list-heading">
            <div>
              <h2>
                {view === "work"
                  ? "All creative work"
                  : view === "reviews"
                    ? "Review queue"
                    : "Approved work"}
              </h2>
              <span>
                {shown.length} {shown.length === 1 ? "task" : "tasks"} &middot; Attention
                first
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
                  : "Work will appear here as it moves through the creative workflow."
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
