const { transaction, requireMember, participants } = require("./repository");
const { messageNumber } = require("./content");
const { fail } = require("./policy");
async function withMessage(pool, session, messageId, update) {
  messageNumber(messageId);
  return transaction(pool, async (connection) => {
    const [[message]] = await connection.execute(
      "SELECT * FROM chat_messages WHERE id=? FOR UPDATE",
      [messageId],
    );
    if (!message) throw fail(404, "Message not found.");
    await requireMember(
      connection,
      message.conversation_id,
      session.employee_id,
    );
    await update(connection, message);
    return {
      conversationId: message.conversation_id,
      members: await participants(connection, message.conversation_id),
    };
  });
}
async function vote(pool, session, request) {
  return withMessage(
    pool,
    session,
    request.messageId,
    async (connection, message) => {
      const content = message.content;
      if (content?.type !== "poll")
        throw fail(400, "This message is not a poll.");
      const selections = request.options;
      if (
        !Array.isArray(selections) ||
        selections.length > (content.multiple ? content.options.length : 1) ||
        new Set(selections).size !== selections.length ||
        selections.some(
          (index) =>
            !Number.isInteger(index) ||
            index < 0 ||
            index >= content.options.length,
        )
      )
        throw fail(400, "Choose valid poll options.");
      await connection.execute(
        "DELETE FROM chat_votes WHERE message_id=? AND employee_id=?",
        [message.id, session.employee_id],
      );
      for (const index of selections)
        await connection.execute(
          "INSERT INTO chat_votes (message_id,employee_id,option_index) VALUES (?,?,?)",
          [message.id, session.employee_id, index],
        );
    },
  );
}
async function checkItem(pool, session, request) {
  return withMessage(
    pool,
    session,
    request.messageId,
    async (connection, message) => {
      if (message.content?.type !== "checklist")
        throw fail(400, "This message is not a checklist.");
      if (
        !Number.isInteger(request.index) ||
        request.index < 0 ||
        request.index >= message.content.items.length ||
        typeof request.checked !== "boolean"
      )
        throw fail(400, "Choose a valid checklist item.");
      await connection.execute(
        "INSERT INTO chat_checks (message_id,item_index,checked,checked_by) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE checked=VALUES(checked),checked_by=VALUES(checked_by),updated_at=NOW(3)",
        [message.id, request.index, request.checked, session.employee_id],
      );
    },
  );
}
module.exports = { vote, checkItem };
