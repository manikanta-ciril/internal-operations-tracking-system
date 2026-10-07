# CIRIL IOTS flowchart

Open **final-version.drawio** in Draw.io. Start with page 01, then follow the dashed linked boxes or use the page tabs. The editable file contains 14 pages. A PDF and overview PNG are provided for presentation.

## Page guide

| Page | Coverage |
|---|---|
| 01 | Chairman-friendly overview and the three foundational layers |
| 02 | Credentials, active account, location, login audit and role access |
| 03 | Ten roles within the three functional lanes; workspace switching |
| 04 | Six administrative branches and governance boundaries |
| 05 | Assignment, execution, evidence, review, corrections and closure |
| 06 | Overdue intervention, reassignment, blockers and escalation |
| 07 | Attendance, availability, requests, communication, profile and security |
| 08 | IT monitoring, incidents, deployment records and platform governance |
| 09 | General, Senior and Lead Manager responsibilities and shared controls |
| 10 | BDE membership work, CRM commercial milestones and royalty follow-up |
| 11 | Creative content, market reports, Office calls and event materials |
| 12 | Metrics, trends, risks, reporting, scope and evidence drill-down |
| 13 | Chairman oversight, appraisal exports, announcements and recognition |
| 14 | Sources, design refinements and unresolved policy choices |

## Source precedence and review

1. **gpt_prompt.txt:** authoritative IOTS scope and explicit role responsibilities. Its ten-role structure supersedes the eleven-role supporting document.
2. **ciril_crm_detail.pdf:** business foundation. All 20 pages were extracted and reviewed; a few decorative glyphs were not recovered by text extraction.
3. **../Flowchart/Actual-FlowChart.drawio:** original architecture and branches. Both existing pages were inspected through their diagram structure and labels.
4. **Construct.txt:** functional scope for administrative, managerial, employee and analytical work.
5. **claude_version.docx:** supporting operational concepts. Its role descriptions, numerical examples and proposed policies were not treated as stronger evidence than the prompt or company source.
6. **referential-flowchart.jpeg:** inspected visually for colours, flow orientation and shape usage.

The historical **chat_gpt_chats.pdf** was not needed.

The stated `CRM/Update/public_html` path was absent. The available code was found at `C:/Users/ciril/OneDrive/Desktop/CRM/Updated/public_html/public_html`. Review focused on routes, lead assignment, brokerage and royalty controllers, relevant models, and schema definitions in `C:/Users/ciril/OneDrive/Desktop/CRM/cirilcrm_ciril.sql`. This was a domain review for the operational diagram, not an exhaustive application audit. No application code or source documents were changed.

## Corrections grounded in the sources

- **Brokerage split varies by deal.** `Leads/BrokerageController.php::getBrokerage` reads giver and receiver shares, including custom percentages. The supporting document's fixed 30/70 split is not a universal rule.
- **Lease brokerage varies with agreed days.** The code calculates rounded monthly rent value × agreed lease days / 30; sale brokerage is rounded 1% of transaction value.
- **Royalty is calculated per party.** The code rounds 7.5% of the rounded giver share plus 7.5% of the rounded receiver share. This is approximately 7.5% of total brokerage when the agreed shares total 100%, subject to rounding.
- **Payment confirmation is a separate event.** Commercial closure, acceptance of brokerage and confirmation of royalty payment have separate records and responsibilities. Completing an internal IOTS follow-up does not itself settle a CRM deal.
- **Platform authority differs from business authority.** Super Admin and IT Analyst retain equal platform privileges; commercial, leave and deliverable approvals still require an explicit business mandate.
- **CRM roles are not the IOTS role model.** The current `users.roleId` field describes one role per CRM user. Multiple IOTS roles require a separate design; they are not claimed to exist in the current schema.
- **CRM integration must reconcile status history.** The reviewed `RoyaltyController::royalityStatus` sets `leads.lead_status` to 8 and `brokerage.royality` to 1, but inserts `status_id` 7 into `lead_statuses`. The diagram uses business milestones rather than presenting those numeric values as a reliable common state model.

## Design choices still requiring CIRIL policy

These do not prevent reviewing the operational design, but need decisions before implementation:

- Approval and escalation matrix, including business payment confirmation authority and delegated Admin interventions.
- Actual shifts, grace periods, break accounting, attendance corrections and remote-work approval rules.
- Reporting cadence, recipient rules and the exact Chairman appraisal export template.
- Recognition weights, qualifying thresholds, incentives and period definitions. Three consecutive qualifying months and Chairman sign-off are included; the supporting document's specific score and reward amounts remain proposals.
- CRM linking/import/integration mechanism, data reconciliation, retention and export configuration.

The design recommends explicit checkout, separate unknown-location handling, active-account checks, per-action permission checks and immutable audit records. These are design requirements and refinements, not assertions that the supplied CRM already implements them.

## Artifact validation

The file was parsed as XML and checked for unique IDs within each page, valid connector endpoints, edge geometry and valid internal page links. Draw.io was used to render the artifact for visual review. The Draw.io MCP tool was unavailable; native editable XML was authored using the installed Draw.io skill. The desktop version did not support the optional `libavoid` layout preset, so the supplied layout uses explicit positions and orthogonal connectors.
