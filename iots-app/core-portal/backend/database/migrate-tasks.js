const fs = require("node:fs");
const path = require("node:path");
async function migrateTasks(connection) {
  const schema = fs.readFileSync(
    path.join(__dirname, "tasks-schema.sql"),
    "utf8",
  );
  for (const statement of schema
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean))
    await connection.query(statement);
}
module.exports = migrateTasks;
if (require.main === module) {
  const pool = require("../src/database/connection");
  migrateTasks(pool)
    .then(() =>
      console.log(
        "Task tables ready. Existing accounts, attendance and task records were preserved.",
      ),
    )
    .catch((error) => {
      console.error("Task migration failed:", error.code || error.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
