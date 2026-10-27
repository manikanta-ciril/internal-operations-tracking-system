const assert = require("node:assert/strict");
const sharp = require("sharp");
const pool = require("../src/database/connection");
const { hash } = require("../src/auth/passwords");
const { workday, deviceLabel } = require("../src/auth/workday");
const office = require("../src/location/office-location.json");
if (
  process.env.DB_NAME !== "iots_auth_fix_test" ||
  !process.env.IOTS_TEST_BASE_URL
)
  throw Error("Use isolated suite.");
const base = process.env.IOTS_TEST_BASE_URL;
async function call(route, cookie, body) {
  const response = await fetch(base + route, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Cookie: cookie || "",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0) Chrome/130.0",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: response.status,
    data: await response.json(),
    cookie: response.headers.get("set-cookie")?.split(";")[0],
  };
}
(async () => {
  assert.equal(workday(new Date("2026-10-23T20:00:00Z")).date, "2026-10-24");
  assert.equal(workday(new Date("2026-10-24T06:00:00Z")).closing, "16:00");
  assert.equal(workday(new Date("2026-10-26T06:00:00Z")).closing, "18:00");
  assert.equal(workday(new Date("2026-10-25T06:00:00Z")).opening, null);
  assert.equal(
    deviceLabel("Mozilla Windows Chrome/1 Edg/2"),
    "Edge on Windows",
  );
  const image = await sharp({
    create: { width: 320, height: 240, channels: 3, background: "#c09860" },
  })
    .jpeg()
    .toBuffer();
  const login = (password = "Iots@123") =>
    call("login", null, { username: "kanna", password });
  const position = (offsite) => ({
    latitude: office.latitude + (offsite ? 0.01 : 0),
    longitude: office.longitude,
    timestamp: Date.now(),
  });
  async function capture(cookie, route, location) {
    const response = await fetch(base + route, {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "image/jpeg",
        "X-Captured-At": String(Date.now()),
        "X-Location-Check": location.checkId,
      },
      body: image,
    });
    assert.equal(response.status, 200, await response.text());
  }
  async function activate(cookie) {
    const result = await call("location", cookie, {
      position: position(false),
    });
    assert.equal(result.status, 200);
    assert.equal(result.data.requiresPhoto, true);
    await capture(cookie, "photo", result.data.location);
  }
  async function checkout(cookie) {
    const result = await call("checkout/location", cookie, {
      position: position(false),
    });
    assert.equal(result.status, 200);
    await capture(cookie, "checkout/photo", result.data.location);
  }
  const first = await login();
  assert.equal(first.status, 200);
  await activate(first.cookie);
  const wrong = await login("wrong");
  assert.equal(wrong.status, 401);
  assert.equal(wrong.data.devices, undefined);
  const conflict = await login();
  assert.ok(conflict.data.requiresSessionChoice);
  assert.equal(conflict.data.devices[0].device, "Chrome on Windows");
  assert.equal(conflict.cookie, undefined);
  assert.equal(
    (
      await call("session-choice", null, {
        challenge: conflict.data.challenge,
        proceed: false,
      })
    ).status,
    200,
  );
  assert.equal((await call("me", first.cookie)).status, 200);
  assert.equal(
    (
      await call("session-choice", null, {
        challenge: conflict.data.challenge,
        proceed: true,
      })
    ).status,
    401,
  );
  const replacement = await login();
  const attempts = await Promise.all(
    [true, true].map((proceed) =>
      call("session-choice", null, {
        challenge: replacement.data.challenge,
        proceed,
      }),
    ),
  );
  assert.equal(attempts.filter((r) => r.status === 200).length, 1);
  const second = attempts.find((r) => r.status === 200);
  assert.equal((await call("me", first.cookie)).status, 401);
  assert.equal((await call("me", second.cookie)).status, 403);
  await activate(second.cookie);
  assert.equal(
    (
      await call("workspace/password", second.cookie, {
        currentPassword: "wrong",
        newPassword: "A longer test password!",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await call("workspace/password", second.cookie, {
        currentPassword: "Iots@123",
        newPassword: "short",
      })
    ).status,
    400,
  );
  const staleChallenge = await login();
  assert.equal(
    (
      await call("workspace/password", second.cookie, {
        currentPassword: "Iots@123",
        newPassword: "A longer test password!",
      })
    ).status,
    200,
  );
  assert.equal((await login()).status, 401);
  assert.equal(
    (
      await call("session-choice", null, {
        challenge: staleChallenge.data.challenge,
        proceed: true,
      })
    ).status,
    401,
  );
  const notice = await call("workspace/notifications", second.cookie);
  assert.ok(notice.data.unread >= 2);
  assert.ok(
    notice.data.notifications.some((n) => n.title === "Password updated"),
  );
  await call("workspace/notifications/read", second.cookie, {
    ids: notice.data.notifications.map((n) => n.id),
  });
  assert.equal(
    (await call("workspace/notifications", second.cookie)).data.unread,
    0,
  );
  await require("./workspace-controls-browser.cjs")({
    base,
    cookie: second.cookie,
    call,
  });
  const dayChallenge = await login("Another long passphrase!");
  assert.ok(dayChallenge.data.requiresSessionChoice);
  await checkout(second.cookie);
  const third = await login("Another long passphrase!");
  assert.equal(third.status, 403);
  assert.match(third.data.message, /already punched out today/);
  assert.equal(third.cookie, undefined);
  assert.equal((await login("wrong")).status, 401);
  const challengeResult = await call("session-choice", null, {
    challenge: dayChallenge.data.challenge,
    proceed: true,
  });
  assert.equal(challengeResult.status, 403);
  assert.match(challengeResult.data.message, /regardless of location/);
  // Next-day fixture: sign-in becomes eligible again, but off-site remains blocked.
  await pool.execute(
    "UPDATE checkout_evidence SET checked_out_at=NOW()-INTERVAL 1 DAY WHERE employee_id=(SELECT id FROM employees WHERE username=?)",
    ["kanna"],
  );
  const next = await login("Another long passphrase!");
  assert.equal(next.status, 200);
  const rejected = await call("location", next.cookie, {
    position: position(true),
  });
  assert.equal(rejected.status, 403);
  assert.match(rejected.data.message, /Off-site sign-in is not allowed/);
  assert.equal((await call("me", next.cookie)).status, 401);
  assert.equal(
    (
      await call("location/confirm", next.cookie, {
        proceed: true,
        checkId: "forged",
      })
    ).status,
    401,
  );
  const officeAgain = await login("Another long passphrase!");
  assert.equal(officeAgain.status, 200);
  await activate(officeAgain.cookie);
  // Legacy WFH cookies are rejected even if they were activated under the old policy.
  const { randomBytes, createHash } = require("node:crypto");
  const token = randomBytes(32).toString("hex"),
    sessionHash = createHash("sha256").update(token).digest("hex");
  const [[admin]] = await pool.execute(
    "SELECT id FROM employees WHERE username=?",
    ["admin"],
  );
  await pool.execute(
    "INSERT INTO sessions (token_hash,employee_id,active_role,expires_at) VALUES (?,?,?,?)",
    [sessionHash, admin.id, "admin", new Date(Date.now() + 3600000)],
  );
  await pool.execute(
    "INSERT INTO session_locations (token_hash,stage,location_json) VALUES (?,?,?)",
    [
      sessionHash,
      "active",
      JSON.stringify({ status: "offsite", distanceMeters: 1200 }),
    ],
  );
  await pool.execute(
    "INSERT INTO remote_work_sessions (session_hash,employee_id,expires_at) VALUES (?,?,?)",
    [sessionHash, admin.id, new Date(Date.now() + 3600000)],
  );
  const legacy = await call("me", `iots_session=${token}`);
  assert.equal(legacy.status, 403);
  assert.match(legacy.data.message, /Off-site sign-in is not allowed/);
  assert.equal((await call("workspace", `iots_session=${token}`)).status, 401);
  const [[remote]] = await pool.execute(
    "SELECT ended_at FROM remote_work_sessions WHERE session_hash=?",
    [sessionHash],
  );
  assert.ok(remote.ended_at);
  console.log(
    "PASS: IST schedule, device detection, takeover cancel/replay/concurrency, password checks, notification reads, global same-day punch-out lock, next-day eligibility, off-site denial and legacy session revocation.",
  );
})()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.execute(
      "UPDATE employees SET password_hash=? WHERE username=?",
      [hash("Iots@123"), "kanna"],
    );
    await pool.end();
  });
