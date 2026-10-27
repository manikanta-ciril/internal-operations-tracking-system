import Spinner from "../feedback/Spinner";
export default function Button({
  children,
  onClick,
  secondary = false,
  loading = false,
  disabled = false,
  className = "",
  ...rest
}) {
  return (
    <button
      {...rest}
      className={`button ${secondary ? "secondary" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {loading && <Spinner />}
      <span className="button-label">{children}</span>
    </button>
  );
}
