import Spinner from "../../shared/feedback/Spinner";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import PageHeader from "../../shared/workspace/PageHeader";
import Button from "../../shared/workspace/Button";
export function NotificationList({ compact = false }) {
  const { notifications: state } = useEmployeeWorkspace();
  const [items, error] = [state.notifications, state.error];
  return (
    <div className="notification-list">
      {state.loading ? (
        <p role="status" className="inline-loading"><Spinner/>Loading notifications...</p>
      ) : error ? (
        <p role="alert">
          {error} <Button secondary loading={state.refreshing} onClick={state.refresh}>Retry</Button>
        </p>
      ) : items.length ? (
        items.map((item) => (
          <article
            key={item.id}
            className={`notification-item ${item.readAt ? "" : "unread"}`}
          >
            <strong>{item.title}</strong>
            <p>{item.message}</p>
            <time>
              {new Date(item.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              IST
            </time>
            {!item.readAt && !compact && (
              <button
                className="text-link"
                disabled={state.updating}
                aria-busy={state.updating || undefined}
                onClick={() =>
                  state.markRead([item.id]).catch(state.reportError)
                }
              >
                {state.updating && <Spinner/>}Mark as read
              </button>
            )}
          </article>
        ))
      ) : (
        <div className="notification-empty">
          <strong>You're all caught up</strong>
          <p>Account and security updates will appear here.</p>
        </div>
      )}
    </div>
  );
}
export default function NotificationsPage() {
  const { notifications } = useEmployeeWorkspace();
  return (
    <>
      <PageHeader
        title="Notifications"
        action={
          <Button
            secondary
            disabled={!notifications.unread}
            loading={notifications.updating}
            onClick={() =>
              notifications
                .markRead(
                  notifications.notifications
                    .filter((n) => !n.readAt)
                    .map((n) => n.id),
                )
                .catch(notifications.reportError)
            }
          >
            Mark all shown as read
          </Button>
        }
      />
      <NotificationList />
    </>
  );
}
