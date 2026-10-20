# Authentication audit — 20 October 2026

`authentication-audit.pdf` and its HTML version document the **pre-fix** audit:
12 findings, their causes, reproduction evidence and proposed resolutions.
The JSON manifests and browser captures are historical evidence, not a verdict
on the current code. No production employee photos are included.

Read `resolution.md` for the implemented corrections. Paths in the original
report refer to the source layout at audit time. Current source paths are mapped
in [the application structure guide](../../iots-app/FILE_STRUCTURE.md).

The original `build_report.py` requires the audited pre-fix working-tree files
at their original paths; do not regenerate the historical report against fixed
source. `render_report.cjs` can print the committed HTML using the frontend's
installed Playwright and Microsoft Edge on Windows.

Current verification: from `iots-app`, run `npm run dev`, then run
`npm run test:auth` in a second terminal. Tests use an isolated database and
temporary evidence storage. Unit, lint, production build and the full isolated
authentication suite passed before publishing these changes.
