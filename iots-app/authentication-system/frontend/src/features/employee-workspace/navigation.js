export const quickLinks = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/notifications", label: "Notifications", icon: "bell" },
];
export const menuGroups = [
  {
    id: "work",
    label: "Workspace",
    links: [
      { to: "/attendance", label: "Attendance", icon: "calendar" },
      { to: "/tasks", label: "Tasks", icon: "tasks" },
      { to: "/requests", label: "Requests", icon: "request" },
      { to: "/activity", label: "Activity & performance", icon: "chart" },
    ],
  },
  {
    id: "account",
    label: "Account & settings",
    links: [
      { to: "/profile", label: "Profile", icon: "user" },
      { to: "/profile/security", label: "Security & sessions", icon: "lock" },
      { to: "/profile/preferences", label: "Preferences", icon: "settings" },
    ],
  },
];
