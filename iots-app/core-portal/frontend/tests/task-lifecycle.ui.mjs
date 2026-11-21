import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "playwright";

// Uses only the disposable actual-app fixture, never live employees or attendance.
const fixture = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
assert.match(fixture.database, /^iots_tasks_browser_\d+$/);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const contexts = [];
const pages = [];
const errors = [];
fs.mkdirSync("test-results/task-lifecycle", { recursive: true });
async function account(name) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  contexts.push(context);
  await context.addCookies([fixture.sessions[name].cookie]);
  const page = await context.newPage();
  pages.push(page);
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(fixture.base);
  await page.getByRole("navigation", { name: "Employee workspace" }).waitFor();
  return page;
}
async function change(page, action) {
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/auth/tasks"),
  );
  await action();
  const response = await saved;
  const data = await response.json();
  assert(response.ok(), `${response.status()}: ${data.message}`);
  return data;
}
const click = (page, name) =>
  page.getByRole("button", { name, exact: true }).last().click();
const openTask = async (page, role, taskId, managerial = false) => {
  await page.goto(
    `${fixture.base}/dashboard/${role}/${managerial ? "team-work" : "tasks"}/${taskId}`,
  );
  if (managerial) await page.locator(".management-current").waitFor();
  else
    await page
      .getByRole("heading", { name: "Current status", exact: true })
      .waitFor();
};
let taskId;
try {
  const gm = await account("ipsheeta");
  await gm.getByRole("link", { name: "Assign work", exact: true }).click();
  const form = gm.locator(".management-form");
  const title = `Member welcome artwork ${Date.now()}`;
  await form.locator("[name=title]").fill(title);
  await form
    .locator("[name=brief]")
    .fill(
      "Prepare the member welcome creative using the supplied approved name and brand colours.",
    );
  await form
    .locator("[name=criteria]")
    .fill("Approved member name\nCorrect brand colours");
  await form
    .locator("[name=deliverables]")
    .fill("Review artwork with editable source");
  await form
    .locator("[name=references]")
    .fill("Use the supplied welcome brief.");
  await form
    .locator("[name=ownerId]")
    .selectOption(String(fixture.sessions.deepthi.id));
  await form
    .locator("[name=reviewerId]")
    .selectOption(String(fixture.sessions.secondmanager.id));
  await form.locator("[name=due]").fill("2027-02-01T17:00");
  const created = await change(gm, () => click(gm, "Save draft"));
  taskId = created.task.id;
  await gm.getByRole("heading", { name: title, exact: true }).waitFor();
  await change(gm, () =>
    gm.locator("input[type=file]").setInputFiles({
      name: "brief.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Use approved member details and brand colours."),
    }),
  );
  await change(gm, () =>
    gm
      .locator("input[type=file]")
      .setInputFiles({
        name: "reference.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
          "base64",
        ),
      }),
  );
  await change(gm, () => click(gm, "Assign this work"));
  await gm.screenshot({
    path: "test-results/task-lifecycle/manager-desktop.png",
    fullPage: true,
  });

  const employee = await account("deepthi");
  await openTask(employee, "creative-communication-associate", taskId);
  await employee
    .getByRole("button", { name: "Download brief.txt", exact: true })
    .waitFor();
  await click(employee, "Preview reference.png");
  await employee
    .getByRole("dialog")
    .getByRole("img", { name: "reference.png", exact: true })
    .waitFor();
  assert(
    await employee
      .getByRole("dialog")
      .getByRole("img", { name: "reference.png", exact: true })
      .evaluate((image) => image.complete && image.naturalWidth > 0),
  );
  await click(employee, "Close file preview");
  await click(employee, "Preview brief.txt");
  await employee
    .getByRole("dialog")
    .getByText("Use approved member details and brand colours.", {
      exact: true,
    })
    .waitFor();
  await click(employee, "Close file preview");
  assert.equal(await gm.getByLabel("Switch workspace").count(), 0);
  await change(employee, () => click(employee, "Start task"));
  await employee
    .getByLabel("What did you do?", { exact: true })
    .fill("Prepared the first layout and checked the member details.");
  await employee.locator("#work-progress").fill("40");
  await employee.getByLabel("Time spent today", { exact: true }).fill("30");
  await change(employee, () => click(employee, "Save work update"));
  await employee
    .getByText("Prepared the first layout and checked the member details.", {
      exact: true,
    })
    .first()
    .waitFor();
  await employee
    .getByRole("tab", { name: "Files & revisions", exact: true })
    .click();
  async function submit(version) {
    await click(
      employee,
      version === 1 ? "Submit for review" : "Resubmit for review",
    );
    await employee.locator("#submission-file").setInputFiles({
      name: `artwork-v${version}.pdf`,
      mimeType: "application/pdf",
      buffer: Buffer.from(
        `%PDF-1.4\nVersion ${version}: approved name and brand colour record\n%%EOF`,
      ),
    });
    await employee
      .locator("#work-note")
      .fill(
        `Version ${version}: artwork prepared and checked against the brief.`,
      );
    await change(employee, () =>
      employee
        .getByRole("button", { name: /Submit to assigned manager/i })
        .click(),
    );
    await employee
      .locator(".task-current-status strong")
      .filter({ hasText: "In review" })
      .waitFor();
  }
  await submit(1);
  const reviewer = await account("secondmanager");
  await openTask(reviewer, "senior-manager", taskId, true);
  await click(reviewer, "Request changes");
  await reviewer
    .getByLabel("Decision note")
    .fill(
      "Increase spacing around the member name and submit another version.",
    );
  await change(reviewer, () => click(reviewer, "Save decision"));
  await openTask(employee, "creative-communication-associate", taskId);
  await employee
    .getByRole("tab", { name: "Files & revisions", exact: true })
    .click();
  await submit(2);
  await openTask(reviewer, "senior-manager", taskId, true);
  await click(reviewer, "Approve work");
  await reviewer
    .getByLabel("Decision note")
    .fill("Both acceptance checks passed. The corrected artwork is accepted.");
  await reviewer.getByRole("checkbox").check();
  await change(reviewer, () => click(reviewer, "Save decision"));
  await reviewer.getByRole("radio", { name: "4 stars", exact: true }).check();
  await reviewer
    .getByLabel("Rating note", { exact: true })
    .fill(
      "The accepted artwork meets the brief with clear improvements after review.",
    );
  await change(reviewer, () => click(reviewer, "Save work rating"));
  await openTask(employee, "creative-communication-associate", taskId);
  await employee
    .locator(".task-current-status strong")
    .filter({ hasText: "Completed" })
    .waitFor();
  await employee.getByLabel("4 out of 5 stars", { exact: true }).waitFor();
  await employee.getByRole("tab", { name: "Activity", exact: true }).click();
  await employee
    .getByLabel("Latest activity", { exact: true })
    .getByText("Work rated", { exact: true })
    .waitFor();
  assert.equal(
    await employee
      .getByLabel("Earlier activity", { exact: true })
      .getByText("Work rated", { exact: true })
      .count(),
    0,
  );
  assert(
    await employee
      .getByLabel("Earlier activity", { exact: true })
      .getByText("Assigned", { exact: true })
      .count(),
  );
  assert.equal(
    await employee
      .getByText("Approval details not recorded", { exact: true })
      .count(),
    0,
  );
  assert.equal(
    (await employee.locator(".journey-dates time").count()) >= 4,
    true,
  );
  await employee
    .getByRole("tab", { name: "Files & revisions", exact: true })
    .click();
  assert.equal(await employee.locator(".review-cycle-list li").count(), 4);
  const downloaded = employee.waitForEvent("download");
  await employee
    .getByRole("button", { name: /artwork-v2.pdf/ })
    .last()
    .click();
  assert.equal((await downloaded).suggestedFilename(), "artwork-v2.pdf");
  await employee.screenshot({
    path: "test-results/task-lifecycle/employee-desktop.png",
    fullPage: true,
  });

  await employee
    .getByRole("link", { name: "Daily work report", exact: true })
    .click();
  await employee.getByRole("checkbox", { name: new RegExp(title) }).check();
  await change(employee, () => click(employee, "Save draft"));
  for (let step = 0; step < 6; step++) await click(employee, "Continue");
  await change(employee, () => click(employee, "Submit to manager"));
  await employee
    .getByText("Report submitted to the manager inbox.", { exact: true })
    .waitFor();
  await reviewer
    .getByRole("link", { name: "Team reports", exact: true })
    .click();
  await reviewer.getByText("Sai Deepthi", { exact: true }).first().waitFor();
  await reviewer.getByText("View report", { exact: true }).first().click();
  await reviewer
    .locator(".report-review-table")
    .getByText(title, { exact: true })
    .first()
    .waitFor();
  const reportDownload = reviewer.waitForEvent("download");
  await click(reviewer, "Download Excel");
  assert.match(
    (await reportDownload).suggestedFilename(),
    /ciril-report-.*\.xlsx$/,
  );

  async function setup(path, body) {
    const response = await gm.request.post(
      `${fixture.base}/api/auth/tasks${path}`,
      { data: body, headers: { "Idempotency-Key": crypto.randomUUID() } },
    );
    const result = await response.json();
    assert(response.ok(), result.message);
    return result.task;
  }
  let publication = await setup("", {
    title: "Publication evidence workflow",
    brief: "Publish the approved welcome item and keep publication proof.",
    ownerId: 3,
    reviewerId: 2,
    due: "2027-02-01T11:30:00Z",
    criteria: ["Approved item published"],
    deliverables: ["Artwork", "Publication proof"],
    publicationRequired: true,
  });
  publication = await setup(`/${publication.id}/actions`, {
    action: "assign",
    revision: publication.revision,
  });
  await openTask(employee, "creative-communication-associate", publication.id);
  await change(employee, () => click(employee, "Start task"));
  await employee.getByRole("tab", { name: "Requests", exact: true }).click();
  await click(employee, "Report missing input or blocker");
  await employee
    .locator("#work-note")
    .fill("Waiting for the approved publication channel.");
  await change(employee, () => click(employee, "Raise blocker"));
  await openTask(reviewer, "senior-manager", publication.id, true);
  await click(reviewer, "Resolve blocker");
  await reviewer
    .getByLabel("Decision note")
    .fill("The approved channel is now supplied.");
  await change(reviewer, () => click(reviewer, "Save decision"));
  await openTask(employee, "creative-communication-associate", publication.id);
  await change(employee, () => click(employee, "Resume work"));
  await employee.getByRole("tab", { name: "Requests", exact: true }).click();
  await click(employee, "Request more time");
  await employee.locator("#requested-due").fill("2027-02-03T17:00");
  await employee
    .locator("#work-note")
    .fill("Need additional time after the approved channel was supplied.");
  await change(employee, () => click(employee, "Request extension"));
  await openTask(reviewer, "senior-manager", publication.id, true);
  await change(reviewer, () => click(reviewer, "Approve extension"));
  await openTask(employee, "creative-communication-associate", publication.id);
  await employee
    .getByRole("tab", { name: "Files & revisions", exact: true })
    .click();
  await submit(1);
  await openTask(reviewer, "senior-manager", publication.id, true);
  assert(
    await reviewer
      .getByRole("button", { name: "Approve work", exact: true })
      .isDisabled(),
  );
  const proof = employee.locator(".request-record").filter({
    has: employee.getByRole("heading", {
      name: "Publication evidence",
      exact: true,
    }),
  });
  await proof
    .getByLabel("Publication note")
    .fill("Published through the approved channel and retained the record.");
  await change(employee, () =>
    proof.locator("input[type=file]").setInputFiles({
      name: "publication.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Publication channel and dated evidence record"),
    }),
  );
  await change(employee, () => click(employee, "Save publication evidence"));
  await openTask(reviewer, "senior-manager", publication.id, true);
  await click(reviewer, "Approve work");
  await reviewer
    .getByLabel("Decision note")
    .fill("Publication proof and the required result have been checked.");
  await reviewer.getByRole("checkbox").check();
  await change(reviewer, () => click(reviewer, "Save decision"));

  const lead = await account("manasa");
  assert.equal(
    await lead.getByRole("link", { name: "Assign work", exact: true }).count(),
    0,
  );
  const chair = await account("vijay");
  assert.equal(
    await chair.getByRole("link", { name: "Assign work", exact: true }).count(),
    0,
  );
  assert.equal(
    await chair
      .getByRole("link", { name: "Daily work report", exact: true })
      .count(),
    0,
  );
  await chair.getByRole("link", { name: "Team work", exact: true }).click();
  await chair
    .getByRole("heading", { name: "Team work", exact: true })
    .waitFor();
  await click(chair, "Table view");
  await chair
    .getByRole("cell", { name: "Sai Deepthi", exact: true })
    .first()
    .waitFor();

  await employee.setViewportSize({ width: 390, height: 844 });
  await openTask(employee, "creative-communication-associate", taskId);
  assert(
    await employee.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  );
  await employee.screenshot({
    path: "test-results/task-lifecycle/employee-mobile.png",
    fullPage: true,
  });
  for (const page of [employee, gm]) {
    await page.evaluate(() => document.documentElement.classList.add("dark"));
    for (const width of [1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      );
    }
    await page.screenshot({
      path: `test-results/task-lifecycle/${page === gm ? "manager" : "employee"}-dark-mobile.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS actual portal: manager draft/reference/assign; employee start/update/evidence; return/resubmit/approve/download; persisted report/manager inbox; Lead/Chairman permissions; mobile overflow; no page errors.",
  );
} catch (error) {
  for (let index = 0; index < pages.length; index++) {
    console.log(
      `Page ${index}:`,
      (await pages[index].locator("body").innerText()).slice(-5000),
    );
    await pages[index].screenshot({
      path: `test-results/task-lifecycle/failure-${index}.png`,
      fullPage: true,
    });
  }
  console.log("Browser errors:", errors);
  throw error;
} finally {
  for (const context of contexts) await context.close();
  await browser.close();
}
