import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../../authentication-system/frontend/src/features/employee-workspace/styles/workspace.css";
import "../../authentication-system/frontend/src/shared/ui/ui.css";
import "./workspace.css";
import logo from "../../authentication-system/frontend/src/assets/logo.png";
import { defaultActor } from "./seed";
import { api } from "./api";
import type { Snapshot, Actor, Screen } from "./types";
import {
  AppContext,
  Button,
  Icon,
  Avatar,
  ThemeToggle,
  Popover,
  Tooltip,
  Loading,
  Empty,
  ActionDialog,
  type Action,
  type DrawerTarget,
} from "./ui";
import { Home } from "./home";
import { People } from "./people";
import { Tasks, Attendance, Announcements } from "./operations";
import { Reports, Audit, SettingsPage } from "./governance";
import { Drawers } from "./drawers";
import { announcementAction } from "./actions";
const navigation: { id: Screen; name: string; icon: string; group: string }[] =
  [
    { id: "home", name: "Home", icon: "dashboard", group: "Workspace" },
    {
      id: "people",
      name: "User Management",
      icon: "users",
      group: "People & organisation",
    },
    {
      id: "tasks",
      name: "Global Task Oversight",
      icon: "tasks",
      group: "Operations oversight",
    },
    {
      id: "attendance",
      name: "Location & Attendance",
      icon: "location",
      group: "Operations oversight",
    },
    {
      id: "announcements",
      name: "Global Announcements",
      icon: "bell",
      group: "Communication",
    },
    {
      id: "reports",
      name: "Reports & Intelligence",
      icon: "chart",
      group: "Intelligence & governance",
    },
    {
      id: "audit",
      name: "Security & Audit Viewer",
      icon: "lock",
      group: "Intelligence & governance",
    },
    {
      id: "settings",
      name: "System Settings",
      icon: "settings",
      group: "Intelligence & governance",
    },
  ];
const route = (): Screen =>
  navigation.some((n) => n.id === location.hash.slice(1))
    ? (location.hash.slice(1) as Screen)
    : "home";
