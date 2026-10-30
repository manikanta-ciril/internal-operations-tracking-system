const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const {
  chromium,
} = require("../../authentication-system/frontend/node_modules/playwright");
(async () => {
  const source = fs.readFileSync(path.join(__dirname, "employee-greetings.jsx"), "utf8");
  const messages = JSON.parse(
    source.match(/employeeGreetings = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/g, "]"),
  );
  assert.equal(messages.length, 50);
  assert.equal(new Set(messages).size, 50);
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
        path.resolve(__dirname, "../graphic-designer.html").replaceAll("\\", "/"),
    );
    await page.locator(".employee-greeting").waitFor();
    assert.equal(await page.locator(".task-collection-list").count(), 0);
    await page.getByRole("button", { name: /Member welcome stationery/ }).click();
    await page.getByRole("heading", { name: "Task overview", exact: true }).waitFor();
    assert.equal(await page.locator(".task-title-facts > div").count(), 2);
    assert.equal(await page.locator('.task-page-body > [role="alert"]').count(), 0);
    await page
      .getByLabel("What did you do?", { exact: true })
      .fill("Checked the brand inputs.");
    await page.getByRole("button", { name: "Save work update", exact: true }).click();
    await page.waitForFunction(() =>
      JSON.parse(localStorage.getItem("ciril-designer-preview-v1") || "null")
        ?.tasks.find((t) => t.id === "DES-104")
        .notes.some((n) => n.text === "Checked the brand inputs."),
    );
    await page.getByRole("tab", { name: "Files & revisions", exact: true }).click();
    await page
      .getByRole("button", { name: "Upload & submit a revision", exact: true })
      .click();
    await page.getByLabel("Attach deliverable", { exact: true }).setInputFiles([
      { name: "artwork.png", mimeType: "image/png", buffer: Buffer.from("test artwork") },
      {
        name: "source.psd",
        mimeType: "application/octet-stream",
        buffer: Buffer.from("test source"),
      },
    ]);
    await page.getByRole("button", { name: /Print & deck/ }).click();
    assert.equal(
      await page.getByLabel("Attach deliverable", { exact: true }).getAttribute("accept"),
      ".pdf,.pptx,.ppt",
    );
    await page.getByRole("button", { name: "Save working draft", exact: true }).click();
    await page.locator(".working-drafts article").first().waitFor();
    const draftState = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ciril-designer-preview-v1")).tasks.find(
        (t) => t.id === "DES-104",
      ),
    );
    assert.equal(draftState.status, "In progress");
    assert.equal(draftState.workingDrafts.length, 1);
    assert.equal(draftState.versions.length, 0);
    await page.getByRole("button", { name: "Edit draft", exact: true }).click();
    assert.equal(
      await page.getByLabel("File name or source link", { exact: true }).inputValue(),
      "artwork.png, source.psd",
    );
    await page.getByLabel("Attach deliverable", { exact: true }).setInputFiles([
      { name: "artwork.png", mimeType: "image/png", buffer: Buffer.from("test artwork") },
      {
        name: "source.psd",
        mimeType: "application/octet-stream",
        buffer: Buffer.from("test source"),
      },
    ]);
    await page
      .getByLabel("What are you submitting for the first review?", { exact: true })
      .fill("Layouts and editable source ready for creative review.");
    await page
      .getByRole("button", { name: "Submit to creative reviewer", exact: true })
      .click();
    await page.getByRole("dialog").waitFor();
    await page.getByRole("button", { name: "Cancel — keep draft", exact: true }).click();
    assert.equal(await page.locator(".working-drafts article").count(), 1);
    await page
      .getByRole("button", { name: "Submit to creative reviewer", exact: true })
      .click();
    await page.getByLabel("Keep draft details as a work note, then submit").check();
    await page.getByRole("button", { name: "Continue submission", exact: true }).click();
    await page.getByRole("alert").filter({ hasText: "Add a remark" }).waitFor();
    await page
      .getByRole("dialog")
      .getByRole("textbox")
      .fill("Keep the source proof for reference.");
    await page.getByRole("button", { name: "Continue submission", exact: true }).click();
    await page.locator(".version-list article").first().waitFor();
    assert.equal(await page.locator(".working-drafts article").count(), 0);
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ciril-designer-preview-v1")),
    );
    assert.equal(
      saved.tasks.find((t) => t.id === "DES-104").versions.at(-1).attachments.length,
      2,
    );
    await page
      .locator(".version-list")
      .getByRole("button", { name: "artwork.png", exact: true })
      .click();
    await page.getByRole("tab", { name: "Activity", exact: true }).click();
    const dates = await page
      .locator(".task-activity-path time")
      .evaluateAll((nodes) => nodes.map((n) => new Date(n.dateTime).getTime()));
    assert.ok(dates.length > 0);
    assert.deepEqual(
      dates,
      [...dates].sort((a, b) => b - a),
    );
    await page.screenshot({
      path: path.resolve(__dirname, "../../../.local/task-activity-new.png"),
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Details", exact: true }).click();
    await page.screenshot({
      path: path.resolve(__dirname, "../../../.local/task-details-new.png"),
      fullPage: true,
    });
    for (const width of [900, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
    }
    await page.screenshot({
      path: path.resolve(__dirname, "../../../.local/task-details-mobile-new.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    console.log(
      "PASS 50 greetings, grid default, task facts, alert placement, multi-file persistence, newest-first activity, responsive layout.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
