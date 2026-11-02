import { useState } from "react";
import { FileText, Paperclip, ExternalLink } from "lucide-react";
import { useRolePolicy } from "./workspace/RoleContext.jsx";
import { isInReview, reviewLabel } from "./workspace/role-policy.js";
import { stageOf } from "../tasks/workflow.js";
import { format } from "../tasks/presentation.js";
import { downloadProof } from "../daily-report/exportTools.js";
import { Button } from "../../shared/work-ui/button.jsx";
import { Badge } from "../../shared/work-ui/badge.jsx";
import { Blank } from "./workspace/WorkspaceUI.jsx";
export default function AssetVersionVault({ task, onEdit }) {
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
                      downloadProof(attachment).catch((e) =>
                        setFileError(e.message),
                      )
                    }
                  >
                    {attachment.name}
                  </Button>
                ))}
              </div>
              <div>
                <Badge variant="secondary">Not submitted</Badge>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(draft)}
                  >
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
                        downloadProof(attachment).catch((e) =>
                          setFileError(e.message),
                        )
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
