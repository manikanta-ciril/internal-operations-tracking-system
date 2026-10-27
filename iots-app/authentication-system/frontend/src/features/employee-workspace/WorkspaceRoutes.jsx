import NotificationsPage from "../employee-services/NotificationsPage";
import DashboardSections from "./components/DashboardSections";
import { useEmployeeWorkspace } from "./context";
import { WorkspaceLink } from "../../shared/workspace/navigation";
import { useWorkspaceNavigation } from "../../shared/workspace/navigation-context";
import { dashboardComponents } from "../workspace/dashboards";
import ProfilePage from "../employee-profile/ProfilePage";
import ServicePage from "../employee-services/ServicePage";
import ActivityPage from "../employee-services/ActivityPage";
import HelpPage from "../employee-services/HelpPage";
import PageHeader from "../../shared/workspace/PageHeader";

export default function WorkspaceRoutes() {
  const { user } = useEmployeeWorkspace();
  const { path } = useWorkspaceNavigation();
  if (path === "/") {
    const Dashboard = dashboardComponents[user.activeRole];
    return Dashboard ? (
      <>
        <div className="welcome-stage">
          <Dashboard user={user}><DashboardSections /></Dashboard>
        </div>
      </>
    ) : (
      <p role="alert">This workspace is unavailable.</p>
    );
  }
  if (/^\/profile(?:\/(details|security|preferences))?$/.test(path))
    return <ProfilePage />;
  if (/^\/attendance(?:\/\d{4}-\d{2}-\d{2})?$/.test(path))
    return <ProfilePage />;
  if (path === "/notifications") return <NotificationsPage />;
  if (["/tasks", "/requests"].includes(path))
    return <ServicePage service={path.slice(1)} />;
  if (path === "/activity") return <ActivityPage />;
  if (path === "/help") return <HelpPage />;
  return (
    <>
      <PageHeader title="Page not found" />
      <WorkspaceLink to="/">Open dashboard</WorkspaceLink>
    </>
  );
}
