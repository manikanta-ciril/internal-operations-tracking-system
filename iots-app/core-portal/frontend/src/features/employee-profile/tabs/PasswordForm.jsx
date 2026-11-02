import { useState } from "react";
import { workspaceApi } from "../../employee-workspace/api";
import { useEmployeeWorkspace } from "../../employee-workspace/context";
import Field from "../../../shared/workspace/Field";
import Button from "../../../shared/workspace/Button";
export default function PasswordForm() {
  const { notifications } = useEmployeeWorkspace();
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [confirm, setConfirm] = useState(""),
    [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const result = await workspaceApi("/password", {
        body: { currentPassword: current, newPassword: next },
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      setSuccess(result.message);
      notifications.refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="password-form" onSubmit={submit}>
      <p>Use at least 12 characters. Other sessions will be signed out.</p>
      <Field label="Current password">
        <input
          required
          type={visible ? "text" : "password"}
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          maxLength={200}
        />
      </Field>
      <Field label="New password">
        <input
          required
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
      </Field>
      <Field label="Confirm new password">
        <input
          required
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </Field>
      <label className="password-visibility">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.target.checked)}
        />
        Show passwords
      </label>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {success && <p role="status">{success}</p>}
      <Button loading={busy}>{busy ? "Updating…" : "Update password"}</Button>
    </form>
  );
}
