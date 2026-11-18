import { useEffect, useState } from "react";
import { Button } from "../../shared/work-ui/button";
import "../tasks/management/management.css";

export default function CrmPage() {
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  async function openLead(id) {
    setDetailError("");
    try {
      const response = await fetch("/api/auth/crm/leads/" + encodeURIComponent(id), {credentials:"same-origin"});
      const value = await response.json();
      if (!response.ok) throw new Error(value.message || "Lead details could not be loaded.");
      setDetail(value.data);
    } catch (failure) { setDetailError(failure.message); }
  }
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
    {detailError && <p role="alert">{detailError}</p>}
    {detail && <section className="management-panel">
      <div className="management-heading"><h2>Lead {detail.id} / {detail.status}</h2><Button variant="outline" onClick={() => setDetail(null)}>Close details</Button></div>
      {[["Assigned to", detail.assigned_user], ["Created by", detail.created_by], ["Organisation", detail.organisation],
        ["Clients", detail.client_details], ["Requirements", detail.requirements_details], ["Financial details", detail.financial_details],
        ["Brokerage and royalty", detail.brokerage], ["Payments", detail.payments], ["Assignment history", detail.lead_assigns],
        ["Remarks", detail.lead_remarks_histrory], ["Proposals", detail.proposels], ["Status history", detail.lead_statuses]].map(([label, values]) =>
        <details key={label}><summary>{label}</summary>{!values || Array.isArray(values) && !values.length ? <p>No records.</p> :
          (Array.isArray(values) ? values : [values]).map((record, index) => <dl key={index} className="management-filters">{Object.entries(record).filter(([, value]) => value !== null && value !== "").map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2")}</dt><dd style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd></div>)}</dl>)}</details>)}
    </section>}
    {loading && <p role="status">Loading CRM leads?</p>}
    {error && <p role="alert">{error}</p>}
    {result && <><p>{result.meta?.total ?? result.data.length} leads</p>
      <div className="management-table-scroll" tabIndex={0} role="region" aria-label="CRM leads"><table className="management-table"><thead><tr>{["Lead","Status","Assigned to","Organisation","Created",""].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>{result.data.map(lead => <tr key={lead.id}><td>{lead.id}</td><td>{lead.status || "Status not mapped"}</td><td>{lead.assigned_user?.name || "Not assigned"}</td><td>{lead.organisation?.companyName || "Not recorded"}</td><td>{lead.created_at || "Not recorded"}</td><td><Button variant="outline" onClick={() => openLead(lead.id)}>View details</Button></td></tr>)}</tbody></table></div>
      {!result.data.length && <p>No leads found.</p>}
      <div className="management-actions"><Button variant="outline" disabled={loading || page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span>Page {page}</span><Button variant="outline" disabled={loading || !result.meta || page >= result.meta.last_page} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </>}
  </section>;
}
