import { useState } from "react";
import { Plus, X } from "lucide-react";
import MessagingDialog from "./MessagingDialog";
const forms = {
  poll: {
    heading: "Create poll",
    description: "Collect answers from this conversation's members.",
    titleLabel: "Question",
    entryLabel: "Option",
    minimum: 2,
    multiple: true,
    sendLabel: "Send poll",
    content: ({ title, entries, multiple }) => ({
      type: "poll",
      question: title,
      options: entries,
      multiple,
    }),
  },
  checklist: {
    heading: "Create checklist",
    description: "Share a checklist the team can complete together.",
    titleLabel: "Checklist title",
    entryLabel: "Item",
    minimum: 1,
    multiple: false,
    sendLabel: "Send checklist",
    content: ({ title, entries }) => ({
      type: "checklist",
      title,
      items: entries,
    }),
  },
};
export default function RichMessageDialog({ kind, onSend, onClose }) {
  const form = forms[kind];
  const [title, setTitle] = useState("");
  const [entries, setEntries] = useState(["", ""]);
  const [multiple, setMultiple] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await onSend(form.content({ title, entries, multiple }));
      onClose();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <MessagingDialog
      title={form.heading}
      description={form.description}
      busy={busy}
      onClose={onClose}
    >
      <form onSubmit={submit} className="messaging-rich-form">
        <label>
          {form.titleLabel}
          <input
            autoFocus
            required
            maxLength={120}
            value={title}
            disabled={busy}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <div className="messaging-entries">
          {entries.map((entry, index) => (
            <div key={index}>
              <input
                required
                maxLength={80}
                aria-label={`${form.entryLabel} ${index + 1}`}
                value={entry}
                disabled={busy}
                onChange={(event) =>
                  setEntries((previous) =>
                    previous.map((label, position) =>
                      position === index ? event.target.value : label,
                    ),
                  )
                }
              />
              {entries.length > form.minimum && (
                <button
                  type="button"
                  className="messaging-icon"
                  disabled={busy}
                  aria-label={`Remove entry ${index + 1}`}
                  onClick={() =>
                    setEntries((previous) =>
                      previous.filter((label, position) => position !== index),
                    )
                  }
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        {entries.length < 12 && (
          <button
            type="button"
            className="messaging-add-entry"
            disabled={busy}
            onClick={() => setEntries((previous) => [...previous, ""])}
          >
            <Plus size={15} />
            Add {form.entryLabel.toLowerCase()}
          </button>
        )}
        {form.multiple && (
          <label className="messaging-multiple">
            <input
              type="checkbox"
              checked={multiple}
              disabled={busy}
              onChange={(event) => setMultiple(event.target.checked)}
            />
            Allow multiple answers
          </label>
        )}
        {error && (
          <p role="alert" className="messaging-error">
            {error}
          </p>
        )}
        <footer>
          <span>Visible to conversation members</span>
          <button
            className="messaging-primary"
            disabled={
              busy || !title.trim() || entries.some((entry) => !entry.trim())
            }
          >
            {busy ? "Sending…" : form.sendLabel}
          </button>
        </footer>
      </form>
    </MessagingDialog>
  );
}
