import { useState } from "react";
import { systems, groups } from "./catalog";
import { dateText } from "./model";
import { Directory } from "./setup-pages";
import {
  usePreview,
  PageTitle,
  Section,
  Button,
  Form,
  Input,
  Select,
  Status,
  Empty,
  BackLink,
  values,
  Icon,
} from "./components";

export function Business() {
  return (
    <>
      <Directory key="members" kind="members" />
      <Section
        title="How business records connect"
        description="Reference workflow — financial records remain in CIRIL CRM."
      >
        <div className="sa-business-flow">
          {[
            "Member company",
            "Client requirement",
            "Lead giver & receiver",
            "Deal & brokerage",
            "Royalty follow-up",
          ].map((name, i) => (
            <div key={name}>
              <span>0{i + 1}</span>
              <strong>{name}</strong>
            </div>
          ))}
        </div>
        <p className="sa-note">
          Leasing and sale records follow different brokerage rules. The current
          CRM calculates royalty as 7.5% of each party’s brokerage share. A
          calculation is not confirmation of payment.
        </p>
      </Section>
    </>
  );
}
export function Systems() {
  const { draft, navigate } = usePreview();
  const [search, setSearch] = useState(""),
    [group, setGroup] = useState("All");
  const visible = systems.filter(
    (s) =>
      (group === "All" || s.group === group) &&
      `${s.id} ${s.name} ${s.description}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title="All systems"
        description="27 connected areas. Set responsibilities and rules before adding live workflows."
      />
      <div className="sa-filters">
        <Input
          name="search"
          label="Find a system"
          placeholder="Search names or purpose"
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="sa-filter-label">
          Area
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {["All", ...groups].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>
      <Section title={`${visible.length} systems`}>
        <div className="sa-system-list">
          {visible.map((s) => (
            <button key={s.id} onClick={() => navigate(`systems/${s.id}`)}>
              <span className="sa-system-id">{s.id}</span>
              <span>
                <strong>{s.name}</strong>
                <small>{s.description}</small>
                <em>{s.group}</em>
              </span>
              <Status done={!!draft.modules[s.id]}>
                {draft.modules[s.id] ? "Draft saved" : "Not set"}
              </Status>
              <Icon name="arrow" size={16} />
            </button>
          ))}
        </div>
        {!visible.length && (
          <Empty title="No matching systems">Try another name or area.</Empty>
        )}
      </Section>
    </>
  );
}
export function SystemDetail({ id }) {
  const { draft, commit } = usePreview(),
    system = systems.find((s) => s.id === id);
  if (!system)
    return (
      <>
        <BackLink to="systems">All systems</BackLink>
        <Empty title="System not found">Choose a system from the list.</Empty>
      </>
    );
  const saved = draft.modules[id] || {};
  return (
    <>
      <BackLink to="systems">All systems</BackLink>
      <PageTitle
        title={system.name}
        description={`${system.id} · ${system.description}`}
      />
      <div className="sa-detail-grid">
        <Section title="Plan this system">
          <Form
            key={id}
            onSave={(data) => {
              const config = values(data);
              commit(
                (d) => ({
                  ...d,
                  modules: {
                    ...d.modules,
                    [id]: { ...config, planned: data.has("planned") },
                  },
                }),
                `Saved ${system.name} setup`,
              );
            }}
          >
            <div className="sa-form-grid">
              <Select
                name="owner"
                label="Responsible employee"
                value={saved.owner}
              >
                {draft.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              <Select
                name="reviewer"
                label="Review contact"
                value={saved.reviewer}
              >
                {draft.people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
              {system.fields
                .filter((f) => f.key !== "reviewer")
                .map((f) => (
                  <Input
                    key={f.key}
                    name={f.key}
                    label={f.label}
                    type={f.type}
                    hint={f.hint}
                    value={saved[f.key] ?? f.initial}
                    min={f.type === "number" ? 0 : undefined}
                  />
                ))}
            </div>
            <label className="sa-checkbox">
              <input
                name="planned"
                type="checkbox"
                defaultChecked={saved.planned}
              />
              Include in the launch plan
            </label>
            <p className="sa-note">
              Saving defines a local setup draft. It does not activate this
              system or grant live permissions.
            </p>
          </Form>
        </Section>
        <Section title="Rules to preserve">
          <ul className="sa-rules-list">
            {system.rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  );
}
export function Connection() {
  const { draft, commit } = usePreview();
  return (
    <>
      <PageTitle
        title="CRM connection"
        description="Plan how IOTS will refer to your existing business records."
      />
      <Section
        title="Connection details"
        action={<Status>Not connected</Status>}
      >
        <Form
          onSave={(data) =>
            commit(
              (d) => ({
                ...d,
                connection: { ...values(data), mode: "Read only", saved: true },
              }),
              "Saved CRM connection plan",
            )
          }
        >
          <div className="sa-form-grid">
            <Input
              name="source"
              label="Source name"
              value={draft.connection.source}
              required
            />
            <Input
              name="url"
              type="url"
              label="CRM base address"
              value={draft.connection.url}
              placeholder="https://your-crm.example"
              required
            />
          </div>
          <p className="sa-note">
            Read-only integration must be reviewed before connection. This
            preview never contacts your CRM. Keep passwords and API keys out of
            these fields.
          </p>
        </Form>
      </Section>
      <Section title="Before connecting">
        <ul className="sa-rules-list">
          <li>Confirm approved API endpoints and employee access.</li>
          <li>
            Map member companies, lead IDs, deal states and royalty records.
          </li>
          <li>Keep the source timestamp and last successful sync visible.</li>
          <li>
            Review calculation routes: some existing CRM screens change records
            when opened.
          </li>
        </ul>
      </Section>
    </>
  );
}
export function History() {
  const { draft } = usePreview();
  return (
    <>
      <PageTitle
        title="Setup history"
        description="Changes made to this browser’s draft. This is not the live audit log."
      />
      <Section title="Recent changes">
        {draft.activity.length ? (
          <ol className="sa-history">
            {draft.activity.map((a) => (
              <li key={a.id}>
                <span className="sa-history-dot" />
                <div>
                  <strong>{a.message}</strong>
                  <time dateTime={a.at}>{dateText(a.at)}</time>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <Empty icon="clock" title="No changes yet">
            Your saved setup changes will appear here.
          </Empty>
        )}
      </Section>
    </>
  );
}
