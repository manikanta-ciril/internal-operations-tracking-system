import { createContext, useContext, useState } from "react";
import { Button as HeroButton, Chip, ProgressBar } from "@heroui/react";
import SharedIcon from "../../authentication-system/frontend/src/shared/workspace/Icon";
import Field from "../../authentication-system/frontend/src/shared/workspace/Field";
import Dialog from "../../authentication-system/frontend/src/shared/workspace/Dialog";
import Tooltip from "../../authentication-system/frontend/src/shared/ui/Tooltip";
import Popover from "../../authentication-system/frontend/src/shared/ui/Popover";
import Avatar from "../../authentication-system/frontend/src/shared/workspace/Avatar";
import ThemeToggle from "../../authentication-system/frontend/src/shared/components/ThemeToggle";
export { Field, Dialog, Tooltip, Popover, Avatar, ThemeToggle };
export const PreviewContext = createContext(null);
export const usePreview = () => useContext(PreviewContext);
export function Icon({ name, size = 20 }) {
  const extra = {
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7h2m4 0h2M8 11h2m4 0h2M10 21v-5h4v5" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3m0-16a3 3 0 0 1 0 6m3 3a6 6 0 0 1 3 5" />
      </>
    ),
    location: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V3h8v4M3 12c5 4 13 4 18 0m-9 1v4" />
      </>
    ),
    layers: (
      <>
        <path d="m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5" />
      </>
    ),
    link: (
      <>
        <path d="m10 14 4-4m-6 6-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
  };
  return extra[name] ? (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {extra[name]}
    </svg>
  ) : (
    <SharedIcon name={name} size={size} />
  );
}
export function Button({
  children,
  onClick,
  secondary = false,
  icon,
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <HeroButton
      {...props}
      type={type}
      isDisabled={disabled}
      onPress={onClick}
      className={`sa-button ${secondary ? "sa-button-secondary" : ""}`}
    >
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
    </HeroButton>
  );
}
export function Status({ children, done = false }) {
  return (
    <Chip className={`sa-status ${done ? "is-done" : ""}`}>
      <Chip.Label>{children}</Chip.Label>
    </Chip>
  );
}
export function Progress({ value, label = "Company setup" }) {
  return (
    <ProgressBar aria-label={label} value={value} className="sa-progress">
      <ProgressBar.Track className="sa-progress-track">
        <ProgressBar.Fill className="sa-progress-fill" />
      </ProgressBar.Track>
    </ProgressBar>
  );
}
export function PageTitle({ title, description, action }) {
  return (
    <div className="sa-page-title">
      <div>
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  );
}
export function Section({ title, description, children, action }) {
  return (
    <section className="sa-section">
      <div className="sa-section-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Empty({ icon = "layers", title, children, action }) {
  return (
    <div className="sa-empty">
      <span className="sa-empty-icon">
        <Icon name={icon} size={26} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
      {action}
    </div>
  );
}
export function Form({
  children,
  onSave,
  label = "Save changes",
  cancel,
  onCancel,
}) {
  const [error, setError] = useState("");
  return (
    <form
      className="sa-form"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        try {
          for (const field of event.currentTarget.querySelectorAll(
            "[required]",
          )) {
            if (!field.value.trim()) {
              field.focus();
              throw Error("Complete the required fields before saving.");
            }
          }
          onSave(new FormData(event.currentTarget));
        } catch (e) {
          setError(e.message);
        }
      }}
    >
      {children}
      {error && (
        <p className="sa-error" role="alert">
          {error}
        </p>
      )}
      <div className="sa-form-actions">
        {cancel && (
          <Button secondary onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" icon="check">
          {label}
        </Button>
        <span>Saved only in this browser</span>
      </div>
    </form>
  );
}
export function Input({
  label,
  name,
  value = "",
  type = "text",
  required = false,
  hint,
  ...props
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        {...props}
        name={name}
        defaultValue={value}
        type={type}
        required={required}
      />
    </Field>
  );
}
export function Select({
  label,
  name,
  value = "",
  children,
  required = false,
  hint,
}) {
  return (
    <Field label={label} hint={hint}>
      <select name={name} defaultValue={value} required={required}>
        <option value="">Choose an option</option>
        {children}
      </select>
    </Field>
  );
}
export function Table({ columns, rows, render }) {
  return (
    <div className="sa-table-scroll">
      <table className="sa-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(render)}</tbody>
      </table>
    </div>
  );
}
export function BackLink({ to = "home", children = "Back to overview" }) {
  const { navigate } = usePreview();
  return (
    <button type="button" className="sa-back" onClick={() => navigate(to)}>
      <span>
        <Icon name="arrow" size={14} />
      </span>
      {children}
    </button>
  );
}
export const values = (data) =>
  Object.fromEntries(
    [...data.entries()].map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  );
