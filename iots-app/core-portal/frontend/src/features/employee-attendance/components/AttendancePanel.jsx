import Panel from "../../../shared/workspace/Panel";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import { useWorkspaceNavigation } from "../../../shared/workspace/navigation-context";
import AttendancePage from "../AttendancePage";
import AttendanceHeatmap from "./AttendanceHeatmap";

// Keep the heatmap mounted so its range survives opening details and returning.
export default function AttendancePanel() {
  const { path } = useWorkspaceNavigation();
  const detailed = path.startsWith("/attendance");
  return (
    <Panel
      title="Office attendance"
      className="attendance-overview-panel"
      action={
        <WorkspaceLink
          className="text-link"
          to={detailed ? "/profile" : "/attendance"}
          aria-controls="attendance-panel-content"
        >
          {detailed ? "Back to overview" : "View details"}
        </WorkspaceLink>
      }
    >
      <div
        id="attendance-panel-content"
        className="attendance-panel-content"
        data-view={detailed ? "details" : "overview"}
      >
        <div hidden={detailed}>
          <AttendanceHeatmap />
        </div>
        {detailed && (
          <section
            id="attendance-details"
            className="attendance-details"
            aria-label="Attendance day details"
          >
            <AttendancePage />
          </section>
        )}
      </div>
    </Panel>
  );
}
