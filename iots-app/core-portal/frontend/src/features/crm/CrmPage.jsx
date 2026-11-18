import { useEffect, useState } from "react";
import { Button } from "../../shared/work-ui/button";
import "../tasks/management/management.css";

export default function CrmPage() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setResult(null);
    fetch("/api/auth/crm/leads?page=" + page + "&per_page=25", {signal:controller.signal,credentials:"same-origin"})
      .then(async response => {
        const value = await response.json();
        if (!response.ok) throw new Error(value.message || "CRM leads could not be loaded.");
        return value;
      }).then(setResult).catch(failure => {
        if (!controller.signal.aborted) setError(failure.message);
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, attempt]);
  return <section className="task-management">
    <header className="management-heading"><div><h1>CRM leads</h1><p>Lead records from CIRIL CRM</p></div><Button variant="outline" disabled={loading} onClick={() => setAttempt(value => value + 1)}>Refresh</Button></header>
    {loading && <p role="status">Loading CRM leads?</p>}
    {error && <p role="alert">{error}</p>}
    {result && <><p>{result.meta?.total ?? result.data.length} leads</p>
      <div className="management-table-scroll" tabIndex={0} role="region" aria-label="CRM leads"><table className="management-table"><thead><tr>{["Lead ID","Status code","Assigned user ID","Created","Updated"].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{result.data.map(lead => <tr key={lead.id}><td>{lead.id}</td><td>{lead.lead_status ?? "Not recorded"}</td><td>{lead.assigned_user_id ?? "Not assigned"}</td><td>{lead.created_at || "Not recorded"}</td><td>{lead.updated_at || "Not recorded"}</td></tr>)}</tbody></table></div>
      {!result.data.length && <p>No leads found.</p>}
      <div className="management-actions"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page}</span><Button variant="outline" disabled={loading || !result.meta || page >= result.meta.last_page} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </>}
  </section>;
}
