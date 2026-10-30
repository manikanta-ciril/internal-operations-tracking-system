import { ScrollShadow } from "@heroui/scroll-shadow";
import SidebarTooltip from "./SidebarTooltip";
import {
  LayoutList,
  CalendarDays,
  ClipboardList,
  AlertTriangle,
  MessageSquare,
  History,
  FileText,
  Bell,
  Sun,
  Moon,
  UserRound,
  ChevronDown,
  Settings2,
  HelpCircle,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import logo from "../../../authentication-system/frontend/src/assets/logo.png";
import compactLogo from "../../../authentication-system/frontend/public/img/icon.png";
import { Button } from "./ui/button";

import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "./ui/dropdown-menu";
import { IconButton } from "./WorkspaceUI";
import { availabilityOptions } from "../api";
import { shiftFor } from "../model";

import { cn } from "../lib/utils";
import { useEffect, useState } from "react";

export const navigationGroups = [
  {
    id: "creative",
    label: "Creative operations",
    items: [
      { id: "work", label: "My tasks / briefs", icon: LayoutList },
      { id: "reviews", label: "Reviews & revisions", icon: MessageSquare },
      { id: "history", label: "Work history", icon: History },
    ],
  },
  {
    id: "personal",
    label: "Personal services",
    items: [
      { id: "attendance", label: "Attendance", icon: CalendarDays },
      { id: "requests", label: "Requests & approvals", icon: ClipboardList },
      { id: "blockers", label: "Blockers & issues", icon: AlertTriangle },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [{ id: "report", label: "Daily work report", icon: FileText }],
  },
];
export const navigation = navigationGroups.flatMap((group) => group.items);
function Navigation({ view, onNavigate, counts, compact = false }) {
  return (
    <nav aria-label="Workspace navigation">
      {navigationGroups.map((group) => (
        <section className="sidebar-nav-group" key={group.id}>
          {!compact && <h2 className="sidebar-section-heading">{group.label}</h2>}
          {group.items.map(({ id, label, icon: Icon }) => (
            <SidebarTooltip key={id} label={label} collapsed={compact}>
              <button
                type="button"
                aria-label={label}
                className={cn("nav-item", view === id && "nav-active")}
                aria-current={view === id ? "page" : undefined}
                onClick={() => onNavigate(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
                {counts[id] > 0 && <span className="nav-count">{counts[id]}</span>}
              </button>
            </SidebarTooltip>
          ))}
        </section>
      ))}
    </nav>
  );
}
export default function WorkspaceShell({
  children,
  employee,
  view,
  onNavigate,
  counts,
  now,
  settings,
  saveSettings,
  theme,
  toggleTheme,
  notifications,
  onNotification,
  onSettings,
  onProfile,
  onHelp,
  onNotifications,
}) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return (
        (localStorage.getItem("ciril-sidebar-state") ||
          localStorage.getItem("ciril-designer-sidebar")) === "collapsed"
      );
    } catch {
      return false;
    }
  });
  const toggleSidebar = () =>
    setCollapsed((previous) => {
      const next = !previous;
      try {
        localStorage.setItem("ciril-sidebar-state", next ? "collapsed" : "expanded");
      } catch {
        /* Navigation remains usable when storage is unavailable. */
      }
      return next;
    });
  useEffect(() => {
    function shortcut(event) {
      if (
        event.key !== "[" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.target.closest(
          "input,textarea,select,[contenteditable=true],[role=combobox]",
        )
      )
        return;
      event.preventDefault();
      toggleSidebar();
    }
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(false), [view]);
  const shift = shiftFor(now),
    minutes = shift.end ? Math.max(0, Math.ceil((shift.end - now) / 60000)) : null;
  return (
    <div className={cn("workspace-shell", collapsed && "sidebar-collapsed")}>
      <aside className="workspace-sidebar" id="workspace-sidebar">
        <Button
          className="sidebar-collapse"
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls="workspace-sidebar"
          onClick={toggleSidebar}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </Button>
        <a
          href="#work"
          className="brand brand-favicon"
          onClick={() => onNavigate("work")}
          aria-label="CIRIL Internal Operations Tracking System"
        >
          <img src={collapsed ? compactLogo : logo} alt="CIRIL" />
        </a>
        <ScrollShadow className="sidebar-navigation-scroll" size={22}>
          <Navigation
            view={view}
            onNavigate={onNavigate}
            counts={counts}
            compact={collapsed}
          />
        </ScrollShadow>
        <div className="sidebar-footer">
          <SidebarTooltip label="Preferences" collapsed={collapsed}>
            <button className="nav-item" aria-label="Preferences" onClick={onSettings}>
              <Settings2 size={18} />
              <span>Preferences</span>
            </button>
          </SidebarTooltip>
          <SidebarTooltip label="Help & brand kit" collapsed={collapsed}>
            <button className="nav-item" aria-label="Help & brand kit" onClick={onHelp}>
              <HelpCircle size={18} />
              <span>Help & brand kit</span>
            </button>
          </SidebarTooltip>
          <div className="sidebar-identity">
            <Avatar>
              <AvatarFallback>
                <UserRound size={17} />
              </AvatarFallback>
            </Avatar>
            <div>
              <strong>{employee.name}</strong>
              <span>{employee.role}</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="workspace-body">
        <header className="workspace-header">
          <div className="header-left">
            <Button
              variant="ghost"
              size="icon"
              className="mobile-menu"
              aria-label="Open navigation"
              aria-expanded={mobile}
              onClick={() => setMobile((x) => !x)}
            >
              <Menu />
            </Button>
            <span>Internal Operations</span>
            <span className="header-slash">/</span>
            <strong>
              {navigation.find((x) => x.id === view)?.label ||
                {
                  preferences: "Preferences",
                  profile: "Profile",
                  help: "Help & brand kit",
                  notifications: "Notifications",
                }[view] ||
                "My work"}
            </strong>
          </div>
          <div className="header-actions">
            <div className="header-clock">
              <strong>
                {now.toLocaleTimeString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                <small> IST</small>
              </strong>
              <span>
                {minutes === null
                  ? "No shift scheduled"
                  : minutes === 0
                    ? "Scheduled shift ended"
                    : `${Math.floor(minutes / 60)}h ${minutes % 60}m until shift ends`}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Change availability">
                  <span className="availability-dot" />
                  {settings.availability}
                  <ChevronDown data-icon="inline-end" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Your availability</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={settings.availability}
                    onValueChange={(v) => saveSettings({ availability: v })}
                  >
                    {availabilityOptions.map((x) => (
                      <DropdownMenuRadioItem key={x} value={x}>
                        {x}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <IconButton
              label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              icon={theme === "dark" ? Sun : Moon}
              onClick={toggleTheme}
            />
            <div className="bell-wrap">
              <IconButton
                label="Open notifications"
                icon={Bell}
                onClick={onNotifications}
              />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className="unread-dot" />
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open profile">
                  <Avatar>
                    <AvatarFallback>
                      <UserRound size={17} />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{employee.name}</DropdownMenuLabel>
                  <DropdownMenuItem onSelect={onProfile}>
                    <UserRound />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onSettings}>
                    <Settings2 />
                    Preferences
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={onHelp}>
                    <HelpCircle />
                    Help & brand kit
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        {mobile && (
          <div className="mobile-navigation">
            <Navigation
              view={view}
              counts={counts}
              onNavigate={(id) => {
                onNavigate(id);
                setMobile(false);
              }}
            />
          </div>
        )}
        <main className="workspace-main">{children}</main>
        <footer className="workspace-disclaimer">
          <span className="preview-dot" />
          Interactive preview · Example work · Saved on this device
        </footer>
      </div>
    </div>
  );
}
