const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents
} = require("docx");

// ── Design tokens ──
const NAVY = "1B2A4A";
const DARK = "2C3E50";
const ACCENT = "2980B9";
const GRAY = "7F8C8D";
const WHITE = "FFFFFF";
const LIGHT_BG = "EBF5FB";
const HEADER_BG = "1B2A4A";
const ROW_ALT = "F8F9FA";

const border = { style: BorderStyle.SINGLE, size: 1, color: "BDC3C7" };
const cellBorders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0 };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// ── Helper functions ──
function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text })] });
}
function p(text, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, ...opts, children: [new TextRun({ text, size: 22, font: "Arial", ...opts.run })] });
}
function pMulti(runs, opts = {}) {
  return new Paragraph({ spacing: { after: 120 }, ...opts, children: runs.map(r => typeof r === "string" ? new TextRun({ text: r, size: 22, font: "Arial" }) : new TextRun({ size: 22, font: "Arial", ...r })) });
}
function bullet(text, ref = "bl") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22, font: "Arial" })] });
}
function bulletBold(label, desc, ref = "bl") {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [
    new TextRun({ text: label, bold: true, size: 22, font: "Arial" }),
    new TextRun({ text: " " + desc, size: 22, font: "Arial" })
  ]});
}
function numbered(text, ref) {
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text, size: 22, font: "Arial" })] });
}
function spacer() { return new Paragraph({ spacing: { after: 60 }, children: [] }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }

function headerCell(text, width) {
  return new TableCell({ borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, bold: true, size: 20, font: "Arial", color: WHITE })] })] });
}
function dataCell(text, width, alt = false) {
  return new TableCell({ borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: alt ? { fill: ROW_ALT, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, size: 20, font: "Arial" })] })] });
}
function dataCellBold(text, width, alt = false) {
  return new TableCell({ borders: cellBorders, width: { size: width, type: WidthType.DXA },
    shading: alt ? { fill: ROW_ALT, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ spacing: { before: 40, after: 40 },
      children: [new TextRun({ text, size: 20, font: "Arial", bold: true })] })] });
}

function makeTable(headers, rows, colWidths) {
  const headerRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => headerCell(h, colWidths[i])) });
  const dataRows = rows.map((row, ri) => new TableRow({
    children: row.map((cell, ci) => {
      if (ci === 0) return dataCellBold(cell, colWidths[ci], ri % 2 === 1);
      return dataCell(cell, colWidths[ci], ri % 2 === 1);
    })
  }));
  return new Table({ columnWidths: colWidths, margins: { top: 40, bottom: 40, left: 100, right: 100 }, rows: [headerRow, ...dataRows] });
}

// ── Numbering config ──
const numberingConfig = [];
const bulletRefs = ["bl","bl2","bl3","bl4","bl5","bl6","bl7","bl8","bl9","bl10","bl11","bl12","bl13","bl14","bl15","bl16","bl17","bl18","bl19","bl20"];
bulletRefs.forEach(ref => {
  numberingConfig.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
});
const numRefs = ["n1","n2","n3","n4","n5","n6","n7","n8","n9","n10","n11","n12","n13","n14","n15","n16","n17","n18","n19","n20"];
numRefs.forEach(ref => {
  numberingConfig.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] });
});

// ═══════════════════════════════════════════════════════════════
// BUILD SECTIONS
// ═══════════════════════════════════════════════════════════════

// ── COVER PAGE ──
const coverPage = [
  spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(), spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
    new TextRun({ text: "CIRIL", size: 72, bold: true, font: "Arial", color: NAVY })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
    new TextRun({ text: "Commercial Real Estate Institutional Alliance", size: 28, font: "Arial", color: GRAY, italics: true })
  ]}),
  spacer(), spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: "INTERNAL OPERATIONS TRACKING SYSTEM", size: 48, bold: true, font: "Arial", color: DARK })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [
    new TextRun({ text: "(IOTS)", size: 40, bold: true, font: "Arial", color: ACCENT })
  ]}),
  spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
    new TextRun({ text: "Enterprise System Encyclopedia & Operational Blueprint", size: 28, font: "Arial", color: GRAY })
  ]}),
  spacer(), spacer(), spacer(), spacer(), spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
    new TextRun({ text: "Document Classification: CONFIDENTIAL \u2013 INTERNAL USE ONLY", size: 20, font: "Arial", color: GRAY, italics: true })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
    new TextRun({ text: "Version 2.0 \u2013 Enterprise Release \u2013 September 2026", size: 20, font: "Arial", color: GRAY })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [
    new TextRun({ text: "Prepared for: Executive Leadership, Operational Management & System Administration", size: 20, font: "Arial", color: GRAY })
  ]}),
];

// ── TOC PAGE ──
const tocPage = [
  h1("Table of Contents"),
  new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
];

// ── CHAPTER 1: EXECUTIVE INTRODUCTION ──
const ch1 = [
  h1("1. Executive Introduction"),
  h2("1.1 What is the Internal Operations Tracking System?"),
  p("Think of a large, high-performing airport operations centre. Dozens of people must do precise jobs at the exact right moment: planes must be fuelled, baggage loaded, flight paths verified, passengers boarded, and runways cleared. If baggage handlers are delayed, the pilot cannot take off. If the air traffic controller does not know who is at which gate, chaos ensues. The Airport Director does not load bags or steer planes, but needs an executive radar screen showing every flight, any safety delays, and on-time performance across all terminals."),
  p("The CIRIL Internal Operations Tracking System (IOTS) is that exact flight operations control centre, built specifically for CIRIL\u2014India\u2019s premier commercial real estate alliance network."),
  p("CIRIL brings together certified commercial real estate advisory firms across major metropolitan zones (North, South, East, West, Central). Corporate clients\u2014major multinational IT companies, banks, and retail giants\u2014need commercial offices, warehouses, and land across different cities. When a client in Mumbai needs a 50,000 sq ft office in Bengaluru, the Mumbai team originates the requirement (Lead Giver), CIRIL Headquarters coordinates and routes it to the vetted Bengaluru team (Lead Receiver), the Bengaluru team inspects properties, prepares institutional proposals, and closes the lease. Upon closing, brokerage fees are collected and split (30% to Lead Giver, 70% to Lead Receiver), and CIRIL receives its 7.5% corporate royalty."),
  h2("1.2 Why Does CIRIL Need This System?"),
  p("To keep this nationwide commercial machinery operating smoothly, CIRIL requires an Internal Operations Tracking System that guarantees:"),
  bullet("Every employee knows exactly what task they need to do today, when it is due, and what materials they need.", "bl"),
  bullet("Every manager knows who is working, who is overloaded, who is on leave, and which tasks are falling behind before deadlines are missed.", "bl"),
  bullet("The Chairman and Executive Leadership have complete 360-degree radar visibility over daily operational health, team output, location integrity, financial milestones, and outstanding exceptions.", "bl"),
  bullet("Outstanding employee dedication is tracked objectively and rewarded transparently through monthly and quarterly excellence recognitions.", "bl"),

  h2("1.3 The Three Foundational System Layers"),
  p("The entire IOTS platform is structured into three foundational layers that work in complete harmony:"),
  spacer(),
  pMulti([{ text: "Layer 1 \u2013 Authentication, Geolocation & Security Layer: ", bold: true }, "No self-registration. Accounts are securely provisioned by authorised administrators. Everyone logs in through the same corporate portal. The system automatically inspects credentials, verifies the physical GPS location against authorised office boundaries, records an immutable audit log, and launches the user into their customised workspace. If an employee logs in from home or a client site, the system transparently tags the session as \u201cRemote / Off-Site\u201d without alarm."]),
  spacer(),
  pMulti([{ text: "Layer 2 \u2013 Management, Operations & Execution Layer: ", bold: true }, "Managers allocate work, balance workloads, review submissions, and resolve blockers. Execution staff focus on delivering tasks with high quality. Tasks follow a closed-loop lifecycle\u2014no task can simply expire. When overdue, the system triggers active manager intervention. Managerial rejection enters a structured revision cycle preserving all historical versions."]),
  spacer(),
  pMulti([{ text: "Layer 3 \u2013 Intelligence, Analytics & Reward Layer: ", bold: true }, "Dashboards eliminate vanity metrics. Every graph answers a vital operational question. Predictive risk alerts highlight early warning signals before a missed deadline or client escalation occurs. Automated reporting engines generate daily digests, weekly team scorecards, and monthly executive summaries. The Performance & Reward System automatically evaluates delivery quality and rewards monthly excellence and 3-consecutive-month high performers with prestigious quarterly awards."]),
];

