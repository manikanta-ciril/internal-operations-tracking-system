import { useState } from "react";
import { downloadProof } from "../daily-report/exportTools";
import { Button } from "../../shared/work-ui/button";

export default function RevisionComparePane({ task, children }) {
  const [error, setError] = useState("");
  const previous = task.versions.at(-1);
  if (task.status !== "Changes requested" || !previous) return children;
  return (
    <div className="revision-compare-pane">
      <section className="revision-previous">
        <h3>Previous submission</h3>
        <strong>{previous.file}</strong>
        <p>{task.returnNote || previous.note}</p>
        <small>{task.returnedBy || "Creative reviewer"}</small>
        {previous.attachments?.map((proof) => (
          <Button
            key={proof.id}
            variant="outline"
            onClick={() =>
              downloadProof(proof).catch((failure) => setError(failure.message))
            }
          >
            {proof.name}
          </Button>
        ))}
        {error && <p role="alert">{error}</p>}
      </section>
      <section aria-label="New revision">{children}</section>
    </div>
  );
}
