import { useState } from "react";
import NoticeDialog from "../../shared/components/NoticeDialog";
import { Save } from "lucide-react";
import { Textarea } from "../../shared/work-ui/textarea.jsx";
import { Input } from "../../shared/work-ui/input.jsx";
import {
  Choice,
  SaveButton,
} from "../creative-associate/workspace/WorkspaceUI.jsx";
import { saveWorkUpdate, effortMinutes } from "./effort.js";
import EvidenceFile from "./EvidenceFile";
import { format } from "./presentation.js";
export default function TaskWorkingNote({ task, mutate, command }) {
  const [note, setNote] = useState(""),
    [progress, setProgress] = useState(task.progress || 0),
    [amount, setAmount] = useState(""),
    [unit, setUnit] = useState("minutes"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [startNotice,setStartNotice] = useState(false);
  const active = ["Assigned", "In progress", "Changes requested"].includes(
    task.status,
  );
  async function save(event) {
    event.preventDefault();
    if (task.status === "Assigned") { setStartNotice(true); return; }
    setBusy(true);
    setError("");
    try {
      if (command) {
        await command("work-update", {
          note,
          progress: Number(progress),
          minutes: effortMinutes(amount, unit),
        });
        setNote("");
        setAmount("");
        return;
      }
      await mutate(
        (state) =>
          saveWorkUpdate(
            state,
            task.id,
            { note, progress, amount, unit },
            new Date(),
          ),
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
      {startNotice && <NoticeDialog title="Start the task first" onClose={()=>setStartNotice(false)}><p>Start this task from Details before updating progress or submitting work for review.</p></NoticeDialog>}
      <h3>Log your work</h3>
      <p className="muted-copy">
        Describe your work or upload evidence before changing progress.
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
              onChange={(e) => { if(task.status === "Assigned") {setStartNotice(true);return;} setProgress(Number(e.target.value)); }}
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
        <SaveButton busy={busy}>
          <Save size={16} />
          Save work update
        </SaveButton>
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
                  <EvidenceFile key={a.id} file={a} />
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
