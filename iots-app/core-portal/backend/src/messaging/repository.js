const { randomUUID } = require("node:crypto");
const { isDeepStrictEqual } = require("node:util");
const { canCreateGroup, identifier, messageInput, fail } = require("./policy");

async function transaction(pool, work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
async function requireMember(database, conversationId, employeeId) {
  identifier(conversationId);
  const [[member]] = await database.execute(
    "SELECT employee_id FROM chat_members WHERE conversation_id=? AND employee_id=?",
    [conversationId, employeeId],
  );
  if (!member)
    throw fail(403, "This conversation is not available to your account.");
}
async function participants(database, conversationId) {
  const [members] = await database.execute(
    "SELECT employee_id FROM chat_members WHERE conversation_id=?",
    [conversationId],
  );
  return members.map((member) => member.employee_id);
}
async function listConversations(pool, employeeId) {
  const [rows] = await pool.execute(
    `SELECT c.id,c.kind,c.title,c.created_at AS createdAt,
    (SELECT e.name FROM chat_members other JOIN employees e ON e.id=other.employee_id WHERE other.conversation_id=c.id AND other.employee_id<>? LIMIT 1) AS peerName,
    (SELECT employee_id FROM chat_members WHERE conversation_id=c.id AND employee_id<>? LIMIT 1) AS peerId,
    (SELECT LEFT(COALESCE(NULLIF(body,''),JSON_UNQUOTE(JSON_EXTRACT(content,'$.question')),JSON_UNQUOTE(JSON_EXTRACT(content,'$.title')),'File attachment'),160) FROM chat_messages WHERE conversation_id=c.id ORDER BY id DESC LIMIT 1) AS preview,
    COALESCE((SELECT MAX(created_at) FROM chat_messages WHERE conversation_id=c.id),c.created_at) AS updatedAt,
    (SELECT COUNT(*) FROM chat_messages WHERE conversation_id=c.id AND id>m.last_read_id AND sender_id<>?) AS unread,
    (SELECT COUNT(*) FROM chat_members WHERE conversation_id=c.id) AS memberCount
    FROM chat_members m JOIN chat_conversations c ON c.id=m.conversation_id WHERE m.employee_id=? ORDER BY updatedAt DESC,c.id`,
    [employeeId, employeeId, employeeId, employeeId],
  );
  return rows.map((row) => ({
    ...row,
    title: row.kind === "direct" ? row.peerName : row.title,
  }));
}
async function createConversation(pool, session, input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw fail(400, "Choose a valid conversation.");
  const kind = input.kind;
  if (!["direct", "group", "channel"].includes(kind))
    throw fail(400, "Choose a direct message or group.");
  if (kind !== "direct" && !canCreateGroup(session.active_role))
    throw fail(403, "Your role cannot create groups or channels.");
  if (kind === "channel")
    throw fail(403, "Channel creation is not enabled yet.");
  if (
    !Array.isArray(input.members) ||
    input.members.length > 50 ||
    input.members.some((id) => !Number.isSafeInteger(id) || id < 1)
  )
    throw fail(400, "Choose valid employees.");
  const members = [...new Set([session.employee_id, ...input.members])].sort(
    (a, b) => a - b,
  );
  if (members.length < 2 || (kind === "direct" && members.length !== 2))
    throw fail(400, "Choose another employee.");
  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (kind === "group" && (!title || title.length > 100))
    throw fail(400, "Enter a group name up to 100 characters.");
  return transaction(pool, async (connection) => {
    const [employees] = await connection.execute(
      `SELECT id FROM employees WHERE id IN (${members.map(() => "?").join(",")})`,
      members,
    );
    if (employees.length !== members.length)
      throw fail(400, "An employee no longer exists. Refresh the directory.");
    const proposedId = randomUUID();
    const key = kind === "direct" ? members.join(":") : null;
    await connection.execute(
      "INSERT INTO chat_conversations (id,kind,title,direct_key,created_by) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE id=id",
      [
        proposedId,
        kind,
        kind === "group" ? title : null,
        key,
        session.employee_id,
      ],
    );
    const [[conversation]] = await connection.execute(
      "SELECT id FROM chat_conversations WHERE id=? OR direct_key=?",
      [proposedId, key],
    );
    for (const member of members)
      await connection.execute(
        "INSERT IGNORE INTO chat_members (conversation_id,employee_id) VALUES (?,?)",
        [conversation.id, member],
      );
    return { id: conversation.id, members };
  });
}
async function history(pool, conversationId, employeeId, before) {
  await requireMember(pool, conversationId, employeeId);
  if (
    before !== undefined &&
    (typeof before !== "string" || !/^[1-9]\d{0,15}$/.test(before))
  )
    throw fail(400, "Invalid message cursor.");
  const [messages] = await pool.execute(
    `SELECT m.id,m.sender_id AS senderId,e.name AS senderName,m.body,m.content,m.reply_to AS replyTo,m.created_at AS createdAt,
    r.sender_id AS replySenderId,re.name AS replySenderName,
    COALESCE(NULLIF(r.body,''),JSON_UNQUOTE(JSON_EXTRACT(r.content,'$.question')),JSON_UNQUOTE(JSON_EXTRACT(r.content,'$.title')),(SELECT name FROM chat_attachments WHERE message_id=r.id LIMIT 1),'Attachment') AS replyBody
    FROM chat_messages m JOIN employees e ON e.id=m.sender_id
    LEFT JOIN chat_messages r ON r.id=m.reply_to AND r.conversation_id=m.conversation_id LEFT JOIN employees re ON re.id=r.sender_id
    WHERE m.conversation_id=? ${before ? "AND m.id<?" : ""} ORDER BY m.id DESC LIMIT 50`,
    before ? [conversationId, before] : [conversationId],
  );
  let files = [];
  if (messages.length)
    [files] = await pool.execute(
      `SELECT id,message_id AS messageId,name,size,media_type AS mediaType FROM chat_attachments WHERE message_id IN (${messages.map(() => "?").join(",")})`,
      messages.map((message) => message.id),
    );
  const decorated = await require("./content-history").decorateMessages(
    pool,
    messages,
    employeeId,
  );
  return decorated.reverse().map((message) => ({
    ...message,
    attachments: files.filter((file) => file.messageId === message.id),
  }));
}
async function sendMessage(pool, session, input) {
  const message = messageInput(input);
  return transaction(pool, async (connection) => {
    await requireMember(
      connection,
      message.conversationId,
      session.employee_id,
    );
    // Serialise each conversation so committed message IDs define a stable history order.
    await connection.execute(
      "SELECT id FROM chat_conversations WHERE id=? FOR UPDATE",
      [message.conversationId],
    );
    const [[previous]] = await connection.execute(
      "SELECT id,conversation_id,body,content,reply_to FROM chat_messages WHERE sender_id=? AND client_id=?",
      [session.employee_id, message.clientId],
    );
    if (previous) {
      if (
        previous.conversation_id !== message.conversationId ||
        previous.body !== message.body ||
        !isDeepStrictEqual(previous.content, message.content) ||
        previous.reply_to !== message.replyTo
      )
        throw fail(409, "This message ID was already used.");
      return {
        id: previous.id,
        conversationId: message.conversationId,
        members: await participants(connection, message.conversationId),
      };
    }
    if (message.replyTo) {
      const [[original]] = await connection.execute(
        "SELECT id FROM chat_messages WHERE id=? AND conversation_id=?",
        [message.replyTo, message.conversationId],
      );
      if (!original)
        throw fail(400, "Choose a message from this conversation to reply to.");
    }
    for (const id of message.attachments) {
      const [[file]] = await connection.execute(
        "SELECT id FROM chat_attachments WHERE id=? AND conversation_id=? AND uploaded_by=? AND message_id IS NULL FOR UPDATE",
        [id, message.conversationId, session.employee_id],
      );
      if (!file)
        throw fail(
          403,
          "An attachment is not available to this message. Upload it again.",
        );
    }
    const [result] = await connection.execute(
      "INSERT INTO chat_messages (conversation_id,sender_id,client_id,body,content,reply_to) VALUES (?,?,?,?,?,?)",
      [
        message.conversationId,
        session.employee_id,
        message.clientId,
        message.body,
        message.content ? JSON.stringify(message.content) : null,
        message.replyTo,
      ],
    );
    for (const id of message.attachments)
      await connection.execute(
        "UPDATE chat_attachments SET message_id=? WHERE id=?",
        [result.insertId, id],
      );
    return {
      id: result.insertId,
      conversationId: message.conversationId,
      members: await participants(connection, message.conversationId),
    };
  });
}
async function markRead(pool, conversationId, employeeId, lastId) {
  await requireMember(pool, conversationId, employeeId);
  if (!Number.isSafeInteger(lastId) || lastId < 1)
    throw fail(400, "Invalid read position.");
  await pool.execute(
    "UPDATE chat_members SET last_read_id=GREATEST(last_read_id,LEAST(?,COALESCE((SELECT MAX(id) FROM chat_messages WHERE conversation_id=?),0))) WHERE conversation_id=? AND employee_id=?",
    [lastId, conversationId, conversationId, employeeId],
  );
}
module.exports = {
  requireMember,
  participants,
  listConversations,
  createConversation,
  history,
  sendMessage,
  markRead,
  transaction,
};
