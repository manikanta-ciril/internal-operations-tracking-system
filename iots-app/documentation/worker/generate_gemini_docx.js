const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak
} = require("docx");

// --- Helpers ---
const TB = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const CB = { top: TB, bottom: TB, left: TB, right: TB };
const HEADER_SHADING = { fill: "1E3A5F", type: ShadingType.CLEAR };
const LIGHT_SHADING = { fill: "F0F4F8", type: ShadingType.CLEAR };

function p(text, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, bold: !!opts.bold, italics: !!opts.italics, color: opts.color || "000000", size: opts.size, font: opts.font }));
  } else if (Array.isArray(text)) {
    text.forEach(t => runs.push(t));
  }
  return new Paragraph({
    heading: opts.heading,
    alignment: opts.alignment,
    spacing: opts.spacing || { after: 120 },
    indent: opts.indent,
    children: runs,
    numbering: opts.numbering,
    pageBreakBefore: opts.pageBreakBefore,
  });
}

function h1(text) { return p(text, { heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 200 } }); }
function h2(text) { return p(text, { heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 180 } }); }
function h3(text) { return p(text, { heading: HeadingLevel.HEADING_3, spacing: { before: 240, after: 120 } }); }
function h4(text) { return p(text, { heading: HeadingLevel.HEADING_4, spacing: { before: 200, after: 100 } }); }
function bold(text) { return p(text, { bold: true, spacing: { before: 120, after: 80 } }); }
function txt(text) { return p(text); }
function empty() { return p("", { spacing: { after: 60 } }); }
function br() { return new Paragraph({ children: [new PageBreak()] }); }

function bullet(text, ref = "bullet-list") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun(text)],
  });
}

function numberedItem(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: [new TextRun(text)],
  });
}

function richBullet(runs, ref = "bullet-list") {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 60 },
    children: runs,
  });
}

function cell(text, opts = {}) {
  const runs = typeof text === "string"
    ? [new TextRun({ text, bold: !!opts.bold, color: opts.headerText ? "FFFFFF" : "000000", size: opts.size || 20, font: "Arial" })]
    : text;
  return new TableCell({
    borders: CB,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.header ? HEADER_SHADING : (opts.shade ? LIGHT_SHADING : undefined),
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, spacing: { before: 40, after: 40 }, children: runs })],
  });
}

function headerCell(text, w) { return cell(text, { bold: true, header: true, headerText: true, width: w }); }

function makeTable(headers, rows, widths) {
  const totalW = widths.reduce((a, b) => a + b, 0);
  return new Table({
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => headerCell(h, widths[i])) }),
      ...rows.map((row, ri) => new TableRow({
        children: row.map((c, ci) => cell(c, { width: widths[ci], shade: ri % 2 === 0 }))
      }))
    ]
  });
}

// --- Build the document ---
const numConfigs = [];
let numCounter = 0;
function newNumRef(prefix) {
  const ref = `${prefix}-${numCounter++}`;
  numConfigs.push({
    reference: ref,
    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
  });
  return ref;
}
// Pre-create bullet list config
numConfigs.push({
  reference: "bullet-list",
  levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
});

// ===================== CHAPTER 00 =====================
const ch00 = [
  p("CIRIL Internal Operations Tracking System (IOTS)", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 600, after: 120 } }),
  p("Master Enterprise System Encyclopedia & Operational Blueprint", { alignment: AlignmentType.CENTER, spacing: { after: 200 }, bold: true, size: 28 }),
  empty(),
  p([
    new TextRun({ text: "System Name: ", bold: true }),
    new TextRun("CIRIL Internal Operations Tracking System (IOTS)")
  ]),
  p([
    new TextRun({ text: "Platform Version: ", bold: true }),
    new TextRun("2.0 Enterprise Release")
  ]),
  p([
    new TextRun({ text: "Organization: ", bold: true }),
    new TextRun("Commercial Real Estate Institutional Alliance (CIRIL)")
  ]),
  p([
    new TextRun({ text: "Target Audience: ", bold: true }),
    new TextRun("Executive Leadership, Operational Managers, Execution Teams, System Administrators, and Auditors")
  ]),
  p([
    new TextRun({ text: "Document Status: ", bold: true }),
    new TextRun("Comprehensive Enterprise Specification (Zero-Jargon, Layman-Accessible Edition)")
  ]),
  p([
    new TextRun({ text: "Repository Location: ", bold: true }),
    new TextRun({ text: "iots-app/documentation/worker/", italics: true })
  ]),
  empty(),

  h1("1. Executive Introduction & The Layman's Perspective"),
  h2("What is the Internal Operations Tracking System (IOTS)?"),
  txt("Think of a large, high-performing corporate hospital or an international airport flight operations center. In such organizations, success depends on dozens of people doing precise jobs at the exact right moment:"),
  bullet("Planes must be fueled, baggage loaded, flight paths verified, passengers boarded, and runways cleared."),
  bullet("If the baggage handlers are delayed, the pilot cannot take off. If the air traffic controller does not know who is at which gate, chaos ensues."),
  bullet("The Airport Director does not load bags or steer planes, but needs an executive radar screen showing every flight, any safety delays, and on-time performance across all terminals."),
  empty(),
  txt("The CIRIL Internal Operations Tracking System (IOTS) is that exact flight operations control center, built specifically for CIRIL\u2014India's premier commercial real estate alliance network."),
  txt("CIRIL brings together certified commercial real estate advisory firms across major metropolitan zones (North, South, East, West, Central). Corporate clients need commercial offices, warehouses, and land across different cities. When a client in Mumbai needs a 50,000 sq ft office in Bengaluru:"),
  (() => { const ref = newNumRef("ch00-s1"); return [
    numberedItem("The Mumbai team originates the requirement (acting as the Lead Giver).", ref),
    numberedItem("CIRIL Headquarters coordinates and handshakes the requirement to the vetted Bengaluru team (acting as the Lead Receiver).", ref),
    numberedItem("The Bengaluru team inspects properties, prepares institutional proposals, and closes the lease.", ref),
    numberedItem("Upon closing, brokerage fees are collected and split (30% to Lead Giver, 70% to Lead Receiver), and CIRIL receives its 7.5% corporate royalty.", ref),
  ]; })(),
  empty(),
  txt("To keep this nationwide commercial machinery operating smoothly, CIRIL requires an Internal Operations Tracking System (IOTS). The system guarantees that:"),
  bullet("Every employee knows exactly what task they need to do today, when it is due, and what materials they need."),
  bullet("Every manager knows who is working, who is overloaded, who is on leave, and which tasks are falling behind before deadlines are missed."),
  bullet("The Chairman and Executive Leadership have complete 360-degree radar visibility over daily operational health, team output, location integrity, financial milestones, and outstanding exceptions."),
  bullet("Outstanding employee dedication is tracked objectively and rewarded transparently through monthly and quarterly excellence recognitions."),
  empty(),

  h1("2. The 3-Layer Enterprise Architecture"),
  txt("The entire IOTS platform is structured into three foundational layers that work in complete harmony:"),
  empty(),
  h2("Layer 1: Authentication, Geolocation & Security Layer"),
  bullet("No Self-Registration: Accounts are securely provisioned by authorized administrators."),
  bullet("Unified Login Door: Everyone logs in through the same corporate portal. The system automatically inspects credentials, verifies the physical GPS location against authorized office boundaries, records an immutable audit log, and launches the user into their customized workspace."),
  bullet("Multi-Role Capability: If an individual wears multiple hats, the system provides an instant Workspace Context Switcher without requiring repeated logins."),
  bullet("Friendly Geolocation Transparency: If an employee logs in from home, a client site, or outside the office perimeter, the system tags the session transparently as \"Remote / Off-Site\", updates the manager, and logs the event for location auditing."),
  empty(),
  h2("Layer 2: Management, Operations & Execution Layer"),
  bullet("Separation of Management & Execution: Managers allocate work, balance workloads, review submissions, and resolve blockers. Execution staff focus on delivering tasks with high quality."),
  bullet("11 Role-Tailored Dashboards: From the Chairman's high-level radar to the Graphic Designer's creative version workbench, every role operates with dedicated tools."),
  bullet("Closed-Loop Task Lifecycle: Tasks are never lost. If a task becomes overdue, the system triggers active manager intervention."),
  bullet("Constructive Correction Cycles: If a manager rejects a submission, the task enters a structured revision cycle with clear feedback."),
  empty(),
  h2("Layer 3: Intelligence, Analytics & Reward Layer"),
  bullet("Actionable Business Intelligence: Every graph answers a vital operational question."),
  bullet("Predictive Risk Alerts: Highlights early warning signals before a missed deadline or client escalation occurs."),
  bullet("Automated Reporting Engines: Generates scheduled daily operational digests, weekly team scorecards, and monthly executive summaries."),
  bullet("Objective Reward & Recognition System: Automatically measures performance against clear criteria, rewarding monthly excellence and honoring three-consecutive-month high performers."),
  empty(),

  h1("3. The 11 Organizational Roles at a Glance"),
  txt("The IOTS platform defines 11 distinct operational roles, ensuring complete clarity of ownership across the organization:"),
  makeTable(
    ["#", "Role Title", "Primary Scope", "Key Responsibilities", "Access Band"],
    [
      ["1", "Chairman", "Apex Executive Oversight", "Enterprise operational health, commercial pulse, critical escalations, strategic interventions", "Executive Cockpit"],
      ["2", "Super Admin", "Platform Governance & Security", "Master configuration, security compliance, platform audit logs, system data authority", "Full System Authority"],
      ["3", "Admin", "Routine Administration", "User onboarding, office geofence perimeters, attendance audit, corporate announcements", "Administrative"],
      ["4", "IT System Analyst", "Technical Reliability", "Service & API uptime, database health, authentication anomaly detection, incident resolution", "Full System Authority"],
      ["5", "General Manager", "Cross-Dept Operations", "Strategic operations, Board coordination, finance & accounts, legal, expansion oversight", "Executive Managerial"],
      ["6", "Senior Manager", "Multi-Team Supervision", "Cross-team workload balancing, escalation review, SLA risk mitigation", "Multi-Team Operations"],
      ["7", "Lead Manager", "Day-to-Day Team Command", "Task assignment, availability tracking, workload balancing, QA reviews, leave approvals", "Team Command"],
      ["8", "Executive", "Core Operations", "Task execution, daily progress updates, work notes, blocker reporting, resubmissions", "Execution Workbench"],
      ["9", "BDE", "Network Expansion", "Cold outreach, prospecting (RERA, 99acres), lead follow-ups, WhatsApp campaigns", "BD Workbench"],
      ["10", "Social Media Manager", "Brand & Digital", "Content pipeline, content calendar, multi-platform releases, creative asset requests", "Content Workbench"],
      ["11", "Graphic Designer", "Creative Collaterals", "Design brief execution, version-controlled designs, presentation decks, report layouts", "Creative Workbench"],
    ],
    [600, 1800, 1700, 3000, 1660]
  ),
  empty(),

  h1("4. Documentation Suite Roadmap & Sitemap"),
  txt("This encyclopedia is organized into seven specialized reference manuals:"),
  bullet("00 - IOTS Enterprise System Encyclopedia Index (This Master Document)"),
  bullet("01 - Organizational Roles and Responsibilities Matrix"),
  bullet("02 - Task Lifecycle Execution and Workflow Engine"),
  bullet("03 - Attendance, Geolocation and Security Auditing"),
  bullet("04 - CIRIL Commercial Operations and Revenue Integration"),
  bullet("05 - Intelligence, Analytics and Automated Reporting"),
  bullet("06 - Employee Performance, Reward and Recognition System"),
  bullet("07 - Enterprise UI/UX Design System and Dashboard Blueprints"),
  empty(),

  h1("5. Core System Principles & Operational Guardrails"),
  (() => { const ref = newNumRef("ch00-s5"); return [
    numberedItem("Complex Underneath, Simple on Top: The underlying data model tracks sub-meter GPS coordinates, micro-second audit events, and intricate revenue splits. However, the user interface remains clean, calm, and self-explanatory.", ref),
    numberedItem("Zero Passive Task Drift: A task can never simply \"expire\" into oblivion. When a deadline passes, the system immediately demands manager review and structured resolution.", ref),
    numberedItem("Immutable Accountability (Audit by Design): Every major operational action writes an indelible entry into the audit trail. Audit logs cannot be altered or deleted by any user.", ref),
    numberedItem("Equity and Transparency: Performance is evaluated using verifiable operational metrics rather than subjective opinions.", ref),
    numberedItem("Security with Dignity: Location verification exists to protect corporate integrity and confirm workplace safety, not to act as punitive surveillance.", ref),
  ]; })(),
].flat();