// ── CHAPTER 2: ORGANIZATIONAL ROLES ──
const ch2 = [
  pageBreak(),
  h1("2. Organizational Roles & Responsibilities"),

  h2("2.1 The 11 Organisational Roles at a Glance"),
  p("The IOTS platform defines 11 distinct operational roles, ensuring complete clarity of ownership:"),
  spacer(),
  makeTable(
    ["#", "Role Title", "Primary Scope", "Access Band"],
    [
      ["1", "Chairman", "Enterprise oversight, commercial pulse, escalations, strategic interventions, award sign-offs", "Higher-Level (Executive Cockpit)"],
      ["2", "Super Admin", "Master configuration, RBAC policies, security compliance, platform audit logs, data authority", "Full System Authority"],
      ["3", "Admin", "User onboarding, office geofences, attendance audit, global task monitoring, announcements", "Higher-Level (Administrative)"],
      ["4", "IT System Analyst", "Service & API uptime, database health, authentication anomalies, incident resolution, change logs", "Full System Authority (Co-Equal with Super Admin)"],
      ["5", "General Manager", "Board coordination, finance & accounts, legal compliance, expansion oversight, cross-departmental ops", "Higher-Level (Executive Managerial)"],
      ["6", "Senior Manager", "Multi-team supervision, cross-team workload balancing, SLA delivery assurance, senior approvals", "Higher-Level (Multi-Team)"],
      ["7", "Lead Manager", "Direct team command, daily task assignment, live availability tracking, QA reviews, leave approvals", "Higher-Level (Team Command)"],
      ["8", "Executive", "Core operational task execution, progress logging, work notes, deliverable uploads, blocker ticketing", "Limited Access (Execution)"],
      ["9", "BDE", "Membership expansion outreach, cold calling, RERA/Google database mining, follow-up queue management", "Limited Access (BD)"],
      ["10", "Social Media Manager", "Content pipeline, content calendar scheduling, multi-platform publishing, report proofreading", "Limited Access (Content)"],
      ["11", "Graphic Designer", "Creative brief execution, version-controlled design drafts, conference collaterals, report formatting", "Limited Access (Creative)"],
    ],
    [400, 1600, 4000, 3360]
  ),

  h2("2.2 Detailed Role Breakdown"),

  h3("2.2.1 Chairman"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Captain on the bridge of a naval ship. The Captain does not grease engines or peel vegetables, but continuously watches the global radar and steps in when high-risk hazards appear."]),
  p("Scope: Entire Enterprise (National HQ, All Geographic Zones, All Functional Departments)."),
  p("Key Responsibilities:"),
  bullet("Receives complete bird\u2019s-eye operational intelligence across the entire alliance.", "bl2"),
  bullet("Monitors high-level commercial deal flow and royalty collections (7.5% royalty health).", "bl2"),
  bullet("Inspects company-wide attendance and location audit summaries, tracking remote/unknown location trends.", "bl2"),
  bullet("Reviews the Executive \u201cRequires Attention\u201d Cockpit: overdue task clusters, repeated task reassignments, and unresolved departmental blockers.", "bl2"),
  bullet("Reviews Quarterly Reward & Recognition Standings and personally signs off on the 3-consecutive-month excellence commendations.", "bl2"),
  bullet("Can publish enterprise-wide Chairman Announcements.", "bl2"),
  bullet("Cannot reset routine employee passwords or perform everyday task reassignment.", "bl2"),

  h3("2.2.2 Super Admin"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Chief Architect and Master Key Holder of a skyscraper. They configure master security doors, define who can enter which floor, and oversee system safety."]),
  p("System Parity Note: Super Admin and IT System Analyst have equal platform privileges. The Super Admin focuses on administrative governance; the IT Analyst focuses on technical infrastructure."),
  p("Key Responsibilities:"),
  bullet("Manages master organisational configurations, department definitions, and role definitions.", "bl3"),
  bullet("Configures Role-Based Access Control (RBAC) permission sets.", "bl3"),
  bullet("Holds authority to deactivate or alter high-level accounts.", "bl3"),
  bullet("Inspects full, immutable system audit logs.", "bl3"),
  bullet("Manages data export covenants and compliance frameworks.", "bl3"),

  h3("2.2.3 Admin"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Facility Operations Manager of a corporate campus. They issue employee ID cards, set office opening hours, maintain the company directory, and announce building updates."]),
  p("Key Responsibilities:"),
  bullet("Structured User Provisioning: Manually creates internal user profiles (Employee ID, Designation, Department, Office Location, System Role, Reporting Manager). There is no public registration.", "bl4"),
  bullet("Location & Geofence Perimeter Management: Configures approved office GPS coordinates and allowable radius boundaries.", "bl4"),
  bullet("Attendance Auditing: Reviews location exceptions, off-site attendance flags, and unexcused late arrivals.", "bl4"),
  bullet("Global Task Oversight: Monitors organisational work queues to identify abandoned tasks or perform archival cleanups.", "bl4"),
  bullet("Company Announcements: Drafts and publishes official communications to specific teams or the entire organisation.", "bl4"),

  h3("2.2.4 IT System Analyst"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Chief Flight Engineer monitoring engine temperatures, avionics, electrical bus lines, and fuel injection systems."]),
  p("Possesses equal system privileges with Super Admin. Tailored for real-time technical monitoring and diagnostic intervention."),
  p("Key Responsibilities:"),
  bullet("Application & Service Health: Monitors server uptime, database response latency, and frontend performance.", "bl5"),
  bullet("External API Integrations: Tracks status and rate-limits of external services (BigDataCloud geocoding, mail servers, storage).", "bl5"),
  bullet("Authentication & Security Auditing: Analyses anomalous login attempts, sudden location jumps, and session timeouts.", "bl5"),
  bullet("Technical Incident Response: Logs and resolves platform bugs, database deadlocks, or webhook delivery failures.", "bl5"),
  bullet("Deployment Tracking: Logs system version updates, environment variable changes, and schema migrations.", "bl5"),
  bullet("Cannot arbitrarily approve business decisions (e.g., cannot approve commercial fee splits or employee annual leave).", "bl5"),

  h3("2.2.5 General Manager (CIRIL Staff: Ipsheeta)"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Managing Director of Operations who translates the Chairman\u2019s strategy into smooth business coordination across legal, financial, and departmental divisions."]),
  p("Key Responsibilities (derived from Ipsheeta\u2019s KRA):"),
  bullet("Board Coordination & Governance: Coordinates with the Board of Directors, prepares board meeting agendas and minutes, tracks execution of board decisions.", "bl6"),
  bullet("Accounts & Finance Coordination: Collaborates with Accounts to track fee invoices, royalty remittance status (7.5%), and operational expenses.", "bl6"),
  bullet("Audit & Statutory Compliance: Coordinates with external auditors and legal teams for timely compliance filings, NDAs, and corporate documentation.", "bl6"),
  bullet("Conference & Event Management: Oversees planning and execution of the Annual Conference and Zonal Conferences.", "bl6"),
  bullet("Membership Expansion Oversight: Conducts high-level virtual presentations to prospective member firms.", "bl6"),
  bullet("Cross-Functional Escalation Resolution: Acts as the senior escalation clearinghouse for inter-department or inter-member disputes.", "bl6"),

  h3("2.2.6 Senior Manager"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Division Superintendent who oversees multiple project foremen, ensuring all teams move at the same speed."]),
  p("Key Responsibilities:"),
  bullet("Cross-Team Workload Balancing: Monitors workload distribution across operational, BD, and creative teams.", "bl7"),
  bullet("SLA & Deadline Risk Mitigation: Identifies tasks at risk of missing client or member deadlines across multiple verticals.", "bl7"),
  bullet("Manager Approval Queue: Evaluates high-impact decisions escalated by Lead Managers.", "bl7"),
  bullet("Performance Comparison: Analyses comparative productivity trends between teams.", "bl7"),

  h3("2.2.7 Lead Manager (CIRIL Staff: Manasa)"),
  pMulti([{ text: "Analogy: ", bold: true, italics: true }, "The Operations Crew Chief on the ground. They know every team member by name, assign daily work, inspect finished deliverables, and ensure nothing falls behind."]),
  p("Key Responsibilities (derived from Key Tasks List):"),
  bullet("Member Office Deal & Royalty Coordination: Tracks concluded commercial transactions across member firms, verifying accurate 7.5% royalty and 30/70 fee splits.", "bl8"),
  bullet("Vertical Calls Oversight: Manages and coordinates weekly vertical review calls (Retail, Logistics & Warehousing, Land, Hotel).", "bl8"),
  bullet("Listing & Portal Management: Coordinates property listing uploads to commercial portals, ensuring timely distribution of leads.", "bl8"),
  bullet("Market Report Data Collection: Coordinates with member brokerages to gather micro-market transaction data for quarterly research.", "bl8"),
  bullet("Quarterly Statistics & Ratings: Prepares and distributes quarterly member performance scorecards and lead exchange matrices.", "bl8"),
  bullet("Vendor Coordination: Manages printing vendors for market reports, stationery, event nameplates, and promotional materials.", "bl8"),
  bullet("Day-to-Day Team Command: Monitors live employee availability, assigns tasks, conducts QA reviews, approves leaves, and intervenes on overdue tasks.", "bl8"),

  h3("2.2.8 Executive"),
  p("Focused on executing specific operational work with zero distractions. Executes assigned tasks, records progress, logs time, uploads supporting evidence, raises blocker tickets, and incorporates manager feedback in revision cycles."),

  h3("2.2.9 Business Development Executive (CIRIL Staff: Bhavani)"),
  p("Key Responsibilities (derived from Key Tasks List):"),
  bullet("Daily cold calls and structured email outreach to prospective commercial brokerage firms.", "bl9"),
  bullet("Researches and compiles verified broker contacts from RERA portals, commercial directories, and Google.", "bl9"),
  bullet("Operates Upturnly lead generation portal and 99acres commercial portal.", "bl9"),
  bullet("Executes professional WhatsApp campaigns introducing CIRIL\u2019s network.", "bl9"),
  bullet("Maintains a rigorous follow-up queue, logging every call outcome and meeting schedule.", "bl9"),

  h3("2.2.10 Social Media Manager (CIRIL Staff: Harshitha)"),
  p("Note: Harshitha operates a multi-role profile\u2014she serves as the Social Media Manager for brand campaigns while simultaneously acting as an Executive handling Office Vertical client calls and proofreading quarterly market reports."),
  p("Key Responsibilities:"),
  bullet("End-to-End Social Media Management across LinkedIn, Instagram, YouTube, and corporate channels.", "bl10"),
  bullet("Market Report Proofreading: Validates quarterly research publications for accuracy and brand alignment.", "bl10"),
  bullet("Office Vertical Calls Support: Coordinates zone-wise Office Vertical calls and client updates.", "bl10"),
  bullet("Conference Presentation Collaterals: Collaborates with the Graphic Designer for keynote slides and digital archives.", "bl10"),
  bullet("Content Pipeline Tracking: Drives content items through Brief \u2192 Drafting \u2192 Internal Review \u2192 Changes Requested \u2192 Approved \u2192 Published.", "bl10"),

  h3("2.2.11 Graphic Designer"),
  p("Transforms raw data, presentations, and branding concepts into polished, institutional-grade visual assets. Delivers iterative design drafts with strict versioning (v1.0, v1.1, v2.0). Designs conference collaterals, ID badges, banners, and formats quarterly market research reports."),

  h2("2.3 Multi-Role Capability & Workspace Context Switching"),
  p("In lean organisations like CIRIL, professionals frequently hold dual responsibilities. The IOTS platform handles this elegantly:"),
  numbered("Unified Authentication: The user logs in once with their master corporate credentials.", "n1"),
  numbered("Account Profile Evaluation: The system detects all authorised system roles.", "n1"),
  numbered("Default Landing: The user lands on their primary role dashboard.", "n1"),
  numbered("Instant Context Switcher: A prominent dropdown in the global navigation bar allows the user to switch between authorised workspaces in a single click.", "n1"),
  numbered("Session & Audit Segregation: Every audit log entry captures both the employee\u2019s identity and the active role context under which the action was performed.", "n1"),
];

// ── CHAPTER 3: TASK LIFECYCLE ──
const ch3 = [
  pageBreak(),
  h1("3. Task Lifecycle, Execution & Audit Architecture"),

  h2("3.1 The 5 Core Reporting States"),
  p("Tasks move through five macro-level reporting states visible to executive leadership and analytics engines:"),
  makeTable(
    ["State", "Type", "Definition"],
    [
      ["ASSIGNED", "Active / Queued", "Formally created by a Manager with deliverables, priority tier, and deadline; assigned to an employee."],
      ["PENDING", "Active / In-Flight", "Employee has acknowledged the assignment and work is underway within standard operational limits."],
      ["OVERDUE", "Exception", "Target deadline has elapsed without approved completion. Requires immediate managerial intervention."],
      ["REASSIGNED", "Active Transition", "Task transferred from one team member to another. NOT a terminal state\u2014resumes active execution immediately under new owner."],
      ["COMPLETED", "Terminal", "Deliverables thoroughly reviewed and officially approved by the designated Manager. Historical records sealed."],
    ],
    [1800, 1600, 5960]
  ),

  h2("3.2 The 7 Operational Micro-States"),
  p("During active execution, tasks pass through granular operational micro-states:"),
  makeTable(
    ["Micro-State", "Indicator", "Meaning"],
    [
      ["In Progress", "Blue Solid", "Employee is actively working, logging time, or drafting deliverables."],
      ["Blocked", "Red Striped", "Employee has encountered a roadblock and raised an Issue Ticket. Work is paused."],
      ["Waiting for Review", "Amber Pulse", "Employee has uploaded deliverables and formally clicked \u201cSubmit for Review\u201d."],
      ["Under Review / QA", "Purple Solid", "Manager has opened the submission and is reviewing deliverables against quality criteria."],
      ["Changes Requested", "Orange Solid", "Manager returned the submission with itemised revision notes."],
      ["Issue Resolved", "Teal Solid", "The reported blocker has been cleared, enabling work to resume."],
      ["Done / Closed", "Emerald Solid", "Manager confirmed all acceptance criteria met; task closed and archived."],
    ],
    [2200, 1400, 5760]
  ),

  h2("3.3 Employee Work Execution & Activity Logging"),
  p("A critical design principle: States represent where the task sits in the governance pipeline. Work Activities are chronological records created during that state. An employee can log ten activities during a single \u201cIn Progress\u201d state."),
  p("The four structured work activities:"),
  numbered("Progress Percentage Updates: Slider or numeric input (0% to 100%) with a mandatory brief summary of work accomplished.", "n2"),
  numbered("Work Notes & Context Memos: Freeform text capturing conversations, client remarks, phone call outcomes, or research findings.", "n2"),
  numbered("Time-Spent / Effort Logging: Hours and minutes recorded against the task, enabling delivery velocity calculations.", "n2"),
  numbered("Supporting Deliverables & Evidence: Direct file attachments (spreadsheets, PDFs, presentations, images) with automatic version indexing.", "n2"),

  h2("3.4 Overdue Handling: Active Managerial Intervention"),
  p("In IOTS, Overdue is an actionable operational alarm, not a passive badge. When the clock crosses the deadline:"),
  numbered("The task status transitions automatically to OVERDUE.", "n3"),
  numbered("A priority alert is dispatched to the Lead Manager\u2019s Manager Action Centre.", "n3"),
  numbered("The system presents mandatory Overdue Intervention options:", "n3"),
  spacer(),
  bullet("Option 1: Grant a deadline extension with a mandatory business justification (e.g., \u201cAwaiting registered lease copy from Mumbai sub-registrar\u201d).", "bl11"),
  bullet("Option 2: Reassign to an available team member after inspecting workload capacity.", "bl11"),
  bullet("Option 3: Escalate to Senior Manager for cross-departmental resource deployment.", "bl11"),
  bullet("Option 4: Scope reduction / direct guidance to the employee.", "bl11"),
  p("A Manager cannot simply click \u201c+1 Day\u201d without entering a formal justification. This justification is permanently recorded in the audit trail."),

  h2("3.5 The Reassignment Protocol"),
  p("Reassignment is a controlled workflow, not a casual drag-and-drop:"),
  numbered("Manager selects a task and clicks \u201cReassign Task\u201d.", "n4"),
  numbered("The system displays the Team Bandwidth Radar, showing current task loads of all team members.", "n4"),
  numbered("Manager selects a standardised reassignment reason: Employee Capacity/Overload, Medical/Approved Leave, Skillset Required, or Client Vertical Shift.", "n4"),
  numbered("Manager writes a mandatory handover note detailing what was completed and what remains.", "n4"),
  numbered("Indelible audit log entry records the transfer. The previous employee is relieved of deadline liability, and the new employee receives an urgent handover alert.", "n4"),

  h2("3.6 The Quality Review & Correction Cycle"),
  p("Managerial review is never a blunt \u201cApprove\u201d or \u201cReject\u201d. Rejection initiates a collaborative correction cycle:"),
  numbered("Employee submits deliverables (files + notes). Task moves to \u201cWaiting for Review\u201d.", "n5"),
  numbered("Manager reviews against quality criteria.", "n5"),
  numbered("If approved: Task marked \u201cCompleted\u201d. Performance points awarded.", "n5"),
  numbered("If changes required: Manager returns the submission with itemised deficiency notes. Task re-enters \u201cIn Progress (Revision 2)\u201d.", "n5"),
  numbered("Employee implements corrections and resubmits with a revision changelog.", "n5"),
  numbered("Manager conducts final QA approval. Task formally closed.", "n5"),

  h2("3.7 The Immutable Audit History Component"),
  p("Every critical object in IOTS (Tasks, User Accounts, Geofences, Leave Requests, Royalty Settlements) contains an embedded Audit History Ledger."),
  p("Immutable Ledger Rules:"),
  bullet("Append-Only: Audit records can never be updated, overwritten, or deleted by any user, including Super Admins.", "bl12"),
  bullet("Deterministic Attribution: Every entry records Actor ID, Actor Name, Active Role, Timestamp (ISO-8601 to the millisecond), Origin IP, and Geolocation Context.", "bl12"),
  bullet("Before & After Delta: Records precisely what changed (e.g., Priority: Normal \u2192 Critical).", "bl12"),
  bullet("Source Distinction: Differentiates between User-Initiated Actions and System-Automated Actions.", "bl12"),
  p("Each audit entry displays: Actor, Role, Timestamp, Action, Object/Resource, Previous Value, New Value, Reason/Comment, and Source (User Action / System Action). The component is strictly read-only and supports filtering by date, actor, action type, and resource."),
];

// ── CHAPTER 4: ATTENDANCE & GEOLOCATION ──
const ch4 = [
  pageBreak(),
  h1("4. Attendance, Geolocation Engine & Security Auditing"),

  h2("4.1 Real-Time Availability States"),
  p("At any point during the workday, an employee\u2019s live availability status is visible across the system:"),
  makeTable(
    ["Status", "Indicator", "Definition & Impact"],
    [
      ["Available", "Green Solid", "Logged in, at desk or approved workstation, ready to accept new assignments."],
      ["Busy", "Red Solid", "Actively executing a high-priority task. Avoid urgent interruptions."],
      ["In Meeting", "Blue Solid", "Participating in a team standup, zone-wise vertical call, or client briefing."],
      ["On Break", "Amber Solid", "Stepped away for lunch, tea, or personal rest. Work-timer paused."],
      ["In Training", "Indigo Solid", "Undergoing onboarding, compliance modules, or software training."],
      ["Do Not Disturb", "Purple Solid", "Deep focus mode (e.g., Designer formatting an annual report, BDE on focused cold-calling)."],
      ["Working Remotely", "Cyan Solid", "Logged in from home or approved off-site location with verified geolocation context."],
      ["On Leave", "Gray Solid", "Formally approved leave. Excluded from daily active task allocations."],
      ["Absent", "Crimson Solid", "Unexcused failure to log in within grace period. Triggers HR attendance flag."],
      ["Offline", "Slate Solid", "Logged off at end of shift."],
    ],
    [2000, 1400, 5960]
  ),

  h2("4.2 The Geolocation Engine & Office Perimeter Geofencing"),
  p("When an employee enters their credentials on the unified login screen, the system executes a three-step security handshake:"),
  numbered("Credential Validation: Verifies Employee ID and Password against the internal directory.", "n6"),
  numbered("Hardware GPS Query: Requests the browser\u2019s Hardware GPS API for latitude and longitude coordinates.", "n6"),
  numbered("Reverse Geocoding & Perimeter Check: Resolves the coordinates to a human-readable address (via BigDataCloud API), then compares the distance against the assigned office\u2019s approved geofence perimeter using the Haversine formula.", "n6"),
  spacer(),
  p("If the employee is within the approved office radius (e.g., 100 metres), the session is tagged \u201cOffice / On-Premise\u201d with a green badge. If outside the office perimeter, the session is tagged \u201cRemote / Off-Site\u201d with a calm amber pill and an optional reason memo\u2014the system does NOT block them or treat them as a criminal."),

  h2("4.3 Handling Remote & Unknown Locations: Dignity Over Fear"),
  p("The IOTS philosophy:"),
  bullet("No frightening error screens. If an employee is outside the office perimeter, they are not blocked.", "bl13"),
  bullet("Contextual Tagging: A calm message states \u201cWe notice you are signing in from outside your designated office perimeter. Your session has been marked as Remote / Off-Site.\u201d", "bl13"),
  bullet("Optional Reason Memo: The employee can enter a quick note (e.g., \u201cWorking from home with prior approval\u201d).", "bl13"),
  bullet("Manager Notification: The Lead Manager sees a subtle orange pin next to the employee\u2019s name on their live team radar.", "bl13"),

  h2("4.4 Attendance & Work Hours Computation"),
  p("IOTS eliminates paper registers and manual time tracking:"),
  bullet("Check-In Timestamp: Captured automatically upon first successful login of the day.", "bl14"),
  bullet("Check-Out Timestamp: Captured when the user clicks \u201cCheck-Out & Logoff\u201d.", "bl14"),
  bullet("Net Work Hours: Active productive time = (Check-Out \u2013 Check-In) \u2013 Total Break Durations.", "bl14"),
  bullet("Standard Shift: 9:30 AM to 6:30 PM (9.0 Gross Hours / 8.0 Net Productive Hours).", "bl14"),
  bullet("Grace Period: 15 minutes. Arrivals up to 9:45 AM marked on-time.", "bl14"),
  bullet("Late Arrivals: Logins after 9:45 AM flagged. Three unexcused late arrivals per month trigger automated HR and Lead Manager notification.", "bl14"),

  h2("4.5 Employee Self-Service Request Portal"),
  p("Employees manage their work-life schedules through five request categories:"),
  numbered("Leave Requests: Casual Leave (CL), Sick Leave (SL), Earned/Privilege Leave (PL), and Compensatory Off.", "n7"),
  numbered("Short Permission Requests: 1 to 2 hours for doctor appointments, personal emergencies, or government office visits.", "n7"),
  numbered("Scheduled Remote Work Requests: Prior approval to work from home for specific days.", "n7"),
  numbered("Task Clarification / Guidance Requests: Urgent 15-minute sync with the Lead Manager.", "n7"),
  numbered("Operational Resource Requests: Hardware, software licences, commercial portal credits, or conference stationery.", "n7"),

  h2("4.6 Security Auditing & Chairman Anomaly Cockpit"),
  p("The Chairman, Super Admin, and IT System Analyst access the Master Security & Location Audit Centre. Automated anomaly detection covers:"),
  bullet("Impossible Travel Velocity: Login in Hyderabad, then same account logs in from Dubai 45 minutes later. System suspends the second session and dispatches urgent alerts.", "bl15"),
  bullet("Ghost Logins & Session Hijacking: Active sessions are bound to cryptographically signed browser tokens. Copied cookies on a different browser are immediately invalidated.", "bl15"),
  bullet("Unapproved Remote Clusters: More than 5 consecutive off-site days without approved leave triggers an administrative flag.", "bl15"),
  bullet("Concurrent Multi-Device Logins: Simultaneous sessions from different IP subnets raise a security investigation event.", "bl15"),
  p("Every login event is preserved with its reverse-geocoded address, GPS coordinates, public IP address, ISP provider, and browser user-agent."),
];

// ── CHAPTER 5: CIRIL COMMERCIAL OPERATIONS ──
const ch5 = [
  pageBreak(),
  h1("5. CIRIL Commercial Operations & Revenue Architecture"),

  h2("5.1 The CIRIL Syndication Model"),
  p("CIRIL operates as an apex clearinghouse and national alliance of certified commercial real estate advisory firms (Member Companies). The platform provides national umbrella coverage, standardised institutional proposal templates, trusted dispute resolution, proprietary market intelligence, and automated fee distribution."),

  h2("5.2 The 4-Tier Geographic Hierarchy"),
  p("Country \u2192 Zones (North, South, East, West, Central) \u2192 States (Regulatory Jurisdictions) \u2192 Cities (Metropolitan Commercial Centres) \u2192 Member Companies \u2192 Advisory Associates."),

  h2("5.3 The 6-Phase End-to-End Transaction Lifecycle"),
  numbered("Mandate Origination (Lead Giver Stage): A Member Company in City A secures a mandate from an enterprise client. The broker logs the mandate with comprehensive parameters\u2014space category, vertical type, required area, target budget, and technical specifications.", "n8"),
  numbered("Central Clearance & Destination Handoff: CIRIL HQ verifies the mandate and routes it to an accredited Member Company in the destination city (Lead Receiver). The recipient must formally Accept or Reject within 24 hours.", "n8"),
  numbered("Sourcing & Institutional Proposals: The Lead Receiver sources inventory and generates standardised presentations\u2014a First-Cut Proposal (comparison matrix) and a Detailed Institutional Proposal (exhaustive building report).", "n8"),
  numbered("Site Inspections & 7-Stage Negotiation: The deal advances through Basic Prospecting \u2192 Site Inspection \u2192 Shortlisting \u2192 Commercial Offer \u2192 Term Sheet \u2192 Legal Drafting \u2192 Agreement Execution.", "n8"),
  numbered("Deal Conclusion & Financial Lock: Upon execution of the registered lease deed or sale deed, confirmed transaction metrics are locked.", "n8"),
  numbered("Fee Apportionment & Royalty Settlement: The system calculates gross brokerage, applies the member split, extracts CIRIL\u2019s 7.5% corporate royalty, and dispatches official conclusion statements.", "n8"),

  h2("5.4 Fee Structure & 7.5% Royalty Engine"),
  p("Base Brokerage Calculation:"),
  bullet("Commercial Lease: Gross Brokerage = 1 Month (30 Days) Rental Value.", "bl16"),
  bullet("Outright Sale / Acquisition: Gross Brokerage = 1.00% of Total Transaction Consideration.", "bl16"),
  spacer(),
  p("Inter-Member Split:"),
  bullet("Lead Giver (LG) Share: 30% of Gross Brokerage (for origination and client relationship management).", "bl17"),
  bullet("Lead Receiver (LR) Share: 70% of Gross Brokerage (for local sourcing, inspections, negotiations, and closing).", "bl17"),
  spacer(),
  p("CIRIL Corporate Royalty = 7.5% of Total Gross Brokerage, deducted proportionally from both LG (7.5% of LG share) and LR (7.5% of LR share)."),
  spacer(),

  h3("5.4.1 Financial Simulation: Grade-A Office Lease"),
  makeTable(
    ["Financial Metric", "Value"],
    [
      ["Deal Parameters", "50,000 sq ft @ \u20b980 / sq ft / month"],
      ["Gross Transaction Value", "\u20b940,00,000 / month rent"],
      ["Total Gross Brokerage Pool", "\u20b940,00,000 (1 Month Rental)"],
      ["Lead Giver Share (30%)", "\u20b912,00,000"],
      ["Lead Receiver Share (70%)", "\u20b928,00,000"],
      ["Royalty by LG (7.5%)", "\u20b990,000"],
      ["Royalty by LR (7.5%)", "\u20b92,10,000"],
      ["Net CIRIL Corporate Royalty", "\u20b93,00,000"],
      ["Net Retained by LG", "\u20b911,10,000"],
      ["Net Retained by LR", "\u20b925,90,000"],
    ],
    [5000, 4360]
  ),

  h2("5.5 Proprietary Market Intelligence Engine"),
  bullet("Rental Trends Benchmark: Tracks micro-market rental movements, vacancy absorptions, and effective lease rates.", "bl18"),
  bullet("Landmark Deals Archive: Catalogs major multi-thousand sq ft leases across BFSI, IT/ITeS, and manufacturing sectors.", "bl18"),
  bullet("Upcoming Supply Pipeline: Verified registry of under-construction commercial towers and industrial parks.", "bl18"),
  bullet("Landlord & Tenant Data Mining: Tracks upcoming enterprise lease expirations for early client renewal and mandate origination.", "bl18"),
];

// ── CHAPTER 6: INTELLIGENCE & ANALYTICS ──
const ch6 = [
  pageBreak(),
  h1("6. Intelligence, Analytics & Automated Reporting"),

  h2("6.1 The 3 Reporting Rhythms"),
  makeTable(
    ["Rhythm", "Cadence", "Focus", "Audience"],
    [
      ["Daily", "Generated 18:30 IST", "Tasks completed today, overdue items, unresolved blockers, tomorrow\u2019s priorities", "Employees & Lead Managers"],
      ["Weekly", "Monday 09:00 IST", "SLA on-time delivery rate, workload rebalancing, team capacity trends", "Senior Managers & General Manager"],
      ["Monthly", "1st of Month", "Departmental target fulfilment, royalty settlements, reward system standings", "Chairman & Board of Directors"],
    ],
    [1200, 1800, 3600, 2760]
  ),

  h2("6.2 The 6 Analytics Centres"),

  h3("Centre 1: Performance & Velocity Analytics"),
  p("Answers: How fast, how well, and how consistently are teams delivering work?"),
  bullet("Task Completion Rate: Completed Tasks / Total Assigned Tasks \u00d7 100.", "bl19"),
  bullet("On-Time SLA Delivery Rate: Tasks Completed On or Before Deadline / Total Completed Tasks \u00d7 100.", "bl19"),
  bullet("Average Turnaround Duration: Mean time from Assigned to Completed across task categories.", "bl19"),
  bullet("Rework & Revision Index: Frequency of tasks returned with Changes Requested.", "bl19"),

  h3("Centre 2: Task & Workload Distribution Analytics"),
  p("Answers: Is work distributed fairly, or are specific individuals becoming bottlenecks?"),
  bullet("Team Workload Capacity Radar: Active task commitments vs. standard 8-hour daily capacity.", "bl20"),
  bullet("Concentration Analysis: Identifies if 80% of critical tasks are loaded onto 20% of staff.", "bl20"),
  bullet("Task Pipeline Distribution: Real-time breakdown of tasks in each state.", "bl20"),

  h3("Centre 3: Attendance & Workforce Health Analytics"),
  p("Punctuality Index, attendance consistency, workplace ratio (On-Premise vs. Remote), and availability patterns."),

  h3("Centre 4: Trend & Historical Pattern Analysis"),
  p("Time-horizon comparative analysis with toggles: Today vs. Yesterday, This Week vs. Last Week, Last 30 Days vs. Prior 30 Days, and Quarter-to-Date vs. Prior Quarter."),

  h3("Centre 5: Exception & Risk Analysis (3-Tier Engine)"),
  makeTable(
    ["Risk Tier", "Criteria", "System Response"],
    [
      ["Tier 1: Low", "Task due in <4h with <30% progress; first-time punctuality flag; single revision requested", "Informational alert in daily digest"],
      ["Tier 2: Medium", "Task overdue by 4\u201324 hours; task reassigned 2+ times; employee capacity exceeds 110%; blocker open >8 hours", "Amber flash in Lead Manager Action Centre; demands active resolution"],
      ["Tier 3: High / Critical", "Task overdue >48 hours; unresolved blocker halting commercial deal; repeated unexcused absences; impossible travel anomaly", "Escalates to Senior Manager and Chairman; requires logged intervention"],
    ],
    [1600, 4200, 3560]
  ),

  h3("Centre 6: Predictive Operational Signals"),
  p("Deterministic operational warnings based on mathematical thresholds (not fabricated certainty):"),
  bullet("SLA Breach Warning: If 2 hours remain but average completion duration for the task type is 4 hours and progress is only 15%.", "bl2"),
  bullet("Burnout Early-Warning: If an employee logs >10 net work hours for 4 consecutive days while maintaining >100% capacity.", "bl2"),
  bullet("Vendor Bottleneck Warning: Historical vendor delivery delays automatically prompting milestone schedule adjustments.", "bl2"),

  h2("6.3 Role-Scoped Automated Report Delivery"),
  bullet("To the Chairman: 2-page Executive Radar\u2014enterprise operational health, royalty totals, critical escalations, and 3-month award candidates.", "bl3"),
  bullet("To General Manager & Senior Managers: Cross-departmental workload matrices, SLA trends, overdue resolution audits.", "bl3"),
  bullet("To Lead Managers: Actionable daily checklists\u2014tasks needing QA review, pending leave approvals, overdue interventions.", "bl3"),
  bullet("To Execution Staff: Personal monthly scorecards\u2014completed tasks, on-time delivery %, time tracked, and reward milestone progress.", "bl3"),
];

// ── CHAPTER 7: REWARD SYSTEM ──
const ch7 = [
  pageBreak(),
  h1("7. Employee Performance, Reward & Recognition System"),

  h2("7.1 The Philosophy of Objective Recognition"),
  p("In conventional organisations, bonuses and awards are decided through subjective impressions, recency bias, or office politics. This damages morale. The CIRIL IOTS Reward System establishes complete objectivity and transparency. Because every task, delivery timestamp, review cycle, and attendance record is captured accurately, recognition is calculated through transparent mathematical scoring. Every employee can see their live performance score and reward trajectory daily."),

  h2("7.2 The 100-Point Performance Scoring Formula"),
  p("At the end of each calendar month, the IOTS Intelligence Engine computes an Overall Monthly Performance Score on a 100-point scale:"),
  spacer(),
  makeTable(
    ["Component", "Max Points", "Measurement"],
    [
      ["Task Delivery & Velocity", "35", "35 \u00d7 (Completed Tasks / Total Assigned Tasks)"],
      ["On-Time SLA Achievement", "30", "30 \u00d7 (Tasks Completed On or Before Deadline / Total Completed Tasks)"],
      ["First-Time Quality & Revision Index", "15", "15 \u00d7 (1 \u2013 Tasks Returned for Revision / Total Submissions)"],
      ["Punctuality & Location Integrity", "10", "10 points for 100% on-time arrivals, zero unexcused anomalies. \u22122 per unexcused late arrival beyond grace."],
      ["Initiative & Blocker Resolution", "10", "Evaluated by Lead Manager during monthly reviews for proactive problem-solving."],
    ],
    [2800, 1200, 5360]
  ),

  h2("7.3 Performance Tiers & Monthly Rewards"),
  makeTable(
    ["Tier", "Score Range", "Reward & Recognition"],
    [
      ["Gold Tier", "90 \u2013 100", "\u201cStar Performer of the Month\u201d digital badge, cash spot bonus / voucher, spotlight on announcement board, counts as 1 month toward 3-month award."],
      ["Silver Tier", "80 \u2013 89", "\u201cHigh Achiever\u201d commendation in team standup, full quarterly bonus eligibility."],
      ["Bronze Tier", "70 \u2013 79", "Meets baseline corporate expectations."],
      ["Needs Focus", "< 70", "Triggers constructive 1-on-1 coaching with Lead Manager; automated review of workload or training gaps."],
    ],
    [1600, 1400, 6360]
  ),

  h2("7.4 The 3-Consecutive-Month Chairman\u2019s Quarterly Excellence Award"),
  p("The Rule of Unwavering Consistency: Any employee can have a lucky month. True institutional excellence is demonstrated through sustained consistency."),
  numbered("Continuous Qualification: An employee must achieve Gold Tier (score \u2265 90) in three consecutive calendar months (e.g., October, November, December).", "n9"),
  numbered("The Reset Covenant: If an employee achieves Gold in Month 1 and Month 2, but dips to Silver (85) in Month 3, the consecutive streak counter resets to zero.", "n9"),
  numbered("Chairman Cockpit Shortlist: Upon completing the third consecutive Gold month, the system automatically generates a Chairman Quarterly Honours Dossier presenting the 90-day activity summary.", "n9"),
  numbered("Executive Commendation: The Chairman reviews the dossier and signs off on the award.", "n9"),
  spacer(),
  p("Quarterly Honours Package:"),
  bullet("Substantial Cash Incentive dispatched alongside the quarterly payroll.", "bl4"),
  bullet("Formal Chairman\u2019s Trophy & Framed Commendation, presented publicly during CIRIL\u2019s Annual or Zonal Conference.", "bl4"),
  bullet("Permanent Gold Star Profile Medallion displayed alongside the employee\u2019s name across all system modules.", "bl4"),
  bullet("Fast-Track Career Progression: Serves as the primary prerequisite for promotions.", "bl4"),

  h2("7.5 Role-Specific KPI Customisation"),
  p("To ensure fairness across diverse functional departments, the scoring engine tailors metrics by role:"),
  bullet("BDE (Bhavani): Outreach volume (calls, emails, WhatsApp sequences), prospect pipeline conversions, follow-up adherence.", "bl5"),
  bullet("Social Media Manager (Harshitha): Content calendar adherence, market report proofreading timeliness, campaign delivery.", "bl5"),
  bullet("Graphic Designer: Creative turnaround speed, version iteration efficiency (\u22642 revision cycles), conference collateral print readiness.", "bl5"),
  bullet("Lead Manager (Manasa): Team SLA adherence, royalty calculation accuracy, workload balance health.", "bl5"),

  h2("7.6 Anti-Burnout Safeguards"),
  bullet("No Midnight Heroics Required: Points are capped at standard shift durations. Working 14-hour days does not grant extra points.", "bl6"),
  bullet("Transparent Dispute Resolution: If an employee feels their score was unfairly affected by external blockers, they can submit a 1-click Score Review Request to the Senior Manager.", "bl6"),
  bullet("Open Self-Inspection: Employees can click on any score component to view the exact math and underlying records.", "bl6"),
];

// ── CHAPTER 8: RBAC MATRIX ──
const ch8 = [
  pageBreak(),
  h1("8. Comprehensive Role-Based Access Control (RBAC) Matrix"),
  p("The table below defines exact operational boundaries across all 11 roles. \u201c\u2713\u201d indicates full access, \u201cView\u201d indicates read-only, \u201cTeam\u201d indicates access limited to own team, and \u201c\u2013\u201d indicates no access."),
  spacer(),
  makeTable(
    ["Capability", "Chairman", "Super Admin", "Admin", "IT Analyst", "Gen. Mgr", "Sr. Mgr", "Lead Mgr", "Exec", "BDE", "SM Mgr", "Designer"],
    [
      ["Executive Operational Radar", "\u2713", "\u2713", "\u2013", "\u2713", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["System Settings & RBAC", "\u2013", "\u2713", "\u2013", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Create/Provision Users", "\u2013", "\u2713", "\u2713", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Set Office Geofences", "\u2013", "\u2713", "\u2713", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Service & API Diagnostics", "\u2013", "\u2713", "\u2013", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Board Governance & Legal", "View", "\u2013", "\u2013", "\u2013", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Cross-Team Workload Balance", "\u2013", "\u2013", "\u2013", "\u2013", "View", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Assign & Reassign Tasks", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "Team", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Approve Submissions / QA", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "\u2713", "Team", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Approve Leave / Permissions", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "\u2713", "Team", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Execute Tasks & Log Progress", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "\u2713", "\u2713", "\u2713"],
      ["Multi-Version Design Files", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713"],
      ["Content Calendar Management", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "\u2013"],
      ["Cold Calling / Prospect Follow-ups", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2713", "\u2013", "\u2013"],
      ["Location Anomaly Audit Logs", "\u2713", "\u2713", "\u2713", "\u2713", "Dept", "Teams", "Team", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Publish Announcements", "\u2713", "\u2713", "\u2713", "\u2013", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
      ["Approve Quarterly Awards", "\u2713", "\u2013", "\u2013", "\u2013", "\u2713", "\u2713", "\u2013", "\u2013", "\u2013", "\u2013", "\u2013"],
    ],
    [2200, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640, 640]
  ),
];

// ── CHAPTER 9: DASHBOARD BLUEPRINTS ──
const ch9 = [
  pageBreak(),
  h1("9. Enterprise Dashboard Blueprints"),
  p("Every authenticated screen shares an identical application shell: organisation/system identity, current user and role, branch/location, availability indicator, global notifications, global search, breadcrumbs, left navigation sidebar, and a responsive 12-column content grid."),

  h2("9.1 Chairman Dashboard (Apex Executive Cockpit)"),
  p("Navigation: Overview, Operational Performance, Global Work, Escalations, People Overview, Analytics & Insights, Reports, Announcements, Audit Summary, Profile & Security."),
  p("Top-row enterprise health radar cards: Enterprise Operational Health %, Active Mandates & Deals, Critical Escalations, Workforce Availability."),
  p("Requires Attention Panel: Overdue tasks >48 hours, repeated reassignments, blocked deal closures."),
  p("Organisational Pulse: 30-day task completion velocity, on-time SLA trend, quarterly alliance growth."),
  p("Global Work Monitor: Task, Owner, Team, Priority, Due Date, Status, Risk/Attention, Last Activity."),
  p("Executive interventions require secondary confirmation to ensure strategic weight."),

  h2("9.2 Super Admin Dashboard (Platform Governance)"),
  p("Navigation: Platform Settings, RBAC & Permissions, Master Verticals, Data Compliance, Full Audit Ledger."),
  p("Master Metrics: Active System Accounts, Geofence Perimeters, Data Storage Utilisation, Global System Status."),
  p("RBAC Policy Editor: Visual permission matrix toggling capabilities across user designations."),

  h2("9.3 Admin Dashboard (Routine Administration)"),
  p("Navigation: User Directory, Location & Geofencing, Global Task Oversight, Announcements, Attendance Audit."),
  p("User Provisioning: Structured multi-step creation\u2014Identity, Role, Department, Reporting Manager."),
  p("Geofence Manager: Map view configuring office latitude, longitude, and radius buffers."),
  p("Announcement Studio: Rich-text editor with audience selectors (All Staff, Specific Roles, Specific Zones)."),

  h2("9.4 IT System Analyst Dashboard (Technical Reliability)"),
  p("Navigation: System Health, API & Microservices, Security Diagnostics, Technical Incidents, Change Logs."),
  p("Service Uptime Monitors: Real-time ping latency and status cards for Reverse Geocoding API, Auth Gateway, PostgreSQL Cluster, and Cloud File Buckets."),
  p("Authentication Anomalies Radar and One-Click Session Killer with mandatory incident logging."),

  h2("9.5 General Manager Dashboard (Ipsheeta \u2013 Operations & Governance)"),
  p("Navigation: Business Overview, Board Coordination, Accounts & Royalties, Legal Compliance, Expansion Pipeline."),
  p("Governance Centre: Board meeting agenda builder, minute tracker, action item registry."),
  p("Royalty Reconciliation Ledger: Open fee invoices, 7.5% royalty clearances, overdue payments from member brokerages."),
  p("Legal Compliance Vault: Executed membership agreements, NDAs, and statutory filing deadlines."),

  h2("9.6 Senior Manager Dashboard (Multi-Team Operations)"),
  p("Navigation: Multi-Team Overview, Cross-Team Workload, SLA Delivery, Escalation Centre, Senior Approvals."),
  p("Cross-Team Balance Radar: Side-by-side capacity metres for Operations, BD, and Creative teams."),
  p("Escalation Clearinghouse and Senior Approval Queue for major deadline adjustments (>3 days)."),

  h2("9.7 Lead Manager Dashboard (Manasa \u2013 Team Command)"),
  p("Navigation: Team Command, Task Manager, Live Status, Workload, Approvals/QA, Leave Requests, Blocker Centre."),
  p("Live Team Radar: Every team member with real-time availability, active task title, and hours logged today."),
  p("Task Assignment Engine: Modal to create tasks with priority, deliverables, SLA deadline, and automated bandwidth warning."),
  p("Overdue Intervention Centre: Action cards providing 1-click Extend (with reason), Reassign (with context), or Escalate."),
  p("QA Review Workbench: Split view with employee files on left and manager review controls on right."),

  h2("9.8 Executive Dashboard (Core Work Execution)"),
  p("Navigation: My Workspace, Active Tasks, Work Activity, Blockers, Requests, Attendance, My Performance."),
  p("Today\u2019s Focus Banner highlighting the single highest-priority task with a prominent \u201cContinue Work\u201d button."),
  p("Work Activity Logger: Quick modal to increment progress, record notes, log time, and attach files."),
  p("Report Blocker Button: 1-click form to pause work and alert the Lead Manager."),

  h2("9.9 BDE Dashboard (Bhavani \u2013 Expansion)"),
  p("Navigation: BD Command, Outreach Quota, Prospect Database, Portals (Upturnly / 99acres), Follow-up Queue."),
  p("Daily Quota Progress Bar: Calls completed (e.g., 34/50), emails dispatched, WhatsApp intros sent."),
  p("Prospect Database Table: Contacts filtered by city, source (RERA, Google), and qualification status."),
  p("Follow-up Calendar: Chronological callbacks scheduled for today with 1-click call logging."),

  h2("9.10 Social Media Manager Dashboard (Harshitha \u2013 Campaigns)"),
  p("Navigation: Content Pipeline, Content Calendar, Campaign Hub, Report Proofreading, Creative Requests."),
  p("Visual Content Kanban: 6-column pipeline tracking: Brief \u2192 Drafting \u2192 Internal Review \u2192 Changes Requested \u2192 Approved \u2192 Published."),
  p("Content Calendar View: Monthly grid displaying scheduled releases across LinkedIn, Instagram, and YouTube."),

  h2("9.11 Graphic Designer Dashboard (Creative Workbench)"),
  p("Navigation: Creative Queue, Active Briefs, Version Asset Vault, Revision Centre, Conference Collaterals."),
  p("Version Asset Manager: File vault displaying iterative versions (v1.0, v1.1, v2.0) with visual thumbnails, author notes, and download links."),
  p("Revision Workspace: Side-by-side view highlighting requested changes from the Social Media Manager or Lead Manager."),
];

// ── CHAPTER 10: CORE SYSTEM GUARANTEES ──
const ch10 = [
  pageBreak(),
  h1("10. Core System Principles & Operational Guarantees"),

  numbered("Complex Underneath, Simple on Top: The underlying data model tracks sub-metre GPS coordinates, millisecond audit events, and intricate revenue splits. But the user interface remains clean, calm, and self-explanatory.", "n10"),
  numbered("Zero Passive Task Drift: A task can never simply \u201cexpire\u201d into oblivion. When a deadline passes, the system immediately demands manager review and structured resolution.", "n10"),
  numbered("Immutable Accountability (Audit by Design): Every major operational action writes an indelible entry into the audit trail. Audit logs cannot be altered or deleted by any user, including Super Admins.", "n10"),
  numbered("Equity and Transparency: Performance is evaluated using verifiable operational metrics rather than subjective opinions. Every employee can view their own scorecards in real time.", "n10"),
  numbered("Security with Dignity: Location verification protects corporate integrity and confirms workplace safety, not punitive surveillance. Remote and off-site work is seamlessly accommodated.", "n10"),
  numbered("Unified Login, Multi-Role Flexibility: Single corporate login for all 11 roles. Employees with dual responsibilities switch workspace contexts instantly without re-authentication.", "n10"),
  numbered("Every Chart Answers a Business Question: No decorative charts. Every visualisation in the Intelligence & Analytical Layer is designed to answer a specific operational question.", "n10"),
  numbered("Constructive Correction, Never Punitive Termination: Managerial rejection of deliverables does not kill the task. It initiates a structured, traceable revision cycle with collaborative feedback.", "n10"),

  spacer(), spacer(),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [
    new TextRun({ text: "\u2014 END OF DOCUMENT \u2014", size: 24, font: "Arial", color: GRAY, italics: true })
  ]}),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [
    new TextRun({ text: "CIRIL Internal Operations Tracking System \u2022 Enterprise System Encyclopedia \u2022 Version 2.0 \u2022 September 2026", size: 18, font: "Arial", color: GRAY })
  ]}),
];

// ═══════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ═══════════════════════════════════════════════════════════════
const doc = new Document({
  title: "CIRIL Internal Operations Tracking System (IOTS) - Enterprise System Encyclopedia",
  description: "Comprehensive enterprise-level system documentation for the CIRIL IOTS platform",
  creator: "CIRIL Enterprise Systems",
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: NAVY, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: NAVY, font: "Arial" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: DARK, font: "Arial" },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: ACCENT, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } },
    ]
  },
  numbering: { config: numberingConfig },
  sections: [
    // Cover page
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: coverPage,
    },
    // TOC
    {
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, pageNumbers: { start: 1 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [
        new TextRun({ text: "CIRIL IOTS \u2013 Enterprise System Encyclopedia", size: 18, font: "Arial", color: GRAY, italics: true })
      ] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Page ", size: 18, font: "Arial", color: GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: GRAY }),
        new TextRun({ text: " of ", size: 18, font: "Arial", color: GRAY }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Arial", color: GRAY }),
        new TextRun({ text: "  |  CONFIDENTIAL \u2013 INTERNAL USE ONLY", size: 18, font: "Arial", color: GRAY }),
      ] })] }) },
      children: [...tocPage, ...ch1, ...ch2, ...ch3, ...ch4, ...ch5, ...ch6, ...ch7, ...ch8, ...ch9, ...ch10],
    },
  ],
});

const outPath = process.argv[2] || "CIRIL_IOTS_Enterprise_System_Encyclopedia.docx";
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log("Document generated:", outPath, "(" + (buffer.length / 1024).toFixed(0) + " KB)");
}).catch(err => { console.error("Error:", err); process.exit(1); });
