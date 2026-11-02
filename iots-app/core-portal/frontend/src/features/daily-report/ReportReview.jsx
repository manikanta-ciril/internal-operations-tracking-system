import companyLogo from "../../assets/logo.png";
import {
  reportColumns,
  reportRows,
  employeeIdentity,
  reportSummary,
  downloadProof,
} from "./exportTools.js";
export default function ReportReview({ report, employee, onError }) {
  const rows = reportRows(report);
  return (
    <article className="report-review-sheet">
      <header className="report-sheet-heading">
        <div>
          <h3>CIRIL Daily Task Report</h3>
          <p>{employeeIdentity(employee)}</p>
          <p>Report date: {report.date}</p>
          <p>Recipient: General Manager / Senior Manager / Executive</p>
        </div>
        <img src={companyLogo} alt="CIRIL" />
      </header>
      <p className="report-table-help">
        One row per task. Scroll across to review every column.
      </p>
      <div
        className="report-table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Daily report spreadsheet"
      >
        <table className="report-review-table">
          <caption className="sr-only">
            Daily work report for {employee.name}, {report.date}
          </caption>
          <thead>
            <tr>
              {reportColumns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row[0] + index}>
                {row.map((value, column) => (
                  <td key={column}>
                    {column === 0 ? (
                      <strong>{value}</strong>
                    ) : column === 9 &&
                      report.entries[row[0]]?.proofs?.length ? (
                      report.entries[row[0]].proofs.map((p) => (
                        <button
                          key={p.id}
                          className="report-proof-link"
                          onClick={() =>
                            downloadProof(p).catch((e) => onError(e.message))
                          }
                        >
                          {p.name}
                        </button>
                      ))
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={reportColumns.length}>
                  No task rows selected for this day.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="report-sheet-summary">
        {reportSummary(report).map((text, i) => (
          <p key={i}>{text}</p>
        ))}
      </div>
    </article>
  );
}
