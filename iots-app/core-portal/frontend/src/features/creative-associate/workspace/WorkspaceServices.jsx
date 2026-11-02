import PageHeading from "./PageHeading.jsx";
import { Button } from "../../../shared/work-ui/button.jsx";
import { creativeCategories } from "./creative-categories.js";
import { downloadProof } from "../../daily-report/exportTools.js";
import { format } from "../../tasks/presentation.js";
import { useState } from "react";
const titles = {
  assets: "Files & proofs",
  scope: "Creative scope",
  attendance: "Attendance",
  requests: "My requests",
  blockers: "Blockers & help",
  messages: "Work messages",
  standing: "My performance",
};
export default function WorkspaceServices({ view, tasks, onOpen, onBack }) {
  const [error, setError] = useState("");
  const records =
    view === "requests"
      ? tasks.filter((t) => t.deadlineRequest)
      : view === "blockers"
        ? tasks.filter((t) => t.blocker?.open)
        : view === "assets"
          ? tasks.filter((t) => t.versions.length || t.workingDrafts?.length)
          : [];
  return (
    <section>
      <PageHeading
        onBack={onBack}
        title={titles[view]}
        description={
          view === "scope"
            ? "Your creative work categories and communication verticals."
            : "Your workspace, organised around your work."
        }
      />
      {error && <p role="alert">{error}</p>}
      {view === "scope" ? (
        <div className="scope-columns">
          {Object.entries(creativeCategories).map(([key, categories]) => (
            <section key={key}>
              <h2>
                {key === "social" ? "Social media" : "Internal communication"}
              </h2>
              <p className="muted-copy">{categories.length} categories</p>
              <ul>
                {categories.map((category) => (
                  <li key={category}>{category}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : records.length ? (
        <div className="service-records">
          {records.map((task) => (
            <article key={task.id}>
              <div>
                <small>{task.id}</small>
                <h2>{task.title}</h2>
                {view === "requests" && (
                  <p>
                    {task.deadlineRequest.reason} ·{" "}
                    {task.deadlineRequest.status}
                  </p>
                )}
                {view === "blockers" && (
                  <p>
                    {task.blocker.reason} · {task.blocker.severity}
                  </p>
                )}
                {view === "assets" &&
                  [...(task.workingDrafts || []), ...task.versions].map(
                    (version, i) => (
                      <div key={i}>
                        <p>
                          {version.file} ·{" "}
                          {version.number
                            ? `Version ${version.number}`
                            : "Working draft"}{" "}
                          · {format(version.at)}
                        </p>
                        {version.attachments?.map((file) => (
                          <Button
                            key={file.id}
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              downloadProof(file).catch((e) =>
                                setError(e.message),
                              )
                            }
                          >
                            {file.name}
                          </Button>
                        ))}
                      </div>
                    ),
                  )}
              </div>
              <Button variant="outline" onClick={() => onOpen(task.id)}>
                Open task
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="service-empty">
          <h2>
            {["requests", "blockers", "assets"].includes(view)
              ? "Nothing here yet"
              : "Shared service integration pending"}
          </h2>
          <p>
            {view === "requests"
              ? "Deadline requests made from your tasks will appear here. Leave and attendance requests will use the shared service."
              : view === "blockers"
                ? "Report a blocker from a task when you need help. Open blockers will appear here."
                : view === "assets"
                  ? "Your task drafts and submitted proofs will appear here."
                  : view === "attendance"
                    ? "This preview is not connected to attendance records. The shared attendance service will provide punches and calendar history."
                    : view === "messages"
                      ? "Work conversations will use the shared messaging service. Messages are not sent from this preview."
                      : "Performance needs verified delivery records and configured targets. No score has been calculated."}
          </p>
        </div>
      )}
    </section>
  );
}
