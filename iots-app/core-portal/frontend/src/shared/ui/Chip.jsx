export default function Chip({ icon, children, className = "" }) {
  return (
    <span className={`ui-chip ${className}`}>
      {icon && (
        <span className="ui-chip-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </span>
  );
}
