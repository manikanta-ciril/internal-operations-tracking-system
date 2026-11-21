import { useState } from "react";
import { ArrowLeft, CheckCheck } from "lucide-react";
import { Button } from "../../../shared/work-ui/button";
import { Badge } from "../../../shared/work-ui/badge";
import { Textarea } from "../../../shared/work-ui/textarea";
import FileUpload from "../../../components/ui/file-upload";
import TaskActivity from "../TaskActivity";
import EvidenceFile from "../EvidenceFile";
import TaskRating from "../TaskRating";
import { nextWorkStep } from "../next-step";
import { date, terminal } from "./management-presentation";

export default function ManagerTask({
  task,
  people,
  person,
  canManage,
  busy,
  action,
  currentUser,
  onBack,
  onEdit,
  uploadReference,
}) {
  const [fileError, setFileError] = useState(""),
    [command, setCommand] = useState(""),
    [note, setNote] = useState(""),
    [personId, setPersonId] = useState("");
  const own = String(task.ownerId) === String(currentUser?.id);
  const review = /review/i.test(task.status) && !terminal(task);
  const mayReview =
    canManage && !own && String(task.reviewerId) === String(currentUser?.id);
  const managers = people.filter(
    (item) =>
      item.manager ||
      item.roles?.some((role) =>
        ["general-manager", "senior-manager"].includes(role.code || role),
      ),
  );
  async function send(event) {
    event.preventDefault();
    const fields = { note };
    if (command === "approve") fields.acceptanceConfirmed = true;
    if (command === "reassign") fields.ownerId = Number(personId);
    if (command === "delegate-reviewer") fields.reviewerId = Number(personId);
    if (await action(task, command, fields)) {
      setCommand("");
      setNote("");
    }
  }
  const versions = task.versions || task.submissions || [];
  const next = nextWorkStep(task, person);
  return (
    <>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft />
        Back to queue
      </Button>
      <div className="management-current">
        <div>
          <small>Current status</small>
          <strong>{task.status}</strong>
          <span>
            {task.id} · {task.priority} priority
          </span>
        </div>
        <div>
          <small>Employee</small>
          <strong>{person(task.ownerId)}</strong>
          <span>Reviewer: {person(task.reviewerId)}</span>
        </div>
        <div>
          <small>Approved deadline</small>
          <strong>{date(task.due)}</strong>
          <span>Original: {date(task.originalDue || task.due)}</span>
        </div>
      </div>
      <div className="management-detail">
        <div>
          <section className="management-panel">
            <h2>Work brief</h2>
            <p className="management-preserve">
              {task.brief || task.description}
            </p>
            {[
              ["Acceptance checklist", task.criteria || task.checklist],
              ["Deliverables", task.deliverables],
              ["References", task.references],
            ].map(([label, items]) =>
              items?.length ? (
                <div key={label}>
                  <h3>{label}</h3>
                  <ul>
                    {items.map((item, index) => (
                      <li key={index}>
                        {typeof item === "string"
                          ? item
                          : item.text || item.label || item.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </section>
          <section className="management-panel">
            <h2>Submitted evidence</h2>
            {fileError && <p role="alert">{fileError}</p>}
            {versions.length ? (
              [...versions].reverse().map((version, index) => (
                <article
                  className="management-version"
                  key={version.id || index}
                >
                  <h3>
                    {version.version ||
                      version.tag ||
                      (version.number ? "Version " + version.number : "") ||
                      "Version " + (versions.length - index)}
                  </h3>
                  <p>{version.note || version.changeNotes}</p>
                  <small>
                    {date(version.submittedAt || version.at)} ·{" "}
                    {version.status || "Submitted"}
                  </small>
                  {(version.attachments || version.files || []).map(
                    (file, i) => (
                      <EvidenceFile key={file.id || i} file={file} />
                    ),
                  )}
                  {(version.reviewNote ||
                    task.submissions?.find(
                      (item) => item.version === version.number,
                    )?.reviewNote) && (
                    <p>
                      Review:{" "}
                      {version.reviewNote ||
                        task.submissions?.find(
                          (item) => item.version === version.number,
                        )?.reviewNote}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p>No version has been submitted yet.</p>
            )}
          </section>
          <section className="management-panel">
            <TaskActivity task={{ ...task, events: task.events || [] }} />
          </section>
        </div>
        <aside>
          <section className="management-panel">
            <h2>Next step</h2>
            <div className="decision-summary">
              <strong>{next.actor}</strong>
              <p>{next.instruction}</p>
            </div>
            {canManage && task.status === "Draft" && (
              <div className="management-decision">
                <Button disabled={busy} onClick={() => action(task, "assign")}>
                  Assign this work
                </Button>
                <Button variant="outline" onClick={onEdit}>
                  Edit draft
                </Button>
              </div>
            )}
            {mayReview && review && (
              <div className="management-decision">
                {!task.reviewOpened && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => action(task, "review-start")}
                  >
                    Start review
                  </Button>
                )}
                <Button
                  disabled={
                    busy ||
                    (task.publicationRequired &&
                      !task.publicationProof?.fileIds?.length)
                  }
                  onClick={() => setCommand("approve")}
                >
                  <CheckCheck />
                  Approve work
                </Button>
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() => setCommand("changes")}
                >
                  Request changes
                </Button>
                {task.publicationRequired &&
                  !task.publicationProof?.fileIds?.length && (
                    <p>
                      Publication evidence is required before final approval.
                      The employee can attach it from their work record.
                    </p>
                  )}
              </div>
            )}
            {canManage && task.blocker?.open && (
              <Button variant="outline" onClick={() => setCommand("resolve")}>
                Resolve blocker
              </Button>
            )}
            {canManage && !terminal(task) && task.status !== "Draft" && (
              <div className="management-tools">
                <div className="management-decision">
                  {task.status !== "In review" && (
                    <Button
                      variant="outline"
                      onClick={() => setCommand("reassign")}
                    >
                      Reassign work
                    </Button>
                  )}

                  <Button variant="ghost" onClick={() => setCommand("cancel")}>
                    Cancel task
                  </Button>
                </div>
              </div>
            )}
            {!canManage && (
              <p>Read-only view. GM and SM manage assignment and review.</p>
            )}
            {own && canManage && review && (
              <p>Your work must be reviewed by another eligible manager.</p>
            )}
            <TaskRating
              task={task}
              busy={busy}
              onRate={
                mayReview ? (values) => action(task, "rate", values) : undefined
              }
            />
            {command && (
              <form className="decision-form" onSubmit={send}>
                <h2>
                  {
                    {
                      approve: "Approve evidence",
                      changes: "Request changes",
                      resolve: "Resolve blocker",
                      reassign: "Reassign work",
                      "delegate-reviewer": "Change reviewer",
                      cancel: "Cancel task",
                    }[command]
                  }
                </h2>
                {["reassign", "delegate-reviewer"].includes(command) && (
                  <label>
                    Choose person
                    <select
                      required
                      value={personId}
                      onChange={(event) => setPersonId(event.target.value)}
                    >
                      <option value="">Choose a person</option>
                      {(command === "delegate-reviewer" ? managers : people)
                        .filter(
                          (item) =>
                            !item.oversight &&
                            (command !== "reassign" ||
                              (item.execute !== false &&
                                String(item.id) !== String(task.ownerId))) &&
                            String(item.id) !==
                              String(
                                command === "delegate-reviewer"
                                  ? task.ownerId
                                  : task.reviewerId,
                              ),
                        )
                        .map((item) => (
                          <option value={item.id} key={item.id}>
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </label>
                )}
                <label>
                  Decision note
                  <Textarea
                    required
                    minLength={3}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Explain the decision clearly."
                  />
                </label>
                {command === "approve" && (
                  <label className="management-checkbox">
                    <input type="checkbox" required />
                    <span>
                      I checked the evidence against the acceptance checklist
                      and required deliverables.
                    </span>
                  </label>
                )}
                <div className="management-actions">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setCommand("")}
                  >
                    Back
                  </Button>
                  <Button disabled={busy} type="submit">
                    {busy ? "Saving…" : "Save decision"}
                  </Button>
                </div>
              </form>
            )}
          </section>
          {canManage && task.status === "Draft" && (
            <section className="management-panel">
              <h2>Reference files</h2>
              <p>Attach the inputs the employee needs before assignment.</p>
              <FileUpload
                files={[]}
                onFiles={uploadReference}
                onRemove={() => {}}
                onError={setFileError}
                disabled={busy}
                maxBytes={30 * 1024 * 1024}
                accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.md,.gif,.odt,.ods,.odp,.rtf,.psd,.ai,.fig"
                label="Attach reference files"
              />
              {fileError && <p role="alert">{fileError}</p>}
            </section>
          )}
          {task.referenceFiles?.length > 0 && (
            <section className="management-panel">
              <h2>Reference files</h2>
              {task.referenceFiles.map((file) => (
                <EvidenceFile key={file.id} file={file} />
              ))}
            </section>
          )}
          {task.publicationRequired && (
            <section className="management-panel">
              <h2>Publication evidence</h2>
              {task.publicationProof ? (
                <>
                  <p>{task.publicationProof.note}</p>
                  {(task.publicationProof.fileIds || [])
                    .map((id) => task.files?.find((file) => file.id === id))
                    .filter(Boolean)
                    .map((file) => (
                      <EvidenceFile key={file.id} file={file} />
                    ))}
                </>
              ) : (
                <p>
                  Not submitted yet. Final approval will remain unavailable
                  until publication evidence is saved.
                </p>
              )}
            </section>
          )}
          {task.blocker && (
            <section className="management-panel">
              <h2>Blocker</h2>
              <p>{task.blocker.reason || task.blocker.note}</p>
              <Badge variant="outline">
                {task.blocker.open ? "Open" : "Resolved"}
              </Badge>
              {task.blocker.resolution && <p>{task.blocker.resolution}</p>}
            </section>
          )}
          {task.deadlineRequest && (
            <section className="management-panel">
              <h2>Deadline request</h2>
              <p>{task.deadlineRequest.reason || task.deadlineRequest.note}</p>
              <p>Requested: {date(task.deadlineRequest.requestedDue)}</p>
              <Badge variant="outline">{task.deadlineRequest.status}</Badge>
              {canManage &&
                task.deadlineRequest.status === "Pending" &&
                String(task.deadlineRequest.requesterId) !==
                  String(currentUser?.id) && (
                  <div className="management-decision">
                    <Button
                      disabled={busy}
                      onClick={() =>
                        action(task, "decide-deadline", {
                          decision: "approve",
                          note: "Requested deadline approved.",
                        })
                      }
                    >
                      Approve extension
                    </Button>
                    <Button
                      variant="outline"
                      disabled={busy}
                      onClick={() =>
                        action(task, "decide-deadline", {
                          decision: "decline",
                          note: "Current deadline retained.",
                        })
                      }
                    >
                      Decline extension
                    </Button>
                  </div>
                )}
            </section>
          )}
        </aside>
      </div>
    </>
  );
}
