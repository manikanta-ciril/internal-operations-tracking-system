# Surface brief: Graphic Designer workspace

Mode: Operate. Users need to identify what needs attention, continue assigned creative work, follow reviews and review a daily report with little navigation effort.

The redesign uses a readable task list as the default, with an optional card view. Keep the CIRIL palette and standard shadcn controls. Put the daily report action beside the page heading. Task details, notifications, profile, preferences and help open as separate page views.

First viewport: active role in navigation; My work heading; task filters and search; work entries with execution stage, feedback or brief, progress, deadline and a clear next action; a direct daily-report action.

Review stages and capabilities come from role-policy.js through RoleContext. Identity data is limited to account details and activity attribution. Report grants are scoped separately from task review permissions. Task details expose a saved, owner-only brief checklist, version list and revision trail; checklist changes never alter task progress or approve work.

Verify light/dark desktop and 320–768px responsive layouts, grid/list switching, task forms, version history, report export, reminder snooze, persistence and failed writes. No claims of real email, upload storage, manager notification delivery or immutable audit in this preview.

## Creative overview refinement

The work page opens with four interactive stage cards: Creative work, Needs your attention, With reviewers and Approved designs. Counts derive from tasks; the attention count overlaps active work because it flags exceptions. Categories follow the supplied creative communication scope: social media/newsletters, presentations/reports, member materials and event branding. No performance scores or rewards are invented. Search and card selection replace duplicate filter tabs, sorting controls and view switches. Attention-first ordering and the task list remain consistent. The desktop sidebar collapses to labelled icon controls and remembers the choice locally; mobile keeps its navigation menu.

## Manual daily reporting and dashboard filters

The work dashboard uses IST greetings, a one-time waving-hand animation, informational summary cards, and task filters for assignment date, deadline, creative vertical, scope category, and stage. Reduced-motion settings disable decorative movement.

Daily reporting is employee-curated in three steps: task selection, per-task descriptions/status/remarks/evidence, and final review. Report sections do not change task workflow states. Only selected tasks enter reports. Saved dates and earlier report snapshots remain accessible from 2025 onward. Proof blobs use IndexedDB; report metadata uses the preview API's local storage. Exports generate PDF, XLSX, and CSV documents with evidence filenames. Uploaded proof binaries are downloaded separately.

Automatic report dispatch is removed. Explicit submissions create a preview delivery for General Manager / Senior Manager / Executive only. Chairman and creative-review roles are not report recipients. Actual server delivery, cloud file storage, and integration with the authenticated application's attendance calendar remain outside this standalone preview.

### Section-by-section report flow

The report now walks through Tasks to be done, Tasks completed, Tasks in progress, Tasks pending, and New tasks, then remarks/other work and final review. The first step lists available tasks and selects work included in the report. Selected tasks already completed start in Completed; other selected tasks start in In progress. Employees may confirm report-only completion or move selected work between In progress and Pending without changing task approval status. New assignments are suggested by the selected report date and enter the report only when selected. Each section has an explicit empty state, and text/proofs are optional. All five sections, including empty summaries, appear in preview and exports. Existing saved entries retain their data and evidence references.

### Spreadsheet report review and exports

Review uses the workbook's columns (Tasks to be done, Task Completed, Tasks in Progress, Tasks pending, Any new tasks assigned or taken up during the day, Remarks), preceded by Task ID, Date and Day, followed by Evidence. One task creates one row; its description enters the appropriate status column. New-task text can coexist on that row. Other work has a separate row; daily remarks and empty-section summaries follow the table. Identity comes from employee records; unknown identity fields are labelled rather than invented.

Excel embeds the CIRIL logo at the upper right, wraps cells, freezes headers, and uses A4 landscape print settings. PDF uses A4 landscape with repeated table headers, employee identity, logo, and row continuation for long text. CSV uses identical task columns with identity metadata; as a text format it records the logo filename instead of embedding artwork. Sidebar branding uses the authenticated application's configured /img/icon.png favicon.

### Branding and export spacing refinement

The supplied Waving Hand.webp is copied into assets/waving-hand.webp and embedded at 38px (32px on mobile), replacing the emoji. Reduced-motion mode hides the animated asset. Expanded navigation displays the CIRIL wordmark; collapsed navigation displays the authenticated application's compact icon. The task list restores a grid/list toggle while preserving filters.

PDF and Excel exports share warm beige header fills and charcoal text. Table text is vertically centred with horizontal breathing room; descriptive cells remain left aligned. Titles and employee metadata use centred header blocks. Excel merges A1:H4 by row and reserves I1:J4 for the centred logo. The PDF retains repeated identity/logo/table headers and row continuation on A4 landscape.

### Employee greeting and task workspace refinement (30 October)

The reusable employee-greetings.jsx component supplies 50 distinct supportive messages, employee identity and an IST-aware greeting. It types only the heading, keeps a complete screen-reader label, and respects reduced motion. The initial message is selected per employee/day; it rotates randomly every five minutes without consecutive repeats. The timer is cleared when the greeting unmounts. Employee work now defaults to grid; explicit list/grid choices are retained during navigation.

Task overview puts status chips at the upper right, highlights the current deadline, centres logged effort and removes duplicate progress text. The wider right rail groups work progress/status above a bounded, keyboard-scrollable Updates & attention panel. Details shows description, supplied inputs/references, expected outputs and checklist. Files & revisions owns reviewer status, multi-file submission, downloaded local attachments, preserved versions and review history. Activity is a newest-first connected timeline; completion records show approval actor and date. Missing approval data is stated, never invented. File blobs are stored in the existing IndexedDB preview store, with a 25 MB per-file limit. Secure production upload and reviewer delivery remain backend integration work.

Focused check: node task-layout.test.cjs covers message count/uniqueness, grid default, fact/alert layout, multi-file persistence, timeline order and narrow layouts.

### Focused task tabs from the supplied reference

Details retains real inputs/outputs and now has a quick working-note form. Files & revisions offers four optional media filters (Vector & source, Artwork & social, Print & deck, Video & motion), local draft saving, submission and per-version review labels. Working drafts are separate from submitted versions and do not advance review or task progress. Earlier versions are labelled Earlier submission unless their own review decision is recorded; no approval is invented. Requests owns extension and blocker forms. Activity uses a connected newest-first path with stage badges derived from each recorded event; append order breaks equal-timestamp ties. Completion nodes include approval identity and timestamp.

Implementation reuses existing form controls, upload storage and role-scoped mutations. The supplied demo names, sample deliverables and mandatory Chairman route were not copied; configured review stages remain authoritative. Files stay on the local preview device.
