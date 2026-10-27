import Chip from "../../../shared/ui/Chip";
import Icon from "../../../shared/workspace/Icon";
import { formatDistance } from "../../../shared/ui/distance";
import { useState } from "react";
import { useEmployeeWorkspace } from "../context";
import useDropdown from "../useDropdown";
import Field from "../../../shared/workspace/Field";
import Button from "../../../shared/workspace/Button";

function AvailabilityForm({ onClose }) {
  const { data, save, user } = useEmployeeWorkspace();
  const [draft, setDraft] = useState(data.settings.availability);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const change = (field) => (event) =>
    setDraft((value) => ({ ...value, [field]: event.target.value }));
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
          await save("availability", draft);
          onClose();
        } catch (failure) {
          setError(failure.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>Availability</h2>
      <Field label="Work status">
        <select value={draft.status} onChange={change("status")}>
          {data.policy.statuses.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </Field>
      <Field label="Status message">
        <input
          value={draft.message}
          onChange={change("message")}
          maxLength={100}
          placeholder="Optional"
        />
      </Field>
      <Field label="Back at">
        <input
          type="time"
          value={draft.returnAt}
          onChange={change("returnAt")}
        />
      </Field>
      <p className="quiet">
        {user.location?.status === "onsite"
          ? "On-site"
          : user.location?.status === "offsite"
            ? "Off-site"
            : "Location unknown"}{" "}
        · Recorded at punch-in
      </p>
      <p className="quiet">
        Availability does not change attendance or approve remote work.
      </p>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <Button loading={busy}>{busy ? "Saving…" : "Save status"}</Button>
    </form>
  );
}
export default function AvailabilityMenu() {
  const { data, user, loading } = useEmployeeWorkspace();
  const { root, trigger, open, setOpen } = useDropdown();
  const location =
    user.location?.status === "onsite"
      ? "On-site"
      : user.location?.status === "offsite"
        ? "Off-site"
        : "Unknown";
  return (
    <div className="availability-root" ref={root}>
      <button
        ref={trigger}
        className="availability-trigger"
        disabled={loading || !data}
        aria-label="Change availability"
        aria-expanded={open}
        aria-controls="employee-availability"
        onClick={() => setOpen((value) => !value)}
      >
        <Chip icon={<Icon name="check" size={14} />}>
          {data?.settings.availability.status || "Loading"}
        </Chip>
        <span className="status-divider" />
        {location}
        {user.location?.status === "offsite" &&
          ` \u00b7 ${formatDistance(user.location.distanceMeters)}`}
      </button>
      {open && data && (
        <div
          className="availability-dropdown"
          id="employee-availability"
          role="dialog"
          aria-label="Availability"
        >
          <AvailabilityForm
            onClose={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          />
        </div>
      )}
    </div>
  );
}
