import { useState } from "react";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import Dialog from "../../shared/workspace/Dialog";
import Field from "../../shared/workspace/Field";
import Button from "../../shared/workspace/Button";

export function EditProfileDialog({ onClose }) {
  const { user, data, save } = useEmployeeWorkspace();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog title="Edit profile" onClose={onClose} busy={busy}>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (busy) return;
          const values = Object.fromEntries(new FormData(event.currentTarget));
          setBusy(true);
          setError("");
          try {
            await save("profile", values);
            onClose();
          } catch (failure) {
            setError(failure.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Preferred name">
          <input
            name="preferred"
            required
            maxLength={60}
            defaultValue={
              data.settings.profile.preferred || user.name.split(" ")[0]
            }
          />
        </Field>
        <Field label="Work phone / extension">
          <input
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={data.settings.profile.phone}
          />
        </Field>
        <Field label="Personal email (optional)">
          <input
            name="personal"
            type="email"
            maxLength={254}
            defaultValue={data.settings.profile.personal}
          />
        </Field>
        <p className="quiet">
          Official identity, roles and reporting details require an
          administrator.
        </p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <Button loading={busy}>{busy ? "Saving…" : "Save changes"}</Button>
      </form>
    </Dialog>
  );
}
export function AvatarDialog({ onClose }) {
  const { saveAvatar } = useEmployeeWorkspace();
  const [file, setFile] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Dialog title="Profile photo" onClose={onClose} busy={busy}>
      <p className="quiet">
        Your photo will be cropped to a square. Punch evidence stays separate.
      </p>
      <Field label="Choose an image">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const selected = event.target.files[0];
            setError("");
            setFile(null);
            if (
              selected &&
              (!["image/jpeg", "image/png", "image/webp"].includes(
                selected.type,
              ) ||
                selected.size > 2 * 1024 * 1024)
            )
              setError("Choose a JPEG, PNG or WebP image under 2 MB.");
            else setFile(selected);
          }}
        />
      </Field>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <Button
        disabled={!file}
        loading={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            await saveAvatar(file);
            onClose();
          } catch (failure) {
            setError(failure.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Uploading…" : "Save photo"}
      </Button>
    </Dialog>
  );
}
