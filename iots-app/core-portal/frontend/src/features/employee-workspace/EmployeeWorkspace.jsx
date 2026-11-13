import PageLoading from "../../shared/feedback/PageLoading";
import Icon from "../../shared/workspace/Icon";
import { lazy, Suspense, useEffect, useRef } from "react";
import WorkspaceProvider from "./WorkspaceProvider";
import { useEmployeeWorkspace } from "./context";
import { WorkspaceNavigation } from "../../shared/workspace/navigation";
import { useWorkspaceNavigation } from "../../shared/workspace/navigation-context";
import WorkspaceHeader from "./components/WorkspaceHeader";
const EmployeeWorkLayout = lazy(
  () => import("./components/EmployeeWorkLayout"),
);
const ChatWidget = lazy(() => import("../messaging/ChatWidget"));
import { taskCapabilities } from "../tasks/employee-policy";
import WorkspaceRoutes from "./WorkspaceRoutes";
import "./styles/workspace.css";
import "./styles/profile.css";
import "./styles/menu.css";
import "../../shared/ui/ui.css";

function StandardLayout({ children }) {
  return (
    <>
      <WorkspaceHeader />
      {children}
    </>
  );
}

function Shell({ busy, error }) {
  const {
    user,
    loading,
    error: loadError,
    refresh,
    notice,
    dismissNotice,
  } = useEmployeeWorkspace();
  const { path } = useWorkspaceNavigation();
  const main = useRef(null);
  const previousPath = useRef(path);
  const section =
    path.startsWith("/profile") || path.startsWith("/attendance")
      ? "profile"
      : path.split("/")[1];
  useEffect(() => {
    const previous = previousPath.current;
    previousPath.current = path;
    const inAttendance = (value) =>
      value === "/profile" || value.startsWith("/attendance");
    const inlineAttendance =
      previous !== path &&
      inAttendance(previous) &&
      inAttendance(path) &&
      (previous.startsWith("/attendance") || path.startsWith("/attendance"));
    if (
      !document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const element = main.current?.querySelector(
        inlineAttendance
          ? ".attendance-panel-content"
          : ".workspace-page-content",
      );
      const animation = element?.animate(
        inlineAttendance
          ? [
              { opacity: 0.5, clipPath: "inset(0 0 8px)" },
              { opacity: 1, clipPath: "inset(0)" },
            ]
          : [
              { opacity: 0.5, transform: "translateY(5px)" },
              { opacity: 1, transform: "none" },
            ],
        { duration: 180, easing: "cubic-bezier(.16,1,.3,1)" },
      );
      return () => animation?.cancel();
    }
  }, [path]);
  useEffect(() => {
    if (!loading)
      main.current?.querySelector("h1")?.focus({ preventScroll: true });
  }, [section, loading]);
  const home = path === "/";
  const access = taskCapabilities(user);
  const operational = access.employee || access.oversight;
  const Layout = operational ? EmployeeWorkLayout : StandardLayout;
  return (
    <div
      className={`employee-workspace role-page ${home ? "home-page" : "service-page"} ${operational ? "native-workspace" : ""}`}
    >
      <div className="role-container">
        <Suspense fallback={<PageLoading />}>
          <Layout>
            <a
              href="#employee-main"
              className="skip-link"
              onClick={(event) => {
                event.preventDefault();
                main.current?.focus();
              }}
            >
              Skip to content
            </a>

            <main
              id="employee-main"
              tabIndex={-1}
              ref={main}
              aria-busy={loading || busy}
            >
              <div className="workspace-page-content">
                {error && (
                  <p role="alert" className="error">
                    {error}
                  </p>
                )}
                {loadError && (
                  <div role="alert" className="workspace-load-error">
                    <p>{loadError}</p>
                    <button
                      className="button secondary"
                      onClick={refresh}
                      disabled={loading}
                      aria-busy={loading}
                    >
                      Retry workspace
                    </button>
                  </div>
                )}
                {home ? (
                  <WorkspaceRoutes />
                ) : loading ? (
                  <PageLoading />
                ) : (
                  !loadError && <WorkspaceRoutes />
                )}
              </div>
            </main>
            {notice && (
              <div className="toast" role="status">
                {notice}
                <button
                  type="button"
                  onClick={dismissNotice}
                  aria-label="Dismiss notification"
                >
                  <Icon name="close" size={16} />
                </button>
              </div>
            )}
          </Layout>
        </Suspense>
        <Suspense fallback={null}>
          <ChatWidget key={user.id} />
        </Suspense>
      </div>
    </div>
  );
}
export default function EmployeeWorkspace({
  user,
  onLogout,
  onSessionEnded,
  ...props
}) {
  return (
    <WorkspaceProvider
      user={user}
      busy={props.busy}
      onLogout={onLogout}
      onSessionEnded={onSessionEnded}
    >
      <CombinedWorkspace {...props} />
    </WorkspaceProvider>
  );
}

function CombinedWorkspace(props) {
  const { user } = useEmployeeWorkspace();
  const access = taskCapabilities(user);
  return (
    <WorkspaceNavigation
      role={user.activeRole}
      home={access.oversight ? "/team-work" : access.employee ? "/tasks" : "/"}
    >
      <Shell {...props} />
    </WorkspaceNavigation>
  );
}
