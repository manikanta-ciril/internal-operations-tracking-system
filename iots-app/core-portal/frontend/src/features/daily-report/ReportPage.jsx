import FileUpload from "../../components/ui/file-upload.tsx";
import { Choice } from "../creative-associate/workspace/WorkspaceUI.jsx";
import ReportReview from "./ReportReview.jsx";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  CalendarDays,
} from "lucide-react";
import { Button } from "../../shared/work-ui/button.jsx";
import { Input } from "../../shared/work-ui/input.jsx";
import { Textarea } from "../../shared/work-ui/textarea.jsx";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../shared/work-ui/dropdown-menu.jsx";
import { istDate } from "../tasks/model.js";
import { canAccessReport } from "../creative-associate/workspace/api.js";
import {
  reportSections,
  reportGroups,
  emptySectionMessages,
  exportManualReport,
  storeProof,
  downloadProof,
} from "./exportTools.js";
const empty = (date) => ({
  date,
  entries: {},
  other: "",
  remarks: "",
  proofs: [],
});
function Proofs({ value = [], onChange, onError, disabled, uploadProof }) {
  return (
    <FileUpload
      files={value}
      label="Attach work evidence"
      accept={
        uploadProof
          ? ".pdf,.png,.jpg,.jpeg,.webp,.gif,.mp4,.mov,.mp3,.wav,.txt,.docx,.xlsx,.pptx"
          : ".pdf,image/*,video/*,audio/*"
      }
      maxBytes={uploadProof ? 30 * 1024 * 1024 : undefined}
      disabled={disabled}
      onError={onError}
      onFiles={async (files) => {
        const saved = [];
        for (const file of files)
          saved.push(await (uploadProof || storeProof)(file));
        onChange([...value, ...saved]);
      }}
      onRemove={(index) => onChange(value.filter((_, i) => i !== index))}
      onDownload={(proof) =>
        downloadProof(proof).catch((error) => onError(error.message))
      }
    />
  );
}
export default function ReportPage({
  state,
  employee,
  now,
  mutate,
  onBack,
  viewer = employee,
  uploadProof,
  saveReport,
}) {
  const previous = Object.fromEntries(
    (state.deliveries || [])
      .filter((d) => d.date >= "2025-01-01" && d.report && !d.report.entries)
      .map((d) => [
        d.date,
        {
          ...empty(d.date),
          other: Object.entries(d.report)
            .filter(([, v]) => Array.isArray(v))
            .map(([key, v]) => key + ":\n" + v.join("\n"))
            .join("\n\n"),
          submittedAt: d.at,
          legacy: true,
        },
      ]),
  );
  const savedReports = { ...previous, ...(state.manualReports || {}) };
  const today = istDate(now);
  const [date, setDate] = useState(today),
    [draft, setDraft] = useState(() =>
      structuredClone(savedReports[today] || empty(today)),
    ),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false),
    [pendingDate, setPendingDate] = useState(null);
  const steps = [...reportSections, "Remarks & other work", "Review report"];
  const eligible = state.tasks.filter(
    (t) =>
      (!t.ownerId || t.ownerId === employee.id) &&
      (!t.createdAt || istDate(new Date(t.createdAt)) <= date),
  );
  const selected = Object.entries(draft.entries);
  const submitted = Boolean(
    state.serverBacked && savedReports[date]?.state === "Submitted",
  );
  const groups = reportGroups(draft);
  useEffect(() => {
    document.querySelector(".report-step h2")?.focus();
  }, [step]);
  if (!canAccessReport(employee, viewer))
    return <p>Outside your data scope.</p>;
  const patch = (change) => {
    if (submitted) return;
    setDraft((d) => ({ ...d, ...change, submittedAt: undefined }));
    setDirty(true);
    setNotice("");
  };
  const entry = (id, change) =>
    patch({
      entries: { ...draft.entries, [id]: { ...draft.entries[id], ...change } },
    });
  function chooseDate(next) {
    if (next < "2025-01-01" || next > today) return;
    if (dirty) {
      setPendingDate(next);
      return;
    }
    loadDate(next);
  }
  function loadDate(next) {
    setDate(next);
    setDraft(structuredClone(savedReports[next] || empty(next)));
    setStep(0);
    setDirty(false);
    setPendingDate(null);
    setError("");
    setNotice("");
  }
  async function save(submit = false) {
    setBusy(true);
    setError("");
    try {
      if (submit && !selected.length && !draft.other.trim())
        throw Error("Select a task or describe other work before submitting.");
      const record = {
        ...draft,
        savedAt: new Date().toISOString(),
        ...(submit ? { submittedAt: new Date().toISOString() } : {}),
        recipients: state.serverBacked
          ? state.workspace.reportAudience
          : ["General Manager / Senior Manager / Executive"],
      };
      const saved = saveReport
        ? await saveReport(record, submit)
        : await mutate((s) => {
            s.manualReports ??= {};
            s.manualReports[date] = structuredClone(record);
            if (submit) {
              s.deliveries.push({
                date,
                at: record.submittedAt,
                status: "Queued locally",
                recipients: record.recipients,
                report: structuredClone(record),
              });
            }
          });
      setDraft(saved?.manualReports?.[date] || record);
      setDirty(false);
      setNotice(
        state.serverBacked
          ? submit
            ? "Report submitted to the manager inbox."
            : "Report draft saved."
          : submit
            ? "Report queued on this device. Server delivery is not connected."
            : "Draft saved on this device.",
      );
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="manual-report">
      <Button variant="ghost" className="page-back" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to workspace
      </Button>
      <div className="page-heading">
        <div>
          <h1>Build your daily report</h1>
          <p>Your day, in your words. Choose the work you want to include.</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={busy || step !== 6}>
              <Download size={15} />
              Export report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["pdf", "xlsx", "csv"].map((format) => (
              <DropdownMenuItem
                key={format}
                onSelect={() => {
                  setBusy(true);
                  exportManualReport(format, draft, employee)
                    .catch((e) => setError(e.message))
                    .finally(() => setBusy(false));
                }}
              >
                {format === "xlsx" ? "Excel (.xlsx)" : format.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="report-builder-layout">
        <aside className="report-guide">
          <label>
            <CalendarDays size={16} />
            Report date
            <Input
              aria-label="Report date"
              type="date"
              min="2025-01-01"
              max={today}
              value={date}
              onChange={(e) => chooseDate(e.target.value)}
            />
          </label>
          <ol className="report-stepper">
            {steps.map((label, i) => (
              <li key={label} aria-current={step === i ? "step" : undefined}>
                <button onClick={() => setStep(i)}>
                  <span>{i < step ? <Check size={14} /> : i + 1}</span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
          <h2>Saved reports</h2>
          <div className="saved-report-list">
            {Object.keys(savedReports)
              .sort()
              .reverse()
              .map((d) => (
                <button
                  key={d}
                  aria-current={date === d ? "date" : undefined}
                  onClick={() => chooseDate(d)}
                >
                  {d}
                  <span>
                    {savedReports[d].submittedAt ? "Submitted" : "Draft"}
                  </span>
                </button>
              ))}
            {!Object.keys(savedReports).length && <p>No saved reports yet.</p>}
          </div>
        </aside>
        <div className="report-builder">
          {pendingDate && (
            <div role="alert" className="report-unsaved">
              <p>You have unsaved changes. Save before switching dates?</p>
              <Button
                disabled={busy}
                onClick={async () => {
                  if (await save()) loadDate(pendingDate);
                }}
              >
                Save and switch
              </Button>
              <Button variant="outline" onClick={() => loadDate(pendingDate)}>
                Discard and switch
              </Button>
              <Button variant="ghost" onClick={() => setPendingDate(null)}>
                Keep editing
              </Button>
            </div>
          )}
          {error && (
            <p role="alert" className="error-copy">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="report-save-notice">
              {notice}
            </p>
          )}
          {submitted && (
            <p className="report-save-notice">
              Submitted report. Its work and evidence are preserved for manager
              review.
            </p>
          )}
          <fieldset
            className="report-step"
            key={step}
            disabled={submitted && step !== 6}
            style={{ border: 0, minWidth: 0 }}
          >
            <p className="report-step-position">
              Step {step + 1} of {steps.length}
            </p>
            <h2 tabIndex={-1}>{steps[step]}</h2>
            {step === 0 && (
              <>
                <p className="muted-copy">
                  All assigned tasks are listed below. Check the tasks you
                  worked on today. Report entries never change task workflow or
                  approval status.
                </p>
                <div className="report-task-options">
                  {eligible.map((t) => (
                    <label key={t.id}>
                      <input
                        type="checkbox"
                        checked={!!draft.entries[t.id]}
                        onChange={(e) => {
                          const entries = { ...draft.entries };
                          if (e.target.checked)
                            entries[t.id] = {
                              title: t.title,
                              section:
                                t.status === "Completed"
                                  ? "Tasks completed"
                                  : "Tasks in progress",
                              note: "",
                              remarks: "",
                              proofs: [],
                              newToday:
                                !!t.createdAt &&
                                istDate(new Date(t.createdAt)) === date,
                            };
                          else delete entries[t.id];
                          patch({ entries });
                        }}
                      />
                      <span>
                        <strong>{t.title}</strong>
                        <small>
                          {t.id} / {t.status}
                          {t.createdAt &&
                          istDate(new Date(t.createdAt)) === date
                            ? " / New today"
                            : ""}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
                {!eligible.length && (
                  <p>
                    No assigned tasks are available for this date. You can still
                    record other work.
                  </p>
                )}
              </>
            )}
            {step === 1 && (
              <>
                <p className="muted-copy">
                  Completed tasks from your selection appear here automatically.
                  Confirm any other work you finished today.
                </p>
                <div className="report-task-options">
                  {selected.map(([id, e]) => (
                    <label key={id}>
                      <input
                        type="checkbox"
                        aria-label={`Completed today: ${e.title}`}
                        checked={e.section === reportSections[1]}
                        onChange={(event) =>
                          entry(id, {
                            section: event.target.checked
                              ? reportSections[1]
                              : reportSections[2],
                          })
                        }
                      />
                      <span>
                        <strong>{e.title}</strong>
                        <small>
                          {e.section === reportSections[1]
                            ? "Included in tasks completed"
                            : "Still in progress"}
                        </small>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {step >= 1 && step <= 4 && (
              <>
                {step === 2 && (
                  <p className="muted-copy">
                    Describe progress on the selected work that is not
                    completed. Move work to Pending if it could not move
                    forward.
                  </p>
                )}
                {step === 3 && (
                  <p className="muted-copy">
                    Pending work stays visible without being marked complete.
                    Add a reason or the input you need, if helpful.
                  </p>
                )}
                {step === 4 && (
                  <>
                    <p className="muted-copy">
                      Tasks assigned on this report date. Check only those you
                      took up today.
                    </p>
                    <div className="report-task-options">
                      {eligible
                        .filter(
                          (t) =>
                            t.createdAt &&
                            istDate(new Date(t.createdAt)) === date,
                        )
                        .map((t) => (
                          <label key={t.id}>
                            <input
                              type="checkbox"
                              checked={!!draft.entries[t.id]}
                              onChange={(event) => {
                                const entries = { ...draft.entries };
                                if (event.target.checked)
                                  entries[t.id] = {
                                    title: t.title,
                                    section:
                                      t.status === "Completed"
                                        ? reportSections[1]
                                        : reportSections[2],
                                    note: "",
                                    remarks: "",
                                    proofs: [],
                                    newToday: true,
                                  };
                                else delete entries[t.id];
                                patch({ entries });
                              }}
                            />
                            <span>
                              <strong>{t.title}</strong>
                              <small>
                                {t.id} / Assigned on {date}
                              </small>
                            </span>
                          </label>
                        ))}
                    </div>
                  </>
                )}
                {!groups[step].length && (
                  <div className="report-section-empty">
                    <Check size={22} />
                    <h3>{emptySectionMessages[step]}</h3>
                    <p>
                      {step === 1
                        ? "That is fine. Continue to record work in progress."
                        : "You can continue without adding text to this section."}
                    </p>
                    {step === 1 && (
                      <label>
                        Completion summary
                        <Choice
                          label="Completion summary"
                          value={
                            draft.emptyMessages?.[step] ||
                            emptySectionMessages[step]
                          }
                          onChange={(value) =>
                            patch({
                              emptyMessages: {
                                ...draft.emptyMessages,
                                [step]: value,
                              },
                            })
                          }
                          options={[
                            "No tasks completed.",
                            "Work is in progress; no completions today.",
                            "Completed work is awaiting review.",
                          ]}
                        />
                      </label>
                    )}
                  </div>
                )}
                {groups[step].map(([id, e]) => (
                  <section className="report-entry" key={id}>
                    <div className="report-entry-heading">
                      <h3>{e.title}</h3>
                      <span>{id}</span>
                    </div>
                    <label>
                      {step === 1
                        ? "What did you complete?"
                        : step === 2
                          ? "What progress did you make?"
                          : step === 3
                            ? "What is pending or blocking this work?"
                            : "What did you take up today?"}
                      <Textarea
                        aria-label={`Work description for ${id}`}
                        value={e.note}
                        onChange={(event) =>
                          entry(id, { note: event.target.value })
                        }
                        placeholder={
                          step === 1
                            ? "Optional: describe the finished work and outcome."
                            : step === 3
                              ? "Optional: explain what remains or what you are waiting for."
                              : "Optional: describe what you worked on today."
                        }
                      />
                    </label>
                    <label>
                      Task remarks
                      <Textarea
                        aria-label={`Remarks for ${id}`}
                        value={e.remarks}
                        onChange={(event) =>
                          entry(id, { remarks: event.target.value })
                        }
                      />
                    </label>
                    <Proofs
                      uploadProof={uploadProof}
                      value={e.proofs}
                      onChange={(proofs) => entry(id, { proofs })}
                      onError={setError}
                      disabled={busy}
                    />
                    {step === 2 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          entry(id, { section: reportSections[3] })
                        }
                      >
                        Move to pending
                      </Button>
                    )}
                    {step === 3 && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          entry(id, { section: reportSections[2] })
                        }
                      >
                        Move to in progress
                      </Button>
                    )}
                  </section>
                ))}
              </>
            )}
            {step === 5 && (
              <section className="report-entry">
                <h3>Anything else today?</h3>
                <label>
                  Other work
                  <Textarea
                    aria-label="Other work"
                    value={draft.other}
                    onChange={(e) => patch({ other: e.target.value })}
                  />
                </label>
                <label>
                  Daily remarks
                  <Textarea
                    aria-label="Daily remarks"
                    value={draft.remarks}
                    onChange={(e) => patch({ remarks: e.target.value })}
                  />
                </label>
                <Proofs
                  uploadProof={uploadProof}
                  value={draft.proofs}
                  onChange={(proofs) => patch({ proofs })}
                  onError={setError}
                  disabled={busy}
                />
              </section>
            )}
            {step === 6 && (
              <ReportReview
                report={draft}
                employee={employee}
                onError={setError}
              />
            )}
          </fieldset>
          <div className="report-builder-actions">
            <Button
              variant="ghost"
              disabled={busy || step === 0}
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft size={15} />
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={busy || submitted}
              onClick={() => save()}
            >
              {busy ? "Saving..." : "Save draft"}
            </Button>
            {step < 6 ? (
              <Button onClick={() => setStep((s) => s + 1)}>
                Continue
                <ArrowRight size={15} />
              </Button>
            ) : (
              <Button
                disabled={busy || !!draft.submittedAt}
                onClick={() => save(true)}
              >
                {state.serverBacked
                  ? draft.submittedAt
                    ? "Submitted"
                    : "Submit to manager"
                  : draft.submittedAt
                    ? "Queued locally"
                    : "Queue for manager"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
