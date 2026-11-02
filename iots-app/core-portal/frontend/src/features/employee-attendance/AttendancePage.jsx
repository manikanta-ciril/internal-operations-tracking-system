import Calendar from "../../shared/ui/Calendar";
import { useEmployeeWorkspace } from "../employee-workspace/context";
import { useWorkspaceNavigation } from "../../shared/workspace/navigation-context";

import Empty from "../../shared/workspace/Empty";
import { dateKey, dateLabel, timeLabel, dayRecord } from "./model";
import { useEffect, useState } from "react";
import { calendarDate } from "../../shared/ui/calendar-range";
import useHolidays from "./useHolidays";
import { DayDetails, HolidaySource } from "./components/HolidayDetails";

export default function AttendancePage() {
  const { data } = useEmployeeWorkspace();
  const { path, navigate } = useWorkspaceNavigation();
  const candidate = path.split("/")[2];
  const date = calendarDate(candidate, dateKey());
  useEffect(() => {
    if (candidate && candidate !== date) navigate(`/attendance/${date}`);
  }, [candidate, date, navigate]);
  const [visibleMonth, setVisibleMonth] = useState(date.slice(0, 7));
  const holidays = useHolidays([visibleMonth.slice(0, 4), date.slice(0, 4)]);
  const selected = dayRecord(date, data.punches, data.policy.workingDays);
  return (
    <>
      <div className="attendance-calendar-view">
        <Calendar
          key={date.slice(0, 7)}
          value={date}
          onMonthChange={setVisibleMonth}
          eventsForDay={(key) => holidays.byDate.get(key) || []}
          renderDayDetails={(key) => (
            <DayDetails
              day={dayRecord(key, data.punches, data.policy.workingDays)}
              events={holidays.byDate.get(key)}
              loading={holidays.loading}
              error={holidays.error}
            />
          )}
          onChange={(key) => navigate(`/attendance/${key}`)}
          describeDay={(key) =>
            dayRecord(key, data.punches, data.policy.workingDays)
          }
        />
        <HolidaySource holidays={holidays} />
        <p className="quiet">
          Monday–Saturday · Sunday weekly off · Times shown in IST. The last 180
          days of evidence are available here.
        </p>
      </div>
      <section
        className="attendance-selected-day"
        aria-label="Selected attendance date"
      >
        <h3>{dateLabel(date)}</h3>
        <div className="selected-holidays">
          {(holidays.byDate.get(date) || []).map((event) => (
            <article key={event.name}>
              <h3>{event.name}</h3>
              <small>
                {event.category} · {event.region}
              </small>
              <p>{event.description}</p>
            </article>
          ))}
        </div>
        <p className="quiet">
          Holiday listings are informational. CIRIL working-day rules apply.
        </p>
        {selected.records.length ? (
          selected.records.map((record) => (
            <div className="punch-row" key={record.id}>
              <div>
                <strong>Punch in · {timeLabel(record.punchIn)}</strong>
                <a
                  className="text-link"
                  href={`/api/auth/photos/${record.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  View photo
                </a>
              </div>
              <div>
                <strong>Punch out · {timeLabel(record.punchOut)}</strong>
                {record.punchOutId && (
                  <a
                    className="text-link"
                    href={`/api/auth/checkout/photos/${record.punchOutId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View photo
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <Empty>{selected.label}. No punch evidence for this date.</Empty>
        )}
      </section>
    </>
  );
}
