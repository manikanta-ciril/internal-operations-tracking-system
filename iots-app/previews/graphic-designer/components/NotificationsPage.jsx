import { Bell, ArrowUpRight } from "lucide-react";
import PageHeading from "./PageHeading";
import { Blank } from "./WorkspaceUI";
import { cn } from "../lib/utils";
export default function NotificationsPage({ notifications, onNotification, onBack }) {
  return (
    <section className="utility-page">
      <PageHeading
        title="Notifications"
        description="Work updates and report reminders, together."
        onBack={onBack}
      />
      <div className="notification-list">
        {notifications.length ? (
          notifications.map((n) => (
            <button
              className="notification-item"
              key={n.id}
              onClick={() => onNotification(n)}
            >
              <span className={cn("notification-mark", !n.read && "is-unread")}>
                <Bell size={16} />
              </span>
              <span>
                <strong>{n.title}</strong>
                <p>{n.text}</p>
                <small>
                  {n.kind === "report" ? "Private report reminder" : "Work update"}
                </small>
              </span>
              <ArrowUpRight size={16} />
            </button>
          ))
        ) : (
          <Blank
            title="You're all caught up"
            text="New review updates and reminders will appear here."
          />
        )}
      </div>
    </section>
  );
}
