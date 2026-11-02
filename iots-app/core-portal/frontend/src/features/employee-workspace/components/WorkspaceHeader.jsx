import WorkClock from "./WorkClock";
import NotificationBell from "./NotificationBell";
import logo from "../../../assets/logo.png";
import ThemeToggle from "../../../shared/components/ThemeToggle";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import AvailabilityMenu from "./AvailabilityMenu";
import ProfileMenu from "./ProfileMenu";

export default function WorkspaceHeader({ showBrand = true }) {
  return (
    <header className="workspace-header">
      {showBrand && <WorkspaceLink to="/" className="workspace-brand" aria-label="Dashboard">
        <img src={logo} alt="CIRIL" />
        <span>Internal operations</span>
      </WorkspaceLink>}
      <div className="employee-tools">
        <WorkClock />
        <AvailabilityMenu />
        <ThemeToggle inline />
        <NotificationBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
