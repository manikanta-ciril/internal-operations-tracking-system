import Spinner from "../../../shared/feedback/Spinner";
import Icon from "../../../shared/workspace/Icon";
import AccountActivity from "../../employee-services/AccountActivity";
import { useEmployeeWorkspace } from "../context";

export default function DashboardSections() {
  const { data, loading, error } = useEmployeeWorkspace();
  return (
    <div className="dashboard-work" aria-label="Your work">
      <section
        aria-labelledby="dashboard-tasks"
        className="dashboard-work-section dashboard-work-tasks"
      >
        <div className="dashboard-work-heading">
          <Icon name="tasks" />
          <h2 id="dashboard-tasks">Tasks</h2>
        </div>
        <div className="dashboard-section-empty">
          <Icon name="tasks" size={32} />
          <strong>Your assigned work belongs here</strong>
          <p>Task assignments will appear when task management is enabled.</p>
        </div>
      </section>
      <section
        aria-labelledby="dashboard-requests"
        className="dashboard-work-section dashboard-work-requests"
      >
        <div className="dashboard-work-heading">
          <Icon name="request" />
          <h2 id="dashboard-requests">Requests</h2>
        </div>
        <div className="dashboard-request-empty">
          <p>Self-service requests are not available yet.</p>
          <p>Contact your manager for assistance.</p>
        </div>
      </section>
      <section
        aria-labelledby="dashboard-activity"
        className="dashboard-work-section dashboard-work-activity"
      >
        <div className="dashboard-work-heading">
          <Icon name="chart" />
          <h2 id="dashboard-activity">Activity &amp; performance</h2>
        </div>
        {loading ? (
          <p role="status" className="inline-loading"><Spinner/>Loading your activity...</p>
        ) : error ? (
          <p>Activity could not be loaded. Use Retry workspace above.</p>
        ) : (
          <div
            className="dashboard-activity-feed"
            tabIndex={0}
            role="region"
            aria-label="Recent account activity"
          >
            <AccountActivity items={data?.activity} />
          </div>
        )}
        <p className="dashboard-performance-note">
          Performance targets and task-effort records have not been configured.
        </p>
      </section>
    </div>
  );
}
