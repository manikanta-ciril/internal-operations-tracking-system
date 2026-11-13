import TeamWorkQueue from "./TeamWorkQueue";
import ManagerTask from "./TaskManagementDetail";
import ReportContents from "./TeamReportDetails";
import { date, terminal } from "./management-presentation";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, FilePlus2, RefreshCw } from "lucide-react";
import { Button } from "../../../shared/work-ui/button";
import { Input } from "../../../shared/work-ui/input";
import { useWorkspaceNavigation } from "../../../shared/workspace/navigation-context";
import { taskApi } from "../task-api";
import TaskAssignmentForm from "./TaskAssignmentForm";
import "./management.css";

export default function TaskManagementPage() {
  const { path, navigate } = useWorkspaceNavigation();
  const [ownerFilter, setOwnerFilter] = useState(""),
    [reviewerFilter, setReviewerFilter] = useState(""),
    [categoryFilter, setCategoryFilter] = useState(""),
    [snapshot, setSnapshot] = useState(null),
    [error, setError] = useState(""),
    [saveNotice, setSaveNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [editingPath, setEditingPath] = useState(""),
    [initialOwner,setInitialOwner] = useState(null),
    [status, setStatus] = useState("All stages");
  const load = useCallback(async () => {
    try {
      setSnapshot(await taskApi());
      setError("");
    } catch (failure) {
      setError(failure.message);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    taskApi("", { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) {
          setSnapshot(value);
          setError("");
        }
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setError(failure.message);
      });
    return () => controller.abort();
  }, [path]);
  const section = path.split("/")[1],
    id = decodeURIComponent(path.split("/")[2] || "");
  const tasks = snapshot?.tasks || [],
    people = snapshot?.employees || [];
  const canManage = snapshot?.permissions?.manage;
  const task = tasks.find((item) => String(item.id) === id);
  const editing = Boolean(task && editingPath === path);
  const person = (value) =>
    people.find((item) => String(item.id) === String(value))?.name ||
    value ||
    "Not assigned";
  async function action(task, name, fields = {}) {
    setBusy(true);
    setError("");
    try {
      const result = await taskApi(
        "/" + encodeURIComponent(task.id) + "/actions",
        { body: { action: name, revision: task.revision, ...fields } },
      );
      setSnapshot((previous) => ({
        ...previous,
        tasks: previous.tasks.map((item) =>
          item.id === result.task.id && result.task.revision >= item.revision
            ? result.task
            : item,
        ),
      }));
      return true;
    } catch (failure) {
      if ([403, 404, 409].includes(failure.status)) await load();
      setError(failure.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  async function uploadReference(files) {
    setBusy(true);
    try {
      for (const file of files) {
        const result = await taskApi(
          "/" + encodeURIComponent(task.id) + "/files",
          { file, headers: { "X-File-Purpose": "reference" } },
        );
        setSnapshot((previous) => ({
          ...previous,
          tasks: previous.tasks.map((item) =>
            item.id === result.task.id ? result.task : item,
          ),
        }));
      }
    } finally {
      setBusy(false);
    }
  }
  async function create(fields, assign, referenceFiles = []) {
    setBusy(true);
    setError("");
    setSaveNotice("");
    let saved;
    try {
      const result =
        editing && task
          ? await taskApi("/" + encodeURIComponent(task.id) + "/actions", {
              body: { action: "edit", revision: task.revision, ...fields },
            })
          : await taskApi("", { body: fields });
      saved = result.task;
      for (const file of referenceFiles) {
        const uploaded = await taskApi(
          "/" + encodeURIComponent(saved.id) + "/files",
          { file, headers: { "X-File-Purpose": "reference" } },
        );
        saved = uploaded.task;
      }
      if (assign) {
        const assigned = await taskApi(
          "/" + encodeURIComponent(saved.id) + "/actions",
          { body: { action: "assign", revision: saved.revision } },
        );
        saved = assigned.task;
      }
      setEditingPath("");
      await load();
      navigate("/team-work/" + encodeURIComponent(saved.id));
    } catch (failure) {
      if (saved) {
        setEditingPath("");
        await load();
        navigate("/team-work/" + encodeURIComponent(saved.id));
        setSaveNotice(
          "The task was saved as a draft and was not assigned. " +
            failure.message +
            " Check its reference files and attach any missing files before assigning.",
        );
      } else setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  const headings = {
    "team-work": "Team work",
    "assign-work": "Assign work",
    "review-queue": "Review queue",
    "work-requests": "Work requests",
    "team-reports": "Team reports",
  };
  const filtered = tasks
    .filter(
      (item) =>
        (!ownerFilter || String(item.ownerId) === ownerFilter) &&
        (!reviewerFilter || String(item.reviewerId) === reviewerFilter) &&
        (!categoryFilter || item.category === categoryFilter) &&
        (section !== "review-queue" ||
          item.status === "In review" ||
          item.status === "Waiting for review" ||
          item.status === "Under review") &&
        (section !== "work-requests" ||
          item.blocker?.open ||
          item.deadlineRequest?.status === "Pending") &&
        (status === "All stages" || item.status === status) &&
        (item.title + " " + item.id + " " + person(item.ownerId))
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        new Date(b.assignedAt || b.createdAt) -
        new Date(a.assignedAt || a.createdAt),
    );
  return (
    <div className="creative-workspace task-management">
      <div className="workspace-page-content">
        {saveNotice && (
          <div className="management-alert" role="alert">
            {saveNotice}
          </div>
        )}
        {error && (
          <div className="management-alert" role="alert">
            {error}
            <Button variant="outline" onClick={load}>
              Refresh saved work
            </Button>
          </div>
        )}
        {!snapshot ? (
          <p role="status">
            {error ? "Work could not load." : "Loading shared work…"}
          </p>
        ) : (
          <>
            <div className="management-heading">
              <div>
                <h1 tabIndex={-1}>
                  {task ? task.title : headings[section] || "Team work"}
                </h1>
                <p>
                  {snapshot.permissions?.oversight
                    ? "Read-only operational visibility. Routine decisions stay with GM and SM."
                    : "Assignments, evidence and decisions in one shared work record."}
                </p>
              </div>
              <div className="management-actions">
                <Button variant="outline" disabled={busy} onClick={load}>
                  <RefreshCw />
                  Refresh
                </Button>
                {canManage && section !== "assign-work" && (
                  <Button onClick={() => { setInitialOwner(task?.ownerId || null); navigate("/assign-work"); }}>
                    <FilePlus2 />
                    {task ? "Assign new work (same employee)" : "Assign work"}
                  </Button>
                )}
              </div>
            </div>
            {section === "assign-work" || editing ? (
              canManage ? (
                <TaskAssignmentForm
                  key={editing ? task.id : `new-${initialOwner || "any"}`}
                  initial={editing ? task : initialOwner ? {ownerId:initialOwner} : {}}
                  directory={people}
                  busy={busy}
                  onSave={create}
                  onCancel={() => {
                    setEditingPath("");
                    navigate("/team-work");
                  }}
                />
              ) : (
                <p role="alert">
                  Only General Manager and Senior Manager can assign work.
                </p>
              )
            ) : task ? (
              <ManagerTask
                key={task.id}
                {...{ task, people, person, canManage, busy, action }}
                currentUser={snapshot.currentUser}
                uploadReference={uploadReference}
                onEdit={() => setEditingPath(path)}
                onBack={() => navigate("/" + section)}
              />
            ) : id ? (
              <p role="alert">
                This task is unavailable in your reporting scope.
              </p>
            ) : section === "team-reports" ? (
              <section className="management-panel">
                <h2>Employee work reports</h2>
                <p>
                  Saved employee reports are shown here. Attendance time is not
                  a performance score.
                </p>
                {snapshot.reports?.length ? (
                  snapshot.reports.map((report, index) => (
                    <article
                      className="management-report"
                      key={report.id || index}
                    >
                      <strong>
                        {report.employeeName ||
                          person(report.employeeId || report.userId)}
                      </strong>
                      <span>{report.date || date(report.createdAt)}</span>
                      <ReportContents
                        report={report.report || report}
                        employee={
                          people.find(
                            (item) => item.id === report.employeeId,
                          ) || {
                            id: report.employeeId,
                            name: person(report.employeeId),
                            role: "Employee",
                          }
                        }
                      />
                    </article>
                  ))
                ) : (
                  <div className="management-empty">
                    No employee reports have been submitted yet.
                  </div>
                )}
              </section>
            ) : (
              <>
                <div className="management-summary">
                  {[
                    [
                      "Assigned work",
                      tasks.filter(
                        (item) => !terminal(item) && item.status !== "Draft",
                      ).length,
                      "/team-work",
                    ],
                    [
                      "Awaiting review",
                      tasks.filter((item) => /review/i.test(item.status))
                        .length,
                      "/review-queue",
                    ],
                    [
                      "Open requests",
                      tasks.filter(
                        (item) =>
                          item.blocker?.open ||
                          item.deadlineRequest?.status === "Pending",
                      ).length,
                      "/work-requests",
                    ],
                    [
                      "Completed",
                      tasks.filter((item) => item.status === "Completed")
                        .length,
                      "/team-work",
                    ],
                  ].map(([label, value, to]) => (
                    <button
                      key={label}
                      onClick={() => {
                        setStatus(
                          label === "Completed" ? "Completed" : "All stages",
                        );
                        navigate(to);
                      }}
                    >
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
                <div className="management-filters">
                  <Input
                    aria-label="Search team work"
                    placeholder="Search task or employee"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                  <select
                    aria-label="Filter work stage"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    {[
                      "All stages",
                      ...new Set(tasks.map((item) => item.status)),
                    ].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                <div className="management-filters">
                  <select
                    aria-label="Filter employee"
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                  >
                    <option value="">All employees</option>
                    {people.map((person) => (
                      <option value={person.id} key={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter reviewer"
                    value={reviewerFilter}
                    onChange={(event) => setReviewerFilter(event.target.value)}
                  >
                    <option value="">All reviewers</option>
                    {people
                      .filter((person) => person.manager)
                      .map((person) => (
                        <option value={person.id} key={person.id}>
                          {person.name}
                        </option>
                      ))}
                  </select>
                  <select
                    aria-label="Filter category"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                  >
                    <option value="">All categories</option>
                    {[
                      ...new Set(
                        tasks.map((task) => task.category).filter(Boolean),
                      ),
                    ].map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <TeamWorkQueue tasks={filtered} person={person} onOpen={item=>navigate("/"+section+"/"+encodeURIComponent(item.id))} />
              </>
            )}
            <p className="management-save-note">
              Shared work records are saved on the server. Original deadlines
              and review history stay attached to each task.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
