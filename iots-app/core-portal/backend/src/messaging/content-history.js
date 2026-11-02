function pollResults(content, votes, employeeId) {
  return {
    ...content,
    totalVoters: new Set(votes.map((vote) => vote.employee_id)).size,
    results: content.options.map((label, index) => ({
      count: votes.filter((vote) => vote.option_index === index).length,
      mine: votes.some(
        (vote) =>
          vote.option_index === index && vote.employee_id === employeeId,
      ),
    })),
  };
}
const decorators = {
  poll: (content, activity, employeeId) =>
    pollResults(content, activity.votes, employeeId),
  checklist: (content, activity) => ({
    ...content,
    checks: content.items.map(
      (label, index) =>
        activity.checks.find((check) => check.item_index === index) || {
          checked: false,
        },
    ),
  }),
};
async function decorateMessages(pool, messages, employeeId) {
  if (!messages.length) return messages;
  const placeholders = messages.map(() => "?").join(",");
  const messageIds = messages.map((message) => message.id);
  const [votes] = await pool.execute(
    `SELECT message_id,employee_id,option_index FROM chat_votes WHERE message_id IN (${placeholders})`,
    messageIds,
  );
  const [checks] = await pool.execute(
    `SELECT c.*,e.name AS updatedBy FROM chat_checks c JOIN employees e ON e.id=c.checked_by WHERE message_id IN (${placeholders})`,
    messageIds,
  );
  return messages.map((message) => ({
    ...message,
    content: message.content
      ? decorators[message.content.type](
          message.content,
          {
            votes: votes.filter((vote) => vote.message_id === message.id),
            checks: checks.filter((check) => check.message_id === message.id),
          },
          employeeId,
        )
      : null,
  }));
}
module.exports = { decorateMessages };
