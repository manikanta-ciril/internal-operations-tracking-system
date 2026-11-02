const fs = require("node:fs");
const path = require("node:path");

module.exports = async function migrateWorkspace(connection) {
  const [columns] = await connection.execute(
    "SHOW COLUMNS FROM employees LIKE 'gender'",
  );
  if (!columns.length)
    await connection.execute(
      "ALTER TABLE employees ADD COLUMN gender ENUM('female','male','unspecified') NOT NULL DEFAULT 'unspecified'",
    );
  await connection.execute(
    "UPDATE employees SET gender='female' WHERE username IN ('ipsheeta','manasa','bhavani','harshitha','deepthi') AND gender='unspecified'",
  );
  await connection.execute(
    "UPDATE employees SET gender='male' WHERE username IN ('vijay','kanna','manikanta') AND gender='unspecified'",
  );
  const schema = fs.readFileSync(
    path.join(__dirname, "messaging-schema.sql"),
    "utf8",
  );
  for (const statement of schema
    .split(";")
    .map((value) => value.trim())
    .filter(Boolean))
    await connection.query(statement);
  const [messageColumns] = await connection.execute(
    "SHOW COLUMNS FROM chat_messages",
  );
  if (!messageColumns.some((column) => column.Field === "content"))
    await connection.execute(
      "ALTER TABLE chat_messages ADD COLUMN content JSON NULL",
    );
  if (!messageColumns.some((column) => column.Field === "reply_to"))
    await connection.execute(
      "ALTER TABLE chat_messages ADD COLUMN reply_to BIGINT NULL",
    );
  const [attachmentColumns] = await connection.execute(
    "SHOW COLUMNS FROM chat_attachments LIKE 'media_type'",
  );
  if (!attachmentColumns.length)
    await connection.execute(
      "ALTER TABLE chat_attachments ADD COLUMN media_type VARCHAR(60) NULL",
    );
};
