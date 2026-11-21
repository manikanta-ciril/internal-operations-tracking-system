// Disposable actual-application browser fixture. Never connects to the live application database.
const mysql = require("mysql2/promise");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { randomUUID, randomBytes, createHash } = require("node:crypto");
const express = require("express");

(async () => {
  const database = `iots_tasks_browser_${Date.now()}`;
  const port = Number(process.env.IOTS_TASK_BROWSER_PORT || 5198);
  const storage = await fs.mkdtemp(
    path.join(os.tmpdir(), "iots-tasks-browser-"),
  );
  const dbOptions = {
    host: "127.0.0.1",
    port: Number(process.env.IOTS_TEST_DB_PORT || 3307),
    user: process.env.IOTS_TEST_ADMIN_USER || "root",
    password: process.env.IOTS_TEST_ADMIN_PASSWORD || "IotsLocalRoot!2026",
  };
  const admin = await mysql.createConnection({
    ...dbOptions,
    multipleStatements: true,
  });
  await admin.query(
    (
      await fs.readFile(path.join(__dirname, "../database/schema.sql"), "utf8")
    ).replaceAll("iots_auth_temp", database),
  );
  await require("../database/migrate-workspace")(admin);
  const accounts = [
    [
      1,
      "ipsheeta",
      "Ipsheeta Barua",
      ["general-manager", "senior-manager", "executive"],
    ],
    [2, "secondmanager", "Second Manager (test)", ["senior-manager"]],
    [3, "deepthi", "Sai Deepthi", ["creative-communication-associate"]],
    [4, "manasa", "Manasa B.", ["lead-manager"]],
    [5, "vijay", "Vijay Sarathi", ["chairman"]],
    [6, "bhavani", "Bhavani Maddela", ["business-development-executive"]],
    [7, "manikanta", "Deva Manikanta Sala", ["it-system-analyst"]],
    [8, "harshitha", "Harshitha Goud", ["coordinator", "executive"]],
  ];
  for (const [code, label] of require("../src/workspace/organisation")
    .roleDefinitions)
    await admin.execute("INSERT INTO roles(code,label) VALUES (?,?)", [
      code,
      label,
    ]);
  const sessions = {};
  for (const [id, username, name, roles] of accounts) {
    await admin.execute(
      "INSERT INTO employees(id,username,name,password_hash) VALUES (?,?,?,?)",
      [
        id,
        username,
        name,
        require("../src/auth/passwords").hash("FixtureOnly!2026"),
      ],
    );
    for (const role of roles)
      await admin.execute(
        "INSERT INTO employee_roles(employee_id,role_code) VALUES (?,?)",
        [id, role],
      );
    const token = randomBytes(32).toString("hex");
    const hash = createHash("sha256").update(token).digest("hex");
    const photo = randomUUID();
    const location = {
      status: "onsite",
      timestamp: Date.now(),
      distanceMeters: 0,
      punchInPhotoId: photo,
    };
    await admin.execute(
      "INSERT INTO sessions(token_hash,employee_id,active_role,expires_at) VALUES (?,?,?,NOW()+INTERVAL 8 HOUR)",
      [hash, id, roles[0]],
    );
    await admin.execute(
      "INSERT INTO session_locations(token_hash,stage,location_json) VALUES (?,?,?)",
      [hash, "active", JSON.stringify(location)],
    );
    await admin.execute(
      "INSERT INTO photo_evidence(id,employee_id,session_hash,storage_path,file_size,sha256,captured_at) VALUES (?,?,?,?,?,?,NOW())",
      [
        photo,
        id,
        hash,
        "test-fixture-only-not-a-real-photo.jpg",
        0,
        "0".repeat(64),
      ],
    );
    await admin.execute(
      "INSERT INTO photo_evidence_details(photo_id,details) VALUES (?,?)",
      [photo, JSON.stringify({ location })],
    );
    sessions[username] = {
      id,
      cookie: {
        name: "iots_session",
        value: token,
        url: `http://127.0.0.1:${port}/api`,
        httpOnly: true,
        sameSite: "Strict",
      },
    };
  }
  Object.assign(process.env, {
    DB_HOST: dbOptions.host,
    DB_PORT: String(dbOptions.port),
    DB_USER: dbOptions.user,
    DB_PASSWORD: dbOptions.password,
    DB_NAME: database,
    IOTS_TASK_ROOT: storage,
    IOTS_CHAT_ROOT: path.join(storage, "chat"),
    IOTS_EVIDENCE_ROOT: path.join(storage, "photos"),
    IOTS_ALLOWED_ORIGINS: `http://127.0.0.1:${port},http://localhost:${port}`,
  });
  const app = require("../src/app");
  const dist = path.resolve(__dirname, "../../frontend/dist");
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (req, res) =>
    res.sendFile(path.join(dist, "index.html")),
  );
  const server = app.listen(port, "127.0.0.1", async () => {
    const info = { base: `http://127.0.0.1:${port}`, database, sessions };
    await fs.writeFile(
      path.join(storage, "browser-fixture.json"),
      JSON.stringify(info, null, 2),
    );
    console.log(
      `TASK_BROWSER_FIXTURE ${JSON.stringify({ base: info.base, database, credentialsFile: path.join(storage, "browser-fixture.json") })}`,
    );
  });
  const io = require("../src/messaging/socket")(
    server,
    app,
    require("../src/database/connection"),
  );
  let closing = false;
  const close = async () => {
    if (closing) return;
    closing = true;
    io.close();
    await new Promise((resolve) => server.close(resolve));
    await require("../src/database/connection").end();
    if (!/^iots_tasks_browser_\d+$/.test(database))
      throw new Error("Refusing unsafe fixture cleanup");
    await admin.query(`DROP DATABASE ${database}`);
    await admin.end();
    await fs.rm(storage, { recursive: true, force: true });
    process.exit(0);
  };
  process.on("SIGINT", close);
  process.on("SIGTERM", close);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
