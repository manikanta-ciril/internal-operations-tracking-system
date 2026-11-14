import { useState } from "react";
import { Save, Send } from "lucide-react";
import { Button } from "../../../shared/work-ui/button";
import { Input } from "../../../shared/work-ui/input";
import { Textarea } from "../../../shared/work-ui/textarea";

import FileUpload from "../../../components/ui/file-upload";
import EvidenceFile from "../EvidenceFile";

const lines = (value) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
export default function TaskAssignmentForm({
  directory,
  busy,
  onSave,
  initial = {},
  onCancel,
}) {
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState("");
  const [ownerId, setOwnerId] = useState(initial.ownerId || "");
  const users = Array.isArray(directory) ? directory : directory?.users || [];
  const managers = users.filter(
    (person) =>
      !person.oversight &&
      !person.roles?.some((role) => (role.code || role) === "chairman") &&
      (person.manager ||
        person.roles?.some((role) =>
          ["general-manager", "senior-manager"].includes(role.code || role),
        )),
  );
  async function submit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    await onSave(
      {
        ...values,
        publicationRequired: values.publicationRequired === "on",
        ownerId: Number(values.ownerId),
        reviewerId: Number(values.reviewerId),
        due: new Date(values.due).toISOString(),
        criteria: lines(values.criteria),
        references: lines(values.references),
        deliverables: lines(values.deliverables),
      },
      event.nativeEvent.submitter?.value === "assign",
      files,
    );
  }
  return (
    <form className="management-form" onSubmit={submit}>
      <section className="management-panel">
        <h2>Define the work</h2>
        <p>Give the employee a clear brief and explain what you will review.</p>
        <div className="management-fields">
          <label className="management-wide">
            Task title
            <Input
              name="title"
              required
              maxLength={180}
              defaultValue={initial.title || ""}
              placeholder="What needs to be done?"
            />
          </label>
          <label className="management-wide">
            Brief and instructions
            <Textarea
              name="brief"
              required
              rows={4}
              defaultValue={initial.brief || initial.description || ""}
              placeholder="Explain the work, useful context and expected result."
            />
          </label>
          <label>
            Acceptance checklist
            <Textarea
              name="criteria"
              required
              rows={4}
              defaultValue={(initial.criteria || []).join("\n")}
              placeholder="One check per line"
            />
          </label>
          <label>
            Required deliverables
            <Textarea
              name="deliverables"
              required
              rows={4}
              defaultValue={(initial.deliverables || []).join("\n")}
              placeholder="List the files, records or evidence needed. One per line."
            />
          </label>
          <label className="management-wide">
            References and inputs
            <Textarea
              name="references"
              rows={3}
              defaultValue={(initial.references || []).join("\n")}
              placeholder="Member reference, links or source notes. One per line."
            />
          </label>
          <div className="management-wide assignment-reference-files">
            <h3>Input files for the employee</h3>
            <p>
              Attach the brief, images, documents or source files needed to
              start. Files are shared when you assign the task.
            </p>
            {initial.referenceFiles?.map((file) => (
              <EvidenceFile key={file.id} file={file} />
            ))}
            <FileUpload
              id="assignment-reference-files"
              files={files}
              disabled={busy}
              maxBytes={30 * 1024 * 1024}
              accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.md,.gif,.odt,.ods,.odp,.rtf,.psd,.ai,.fig"
              label="Attach input files"
              onFiles={(selected) => {
                setFileError("");
                setFiles((previous) => [...previous, ...selected]);
              }}
              onRemove={(index) =>
                setFiles((previous) =>
                  previous.filter((_, position) => position !== index),
                )
              }
              onError={setFileError}
            />
            {fileError && <p role="alert">{fileError}</p>}
          </div>
          <label className="management-wide management-checkbox">
            <input
              type="checkbox"
              name="publicationRequired"
              defaultChecked={initial.publicationRequired === true}
            />
            <span>
              Require publication evidence before final approval
              <small>
                Use this when the final published result must be verified, such
                as a live post or released document.
              </small>
            </span>
          </label>
        </div>
      </section>
      <section className="management-panel">
        <h2>Ownership and timing</h2>
        <div className="management-fields">
          <label>
            Accountable employee
            <select
              name="ownerId"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              required
            >
              <option value="">Choose an employee</option>
              {users
                .filter(
                  (person) =>
                    !person.oversight &&
                    person.execute !== false &&
                    !(person.roles || []).some(
                      (role) => (role.code || role) === "chairman",
                    ),
                )
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Responsible reviewer
            <select
              name="reviewerId"
              required
              defaultValue={initial.reviewerId || ""}
            >
              <option value="">Choose a manager</option>
              {managers
                .filter((person) => String(person.id) !== String(ownerId))
                .map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
            </select>
            <small>The owner cannot review their own work.</small>
          </label>
          <label>
            Deadline
            <input
              name="due"
              type="datetime-local"
              required
              defaultValue={
                initial.due
                  ? new Date(
                      new Date(initial.due).getTime() -
                        new Date(initial.due).getTimezoneOffset() * 60000,
                    )
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
            />
          </label>
          <label>
            Priority
            <select name="priority" defaultValue={initial.priority || "Normal"}>
              <option>Normal</option>
              <option>High</option>
            </select>
          </label>
          <label>
            Work category
            <Input
              name="category"
              defaultValue={initial.category || "General work"}
              maxLength={80}
            />
          </label>
        </div>
      </section>
      <div className="management-actions">
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="outline"
          disabled={busy}
        >
          <Save />
          Save draft
        </Button>
        <Button type="submit" name="intent" value="assign" disabled={busy}>
          <Send />
          {busy ? "Saving…" : "Save & assign"}
        </Button>
      </div>
    </form>
  );
}
