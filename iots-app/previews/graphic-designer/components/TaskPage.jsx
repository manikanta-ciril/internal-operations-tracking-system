import { dailyEffort } from "../effort";
import { Dialog } from "radix-ui";
import TaskActivity from "./TaskActivity";
import TaskWorkingNote from "./TaskWorkingNote";
import TaskAttention from "./TaskAttention";
import { storeProof, downloadProof } from "../report-tools";
import TaskJourney from "./TaskJourney";
import { creativeCategories, classifyCreative } from "../creative-categories";
import { useRolePolicy } from "../RoleContext";
import { isInReview, reviewLabel, hasCapability } from "../role-policy";
import { useState } from "react";
import {
  ArrowRight,
  Clock3,
  FileText,
  MessageSquare,
  Paperclip,
  ShieldCheck,
  ExternalLink,
  Send,
  Play,
  LockKeyhole,
  CheckCircle2,
  Palette,
  Image,
  Film,
} from "lucide-react";
import PageHeading from "./PageHeading";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Field, FieldLabel, FieldGroup, FieldDescription, FieldError } from "./ui/field";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import { StatusBadge, Choice, Blank, SaveButton } from "./WorkspaceUI";
import { stageOf, reportingState, recordActivity } from "../workflow";
import { setBriefChecklistItem, startTask, submitTask } from "../model";
import { format } from "../presentation";

