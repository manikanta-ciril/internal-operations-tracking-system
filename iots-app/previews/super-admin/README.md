# Super Admin company setup preview

Open [`../../superadmin.html`](../../superadmin.html) directly in a current Edge or Chrome browser. React, fonts, the CIRIL logo and CSS are embedded; the file makes no external requests.

This is a functional **local draft prototype**, not live administration. Company, offices, departments, employees, access plans, working hours, approved holidays, member references and system settings are stored in this browser. Export creates a JSON review copy. Reset removes only this preview’s draft. Browser storage can be cleared by the browser; export important work. Do not enter confidential employee information or credentials into a prototype.

## Source map

| File                   | Responsibility                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| `main.jsx`             | Application shell, hash navigation, draft persistence, export and reset |
| `catalog.js`           | All 27 system definitions, role names and navigation                    |
| `model.js`             | Draft schema, loading, setup progress and shared helpers                |
| `components.jsx`       | Reusable UI adapters, forms and shared application components           |
| `setup-pages.jsx`      | Company, offices, departments, people, roles and work rules             |
| `management-pages.jsx` | Members, system settings, CRM plan and setup history                    |
| `preview.css`          | Responsive CIRIL light/dark presentation                                |
| `build.cjs`            | Builds the standalone HTML                                              |

The preview reuses the authentication frontend’s Icon, Field, Dialog, Tooltip, Popover, Avatar, ThemeToggle, Noto Sans and colour tokens. Button, Chip and ProgressBar use the installed HeroUI React package. Other controls use semantic HTML and the application’s shared components. It does not alter authentication routing or add dependencies to its runtime.

## Rebuild

From the repository root, with the existing root HeroUI and frontend React dependencies installed:

```powershell
npm.cmd install --prefix .local/preview-build --no-save --package-lock=false esbuild
node iots-app/previews/super-admin/build.cjs
```

Edit the modular source, then rebuild. Do not edit the generated bundle in `superadmin.html`.

## Domain boundaries

- The catalogue follows the detailed 27-system inventory reviewed from `ignore/documentation/system-configurations.txt` and `iots-system.svg` / Draw.io. System IDs remain stable.
- Employees and external member companies are separate records.
- Super Admin and IT System Analyst platform permissions stay synchronized. Business approval responsibility remains separately assigned.
- Saturdays remain working days; Sunday is the weekly off. Holidays here are company-approved draft entries, not an automatic provider feed.
- Attendance, session activity and task effort remain separate facts.
- CRM connection settings are a plan only. No CRM endpoint is called and no live financial figures are fabricated. Royalty references describe the reviewed CRM calculation, not confirmed payments.
- Setup history is a browser-local convenience, not a tamper-proof audit trail.

Live integration still requires authenticated backend endpoints, server-side permission checks, database persistence, versioned policies and audited changes. Saving this preview does not implement those 27 production subsystems.

## Validation

Browser checks covered company → office → department → employee creation, system search and settings, persistence after reload, equal platform access, working hours, holidays, CRM draft settings, JSON export, reset and mobile navigation. All 27 systems were reachable. Widths 320, 390, 768 and 1440 px passed horizontal overflow checks; light and dark renders were inspected. No browser exceptions or external HTTP requests occurred. The existing authentication frontend build and lint also passed.

HeroUI licensing is retained in the repository’s `third-party-licenses/HeroUI-LICENSE.txt` and `THIRD_PARTY_NOTICES.md`; bundled dependency notices are preserved by the build.
