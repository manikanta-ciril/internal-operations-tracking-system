import { useEffect, useState } from "react";
import "../styles/work-clock.css";
import { workspaceApi } from "../api";
import { shiftPresentation } from "../office-time";
export default function WorkClock() {
  const [snapshot, setSnapshot] = useState(null),
    [tick, setTick] = useState(() => performance.now()),
    [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        const value = await workspaceApi("/time");
        if (live) {
          setSnapshot({ ...value, received: performance.now() });
          setError("");
        }
      } catch {
        if (live) setError("Time could not sync. Retrying…");
      }
    };
    load();
    const sync = setInterval(load, 60000);
    const clock = setInterval(() => setTick(performance.now()), 1000);
    const visible = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      live = false;
      clearInterval(sync);
      clearInterval(clock);
      document.removeEventListener("visibilitychange", visible);
    };
  }, []);
  const since = snapshot ? Math.max(0, tick - snapshot.received) : 0;
  const now = snapshot
    ? new Date(new Date(snapshot.serverTime).getTime() + since)
    : null;
  const shift = shiftPresentation(snapshot, now);
  const timezone = snapshot?.timezone || "Asia/Kolkata";
  const zoneLabel = timezone === "Asia/Kolkata" ? "IST" : now
    ? new Intl.DateTimeFormat("en", { timeZone: timezone, timeZoneName: "short" })
        .formatToParts(now).find(part => part.type === "timeZoneName")?.value
    : timezone;
  return (
      <div className="shift-timing" aria-label="Office clock" data-phase={shift.phase}>
        <div className="shift-timing-primary">
        <time dateTime={now?.toISOString()}>
          {now
            ? now.toLocaleTimeString("en-IN", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })
            : "Syncing..."}{" "}
          <small>{zoneLabel}</small>
        </time>
        <span className="shift-countdown" title={shift.detail}>{shift.countdown}</span>
        </div>
        <div className="shift-timing-secondary">
          <span className="shift-status">{shift.status}</span>
          <span title={shift.detail}>{shift.hours}</span>
        </div>
        {shift.progress !== null && <div className="shift-progress" role="progressbar"
          aria-label="Scheduled shift elapsed" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={Math.round(shift.progress)} aria-valuetext={`${Math.round(shift.progress)}% of scheduled hours elapsed`}>
          <span style={{ width: `${shift.progress}%` }} />
        </div>}
        {error && <small className="shift-sync">Time sync pending</small>}
      </div>
  );
}
