module.exports = function registerPresence(io, app, pool) {
  const connections = new Map();
  const seen = (employeeId) =>
    pool.execute(
      "INSERT INTO chat_presence (employee_id,last_seen) VALUES (?,NOW(3)) ON DUPLICATE KEY UPDATE last_seen=NOW(3)",
      [employeeId],
    );
  app.set("messagingPresence", (employeeId) =>
    Boolean(connections.get(employeeId)?.size),
  );
  async function changed(employeeId) {
    try {
      await seen(employeeId);
      io.emit("messaging:presence", { employeeId });
    } catch (error) {
      console.error(
        "Messaging presence could not be saved:",
        error.code || error.message,
      );
    }
  }
  function connect(socket) {
    const employeeId = socket.data.employeeId;
    const active = connections.get(employeeId) || new Set();
    active.add(socket.id);
    connections.set(employeeId, active);
    void changed(employeeId);
    socket.on("disconnect", () => {
      active.delete(socket.id);
      if (!active.size) {
        connections.delete(employeeId);
        void changed(employeeId);
      }
    });
  }
  async function heartbeat() {
    const saved = await Promise.allSettled(
      [...connections.keys()].map((employeeId) => seen(employeeId)),
    );
    for (const update of saved)
      if (update.status === "rejected")
        console.error(
          "Messaging presence heartbeat failed:",
          update.reason.code || update.reason.message,
        );
  }
  return { connect, heartbeat };
};
