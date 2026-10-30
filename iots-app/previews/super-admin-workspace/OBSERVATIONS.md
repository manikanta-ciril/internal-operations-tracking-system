# Design and system observations

The supplied brief was compared with the detailed system inventory in `ignore/documentation/system-configuration.txt`, the existing SVG/Draw.io architecture, the prior role-architecture notes, the CIRIL authentication UI and the installed HeroUI v3 components. The new brief governs this preview's permission behaviour; the user's explicit CIRIL-theme instruction overrides the generic SaaS colour list.

## 1. The central distinction is authority, not seniority

Platform ownership is not business approval. The only decision queue on Home is high-level account access/activation/deactivation. User, role, scope, policy and security controls are technical governance. A leave request, creative deliverable, rejected file or brokerage term remains the responsible manager's decision.

Consequently, the preview has Authorise/Decline only for account changes. Task, evidence, request and evaluation views have read-only context and reasoned manager referrals. Technical incidents route to IT System Analyst. There is no hidden business-approval function in the mock API.

## 2. One identity can work in several roles

An employee ID is separate from a role, designation, department, office and reporting manager. Harshitha demonstrates two creative workspaces; Ipsheeta demonstrates multiple management/execution roles. The directory groups by Administrative, Management and Execution workspace families. Those groups are not a reporting ladder.

The active role appears in the header and in every new audit event. The role switcher offers the assigned Super Admin and IT System Analyst workspaces with equal platform rights. Core View/Edit rights remain protected so the preview cannot accidentally lock its operator out of settings.

## 3. How the 27 systems reach the eight screens

| Inventory system                        | Primary UI placement                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| S01 Identity, login and sessions        | Accounts, 360 security profile, Security login history and session termination                       |
| S02 Location validation                 | Attendance source records, location flags and office-boundary configuration                          |
| S03 RBAC and mandate                    | Role switcher, role/scope matrix, locked business authority and referrals                            |
| S04 Audit and operational history       | Append-only mock audit, before/after views and actor/reason recording                                |
| S05 Shared records and business linkage | Stable employee/task/issue IDs and CRM/campaign references                                           |
| S06 Task lifecycle                      | Table, Kanban, task trail, owner changes and stopped assignments                                     |
| S07 Evidence and verification           | Submission versions, feedback loops and manager referral                                             |
| S08 Attendance and availability         | Separate attendance, session and effort columns; availability builder                                |
| S09 Requests and approvals              | Read-only request context and responsible-manager routing                                            |
| S10 Issues and escalation               | Severity-ordered attention list, issue drawer and technical referrals                                |
| S11 Evaluation and recognition          | Profile evaluations, standings and Chairman-review threshold                                         |
| S12 Notifications and reminders         | Header notification drawer and mock recipient notifications                                          |
| S13 Messaging                           | Referral notices preserve linked context; a live chat service is not fabricated                      |
| S14 Email routing                       | Templates, scoped report-email policy and a clearly labelled mock queue                              |
| S15 Analytics                           | Completion/target calculations, report pillars and zero-denominator rules                            |
| S16 Risk                                | Source-linked flags with severity, explanation and responsible person                                |
| S17 Reports                             | Filtered report preview, generated report jobs and real file exports                                 |
| S18 Member follow-up                    | CRM-linked task/context and external-blocker references; CRM stays source-owned                      |
| S19 Deals and royalty                   | Read-only source/verification fields; no invented financial totals                                   |
| S20 Creative delivery                   | Example creative tasks, two rejected versions, reviewer and delivery proof metadata                  |
| S21 Commitments                         | Linked business records and dated task/report schedules; no fictitious legal register                |
| S22 Employee directory                  | Accounts, workspace-family grid, departments and 360 profile                                         |
| S23 Policy configuration                | Reviewed work, leave, export, reporting, template and recognition settings                           |
| S24 Files and retention                 | Source/version metadata and export controls; this preview does not claim to store real work evidence |
| S25 CRM connector                       | Explicit source/verification state; no live CRM call or financial recomputation                      |
| S26 Service health/incidents            | Failed-login/location signals and referral to IT; no fabricated infrastructure uptime                |
| S27 Privacy/governance                  | Role checks, recipient limits, export redaction, no password display or personal timer               |

This is UI/contract coverage of the architecture, not a claim that 27 production services have been implemented.

## 4. Attendance is not presence, session duration or effort

Attendance source fields remain unchanged when a correction is added. Correction history records actor, time and reason beside the original. Session minutes and task minutes are separate columns. Super Admin does not display a personal punch-in timer. The prototype does not change the application's existing sign-in, logout, evidence or office rules.

Saturday remains a working day; Sunday remains a weekly off in example settings. A festival or bank holiday is not automatically a company holiday. Company holiday entries are configurable from 2025 onward without consuming Calendarific calls.

## 5. Metrics must retain uncertainty and history

Completion counts unique task IDs, never transfer events. The repeated-transfer task exercises this rule. No tasks means N/A; an absent target means Target not configured. Original and revised deadlines coexist. Example leave and external-blocker context remains visible rather than being silently counted as poor performance.

The history is illustrative mock data, not live workforce analytics. CRM royalty due/collected remain Not verified until a real approved source and verification time exist. Recognition is a review threshold, not an automatic reward or a technical administrator's decision.

## 6. Every action needs a clear consequence

Create/edit forms first collect values and a reason, then show a before/after review. Account decisions require a comment. Reset-password actions queue a simulated reset-link request and explicitly say no email was sent; no password is shown or stored by the preview. Recipients receive browser-local mock notifications only.

Exports are actual downloadable files. The API derives the current filtered record set, applies export policy/redaction, and records actor, filters, format and count. Excel uses genuine OOXML, not a renamed CSV. PDFs are paginated image-backed pages with Unicode rendered by the browser; they are readable/shareable but not selectable-text documents.

## 7. A mock audit is not an immutable server audit

The UI offers no edit/delete operation for audit events and the mock service appends history for mutations. Browser storage can still be edited outside the UI. Production must enforce immutable storage, authenticated actors, grants, scope, idempotency, concurrency, protected evidence and export delivery on the server. Notifications and scheduled/email delivery require real services. These limitations are labelled, rather than hidden behind a production-ready claim.

## 8. Keep integration small and replaceable

The preview uses the existing components and installed HeroUI package, self-hosted Noto font and CIRIL logo. One typed API module is the boundary for reads, writes and exports. Screens do not write browser storage or call Express directly. This lets Express replace mock functions while preserving components, validation affordances and the operator's mental model.
