import Popover from "../../../shared/ui/Popover";
import Icon from "../../../shared/workspace/Icon";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import { useEmployeeWorkspace } from "../context";
import { NotificationList } from "../../employee-services/NotificationsPage";
export default function NotificationBell() {
  const { notifications } = useEmployeeWorkspace();
  return (
    <Popover
      label="Notifications"
      hover
      className="notifications-popover"
      trigger={
        <button
          className="notification-trigger icon-button"
          aria-label={`Notifications, ${notifications.unread} unread`}
        >
          <Icon name="bell" />
          {notifications.unread > 0 && (
            <span className="notification-count">
              {notifications.unread > 99 ? "99+" : notifications.unread}
            </span>
          )}
        </button>
      }
    >
      {(close) => (
        <>
          <div className="notification-heading">
            <h2>Notifications</h2>
            <span>{notifications.unread} unread</span>
          </div>
          <NotificationList compact />
          <WorkspaceLink
            className="notification-view-all"
            to="/notifications"
            onClick={close}
          >
            View all notifications
            <Icon name="arrow" size={14} />
          </WorkspaceLink>
        </>
      )}
    </Popover>
  );
}
