import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type ComponentType,
  cloneElement,
  isValidElement,
  type ReactElement,
} from "react";
import {
  Button as SharedButton,
  Icon as SharedIcon,
  Status,
  Progress,
  Dialog,
  Popover,
  Tooltip,
  Avatar as SharedAvatar,
  ThemeToggle,
} from "../super-admin/components";
import type {
  Actor,
  Snapshot,
  Screen,
  Filters as FilterValues,
  ExportView,
} from "./types";
import { api } from "./api";
export const Button = SharedButton as ComponentType<{
  children: ReactNode;
  icon?: string;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}>;
export const Avatar = SharedAvatar as ComponentType<{
  name?: string;
  src?: string;
  large?: boolean;
}>;
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const path =
    name === "chevron" ? (
      <path d="m6 9 6 6 6-6" />
    ) : name === "flag" ? (
      <>
        <path d="M5 21V3m0 1c5-3 9 3 14 0v10c-5 3-9-3-14 0" />
      </>
    ) : null;
  return path ? (
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
      {path}
    </svg>
  ) : (
    <SharedIcon name={name} size={size} />
  );
}
export { Status, Progress, Dialog, Popover, Tooltip, ThemeToggle };
export interface FormField {
  name: string;
  label: string;
  type?: string;
  options?: (string | { value: string; label: string })[];
  required?: boolean;
  hint?: string;
}
export interface Action {
  title: string;
  description?: string;
  fields: FormField[];
  initial?: Record<string, string>;
  before?: unknown;
  submit: (values: Record<string, string>, reason: string) => Promise<unknown>;
}
export interface DrawerTarget {
  kind:
    | "profile"
    | "task"
    | "issue"
    | "exports"
    | "notifications"
    | "search"
    | "announcement";
  id?: string;
}
export const AppContext = createContext<null | {
  data: Snapshot;
  actor: Actor;
  screen: Screen;
  navigate: (screen: Screen) => void;
  refresh: () => Promise<void>;
  perform: (task: () => Promise<unknown>) => Promise<void>;
  edit: (action: Action) => void;
  open: (target: DrawerTarget) => void;
  notice: (message: string) => void;
}>(null);
export const useApp = () => useContext(AppContext)!;
export function AvailabilityChip({ name }: { name: string }) {
  const { data } = useApp(),
    status = data.settings.statuses.find((s) => s.name === name);
  return (
    <span
      className="gw-availability"
      data-appearance={status?.appearance || "Neutral"}
      title={`Availability: ${name}`}
    >
      <Status>{status?.label || name}</Status>
    </span>
  );
}
export function AnimatedNumber({ value }: { value: number }) {
  const [number, setNumber] = useState(value);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / 220);
      setNumber(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{number}</>;
}
export const time = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";
export function Heading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="gw-heading">
      <div>
        <h1 tabIndex={-1}>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      <div className="gw-actions">{actions}</div>
    </div>
  );
}
export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`gw-card ${className}`}>
      <header>
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
export function Empty({
  title = "Nothing here yet",
  description = "Try another filter or add your first record.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="gw-empty">
      <span>
        <Icon name="layers" size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Loading() {
  return (
    <div className="gw-loading" role="status" aria-label="Loading workspace">
      <span className="gw-skeleton gw-skeleton-title" />
      <div>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="gw-skeleton" />
        ))}
      </div>
      <span className="gw-skeleton gw-skeleton-panel" />
      <span className="sr-only">Loading records…</span>
    </div>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label,
  panelId,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  panelId: string;
}) {
  const id = useId();
  return (
    <div className="gw-tabs" role="tablist" aria-label={label}>
      {items.map((name, i) => (
        <button
          key={name}
          id={`${id}-${i}`}
          role="tab"
          aria-controls={panelId}
          aria-selected={name === value}
          tabIndex={name === value ? 0 : -1}
          onClick={() => onChange(name)}
          onKeyDown={(event) => {
            if (
              ["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
            ) {
              event.preventDefault();
              const n =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : (i +
                        (event.key === "ArrowRight" ? 1 : -1) +
                        items.length) %
                      items.length;
              onChange(items[n]);
              document.getElementById(`${id}-${n}`)?.focus();
            }
          }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  return (
    <div className="gw-field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(
            children as ReactElement<{
              id?: string;
              "aria-describedby"?: string;
            }>,
            { id, "aria-describedby": hint ? `${id}-hint` : undefined },
          )
        : children}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Filters({
  values,
  onChange,
  options = {},
}: {
  values: FilterValues;
  onChange: (v: FilterValues) => void;
  options?: Record<string, string[] | { value: string; label: string }[]>;
}) {
  return (
    <div className="gw-filters">
      <Field label="Search">
        <input
          type="search"
          placeholder="Find a name, record or detail"
          value={values.search || ""}
          onChange={(e) => onChange({ ...values, search: e.target.value })}
        />
      </Field>
      {Object.entries(options).map(([name, items]) => (
        <Field
          key={name}
          label={name.replace(/Id$/, "").replace(/([A-Z])/g, " $1")}
        >
          <select
            value={values[name] || ""}
            onChange={(e) => onChange({ ...values, [name]: e.target.value })}
          >
            <option value="">All</option>
            {items.map((option) =>
              typeof option === "string" ? (
                <option key={option}>{option}</option>
              ) : (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ),
            )}
          </select>
        </Field>
      ))}
      {Object.values(values).some(Boolean) && (
        <button className="gw-link" onClick={() => onChange({})}>
          Clear filters
        </button>
      )}
    </div>
  );
}
export function DataTable({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: { id: string; cells: ReactNode[] }[];
  caption: string;
}) {
  return rows.length ? (
    <div className="gw-table-scroll">
      <table className="gw-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th scope="col" key={`${h}-${i}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((c, i) => (
                <td key={i}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No matching records"
      description="Clear the filters to see the example records."
    />
  );
}
export function ExportMenu({
  view,
  filters = {},
  label = "Export view",
}: {
  view: ExportView;
  filters?: FilterValues;
  label?: string;
}) {
  const { actor, refresh, notice } = useApp();
  const [busy, setBusy] = useState(false);
  return (
    <Popover
      label="Export format"
      trigger={
        <button className="gw-export" disabled={busy}>
          <Icon name="download" size={15} />
          {busy ? "Preparing…" : label}
          <Icon name="chevron" size={12} />
        </button>
      }
    >
      {(close: () => void) => (
        <div className="gw-popover-menu">
          <strong>Current filtered view</strong>
          {(["PDF", "Excel", "CSV"] as const).map((format) => (
            <button
              key={format}
              onClick={async () => {
                close();
                setBusy(true);
                try {
                  const { blob, filename } = await api.exportView(
                    actor,
                    view,
                    filters,
                    format,
                  );
                  const url = URL.createObjectURL(blob),
                    link = document.createElement("a");
                  link.href = url;
                  link.download = filename;
                  link.click();
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  await refresh();
                  notice("Export ready. The filters and action were recorded.");
                } catch (e) {
                  notice((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {format === "Excel" ? "Excel (.xlsx)" : format}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
export function Diff({ before, after }: { before: unknown; after: unknown }) {
  return (
    <div className="gw-diff">
      <div>
        <strong>Before</strong>
        <pre>{JSON.stringify(before ?? "New record", null, 2)}</pre>
      </div>
      <div>
        <strong>After</strong>
        <pre>{JSON.stringify(after, null, 2)}</pre>
      </div>
    </div>
  );
}
function RichField({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <div>
      <div className="gw-rich-toolbar">
        {[
          ["Bold", "**"],
          ["Italic", "_"],
          ["List", "- "],
        ].map(([label, token]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              const area = ref.current!,
                start = area.selectionStart,
                end = area.selectionEnd,
                text = value.slice(start, end) || "text";
              onChange(
                value.slice(0, start) +
                  (label === "List"
                    ? `\n- ${text}`
                    : `${token}${text}${token}`) +
                  value.slice(end),
              );
              area.focus();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <textarea
        id={id}
        ref={ref}
        required
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Announcement message"
      />
    </div>
  );
}
export function RichBody({ text }: { text: string }) {
  return (
    <div className="gw-rich-body">
      {text.split("\n").map((line, i) => (
        <p key={i}>
          {line
            .split(/(\*\*[^*]+\*\*|_[^_]+_)/g)
            .map((part, n) =>
              part.startsWith("**") ? (
                <strong key={n}>{part.slice(2, -2)}</strong>
              ) : part.startsWith("_") ? (
                <em key={n}>{part.slice(1, -1)}</em>
              ) : (
                part
              ),
            )}
        </p>
      ))}
    </div>
  );
}
export function ActionDialog({
  action,
  onClose,
}: {
  action: Action;
  onClose: () => void;
}) {
  const { perform, actor } = useApp();
  const [values, setValues] = useState<Record<string, string>>(
      action.initial || {},
    ),
    [reason, setReason] = useState(""),
    [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <Dialog
      title={review ? "Review your change" : action.title}
      onClose={onClose}
      busy={busy}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (!review) {
            if (reason.trim().length < 5) {
              setError("Add a clear reason of at least 5 characters.");
              return;
            }
            setReview(true);
            return;
          }
          setBusy(true);
          try {
            await perform(() => action.submit(values, reason));
            onClose();
          } catch (failure) {
            setError((failure as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {action.description && (
          <p className="gw-form-description">{action.description}</p>
        )}
        {review ? (
          <>
            <Diff before={action.before} after={values} />
            <p className="gw-reason">
              <strong>Reason</strong> {reason}
            </p>
            <p className="gw-quiet">
              Recorded as {actor.name} · {actor.activeRole}
            </p>
          </>
        ) : (
          <div className="gw-form-grid">
            {action.fields.map((field) => (
              <Field key={field.name} label={field.label} hint={field.hint}>
                {field.type === "richtext" ? (
                  <RichField
                    value={values[field.name] || ""}
                    onChange={(v) => setValues({ ...values, [field.name]: v })}
                  />
                ) : field.options ? (
                  <select
                    required={field.required}
                    value={values[field.name] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.name]: e.target.value })
                    }
                  >
                    <option value="">Choose</option>
                    {field.options.map((o) =>
                      typeof o === "string" ? (
                        <option key={o}>{o}</option>
                      ) : (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ),
                    )}
                  </select>
                ) : field.type === "textarea" ? (
                  <textarea
                    required={field.required}
                    rows={4}
                    value={values[field.name] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.name]: e.target.value })
                    }
                  />
                ) : (
                  <input
                    required={field.required}
                    type={field.type || "text"}
                    min={field.type === "date" ? "2025-01-01" : undefined}
                    value={values[field.name] || ""}
                    onChange={(e) =>
                      setValues({ ...values, [field.name]: e.target.value })
                    }
                  />
                )}
              </Field>
            ))}
            <Field label="Reason for this change">
              <textarea
                required
                minLength={5}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help the next person understand why."
              />
            </Field>
          </div>
        )}
        {error && (
          <p role="alert" className="gw-error">
            {error}
          </p>
        )}
        <div className="gw-form-actions">
          <Button
            secondary
            disabled={busy}
            onClick={() => (review ? setReview(false) : onClose())}
          >
            {review ? "Back" : "Cancel"}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Saving…" : review ? "Confirm change" : "Review change"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
export function Trend({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(...values, 1);
  return (
    <svg
      className="gw-spark"
      viewBox="0 0 100 30"
      role="img"
      aria-label={label}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        points={values
          .map(
            (v, i) =>
              `${(i * 100) / Math.max(1, values.length - 1)},${28 - (v / max) * 24}`,
          )
          .join(" ")}
      />
    </svg>
  );
}
export function Chart({
  series,
  title,
}: {
  series: { name: string; values: number[] }[];
  title: string;
}) {
  const [table, setTable] = useState(false),
    max = Math.max(...series.flatMap((s) => s.values), 1);
  return (
    <div className="gw-chart">
      <div className="gw-chart-toolbar">
        <span>Example comparison · last 7 days</span>
        <button className="gw-link" onClick={() => setTable(!table)}>
          {table ? "Show chart" : "View data table"}
        </button>
      </div>
      {table ? (
        <DataTable
          caption={title}
          headers={["Series", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          rows={series.map((s) => ({
            id: s.name,
            cells: [s.name, ...s.values],
          }))}
        />
      ) : (
        <>
          <svg viewBox="0 0 650 150" role="img" aria-label={title}>
            {[0, 1, 2, 3].map((n) => (
              <line
                key={n}
                x1="20"
                x2="630"
                y1={20 + n * 35}
                y2={20 + n * 35}
                className="gw-chart-grid"
              />
            ))}
            {series.map((s, i) => (
              <polyline
                key={s.name}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray={i === 1 ? "6 4" : i === 2 ? "2 5" : undefined}
                className={`gw-series-${i}`}
                points={s.values
                  .map((v, n) => `${20 + n * 100},${125 - (v / max) * 105}`)
                  .join(" ")}
              />
            ))}
          </svg>
          <div className="gw-chart-legend">
            {series.map((s, i) => (
              <span key={s.name}>
                <i className={`gw-series-${i}`} />
                {s.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
