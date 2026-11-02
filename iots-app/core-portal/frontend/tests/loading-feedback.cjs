const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const path = require("node:path");
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => (resolve = done));
  return { promise, resolve };
};
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const errors = [];
  try {
    for (const reduced of ["no-preference", "reduce"]) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        reducedMotion: reduced,
        permissions: ["geolocation"],
        geolocation: { latitude: 17.4303611, longitude: 78.4566389 },
      });
      let pending = null,
        fail = false,
        role = "it-system-analyst";
      let notifications = [
        {
          id: 1,
          title: "Account update",
          message: "A real account event fixture",
          createdAt: new Date().toISOString(),
          readAt: null,
        },
      ];
      const user = () => ({
        id: 1,
        name: "Kanna Praneeth Thogati",
        username: "kanna",
        email: "kanna@ciril.in",
        activeRole: role,
        roles: [
          { code: "it-system-analyst", label: "IT System Analyst" },
          { code: "admin", label: "Admin" },
        ],
        location: { status: "onsite", distanceMeters: 0 },
      });
      const snapshot = {
        settings: {
          profile: { preferred: "Kanna", phone: "", personal: "" },
          availability: { status: "Available", message: "", returnAt: "" },
          preferences: {
            "Task updates": true,
            "Deadline reminders": true,
            "Request decisions": true,
            "Company announcements": true,
            "Email summaries": false,
            "Security notices": true,
          },
        },
        avatarVersion: null,
        punches: [],
        sessions: [],
        activity: [],
        policy: {
          workingDays: [1, 2, 3, 4, 5, 6],
          statuses: ["Available", "Busy"],
        },
      };
      await context.route("**/api/auth/**", async (route) => {
        const request = route.request(),
          p = new URL(request.url()).pathname;
        if (p.endsWith("/messaging")) return route.fulfill({ json: { employees: [], conversations: [], permissions: {} } });
        if (request.method() === "POST" && pending) {
          pending.seen.resolve();
          await pending.release.promise;
          pending = null;
        }
        if (p.endsWith("/me")) return route.fulfill({ json: { user: user() } });
        if (p.endsWith("/time"))
          return route.fulfill({
            json: {
              serverTime: new Date().toISOString(),
              date: "2026-10-26",
              elapsedSeconds: 0,
              targetSeconds: 30600,
              opening: "09:30",
              closing: "18:00",
            },
          });
        if (p.endsWith("/notifications/read")) {
          notifications = notifications.map((n) => ({
            ...n,
            readAt: new Date().toISOString(),
          }));
          return route.fulfill({ json: { saved: true } });
        }
        if (p.endsWith("/notifications"))
          return route.fulfill({
            json: {
              notifications,
              unread: notifications.filter((n) => !n.readAt).length,
            },
          });
        if (p.includes("/settings/"))
          return route.fulfill(
            fail
              ? { status: 400, json: { message: "Save failed. Try again." } }
              : { json: { value: request.postDataJSON() } },
          );
        if (p.endsWith("/role")) {
          role = request.postDataJSON().role;
          return route.fulfill({ json: { user: user() } });
        }
        if (p.endsWith("/checkout/location"))
          return route.fulfill({
            json: {
              requiresPhoto: true,
              location: {
                status: "onsite",
                radiusMeters: 75,
                latitude: 17.4303611,
                longitude: 78.4566389,
                checkId: "test-check",
                captureAfter: Date.now(),
              },
            },
          });
        if (p.endsWith("/logout"))
          return route.fulfill({ json: { loggedOut: true } });
        return route.fulfill({ json: snapshot });
      });
      const page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(
        "http://localhost:5174/dashboard/it-system-analyst/profile",
      );
      await page
        .getByRole("button", { name: "Edit profile", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Edit profile", exact: true })
        .click();
      const dialog = page.getByRole("dialog", { name: "Edit profile" });
      await dialog
        .getByLabel("Preferred name", { exact: true })
        .fill("Updated name");
      pending = { seen: deferred(), release: deferred() };
      const saving = pending;
      await dialog
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await saving.seen.promise;
      await dialog.locator("button[aria-busy=true]").waitFor();
      assert.ok(
        await dialog.getByRole("button", { name: "Close dialog" }).isDisabled(),
      );
      await page.locator(".action-progress.is-pending").waitFor();
      if (reduced === "no-preference")
        await page.screenshot({
          path: path.resolve(
            __dirname,
            "../../../../.local/action-loading-desktop.png",
          ),
        });
      saving.release.resolve();
      await dialog.waitFor({ state: "hidden" });
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await page
        .getByRole("button", { name: "Edit profile", exact: true })
        .click();
      pending = { seen: deferred(), release: deferred() };
      const failed = pending;
      fail = true;
      await dialog
        .getByRole("button", { name: "Save changes", exact: true })
        .click();
      await failed.seen.promise;
      failed.release.resolve();
      await dialog.getByText("Save failed. Try again.").waitFor();
      assert.ok(
        await dialog
          .getByRole("button", { name: "Save changes", exact: true })
          .isEnabled(),
      );
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await dialog.getByRole("button", { name: "Close dialog" }).click();
      fail = false;
      await page.getByRole("tab", { name: "Security & sessions" }).click();
      await page
        .getByLabel("Current password", { exact: true })
        .fill("Retain this draft");
      await page.getByRole("tab", { name: "Preferences", exact: true }).click();
      await page.getByRole("tab", { name: "Security & sessions" }).click();
      assert.equal(
        await page.getByLabel("Current password", { exact: true }).inputValue(),
        "Retain this draft",
      );
      await page.goBack();
      await page
        .getByRole("tab", { name: "Preferences", exact: true, selected: true })
        .waitFor();
      await page.goForward();
      await page
        .getByRole("tab", { name: "Security & sessions", selected: true })
        .waitFor();
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Open profile menu" }).click();
      await page
        .getByRole("dialog", { name: "Profile menu" })
        .getByRole("link", { name: "Dashboard", exact: true })
        .click();
      await page.getByLabel("Search tasks", { exact: true }).waitFor();
      assert.ok(page.url().endsWith("it-system-analyst/tasks"));
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await page.getByRole("button", { name: /Notifications, / }).click();
      await page.getByRole("link", { name: "View all notifications" }).click();
      await page
        .getByRole("heading", { name: "Notifications", exact: true })
        .waitFor();
      pending = { seen: deferred(), release: deferred() };
      const read = pending;
      await page
        .getByRole("button", { name: "Mark all shown as read" })
        .click();
      await read.seen.promise;
      assert.ok(
        await page
          .getByRole("button", { name: "Mark all shown as read" })
          .isDisabled(),
      );
      await page.locator(".action-progress.is-pending").waitFor();
      read.release.resolve();
      await page
        .getByRole("button", { name: "Mark all shown as read" })
        .waitFor();
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      pending = { seen: deferred(), release: deferred() };
      const switching = pending;
      await page.getByLabel("Switch workspace").selectOption("admin");
      await switching.seen.promise;
      assert.ok(await page.getByLabel("Switch workspace").isDisabled());
      await page.locator(".role-switch .feedback-spinner").waitFor();
      switching.release.resolve();
      await page.waitForURL("**/dashboard/admin");
      await page.getByRole("heading", { name: "Tasks", exact: true }).waitFor();
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await page.setViewportSize({ width: 375, height: 812 });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      pending = { seen: deferred(), release: deferred() };
      const logout = pending;
      await page.getByRole("button", { name: "Open profile menu" }).click();
      await page.getByRole("button", { name: "Log out", exact: true }).click();
      await page.getByRole("button", { name: "Punch out and log out", exact: false }).click();
      await page
        .getByRole("heading", { name: "Punch out", exact: true })
        .waitFor();
      await logout.seen.promise;
      await page.locator(".checkout-flow .feedback-spinner").waitFor();
      await page.locator(".action-progress.is-pending").waitFor();
      logout.release.resolve();
      await page
        .getByRole("button", { name: "Allow camera", exact: true })
        .waitFor();
      await page
        .getByRole("button", { name: "Cancel punch-out", exact: true })
        .click();
      await page.getByRole("heading", { name: "Tasks", exact: true }).waitFor();
      await page
        .locator(".action-progress.is-pending")
        .waitFor({ state: "hidden" });
      await context.close();
      console.log(
        `PASS: ${reduced} loading feedback, failed save recovery, retained form drafts, Back/Forward, inline notification/role/logout states and mobile width.`,
      );
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
