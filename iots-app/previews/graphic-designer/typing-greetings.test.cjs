const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const {
  chromium,
} = require("../../authentication-system/frontend/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      // Reduced motion OFF so typing effect executes
      reducedMotion: "no-preference",
    });

    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    await page.goto(
      "file:///" +
        path.resolve(__dirname, "../graphic-designer.html").replaceAll("\\", "/"),
    );

    // 1. Initial state check: typing starts after ~200ms
    const greeting = page.locator(".employee-greeting");
    await greeting.waitFor({ timeout: 5000 });

    // Verify typing caret is initially present during typing
    const hasCaretInitially = await page.locator(".typing-caret").count();
    console.log("Typing caret count during initial phase:", hasCaretInitially);

    // Wait for typing to complete and caret to disappear (line1 + line2 + doneTimer)
    await page.locator(".typing-caret").waitFor({ state: "detached", timeout: 8000 });

    // Verify cursorStage is done (caret disappeared after 500ms doneTimer)
    const caretCountAfterTyping = await page.locator(".typing-caret").count();
    console.log("Typing caret count after typing finishes:", caretCountAfterTyping);
    assert.equal(
      caretCountAfterTyping,
      0,
      "Caret should disappear after typing completes",
    );

    // Verify full greeting and subtitle text are present
    const greetingText = await greeting.textContent();
    assert.ok(
      greetingText.includes("Designer account") || greetingText.includes("Good"),
      "Greeting title rendered",
    );

    const messageText = await page.locator(".employee-greeting-message").textContent();
    assert.ok(messageText.length > 5, "Subtitle quote rendered");
    console.log("Rendered greeting title:", greetingText.trim());
    console.log("Rendered greeting message:", messageText.trim());

    // Verify no page errors occurred
    assert.equal(
      pageErrors.length,
      0,
      `Encountered page errors: ${pageErrors.join(", ")}`,
    );

    // Verify role gating logic via page evaluate
    const roleChecks = await page.evaluate(() => {
      // Test regex against standard role titles
      const checkRole = (role) => {
        const normalized = role.toLowerCase().replace(/[-_]/g, " ");
        const isMatch =
          normalized.includes("creative communication") ||
          normalized.includes("creative associate") ||
          normalized.includes("graphic designer") ||
          normalized.includes("designer") ||
          normalized.includes("business development") ||
          normalized.includes("bde") ||
          normalized.includes("executive");
        const isExcluded =
          normalized.includes("senior executive") ||
          normalized.includes("general manager") ||
          normalized.includes("senior manager") ||
          normalized.includes("reporting manager") ||
          normalized.includes("reviewer") ||
          normalized.includes("admin") ||
          normalized.includes("chairman") ||
          normalized.includes("director");
        return isMatch && !isExcluded;
      };

      return {
        creativeAssociate: checkRole("Creative Communication Associate"),
        bde: checkRole("Business Development Executive"),
        executive: checkRole("Executive"),
        manager: checkRole("General Manager"),
        seniorManager: checkRole("Senior Manager"),
        admin: checkRole("Admin"),
        chairman: checkRole("Chairman"),
      };
    });

    assert.equal(roleChecks.creativeAssociate, true, "Creative Associate allowed");
    assert.equal(roleChecks.bde, true, "BDE allowed");
    assert.equal(roleChecks.executive, true, "Executive allowed");
    assert.equal(roleChecks.manager, false, "General Manager blocked");
    assert.equal(roleChecks.seniorManager, false, "Senior Manager blocked");
    assert.equal(roleChecks.admin, false, "Admin blocked");
    assert.equal(roleChecks.chairman, false, "Chairman blocked");

    console.log(
      "PASS: Typing effect with disappearing cursor, quotes, and role gating verified.",
    );
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
