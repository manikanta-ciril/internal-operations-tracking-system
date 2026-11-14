import useNotifications from "./useNotifications";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { workspaceApi } from "./api";

import { Workspace } from "./context";

export default function WorkspaceProvider({
  user,
  busy = false,
  onLogout,
  onSessionEnded,
  children,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [identity, setIdentity] = useState(null);
  const currentUser = useMemo(
    () =>
      identity?.id === user.id
        ? { ...user, ...identity, activeRole: user.activeRole }
        : user,
    [user, identity],
  );
  const ended = useRef(onSessionEnded);
  const expire = useCallback((message) => ended.current(message), []);
  const notifications = useNotifications(expire);

  useEffect(() => {
    ended.current = onSessionEnded;
  }, [onSessionEnded]);
  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    let checkedAt = 0;
    async function refreshIdentity() {
      if (
        pending ||
        document.visibilityState === "hidden" ||
        Date.now() - checkedAt < 5000
      )
        return;
      pending = true;
      checkedAt = Date.now();
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) {
          if ([401, 403].includes(response.status))
            ended.current(result.message || "Your session has ended.");
          return;
        }
        if (result.user?.id === user.id && !controller.signal.aborted)
          setIdentity((previous) =>
            JSON.stringify(previous) === JSON.stringify(result.user)
              ? previous
              : result.user,
          );
      } catch (failure) {
        // Keep the current screen usable through temporary connection loss.
        // Every task command is still authorised against current server roles.
        if (failure.name !== "AbortError") checkedAt = 0;
      } finally {
        pending = false;
      }
    }
    refreshIdentity();
    const timer = setInterval(refreshIdentity, 30000);
    window.addEventListener("focus", refreshIdentity);
    document.addEventListener("visibilitychange", refreshIdentity);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refreshIdentity);
      document.removeEventListener("visibilitychange", refreshIdentity);
    };
  }, [user.id, revision]);
  useEffect(() => {
    const controller = new AbortController();
    // A new authenticated request must clear the previous request state.
    // eslint-disable-next-line react/set-state-in-effect
    setLoading(true);
    setError("");
    workspaceApi("", { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((failure) => {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(failure.status)) ended.current(failure.message);
        else setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [user.id, user.activeRole, revision]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function save(section, value) {
    try {
      const result = await workspaceApi(`/settings/${section}`, {
        body: value,
      });
      setData((current) => ({
        ...current,
        settings: { ...current.settings, [section]: result.value },
      }));
      setNotice("Changes saved.");
      return result.value;
    } catch (failure) {
      if ([401, 403].includes(failure.status)) ended.current(failure.message);
      throw failure;
    }
  }
  async function saveAvatar(file) {
    try {
      const result = await workspaceApi("/avatar", { file });
      setData((current) => ({
        ...current,
        avatarVersion: result.avatarVersion,
      }));
      setNotice("Profile photo updated.");
    } catch (failure) {
      if ([401, 403].includes(failure.status)) ended.current(failure.message);
      throw failure;
    }
  }
  const roleLabel =
    currentUser.roles.find((role) => role.code === currentUser.activeRole)
      ?.label ||
    currentUser.roles[0]?.label ||
    "Workspace";
  const avatar = data?.avatarVersion
    ? `/api/auth/workspace/avatar?v=${encodeURIComponent(data.avatarVersion)}`
    : undefined;
  return (
    <Workspace.Provider
      value={{
        notifications: {
          ...notifications,
          reportError: (failure) => setNotice(failure.message),
        },
        busy,
        user: currentUser,
        roleLabel,
        data,
        loading,
        error,
        avatar,
        save,
        saveAvatar,
        onLogout,
        notice,
        dismissNotice: () => setNotice(""),
        refresh: () => setRevision((value) => value + 1),
      }}
    >
      {children}
    </Workspace.Provider>
  );
}
