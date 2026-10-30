const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url");
const {
  chromium,
} = require("../../authentication-system/frontend/node_modules/playwright");
const root = path.resolve(__dirname, "../../.."),
  artifacts = path.join(root, ".local/governance-review");
async function main() {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [],
    external = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) external.push(r.url());
  });
  await page.goto(
    pathToFileURL(path.join(root, "iots-app/superadmin-workspace.html")).href,
  );
  await page
    .getByRole("heading", { name: /Good (morning|afternoon|evening)/ })
    .waitFor();
  const navigate = async (id) => {
    await page.evaluate((id) => (location.hash = id), id);
    await page.locator("main h1").waitFor();
    await page.waitForTimeout(60);
  };
  const closeDrawer = async () => {
    const button = page.getByRole("button", {
      name: "Close dialog",
      exact: true,
    });
    if (await button.count()) await button.click();
  };
  const confirm = async (
    reason = "Reviewed the example source before this change",
  ) => {
    await page
      .getByLabel("Reason for this change", { exact: true })
      .fill(reason);
    await page
      .getByRole("button", { name: "Review change", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm change", exact: true })
      .click();
    await page.waitForTimeout(450);
  };
  const snapshot = () =>
    page.evaluate(() =>
      JSON.parse(localStorage.getItem("ciril-governance-preview-v1") || "null"),
    );
  for (const id of [
    "home",
    "people",
    "tasks",
    "attendance",
    "announcements",
    "reports",
    "audit",
    "settings",
  ]) {
    await navigate(id);
    const states = page.getByLabel("Page preview state", { exact: true });
    await states.selectOption("Loading");
    await page.getByRole("status", { name: "Loading workspace" }).waitFor();
    await states.selectOption("Empty");
    await page
      .getByRole("heading", { name: "No records in this view" })
      .waitFor();
    await page
      .getByRole("button", { name: "Load example records", exact: true })
      .click();
    await states.selectOption("Error");
    await page.getByRole("button", { name: "Retry", exact: true }).click();
    await states.selectOption("Restricted");
    await page
      .getByRole("heading", { name: "Outside your data scope" })
      .waitFor();
    await page.getByRole("button", { name: "Return to example scope" }).click();
  }
  await navigate("people");
  await page
    .getByRole("tab", { name: "Employee Directory", exact: true })
    .click();
  await page
    .locator(".gw-person-card")
    .filter({ hasText: "Harshitha" })
    .click();
  await page
    .getByRole("heading", { name: "Employee profile", exact: true })
    .waitFor();
  for (const tab of [
    "Tasks & workflow trail",
    "Attendance",
    "Evidence & versions",
    "Blockers",
    "Feedback & evaluations",
    "Security & audit",
    "Overview & targets",
  ])
    await page.getByRole("tab", { name: tab, exact: true }).click();
  assert.equal(
    await page.getByRole("button", { name: /^(Approve|Reject)$/ }).count(),
    0,
  );
  await page.getByRole("button", { name: "Edit profile", exact: true }).click();
  await page.getByLabel("Name", { exact: true }).fill("Harshitha");
  await confirm();
  await page.getByRole("heading", { name: "Employee profile" }).waitFor();
  await closeDrawer();
  await page.getByRole("button", { name: "Create user", exact: true }).click();
  await page.getByLabel("Full name", { exact: true }).fill("Example Tester");
  await page
    .getByLabel("Company email", { exact: true })
    .fill("tester@example.test");
  await page
    .getByLabel("Designation", { exact: true })
    .selectOption("Executive");
  await page.getByLabel("Assigned roles", { exact: true }).fill("Executive");
  await page
    .getByRole("dialog")
    .getByLabel("Department", { exact: true })
    .selectOption("Operations");
  await page
    .getByLabel("Reporting manager", { exact: true })
    .selectOption("EMP-002");
  await confirm();
  assert.ok(
    (await snapshot()).employees.some((e) => e.email === "tester@example.test"),
  );
  await navigate("home");
  await page
    .getByRole("button", { name: "Authorise", exact: true })
    .last()
    .click();
  await confirm();
  assert.equal(
    (await snapshot()).changes.find((c) => c.id === "AUTH-302").status,
    "Authorised",
  );
  await navigate("tasks");
  await page.getByRole("tab", { name: "Kanban", exact: true }).click();
  await page.getByRole("tab", { name: "Transfer log", exact: true }).click();
  await page
    .getByRole("button", { name: "TASK-102", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Update instructions / owner" })
    .click();
  await page.getByLabel("Owner", { exact: true }).selectOption("EMP-007");
  await confirm();
  await closeDrawer();
  assert.equal(
    (await snapshot()).tasks.find((t) => t.id === "TASK-102").transfers.length,
    4,
  );
  await page.getByRole("button", { name: "Create & assign task" }).click();
  await page
    .getByLabel("Task title", { exact: true })
    .fill("Prepare test review note");
  await page
    .getByLabel("What must be delivered?", { exact: true })
    .fill("A source-linked review note.");
  await page
    .getByLabel("Linked business record", { exact: true })
    .fill("CRM-LEAD-204");
  await page.getByLabel("Assignee", { exact: true }).selectOption("EMP-006");
  await page.getByLabel("Reviewer", { exact: true }).selectOption("EMP-002");
  await page
    .getByLabel("Due date and time", { exact: true })
    .fill("2027-01-10T18:00");
  await page.getByLabel("Capacity check", { exact: true }).selectOption("yes");
  await confirm();
  assert.ok(
    (await snapshot()).tasks.some(
      (t) => t.title === "Prepare test review note",
    ),
  );
  await navigate("attendance");
  await page
    .getByRole("button", { name: "Add correction", exact: true })
    .last()
    .click();
  await page.getByLabel("Field", { exact: true }).selectOption("location");
  await page.getByLabel("Corrected value", { exact: true }).fill("Remote");
  await page
    .getByLabel("Source evidence", { exact: true })
    .fill("Original attendance reading and manager note");
  await confirm();
  assert.equal((await snapshot()).attendance.at(-1).corrections.length, 1);
  await navigate("announcements");
  await page
    .getByRole("button", { name: "New announcement", exact: true })
    .click();
  await page.getByLabel("Title", { exact: true }).fill("Example team update");
  await page
    .getByRole("textbox", { name: "Announcement message" })
    .fill("**Keep evidence links** with every final file.");
  await page
    .getByLabel("Publish at (this device’s time)", { exact: true })
    .fill("2027-01-01T09:00");
  await page
    .getByLabel("Expires at (this device’s time)", { exact: true })
    .fill("2027-01-02T18:00");
  await confirm();
  assert.ok(
    (await snapshot()).announcements.some(
      (a) => a.title === "Example team update",
    ),
  );
  await navigate("reports");
  await page
    .getByRole("tab", { name: "Business & Recognition", exact: true })
    .click();
  await page
    .getByText("Not verified · no live connection", { exact: true })
    .waitFor();
  await page.getByRole("tab", { name: "Performance", exact: true }).click();
  await page.getByText("Report filters", { exact: true }).click();
  await page.getByLabel("employee", { exact: true }).selectOption("EMP-003");
  for (const format of ["CSV", "Excel (.xlsx)", "PDF"]) {
    await page
      .getByRole("button", { name: "Export view", exact: true })
      .click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: format, exact: true }).click();
    const download = await downloadPromise;
    const file = path.join(artifacts, download.suggestedFilename());
    await download.saveAs(file);
    const content = fs.readFileSync(file);
    if (format === "CSV") {
      assert.match(content.toString(), /EMP-003/);
      assert.doesNotMatch(content.toString(), /EMP-004/);
    }
    if (format.startsWith("Excel"))
      assert.equal(content.subarray(0, 2).toString(), "PK");
    if (format === "PDF")
      assert.equal(content.subarray(0, 4).toString(), "%PDF");
    await page.waitForTimeout(250);
  }
  await page
    .getByRole("button", { name: "Generate report", exact: true })
    .click();
  await confirm();
  assert.ok((await snapshot()).reportJobs.length);
  await navigate("audit");
  await page
    .getByRole("tab", { name: "Work & account changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View diff", exact: true })
    .first()
    .click();
  await page.locator(".gw-diff").waitFor();
  await page.keyboard.press("Control+k");
  await page
    .getByRole("searchbox", {
      name: "Search employees, tasks, issues and audit",
    })
    .fill("TASK-102");
  await page.locator(".gw-search-results button").first().click();
  await page
    .getByRole("heading", { name: "Task trail", exact: true })
    .waitFor();
  await closeDrawer();
  await navigate("settings");
  await page.getByRole("tab", { name: "Export policy", exact: true }).click();
  await page
    .getByRole("button", { name: "Enabled", exact: true })
    .first()
    .click();
  await confirm();
  await page.getByRole("button", { name: "Export view", exact: true }).click();
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Exports are disabled" })
    .waitFor();
  await page
    .getByRole("button", { name: "Disabled", exact: true })
    .first()
    .click();
  await confirm();
  await navigate("home");
  await page
    .getByRole("button", { name: "Switch to dark mode", exact: true })
    .click();
  await page.screenshot({
    path: path.join(artifacts, "home-dark.png"),
    fullPage: true,
  });
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of [
      "home",
      "people",
      "tasks",
      "attendance",
      "announcements",
      "reports",
      "audit",
      "settings",
    ]) {
      await navigate(id);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${id} overflow at ${width}`,
      );
    }
    if (width === 390) {
      await page.getByRole("button", { name: "Toggle navigation" }).click();
      await page
        .getByRole("link", { name: "Home", exact: false })
        .first()
        .click();
      await page.screenshot({
        path: path.join(artifacts, "mobile-dark.png"),
        fullPage: true,
      });
    }
  }
  await page.reload();
  await page.locator("main h1").waitFor();
  assert.ok(
    (await snapshot()).employees.some((e) => e.email === "tester@example.test"),
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(external, []);
  console.log(
    "PASS: eight screens and all preview states, multi-role 360 profile, create/edit, account authorisation, transfer history, task creation, attendance corrections, rich announcement, scoped CSV/XLSX/PDF, report job, audit diff, command search, export policy, persistence, dark theme and responsive widths. No external requests.",
  );
  await browser.close();
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
