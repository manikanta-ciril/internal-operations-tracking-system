const assert = require("node:assert/strict");
const path = require("node:path");
const {
  chromium,
} = require("../../authentication-system/frontend/node_modules/playwright");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      "file:///" +
        path.resolve(__dirname, "../graphic-designer.html").replaceAll("\\", "/") +
        "#report",
    );
    await page.getByRole("heading", { name: "Tasks to be done", exact: true }).waitFor();
    await page
      .locator(".report-task-options label")
      .filter({ hasText: "Member welcome stationery" })
      .locator("input")
      .check();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByRole("heading", { name: "No tasks completed.", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Completion summary", exact: true }).click();
    await page
      .getByRole("menuitemradio", {
        name: "Work is in progress; no completions today.",
        exact: true,
      })
      .click();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel(/Work description for/)
      .fill("Prepared the member stationery layout.");
    await page.getByRole("button", { name: "Move to pending", exact: true }).click();
    await page
      .getByRole("heading", { name: "No tasks in progress.", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(
      await page.locator(".report-entry h3").first().innerText(),
      "Member welcome stationery",
    );
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("heading", { name: "New tasks", exact: true }).waitFor();
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page
      .getByLabel("Daily remarks", { exact: true })
      .fill("Waiting for confirmation.");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    assert.equal(await page.locator(".report-review-table tbody tr").count(), 1);
    await page
      .getByText("Work is in progress; no completions today.", { exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await page.getByText("Draft saved on this device.", { exact: true }).waitFor();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ciril-designer-preview-v1")),
    );
    const report = Object.values(saved.manualReports)[0];
    assert.equal(report.entries["DES-104"].section, "Tasks pending");
    assert.equal(saved.tasks.find((t) => t.id === "DES-104").status, "In progress");
    await page.getByRole("button", { name: "Export report", exact: true }).click();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("menuitem", { name: "CSV", exact: true }).click(),
    ]);
    const stream = await download.createReadStream();
    let csv = "";
    for await (const chunk of stream) csv += chunk;
    for (const section of [
      "Tasks to be done",
      "Task Completed",
      "Tasks in Progress",
      "Tasks pending",
      "Any new tasks assigned or taken up during the day",
    ])
      assert.ok(csv.includes(section));
    await page.screenshot({
      path: path.resolve(__dirname, "../../../.local/report-sections-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.resolve(__dirname, "../../../.local/report-sections-mobile.png"),
      fullPage: true,
    });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
    await page.reload();
    await page.getByRole("heading", { name: "Tasks to be done", exact: true }).waitFor();
    assert.equal(await page.locator(".report-task-options input:checked").count(), 1);
    await page.locator(".report-guide .report-stepper button").nth(1).click();
    await page.getByLabel("Completed today: Member welcome stationery").check();
    assert.equal(
      await page.locator(".report-entry h3").first().innerText(),
      "Member welcome stationery",
    );
    assert.deepEqual(errors, []);
    console.log(
      "PASS: seven steps, empty summaries, completion, pending transfer, preserved notes, workflow isolation, CSV sections, reload, mobile.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