function App() {
  const [data, setData] = useState<Snapshot | null>(null),
    [actor, setActor] = useState<Actor>(defaultActor),
    [screen, setScreen] = useState<Screen>(route),
    [loading, setLoading] = useState(true),
    [failure, setFailure] = useState(""),
    [notice, setNotice] = useState(""),
    [state, setState] = useState("Normal"),
    [action, setAction] = useState<Action | null>(null),
    [drawer, setDrawer] = useState<DrawerTarget | null>(null),
    [mobile, setMobile] = useState(false),
    [collapsed, setCollapsed] = useState(false),
    [closed, setClosed] = useState(false);
  async function refresh() {
    setData(await api.readWorkspace(actor));
  }
  async function perform(task: () => Promise<unknown>) {
    await task();
    await refresh();
    setNotice(
      "Saved in this preview. The reason and before/after values were recorded.",
    );
  }
  function navigate(next: Screen) {
    location.hash = next;
    setState("Normal");
    setMobile(false);
  }
  useEffect(() => {
    let live = true;
    setLoading(true);
    api
      .readWorkspace(actor)
      .then((d) => {
        if (live) {
          setData(d);
          setFailure("");
        }
      })
      .catch((e) => {
        if (live) setFailure(e.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [actor]);
  useEffect(() => {
    const change = () => {
      setScreen(route());
      setMobile(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAction(null);
        setDrawer({ kind: "search" });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    document
      .querySelector<HTMLElement>("main h1")
      ?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [screen]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 5500);
    return () => clearTimeout(t);
  }, [notice]);
  if (closed)
    return (
      <div className="employee-workspace gw gw-closed">
        <Empty
          title="Preview session closed"
          description="No live account was signed out. Your example changes remain in this browser."
          action={
            <Button onClick={() => setClosed(false)}>Reopen preview</Button>
          }
        />
      </div>
    );
  if (!data)
    return (
      <div className="employee-workspace gw gw-initial">
        {failure ? (
          <Empty
            title="Workspace could not load"
            description={failure}
            action={<Button onClick={() => location.reload()}>Retry</Button>}
          />
        ) : (
          <Loading />
        )}
      </div>
    );
  const currentActor = {
    ...actor,
    name:
      data.employees.find((e) => e.id === actor.employeeId)?.name || actor.name,
  };
  const count = (id: Screen) =>
    id === "people"
      ? data.employees.length
      : id === "tasks"
        ? data.tasks.filter((t) => t.state !== "Completed & Closed").length
        : id === "attendance"
          ? data.attendance.filter((a) => a.flag).length
          : id === "announcements"
            ? data.announcements.length
            : id === "home"
              ? data.changes.filter((c) => c.status === "Awaiting").length
              : 0;
  const content =
    screen === "home" ? (
      <Home />
    ) : screen === "people" ? (
      <People />
    ) : screen === "tasks" ? (
      <Tasks />
    ) : screen === "attendance" ? (
      <Attendance />
    ) : screen === "announcements" ? (
      <Announcements />
    ) : screen === "reports" ? (
      <Reports />
    ) : screen === "audit" ? (
      <Audit />
    ) : (
      <SettingsPage />
    );
  return (
    <AppContext.Provider
      value={{
        data,
        actor: currentActor,
        screen,
        navigate,
        refresh,
        perform,
        edit: setAction,
        open: setDrawer,
        notice: setNotice,
      }}
    >
      <div
        className={`employee-workspace gw ${collapsed ? "gw-collapsed" : ""}`}
      >
        <a
          className="gw-skip"
          href="#workspace-main"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("workspace-main")?.focus();
          }}
        >
          Skip to content
        </a>
        <header className="gw-header">
          <div className="gw-header-brand">
            <button
              className="gw-mobile-menu"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              onClick={() => setMobile(!mobile)}
            >
              <Icon name="menu" />
            </button>
            <a href="#home">
              <img src={logo} alt="CIRIL" />
            </a>
            <span>
              Internal Operations
              <br />
              Tracking System (IOTS)
            </span>
          </div>
          <button
            className="gw-command"
            aria-label="Open command search"
            onClick={() => setDrawer({ kind: "search" })}
          >
            <Icon name="search" size={16} />
            <span>Find people, tasks, records…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="gw-header-actions">
            <Tooltip content="Create an announcement from any screen">
              <Button
                aria-label="Create announcement from any screen"
                secondary
                icon="plus"
                onClick={() => setAction(announcementAction(data, actor))}
              >
                Announcement
              </Button>
            </Tooltip>
            <button
              className="gw-icon-button"
              aria-label="Recent exports"
              onClick={() => setDrawer({ kind: "exports" })}
            >
              <Icon name="download" />
            </button>
            <ThemeToggle inline />
            <button
              className="gw-icon-button gw-notification-button"
              aria-label="Open notifications"
              onClick={() => setDrawer({ kind: "notifications" })}
            >
              <Icon name="bell" />
              {data.notices.filter(
                (n) => n.recipientId === actor.employeeId && !n.read,
              ).length > 0 && (
                <span>
                  {
                    data.notices.filter(
                      (n) => n.recipientId === actor.employeeId && !n.read,
                    ).length
                  }
                </span>
              )}
            </button>
            <Popover
              label="Account menu"
              trigger={
                <button
                  className="gw-avatar-button"
                  aria-label="Open account menu"
                >
                  <Avatar name={currentActor.name} />
                </button>
              }
            >
              {(close: () => void) => (
                <div className="gw-popover-menu">
                  <strong>{currentActor.name}</strong>
                  <small>{actor.activeRole}</small>
                  <button
                    onClick={() => {
                      close();
                      setDrawer({ kind: "profile", id: actor.employeeId });
                    }}
                  >
                    Account settings
                  </button>
                  <button
                    onClick={async () => {
                      close();
                      try {
                        await api.closePreviewSession(actor);
                        await refresh();
                        setClosed(true);
                      } catch (e) {
                        setNotice((e as Error).message);
                      }
                    }}
                  >
                    Log out of preview
                  </button>
                </div>
              )}
            </Popover>
          </div>
        </header>
        <aside className={`gw-sidebar ${mobile ? "is-open" : ""}`}>
          <div className="gw-workspace-label">
            <span>Super Admin</span>
            <small>Platform governance</small>
          </div>
          <nav aria-label="Super Admin workspace">
            {navigation.map((n, i) => (
              <div key={n.id}>
                {navigation[i - 1]?.group !== n.group && (
                  <p className="gw-nav-group">{n.group}</p>
                )}
                <a
                  href={`#${n.id}`}
                  title={collapsed ? n.name : undefined}
                  aria-current={screen === n.id ? "page" : undefined}
                  onClick={() => {
                    setState("Normal");
                    setMobile(false);
                  }}
                >
                  <Icon name={n.icon} size={18} />
                  <span>{n.name}</span>
                  {count(n.id) > 0 && <small>{count(n.id)}</small>}
                </a>
              </div>
            ))}
          </nav>
          <div className="gw-sidebar-footer">
            <Icon name="lock" size={16} />
            <p>
              Platform controls.
              <br />
              Business decisions stay with managers.
            </p>
          </div>
          <button
            className="gw-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon name="menu" size={16} />
            <span>{collapsed ? "Expand" : "Collapse sidebar"}</span>
          </button>
        </aside>
        {mobile && (
          <button
            className="gw-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <div className="gw-workspace">
          <div className="gw-context-bar">
            <div>
              <span className="gw-preview-badge">Interactive preview</span>
              <span>Example data · changes stay in this browser</span>
            </div>
            <Popover
              label="Active workspace"
              trigger={
                <button className="gw-role-chip">
                  <Icon name="user" size={14} />
                  {actor.activeRole}
                  <Icon name="chevron" size={12} />
                </button>
              }
            >
              {(close: () => void) => (
                <div className="gw-popover-menu">
                  <strong>Switch active workspace</strong>
                  {(["Super Admin", "IT System Analyst"] as const).map(
                    (role) => (
                      <button
                        key={role}
                        aria-pressed={role === actor.activeRole}
                        onClick={async () => {
                          close();
                          try {
                            const next = await api.switchRole(actor, role);
                            setActor(next);
                            setNotice(`Active workspace: ${role}`);
                          } catch (e) {
                            setNotice((e as Error).message);
                          }
                        }}
                      >
                        {role}
                      </button>
                    ),
                  )}
                  <small>Equal platform privileges. No business mandate.</small>
                </div>
              )}
            </Popover>
          </div>
          <main id="workspace-main" tabIndex={-1}>
            {loading || state === "Loading" ? (
              <Loading />
            ) : state === "Empty" ? (
              <Empty
                title="No records in this view"
                description="Your real records will appear here once connected."
                action={
                  <Button onClick={() => setState("Normal")}>
                    Load example records
                  </Button>
                }
              />
            ) : state === "Error" ? (
              <Empty
                title="This view could not load"
                description="Your changes have been kept. Try loading the view again."
                action={
                  <Button onClick={() => setState("Normal")}>Retry</Button>
                }
              />
            ) : state === "Restricted" ? (
              <Empty
                title="Outside your data scope"
                description="Ask the platform owner for the required access."
                action={
                  <Button secondary onClick={() => setState("Normal")}>
                    Return to example scope
                  </Button>
                }
              />
            ) : (
              <div key={screen} className="gw-page">
                {content}
              </div>
            )}
          </main>
          <footer className="gw-footer">
            <span>
              CIRIL · Platform governance preview · No live CRM or account
              changes
            </span>
            <label>
              Preview state{" "}
              <select
                aria-label="Page preview state"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {["Normal", "Loading", "Empty", "Error", "Restricted"].map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </label>
          </footer>
        </div>
        {notice && (
          <div className="gw-toast" role="status">
            <Icon name="check" size={16} />
            <span>{notice}</span>
            <button aria-label="Dismiss message" onClick={() => setNotice("")}>
              <Icon name="close" size={15} />
            </button>
          </div>
        )}
        {drawer && !action && (
          <Drawers
            key={`${drawer.kind}-${drawer.id || ""}`}
            target={drawer}
            onClose={() => setDrawer(null)}
          />
        )}
        {action && (
          <ActionDialog
            key={action.title}
            action={action}
            onClose={() => setAction(null)}
          />
        )}
      </div>
    </AppContext.Provider>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
