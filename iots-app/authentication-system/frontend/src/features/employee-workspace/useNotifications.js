import { useEffect, useRef, useState } from "react";
import { workspaceApi } from "./api";
import { trackOperation } from "../../shared/feedback/operations";
export default function useNotifications(onExpired) {
  const [state, setState] = useState({
    notifications: [],
    unread: 0,
    loading: true,
    error: "",
  });
  const [updating, setUpdating] = useState(false),
    [refreshing, setRefreshing] = useState(false);
  const marking = useRef(null);
  async function refresh({ silent = false } = {}) {
    async function load() {
      try {
        const data = await workspaceApi("/notifications");
        setState({ ...data, loading: false, error: "" });
      } catch (error) {
        if ([401, 403].includes(error.status)) onExpired(error.message);
        else setState((s) => ({ ...s, loading: false, error: error.message }));
      }
    }
    if (silent) return load();
    setRefreshing(true);
    try {
      await trackOperation("Refreshing notifications", load);
    } finally {
      setRefreshing(false);
    }
  }
  useEffect(() => {
    let live = true;
    const update = async () => {
      try {
        const data = await workspaceApi("/notifications");
        if (live) setState({ ...data, loading: false, error: "" });
      } catch (error) {
        if (!live) return;
        if ([401, 403].includes(error.status)) onExpired(error.message);
        else setState((s) => ({ ...s, loading: false, error: error.message }));
      }
    };
    update();
    const timer = setInterval(() => {
      if (!document.hidden && !marking.current) update();
    }, 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [onExpired]);
  function markRead(ids) {
    if (marking.current) return marking.current;
    setUpdating(true);
    const action = (async () => {
      try {
        await workspaceApi("/notifications/read", { body: { ids } });
        await refresh({ silent: true });
      } finally {
        marking.current = null;
        setUpdating(false);
      }
    })();
    marking.current = action;
    return action;
  }
  return { ...state, updating, refreshing, refresh, markRead };
}
