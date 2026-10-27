import Empty from "../../shared/workspace/Empty";
import { TIMEZONE } from "../employee-attendance/model";

const labels = {
  remote_session_started: "WFH session started",
  remote_session_ended: "WFH session ended",
  password_updated: "Password updated",
  session_taken_over: "Sign-in moved to another device",
  photo_evidence_accepted: "Punch-in recorded",
  checkout_completed: "Punch-out recorded",
  workspace_profile_updated: "Profile updated",
  workspace_availability_updated: "Availability updated",
  workspace_preferences_updated: "Preferences updated",
  workspace_avatar_updated: "Profile photo updated",
};
export default function AccountActivity({ items = [] }) {
  return <>
        {items.length ? (
          <ol className="timeline">
            {items.map((event) => (
              <li key={event.id}>
                <strong>{labels[event.event] || "Account activity"}</strong>
                <small>
                  {new Date(event.occurredAt).toLocaleString("en-IN", {
                    timeZone: TIMEZONE,
                  })}{" "}
                  IST
                </small>
              </li>
            ))}
          </ol>
        ) : (
          <Empty>No account activity to show.</Empty>
        )}
  </>;
}
