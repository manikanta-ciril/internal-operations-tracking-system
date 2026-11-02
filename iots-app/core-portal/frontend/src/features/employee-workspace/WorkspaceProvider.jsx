import useNotifications from "./useNotifications";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const ended = useRef(onSessionEnded);
  const expire = useCallback((message) => ended.current(message), []);
  const notifications = useNotifications(expire);

  useEffect(() => {
    ended.current = onSessionEnded;
  }, [onSessionEnded]);
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
    user.roles.find((role) => role.code === user.activeRole)?.label ||
    user.activeRole;
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
        user,
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
