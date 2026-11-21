import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import TaskList from "./TaskList";
import TaskPage from "./TaskPage";
import ReportPage from "../daily-report/ReportPage";
import WorkspaceServices from "../creative-associate/workspace/WorkspaceServices";
import { RoleContext } from "../creative-associate/workspace/RoleContext";
import { rolePolicy } from "../creative-associate/workspace/role-policy";
import { Toaster } from "../../shared/work-ui/sonner";
import { TooltipProvider } from "../../shared/work-ui/tooltip";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import { useWorkspaceNavigation } from "../../shared/workspace/navigation-context";
import { createTaskStorage } from "./storage";
import { workRoute, workPath, taskCapabilities } from "./employee-policy";
import { useTheme } from "../../shared/theme/useTheme";
import { taskApi, taskCommand } from "./task-api.js";
import { Button } from "../../shared/work-ui/button.jsx";

export default function TaskWorkspacePage() {
  const { user, roleLabel } = useEmployeeWorkspace();
  const { path, navigate } = useWorkspaceNavigation();
  const [dark] = useTheme();
  const employee = useMemo(
    () => ({ ...user, role: roleLabel }),
    [user, roleLabel],
  );
  const [browserOnly, setBrowserOnly] = useState(false);
  const repository = useMemo(
    () => createTaskStorage(employee, browserOnly),
    [employee, browserOnly],
  );
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [viewMemory, setViewMemory] = useState({});
  const currentState = useRef(null);
  const saving = useRef(false);
  const activeRepository = useRef(repository);
  const current = workRoute(path) || { view: "work", id: null };
  useEffect(() => {
    let live = true;
    activeRepository.current = repository;
    currentState.current = null;
    // Clear the previous account/archive while its replacement loads from external storage.
    // eslint-disable-next-line react/set-state-in-effect
    setSnapshot(null);
    repository
      .load()
      .then((workspace) => {
        if (live) {
          currentState.current = workspace;
          setSnapshot(workspace);
          setError("");
        }
      })
      .catch((failure) => {
        if (live) setError(failure.message);
      });
    return () => {
      live = false;
    };
  }, [repository, revision, path]);
  const acceptTask = (updated) => {
    if (!currentState.current) return;
    const saved = {
      ...currentState.current,
      tasks: currentState.current.tasks.map((item) =>
        item.id === updated.id && updated.revision >= item.revision
          ? updated
          : item,
      ),
    };
    currentState.current = saved;
    setSnapshot(saved);
  };
  async function command(action, values) {
    if (saving.current)
      throw new Error("Another update is saving. Try again shortly.");
    const currentTask = currentState.current?.tasks.find(
      (item) => item.id === current.id,
    );
    if (!currentTask) throw new Error("Reload this task before continuing.");
    saving.current = true;
    const originalRepository = repository;
    try {
      const result = await taskCommand(currentTask, action, values);
      if (activeRepository.current === originalRepository) {
        acceptTask(result.task);
        setError("");
        toast.success("Work record saved.");
      }
    } catch (failure) {
      if (activeRepository.current === originalRepository) {
        if (failure.status === 409) {
          try {
            const fresh = await taskApi(
              `/${encodeURIComponent(currentTask.id)}`,
            );
            acceptTask(fresh.task);
          } catch {
            /* Keep the existing record and unsaved form when refresh fails. */
          }
        }
        setError(failure.message);
      }
      throw failure;
    } finally {
      saving.current = false;
    }
  }
  async function uploadTaskProof(file, purpose = "evidence") {
    const task = currentState.current?.tasks.find(
      (item) => item.id === current.id,
    );
    if (!task) throw new Error("Reload this task before uploading evidence.");
    const originalRepository = repository;
    const result = await taskApi(`/${encodeURIComponent(task.id)}/files`, {
      file,
      headers: { "X-File-Purpose": purpose },
    });
    if (activeRepository.current === originalRepository)
      acceptTask(result.task);
    return { ...result.file, server: true };
  }
  const uploadReportProof = async (file) => {
    const result = await taskApi("/report-files", { file });
    return { ...result.file, server: true };
  };
  async function saveReport(report, submit) {
    if (saving.current)
      throw new Error("Another update is saving. Try again shortly.");
    saving.current = true;
    const originalRepository = repository;
    try {
      const record = await repository.saveDailyReport(report, submit);
      if (activeRepository.current !== originalRepository) return;
      const saved = {
        ...currentState.current,
        manualReports: {
          ...currentState.current.manualReports,
          [record.date]: record,
        },
      };
      currentState.current = saved;
      setSnapshot(saved);
      setError("");
      return saved;
    } finally {
      saving.current = false;
    }
  }
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);
  const mutate = useCallback(
    async (change, message) => {
      if (saving.current)
        throw new Error("Another update is saving. Try again shortly.");
      saving.current = true;
      try {
        const changed = structuredClone(currentState.current);
        change(changed);
        if (
          changed.serverBacked &&
          JSON.stringify(changed.tasks) !==
            JSON.stringify(currentState.current.tasks)
        )
          throw new Error(
            "Task updates must use their validated work action. Reload and try again.",
          );
        const saved = await repository.save(changed);
        if (activeRepository.current !== repository) return saved;
        currentState.current = saved;
        setSnapshot(saved);
        setError("");
        if (message) toast.success(message);
        return saved;
      } catch (failure) {
        setError(failure.message);
        throw failure;
      } finally {
        saving.current = false;
      }
    },
    [repository],
  );
  if (!taskCapabilities(user).employee)
    return <p role="alert">This role does not have a personal work report.</p>;
  if (!snapshot)
    return (
      <div role={error ? "alert" : "status"}>
        {error || "Loading your work…"}
        {error && (
          <>
            <button
              className="button secondary"
              onClick={() => setRevision((count) => count + 1)}
            >
              Retry
            </button>
            <Button
              variant="outline"
              onClick={() => setBrowserOnly((value) => !value)}
            >
              {browserOnly ? "Open shared work" : "Open browser archive"}
            </Button>
          </>
        )}
      </div>
    );
  const open = (view) => navigate(workPath(view));
  const task = snapshot.tasks.find((task) => task.id === current.id);
  let content;
  if (current.id)
    content = task ? (
      <TaskPage
        key={task.id}
        task={task}
        employee={employee}
        now={now}
        mutate={mutate}
        onBack={() => open(current.view)}
        backLabel="Back to my work"
        command={browserOnly ? undefined : command}
        uploadProof={browserOnly ? undefined : uploadTaskProof}
      />
    ) : (
      <p>Task unavailable in your workspace.</p>
    );
  else if (current.view === "report")
    content = (
      <ReportPage
        state={snapshot}
        employee={employee}
        now={now}
        mutate={mutate}
        onBack={() => navigate("/")}
        uploadProof={browserOnly ? undefined : uploadReportProof}
        saveReport={browserOnly ? undefined : saveReport}
      />
    );
  else if (["requests", "blockers", "scope"].includes(current.view))
    content = (
      <WorkspaceServices
        view={current.view}
        tasks={snapshot.tasks}
        onBack={() => navigate("/")}
        onOpen={(id) => open(`work/${id}`)}
      />
    );
  else
    content = (
      <TaskList
        tasks={snapshot.tasks}
        employee={employee}
        now={now}
        view={current.view}
        viewState={viewMemory[current.view]}
        onViewChange={(patch) =>
          setViewMemory((previous) => ({
            ...previous,
            [current.view]: { ...previous[current.view], ...patch },
          }))
        }
        onOpen={(id) => open(`${current.view}/${id}`)}
      />
    );
  return (
    <RoleContext.Provider value={rolePolicy(snapshot)}>
      <TooltipProvider>
        <div className="native-work-content">
          <div className="task-storage-toolbar">
            <span>
              {browserOnly ? "Browser work archive" : "Shared work records"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBrowserOnly((value) => !value);
                navigate("/tasks");
              }}
            >
              {browserOnly ? "Open shared work" : "Open browser archive"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevision((count) => count + 1)}
            >
              Refresh work
            </Button>
          </div>
          {error && (
            <p role="alert">{error} Your previous saved work is retained.</p>
          )}
          {content}
          {current.view === "report" && (
            <p className="local-work-notice">
              Recipients: {snapshot.workspace.reportAudience.join(" / ")}.{" "}
              {browserOnly
                ? "Reports and evidence stay on this device."
                : "Submitted reports are available to authorised reviewers in the portal. Email delivery is not configured."}
            </p>
          )}
          <p className="local-work-notice">
            {browserOnly
              ? "Browser records are preserved separately. They are not imported into shared work."
              : "Work records and evidence are saved securely on the IOTS server."}
          </p>
        </div>
        <Toaster
          theme={dark ? "dark" : "light"}
          position="bottom-right"
          closeButton
        />
      </TooltipProvider>
    </RoleContext.Provider>
  );
}
