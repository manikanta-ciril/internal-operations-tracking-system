import Spinner from "./Spinner";
export default function PageLoading({ label = "Loading your workspace" }) {
  return (
    <div className="page-loading" role="status" aria-label={label}>
      <div className="page-loading-caption">
        <Spinner />
        <span>{label}…</span>
      </div>
      <div className="page-loading-preview" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
