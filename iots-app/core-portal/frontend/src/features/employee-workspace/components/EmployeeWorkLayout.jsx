import { useEffect, useState } from "react";
import { ScrollShadow } from "@heroui/scroll-shadow";
import {
  BriefcaseBusiness,
  MessageSquare,
  History,
  CalendarDays,
  ClipboardList,
  AlertTriangle,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  HelpCircle,
  Users,
  FilePlus2,
  ClipboardCheck,
} from "lucide-react";
import { taskCapabilities } from "../../tasks/employee-policy";
import logo from "../../../assets/logo.png";
import WorkspaceHeader from "./WorkspaceHeader";
import { useEmployeeWorkspace } from "../context";
import { useWorkspaceNavigation } from "../../../shared/workspace/navigation-context";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../shared/work-ui/tooltip";
import "../styles/employee-work.css";
import "../../creative-associate/workspace/styles/workspace.css";
const compactLogo = "/img/icon.png";

const personal = [
  ["/attendance", "Attendance", CalendarDays],
  ["/requests", "Requests & approvals", ClipboardList],
  ["/blockers", "Blockers & issues", AlertTriangle],
];
const work = [
  ["/tasks", "My tasks / briefs", BriefcaseBusiness],
  ["/reviews", "Reviews & revisions", MessageSquare],
  ["/history", "Work history", History],
];

function SidebarLink({ entry, collapsed, close }) {
  const { path } = useWorkspaceNavigation();
  const [to, label, Icon] = entry;
  const selected =
    path === to ||
    (to === "/tasks" && path === "/") ||
    path.startsWith(to + "/");
  const link = (
    <WorkspaceLink
      className="native-nav-link"
      to={to}
      aria-label={label}
      aria-current={selected ? "page" : undefined}
      onClick={close}
    >
      <Icon size={18} />
      <span>{label}</span>
    </WorkspaceLink>
  );
  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ) : (
    link
  );
}

export default function EmployeeWorkLayout({ children }) {
  const { user } = useEmployeeWorkspace();
  const capabilities = taskCapabilities(user);
  const { path } = useWorkspaceNavigation();
  const scrollDestination =
    path === "/profile" || path.startsWith("/attendance") ? "/profile" : path;
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [scrollDestination]);
  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ciril-sidebar-state") === "collapsed";
    } catch {
      return false;
    }
  });
  const [mobile, setMobile] = useState(false);
  const toggle = () => setCollapsed((previous) => !previous);
  useEffect(() => {
    document.body.classList.add("ciril-employee-work");
    return () => document.body.classList.remove("ciril-employee-work");
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "ciril-sidebar-state",
        collapsed ? "collapsed" : "expanded",
      );
    } catch {
      /* Navigation remains usable without preference storage. */
    }
  }, [collapsed]);
  useEffect(() => {
    const shortcut = (event) => {
      if (
        event.key === "[" &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.target.closest("input,textarea,select,[contenteditable=true]")
      ) {
        event.preventDefault();
        setCollapsed((previous) => !previous);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const groups = capabilities.employee
    ? [
        ["My work", work],
        ["Personal services", personal],
        ["Reports", [["/report", "Daily work report", FileText]]],
      ]
    : [["Personal services", [["/attendance", "Attendance", CalendarDays]]]];
  if (capabilities.manage)
    groups.push([
      "Work management",
      [
        ["/team-work", "Team work", Users],
        ["/assign-work", "Assign work", FilePlus2],
        ["/review-queue", "Review queue", ClipboardCheck],
        ["/work-requests", "Work requests", ClipboardList],
        ["/team-reports", "Team reports", FileText],
      ],
    ]);
  else if (capabilities.oversight)
    groups.push([
      "Operational oversight",
      [
        ["/team-work", "Team work", Users],
        ["/team-reports", "Team reports", FileText],
      ],
    ]);
  return (
    <TooltipProvider>
      <div
        className={`native-employee-layout ${collapsed ? "native-collapsed" : ""} ${mobile ? "native-mobile-open" : ""}`}
      >
        <aside
          className="native-employee-sidebar"
          aria-label="Employee sidebar"
        >
          <div className="native-sidebar-brand">
            <WorkspaceLink to="/" aria-label="Dashboard">
              <img src={collapsed ? compactLogo : logo} alt="CIRIL" />
            </WorkspaceLink>
            <button
              type="button"
              onClick={toggle}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </div>
          <ScrollShadow className="native-navigation-scroll" size={22}>
            <nav aria-label="Employee workspace">
              {groups.map(([title, entries]) => (
                <section key={title}>
                  {!collapsed && <h2>{title}</h2>}
                  {entries.map((entry) => (
                    <SidebarLink
                      key={entry[0]}
                      entry={entry}
                      collapsed={collapsed}
                      close={() => setMobile(false)}
                    />
                  ))}
                </section>
              ))}
            </nav>
          </ScrollShadow>
          <div className="native-sidebar-footer">
            <SidebarLink
              entry={["/help", "Help & brand kit", HelpCircle]}
              collapsed={collapsed}
              close={() => setMobile(false)}
            />
            {!collapsed && <p>{user.name}</p>}
          </div>
        </aside>
        <div className="native-employee-canvas">
          <div className="native-employee-toolbar">
            <button
              type="button"
              className="native-mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={mobile}
              onClick={() => setMobile((previous) => !previous)}
            >
              <Menu size={20} />
            </button>
            <WorkspaceHeader showBrand={false} />
          </div>
          {children}
        </div>
      </div>
    </TooltipProvider>
  );
}
