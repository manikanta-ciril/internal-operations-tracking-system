import { useState } from "react";
import FileUpload from "../../components/ui/file-upload";
import { Button } from "../../shared/work-ui/button";
import { Textarea } from "../../shared/work-ui/textarea";
import EvidenceFile from "./EvidenceFile";

export default function PublicationEvidence({
  task,
  command,
  uploadProof,
  editable,
}) {
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!task.publicationRequired) return null;
  const saved = task.publicationProof;
  const proofFiles = (task.files || []).filter((file) =>
    saved?.fileIds.includes(file.id),
  );
  const canUpload =
    editable &&
    ["In progress", "Changes requested", "In review"].includes(task.status);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await command("publication-proof", {
        note,
        fileIds: files.map((file) => file.id),
      });
      setFiles([]);
      setNote("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="request-record">
      <h3>Publication evidence</h3>
      <p>This brief requires proof of publication before final approval.</p>
      {saved && (
        <>
          <p>{saved.note}</p>
          {proofFiles.map((file) => (
            <EvidenceFile key={file.id} file={{ ...file, server: true }} />
          ))}
        </>
      )}
      {canUpload && (
        <form onSubmit={save}>
          <label>
            Publication note
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              required
              disabled={busy}
            />
          </label>
          <FileUpload
            files={files}
            disabled={busy}
            label="Attach publication proof"
            maxBytes={30 * 1024 * 1024}
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
            onError={setError}
            onRemove={(index) =>
              setFiles((previous) =>
                previous.filter((_, item) => item !== index),
              )
            }
            onFiles={async (selected) => {
              const uploaded = [];
              for (const file of selected)
                uploaded.push(await uploadProof(file, "publication"));
              setFiles((previous) => [...previous, ...uploaded]);
            }}
          />
          <Button type="submit" disabled={busy || !files.length}>
            {busy ? "Saving…" : "Save publication evidence"}
          </Button>
        </form>
      )}
      {!saved && !canUpload && (
        <p>
          Publication proof has not been recorded. The manager cannot complete
          this task yet.
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
