import Popover from "../../../shared/ui/Popover";
import Avatar from "../../../shared/workspace/Avatar";
import Icon from "../../../shared/workspace/Icon";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import { useEmployeeWorkspace } from "../context";
import { useTheme } from "../../../shared/theme/useTheme";
export default function ProfileMenu() {
  const { user, avatar, onLogout, busy } = useEmployeeWorkspace();
  const [dark, setDark] = useTheme();
  return (
    <Popover
      label="Profile menu"
      className="profile-popover"
      trigger={
        <button className="profile-trigger" aria-label="Open profile menu">
          <Avatar name={user.name} src={avatar} />
        </button>
      }
    >
      {(close) => (
        <>
          <div className="menu-identity">
            <Avatar name={user.name} src={avatar} />
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>
          <nav aria-label="Account">
            <WorkspaceLink
              to="/profile"
              className="account-menu-item"
              onClick={close}
            >
              <Icon name="user" />
              Profile
            </WorkspaceLink>
            <WorkspaceLink to="/" className="account-menu-item" onClick={close}>
              <Icon name="dashboard" />
              Dashboard
            </WorkspaceLink>
            <WorkspaceLink to="/profile/preferences" className="account-menu-item" onClick={close}>
              <Icon name="settings" />Preferences
            </WorkspaceLink>
            <WorkspaceLink
              to="/help"
              className="account-menu-item"
              onClick={close}
            >
              <Icon name="help" />
              Help
            </WorkspaceLink>
            <button
              className="account-menu-item menu-action"
              onClick={() => setDark(!dark)}
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Icon name={dark ? "sun" : "moon"} />
              {dark ? "Light mode" : "Dark mode"}
            </button>
          </nav>
          <div className="account-footer">
            <button
              className="account-menu-item menu-action"
              disabled={busy}
              aria-busy={busy || undefined}
              onClick={() => {
                close();
                onLogout();
              }}
            >
              <Icon name="logout" />
              Log out
            </button>
          </div>
        </>
      )}
    </Popover>
  );
}