// ===================== CHAPTER 01 =====================
const ch01 = [
  br(),
  p("Chapter 1", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Organizational Roles, Responsibilities & Access Governance", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-01")]),
  p([new TextRun({ text: "Target Audience: ", bold: true }), new TextRun("All Personnel, Department Heads, System Administrators, and HR Leadership")]),
  empty(),

  h1("1. The Operational Transformation: From Monolith to Distributed Excellence"),
  txt("In earlier operations, CIRIL relied on a heavily centralized managerial bottleneck where a single General Manager / Operations Lead was expected to oversee everything:"),
  bullet("Coordinating board meetings and minute-taking"),
  bullet("Chasing member brokerages for deal closures and 7.5% royalty remittances"),
  bullet("Running cold calls and member expansion outreach"),
  bullet("Overseeing social media posts and graphic design proofreading"),
  bullet("Calling vendors for conference stationery and report printing"),
  bullet("Managing day-to-day employee leaves, attendance, and task status"),
  txt("This bottleneck created severe operational risks: single points of failure, delayed task reviews, employee burnout, and limited real-time visibility for the Chairman."),
  txt("The Internal Operations Tracking System (IOTS) redesigns CIRIL's operational hierarchy into 11 clearly bounded roles:"),
  (() => { const ref = newNumRef("ch01-s1"); return [
    numberedItem("Executive strategy is held by the Chairman.", ref),
    numberedItem("Platform integrity and technical diagnostics are safeguarded by Super Admin and the IT System Analyst.", ref),
    numberedItem("Routine organizational housekeeping is managed by the Admin.", ref),
    numberedItem("Management is distributed across three focused tiers: General Manager, Senior Manager, and Lead Manager.", ref),
    numberedItem("Execution is handled by dedicated specialists: Executive, BDE, Social Media Manager, and Graphic Designer.", ref),
  ]; })(),
  empty(),

  h1("2. Institutional Hierarchy & Organizational Chain of Command"),
  txt("The organizational chart flows from the Chairman at the apex through Platform Governance (Super Admin & IT Analyst), Administrative support (Admin), a Management Tier (General Manager, Senior Manager, Lead Manager), down to the Execution Tier (Executive, BDE, Social Media Manager, Graphic Designer)."),
  empty(),

  h1("3. Exhaustive Role Breakdown & CIRIL Staff Mapping"),
  // Role 1
  h2("Role 1: Chairman"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Captain on the bridge of a naval ship.")]),
  p([new TextRun({ text: "Operational Scope: ", bold: true }), new TextRun("Entire Enterprise (National Headquarters, All Geographic Zones, All Functional Departments).")]),
  bold("Real CIRIL Functions:"),
  bullet("Receives complete bird's-eye operational intelligence across the entire alliance."),
  bullet("Monitors high-level commercial deal flow and royalty collections (7.5% royalty health)."),
  bullet("Inspects company-wide attendance and location audit summaries."),
  bullet("Reviews the Executive \"Requires Attention\" Cockpit: overdue task clusters, repeated reassignments, and unresolved blockers."),
  bullet("Reviews the Quarterly Reward & Recognition Standings to sign off on 3-consecutive-month excellence commendations."),
  bold("Permitted Actions:"),
  bullet("View all organizational metrics, departments, teams, tasks, and audit logs."),
  bullet("Issue high-priority executive directives or escalations (requires secondary confirmation)."),
  bullet("Publish enterprise-wide Chairman Announcements."),
  bold("Forbidden Actions:"),
  bullet("Cannot reset routine employee passwords (delegated to Admin)."),
  bullet("Cannot perform everyday task reassignment or micro-manage task checklists."),
  empty(),

  // Role 2
  h2("Role 2: Super Admin"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Chief Architect and Master Key Holder of a skyscraper.")]),
  p([new TextRun({ text: "System Parity Note: ", bold: true }), new TextRun("Super Admin and IT System Analyst have equal platform privileges.")]),
  bold("Key Responsibilities:"),
  bullet("Manages master organizational configurations, department definitions, and role definitions."),
  bullet("Configures Role-Based Access Control (RBAC) permission sets."),
  bullet("Holds authority to deactivate or alter high-level accounts."),
  bullet("Inspects full, immutable system audit logs."),
  bullet("Manages data export covenants and compliance frameworks."),
  empty(),

  // Role 3
  h2("Role 3: Admin"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Facility Operations Manager of a corporate campus.")]),
  bold("Key Responsibilities:"),
  bullet("Structured User Provisioning: Manually creates internal user profiles. No public registration."),
  bullet("Location & Geofence Perimeter Management: Configures approved office GPS coordinates and radius boundaries."),
  bullet("Attendance Auditing: Reviews location exceptions, off-site flags, and late arrivals."),
  bullet("Global Task Oversight: Monitors organizational work queues."),
  bullet("Company Announcements: Drafts and publishes official communications."),
  empty(),

  // Role 4
  h2("Role 4: IT System Analyst"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Chief Flight Engineer monitoring engine temperatures, avionics, and fuel injection systems.")]),
  bold("Key Responsibilities:"),
  bullet("Application & Service Health: Monitors server uptime, database response latency, and frontend performance."),
  bullet("External API Integrations: Tracks status and rate-limits of external services (BigDataCloud, mail servers, storage)."),
  bullet("Authentication & Security Auditing: Analyzes anomalous login attempts, sudden location jumps, and session timeouts."),
  bullet("Technical Incident Response: Logs and resolves platform bugs, database deadlocks, or webhook failures."),
  bullet("Deployment Tracking: Logs system version updates, environment variable changes, and schema migrations."),
  empty(),

  // Role 5
  h2("Role 5: General Manager (Staff Mapping: Ipsheeta)"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Managing Director of Operations who translates the Chairman's strategy into smooth business coordination.")]),
  bold("Key Responsibilities:"),
  bullet("Board Coordination & Governance: Prepares board meeting agendas and minutes, tracks execution of board decisions."),
  bullet("Accounts & Finance Coordination: Tracks fee invoices, royalty remittance status (7.5%), and operational expenses."),
  bullet("Audit & Statutory Compliance: Coordinates with external auditors and legal teams for compliance filings and NDAs."),
  bullet("Conference & Event Management: Oversees Annual and Zonal Conferences (hotel contracts, speaker lineups)."),
  bullet("Membership Expansion Oversight: Conducts high-level virtual presentations to prospective member firms."),
  bullet("Cross-Functional Escalation Resolution: Acts as the senior escalation clearinghouse."),
  empty(),

  // Role 6
  h2("Role 6: Senior Manager"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Division Superintendent overseeing multiple project foremen.")]),
  bold("Key Responsibilities:"),
  bullet("Cross-Team Workload Balancing: Monitors workload distribution across operational teams, shifting tasks if one team is overloaded."),
  bullet("SLA & Deadline Risk Mitigation: Identifies tasks at risk of missing deadlines across multiple verticals."),
  bullet("Manager Approval Queue: Evaluates high-impact decisions escalated by Lead Managers."),
  bullet("Performance Comparison: Analyzes comparative productivity trends between teams."),
  empty(),

  // Role 7
  h2("Role 7: Lead Manager (Staff Mapping: Manasa)"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Operations Crew Chief on the ground.")]),
  bold("Key Responsibilities:"),
  bullet("Member Office Deal & Royalty Coordination: Tracks concluded commercial transactions, verifying 7.5% royalty and 30/70 fee splits."),
  bullet("Vertical Calls Oversight: Manages weekly vertical review calls (Retail, L&W, Land, Hotel)."),
  bullet("Listing & Portal Management: Coordinates property listing uploads to commercial portals."),
  bullet("Market Report Data Collection: Coordinates with member brokerages for quarterly research publications."),
  bullet("Quarterly Statistics & Ratings: Prepares quarterly member performance scorecards and lead exchange matrices."),
  bullet("Vendor Coordination: Manages printing vendors for market reports, stationery, event materials."),
  bullet("Day-to-Day Team Command: Monitors availability, assigns tasks, conducts QA reviews, approves leaves, intervenes on overdue tasks."),
  empty(),

  // Role 8
  h2("Role 8: Executive (Core Work Execution)"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Skilled Specialist on the assembly line.")]),
  bold("Key Responsibilities:"),
  bullet("Task Execution: Executes assigned operational tasks (data entry, compiling records, preparing spreadsheets)."),
  bullet("Daily Activity Logging: Records progress percentages, notes, time spent, and uploads evidence files."),
  bullet("Blocker Reporting: Promptly raises issue tickets if blocked."),
  bullet("Revision Cycles: Incorporates manager feedback and resubmits deliverables."),
  bullet("Availability Management: Marks daily check-in, check-out, and updates availability status."),
  empty(),

  // Role 9
  h2("Role 9: Business Development Executive (Staff Mapping: Bhavani)"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Outbound Scout and Relationship Catalyst.")]),
  bold("Key Responsibilities:"),
  bullet("Membership Expansion Outreach: Conducts daily cold calls and structured email outreach to prospective firms."),
  bullet("Prospect Database Mining: Researches contacts from RERA portals, commercial directories, and Google."),
  bullet("Lead Portal Management: Operates Upturnly and 99acres portals for lead capture."),
  bullet("WhatsApp Outreach: Executes professional WhatsApp campaigns introducing CIRIL's network."),
  bullet("Follow-up Discipline: Maintains a rigorous follow-up queue, logging every call outcome and meeting schedule."),
  empty(),

  // Role 10
  h2("Role 10: Social Media Manager (Staff Mapping: Harshitha)"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Brand Broadcaster and Content Coordinator.")]),
  bold("Key Responsibilities:"),
  bullet("End-to-End Social Media Management: Plans and schedules digital content across LinkedIn, Instagram, YouTube."),
  bullet("Market Report Proofreading: Ensures flawless grammar, numerical accuracy, and brand alignment."),
  bullet("Office Vertical Calls Support: Coordinates zone-wise Office Vertical calls."),
  bullet("Conference Presentation Collaterals: Collaborates with the Graphic Designer for keynote presentations and photo archives."),
  bullet("Content Pipeline Tracking: Drives content through stages: Brief \u2192 Drafting \u2192 Internal Review \u2192 Changes Requested \u2192 Approved \u2192 Published."),
  empty(),

  // Role 11
  h2("Role 11: Graphic Designer"),
  p([new TextRun({ text: "Layman's Analogy: ", bold: true, italics: true }), new TextRun("The Master Visual Craftsman.")]),
  bold("Key Responsibilities:"),
  bullet("Design Brief Execution: Receives structured creative briefs from Social Media Manager, Operations Lead, and Conference Coordinators."),
  bullet("Version-Controlled Asset Delivery: Delivers iterative design drafts with strict versioning (v1.0, v1.1, v2.0)."),
  bullet("Conference & Event Collaterals: Designs delegate ID badges, speaker nameplates, conference backdrops, and banners."),
  bullet("Research Report Formatting: Formats complex tables, charts, and layout templates for quarterly research reports."),
  bullet("Asset Repository Maintenance: Organizes logos, project images, presentation templates, and source files."),
  empty(),

  h1("4. Multi-Role Capability & Seamless Workspace Context Switching"),
  h2("The Reality of Modern Corporate Work"),
  txt("In lean organizations like CIRIL, professionals frequently hold dual responsibilities:"),
  bullet("Harshitha operates as the Social Media Manager while simultaneously acting as an Executive handling Office Vertical calls."),
  bullet("Manasa operates as a Lead Manager while personally executing high-priority Retail Vertical Client Calls."),
  bullet("An IT Analyst might also perform routine Admin tasks during specific office shifts."),
  empty(),
  h2("The Unified Workspace Solution"),
  txt("The IOTS platform solves this elegantly without requiring separate accounts or clunky sign-outs:"),
  (() => { const ref = newNumRef("ch01-ws"); return [
    numberedItem("Unified Authentication: The user logs in once with their master corporate credentials.", ref),
    numberedItem("Account Profile Evaluation: The system detects all authorized system roles.", ref),
    numberedItem("Default Landing: The user lands on their primary role dashboard.", ref),
    numberedItem("Instant Context Switcher: A prominent dropdown allows switching between authorized workspaces in a single click.", ref),
    numberedItem("Session & Audit Segregation: Every action records both the employee's identity and the active role context.", ref),
  ]; })(),
  empty(),

  h1("5. Comprehensive Role-Based Access Control (RBAC) Matrix"),
  txt("The table below defines exact operational boundaries across all 11 roles:"),
  makeTable(
    ["Capability", "Chairman", "Super Admin", "Admin", "IT Analyst", "GM", "Sr Mgr", "Lead Mgr", "Exec", "BDE", "SMM", "GD"],
    [
      ["View Executive Radar", "\u2705 Full", "\u2705 Full", "\u274C", "\u2705 Full", "\u2705 Full", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["System Settings & RBAC", "\u274C", "\u2705 Full", "\u274C", "\u2705 Full", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Provision User Accounts", "\u274C", "\u2705 Full", "\u2705 Full", "\u2705 Full", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Set Office Geofences", "\u274C", "\u2705 Full", "\u2705 Full", "\u2705 Full", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Service Health & API", "\u274C", "\u2705 Full", "\u274C", "\u2705 Full", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Board Governance", "\u2705 View", "\u274C", "\u274C", "\u274C", "\u2705 Manage", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Cross-Team Balancing", "\u274C", "\u274C", "\u274C", "\u274C", "\u2705 View", "\u2705 Manage", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Assign & Reassign Tasks", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u2705 Full", "\u2705 Team", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Approve Submissions & QA", "\u274C", "\u274C", "\u274C", "\u274C", "\u2705 High", "\u2705 Sr", "\u2705 Team", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Execute Tasks & Log", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u2705 Own", "\u2705 Own", "\u2705 Own", "\u2705 Own"],
      ["Location Anomaly Audit", "\u2705 Full", "\u2705 Full", "\u2705 Full", "\u2705 Full", "\u2705 Dept", "\u2705 Teams", "\u2705 Team", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Corporate Announcements", "\u2705 Exec", "\u2705 Platform", "\u2705 General", "\u274C", "\u2705 Dept", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
      ["Approve Quarterly Awards", "\u2705 Final", "\u274C", "\u274C", "\u274C", "\u2705 Rec.", "\u2705 Rec.", "\u274C", "\u274C", "\u274C", "\u274C", "\u274C"],
    ],
    [1800, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700]
  ),
].flat();

// ===================== CHAPTER 02 =====================
const ch02 = [
  br(),
  p("Chapter 2", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Task Lifecycle, Execution Engine & Audit Architecture", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-02")]),
  empty(),

  h1("1. Executive Summary: The Task as an Indelible Contract"),
  txt("In the CIRIL IOTS platform, a task is treated as an auditable operational contract. From the moment a Lead Manager creates a task until its final sign-off, every stage, comment, time entry, document upload, and decision is recorded chronologically in an immutable ledger."),
  txt("Tasks cannot simply disappear, drift indefinitely, or be deleted without high-level administrative justification."),
  empty(),

  h1("2. The Multi-Tier State Machine"),
  txt("To maintain both executive clarity and granular operational control, IOTS uses a dual-layer state architecture:"),
  bullet("Core Reporting States (Macro Level): Used by Chairman, Senior Managers, and automated intelligence engines."),
  bullet("Operational Micro-States (Micro Level): Used by Lead Managers and Employees during daily execution."),
  empty(),

  h1("3. The 5 Core Reporting States"),
  makeTable(
    ["State", "Status Type", "Definition & Operational Trigger"],
    [
      ["1. ASSIGNED", "Active / Queued", "Task formally created by a Manager with deliverables, priority, and deadline, assigned to an employee."],
      ["2. PENDING", "Active / In-Flight", "Employee has acknowledged the assignment and work is underway within standard operational limits."],
      ["3. OVERDUE", "Exception", "Target deadline has elapsed without approved completion. Requires immediate managerial intervention."],
      ["4. REASSIGNED", "Active Transition", "Task transferred from one team member to another. Immediately resumes active execution under the new owner."],
      ["5. COMPLETED", "Terminal Milestone", "Deliverables thoroughly reviewed and officially approved by the Manager. Historical records sealed."],
    ],
    [1800, 1500, 5460]
  ),
  empty(),

  h1("4. The 7 Operational Micro-States"),
  makeTable(
    ["Micro-State", "Indicator", "Trigger & Meaning"],
    [
      ["In Progress", "Blue Solid", "Employee actively working on the task, logging time, or drafting deliverables."],
      ["Blocked", "Red Striped", "Employee encountered a roadblock and raised an Issue Ticket. Work paused."],
      ["Waiting for Review", "Amber Pulse", "Employee uploaded files and clicked \"Submit for Review\"."],
      ["Under Review / QA", "Purple Solid", "Manager opened the submission and is reviewing against quality criteria."],
      ["Changes Requested", "Orange Solid", "Manager identified defects and returned the submission with revision notes."],
      ["Issue Resolved", "Teal Solid", "Manager or stakeholder cleared the reported blocker, enabling work to resume."],
      ["Done / Closed", "Emerald Solid", "Manager confirmed all acceptance criteria met, closed and archived the task."],
    ],
    [2200, 1500, 5060]
  ),
  empty(),

  h1("5. Employee Work Execution & Activity Logging"),
  h2("The Difference Between State and Activity"),
  txt("States represent where the task sits in the governance pipeline, while Work Activities are chronological records created during that state. An employee can log ten activities during a single \"In Progress\" state."),
  empty(),
  h2("The 4 Structured Work Activities"),
  (() => { const ref = newNumRef("ch02-act"); return [
    numberedItem("Progress Percentage Updates: Slider or numeric input (0% to 100%) with mandatory brief summary.", ref),
    numberedItem("Work Notes & Context Memos: Freeform text entries capturing conversations, client remarks, research findings.", ref),
    numberedItem("Time-Spent / Effort Logging: Hours and minutes recorded for accurate delivery velocity calculation.", ref),
    numberedItem("Supporting Deliverables & Evidence: Direct file attachments with automatic version indexing.", ref),
  ]; })(),
  empty(),

  h1("6. Overdue Handling: Active Managerial Intervention"),
  txt("In IOTS, Overdue is an actionable operational alarm. When the clock crosses the deadline:"),
  (() => { const ref = newNumRef("ch02-od"); return [
    numberedItem("The task status transitions automatically to OVERDUE.", ref),
    numberedItem("A priority alert is dispatched to the Lead Manager's Manager Action Center.", ref),
    numberedItem("The system presents the Lead Manager with a mandatory Overdue Intervention Workflow.", ref),
  ]; })(),
  empty(),
  bold("Manager Intervention Options:"),
  bullet("Option 1: Grant Deadline Extension (with mandatory business justification)"),
  bullet("Option 2: Reassign to Available Member (with context handover)"),
  bullet("Option 3: Escalate to Senior Manager"),
  bullet("Option 4: Scope Reduction / Direct Guidance"),
  empty(),

  h1("7. The Reassignment Protocol"),
  txt("Reassignment is a high-impact managerial decision. Step-by-step controlled workflow:"),
  (() => { const ref = newNumRef("ch02-ra"); return [
    numberedItem("Trigger: Manager selects a task and clicks \"Reassign Task\".", ref),
    numberedItem("Workload Assessment: The system displays the Team Bandwidth Radar.", ref),
    numberedItem("Reason Selection: Manager selects a standardized reassignment category.", ref),
    numberedItem("Context Handover Memo: Manager writes a mandatory handover note.", ref),
    numberedItem("Indelible Audit Log: The task is tagged with Reassigned. Both names remain in task history.", ref),
  ]; })(),
  empty(),

  h1("8. The Quality Review & Correction Cycle"),
  txt("Managerial review is never a blunt \"Approve\" or \"Reject\". Rejection initiates a collaborative correction cycle:"),
  (() => { const ref = newNumRef("ch02-qr"); return [
    numberedItem("Employee submits deliverable (files + notes). Task moves to \"Waiting for Review\".", ref),
    numberedItem("If deliverable meets standards: Manager approves. Task marked Completed. Points awarded.", ref),
    numberedItem("If changes required: Manager returns with itemized feedback. Task enters \"Correction Cycle\".", ref),
    numberedItem("Employee implements corrections, updates files, and resubmits with revision changelog.", ref),
    numberedItem("Manager conducts final QA approval. Formally closed.", ref),
  ]; })(),
  empty(),

  h1("9. The Reusable Immutable Audit History Component"),
  txt("Every critical object in IOTS (Tasks, User Accounts, Geofences, Leave Requests, Royalty Settlements) contains an embedded Audit History Ledger."),
  h2("Immutable Ledger Rules"),
  (() => { const ref = newNumRef("ch02-al"); return [
    numberedItem("Append-Only: Audit records can never be updated, overwritten, or deleted by any user.", ref),
    numberedItem("Deterministic Attribution: Every entry records Actor ID, Name, Active Role, Timestamp (ISO-8601), Origin IP, and Geolocation.", ref),
    numberedItem("Before & After Delta: Records precisely what changed (e.g., Priority: Normal \u2192 Critical).", ref),
    numberedItem("Source Distinction: Visually differentiates User-Initiated vs. System-Automated actions.", ref),
  ]; })(),
].flat();

// ===================== CHAPTER 03 =====================
const ch03 = [
  br(),
  p("Chapter 3", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Attendance, Geolocation Engine & Security Auditing", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-03")]),
  empty(),

  h1("1. Executive Summary: Why Location and Availability Matter"),
  txt("The IOTS Attendance, Geolocation & Security Engine balances rigorous corporate compliance with a dignified, frictionless employee experience. It validates location silently during login, records work hours automatically, allows employees to communicate their live availability, and equips executive leadership with a comprehensive security radar."),
  empty(),

  h1("2. Real-Time Availability State Machine"),
  txt("At any point during the workday, an employee's live availability status is visible across the system."),
  h2("The 10 Standard Availability States"),
  makeTable(
    ["Status", "Indicator", "Definition & Impact"],
    [
      ["Available", "Green Solid", "Logged in, at desk, ready to accept new assignments."],
      ["Busy", "Red Solid", "Actively executing a high-priority task. Avoid urgent interruptions."],
      ["In Meeting", "Blue Solid", "Participating in a team standup, vertical call, or client briefing."],
      ["On Break", "Amber Solid", "Stepped away for lunch, tea, or personal rest. Work-timer paused."],
      ["In Training", "Indigo Solid", "Undergoing onboarding, compliance modules, or software training."],
      ["Do Not Disturb", "Purple Solid", "Deep focus mode (e.g., Graphic Designer formatting an annual report)."],
      ["Working Remotely", "Cyan Solid", "Logged in from home or approved off-site location with verified geolocation."],
      ["On Leave", "Gray Solid", "Formally approved leave. Excluded from daily active task allocations."],
      ["Absent", "Crimson Solid", "Unexcused failure to log in. Triggers an HR attendance flag."],
      ["Offline", "Slate Solid", "Logged off at the end of the shift."],
    ],
    [2000, 1500, 5260]
  ),
  empty(),

  h1("3. The Geolocation Engine & Office Perimeter Geofencing"),
  h2("How Geolocation Operates During Unified Login"),
  txt("When an employee enters their credentials, the system executes a three-step security handshake in milliseconds:"),
  (() => { const ref = newNumRef("ch03-geo"); return [
    numberedItem("Credential Validation: Checks Employee ID and password.", ref),
    numberedItem("Hardware GPS Query: Queries Browser Hardware GPS API for latitude and longitude coordinates.", ref),
    numberedItem("Reverse Geocoding: Resolves City, Locality, Suburb via BigDataCloud.", ref),
    numberedItem("Geofence Comparison: Checks if distance <= authorized office radius (e.g., 100m).", ref),
    numberedItem("Session Tagging: Tags as \"Office / On-Premise\" (green) or \"Remote / Off-Site\" (amber).", ref),
    numberedItem("Audit Recording: Writes indelible login event with coordinates, IP, timestamp, and device.", ref),
    numberedItem("Dashboard Routing: Routes user to role-specific dashboard.", ref),
  ]; })(),
  empty(),
  h2("The Geofencing Mathematics: Haversine Calculation"),
  txt("The server checks the employee's GPS coordinates against the master office coordinates using the spherical Haversine formula. If the calculated distance d <= Office Radius (e.g., 100 meters), the session is verified as \"Office / On-Premise\"."),
  empty(),
  h2("Approved CIRIL Office Perimeters"),
  bullet("CIRIL Central Headquarters (Hyderabad): Banjara Hills / Hitec City Campus (Radius: 150m)"),
  bullet("Bengaluru Zonal Office: MG Road / Indiranagar Hub (Radius: 100m)"),
  bullet("Mumbai Zonal Office: Bandra-Kurla Complex (BKC) (Radius: 120m)"),
  bullet("Delhi-NCR Zonal Office: Cyber City, Gurugram (Radius: 150m)"),
  empty(),

  h1("4. Handling Unknown or Remote Login Locations: Dignity Over Fear"),
  txt("The IOTS philosophy is fundamentally different from legacy systems:"),
  (() => { const ref = newNumRef("ch03-rem"); return [
    numberedItem("Friendly Transparency: If an employee is outside the office perimeter, the system does NOT block them.", ref),
    numberedItem("Contextual Tagging: The system displays a calm, reassuring message tagging the session as \"Remote / Off-Site\".", ref),
    numberedItem("Optional Reason Memo: The employee can enter a quick note.", ref),
    numberedItem("Manager Notification: The Lead Manager sees a subtle orange pin next to the employee's name.", ref),
  ]; })(),
  empty(),

  h1("5. Attendance & Work Hours Computation"),
  h2("Automated Work Hours Ledger"),
  bullet("Check-In Timestamp: Captured automatically upon first successful login of the day."),
  bullet("Check-Out Timestamp: Captured when the user clicks \"Check-Out & Logoff\"."),
  bullet("Net Work Hours = (Check-Out Time - Check-In Time) - Sum(Break Durations)"),
  empty(),
  h2("Overtime & Punctuality Scoring"),
  bullet("Standard Corporate Shift: 9:30 AM to 6:30 PM (9.0 Gross Hours / 8.0 Net Productive Hours)."),
  bullet("Grace Period: 15 minutes (arrivals up to 9:45 AM are marked on-time)."),
  bullet("Late Arrivals: Logins after 9:45 AM are flagged. Three unexcused late arrivals in a month trigger an automated notification to HR."),
  empty(),

  h1("6. Employee Requests & Self-Service Portal"),
  h2("Supported Request Categories"),
  (() => { const ref = newNumRef("ch03-req"); return [
    numberedItem("Leave Requests: Casual Leave, Sick Leave, Earned/Privilege Leave, and Compensatory Off.", ref),
    numberedItem("Short Permission Requests: 1 to 2 hours for appointments or emergencies.", ref),
    numberedItem("Scheduled Remote Work Requests: Prior approval for work-from-home days.", ref),
    numberedItem("Task Clarification / Guidance Requests: Urgent 15-minute sync with Lead Manager.", ref),
    numberedItem("Operational Resource Requests: Hardware, software licenses, portal credits, or conference stationery.", ref),
  ]; })(),
  empty(),

  h1("7. Security Auditing & Chairman Anomaly Cockpit"),
  txt("The Chairman, Super Admin, and IT System Analyst have access to the Master Security & Location Audit Center."),
  h2("Anomaly Scenarios & Automatic Safeguards"),
  (() => { const ref = newNumRef("ch03-ano"); return [
    numberedItem("Impossible Travel Velocity: If a user logs in from Hyderabad at 10:00 AM and the same account logs in from Dubai at 10:45 AM, the system detects physical impossibility, suspends the second session, and dispatches an urgent alert.", ref),
    numberedItem("Ghost Logins & Session Hijacking: Sessions are bound to cryptographically signed browser tokens and hardware fingerprints.", ref),
    numberedItem("Full Location Audit History: Every login event is preserved with its reverse-geocoded address, GPS coordinates, public IP, ISP, and browser user-agent.", ref),
  ]; })(),
].flat();

// ===================== CHAPTER 04 =====================
const ch04 = [
  br(),
  p("Chapter 4", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("CIRIL Commercial Operations, Revenue Architecture & Market Intelligence", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-04")]),
  empty(),

  h1("1. Executive Summary: The CIRIL Syndication Model"),
  txt("CIRIL resolves fragmented commercial real estate brokerage by operating as an apex clearinghouse and national alliance of certified advisory firms. CIRIL provides the national umbrella, standardized institutional proposal templates, trusted escrow dispute resolution, proprietary market intelligence, and automated fee distribution."),
  empty(),

  h1("2. The 4-Tier Geographic Hierarchy"),
  txt("All transactions, listings, member companies, and broker teams are organized into a structured territorial matrix:"),
  (() => { const ref = newNumRef("ch04-geo"); return [
    numberedItem("Country Tier: Sovereign Jurisdiction (India) \u2014 National governance, tax codes, currency.", ref),
    numberedItem("Zone Tier: Multi-State Territories \u2014 North, West, South, East, Central zones.", ref),
    numberedItem("State Tier: Regulatory & Tenancy Jurisdictions \u2014 Karnataka (RERA), Maharashtra (MahaRERA), Telangana.", ref),
    numberedItem("City Tier: Metropolitan Commercial Hubs \u2014 Bengaluru, Mumbai, Hyderabad.", ref),
  ]; })(),
  empty(),

  h1("3. The 6-Phase End-to-End Transaction Lifecycle"),
  txt("Every corporate mandate flowing through the CIRIL alliance moves through a structured, auditable six-phase workflow:"),
  h2("Phase 1: Mandate Origination (Lead Giver Stage)"),
  txt("A Member Company secures a mandate from an enterprise client and logs it in IOTS with space category, required area, target budget, and technical requirements."),
  h2("Phase 2: Central Clearance & Destination Handoff"),
  txt("CIRIL Headquarters verifies the mandate and routes it to an accredited Lead Receiver in the destination city. The recipient must formally Accept or Reject within 24 hours."),
  h2("Phase 3: Sourcing & Institutional Proposals"),
  txt("The Lead Receiver sources inventory and produces: First-Cut Proposal (3\u20135 options) and Detailed Institutional Proposal (exhaustive report)."),
  h2("Phase 4: Inspections & The 7-Stage Negotiation Pipeline"),
  (() => { const ref = newNumRef("ch04-neg"); return [
    numberedItem("Basic Prospecting & Property Identification", ref),
    numberedItem("Physical Site Inspection Conducted", ref),
    numberedItem("Shortlisting & Developer RFPs", ref),
    numberedItem("Commercial Offer Submission", ref),
    numberedItem("Non-Binding Term Sheet / LOI Finalization", ref),
    numberedItem("Legal Drafting & Title Due Diligence", ref),
    numberedItem("Final Agreement Execution & Registration", ref),
  ]; })(),
  h2("Phase 5: Deal Conclusion & Financial Milestone Lock"),
  txt("Upon execution of the registered lease deed or sale deed, the manager reviews figures and clicks \"Calculations Completed\", locking the economics."),
  h2("Phase 6: Fee Apportionment & Royalty Settlement"),
  txt("The financial engine computes gross brokerage, divides proceeds between Lead Giver (30%) and Lead Receiver (70%), and extracts CIRIL's 7.5% corporate royalty."),
  empty(),

  h1("4. Commercial Mathematics & Fee Structures"),
  h2("4.1 Base Brokerage Calculation"),
  makeTable(
    ["Deal Classification", "Valuation Base Formula", "Standard Gross Brokerage Pool"],
    [
      ["Commercial Lease / Rental", "Gross Rent = Monthly Rent/sqft \u00D7 Chargeable Area", "1 Month (30 Days) Rental Value"],
      ["Outright Sale / Acquisition", "Total Consideration = Capital Rate/sqft \u00D7 Total Area", "Fixed 1.00% of Total Transaction"],
    ],
    [2600, 3380, 2780]
  ),
  empty(),
  h2("4.2 Inter-Member Brokerage Split (LG vs. LR)"),
  bullet("Lead Giver (LG) Share \u2014 30%: Compensates the member firm that captured and introduced the enterprise relationship."),
  bullet("Lead Receiver (LR) Share \u2014 70%: Compensates the executing member firm for property searches, inspections, negotiations, and legal closing."),
  empty(),
  h2("4.3 The CIRIL Corporate Royalty Engine (7.5%)"),
  txt("CIRIL central headquarters earns a 7.5% corporate royalty deducted proportionally from both participating member partners. Total CIRIL Corporate Royalty = 7.5% \u00D7 Total Gross Brokerage."),
  empty(),
  h2("4.4 Financial Simulation Scenarios"),
  makeTable(
    ["Financial Metric", "Scenario A: Grade-A Office Lease", "Scenario B: Land Acquisition"],
    [
      ["Deal Parameters", "50,000 sqft @ \u20B980/sqft/month", "100,000 sqft @ \u20B92,500/sqft capital"],
      ["Gross Transaction Value", "\u20B940,00,000/month rent", "\u20B925,00,00,000 (\u20B925 Crore)"],
      ["Total Gross Brokerage Pool", "\u20B940,00,000 (1 Month Rental)", "\u20B925,00,000 (1.00%)"],
      ["Lead Giver Share (30%)", "\u20B912,00,000", "\u20B97,50,000"],
      ["Lead Receiver Share (70%)", "\u20B928,00,000", "\u20B917,50,000"],
      ["Royalty by LG (7.5%)", "\u20B990,000", "\u20B956,250"],
      ["Royalty by LR (7.5%)", "\u20B92,10,000", "\u20B91,31,250"],
      ["Net CIRIL Royalty (7.5%)", "\u20B93,00,000", "\u20B91,87,500"],
      ["Net Retained by LG", "\u20B911,10,000 (92.5%)", "\u20B96,93,750 (92.5%)"],
      ["Net Retained by LR", "\u20B925,90,000 (92.5%)", "\u20B916,18,750 (92.5%)"],
    ],
    [2600, 2880, 3280]
  ),
  empty(),

  h1("5. How Internal Operations Staff Manage Commercial Deals in IOTS"),
  h2("1. Manasa (Lead Manager \u2013 Operations)"),
  bullet("Royalty Tracking & Concluded Deals: Monitors transactions, reviews splits, follows up on 7.5% royalty remittances."),
  bullet("Vertical Coordination Calls: Weekly calls across Retail, L&W, Land, and Hotel verticals."),
  bullet("Office Listing Management: Uploads verified commercial listings to portal databases."),
  bullet("Quarterly Member Ratings & Lead Exchanges: Prepares quarterly matrices and member performance ratings."),
  bullet("Conferences & Print Vendors: Coordinates printing for stationery, ID cards, nameplates, and market reports."),
  empty(),
  h2("2. Bhavani (Business Development Executive)"),
  bullet("Network Expansion: Daily outreach to prospective commercial brokerage firms."),
  bullet("Database Mining: Gathers contacts from RERA portals, Google, and industry directories."),
  bullet("Lead Generation Portals: Manages Upturnly and 99acres portals."),
  bullet("WhatsApp Campaigns: Coordinates outbound WhatsApp sequences."),
  empty(),
  h2("3. Harshitha (Social Media Manager & Operations Executive)"),
  bullet("End-to-End Social Media: Publishes deal announcements, market statistics, and member spotlights."),
  bullet("Market Report Proofreading: Validates quarterly publications for accuracy and branding."),
  bullet("Office Vertical Calls: Coordinates zone-wise client and broker calls."),
  bullet("Conference Presentations: Produces keynote slide decks and speaker visuals."),
  empty(),
  h2("4. Ipsheeta (General Manager \u2013 Admin & Expansions)"),
  bullet("Board Governance: Organizes quarterly board meetings, drafts agendas and minutes."),
  bullet("Legal Compliance & Contracts: Coordinates with counsel for membership agreements and NDAs."),
  bullet("Finance & Accounting Oversight: Tracks corporate royalty invoices and event budgets."),
  bullet("High-Level Expansion Presentations: Executive pitch meetings with prospective member firms."),
  empty(),
  h2("5. Chairman"),
  bullet("Apex Executive Radar: Reviews complete corporate royalty ledger, active multi-city pipelines, and network health."),
  empty(),

  h1("6. Proprietary Market Intelligence Engine"),
  (() => { const ref = newNumRef("ch04-mi"); return [
    numberedItem("Rental Trends Benchmark: Tracks micro-market rental movements, vacancy absorptions, and lease rates.", ref),
    numberedItem("Landmark Deals Archive: Catalogs major multi-thousand sq ft leases across BFSI, IT/ITeS, and manufacturing.", ref),
    numberedItem("Upcoming Supply Pipeline: Maintains a registry of under-construction commercial towers with expected timelines.", ref),
    numberedItem("Landlord & Tenant Data Mining: Tracks upcoming enterprise lease expirations to trigger early renewals.", ref),
  ]; })(),
].flat();

// ===================== CHAPTER 05 =====================
const ch05 = [
  br(),
  p("Chapter 5", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Intelligence, Analytics & Automated Reporting Layer", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-05")]),
  empty(),

  h1("1. Executive Summary: Transforming Operational Exhaust into Management Wisdom"),
  txt("The Intelligence & Analytical Layer continuously harvests operational data to provide actionable management intelligence."),
  bold("The Enterprise Visual Principle: Zero Decorative Charts"),
  txt("In IOTS, every chart must answer a vital business question:"),
  bullet("Are client proposals being delivered on schedule?"),
  bullet("Which specific employee is facing burnout from workload concentration?"),
  bullet("Why is a particular task being repeatedly reassigned?"),
  bullet("Where are unresolved blockers causing deal delays?"),
  empty(),

  h1("2. The 3 Reporting Rhythms"),
  h2("Daily Rhythm (Operational Discipline)"),
  bullet("Daily Operational Digest generated at 18:30 IST."),
  bullet("Focus: Tasks completed today, overdue items, unresolved blockers, tomorrow's priorities."),
  bullet("Audience: Employees & Lead Managers."),
  h2("Weekly Rhythm (Tactical Coordination)"),
  bullet("Weekly Departmental Review generated Monday 09:00 IST."),
  bullet("Focus: SLA on-time delivery rate, workload rebalancing, team capacity trends."),
  bullet("Audience: Senior Managers & General Manager."),
  h2("Monthly Rhythm (Strategic & Reward Oversight)"),
  bullet("Monthly Executive Scorecard generated 1st of month."),
  bullet("Focus: Departmental target fulfillment, royalty settlements, reward system standings."),
  bullet("Audience: Chairman & Board of Directors."),
  empty(),

  h1("3. The 6 Dedicated Analytics Centers"),
  h2("Center 1: Performance & Velocity Analytics"),
  txt("Answers: How fast, how well, and how consistently are teams delivering work?"),
  bullet("Task Completion Rate: Completed Tasks / Total Assigned Tasks \u00D7 100"),
  bullet("On-Time SLA Delivery Rate: Tasks Completed On-Time / Total Completed \u00D7 100"),
  bullet("Average Turnaround Duration: Mean time from Assigned to Completed."),
  bullet("Rework & Revision Index: Frequency of tasks returned with \"Changes Requested\"."),
  empty(),
  h2("Center 2: Task & Workload Distribution Analytics"),
  txt("Answers: Is work distributed fairly, or are specific individuals becoming bottlenecks?"),
  bullet("Team Workload Capacity Radar: Compares active task commitments against standard 8-hour daily capacity."),
  bullet("Concentration Analysis: Identifies if 80% of critical tasks are loaded onto 20% of staff."),
  bullet("Task Pipeline Distribution: Real-time breakdown of tasks in each state."),
  empty(),
  h2("Center 3: Attendance & Workforce Health Analytics"),
  txt("Answers: Are teams present, punctual, and working in healthy environments?"),
  bullet("Punctuality Index: Percentage of on-time check-ins within the 15-minute grace period."),
  bullet("Attendance Consistency: Tracking unplanned absences and leave utilization."),
  bullet("Workplace Ratio: On-Premise vs. Remote / Off-Site hours."),
  bullet("Availability Patterns: Hours spent in Available, Busy, In Meeting, and On Break."),
  empty(),
  h2("Center 4: Trend & Historical Pattern Analysis"),
  txt("Answers: Are we improving over time, or are delays becoming systemic?"),
  bullet("Time Horizon Comparative Analysis: Today vs. Yesterday, This Week vs. Last Week, Last 30 Days vs. Prior 30, Quarter-to-Date vs. Prior Quarter."),
  bullet("Velocity Trends: Whether average task turnaround is accelerating or stagnating."),
  empty(),
  h2("Center 5: Exception & Risk Analysis (The 3-Tier Risk Engine)"),
  txt("The system continuously scans all operational data and classifies exceptions into three standardized risk tiers:"),
  makeTable(
    ["Risk Tier", "Criteria & Triggers", "Automated System Response"],
    [
      ["Tier 1: Low Risk", "Task due within 4h with progress below 30%. First-time minor punctuality flag. Single revision requested.", "Informational alert in employee workspace; logged in daily digest."],
      ["Tier 2: Medium Risk", "Task overdue by 4\u201324 hours. Reassigned 2+ times. Employee capacity >110%. Blocker open >8 hours.", "Amber flash in Lead Manager Action Center; demands active resolution."],
      ["Tier 3: High/Critical", "Task overdue >48 hours without extension. Unresolved blocker halting deal. Repeated unexcused absence. Security anomaly.", "Escalates to Senior Manager and Chairman; requires logged intervention."],
    ],
    [2000, 3380, 3380]
  ),
  empty(),
  h2("Center 6: Predictive Operational Signals"),
  (() => { const ref = newNumRef("ch05-pred"); return [
    numberedItem("SLA Breach Warning: If 2 hours remain but average completion is 4 hours and progress is only 15%, displays a \"Potential SLA Breach\" alert.", ref),
    numberedItem("Burnout Early-Warning: If an employee logs >10 net work hours for 4 consecutive days at >100% capacity, alerts the Lead Manager.", ref),
    numberedItem("Vendor Bottleneck Warning: If historical data reveals delayed vendor deliveries, prompts the Lead Manager to adjust milestone schedules.", ref),
  ]; })(),
  empty(),

  h1("4. Role-Scoped Automated Report Delivery"),
  makeTable(
    ["Report Name", "Frequency", "Cadence", "Recipients", "Format"],
    [
      ["Executive Radar", "Monthly", "1st of Month", "Chairman, GM", "PDF / Deck"],
      ["Multi-Team Ops", "Weekly", "Mon 09:00 IST", "Senior Managers", "PDF / Sheet"],
      ["Team Action Plan", "Daily", "Daily 18:30", "Lead Managers", "Web / Email"],
      ["Personal Score", "Monthly", "1st of Month", "All Employees", "Web / Modal"],
    ],
    [2200, 1200, 1700, 1800, 1860]
  ),
  empty(),
  h2("Role-Scoped Delivery Matrix"),
  bullet("To the Chairman: 2-page Executive Radar summarizing enterprise health, 7.5% royalty totals, critical escalations, and 3-month award candidates."),
  bullet("To GM & Senior Managers: Cross-departmental workload matrices, SLA delivery trends, overdue resolution audits."),
  bullet("To Lead Managers: Actionable daily checklists: tasks needing QA review, pending leave approvals, overdue interventions."),
  bullet("To Execution Staff: Personal monthly performance scorecards showing completed tasks, on-time delivery, time tracked, and reward progress."),
].flat();

// ===================== CHAPTER 06 =====================
const ch06 = [
  br(),
  p("Chapter 6", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Employee Performance, Reward & Recognition System", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-06")]),
  empty(),

  h1("1. Executive Summary: The Philosophy of Objective Recognition"),
  txt("The CIRIL IOTS Performance, Reward & Recognition System establishes complete objectivity and transparency. Because every task, delivery timestamp, review cycle, and attendance record is already captured accurately, recognition is calculated through transparent mathematical scoring."),
  txt("Every employee can see their live performance score and reward trajectory directly on their personal workspace dashboard every single day."),
  empty(),

  h1("2. The Dual-Tier Reward Architecture: Monthly & Quarterly"),
  h2("Tier 1: Monthly Star Performer"),
  txt("Evaluated monthly. An employee scoring >= 90 on the 100-point scale earns the Monthly Star Performer award (Cash Spot Bonus + Digital Badge)."),
  h2("Tier 2: Chairman's Quarterly Excellence Award"),
  txt("If an employee maintains Gold Tier for 3 consecutive months, an automated shortlist is dispatched to the Chairman's cockpit for formal review and personal sign-off."),
  bold("Quarterly Honours Package:"),
  bullet("Substantial Quarterly Cash Incentive"),
  bullet("Personal Commendation from Chairman"),
  bullet("Public Presentation at Zonal/Annual Conference"),
  bullet("Gold Star Permanent Profile Medallion"),
  empty(),

  h1("3. The Comprehensive Performance Scoring Formula (100-Point Scale)"),
  txt("Overall Monthly Performance Score (S_perf) = P_vol + P_sla + P_qual + P_punct + P_init"),
  empty(),
  h2("1. Task Delivery & Velocity (P_vol, Max 35 Points)"),
  txt("P_vol = 35 \u00D7 (Completed Tasks / Total Assigned Tasks)"),
  h2("2. On-Time SLA Achievement (P_sla, Max 30 Points)"),
  txt("P_sla = 30 \u00D7 (Tasks Completed On or Before Deadline / Total Completed Tasks)"),
  h2("3. First-Time Quality & Revision Index (P_qual, Max 15 Points)"),
  txt("P_qual = 15 \u00D7 (1 - Tasks Returned for Revision / Total Submissions)"),
  h2("4. Punctuality & Location Integrity (P_punct, Max 10 Points)"),
  txt("10 Points: 100% on-time arrivals, zero unexcused location anomalies. Deductions: -2 points per unexcused late arrival beyond the monthly grace quota."),
  h2("5. Initiative & Blocker Resolution (P_init, Max 10 Points)"),
  txt("Evaluated by the Lead Manager during monthly reviews for proactive problem-solving and positive communication."),
  empty(),

  h1("4. Performance Tiers & Monthly Rewards"),
  makeTable(
    ["Tier Name", "Score Range", "Standing", "Monthly Reward & Recognition"],
    [
      ["Gold Tier", "90 \u2013 100", "Exceptional", "\"Star Performer\" Badge, Cash Spot Bonus, Spotlight feature, Counts toward 3-Month Award"],
      ["Silver Tier", "80 \u2013 89", "Strong & Reliable", "\"High Achiever\" Commendation, Full quarterly bonus eligibility"],
      ["Bronze Tier", "70 \u2013 79", "Standard Ops", "Meets baseline corporate expectations"],
      ["Needs Focus", "< 70", "Below Benchmark", "Triggers constructive 1-on-1 coaching, automated review of workload or training gaps"],
    ],
    [1500, 1200, 1500, 4560]
  ),
  empty(),

  h1("5. The 3-Consecutive-Month Chairman's Quarterly Excellence Award"),
  h2("The Rule of Unwavering Consistency"),
  (() => { const ref = newNumRef("ch06-3mo"); return [
    numberedItem("Continuous Qualification: Employee must achieve Gold Tier (score >= 90) in three consecutive calendar months.", ref),
    numberedItem("The Reset Covenant: If an employee dips below Gold in any month, the streak counter resets to zero.", ref),
    numberedItem("Chairman Direct Cockpit Shortlist: Upon third consecutive Gold month, the system generates a Chairman Quarterly Honours Dossier.", ref),
    numberedItem("Executive Commendation: The Chairman reviews the dossier and signs off on the award.", ref),
  ]; })(),
  empty(),
  bold("Quarterly Honours Package:"),
  bullet("Substantial Cash Incentive dispatched with quarterly payroll."),
  bullet("Formal Chairman's Trophy & Framed Commendation presented at Annual or Zonal Conference."),
  bullet("Permanent Gold Star Profile Medallion displayed across all system modules."),
  bullet("Fast-Track Career Progression: Primary prerequisite for promotions."),
  empty(),

  h1("6. Role-Specific KPI Customization"),
  h2("BDE (Bhavani)"),
  bullet("Outreach volume (calls, emails, WhatsApp sequences)."),
  bullet("Prospect pipeline conversions."),
  bullet("Follow-up adherence (zero overdue callbacks)."),
  h2("Social Media Manager (Harshitha)"),
  bullet("Content calendar adherence."),
  bullet("Market report proofreading timeliness."),
  bullet("Campaign delivery."),
  h2("Graphic Designer"),
  bullet("Creative turnaround speed."),
  bullet("Version iteration efficiency (final approval within \u22642 revision cycles)."),
  bullet("Conference collaterals print readiness."),
  h2("Operations Lead / Lead Manager (Manasa)"),
  bullet("Team SLA adherence."),
  bullet("Royalty calculation accuracy (zero financial errors)."),
  bullet("Workload balance health (zero prolonged overload)."),
  empty(),

  h1("7. Dignity & Anti-Burnout Safeguards"),
  (() => { const ref = newNumRef("ch06-ab"); return [
    numberedItem("No Midnight Heroics Required: Points are capped at standard shift durations. Working 14-hour days does not grant extra points.", ref),
    numberedItem("Transparent Dispute Resolution: Employees can submit a 1-click Score Review Request to the Senior Manager.", ref),
    numberedItem("Open Self-Inspection: Employees can click on any score component to view the exact math and underlying records.", ref),
  ]; })(),
].flat();

// ===================== CHAPTER 07 =====================
const ch07 = [
  br(),
  p("Chapter 7", { heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 400, after: 80 } }),
  p("Enterprise UI/UX Design System & Dashboard Blueprints", { alignment: AlignmentType.CENTER, bold: true, spacing: { after: 200 }, size: 28 }),
  p([new TextRun({ text: "Document Code: ", bold: true }), new TextRun("IOTS-DOC-07")]),
  empty(),

  h1("1. Executive Summary: \"Complex Underneath, Simple on Top\""),
  txt("The IOTS Design System resolves the needs of both senior executives and operational specialists through progressive disclosure and a restrained, functional design language. It rejects consumer SaaS gimmicks in favor of a clean, high-density, and trustworthy operational cockpit."),
  empty(),

  h1("2. Core Design Principles & Enterprise Tokens"),
  h2("2.1 The 5 Visual Rules"),
  (() => { const ref = newNumRef("ch07-vr"); return [
    numberedItem("Calm, High-Information Density: Containers use crisp 1px borders and subtle backgrounds, ensuring focus on data.", ref),
    numberedItem("Never Convey Status by Color Alone: Every status badge pairs a semantic color with unambiguous text label and icon.", ref),
    numberedItem("Desktop-First (1440px Standard): Tailored for widescreen displays using a rigid 12-column CSS grid.", ref),
    numberedItem("Contextual Drawers Over Page Jumps: Inspecting task history opens a smooth right-hand slide-out drawer (w-[480px]).", ref),
    numberedItem("Two-Step Confirmation for High-Impact Decisions: Reassigning, revoking, or extending triggers a modal with mandatory justification.", ref),
  ]; })(),
  empty(),
  h2("2.2 Semantic Color Tokens"),
  makeTable(
    ["Status", "Color", "Usage"],
    [
      ["Normal / Active", "Emerald (#10B981)", "Standard progress, healthy SLA"],
      ["Pending / Queued", "Amber (#F59E0B)", "Awaiting action, review queued"],
      ["Revision Needed", "Orange (#F97316)", "Changes requested by manager"],
      ["Overdue / Blocked", "Rose (#F43F5E)", "Missed SLA, active blocker"],
      ["In Progress", "Sky (#0EA5E9)", "Active execution, timer running"],
      ["Privileged / QA", "Purple (#A855F7)", "Managerial review, IT diagnostic"],
      ["Offline / Archived", "Slate (#64748B)", "Inactive, signed off, sealed"],
    ],
    [2400, 2400, 3960]
  ),
  empty(),

  h1("3. The Unified Common Login Screen Blueprint"),
  txt("The login screen is the common front door for all 11 roles. There is no public registration, and users do not pick their role on this screen."),
  h2("The 8 Unified Login Interaction States"),
  (() => { const ref = newNumRef("ch07-login"); return [
    numberedItem("Empty Login: Clean form fields, button inactive until credentials are entered.", ref),
    numberedItem("Invalid Credentials: Subtle inline warning. Locks after 5 attempts.", ref),
    numberedItem("Successful Credentials: Lock icon animates, verifying user account.", ref),
    numberedItem("Location Verification in Progress: Friendly spinner: \"Verifying location security context...\"", ref),
    numberedItem("Recognized Office Perimeter: Green badge: \"Office / On-Premise\".", ref),
    numberedItem("Remote / Off-Site Location: Calm amber pill with optional reason memo.", ref),
    numberedItem("Account Disabled / Suspended: Informational message to contact General Manager.", ref),
    numberedItem("Automated Role Routing: System calculates permissions and transitions to authorized workspace.", ref),
  ]; })(),
  empty(),

  h1("4. The Master Application Shell"),
  txt("Every authenticated screen shares an identical top-level layout shell containing: CIRIL branding, office location pill, availability badge, active workspace context switcher dropdown, global search, notifications bell, and user profile menu. The left sidebar provides role-specific navigation. The main content area uses the 12-column grid."),
  empty(),

  h1("5. Screen Blueprints for all 11 Roles"),
  h2("1. Chairman Dashboard (Apex Executive Cockpit)"),
  bullet("Enterprise Health Radar: Operational Health %, Active Mandates & Deals, Critical Escalations, Workforce Availability."),
  bullet("Requires Attention Panel: Overdue tasks >48 hours, repeated reassignments, blocked deal closures."),
  bullet("Organizational Pulse: 30-day task completion velocity, SLA trend line, quarterly member growth."),
  bullet("Executive Intervention Safeguard: High-visibility modal requiring secondary confirmation."),
  empty(),
  h2("2. Super Admin Dashboard (Platform Governance)"),
  bullet("Platform Settings, RBAC & Permissions, Master Verticals, Data Compliance, Full Audit Ledger."),
  bullet("RBAC Policy Editor: Visual permission matrix toggling capabilities across designations."),
  bullet("Full Immutable Audit Viewer: Raw data table with column filters."),
  empty(),
  h2("3. Admin Dashboard (Routine Administration)"),
  bullet("User Directory, Location & Geofencing, Global Task Oversight, Announcements, Attendance Audit."),
  bullet("Geofence Manager: Map view configuring office coordinates and radius buffers."),
  bullet("Announcement Studio: Rich-text editor with audience selectors."),
  empty(),
  h2("4. IT System Analyst Dashboard (Technical Reliability)"),
  bullet("Service Health, API & Microservices, Security Diagnostics, Technical Incidents, Change Logs."),
  bullet("Service Uptime Monitors: Real-time ping latency and status cards."),
  bullet("Authentication Anomalies Radar: Impossible travel velocities, session mismatches, concurrent logins."),
  bullet("One-Click Session Killer: Instant revocation with mandatory incident logging."),
  empty(),
  h2("5. General Manager Dashboard (Ipsheeta \u2013 Operations & Governance)"),
  bullet("Business Overview, Board Coordination, Accounts & Royalties, Legal Compliance, Expansion Pipeline."),
  bullet("Governance Center: Board meeting agenda builder, minute tracker, action item registry."),
  bullet("Royalty Reconciliation Ledger: Tracks open invoices and 7.5% clearances."),
  bullet("Legal Compliance Vault: Membership agreements, NDAs, and statutory filing deadlines."),
  empty(),
  h2("6. Senior Manager Dashboard (Multi-Team Operations)"),
  bullet("Multi-Team Overview, Cross-Team Workload, SLA Delivery, Escalation Center, Senior Approvals."),
  bullet("Cross-Team Balance Radar: Side-by-side capacity meters for all teams."),
  bullet("Senior Approval Queue: Major deadline adjustments and inter-team reallocations."),
  empty(),
  h2("7. Lead Manager Dashboard (Manasa \u2013 Team Command)"),
  bullet("Team Command, Task Manager, Live Status, Workload, Approvals / QA, Leave Requests, Blocker Center."),
  bullet("Live Team Radar: Table listing every team member with real-time availability."),
  bullet("Task Assignment Engine: Modal with priority, deliverables, SLA deadline, and bandwidth warning."),
  bullet("Overdue Intervention Center: Action cards with 1-click Extend, Reassign, or Escalate options."),
  bullet("QA Review Workbench: Split view with deliverable files and review controls."),
  empty(),
  h2("8. Executive Dashboard (Core Work Execution)"),
  bullet("My Workspace, Active Tasks, Work Activity, Blockers, Requests, Attendance, My Performance."),
  bullet("Today's Focus Banner: Highest-priority task with prominent \"Continue Work\" button."),
  bullet("Work Activity Logger: Quick modal for progress, notes, time, and file attachments."),
  bullet("Report Blocker Button: 1-click form to pause work and alert the Lead Manager."),
  empty(),
  h2("9. BDE Dashboard (Bhavani \u2013 Expansion)"),
  bullet("BD Command, Outreach Quota, Prospect Database, Portals (Upturnly / 99acres), Follow-up Queue."),
  bullet("Daily Quota Progress Bar: Calls completed, emails dispatched, WhatsApp intros sent."),
  bullet("Prospect Database Table: Verified contacts filtered by city, source, and qualification status."),
  bullet("Follow-up Calendar: Chronological callbacks with 1-click call logging."),
  empty(),
  h2("10. Social Media Manager Dashboard (Harshitha \u2013 Campaigns)"),
  bullet("Content Pipeline, Content Calendar, Campaign Hub, Report Proofreading, Creative Requests."),
  bullet("Visual Content Kanban: 6-column pipeline: Brief \u2192 Drafting \u2192 Review \u2192 Changes \u2192 Approved \u2192 Published."),
  bullet("Content Calendar View: Monthly grid for LinkedIn, Instagram, and YouTube releases."),
  bullet("Report Proofreading Queue: Dedicated reviewer workspace."),
  empty(),
  h2("11. Graphic Designer Dashboard (Creative Workbench)"),
  bullet("Creative Queue, Active Briefs, Version Asset Vault, Revision Center, Conference Collaterals."),
  bullet("Creative Queue Table: Incoming design requests with priority, format specs, and deadlines."),
  bullet("Version Asset Manager: File vault with iterative versions, thumbnails, author notes, and downloads."),
  bullet("Revision Workspace: Side-by-side view highlighting requested changes."),
  empty(),

  h1("6. The Reusable Task Detail Workspace Blueprint"),
  txt("Every user who clicks on a task across any dashboard is presented with a consistent, comprehensive workspace containing 6 sections:"),
  (() => { const ref = newNumRef("ch07-td"); return [
    numberedItem("Deliverables & Brief: Checklist of deliverable items and acceptance criteria.", ref),
    numberedItem("Work Notes & Evidence: Attached files with version indexes and secure cloud storage pointers.", ref),
    numberedItem("Blockers / Issues: Active blocker list with Report Blocker button.", ref),
    numberedItem("Activity & Time Logged: Chronological stream of time entries, file uploads, and progress updates.", ref),
    numberedItem("Submission & QA Review: Current review status with manager feedback.", ref),
    numberedItem("Immutable Audit Trail: Complete sealed history of every action performed on the task.", ref),
  ]; })(),
].flat();

// ===================== ASSEMBLE DOCUMENT =====================
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 52, bold: true, color: "1E3A5F", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: "1E3A5F", font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: "2D5F8A", font: "Arial" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: "3A7CA5", font: "Arial" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      { id: "Heading4", name: "Heading 4", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, italics: true, color: "4A8CB5", font: "Arial" },
        paragraph: { spacing: { before: 160, after: 100 }, outlineLevel: 3 } },
    ],
  },
  numbering: { config: numConfigs },
  sections: [{
    properties: {
      page: {
        margin: { top: 1200, right: 1200, bottom: 1200, left: 1200 },
        pageNumbers: { start: 1 }
      }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { after: 0 },
        children: [new TextRun({ text: "CIRIL IOTS \u2014 Enterprise System Encyclopedia", italics: true, color: "888888", size: 18, font: "Arial" })]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0 },
        children: [
          new TextRun({ text: "Page ", color: "888888", size: 18, font: "Arial" }),
          new TextRun({ children: [PageNumber.CURRENT], color: "888888", size: 18, font: "Arial" }),
          new TextRun({ text: " of ", color: "888888", size: 18, font: "Arial" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], color: "888888", size: 18, font: "Arial" }),
          new TextRun({ text: "  |  CIRIL Internal Operations Tracking System  |  Confidential", color: "AAAAAA", size: 16, font: "Arial" }),
        ]
      })] })
    },
    children: [...ch00, ...ch01, ...ch02, ...ch03, ...ch04, ...ch05, ...ch06, ...ch07],
  }]
});

const outPath = "C:\\Users\\ciril\\OneDrive\\Desktop\\Manikanta-Files\\Git\\monitoring-portal\\internal-operations-tracking-system\\iots-app\\documentation\\worker\\gemini_version.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log(`Document generated: ${outPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}).catch(err => { console.error("Error:", err); process.exit(1); });
