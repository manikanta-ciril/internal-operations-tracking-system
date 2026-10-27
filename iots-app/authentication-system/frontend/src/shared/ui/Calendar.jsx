import { useEffect, useRef, useState } from "react";
import Icon from "../workspace/Icon";
import Tooltip from "./Tooltip";
import {
  calendarDate,
  calendarMaxYear,
  MIN_CALENDAR_DATE,
} from "./calendar-range";
const iso = (date) => date.toISOString().slice(0, 10);
const parse = (value) => new Date(`${value}T12:00:00Z`);
export default function Calendar({
  value,
  onChange,
  describeDay = () => ({ label: "", state: "" }),
  onMonthChange,
  eventsForDay = () => [],
  renderDayDetails,
}) {
  const safeValue = calendarDate(value);
  const [month, setMonth] = useState(safeValue.slice(0, 7));
  const [focused, setFocused] = useState(safeValue);
  useEffect(() => {
    onMonthChange?.(month);
  }, [month, onMonthChange]);
  const grid = useRef(null);
  const [year, number] = month.split("-").map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1, 12));
  const offset = (first.getUTCDay() + 6) % 7;
  const length = new Date(Date.UTC(year, number, 0)).getUTCDate();
  const cells = Array.from(
    { length: Math.ceil((offset + length) / 7) * 7 },
    (_, i) =>
      i < offset || i >= offset + length
        ? null
        : `${month}-${String(i - offset + 1).padStart(2, "0")}`,
  );
  function changeMonth(delta) {
    const day = new Date(Date.UTC(year, number - 1 + delta, 1, 12));
    const key = calendarDate(iso(day));
    setMonth(key.slice(0, 7));
    setFocused(key);
  }
  function keydown(event, key) {
    const day = parse(key);
    const week = (day.getUTCDay() + 6) % 7;
    const changes = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -week,
      End: 6 - week,
    };
    if (event.key in changes) {
      event.preventDefault();
      day.setUTCDate(day.getUTCDate() + changes[event.key]);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      event.preventDefault();
      day.setUTCMonth(day.getUTCMonth() + (event.key === "PageUp" ? -1 : 1));
    } else return;
    const next = calendarDate(iso(day));
    setMonth(next.slice(0, 7));
    setFocused(next);
    requestAnimationFrame(() =>
      grid.current?.querySelector(`[data-date="${next}"]`)?.focus(),
    );
  }
  return (
    <div className="ui-calendar">
      <div className="ui-calendar-heading">
        <button
          type="button"
          aria-label="Previous month"
          disabled={month <= MIN_CALENDAR_DATE.slice(0, 7)}
          onClick={() => changeMonth(-1)}
        >
          <span className="calendar-previous">
            <Icon name="arrow" size={16} />
          </span>
        </button>
        <div className="calendar-month-select">
          <select
            aria-label="Calendar month"
            value={number}
            onChange={(event) => {
              const next = `${year}-${String(event.target.value).padStart(2, "0")}`;
              setMonth(next);
              setFocused(`${next}-01`);
            }}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index} value={index + 1}>
                {new Date(Date.UTC(2025, index, 1)).toLocaleDateString("en", {
                  month: "long",
                  timeZone: "UTC",
                })}
              </option>
            ))}
          </select>
          <select
            aria-label="Calendar year"
            value={year}
            onChange={(event) => {
              const next = `${event.target.value}-${String(number).padStart(2, "0")}`;
              setMonth(next);
              setFocused(`${next}-01`);
            }}
          >
            {Array.from(
              { length: calendarMaxYear() - 2025 + 1 },
              (_, index) => (
                <option key={index} value={2025 + index}>
                  {2025 + index}
                </option>
              ),
            )}
          </select>
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={month >= `${calendarMaxYear()}-12`}
          onClick={() => changeMonth(1)}
        >
          <Icon name="arrow" size={16} />
        </button>
      </div>
      <table ref={grid} role="grid" aria-label="Attendance calendar">
        <thead>
          <tr>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <th key={day} scope="col">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody key={month}>
          {Array.from({ length: cells.length / 7 }, (_, row) => (
            <tr key={row}>
              {cells.slice(row * 7, row * 7 + 7).map((key, i) => {
                const info = key ? describeDay(key) : {};
                const events = key ? eventsForDay(key) : [];
                const button = key && (
                  <button
                    data-date={key}
                    tabIndex={key === focused ? 0 : -1}
                    className={`calendar-day ${info.state} ${events.length ? "has-events" : ""}`}
                    aria-pressed={safeValue === key}
                    aria-label={`${parse(key).toLocaleDateString("en-IN", { timeZone: "UTC", dateStyle: "full" })}: ${info.label}${events.length ? `. ${events.map((e) => e.name).join(", ")}` : ""}`}
                    onKeyDown={(event) => keydown(event, key)}
                    onClick={() => {
                      setFocused(key);
                      onChange(key);
                    }}
                  >
                    <strong>{Number(key.slice(-2))}</strong>
                    <span className="calendar-day-status">{info.label}</span>
                    <span
                      className="calendar-event-name"
                      aria-hidden={!events.length}
                    >
                      {events[0]?.name}
                      {events.length > 1 ? ` +${events.length - 1}` : ""}
                    </span>
                  </button>
                );
                return (
                  <td
                    key={key || i}
                    aria-selected={key ? value === key : undefined}
                  >
                    {key &&
                      (renderDayDetails ? (
                        <Tooltip content={renderDayDetails(key)}>
                          {button}
                        </Tooltip>
                      ) : (
                        button
                      ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
