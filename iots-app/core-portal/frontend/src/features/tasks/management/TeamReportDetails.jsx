import { useState } from "react";
import { Button } from "../../../shared/work-ui/button";
import { exportManualReport } from "../../daily-report/exportTools";
import ReportReview from "../../daily-report/ReportReview";

export default function ReportContents({ report, employee }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const author = report.author || {
    ...employee,
    role:
      employee.role || employee.roles?.map((role) => role.label).join(" / "),
  };
  async function exportReport(format) {
    setBusy(true);
    setError("");
    try {
      await exportManualReport(format, report, author);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <details>
      <summary>View report</summary>
      {report.entries && (
        <>
          <div className="management-actions">
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => exportReport("pdf")}
            >
              Download PDF
            </Button>
            <Button
              disabled={busy}
              variant="outline"
              onClick={() => exportReport("xlsx")}
            >
              Download Excel
            </Button>
          </div>
          <ReportReview report={report} employee={author} onError={setError} />
          {report.taskFacts?.length > 0 && (
            <section>
              <h3>Work records at submission</h3>
              <ul>
                {report.taskFacts.map((fact) => (
                  <li key={fact.taskId}>
                    {fact.title}: {fact.status}; {fact.progress}% reported;{" "}
                    {fact.effortMinutes} minutes logged.
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
      {error && <p role="alert">{error}</p>}
      {[
        ["Planned work", report.planned],
        ["Completed work", report.completed],
        ["In progress", report.progress],
        ["Pending work", report.pending],
        ["New work", report.newTasks],
        ["Remarks", report.remarks],
      ].map(([label, value]) =>
        value?.length ? (
          <div key={label}>
            <h3>{label}</h3>
            <p className="management-preserve">
              {Array.isArray(value) ? value.join("\n") : value}
            </p>
          </div>
        ) : null,
      )}
    </details>
  );
}
