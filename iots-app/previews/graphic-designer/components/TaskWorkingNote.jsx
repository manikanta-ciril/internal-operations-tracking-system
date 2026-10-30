import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Choice, SaveButton } from "./WorkspaceUI";
import { saveWorkUpdate } from "../effort";
import { downloadProof } from "../report-tools";
import { Button } from "./ui/button";
import { format } from "../presentation";
export default function TaskWorkingNote({ task, now, mutate }) {
  const [note, setNote] = useState(""),
    [progress, setProgress] = useState(task.progress || 0),
    [amount, setAmount] = useState(""),
    [unit, setUnit] = useState("minutes"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const active = ["Assigned", "In progress", "Changes requested"].includes(task.status);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await mutate(
        (state) =>
          saveWorkUpdate(state, task.id, { note, progress, amount, unit }, new Date()),
        "Work update saved.",
      );
      setNote("");
      setAmount("");
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="work-log-section">
      <h3>Log your work</h3>
      <p className="muted-copy">
        Add a note, update progress or record time spent today.
      </p>
      <form onSubmit={save} className="work-log-form">
        <label htmlFor="working-note">What did you do?</label>
        <Textarea
          id="working-note"
          placeholder="Describe the design work or decisions you made today."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={busy}
          rows={3}
        />
        <div className="work-log-controls">
          <div>
            <label htmlFor="work-progress">
              Work progress <output>{progress}%</output>
            </label>
            <input
              id="work-progress"
              type="range"
              min="0"
              max="100"
              step="10"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              disabled={busy || !active}
              style={{ "--progress": `${progress}%` }}
            />
            <div className="progress-steps" aria-hidden="true">
              {Array.from({ length: 11 }, (_, i) => (
                <span key={i}>{i % 5 === 0 ? `${i * 10}%` : "·"}</span>
              ))}
            </div>
            <small>100% means ready for review, not approved.</small>
          </div>
          <div>
            <label htmlFor="work-effort">Time spent today</label>
            <div className="effort-input">
              <Input
                id="work-effort"
                type="number"
                min="0"
                step={unit === "hours" ? "0.25" : "1"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                disabled={busy}
              />
              <Choice
                label="Time unit"
                value={unit}
                onChange={setUnit}
                options={["minutes", "hours"]}
                disabled={busy}
              />
            </div>
            <small>Additional time worked. Attendance stays separate.</small>
          </div>
        </div>
        {error && (
          <p role="alert" className="error-copy">
            {error}
          </p>
        )}
        <SaveButton busy={busy}>Save work update</SaveButton>
      </form>
      <h3>Recent notes</h3>
      {task.notes?.length ? (
        <ol className="recent-work-notes">
          {[...task.notes]
            .reverse()
            .slice(0, 5)
            .map((n, i) => (
              <li key={i}>
                <p>{n.text}</p>
                <time dateTime={n.at}>{format(n.at)}</time>
                {n.attachments?.map((a) => (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    key={a.id}
                    onClick={() => downloadProof(a).catch((e) => setError(e.message))}
                  >
                    {a.name}
                  </Button>
                ))}
              </li>
            ))}
        </ol>
      ) : (
        <p className="muted-copy">
          Your saved updates will appear here with their date and time.
        </p>
      )}
    </section>
  );
}
