import { useEmployeeWorkspace } from "../../employee-workspace/context";
import Panel from "../../../shared/workspace/Panel";
import DataList from "../../../shared/workspace/DataList";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import AttendancePanel from "../../employee-attendance/components/AttendancePanel";
import { dateKey, timeLabel } from "../../employee-attendance/model";

export default function Overview() {
  const { user, data, roleLabel } = useEmployeeWorkspace();
  const today = data.punches.filter(
    (record) => dateKey(record.punchIn) === dateKey(),
  );
  return (
    <>
      <AttendancePanel />
      <div className="profile-overview-details">
        <Panel title="Work details">
          <DataList
            items={[
              ["Current role", roleLabel],
              [
                "Assigned roles",
                user.roles.map((role) => role.label).join(", "),
              ],
              ["Working days", "Monday–Saturday"],
              ["Time zone", "Asia/Kolkata (IST)"],
            ]}
          />
          <WorkspaceLink className="text-link spaced" to="/profile/details">
            All profile details
          </WorkspaceLink>
        </Panel>
        <Panel title="Today’s office punches">
          <DataList
            items={[
              ["Punch in", timeLabel(today.at(-1)?.punchIn)],
              ["Latest punch out", timeLabel(today[0]?.punchOut)],
              ["Recorded sessions", String(today.length)],
            ]}
          />
          <p className="quiet">
            Punch spans are separate from approved attendance hours and task
            effort.
          </p>
        </Panel>
        <Panel title="Account">
          <DataList
            items={[
              ["Username", user.username],
              ["Email", user.email],
              ["Active sessions", String(data.sessions.length)],
              ["Availability", data.settings.availability.status],
            ]}
          />
          <WorkspaceLink to="/profile/security" className="text-link spaced">
            Review sessions
          </WorkspaceLink>
        </Panel>
      </div>
    </>
  );
}
