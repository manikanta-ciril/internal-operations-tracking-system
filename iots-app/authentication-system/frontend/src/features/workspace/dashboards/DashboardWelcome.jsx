import Icon from "../../../shared/workspace/Icon";

export default function DashboardWelcome({ user, role }) {
  const status =
    user.location?.status === "onsite"
      ? "On-site session"
      : user.location?.status === "offsite"
        ? "Off-site session"
        : "Location unknown";
  return (
    <header className="dashboard-welcome">
      <div className="dashboard-welcome-heading">
        <h1 id="dashboard-title" tabIndex={-1}>
          Welcome back, <span>{user.name}.</span>
        </h1>
        <p>{role}</p>
      </div>
      <div className="dashboard-welcome-context">
        <span className="welcome-status">
          <span />
          {status}
        </span>
        <span className="dashboard-welcome-label">
          <Icon name="dashboard" size={15} />
          Your workspace
        </span>
      </div>
    </header>
  );
}
