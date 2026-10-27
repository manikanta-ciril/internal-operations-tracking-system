import { useState } from "react";
import {
  usePreview,
  PageTitle,
  Section,
  Empty,
  Button,
  Form,
  Input,
  Select,
  Table,
  Status,
  Icon,
  values,
} from "./components";
import { roleNames, accessActions } from "./catalog";
import { newId, uniqueName, setupSteps } from "./model";

export function Home() {
  const { draft, navigate, exportDraft } = usePreview();
  const steps = setupSteps(draft),
    complete = steps.filter((s) => s.done).length,
    next = steps.find((s) => !s.done);
  return (
    <>
      <PageTitle
        title={
          complete === 6
            ? "Your company setup is ready to review."
            : "Let’s set up your company."
        }
        description="Start with the basics. Build a workspace that fits your team."
        action={
          <Button onClick={() => navigate(next?.id || "systems")} icon="arrow">
            {next ? "Continue setup" : "Review systems"}
          </Button>
        }
      />
      <div className="sa-home-grid">
        <Section
          title="Your setup checklist"
          description={`${complete} of 6 steps complete`}
        >
          <ol className="sa-checklist">
            {steps.map((step, index) => (
              <li key={step.id}>
                <button type="button" onClick={() => navigate(step.id)}>
                  <span className={`sa-step ${step.done ? "complete" : ""}`}>
                    {step.done ? <Icon name="check" size={16} /> : index + 1}
                  </span>
                  <span>
                    <strong>{step.name}</strong>
                    <small>{step.detail}</small>
                  </span>
                  <span className="sa-step-state">
                    {step.done
                      ? "Done"
                      : step.id === next?.id
                        ? "Start here"
                        : ""}
                    <Icon name="arrow" size={15} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </Section>
        <aside className="sa-home-aside">
          <div className="sa-help-note">
            <Icon name="building" size={28} />
            <h2>Start small. Everything connects.</h2>
            <p>
              Add your offices and departments first. Then give each person a
              role and a clear reporting line.
            </p>
            <button className="text-link" onClick={() => navigate("company")}>
              Open company details <Icon name="arrow" size={13} />
            </button>
          </div>
          <div className="sa-connection-note">
            <div>
              <Icon name="link" />
              <h3>Connect your CRM later</h3>
            </div>
            <p>
              Keep member companies, leads and royalty records linked to their
              original source.
            </p>
            <Status>Not connected</Status>
            <button
              className="text-link"
              onClick={() => navigate("connection")}
            >
              Review connection settings
            </button>
          </div>
          <div className="sa-export-note">
            <h3>Take a copy of your setup</h3>
            <p>
              Download this draft for review before connecting it to the live
              system.
            </p>
            <Button secondary icon="download" onClick={exportDraft}>
              Export setup
            </Button>
          </div>
        </aside>
      </div>
      <Section title="Your company, at a glance">
        <div className="sa-facts">
          {[
            ["Company", draft.company.name || "Not added"],
            ["Offices", draft.offices.length],
            ["Departments", draft.departments.length],
            ["Employees", draft.people.length],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

export function Company() {
  const { draft, commit } = usePreview();
  return (
    <>
      <PageTitle
        title="Company details"
        description="The basic information your team will see across IOTS."
      />
      <Section title="About your company">
        <Form
          onSave={(data) => {
            const company = values(data);
            commit((d) => ({ ...d, company }), "Saved company details");
          }}
          label="Save company"
        >
          <div className="sa-form-grid">
            <Input
              name="name"
              label="Company name"
              required
              value={draft.company.name}
              placeholder="CIRIL"
              maxLength={100}
            />
            <Input
              name="legalName"
              label="Registered name"
              value={draft.company.legalName}
              placeholder="Full legal name"
              maxLength={160}
            />
            <Input
              name="email"
              label="Company email"
              type="email"
              value={draft.company.email}
              placeholder="office@ciril.in"
              required
            />
            <Input
              name="website"
              label="Website"
              type="url"
              value={draft.company.website}
              placeholder="https://ciril.in"
            />
          </div>
          <div className="sa-fixed-facts">
            <span>
              Country <strong>India</strong>
            </span>
            <span>
              Time zone <strong>India Standard Time (IST)</strong>
            </span>
          </div>
        </Form>
      </Section>
    </>
  );
}

const entityDetails = {
  offices: {
    title: "Offices",
    description: "Add the places your employees work from.",
    singular: "office",
    icon: "location",
  },
  departments: {
    title: "Departments",
    description: "Group people by the work they do.",
    singular: "department",
    icon: "building",
  },
  people: {
    title: "People",
    description: "Add internal employees and decide where they belong.",
    singular: "employee",
    icon: "users",
  },
  members: {
    title: "Member companies",
    description:
      "Keep external brokerage partners separate from your internal team.",
    singular: "member company",
    icon: "briefcase",
  },
};

export function Directory({ kind }) {
  const { draft, commit, navigate } = usePreview();
  const [editing, setEditing] = useState(null),
    [show, setShow] = useState(false);
  const info = entityDetails[kind],
    rows = draft[kind];
  const ready =
    !!draft.company.name &&
    (kind !== "people" ||
      (draft.offices.length > 0 && draft.departments.length > 0));
  function open(item) {
    setEditing(item || null);
    setShow(true);
  }
  function save(data) {
    const record = values(data),
      id = editing?.id || newId();
    if (!uniqueName(rows, record.name, id))
      throw Error(`An ${info.singular} with this name already exists.`);
    if (kind === "offices") {
      const latitude = Number(record.latitude),
        longitude = Number(record.longitude),
        radius = Number(record.radius);
      if (
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90 ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180 ||
        !(radius > 0 && radius <= 10000)
      )
        throw Error(
          "Enter valid latitude, longitude and an office radius between 1 and 10,000 metres.",
        );
    }
    if (kind === "people") {
      record.roles = data.getAll("roles");
      if (!record.roles.length) throw Error("Choose at least one role.");
      if (
        draft.people.some(
          (p) =>
            p.id !== id &&
            (p.email.toLowerCase() === record.email.toLowerCase() ||
              p.username.toLowerCase() === record.username.toLowerCase()),
        )
      )
        throw Error("This email or username is already in your draft.");
      if (
        !draft.offices.some((o) => o.id === record.office) ||
        !draft.departments.some((o) => o.id === record.department)
      )
        throw Error("Choose an existing office and department.");
      const visited = new Set([id]);
      let manager = record.manager;
      while (manager) {
        if (visited.has(manager))
          throw Error(
            "Choose a manager outside this employee’s reporting chain.",
          );
        visited.add(manager);
        manager = draft.people.find((person) => person.id === manager)?.manager;
      }
    }
    commit(
      (d) => ({
        ...d,
        [kind]: editing
          ? d[kind].map((r) => (r.id === id ? { ...record, id } : r))
          : [...d[kind], { ...record, id }],
      }),
      `${editing ? "Updated" : "Added"} ${info.singular}: ${record.name}`,
    );
    setShow(false);
  }
  return (
    <>
      <PageTitle
        title={info.title}
        description={info.description}
        action={
          ready &&
          !show && (
            <Button icon="plus" onClick={() => open()}>
              Add {info.singular}
            </Button>
          )
        }
      />
      {!ready ? (
        <Section title="A quick step first">
          <Empty
            icon={info.icon}
            title={
              !draft.company.name
                ? "Add your company first"
                : "Add an office and a department first"
            }
            action={
              <Button
                onClick={() =>
                  navigate(
                    !draft.company.name
                      ? "company"
                      : !draft.offices.length
                        ? "offices"
                        : "departments",
                  )
                }
              >
                Continue setup
              </Button>
            }
          >
            This keeps each record connected to the right company and team.
          </Empty>
        </Section>
      ) : (
        <>
          {show && (
            <Section title={`${editing ? "Edit" : "Add"} ${info.singular}`}>
              <Form
                key={editing?.id || "new"}
                onSave={save}
                label={editing ? "Save changes" : `Add ${info.singular}`}
                cancel
                onCancel={() => setShow(false)}
              >
                <div className="sa-form-grid">
                  <Input
                    name="name"
                    label={
                      kind === "people"
                        ? "Full name"
                        : `${info.singular[0].toUpperCase() + info.singular.slice(1)} name`
                    }
                    value={editing?.name}
                    required
                    maxLength={120}
                    placeholder={
                      kind === "departments"
                        ? "e.g. Creative communication"
                        : undefined
                    }
                  />
                  {kind === "offices" && (
                    <>
                      <Input
                        name="address"
                        label="Office address"
                        value={editing?.address}
                        required
                        maxLength={300}
                      />
                      <Input
                        name="latitude"
                        label="Latitude"
                        type="number"
                        step="any"
                        min="-90"
                        max="90"
                        value={editing?.latitude}
                        required
                        placeholder="17.4303611"
                      />
                      <Input
                        name="longitude"
                        label="Longitude"
                        type="number"
                        step="any"
                        min="-180"
                        max="180"
                        value={editing?.longitude}
                        required
                        placeholder="78.4566389"
                      />
                      <Input
                        name="radius"
                        label="Sign-in radius (metres)"
                        type="number"
                        min="1"
                        max="10000"
                        value={editing?.radius || "75"}
                        required
                        hint="A draft setting; the live office rule is unchanged."
                      />
                    </>
                  )}
                  {kind === "departments" && (
                    <Input
                      name="description"
                      label="What does this department do?"
                      value={editing?.description}
                      maxLength={200}
                    />
                  )}
                  {kind === "members" && (
                    <>
                      <Input
                        name="city"
                        label="City"
                        value={editing?.city}
                        required
                      />
                      <Input
                        name="zone"
                        label="Zone"
                        value={editing?.zone}
                        placeholder="e.g. South"
                      />
                      <Input
                        name="crmId"
                        label="CRM company ID (if known)"
                        value={editing?.crmId}
                        hint="A reference only. No CRM account is created."
                      />
                    </>
                  )}
                  {kind === "people" && (
                    <>
                      <Input
                        name="email"
                        label="Company email"
                        type="email"
                        required
                        value={editing?.email}
                      />
                      <Input
                        name="username"
                        label="Username"
                        value={editing?.username}
                        required
                        pattern="[A-Za-z0-9._-]{2,80}"
                        hint="Letters, numbers, dots, hyphens or underscores."
                      />
                      <Select
                        name="office"
                        label="Office"
                        value={editing?.office}
                        required
                      >
                        {draft.offices.map((o) => (
                          <option value={o.id} key={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </Select>
                      <Select
                        name="department"
                        label="Department"
                        value={editing?.department}
                        required
                      >
                        {draft.departments.map((o) => (
                          <option value={o.id} key={o.id}>
                            {o.name}
                          </option>
                        ))}
                      </Select>
                      <Select
                        name="manager"
                        label="Reports to (optional)"
                        value={editing?.manager}
                      >
                        {draft.people
                          .filter((p) => p.id !== editing?.id)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </Select>
                    </>
                  )}
                </div>
                {kind === "people" && (
                  <fieldset className="sa-checkboxes">
                    <legend>Assigned roles</legend>
                    {roleNames.map((role) => (
                      <label key={role}>
                        <input
                          type="checkbox"
                          name="roles"
                          value={role}
                          defaultChecked={editing?.roles?.includes(role)}
                        />
                        {role}
                      </label>
                    ))}
                  </fieldset>
                )}
              </Form>
            </Section>
          )}
          <Section
            title={`${rows.length} ${info.title.toLowerCase()}`}
            description={
              kind === "people"
                ? "Draft employees only. No invitation or live login is created."
                : undefined
            }
          >
            {!rows.length ? (
              <Empty
                title={`No ${info.title.toLowerCase()} yet`}
                icon={info.icon}
                action={
                  !show && (
                    <Button secondary icon="plus" onClick={() => open()}>
                      Add {info.singular}
                    </Button>
                  )
                }
              >
                Add your first {info.singular} to continue setting up the
                company.
              </Empty>
            ) : (
              <Table
                columns={
                  kind === "people"
                    ? ["Employee", "Team", "Roles", ""]
                    : kind === "offices"
                      ? ["Office", "Address", "Radius", ""]
                      : kind === "members"
                        ? ["Member company", "City", "CRM reference", ""]
                        : ["Department", "Description", ""]
                }
                rows={rows}
                render={(row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.name}</strong>
                      {row.email && <small>{row.email}</small>}
                    </td>
                    {kind === "people" ? (
                      <>
                        <td>
                          {
                            draft.departments.find(
                              (d) => d.id === row.department,
                            )?.name
                          }
                          <small>
                            {
                              draft.offices.find((d) => d.id === row.office)
                                ?.name
                            }
                          </small>
                        </td>
                        <td>{row.roles.join(", ")}</td>
                      </>
                    ) : kind === "offices" ? (
                      <>
                        <td>
                          {row.address}
                          <small>
                            {row.latitude}, {row.longitude}
                          </small>
                        </td>
                        <td>{row.radius} m</td>
                      </>
                    ) : kind === "members" ? (
                      <>
                        <td>
                          {row.city}
                          <small>{row.zone}</small>
                        </td>
                        <td>{row.crmId || "Not linked"}</td>
                      </>
                    ) : (
                      <td>{row.description || "—"}</td>
                    )}
                    <td>
                      <button
                        className="text-link"
                        onClick={() => open(row)}
                        aria-label={`Edit ${row.name}`}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )}
              />
            )}
          </Section>
        </>
      )}
    </>
  );
}

export function Roles() {
  const { draft, commit } = usePreview();
  const [selected, setSelected] = useState("Super Admin");
  const role = draft.roles.find((r) => r.name === selected) || draft.roles[0];
  const [approval, setApproval] = useState(role.approval);
  return (
    <>
      <PageTitle
        title="Roles & access"
        description="A role controls access. Approval rights describe the decisions a person may make."
      />
      <div className="sa-role-layout">
        <nav className="sa-role-list" aria-label="Role settings">
          {draft.roles.map((r) => (
            <button
              key={r.name}
              className={r.name === role.name ? "selected" : ""}
              aria-pressed={r.name === role.name}
              onClick={() => {
                setSelected(r.name);
                setApproval(r.approval);
              }}
            >
              {r.name}
              {r.reviewed && <Icon name="check" size={14} />}
            </button>
          ))}
        </nav>
        <Section
          title={role.name}
          description="Review this role before assigning it to your team."
        >
          <Form
            key={role.name}
            onSave={(data) => {
              const settings = values(data),
                actions = data.getAll("actions");
              if (approval && !settings.mandate)
                throw Error(
                  "Describe the approval responsibility for this role.",
                );
              commit(
                (d) => ({
                  ...d,
                  roles: d.roles.map((r) =>
                    r.name === role.name
                      ? { ...r, ...settings, actions, approval, reviewed: true }
                      : ["Super Admin", "IT System Analyst"].includes(
                            role.name,
                          ) &&
                          ["Super Admin", "IT System Analyst"].includes(r.name)
                        ? { ...r, scope: settings.scope, actions }
                        : r,
                  ),
                }),
                `Reviewed access for ${role.name}`,
              );
            }}
            label="Save role settings"
          >
            <Select
              label="Who can this role see?"
              name="scope"
              value={role.scope}
              required
            >
              {["Whole company", "Assigned team", "Own records"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <fieldset className="sa-checkboxes single">
              <legend>Allowed actions</legend>
              {accessActions.map((action) => (
                <label key={action}>
                  <input
                    name="actions"
                    type="checkbox"
                    value={action}
                    defaultChecked={role.actions.includes(action)}
                  />
                  {action}
                </label>
              ))}
            </fieldset>
            <div className="sa-policy-note">
              <Icon name="lock" size={18} />
              <p>
                Super Admin and IT System Analyst share platform privileges.
                Business approval rights are assigned separately.
              </p>
            </div>
            <label className="sa-check-line">
              <input
                type="checkbox"
                checked={approval}
                onChange={(e) => setApproval(e.target.checked)}
              />
              This role can make business approvals
            </label>
            {approval && (
              <Input
                label="Approval responsibility"
                name="mandate"
                value={role.mandate}
                required
                placeholder="e.g. Leave requests for the Operations team"
                hint="Name the decision type and the team or records it applies to."
              />
            )}
          </Form>
        </Section>
      </div>
    </>
  );
}

export function WorkRules() {
  const { draft, commit } = usePreview();
  return (
    <>
      <PageTitle
        title="Work rules"
        description="Set the working week and the holidays your company actually observes."
      />
      <Section
        title="Working hours"
        description="Times are shown in India Standard Time (IST)."
      >
        <Form
          onSave={(data) => {
            const rules = values(data);
            if (rules.end <= rules.start || rules.saturdayEnd <= rules.start)
              throw Error("The end time must be after the start time.");
            commit(
              (d) => ({ ...d, rules: { ...rules, saved: true } }),
              "Saved working hours",
            );
          }}
          label="Save working hours"
        >
          <div className="sa-form-grid">
            <Input
              label="Day starts"
              name="start"
              type="time"
              value={draft.rules.start}
              required
            />
            <Input
              label="Monday–Friday ends"
              name="end"
              type="time"
              value={draft.rules.end}
              required
            />
            <Input
              label="Saturday ends"
              name="saturdayEnd"
              type="time"
              value={draft.rules.saturdayEnd}
              required
            />
            <div className="sa-fixed-field">
              <span>Weekly off</span>
              <strong>Sunday</strong>
              <small>Saturday remains a working day.</small>
            </div>
          </div>
          <div className="sa-policy-note">
            <Icon name="calendar" size={18} />
            <p>
              Attendance, session activity and task effort are kept separate.
              The live sign-in and punch-out rules do not change in this
              preview.
            </p>
          </div>
        </Form>
      </Section>
      <Section
        title="Company holidays"
        description="A festival or bank holiday is not automatically a day off for your team."
      >
        <Form
          onSave={(data) => {
            const holiday = values(data);
            if (holiday.date < "2025-01-01")
              throw Error("Choose a date from 1 January 2025 onwards.");
            if (
              draft.holidays.some(
                (h) =>
                  h.date === holiday.date &&
                  h.name.toLowerCase() === holiday.name.toLowerCase(),
              )
            )
              throw Error("This holiday is already listed.");
            commit(
              (d) => ({
                ...d,
                holidays: [...d.holidays, { ...holiday, id: newId() }].sort(
                  (a, b) => a.date.localeCompare(b.date),
                ),
              }),
              `Added company holiday: ${holiday.name}`,
            );
          }}
          label="Add holiday"
        >
          <div className="sa-form-grid">
            <Input
              label="Holiday name"
              name="name"
              required
              placeholder="e.g. Republic Day"
            />
            <Input
              label="Date"
              name="date"
              type="date"
              min="2025-01-01"
              required
            />
          </div>
        </Form>
        {draft.holidays.length > 0 && (
          <Table
            columns={["Holiday", "Date", ""]}
            rows={draft.holidays}
            render={(holiday) => (
              <tr key={holiday.id}>
                <td>{holiday.name}</td>
                <td>{holiday.date}</td>
                <td>
                  <button
                    className="text-link"
                    onClick={() =>
                      commit(
                        (d) => ({
                          ...d,
                          holidays: d.holidays.filter(
                            (h) => h.id !== holiday.id,
                          ),
                        }),
                        `Removed draft holiday: ${holiday.name}`,
                      )
                    }
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )}
          />
        )}
      </Section>
    </>
  );
}
