import WorkspaceServices from "./components/WorkspaceServices";
import { RoleContext } from "./RoleContext";
import { rolePolicy, reportAudienceLabel } from "./role-policy";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Bell, ArrowRight, AlertCircle } from "lucide-react";
import WorkspaceShell from "./components/WorkspaceShell";
import TaskList, { taskGroup } from "./components/TaskList";
import TaskPage from "./components/TaskPage";
import ReportPage from "./components/ReportPage";
import AccountPage from "./components/AccountPage";
import NotificationsPage from "./components/NotificationsPage";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Skeleton } from "./components/ui/skeleton";
import { TooltipProvider } from "./components/ui/tooltip";
import { Blank } from "./components/WorkspaceUI";
import { workspaceApi } from "./api";
import { employeeProfile, reportingState } from "./workflow";
import { dailyReport, istDate, reportReminder, shiftFor } from "./model";

function route(path = location.hash.slice(1)) {
  const [view, id] = path.split("/");
  return {
    view: [
      "assets",
      "scope",
      "attendance",
      "requests",
      "blockers",
      "messages",
      "standing",
      "work",
      "reviews",
      "history",
      "report",
      "preferences",
      "profile",
      "help",
      "notifications",
    ].includes(view)
      ? view
      : "work",
    id: id || null,
  };
}
export default function WorkspaceApp({ api = workspaceApi }) {
  const [state, setState] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [now, setNow] = useState(() => new Date()),
    [current, setCurrent] = useState(route),
    [viewMemory, setViewMemory] = useState({}),
    [demo, setDemo] = useState(false),
    [theme, setTheme] = useState(() => {
      try {
        return localStorage.getItem("ciril-designer-theme") || "light";
      } catch {
        return "light";
      }
    });
  const currentState = useRef(null),
    saving = useRef(false),
    autoAttempt = useRef(""),
    notified = useRef(""),
    hasNavigated = useRef(false),
    returnTo = useRef("work"),
    scrollPositions = useRef({}),
    activePath = useRef(location.hash.slice(1) || "work");
  const pageKey = `${current.view}${current.id ? "/" + current.id : ""}`;
  useLayoutEffect(() => {
    if (!state) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositions.current[pageKey] || 0);
      const title = document.querySelector("main h1");
      if (title) {
        title.tabIndex = -1;
        title.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [pageKey, !!state]);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const next = await api.load();
      currentState.current = next;
      setState(next);
    } catch (e) {
      setError(
        e instanceof SyntaxError
          ? "Saved data could not be read. Your original browser data is preserved."
          : e.message,
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    const timer = setInterval(() => setNow(new Date()), 30000);
    const change = () => {
      scrollPositions.current[activePath.current] = window.scrollY;
      activePath.current = location.hash.slice(1) || "work";
      hasNavigated.current = true;
      setCurrent(route());
    };
    window.addEventListener("hashchange", change);
    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", change);
    };
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("ciril-designer-theme", theme);
    } catch {
      toast.error("Theme preference could not be saved on this device.");
    }
  }, [theme]);
  async function mutate(change, message) {
    if (saving.current)
      throw Error("Another update is still saving. Try again in a moment.");
    saving.current = true;
    try {
      const next = structuredClone(currentState.current);
      change(next);
      await api.save(next);
      currentState.current = next;
      setState(next);
      setError("");
      if (message) toast.success(message);
      return next;
    } catch (e) {
      setError("Your change was not saved. " + e.message);
      throw e;
    } finally {
      saving.current = false;
    }
  }
  const employee = state ? employeeProfile(state) : null,
    date = istDate(now),
    shift = shiftFor(now),
    reminder = !!state && (demo || reportReminder(state, now)),
    report = state ? dailyReport(state, date) : null;
  useEffect(() => {
    if (
      !reminder ||
      typeof Notification === "undefined" ||
      Notification.permission !== "granted" ||
      notified.current === date
    )
      return;
    notified.current = date;
    try {
      const n = new Notification("Your daily report is ready", {
        body: "Review your work summary before your shift ends.",
        tag: `ciril-report-${date}`,
      });
      n.onclick = () => {
        window.focus();
        location.hash = "report";
        n.close();
      };
    } catch {
      toast.info(
        "Your in-app report reminder is ready. Desktop delivery is unavailable.",
      );
    }
  }, [reminder, date]);
  const navigate = (view) => {
    location.hash = view;
  };
  const openUtility = (view) => {
    if (
      !["preferences", "profile", "help", "notifications", "report"].includes(
        current.view,
      )
    )
      returnTo.current = pageKey;
    navigate(view);
  };
  const notifications = state
    ? state.tasks
        .filter(
          (t) =>
            t.status === "Changes requested" ||
            t.status === "Blocked" ||
            reportingState(t, now) === "Overdue",
        )
        .map((t) => ({
          id: `${t.id}-${t.status}-${t.events.length}`,
          taskId: t.id,
          title: t.title,
          text:
            t.status === "Changes requested"
              ? `${t.returnedBy} requested changes.`
              : t.status === "Blocked"
                ? t.blocker?.open === false
                  ? "Input received. You can resume work."
                  : "Waiting for input."
                : "Deadline passed. Manager action is needed.",
          kind: "work",
        }))
    : [];
  if (reminder)
    notifications.unshift({
      id: `report-${date}`,
      title: "Review your daily report",
      text: `Private to you, ${reportAudienceLabel(rolePolicy(state))}.`,
      kind: "report",
    });
  notifications.forEach((n) => {
    n.read = state.readNotifications?.includes(n.id);
  });
  const counts = state
    ? {
        assets: state.tasks.reduce(
          (n, t) => n + t.versions.length + (t.workingDrafts?.length || 0),
          0,
        ),
        requests: state.tasks.filter(
          (t) => t.deadlineRequest?.status === "Awaiting manager decision",
        ).length,
        blockers: state.tasks.filter((t) => t.blocker?.open).length,
        work: state.tasks.filter((t) => taskGroup(t) === "work").length,
        reviews: state.tasks.filter(
          (t) => taskGroup(t) === "reviews" || t.status === "Changes requested",
        ).length,
        history: state.tasks.filter((t) => taskGroup(t) === "history").length,
      }
    : {};
  const task = state?.tasks.find((t) => t.id === current.id);
  if (!state)
    return (
      <TooltipProvider>
        <div className="initial-state">
          {loading ? (
            <div aria-label="Loading workspace" role="status">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="mt-6 h-12 w-full" />
              <Skeleton className="mt-3 h-64 w-full" />
              <span className="sr-only">Loading workspace</span>
            </div>
          ) : (
            <Blank
              icon={AlertCircle}
              title="We couldn't open this workspace"
              text={error}
              action="Try again"
              onAction={load}
            />
          )}
        </div>
      </TooltipProvider>
    );
  let content;
  if (current.id) {
    content = task ? (
      <TaskPage
        key={task.id}
        task={task}
        employee={employee}
        now={now}
        mutate={mutate}
        onBack={() => navigate(current.view)}
        backLabel={`Back to ${{ reviews: "reviews", history: "work history", notifications: "notifications" }[current.view] || "my work"}`}
      />
    ) : (
      <Blank
        title="Task not found"
        text="This task is not available in your workspace."
        action="Back to work"
        onAction={() => navigate("work")}
      />
    );
  } else if (current.view === "report")
    content = (
      <ReportPage
        state={state}
        employee={employee}
        now={now}
        mutate={mutate}
        onBack={() => navigate(returnTo.current)}
      />
    );
  else if (["preferences", "profile", "help"].includes(current.view))
    content = (
      <AccountPage
        key={current.view}
        kind={current.view === "preferences" ? "settings" : current.view}
        employee={employee}
        onBack={() => navigate(returnTo.current)}
        onDemoReminder={() => {
          setDemo(true);
          navigate("work");
        }}
      />
    );
  else if (current.view === "notifications")
    content = (
      <NotificationsPage
        notifications={notifications}
        onBack={() => navigate(returnTo.current)}
        onNotification={openNotification}
      />
    );
  else if (
    [
      "assets",
      "scope",
      "attendance",
      "requests",
      "blockers",
      "messages",
      "standing",
    ].includes(current.view)
  )
    content = (
      <WorkspaceServices
        onBack={() => navigate("work")}
        key={current.view}
        view={current.view}
        tasks={state.tasks}
        onOpen={(id) => navigate(`${current.view}/${id}`)}
      />
    );
  else
    content = (
      <TaskList
        employee={employee}
        tasks={state.tasks}
        view={current.view}
        now={now}
        viewState={viewMemory[current.view]}
        onViewChange={(patch) =>
          setViewMemory((saved) => ({
            ...saved,
            [current.view]: { ...saved[current.view], ...patch },
          }))
        }
        onOpen={(id) => navigate(`${current.view}/${id}`)}
      />
    );
  function openNotification(n) {
    mutate((s) => {
      if (!s.readNotifications.includes(n.id)) s.readNotifications.push(n.id);
    }).catch((e) => toast.error(e.message));
    navigate(n.kind === "report" ? "report" : `notifications/${n.taskId}`);
  }
  return (
    <RoleContext.Provider value={rolePolicy(state)}>
      <TooltipProvider>
        <WorkspaceShell
          employee={employee}
          view={current.view}
          onNavigate={(view) => (view === "report" ? openUtility(view) : navigate(view))}
          counts={counts}
          now={now}
          settings={state.settings}
          saveSettings={(patch) =>
            mutate(
              (s) => Object.assign(s.settings, patch),
              "Availability updated.",
            ).catch((e) => toast.error(e.message))
          }
          theme={theme}
          toggleTheme={() => setTheme((x) => (x === "dark" ? "light" : "dark"))}
          notifications={notifications}
          onSettings={() => openUtility("preferences")}
          onProfile={() => openUtility("profile")}
          onHelp={() => openUtility("help")}
          onNotifications={() => openUtility("notifications")}
        >
          <div
            className="page-transition"
            data-animate={hasNavigated.current}
            key={pageKey}
            data-page={current.id ? "task" : current.view}
          >
            {error && (
              <Alert variant="destructive" className="save-error">
                <AlertCircle />
                <AlertTitle>Save needs attention</AlertTitle>
                <AlertDescription>
                  {error} Your previous saved data is retained. Retry the action after
                  checking browser storage.
                </AlertDescription>
              </Alert>
            )}
            {reminder && current.view !== "report" && (
              <Alert className="report-reminder">
                <Bell />
                <AlertTitle>Your daily report is ready to review</AlertTitle>
                <AlertDescription>
                  <span>
                    {demo
                      ? "Reminder preview"
                      : shift.end && now < shift.end
                        ? "Your shift ends soon."
                        : "Your scheduled shift has ended."}{" "}
                    Your work summary is prepared.
                  </span>
                  <div>
                    <Button size="sm" onClick={() => openUtility("report")}>
                      Review report
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        mutate((s) => {
                          s.settings.snoozedUntil = new Date(
                            now.getTime() + 600000,
                          ).toISOString();
                        }, "Reminder snoozed for 10 minutes.")
                          .then(() => setDemo(false))
                          .catch((e) => toast.error(e.message))
                      }
                    >
                      In 10 minutes
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {content}
          </div>
        </WorkspaceShell>
        <Toaster theme={theme} position="bottom-right" closeButton />
      </TooltipProvider>
    </RoleContext.Provider>
  );
}
