import { WorkspaceLink } from "./navigation";
export default function PageHeader({ title, action }) {
  return (
    <div className="page-heading">
      <div>
        <WorkspaceLink className="back-link" to="/">
          Back to dashboard
        </WorkspaceLink>
        <h1 tabIndex={-1}>{title}</h1>
      </div>
      {action}
    </div>
  );
}
