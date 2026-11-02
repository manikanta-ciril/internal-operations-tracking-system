const { Server } = require("socket.io");
const messagingSession = require("./session");
const { sendMessage } = require("./repository");

module.exports = function attachMessaging(server, app, pool) {
  const origins = require("../config/origins");
  const io = new Server(server, {
    path: "/api/messaging/socket.io",
    maxHttpBufferSize: 32 * 1024,
    serveClient: false,
    allowRequest: (request, callback) =>
      callback(
        null,
        !request.headers.origin || origins.has(request.headers.origin),
      ),
  });
  const attempts = new Map();
  const presence = require("./presence")(io, app, pool);
  async function authenticate(socket) {
    const session = await messagingSession(pool, socket.request.headers);
    socket.data.employeeId = session.employee_id;
    return session;
  }
  io.use(async (socket, next) => {
    try {
      await authenticate(socket);
      next();
    } catch (error) {
      next(
        new Error(
          [401, 403].includes(error.status)
            ? error.message
            : "Messaging is temporarily unavailable.",
        ),
      );
    }
  });
  const notify = async (members, conversationId, messageId) => {
    const sockets = await io
      .in(members.map((id) => `employee:${id}`))
      .fetchSockets();
    await Promise.allSettled(
      sockets.map(async (socket) => {
        try {
          await authenticate(socket);
          socket.emit("messaging:changed", { conversationId, messageId });
        } catch {
          socket.disconnect(true);
        }
      }),
    );
  };
  app.set("messagingNotify", notify);
  io.on("connection", (socket) => {
    socket.join(`employee:${socket.data.employeeId}`);
    presence.connect(socket);
    socket.on("message:send", async (input, acknowledge) => {
      if (typeof acknowledge !== "function") return;
      try {
        const session = await authenticate(socket);
        const now = Date.now();
        const attempt = attempts.get(session.employee_id) || {
          started: now,
          count: 0,
        };
        if (now - attempt.started > 60000) {
          attempt.started = now;
          attempt.count = 0;
        }
        attempts.set(session.employee_id, attempt);
        if (++attempt.count > 60)
          return acknowledge({
            error: "Too many messages. Wait a minute and retry.",
          });
        const message = await sendMessage(pool, session, input);
        acknowledge({ id: message.id });
        await notify(message.members, message.conversationId, message.id);
      } catch (error) {
        acknowledge({
          error: [400, 401, 403, 409].includes(error.status)
            ? error.message
            : "Message could not be saved. Retry when connected.",
        });
        if ([401, 403].includes(error.status)) {
          try {
            await authenticate(socket);
          } catch {
            socket.disconnect(true);
          }
        }
      }
    });
  });
  const timer = setInterval(async () => {
    for (const [id, attempt] of attempts)
      if (Date.now() - attempt.started > 60000) attempts.delete(id);
    await Promise.allSettled(
      [...io.sockets.sockets.values()].map(async (socket) => {
        try {
          await authenticate(socket);
        } catch {
          socket.disconnect(true);
        }
      }),
    );
    await presence.heartbeat();
  }, 30000);
  timer.unref();
  io.engine.on("close", () => clearInterval(timer));
  return io;
};
