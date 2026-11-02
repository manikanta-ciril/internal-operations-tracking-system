import { useEffect, useMemo, useState } from "react";
import { workspaceApi } from "../employee-workspace/api";

const requests = new Map();
function load(year) {
  const cached = requests.get(year);
  if (cached && cached.until > Date.now()) return cached.promise;
  const promise = workspaceApi(`/calendar/holidays?year=${year}`).catch(
    (error) => {
      requests.delete(year);
      throw error;
    },
  );
  requests.set(year, { promise, until: Date.now() + 300000 });
  return promise;
}
export default function useHolidays(years) {
  const key = [...new Set(years.map(Number))].sort().join(",");
  const [state, setState] = useState({
    key: "",
    rows: [],
    loading: true,
    error: "",
    stale: false,
  });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    Promise.allSettled(key.split(",").filter(Boolean).map(load)).then(
      (results) => {
        if (!live) return;
        const valid = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value);
        setState({
          key,
          loading: false,
          rows: valid.flatMap((r) => r.events || []),
          stale: valid.some((r) => r.stale),
          error: results.some((r) => r.status === "rejected")
            ? "Some holiday details could not load."
            : "",
        });
      },
    );
    return () => {
      live = false;
    };
  }, [key, retry]);
  const current =
    state.key === key
      ? state
      : { rows: [], loading: true, error: "", stale: false };
  const byDate = useMemo(() => {
    const index = new Map();
    for (const event of current.rows)
      index.set(event.date, [...(index.get(event.date) || []), event]);
    return index;
  }, [current.rows]);
  return {
    ...current,
    byDate,
    retry: () => {
      setState((s) => ({ ...s, loading: true }));
      setRetry((n) => n + 1);
    },
  };
}
