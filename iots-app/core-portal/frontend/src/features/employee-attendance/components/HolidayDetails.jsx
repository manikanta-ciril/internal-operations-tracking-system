import { dateLabel, timeLabel } from "../model";
import "../holidays.css";

export function DayDetails({
  day,
  events = [],
  loading = false,
  error = false,
}) {
  return (
    <span className="calendar-date-details">
      <span className="calendar-date-heading">
        <strong>{dateLabel(day.date)}</strong>
        <span className="calendar-date-state">{day.label}</span>
      </span>
      {events.map((event) => (
        <span
          className="calendar-event-detail"
          key={`${event.date}:${event.name}`}
        >
          <strong>{event.name}</strong>
          <small>
            {event.category} · {event.region}
          </small>
          {event.description && <span>{event.description}</span>}
        </span>
      ))}
      {loading && <small>Loading holiday details…</small>}
      {error && <small>Holiday details unavailable</small>}
      {day.records.map((record) => (
        <span key={record.id}>
          In {timeLabel(record.punchIn)} · Out {timeLabel(record.punchOut)}
        </span>
      ))}
      <small className="calendar-date-footer">View day details</small>
    </span>
  );
}
export function HolidaySource({ holidays }) {
  return (
    <div className="calendar-source">
      <span role="status">
        {holidays.loading
          ? "Loading holidays…"
          : holidays.error ||
            (holidays.stale
              ? "Saved holiday data · refresh pending"
              : "India · Telangana · IST")}
      </span>
      {holidays.error && (
        <button className="text-link" type="button" onClick={holidays.retry}>
          Retry
        </button>
      )}
      <a href="https://calendarific.com/" target="_blank" rel="noreferrer">
        Holiday data by Calendarific
      </a>
    </div>
  );
}