const mediaTypes = [
  {
    label: "Vector & source",
    extensions: ".ai,.psd,.eps,.indd,.fig",
    hint: "AI, PSD, EPS, FIG",
    icon: Palette,
  },
  {
    label: "Artwork & social",
    extensions: "image/*",
    hint: "PNG, JPG, SVG, WebP",
    icon: Image,
  },
  {
    label: "Print & deck",
    extensions: ".pdf,.pptx,.ppt",
    hint: "PDF, PPTX",
    icon: FileText,
  },
  {
    label: "Video & motion",
    extensions: "video/*,audio/*,.gif",
    hint: "MP4, MOV, GIF, audio",
    icon: Film,
  },
];
function ActionForm({ task, mutate, now, mode, onDone, initialDraft }) {
  const policy = useRolePolicy(),
    reviewer = policy.reviewStages[0].label;
  const [kind, setKind] = useState("Progress"),
    [note, setNote] = useState(initialDraft?.note || ""),
    [progress, setProgress] = useState(task.progress || 0),
    [minutes, setMinutes] = useState("30"),
    [severity, setSeverity] = useState("Medium"),
    [file, setFile] = useState(initialDraft?.file || ""),
    [attachments, setAttachments] = useState([]),
    [media, setMedia] = useState(initialDraft?.media ?? null),
    [due, setDue] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const defaultVertical =
    classifyCreative(task).vertical === "Social media" ? "social" : "internal";
  const [vertical, setVertical] = useState(initialDraft?.vertical || defaultVertical),
    [category, setCategory] = useState(
      initialDraft?.scopeCategory || classifyCreative(task).category,
    ),
    [conflict, setConflict] = useState(false),
    [draftChoice, setDraftChoice] = useState("discard"),
    [remark, setRemark] = useState(""),
    [blockType, setBlockType] = useState("Missing input");
  const draft = initialDraft || task.workingDrafts?.at(-1);
  const active = ["Assigned", "In progress", "Changes requested"].includes(task.status),
    options = active
      ? ["Progress", "Work note", "Time logged"]
      : ["Work note", "Time logged"];
  const actual =
    mode === "submit"
      ? "Submission"
      : mode === "blocker"
        ? "Blocker reported"
        : mode === "deadline"
          ? "Deadline request"
          : options.includes(kind)
            ? kind
            : "Work note";
  async function save(e, resolution) {
    e?.preventDefault();
    setError("");
    const saveDraft =
      actual === "Submission" && e?.nativeEvent.submitter?.value === "draft";
    if (actual === "Submission" && !saveDraft && draft && !resolution) {
      setConflict(true);
      return;
    }
    if (resolution === "note" && !remark.trim()) {
      setError("Add a remark before saving the draft as a note.");
      return;
    }
    setBusy(true);
    try {
      if (actual === "Submission" && !file.trim())
        throw Error("Choose a file or add a source link.");
      const savedFiles = attachments.length ? [] : [...(initialDraft?.attachments || [])];
      if (actual === "Submission")
        for (const attachment of attachments)
          savedFiles.push(await storeProof(attachment));
      await mutate(
        (s) => {
          if (saveDraft) {
            recordActivity(
              s,
              task.id,
              "Work note",
              { note: note || `Saved working draft: ${file}` },
              now,
            );
            const target = s.tasks.find((t) => t.id === task.id);
            target.workingDrafts ??= [];
            const entry = {
              id: initialDraft?.id || crypto.randomUUID(),
              file,
              note,
              at: now.toISOString(),
              attachments: savedFiles,
              media,
              vertical,
              scopeCategory: category,
            };
            const index = target.workingDrafts.findIndex((d) => d.id === entry.id);
            if (index < 0) target.workingDrafts.push(entry);
            else target.workingDrafts[index] = entry;
            target.events.at(-1).action = "Working draft saved";
            return;
          }
          if (actual === "Submission") {
            const target = s.tasks.find((t) => t.id === task.id);
            if (resolution === "note") {
              recordActivity(
                s,
                task.id,
                "Work note",
                {
                  note: `Draft retained as note: ${draft.file}. ${draft.note || ""} ${remark.trim()}`,
                },
                now,
              );
              target.notes.at(-1).attachments = draft.attachments || [];
              target.events.at(-1).attachments = draft.attachments || [];
            }
            submitTask(s, task.id, file, note, now);
            Object.assign(target.versions.at(-1), {
              attachments: savedFiles,
              vertical,
              scopeCategory: category,
            });
            if (draft)
              target.workingDrafts = target.workingDrafts.filter(
                (d) => d.id !== draft.id,
              );
            return;
          }
          return recordActivity(
            s,
            task.id,
            actual,
            {
              note,
              progress,
              minutes,
              severity,
              blockType,
              requestedDue: due ? `${due}:00+05:30` : null,
            },
            now,
          );
        },
        saveDraft
          ? "Working draft saved."
          : actual === "Submission"
            ? `Submitted to ${reviewer.toLowerCase()}.`
            : "Task update saved.",
      );
      onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <form onSubmit={save} className="task-action-form">
        <FieldGroup>
          {mode === "update" && (
            <Field>
              <FieldLabel htmlFor="update-type">Update type</FieldLabel>
              <Choice
                id="update-type"
                label="Update type"
                value={actual}
                onChange={setKind}
                options={options}
                disabled={busy}
              />
            </Field>
          )}
          {actual === "Progress" && (
            <Field>
              <FieldLabel htmlFor="progress-value">Progress percentage</FieldLabel>
              <Input
                id="progress-value"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                required
                disabled={busy}
              />
              <FieldDescription>
                100% means ready for review. It does not approve the task.
              </FieldDescription>
            </Field>
          )}
          {actual === "Time logged" && (
            <Field>
              <FieldLabel htmlFor="effort-minutes">
                Time spent today, in minutes
              </FieldLabel>
              <Input
                id="effort-minutes"
                type="number"
                min="1"
                max="1440"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                required
                disabled={busy}
              />
              <FieldDescription>
                Task effort is separate from attendance and login time.
              </FieldDescription>
            </Field>
          )}
          {actual === "Blocker reported" && (
            <Field>
              <FieldLabel htmlFor="blocker-type">What is blocking you?</FieldLabel>
              <Choice
                id="blocker-type"
                label="Blocker type"
                value={blockType}
                onChange={setBlockType}
                options={[
                  "Missing input",
                  "Awaiting feedback",
                  "Tool or access",
                  "Workload",
                  "Other",
                ]}
                disabled={busy}
              />
              {blockType === "Other" && (
                <FieldDescription>
                  Explain the issue, its impact and the help you need below.
                </FieldDescription>
              )}
              <FieldLabel htmlFor="blocker-severity">Severity</FieldLabel>
              <Choice
                id="blocker-severity"
                label="Blocker severity"
                value={severity}
                onChange={setSeverity}
                options={["Low", "Medium", "High"]}
                disabled={busy}
              />
              <FieldDescription>
                Routes an issue to{" "}
                {task.manager || policy.reviewStages[1]?.label || "Reporting manager"}.
                Your deadline stays unchanged.
              </FieldDescription>
            </Field>
          )}
          {actual === "Deadline request" && (
            <Field>
              <FieldLabel htmlFor="requested-due">Requested deadline · IST</FieldLabel>
              <Input
                type="datetime-local"
                id="requested-due"
                value={due}
                onChange={(e) => setDue(e.target.value)}
                required
                disabled={busy}
              />
              <FieldDescription>
                Your current deadline stays in place until your manager decides.
              </FieldDescription>
            </Field>
          )}
          {actual === "Submission" && (
            <>
              <Field>
                <FieldLabel htmlFor="deliverable-vertical">Work vertical</FieldLabel>
                <Choice
                  id="deliverable-vertical"
                  label="Work vertical"
                  value={vertical}
                  onChange={(v) => {
                    setVertical(v);
                    setCategory(creativeCategories[v][0]);
                  }}
                  options={[
                    { value: "social", label: "Social media" },
                    { value: "internal", label: "Non-social / internal communication" },
                  ]}
                />
                <FieldLabel htmlFor="deliverable-category">Category</FieldLabel>
                <Choice
                  id="deliverable-category"
                  label="Deliverable category"
                  value={category}
                  onChange={setCategory}
                  options={creativeCategories[vertical]}
                />
              </Field>
              {initialDraft?.attachments?.length > 0 && !attachments.length && (
                <p className="muted-copy">
                  Retained files: {initialDraft.attachments.map((f) => f.name).join(", ")}
                  . Choosing new files replaces this selection.
                </p>
              )}
              <div className="media-type-grid" aria-label="Deliverable types">
                {mediaTypes.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="media-type-option"
                      aria-pressed={media === index}
                      onClick={() => setMedia(media === index ? null : index)}
                    >
                      <Icon size={17} />
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </button>
                  );
                })}
              </div>
              <Field>
                <FieldLabel htmlFor="submission-file">Attach deliverable</FieldLabel>
                <Input
                  type="file"
                  id="submission-file"
                  disabled={busy}
                  multiple
                  accept={
                    media == null
                      ? "image/*,video/*,audio/*,.pdf,.ai,.psd,.eps,.indd,.fig,.pptx,.zip"
                      : mediaTypes[media].extensions
                  }
                  onChange={(e) => {
                    const selected = Array.from(e.target.files);
                    if (selected.some((file) => file.size > 25 * 1024 * 1024)) {
                      setError("Choose files under 25 MB each.");
                      e.target.value = "";
                      return;
                    }
                    setAttachments(selected);
                    setFile(selected.map((file) => file.name).join(", "));
                    setError("");
                  }}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="source-link">File name or source link</FieldLabel>
                <Input
                  id="source-link"
                  value={file}
                  onChange={(e) => setFile(e.target.value)}
                  required
                  disabled={busy}
                  placeholder="Choose a file above or paste a shared link"
                />
                <FieldDescription>
                  Selected files are saved on this device for this preview. Shared links
                  remain external.
                </FieldDescription>
              </Field>
            </>
          )}
          <Field data-invalid={!!error}>
            <FieldLabel htmlFor="work-note">
              {actual === "Submission"
                ? task.versions.length
                  ? "What changed in this revision?"
                  : "What are you submitting for the first review?"
                : actual === "Blocker reported"
                  ? "What is stopping your work?"
                  : actual === "Deadline request"
                    ? "Why is more time needed?"
                    : "What changed?"}
            </FieldLabel>
            <Textarea
              id="work-note"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-invalid={!!error}
              required
              disabled={busy}
              placeholder="Add the context your team needs."
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
        </FieldGroup>
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onDone} disabled={busy}>
            Cancel
          </Button>
          {actual === "Submission" && (
            <Button
              type="submit"
              value="draft"
              variant="outline"
              disabled={busy}
              formNoValidate
            >
              Save working draft
            </Button>
          )}
          <SaveButton busy={busy}>
            {actual === "Submission"
              ? `Submit to ${reviewer.toLowerCase()}`
              : actual === "Blocker reported"
                ? "Raise blocker"
                : actual === "Deadline request"
                  ? "Request extension"
                  : "Save update"}
          </SaveButton>
        </div>
      </form>
      <Dialog.Root
        open={conflict}
        onOpenChange={(open) => {
          if (!busy) setConflict(open);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="draft-dialog-overlay" />
          <Dialog.Content className="draft-dialog">
            <Dialog.Title>Handle your working draft</Dialog.Title>
            <Dialog.Description>
              A draft is still saved. Choose what to keep before submitting this version.
            </Dialog.Description>
            <label>
              <input
                type="radio"
                name="draft-choice"
                checked={draftChoice === "discard"}
                onChange={() => setDraftChoice("discard")}
              />{" "}
              Remove draft and submit this version
            </label>
            <label>
              <input
                type="radio"
                name="draft-choice"
                checked={draftChoice === "note"}
                onChange={() => setDraftChoice("note")}
              />{" "}
              Keep draft details as a work note, then submit
            </label>
            {draftChoice === "note" && (
              <label>
                Remark
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="Why should these draft details be kept?"
                />
              </label>
            )}
            {error && <p role="alert">{error}</p>}
            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setConflict(false)}
              >
                Cancel — keep draft
              </Button>
              <Button
                type="button"
                disabled={busy}
                onClick={() => save(null, draftChoice)}
              >
                {busy ? "Submitting…" : "Continue submission"}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
function TaskFiles({ task, onEdit }) {
  const [fileError, setFileError] = useState("");
  const policy = useRolePolicy();
  return (
    <>
      {fileError && (
        <p role="alert" className="error-copy">
          {fileError}
        </p>
      )}
      <div className="detail-section-title">
        <h3>Files & revisions</h3>
        <Badge variant="secondary">
          {task.versions.length + (task.workingDrafts?.length || 0)}
        </Badge>
      </div>
      {task.workingDrafts?.length > 0 && (
        <section className="working-drafts">
          <h3>Working drafts</h3>
          {[...task.workingDrafts].reverse().map((draft) => (
            <article key={draft.id}>
              <div>
                <strong>{draft.file}</strong>
                <p>{draft.note}</p>
                <small>{format(draft.at)}</small>
                {draft.attachments?.map((attachment) => (
                  <Button
                    key={attachment.id}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadProof(attachment).catch((e) => setFileError(e.message))
                    }
                  >
                    {attachment.name}
                  </Button>
                ))}
              </div>
              <div>
                <Badge variant="secondary">Not submitted</Badge>
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(draft)}>
                    Edit draft
                  </Button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
      {task.versions.length ? (
        <div className="version-list">
          {[...task.versions].reverse().map((v) => {
            let link = null;
            try {
              const url = new URL(v.file);
              if (url.protocol === "https:") link = url.href;
            } catch {}
            return (
              <article key={v.number}>
                <div className="file-symbol">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="version-heading">
                    <strong>{v.file}</strong>
                    <Badge variant="outline">
                      {v.number === task.versions.length
                        ? "Latest"
                        : `Version ${v.number}`}
                    </Badge>
                  </div>
                  <Badge variant="secondary">
                    {v.number === task.versions.length
                      ? task.status === "Completed"
                        ? "Approved"
                        : task.status === "Changes requested"
                          ? "Changes requested"
                          : isInReview(task)
                            ? `${stageOf(task)} / ${reviewLabel(task, policy)}`
                            : "Submitted"
                      : "Earlier submission"}
                  </Badge>
                  <p>{v.note}</p>
                  {v.attachments?.map((attachment) => (
                    <Button
                      key={attachment.id}
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        downloadProof(attachment).catch((e) => setFileError(e.message))
                      }
                    >
                      <Paperclip size={14} />
                      {attachment.name}
                    </Button>
                  ))}
                  <small>
                    Version {v.number} · {format(v.at)}
                  </small>
                </div>
                {link && (
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open version ${v.number}`}
                    >
                      <ExternalLink />
                    </a>
                  </Button>
                )}
              </article>
            );
          })}
        </div>
      ) : task.workingDrafts?.length ? (
        <p className="muted-copy">No revision submitted for review yet.</p>
      ) : (
        <Blank
          icon={Paperclip}
          title="Your first version starts here"
          text="Upload and submit a revision above. Every revision stays attached to this task."
        />
      )}
    </>
  );
}
function ReviewCycle({ task, policy, onViewActivity }) {
  const events = task.events.filter((event) =>
    ["In review", "Changes requested", "Completed"].includes(event.action),
  );
  if (!events.length && !task.versions.length) return null;
  const revisions = events.filter((event) => event.action === "Changes requested").length;
  const current =
    task.status === "Changes requested"
      ? "Revision requested"
      : task.status === "Completed"
        ? "Approved"
        : isInReview(task)
          ? stageOf(task)
          : "Not submitted";
  return (
    <section className="review-cycle" aria-label="Review and revision history">
      <div className="review-cycle-heading">
        <div>
          <h3>Review & revisions</h3>
          <p>
            {task.versions.length
              ? `${task.versions.length} ${task.versions.length === 1 ? "version" : "versions"} · ${revisions} ${revisions === 1 ? "revision" : "revisions"}`
              : "No version submitted yet"}
          </p>
        </div>
        <Badge variant={task.status === "Changes requested" ? "outline" : "secondary"}>
          {current}
        </Badge>
      </div>
      <p className="review-cycle-route">
        Review route · You →{" "}
        {policy.reviewStages
          .map((stage) => (stage.optional ? `${stage.label} when selected` : stage.label))
          .join(" → ")}
      </p>
      {events.length ? (
        <ol className="review-cycle-list">
          {events.slice(-4).map((event, index) => (
            <li key={`${event.at}-${index}`}>
              <span className="review-cycle-node" aria-hidden="true">
                {event.action === "Completed" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <MessageSquare size={14} />
                )}
              </span>
              <div>
                <strong>
                  {event.action === "In review"
                    ? "Submitted for review"
                    : event.action === "Changes requested"
                      ? "Changes requested"
                      : "Approved and closed"}
                </strong>
                <p>{event.detail || "Review stage updated."}</p>
                <small>
                  {event.by === event.role
                    ? event.by
                    : [event.by, event.role].filter(Boolean).join(" · ")}{" "}
                  · {format(event.at)}
                </small>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="review-cycle-empty">
          Submit your first version when the brief is ready. The configured review chain
          starts with {policy.reviewStages[0].label}.
        </p>
      )}
      {isInReview(task) && (
        <p className="review-cycle-next">
          Current reviewer: <strong>{reviewLabel(task, policy)}</strong>
        </p>
      )}
      {task.status === "Changes requested" && (
        <p className="review-cycle-next">
          Next step: <strong>update your work and submit a new version</strong>
        </p>
      )}
      <Button variant="ghost" size="sm" onClick={onViewActivity}>
        View full activity
        <ArrowRight size={14} />
      </Button>
    </section>
  );
}
export default function TaskPage({ task, employee, now, mutate, onBack, backLabel }) {
  const classification = classifyCreative(task);
  const policy = useRolePolicy(),
    reviewer = policy.reviewStages[0].label;
  const [editingDraft, setEditingDraft] = useState(null);
  const [mode, setMode] = useState(null),
    [tab, setTab] = useState("work"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const editable =
      (!task.ownerId || task.ownerId === employee.id) &&
      hasCapability(policy, "task.update.own"),
    closed = task.status === "Completed",
    active = ["Assigned", "In progress", "Changes requested"].includes(task.status),
    overdue = reportingState(task, now) === "Overdue",
    step = task.status === "Assigned" ? 0 : closed ? 3 : isInReview(task) ? 2 : 1;
  async function start() {
    setBusy(true);
    setError("");
    try {
      await mutate(
        (s) =>
          task.status === "Assigned"
            ? startTask(s, task.id, now)
            : recordActivity(
                s,
                task.id,
                "Resume work",
                { note: "Manager resolved the issue. Work resumed." },
                now,
              ),
        "Ready to continue.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function updateChecklist(item, checked) {
    setError("");
    setBusy(true);
    try {
      await mutate((s) => setBriefChecklistItem(s, task.id, item.id, checked, now));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="task-page" aria-label="Task details">
      <div className="task-detail-layout task-detail-with-heading">
        <div className="task-main-column">
          <PageHeading
            title={task.title}
            besideTitle={
              <div className="task-title-facts" aria-label="Deadline and effort">
                <div>
                  <span>Deadline</span>
                  <strong>
                    <Clock3 className="deadline-clock" size={17} aria-hidden="true" />
                    {format(task.due)}
                  </strong>
                </div>
                <span className="task-facts-divider" aria-hidden="true" />
                <div>
                  <span>Time spent today</span>
                  <strong>
                    {Math.floor(dailyEffort(task, now) / 60)}h{" "}
                    {dailyEffort(task, now) % 60}m
                  </strong>
                </div>
              </div>
            }
            description={`Assigned by ${task.assignedBy} · Review with ${reviewLabel(task, policy)}`}
            afterDescription={
              <div className="task-status-line">
                <StatusBadge task={task} />
                {overdue && <Badge variant="destructive">Overdue</Badge>}
                <Badge variant="secondary">{task.priority || "Normal"} priority</Badge>
              </div>
            }
            onBack={onBack}
            backLabel={backLabel}
          >
            <div className="task-id-line">
              <span>{task.id}</span>
              <span>{classification.vertical}</span>
              <span>{classification.category}</span>
            </div>
          </PageHeading>
          <div className="task-page-body">
            <div className="task-overview-heading">
              <h2>Task overview</h2>
            </div>
            <Tabs
              orientation="vertical"
              className="task-internal-layout"
              value={tab}
              onValueChange={(value) => {
                setTab(value);
                setMode(null);
                setEditingDraft(null);
              }}
            >
              <TabsList variant="line" className="detail-tabs">
                <TabsTrigger value="work">Details</TabsTrigger>
                <TabsTrigger value="files" aria-label="Files & revisions">
                  Files & revisions{" "}
                  <span className="task-tab-count">
                    {task.versions.length + (task.workingDrafts?.length || 0)}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="activity" aria-label="Activity">
                  Activity <span className="task-tab-count">{task.events.length}</span>
                </TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
              </TabsList>
              <div className="task-content-area">
                <TabsContent value="work">
                  {mode ? (
                    <>
                      <h3 className="detail-section-title">
                        {mode === "submit"
                          ? "Submit for review"
                          : mode === "deadline"
                            ? "Request more time"
                            : "Add a work update"}
                      </h3>
                      {mode === "update" ? (
                        <>
                          <TaskWorkingNote task={task} now={now} mutate={mutate} />
                          <Button variant="ghost" onClick={() => setMode(null)}>
                            Back to details
                          </Button>
                        </>
                      ) : (
                        <ActionForm
                          key={mode}
                          task={task}
                          now={now}
                          mutate={mutate}
                          mode={mode}
                          onDone={() => setMode(null)}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      <h3 className="detail-section-title">Task description</h3>
                      <p className="brief-copy">{task.description || task.brief}</p>
                      <div className="task-input-output">
                        <section>
                          <h3>Inputs & references</h3>
                          {task.references?.length ? (
                            <ul>
                              {task.references.map((ref, i) => (
                                <li key={i}>{ref.name || String(ref)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>
                              Use the supplied brief. No additional source references
                              recorded.
                            </p>
                          )}
                        </section>
                        <section>
                          <h3>Expected outputs</h3>
                          {task.outputs?.length || task.criteria?.length ? (
                            <ul>
                              {(task.outputs || task.criteria).map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>Follow the deliverables specified in the brief.</p>
                          )}
                        </section>
                      </div>
                      {task.checklist?.length > 0 && (
                        <section className="brief-checklist" aria-label="Brief checklist">
                          <div className="brief-checklist-heading">
                            <div>
                              <h3>Brief checklist</h3>
                              <p>Track the details this deliverable needs.</p>
                            </div>
                            <span>
                              {task.checklist.filter((item) => item.checked).length}/
                              {task.checklist.length}
                            </span>
                          </div>
                          <ul className="criteria-list">
                            {task.checklist.map((item) => (
                              <li key={item.id}>
                                <input
                                  type="checkbox"
                                  checked={!!item.checked}
                                  disabled={
                                    !editable ||
                                    closed ||
                                    busy ||
                                    (task.status === "Blocked" && task.blocker?.open)
                                  }
                                  aria-label={item.text}
                                  onChange={(event) =>
                                    updateChecklist(item, event.target.checked)
                                  }
                                />
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                          {task.status === "Blocked" && task.blocker?.open && (
                            <p className="checklist-hint">
                              Checklist updates are paused until the blocker is resolved.
                            </p>
                          )}
                        </section>
                      )}
                      <Separator />
                      {!editable ? (
                        <Alert>
                          <LockKeyhole />
                          <AlertTitle>Transferred to another owner</AlertTitle>
                          <AlertDescription>
                            Your contributions remain in Activity. Only the current owner
                            can update this task.
                          </AlertDescription>
                        </Alert>
                      ) : closed ? (
                        <Alert>
                          <ShieldCheck />
                          <AlertTitle>Approved and closed</AlertTitle>
                          <AlertDescription>
                            Accepted files and work history are preserved. Completion
                            points depend on configured scoring rules.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="task-actions">
                          {task.status === "Assigned" && (
                            <Button onClick={start} disabled={busy}>
                              <Play data-icon="inline-start" />
                              {busy ? "Starting…" : "Start task"}
                            </Button>
                          )}
                          {task.status === "Blocked" && task.blocker?.open === false && (
                            <Button onClick={start} disabled={busy}>
                              Resume work
                            </Button>
                          )}
                          {active && hasCapability(policy, "task.submit.own") && (
                            <Button
                              onClick={() => {
                                setTab("files");
                                setMode("submit");
                              }}
                            >
                              <Send data-icon="inline-start" />
                              {task.status === "Changes requested"
                                ? "Resubmit for review"
                                : "Submit for review"}
                            </Button>
                          )}
                          <Button variant="outline" onClick={() => setMode("update")}>
                            Add update
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setTab("requests");
                              setMode("deadline");
                            }}
                            disabled={
                              !hasCapability(policy, "deadline.request.own") ||
                              task.deadlineRequest?.status === "Awaiting manager decision"
                            }
                          >
                            Request more time
                          </Button>
                        </div>
                      )}
                      {isInReview(task) && (
                        <p className="muted-copy">
                          {stageOf(task)} with {reviewLabel(task, policy)}. You can add
                          context while the reviewer checks your work.
                        </p>
                      )}
                      {error && <FieldError>{error}</FieldError>}
                      {editable && !closed && (
                        <TaskWorkingNote task={task} now={now} mutate={mutate} />
                      )}
                      <details className="deadline-history">
                        <summary>Deadline & handover history</summary>
                        <p>Original deadline: {format(task.originalDue)}</p>
                        <p>{task.deadlineDecision || "No deadline change recorded."}</p>
                        {task.events
                          .filter((e) => /reassign|transfer/i.test(e.action))
                          .map((e, i) => (
                            <p key={i}>
                              {e.detail} · {e.by} · {format(e.at)}
                            </p>
                          ))}
                      </details>
                    </>
                  )}
                </TabsContent>
                <TabsContent value="files">
                  <div className="files-review-status">
                    <StatusBadge task={task} />
                    <p>
                      {isInReview(task)
                        ? `${stageOf(task)} by ${reviewLabel(task, policy)}`
                        : task.status === "Changes requested"
                          ? "Changes requested. Prepare your next revision."
                          : closed
                            ? "Approved and closed"
                            : "Ready for your next submission"}
                    </p>
                  </div>
                  {mode === "submit" ? (
                    <ActionForm
                      key={editingDraft?.id || "new"}
                      task={task}
                      now={now}
                      mutate={mutate}
                      mode="submit"
                      initialDraft={editingDraft}
                      onDone={() => {
                        setMode(null);
                        setEditingDraft(null);
                      }}
                    />
                  ) : (
                    editable &&
                    !closed &&
                    active &&
                    hasCapability(policy, "task.submit.own") && (
                      <Button onClick={() => setMode("submit")}>
                        Upload & submit a revision
                      </Button>
                    )
                  )}
                  <TaskFiles
                    task={task}
                    onEdit={
                      editable && !closed && active
                        ? (draft) => {
                            setEditingDraft(draft);
                            setMode("submit");
                          }
                        : null
                    }
                  />
                  <ReviewCycle
                    task={task}
                    policy={policy}
                    onViewActivity={() => setTab("activity")}
                  />
                </TabsContent>
                <TabsContent value="activity">
                  <TaskActivity task={task} />
                </TabsContent>
                <TabsContent value="requests">
                  <h3 className="detail-section-title">Requests & blockers</h3>
                  {(mode === "deadline" || mode === "blocker") && (
                    <ActionForm
                      key={mode}
                      task={task}
                      now={now}
                      mutate={mutate}
                      mode={mode}
                      onDone={() => setMode(null)}
                    />
                  )}
                  <p className="muted-copy">
                    Ask for time or record an issue. Your manager decides changes to the
                    deadline.
                  </p>
                  {task.deadlineRequest ? (
                    <div className="request-record">
                      <h3>Deadline extension</h3>
                      <p>{task.deadlineRequest.status}</p>
                      <p>Requested date: {format(task.deadlineRequest.requestedDue)}</p>
                      <p>{task.deadlineRequest.reason}</p>
                    </div>
                  ) : (
                    <p className="muted-copy">No deadline extension requested.</p>
                  )}
                  {task.blocker && (
                    <div className="request-record">
                      <h3>{task.blocker.open ? "Open blocker" : "Resolved blocker"}</h3>
                      <p>{task.blocker.reason}</p>
                      <p>{task.blocker.resolution}</p>
                    </div>
                  )}
                  {editable &&
                    !closed &&
                    hasCapability(policy, "deadline.request.own") && (
                      <Button
                        variant="outline"
                        disabled={
                          task.deadlineRequest?.status === "Awaiting manager decision"
                        }
                        onClick={() => setMode("deadline")}
                      >
                        Request more time
                      </Button>
                    )}
                  {editable &&
                    !closed &&
                    active &&
                    hasCapability(policy, "issue.raise.own") && (
                      <Button
                        className="raise-blocker-action"
                        variant="outline"
                        onClick={() => setMode("blocker")}
                      >
                        Report missing input or blocker
                      </Button>
                    )}
                </TabsContent>
              </div>
            </Tabs>
            <p className="task-boundary">
              <ShieldCheck size={14} />
              Work reviews go to the review chain. Daily reports remain private to their
              recipients.
            </p>
          </div>
        </div>
        <div className="task-right-rail">
          <TaskJourney task={task} />
          <TaskAttention task={task} overdue={overdue} reviewer={reviewer} />
        </div>
      </div>
    </section>
  );
}
