import { useState } from "react";
import { useEmployeeWorkspace } from "../../employee-workspace/context";
import { useTheme } from "../../../shared/theme/useTheme";
import Panel from "../../../shared/workspace/Panel";
import Button from "../../../shared/workspace/Button";

export default function Preferences() {
  const { data, save } = useEmployeeWorkspace();
  const [draft, setDraft] = useState(data.settings.preferences);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [dark, setDark] = useTheme();
  return (
    <>
      <Panel title="Notifications">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
          if (busy) return;
            setBusy(true);
            setError("");
            try {
              await save("preferences", draft);
            } catch (failure) {
              setError(failure.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {Object.entries(draft).map(([key, value]) => (
            <label className="toggle-row" key={key}>
              <span>
                {key}
                {key === "Security notices" && (
                  <small>Required account notices</small>
                )}
              </span>
              <input
                type="checkbox"
                aria-label={key}
                checked={value}
                disabled={key === "Security notices"}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    [key]: event.target.checked,
                  }))
                }
              />
            </label>
          ))}
          <p className="quiet">
            Preferences are saved to your account. Delivery will apply when
            notification services are enabled.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <Button loading={busy}>
            {busy ? "Saving…" : "Save preferences"}
          </Button>
        </form>
      </Panel>
      <Panel title="Appearance">
        <label className="toggle-row">
          <span>
            Dark mode<small>Saved on this device</small>
          </span>
          <input
            type="checkbox"
            checked={dark}
            onChange={(event) => setDark(event.target.checked)}
          />
        </label>
      </Panel>
    </>
  );
}
