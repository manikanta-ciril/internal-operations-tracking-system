import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { messagingApi } from "./api";
import { desktopMessage } from "./desktop-notifications";
import { validateChatFiles } from "./attachment-rules";
const empty = [];

export default function useMessaging({
  employeeId,
  activeRole,
  activeId,
  open,
}) {
  const [snapshot, setSnapshot] = useState({
    employees: [],
    conversations: [],
    permissions: {},
  });
  const [thread, setThread] = useState({ id: null, messages: [], files: [] });
  const messages = thread.id === activeId ? thread.messages : empty;
  const files = thread.id === activeId ? thread.files : empty;
  const [connection, setConnection] = useState("Connecting");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const loading = Boolean(activeId && thread.id !== activeId && !error);
  const socket = useRef(null);
  const selected = useRef(activeId);
  const listRequest = useRef(0);
  const historyRequest = useRef(0);
  const readPositions = useRef(new Map());
  const pendingSend = useRef(null);
  const viewing = useRef(open);
  useEffect(() => {
    viewing.current = open;
  }, [open]);
  const refresh = useCallback(async () => {
    const request = ++listRequest.current;
    try {
      const data = await messagingApi();
      if (
        !Array.isArray(data.employees) ||
        !Array.isArray(data.conversations) ||
        !data.permissions
      )
        throw new Error(
          "The messaging response is incomplete. Retry the connection.",
        );
      if (request === listRequest.current) setSnapshot(data);
    } catch (failure) {
      if (request === listRequest.current) setError(failure.message);
    }
  }, []);
  const loadHistory = useCallback(async (id, before) => {
    const request = ++historyRequest.current;
    try {
      const data = await messagingApi(
        `/conversations/${id}/messages${before ? `?before=${before}` : ""}`,
      );
      if (selected.current !== id || request !== historyRequest.current) return;
      setThread((previous) => ({
        id,
        messages: [
          ...new Map(
            [
              ...(previous.id === id ? previous.messages : []),
              ...data.messages,
            ].map((message) => [message.id, message]),
          ).values(),
        ].sort((a, b) => a.id - b.id),
        files: data.pendingAttachments,
      }));
      setError("");
      return data.messages.length;
    } catch (failure) {
      if (selected.current === id) setError(failure.message);
    }
  }, []);
  const invalidateRequests = useCallback(() => {
    ++listRequest.current;
    ++historyRequest.current;
  }, []);
  useEffect(() => {
    let disposed = false;
    const notices = new Set();
    const notified = new Map();
    async function announce(conversationId, messageId) {
      if (messageId <= (notified.get(conversationId) || 0)) return;
      if (
        viewing.current &&
        !document.hidden &&
        selected.current === conversationId
      ) {
        notified.set(conversationId, messageId);
        return;
      }
      try {
        const history = await messagingApi(
          `/conversations/${conversationId}/messages`,
        );
        if (disposed) return;
        const latest = history.messages.at(-1);
        if (!latest || latest.id <= (notified.get(conversationId) || 0)) return;
        notified.set(conversationId, latest.id);
        const notice = desktopMessage(latest, employeeId, conversationId);
        if (notice) {
          notices.add(notice);
          notice.onclose = () => notices.delete(notice);
        }
      } catch (failure) {
        if (!disposed)
          setError(
            `Desktop notification could not be shown: ${failure.message}`,
          );
      }
    }
    const client = io({
      path: "/api/messaging/socket.io",
      autoConnect: false,
      withCredentials: true,
    });
    socket.current = client;
    client.on("connect", () => {
      setConnection("Connected");
      refresh();
      if (selected.current) loadHistory(selected.current);
    });
    client.on("disconnect", (reason) => {
      setConnection("Disconnected");
      if (reason === "io server disconnect")
        setError(
          "Messaging session ended. Sign in again or retry the connection.",
        );
    });
    client.on("connect_error", (failure) => {
      setConnection("Disconnected");
      setError(failure.message);
    });
    client.on("messaging:changed", ({ conversationId, messageId }) => {
      refresh();
      if (selected.current === conversationId) loadHistory(conversationId);
      if (messageId) void announce(conversationId, messageId);
    });
    client.on("messaging:presence", refresh);
    client.connect();
    // Synchronise the inbox with the newly authenticated server connection.
    // eslint-disable-next-line react/set-state-in-effect
    refresh();
    return () => {
      disposed = true;
      for (const notice of notices) notice.close();
      invalidateRequests();
      client.disconnect();
      socket.current = null;
    };
  }, [employeeId, activeRole, refresh, loadHistory, invalidateRequests]);
  useEffect(() => {
    selected.current = activeId;
    ++historyRequest.current;
    pendingSend.current = null;
    if (!activeId) return;
    // Changing conversations loads its persisted server history.
    // eslint-disable-next-line react/set-state-in-effect
    loadHistory(activeId);
  }, [activeId, loadHistory]);
  useEffect(() => {
    if (!open || !activeId || !messages.length) return;
    const lastId = messages.at(-1).id;
    const mark = () => {
      if (document.hidden || readPositions.current.get(activeId) >= lastId)
        return;
      readPositions.current.set(activeId, lastId);
      messagingApi(`/conversations/${activeId}/read`, {
        method: "POST",
        body: { lastId },
      }).catch((failure) => {
        readPositions.current.delete(activeId);
        setError(failure.message);
      });
    };
    mark();
    document.addEventListener("visibilitychange", mark);
    return () => document.removeEventListener("visibilitychange", mark);
  }, [open, activeId, messages]);
  async function createConversation(kind, members, title) {
    const result = await messagingApi("/conversations", {
      method: "POST",
      body: { kind, members, title },
    });
    await refresh();
    return result.id;
  }
  async function upload(selectedFiles, attachmentKind) {
    const id = activeId;
    if (files.length + selectedFiles.length > 10)
      throw new Error("Attach at most 10 files per message.");
    validateChatFiles(selectedFiles, attachmentKind);
    pendingSend.current = null;
    setBusy(true);
    try {
      for (const file of selectedFiles)
        await messagingApi(`/conversations/${id}/attachments`, {
          method: "POST",
          file,
          attachmentKind,
        });
    } finally {
      await loadHistory(id);
      setBusy(false);
    }
  }
  async function removeFile(index) {
    pendingSend.current = null;
    const file = files[index];
    setBusy(true);
    try {
      await messagingApi(`/attachments/${file.id}`, { method: "DELETE" });
      await loadHistory(activeId);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  async function send(body, { content = null, replyTo = null } = {}) {
    if (!socket.current?.connected)
      throw new Error("Messaging is disconnected. Reconnect before sending.");
    const attachmentIds = files.map((file) => file.id);
    // Server history may clear sent attachments before a lost acknowledgement is retried.
    const signature = JSON.stringify([activeId, body, content, replyTo]);
    if (pendingSend.current?.signature !== signature)
      pendingSend.current = {
        signature,
        payload: {
          conversationId: activeId,
          clientId: crypto.randomUUID(),
          body,
          attachments: attachmentIds,
          content,
          replyTo,
        },
      };
    setBusy(true);
    try {
      // A retry retains the same client ID; the server stores it only once.
      let response;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await socket.current
            .timeout(8000)
            .emitWithAck("message:send", pendingSend.current.payload);
          break;
        } catch {
          if (attempt === 1)
            throw new Error(
              "Message was not confirmed. Reconnect and retry; your draft is still here.",
            );
        }
      }
      if (response.error) throw new Error(response.error);
      pendingSend.current = null;
      await Promise.all([refresh(), loadHistory(activeId)]);
    } finally {
      setBusy(false);
    }
  }
  async function interact(messageId, action, selection) {
    await messagingApi(`/messages/${messageId}/${action}`, {
      method: "POST",
      body: selection,
    });
    await loadHistory(activeId);
  }
  async function revealMessage(messageId) {
    const id = activeId;
    let oldest = messages[0]?.id;
    const earlier = [];
    while (oldest && messageId < oldest) {
      const page = await messagingApi(
        `/conversations/${id}/messages?before=${oldest}`,
      );
      if (selected.current !== id) return;
      if (!page.messages.length)
        throw new Error("The original message is unavailable.");
      earlier.push(...page.messages);
      oldest = page.messages[0].id;
    }
    if (earlier.length)
      setThread((previous) => ({
        ...previous,
        messages: [
          ...new Map(
            [...earlier, ...previous.messages].map((message) => [
              message.id,
              message,
            ]),
          ).values(),
        ].sort((a, b) => a.id - b.id),
      }));
  }
  return {
    ...snapshot,
    messages,
    files,
    connection,
    loading,
    busy,
    error,
    setError,
    refresh,
    loadHistory,
    createConversation,
    upload,
    removeFile,
    send,
    interact,
    revealMessage,
    reconnect: () => socket.current?.connect(),
  };
}
