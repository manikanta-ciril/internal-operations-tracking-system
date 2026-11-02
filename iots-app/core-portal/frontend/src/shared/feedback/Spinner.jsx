export default function Spinner({ className = "" }) {
  return (
    <span className={`feedback-spinner ${className}`} aria-hidden="true" />
  );
}
