import { Match } from "@/types/matches";
import styles from "./Calendar.module.css";

interface CalendarMonth {
  month: number;
  year: number;
  matches: Match[];
}

interface CalendarProps {
  months: CalendarMonth[];
}

export function Calendar({ months }: CalendarProps) {
  return (
    <>
      {months.map((month) => {
        const firstDayOffset = new Date(month.year, month.month, 1).getDay();

        return (
          <div
            key={`${month.year}-${month.month}`}
            className={styles.month}
          >
            {/* Month and year label */}
            <h3 className={styles.calendarLabel}>
              {new Date(month.year, month.month).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h3>

            <div className={styles.monthGrid}>
              {Array.from({ length: 35 }).map((_, idx) => {
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
                        {matchesOnDay.map((m) => (
                          <span key={m.id} className={styles.dot} />
                        ))}
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
