import { useMemo } from "react";
import styles from "./TeamDetail.module.css";
import type { Team } from "@/types/team_mod";
import type { Match } from "@/types/match_mod";
import { Calendar } from "@/components/common/calendar/calendar";
import MatchesSection from "../home/Matches/MatchesSection";

interface Props {
  team: Team;
  games: Match[];
  isAdmin: boolean;
  updateMatch?: (updated: Match) => Promise<void>;
}

function buildCalendarMonths(matches: Match[]) {
  const monthMap = new Map<string, { month: number; year: number; matches: Match[] }>();

  for (const match of matches) {
    const date = new Date(`${match.date}T00:00:00`);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { month, year, matches: [] });
    }

    monthMap.get(key)!.matches.push(match);
  }

  return Array.from(monthMap.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month
  );
}

export default function TeamDetail({ team, games, isAdmin, updateMatch }: Props) {
  const months = useMemo(() => buildCalendarMonths(games), [games]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sideColumn}>
        <div className={styles.infoCard}>
          <div className={styles.teamTitleBlock}>
            <div className={styles.teamName}>{team.name}</div>

            {team.division && (
              <div className={styles.badge}>Division {team.division}</div>
            )}

            {typeof team.current_ranking === "number" && (
              <div className={styles.badge}>
                Current Rank #{team.current_ranking}
              </div>
            )}
          </div>

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <div className={styles.label}>Captain</div>
              <div className={styles.valueGroup}>
                <div className={styles.value}>{team.captain_name}</div>
                {isAdmin && (
                  <div className={styles.email}>{team.captain_email}</div>
                )}
              </div>
            </div>

            <div className={styles.grayBar} />

            <div className={styles.infoRow}>
              <div className={styles.label}>Co-Captain</div>
              <div className={styles.valueGroup}>
                <div className={styles.value}>{team.co_captain_name}</div>
                {isAdmin && (
                  <div className={styles.email}>{team.co_captain_email}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <aside className={styles.rightColumn}>
        <div className={styles.calendarCard}>
          <Calendar months={months} />
        </div>
      </aside>

      <div className={`${styles.mainColumn} ${styles.columnDivider}`}>
        <MatchesSection
          upcoming={games}
          previous={[]}
          isAdmin={isAdmin}
          updateMatch={updateMatch ?? (async () => {})}
        />
      </div>
    </div>
  );
}