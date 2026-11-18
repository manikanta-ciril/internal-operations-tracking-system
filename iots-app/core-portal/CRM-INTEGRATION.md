# CIRIL CRM connection and next API design

## Current delivery

Core Portal now has a server-to-server read-only CRM leads connection and a CRM leads page for General Manager, Senior Manager, Chairman and Lead Manager. Each request checks the employee's current database role assignments. Existing active-session, location and photo guards also apply.

The browser calls GET /api/auth/crm/leads or GET /api/auth/crm/leads/{numeric ID}. Core Portal sends its server-side bearer token to the existing CRM /api/integration/v1/leads API. Tokens never enter frontend configuration.

Supported list filters are page, per_page (1?100), status, from and to. The page currently exposes pagination and refresh. Status values are labelled as codes until the CRM lookup contract is added.

## Activate the connection

1. Deploy the existing reviewed CRM API files from CRM/latest_code/secure-api-guide/upload using that directory's deployment guide. Confirm deployed files match the live CRM version before replacing them.
2. Complete the guide's personal_access_tokens migration and token-management setup. Through the CRM browser, open /integration-access as an active administrator. Issue the expiring restricted iots-leads-readonly token. Terminal access is unnecessary.
3. Set CRM_API_BASE_URL=https://cirilcrm.in/api/integration/v1 and CRM_API_TOKEN to the issued token in Core Portal backend .env. Keep the value out of Git, chat and browser code.
4. Restart Core Portal backend. Sign in as an authorised role, then open CRM leads. An unconfigured connection displays an actionable error.
5. Confirm pagination and lead IDs against CRM. Verify employee accounts cannot access /api/auth/crm/leads.
6. Rotate the token before expiry. Update backend .env, restart and test, then revoke the old token through CRM's browser page.

Transport enforces HTTPS, with HTTP permitted only for loopback during local development. Requests time out after ten seconds. Redirects are rejected to prevent bearer-token forwarding. Responses use no-store. Upstream error bodies are withheld.

## Database findings for the expanded contract

Reviewed the supplied latest_code/cirilcrm_ciril.sql schema.

| Area | Source | Fields and meaning |
| --- | --- | --- |
| Leads | leads | Identifiers, assignments, lifecycle/status codes and timestamps |
| Lead assignment history | lead_assigns | Lead, organisation, vertical and assignment date |
| Lead remarks | lead_remarks_histrory | Lead, author, remark and date |
| Organisations | company | Organisation identifier and name |
| Member/user reference | users | Use selected public business identity fields only after role meanings are confirmed |
| Brokerage and royalty | brokerage | totalBrokerage, LGshare, LRshare, cirilRoyalty, royality and status |
| Financial allocation | financial_details | Lead shares, percentages, acceptance and supporting document references |
| Payment state | payments | lead_id, payment_date, payment_status and payment_remarks |
| Proposals | proposels | Lead, proposal metadata and file reference |

Royalty fields exist. The payments table has no amount column. A payment status alone cannot establish the amount received. Validate status meanings and the calculation/collection relationship in CRM controllers before displaying confirmed receipt totals.

## Next endpoints to implement in CRM

Use /api/integration/v1 with explicit resources. Each resource needs an allowlist of response fields, a scoped token ability, bounded pagination and integration tests.

- GET /lead-statuses and /negotiation-statuses supply human-readable labels.
- GET /organisations supplies organisation IDs and names.
- GET /members supplies agreed business contact fields, excluding credentials and personal HR details.
- GET /leads/{id}/assignments and /leads/{id}/remarks supply dated history.
- GET /leads/{id}/brokerage supplies recorded brokerage and royalty values with source and verification status.
- GET /leads/{id}/financials supplies agreed financial allocation fields.
- GET /leads/{id}/payments supplies recorded payment date, status and remarks.
- GET /leads/{id}/proposals supplies proposal metadata. File downloads require a separately authorised endpoint.
- GET /summary supplies reviewed aggregate counts and royalty figures for Chairman oversight.

These expanded resources are planned contracts. Only leads list/detail are connected in this delivery. Keep the current leads-only token restricted. Add new abilities through a reviewed CRM token policy when each new resource ships.

## IOTS roles and workflow

GM/SM control operational review. Lead Manager uses lead follow-up and royalty collection work. Chairman sees operational and revenue summaries with source dates. All three currently receive the existing lead-metadata contract. Any narrower organisation or zone visibility needs an agreed mapping before expanding financial/contact access.

For collection proof, design an IOTS record containing CRM lead ID, expected royalty, reported amount received, received date, payment reference, evidence, submitting employee and management decision. Preserve correction history. Display pending verification until GM/SM accepts the evidence. Establish actual financial definitions before implementation.

## Verification and deployment status

Client tests cover filters, invalid dates, credential handling, redirect rejection, upstream errors and employee-role denial. Frontend build checks the page integration.

A configured live token and manual GoDaddy deployment are required for a real CRM round trip. Local unit tests do not establish that live hosting is deployed or that live data was fetched.

## GitHub change scope

Commit the API client, role-protected routes, leads page, sample configuration, tests and this guide. Existing unrelated local dashboard and workflow edits must be reviewed independently before their own commit. Commit counts should reflect meaningful deliverables.

## Local expanded API (18 November)

Local runtime is CRM/latest_code/local-runtime, extracted from the supplied ZIP and using the installed vendor dependencies through a junction. It connects to the existing local cirilcrm_ciril database. PHP serves on loopback port 8080.

The copied ZIP front controller contained an early return that prevented requests from reaching Laravel. The local runtime removes that return and explicitly maps the App namespace to the extracted source. These bootstrap changes are local-runtime adaptations.

Lead lists now resolve leadStatus through lead_status_types.statu_type, negotiation_status_id through negotiation_statuses.negotiation_status, assigned_user_id through users.id, and assigned_orgid through company.id. Missing dictionary rows remain explicitly unmapped.

Lead detail returns nine separate related collections: clients, requirements, financial details, brokerage, payments, assignments, remarks, proposals and status history. Separate collections preserve one-to-many records without multiplying lead rows.

GET /resources lists 33 business resources. GET /resources/{name} paginates an explicit schema-derived column allowlist. Archive, configuration and notification categories and settings/custom_fields are excluded. Password, token, secret and DOB columns are excluded. This is business-data coverage, not unrestricted database administration or a consistent full-database snapshot.

Expanded local access uses a newly issued 30-day iots-crm-readonly token with crm:read. The previous leads token cannot call the expanded API. The local token is stored only in the ignored Core Portal backend .env.

Core Portal displays named status, assigned user name and organisation, with a View details action opening related records. Raw secondary reference fields in detail collections still need resource-specific human-readable mappings. Payment and royalty values are source records; collection verification and amount interpretation remain future work.

crm-api-upload contains the changed PHP controller, middleware, resource configuration and route file for review. Do not replace production routes blindly. TokenController and browser token management still issue leads-only tokens and require a coordinated upgrade before production release. Deploy expanded files and issue crm:read together. Local testing does not validate GoDaddy deployment.

The existing 30-request/minute limiter remains enabled and rejected excess requests during the resource smoke test as expected.
