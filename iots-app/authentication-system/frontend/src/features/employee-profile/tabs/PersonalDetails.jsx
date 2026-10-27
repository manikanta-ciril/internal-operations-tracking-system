import { useEmployeeWorkspace } from "../../employee-workspace/context";
import Panel from "../../../shared/workspace/Panel";
import DataList from "../../../shared/workspace/DataList";

export default function PersonalDetails() {
  const { user, data, roleLabel } = useEmployeeWorkspace();
  const profile = data.settings.profile;
  const missing = (value) => value || "Not provided";
  return (
    <div className="two-columns">
      <Panel title="Identity & contact">
        <DataList
          items={[
            ["Employee ID", String(user.id)],
            ["Full name", user.name],
            ["Preferred name", missing(profile.preferred)],
            ["Username", user.username],
            ["Official email", user.email],
            ["Phone / extension", missing(profile.phone)],
            ["Personal email", missing(profile.personal)],
          ]}
        />
      </Panel>
      <Panel title="Roles & work arrangements">
        <DataList
          items={[
            ["Current workspace", roleLabel],
            ["Assigned roles", user.roles.map((role) => role.label).join(", ")],
            ["Working days", "Monday–Saturday"],
            ["Timezone", data.policy.timezone],
            ["Department", missing(user.department)],
            ["Reporting manager", missing(user.manager)],
            ["Shift", missing(user.shift)],
          ]}
        />
      </Panel>
      <Panel title="Organisation & employment">
        <DataList
          items={[
            ["Team", missing(user.team)],
            ["Branch", missing(user.branch)],
            ["Office", missing(user.office)],
            ["Joining date", missing(user.joined)],
          ]}
        />
      </Panel>
      <Panel title="Controlled details">
        <p>
          Contact your administrator to correct your official name, email, role,
          department or reporting manager.
        </p>
        <p className="quiet">
          Organisation fields appear when they have been assigned to your
          account.
        </p>
      </Panel>
    </div>
  );
}
