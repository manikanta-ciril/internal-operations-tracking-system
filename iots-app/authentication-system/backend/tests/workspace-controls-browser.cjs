const assert = require("node:assert/strict");
const { chromium } = require("../../frontend/node_modules/playwright");
const path = require("node:path");
module.exports = async ({ base, cookie, call }) => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const origin = "http://localhost:5174";
  const screenshots = path.resolve(__dirname, "../../../../.local");
  const errors = [];
  async function context() {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
      permissions: ["geolocation"],
      geolocation: { latitude: 17.45, longitude: 78.45, accuracy: 1 },
    });
    await ctx.route("**/api/auth/**", async (route) => {
      const url = new URL(route.request().url());
      const response = await route.fetch({
        url: base + url.pathname.slice("/api/auth/".length),
      });
      await route.fulfill({ response });
    });
    return ctx;
  }
  try {
    const ctx = await context();
    const [name, value] = cookie.split("=");
    await ctx.addCookies([{ name, value, url: origin }]);
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(origin + "/dashboard/it-system-analyst");
    await page.getByRole("button", { name: "Open profile menu" }).waitFor();
    await page
      .getByLabel("Office clock")
      .getByText(/left|Weekly off/)
      .waitFor();
    assert.equal(
      await page.locator(".employee-tools .employee-name").count(),
      0,
    );
    assert.ok((await page.locator(".workspace-header").boundingBox()).y < 50);
    assert.equal(await page.locator(".profile-trigger .avatar svg").count(), 1);
    await page.getByRole("button", { name: /Notifications, / }).hover();
    await page
      .getByRole("dialog", { name: "Notifications", exact: true })
      .waitFor();
    assert.ok(
      await page
        .getByRole("link", { name: "View all notifications" })
        .isVisible(),
    );
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Open profile menu" }).click();
    const menu = page.getByRole("dialog", { name: "Profile menu" });
    assert.equal(
      await menu.getByRole("link", { name: "Tasks", exact: true }).count(),
      0,
    );
    assert.equal(
      await menu
        .getByRole("link", { name: "Preferences", exact: true })
        .count(),
      0,
    );
    await menu.getByRole("link", { name: "Profile", exact: true }).click();
    await page
      .getByRole("grid", { name: "Office attendance activity calendar" })
      .waitFor();
    const day = page.locator(
      '.attendance-activity-grid a[data-attendance-date][tabindex="0"]',
    );
    await day.focus();
    await page.keyboard.press("ArrowLeft");
    assert.ok(
      await page
        .locator(".attendance-activity-grid a[data-attendance-date]:focus")
        .count(),
    );
    await page.screenshot({
      path: path.join(screenshots, "account-controls-profile-light.png"),
      fullPage: true,
    });
    await page.getByRole("tab", { name: "Security & sessions" }).click();
    await page
      .getByLabel("Current password", { exact: true })
      .fill("A longer test password!");
    await page
      .getByLabel("New password", { exact: true })
      .fill("Another long passphrase!");
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill("mismatch password");
    await page.getByRole("button", { name: "Update password" }).click();
    await page.getByText("New passwords do not match.").waitFor();
    await page
      .getByLabel("Confirm new password", { exact: true })
      .fill("Another long passphrase!");
    await page.getByRole("button", { name: "Update password" }).click();
    await page
      .getByText("Password updated. Other sessions have been signed out.")
      .waitFor();
    assert.equal(
      await page.getByLabel("Current password", { exact: true }).inputValue(),
      "",
    );
    await page.getByRole("button", { name: "Open profile menu" }).click();
    await menu.getByRole("button", { name: "Switch to dark mode" }).click();
    await page.keyboard.press("Escape");
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({
      path: path.join(screenshots, "account-controls-mobile-dark.png"),
      fullPage: true,
    });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.setViewportSize({ width: 1440, height: 900 });
    await page
      .getByRole("link", { name: "Dashboard", exact: true })
      .first()
      .click();
    await page.screenshot({
      path: path.join(screenshots, "account-controls-dashboard-dark.png"),
      fullPage: true,
    });
    const incoming = await context();
    const signIn = await incoming.newPage();
    signIn.on("pageerror", (e) => errors.push(e.message));
    await signIn.goto(origin);
    await signIn
      .getByRole("button", { name: "Sign in", exact: true })
      .waitFor();
    async function credentials() {
      await signIn
        .getByLabel("Username or email", { exact: true })
        .fill("kanna");
      await signIn
        .getByLabel("Password", { exact: true })
        .fill("Another long passphrase!");
      await signIn
        .getByRole("button", { name: "Sign in", exact: true })
        .click();
      await signIn
        .getByRole("heading", { name: "Already signed in" })
        .waitFor();
    }
    await credentials();
    await signIn
      .getByRole("button", { name: "Cancel sign-in", exact: true })
      .click();
    await signIn
      .getByRole("button", { name: "Sign in", exact: true })
      .waitFor();
    assert.equal((await call("me", cookie)).status, 200);
    // A different account with no completed workday must still be blocked off-site.
    await signIn.getByLabel("Username or email", { exact: true }).fill("admin");
    await signIn.getByLabel("Password", { exact: true }).fill("Iots@123");
    await signIn.getByRole("button", { name: "Sign in", exact: true }).click();
    await signIn.getByText(/Off-site sign-in is not allowed/).waitFor();
    await signIn
      .getByRole("button", { name: "Sign in", exact: true })
      .waitFor();
    assert.equal(
      await signIn
        .getByRole("button", { name: "Continue sign-in", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await signIn.getByRole("button", { name: "Open profile menu" }).count(),
      0,
    );
    assert.match(
      await signIn.getByText(/Off-site sign-in is not allowed/).innerText(),
      /KM/,
    );
    assert.equal((await call("me", cookie)).status, 200);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: local popover/tooltip/calendar, fallback avatar, header placement, notification hover, password form, responsive themes, takeover cancellation, hours remaining, removed name and off-site login rejection.",
    );
  } finally {
    await browser.close();
  }
};
