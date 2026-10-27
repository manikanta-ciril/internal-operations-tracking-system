import "../attendance-activity.css";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useEmployeeWorkspace } from "../../employee-workspace/context";
import { WorkspaceLink } from "../../../shared/workspace/navigation";
import { useWorkspaceNavigation } from "../../../shared/workspace/navigation-context";
import Tooltip from "../../../shared/ui/Tooltip";
import { attendanceCalendar } from "../calendar-model";
import { addDays, dateKey, dateLabel } from "../model";

import useHolidays from "../useHolidays";
import { DayDetails, HolidaySource } from "./HolidayDetails";

export default function AttendanceHeatmap() {
  const { data } = useEmployeeWorkspace();
  const { path } = useWorkspaceNavigation();
  const [days, setDays] = useState(180),
    [focused, setFocused] = useState(dateKey);
  const grid = useRef(null),
    today = dateKey();
  const calendar = useMemo(
    () =>
      attendanceCalendar(data.punches, data.policy.workingDays, today, days),
    [data.punches, data.policy.workingDays, today, days],
  );
  const holidays = useHolidays([
    calendar.start.slice(0, 4),
    calendar.end.slice(0, 4),
  ]);
  useLayoutEffect(() => {
    const viewport = grid.current;
    if (viewport?.clientWidth) viewport.scrollLeft = viewport.scrollWidth;
  }, [days, path]);
  const selected = path.startsWith("/attendance/") ? path.split("/")[2] : null;
  function move(event, date) {
    const weekday = (new Date(`${date}T12:00:00Z`).getUTCDay() + 6) % 7;
    const offsets = {
      ArrowLeft: -7,
      ArrowRight: 7,
      ArrowUp: -1,
      ArrowDown: 1,
      Home: -weekday,
      End: 6 - weekday,
    };
    if (!(event.key in offsets)) return;
    event.preventDefault();
    const next = addDays(date, offsets[event.key]);
    if (next < calendar.start || next > calendar.end) return;
    setFocused(next);
    grid.current?.querySelector(`[data-attendance-date="${next}"]`)?.focus();
  }
  return (
    <div className="attendance-activity">
      <div className="attendance-activity-toolbar">
        <div>
          <p className="attendance-activity-summary">
            <strong>{calendar.recordedDays}</strong>{" "}
            {calendar.recordedDays === 1 ? "day" : "days"} with office records
          </p>
          <span className="attendance-activity-range">
            {dateLabel(calendar.start)} – {dateLabel(calendar.end)}
          </span>
        </div>
        <div className="attendance-period" aria-label="Attendance period">
          {[
            [90, "3 months"],
            [180, "6 months"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              aria-pressed={days === value}
              onClick={() => {
                setDays(value);
                setFocused(today);
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="attendance-activity-scroll" ref={grid}>
        <table
          className="attendance-activity-grid"
          role="grid"
          aria-label="Office attendance activity calendar"
        >
          <thead>
            <tr>
              <th aria-label="Weekday" />
              {calendar.months.map((month, index) => (
                <th key={month.month} colSpan={month.span} scope="colgroup">
                  {index === 0 && month.span < 2 ? "" : month.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (weekday, row) => (
                <tr key={weekday}>
                  <th scope="row">
                    <span
                      className={
                        row % 2 === 0 ? "" : "attendance-weekday-quiet"
                      }
                    >
                      {weekday}
                    </span>
                  </th>
                  {calendar.weeks.map((week, column) => {
                    const day = week[row];
                    return (
                      <td
                        key={column}
                        aria-selected={day ? selected === day.date : undefined}
                      >
                        {day && (
                          <Tooltip
                            content={
                              <DayDetails
                                day={day}
                                events={holidays.byDate.get(day.date)}
                                loading={holidays.loading}
                                error={holidays.error}
                              />
                            }
                          >
                            <WorkspaceLink
                              data-attendance-date={day.date}
                              to={`/attendance/${day.date}`}
                              className={`attendance-activity-day ${day.state} ${holidays.byDate.has(day.date) ? "has-events" : ""} ${day.date === today ? "is-today" : ""}`}
                              tabIndex={day.date === focused ? 0 : -1}
                              aria-label={`${dateLabel(day.date)}: ${day.label}${
                                holidays.byDate.has(day.date)
                                  ? `. ${holidays.byDate
                                      .get(day.date)
                                      .map((e) => e.name)
                                      .join(", ")}`
                                  : ""
                              }`}
                              aria-current={
                                selected === day.date ? "date" : undefined
                              }
                              onKeyDown={(event) => move(event, day.date)}
                              onFocus={() => setFocused(day.date)}
                            />
                          </Tooltip>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <div className="attendance-activity-footer">
        <span>
          {calendar.openDays
            ? `${calendar.openDays} ${calendar.openDays === 1 ? "day" : "days"} without a punch-out`
            : "Monday–Saturday · IST"}
        </span>
        <div
          className="attendance-activity-legend"
          aria-label="Calendar legend"
        >
          {[
            ["missing", "No record"],
            ["off", "Weekly off"],
            ["open", "No punch-out"],
            ["recorded", "Recorded"],
            ["holiday", "Holiday / festival"],
          ].map(([state, label]) => (
            <span key={state}>
              <i className={state} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <HolidaySource holidays={holidays} />
      <p className="attendance-activity-note">
        Office evidence only. Missing records do not confirm absence; WFH time
        is tracked separately.
      </p>
    </div>
  );
}
