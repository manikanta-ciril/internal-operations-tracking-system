const assert = require("node:assert/strict");
const {
  chromium,
} = require("../../authentication-system/frontend/node_modules/playwright");
const path = require("node:path");
const url =
  "file:///" + path.resolve(__dirname, "../graphic-designer.html").replaceAll("\\", "/");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await page.clock.install({ time: new Date("2026-10-28T12:00:00+05:30") });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.getByRole("heading", { name: "My work", exact: true }).waitFor();
  await page.getByRole("button", { name: /Member welcome stationery/ }).click();
  await page.getByRole("button", { name: "Add update", exact: true }).click();
  await page.getByLabel("Progress percentage").fill("75");
  await page.getByLabel("What changed?").fill("Prepared editable stationery layouts");
  await page.getByRole("button", { name: "Save update", exact: true }).click();
  await page.getByRole("heading", { name: "The brief" }).waitFor();
  assert.match(await page.locator(".task-page").innerText(), /75%/);
  await page.getByRole("button", { name: "Submit for review", exact: true }).click();
  await page.getByLabel("File name or source link").fill("stationery-v1.pdf");
  await page
    .getByLabel("What is ready or changed?")
    .fill("Editable layouts ready for first review");
  await page
    .getByRole("button", { name: "Submit to creative reviewer", exact: true })
    .click();
  await page.getByRole("heading", { name: "The brief" }).waitFor();
  assert.match(await page.locator(".task-page").innerText(), /Waiting for review/);
  await page.getByRole("tab", { name: "Files & versions" }).click();
  assert.match(await page.locator(".task-page").innerText(), /stationery-v1.pdf/);
  await page.getByRole("button", { name: "Back to my work", exact: true }).click();
  await page.getByRole("button", { name: /Member listing creative/ }).click();
  await page.getByRole("button", { name: "Request more time" }).click();
  await page.getByLabel("Requested deadline").fill("2026-11-01T18:00");
  await page.getByLabel("Why is more time needed?").fill("Awaiting approved images");
  await page.getByRole("button", { name: "Request extension", exact: true }).click();
  await page.getByText("Extension requested", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Back to my work", exact: true }).click();
  await page.getByRole("button", { name: /Zonal meeting carousel/ }).click();
  await page.getByRole("button", { name: "Resume work", exact: true }).click();
  await page.getByRole("button", { name: "Submit for review", exact: true }).waitFor();
  await page.getByRole("button", { name: "Back to my work", exact: true }).click();
  await page.getByRole("button", { name: "Daily report", exact: true }).first().click();
  await page.getByRole("heading", { name: "Daily report", exact: true }).waitFor();
  await page.getByLabel("Any other work today?").fill("Prepared campaign references");
  await page
    .getByLabel("Remarks", { exact: true })
    .fill("Waiting on approved photography");
  await page.getByRole("button", { name: "Save report notes" }).click();
  await page.getByText("Prepared campaign references", { exact: true }).waitFor();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download CSV" }).click();
  assert.match((await download).suggestedFilename(), /daily-report/);
  await page.getByRole("button", { name: "My work" }).click();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await page.getByRole("button", { name: "List view", exact: true }).click();
  assert.equal(await page.locator(".task-collection-list").count(), 1);
  await page.getByRole("button", { name: "Grid view", exact: true }).click();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
      "overflow " + width,
    );
    await page.getByRole("button", { name: /Member listing creative/ }).click();
    await page.locator(".task-page").waitFor();
    assert.equal(
      await page
        .locator(".task-page")
        .evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
      true,
      "task page overflow " + width,
    );
    await page.getByRole("button", { name: "Back to my work", exact: true }).click();
  }
  await page.getByLabel("Search tasks").fill("Member listing");
  await page.getByRole("button", { name: "List view", exact: true }).click();
  await page.getByRole("button", { name: /Member listing creative/ }).click();
  assert.match(page.url(), /#work\/DES-108$/);
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.goBack();
  await page.getByRole("heading", { name: "My work", exact: true }).waitFor();
  assert.equal(await page.getByLabel("Search tasks").inputValue(), "Member listing");
  assert.equal(
    await page
      .getByRole("button", { name: "List view", exact: true })
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.getByLabel("Search tasks").fill("");
  await page.getByRole("button", { name: "Open notifications" }).click();
  await page.getByRole("heading", { name: "Notifications", exact: true }).waitFor();
  await page.locator(".notification-item").first().click();
  await page.locator(".task-page").waitFor();
  await page.getByRole("button", { name: "Back to notifications", exact: true }).click();
  await page.getByRole("heading", { name: "Notifications", exact: true }).waitFor();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "Back to workspace", exact: true }).click();
  await page.getByRole("button", { name: "Help & workflow", exact: true }).click();
  await page.getByRole("heading", { name: "How work moves", exact: true }).waitFor();
  await page.getByRole("button", { name: "Back to workspace", exact: true }).click();
  await page.getByRole("button", { name: "Preferences", exact: true }).click();
  await page.getByRole("button", { name: "Preview report reminder" }).click();
  await page.getByRole("button", { name: "In 10 minutes" }).click();
  await page
    .getByText("Your daily report is ready to review", { exact: true })
    .waitFor({ state: "hidden" });
  await page.reload();
  await page.getByRole("heading", { name: "My work", exact: true }).waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ciril-designer-preview-v1")).tasks.find(
          (t) => t.id === "DES-104",
        ).progress,
    ),
    100,
  );
  // Failed storage must keep the form draft and saved state.
  await page.getByRole("button", { name: /Zonal meeting carousel/ }).click();
  await page.getByRole("button", { name: "Add update", exact: true }).click();
  await page.getByLabel("What changed?").fill("Do not lose this draft");
  await page.evaluate(
    () =>
      (Storage.prototype.setItem = function () {
        throw Error("Storage quota exceeded");
      }),
  );
  await page.getByRole("button", { name: "Save update", exact: true }).click();
  await page.getByText("Storage quota exceeded", { exact: true }).waitFor();
  assert.equal(
    await page.getByLabel("What changed?").inputValue(),
    "Do not lose this draft",
  );
  const bad = await browser.newPage();
  await bad.addInitScript(() =>
    localStorage.setItem("ciril-designer-preview-v1", "bad json"),
  );
  await bad.goto(url);
  await bad.getByText("We couldn't open this workspace", { exact: true }).waitFor();
  assert.equal(
    await bad.evaluate(() => localStorage.getItem("ciril-designer-preview-v1")),
    "bad json",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS: full-page navigation, browser Back, preserved list settings, no drawers, progress, submission, versions, extension request, blocker resume, report notes/CSV, responsive layouts, theme, reminder snooze, persistence, save failures, corrupt storage.",
  );
  await browser.close();
})();
