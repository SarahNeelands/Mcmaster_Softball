import { Match } from "@/types/match_mod";
import styles from "./Calendar.module.css";

interface CalendarMonth {
  month: number;
  year: number;
  matches: Match[];
}

interface CalendarProps {
  months: CalendarMonth[];
  comparisonDate?: Date;
}

function getMatchDateTime(match: Match) {
  return new Date(`${match.date}T${match.time || "00:00"}:00`);
}

export function Calendar({ months, comparisonDate = new Date() }: CalendarProps) {
  const currentMonthStart = new Date(
    comparisonDate.getFullYear(),
    comparisonDate.getMonth(),
    1
  ).getTime();

  return (
    <>
      {months.map((month) => {
        const firstDayOffset = new Date(month.year, month.month, 1).getDay();
        const monthStart = new Date(month.year, month.month, 1).getTime();
        const isPastMonth = monthStart < currentMonthStart;

        return (
          <div
            key={`${month.year}-${month.month}`}
            className={`${styles.month} ${isPastMonth ? styles.desktopPastMonth : ""}`}
          >
            {/* Month and year label */}
            <h3 className={styles.calendarLabel}>
              {new Date(month.year, month.month).toLocaleDateString("en-CA", {
                month: "long",
                year: "numeric",
              })}
            </h3>

            <div className={styles.monthGrid}>
              {Array.from({ length: 42 }).map((_, idx) => {
                const dayNum = idx + 1 - firstDayOffset;
                const cellDate = new Date(month.year, month.month, dayNum);
                const inMonth = cellDate.getMonth() === month.month;

                const matchesOnDay = month.matches.filter((m) => {
                  const matchDate = new Date(`${m.date}T00:00:00`);
                  return (
                    matchDate.getFullYear() === month.year &&
                    matchDate.getMonth() === month.month &&
                    matchDate.getDate() === cellDate.getDate()
                  );
                });

                return (
                  <div
                    key={idx}
                    className={`${styles.dayCell} ${
                      inMonth ? styles.inMonth : styles.outMonth
                    }`}
                  >
                    <div className={styles.dayNumber}>
                      {inMonth ? cellDate.getDate() : ""}
                    </div>

                    {inMonth && matchesOnDay.length > 0 && (
                      <div className={styles.dotsGrid}>
                        {matchesOnDay.map((m) => {
                          const isPastMatch = getMatchDateTime(m) < comparisonDate;
                          return (
                            <span
                              key={m.id}
                              className={`${styles.dot} ${isPastMatch ? styles.pastDot : ""}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
