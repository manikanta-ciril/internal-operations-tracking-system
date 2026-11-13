import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";
const require = createRequire(
  new URL("../../backend/package.json", import.meta.url),
);
const mysql = require("mysql2/promise");
const fixture = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
assert.match(fixture.database, /^iots_tasks_browser_\d+$/);
const db = await mysql.createConnection({
  host: "127.0.0.1",
  port: Number(process.env.IOTS_TEST_DB_PORT || 3307),
  user: process.env.IOTS_TEST_ADMIN_USER || "root",
  password: process.env.IOTS_TEST_ADMIN_PASSWORD || "IotsLocalRoot!2026",
  database: fixture.database,
});
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  const context = await browser.newContext();
  await context.addCookies([fixture.sessions.harshitha.cookie]);
  const page = await context.newPage();
  await page.goto(fixture.base);
  await page
    .getByRole("link", { name: "My tasks / briefs", exact: true })
    .waitFor();
  assert.equal(
    await page.getByRole("link", { name: "Assign work", exact: true }).count(),
    0,
  );
  await db.execute(
    "INSERT INTO employee_roles(employee_id,role_code) VALUES (?,?)",
    [fixture.sessions.harshitha.id, "senior-manager"],
  );
  await page.waitForTimeout(5200);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.getByRole("link", { name: "Assign work", exact: true }).waitFor();
  assert.equal(
    await page
      .getByRole("link", { name: "My tasks / briefs", exact: true })
      .count(),
    1,
  );
  assert.equal(await page.getByLabel("Switch workspace").count(), 0);
  await db.execute(
    "DELETE FROM employee_roles WHERE employee_id=? AND role_code=?",
    [fixture.sessions.harshitha.id, "senior-manager"],
  );
  await page.waitForTimeout(5200);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page
    .getByRole("link", { name: "Assign work", exact: true })
    .waitFor({ state: "detached" });
  console.log(
    "PASS: executive + coordinator gains and loses senior-manager navigation without re-authentication or duplicate common links.",
  );
} finally {
  await db.execute(
    "DELETE FROM employee_roles WHERE employee_id=? AND role_code=?",
    [fixture.sessions.harshitha.id, "senior-manager"],
  );
  await db.end();
  await browser.close();
}
