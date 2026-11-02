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
import { workRoute, workPath, hasEmployeeWork } from "./employee-policy";
import { useTheme } from "../../shared/theme/useTheme";

export default function TaskWorkspacePage() {
  const { user, roleLabel } = useEmployeeWorkspace();
  const { path, navigate } = useWorkspaceNavigation();
  const [dark] = useTheme();
  const employee = useMemo(
    () => ({ ...user, role: roleLabel }),
    [user, roleLabel],
  );
  const repository = useMemo(() => createTaskStorage(employee), [employee]);
  const [snapshot, setSnapshot] = useState(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(() => new Date());
  const [viewMemory, setViewMemory] = useState({});
  const currentState = useRef(null);
  const saving = useRef(false);
  const current = workRoute(path) || { view: "work", id: null };
  useEffect(() => {
    let live = true;
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
  }, [repository, revision]);
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
        const saved = await repository.save(changed);
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
  if (!hasEmployeeWork(user.activeRole))
    return <p role="alert">This role does not have a personal work report.</p>;
  if (!snapshot)
    return (
      <div role={error ? "alert" : "status"}>
        {error || "Loading your work…"}
        {error && (
          <button
            className="button secondary"
            onClick={() => setRevision((count) => count + 1)}
          >
            Retry
          </button>
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
          {error && (
            <p role="alert">{error} Your previous saved work is retained.</p>
          )}
          {content}
          {current.view === "report" && (
            <p className="local-work-notice">
              Recipients: General Manager / Senior Manager / Executive. Reports
              and evidence stay on this device until server delivery is
              connected.
            </p>
          )}
          <p className="local-work-notice">
            Work records saved on this browser. Review delivery is not connected
            to the server.
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
