import React, { useMemo } from "react";
import styles from "./TeamDetail.module.css";
import type { Team } from "@/types/teams";
import type { Match } from "@/types/matches";
import { Calendar } from "@/components/common/calendar/calendar";
import MatchesSection from "../home/Matches/MatchesSection";
import {
  splitMatchesByToday,
  buildMonthsFromMatches,
} from "@/lib/matches/dateFunctions";

interface Props {
  team: Team;
  games: Match[];
  isAdmin: boolean;
  updateMatch?: (updated: Match) => Promise<void>;
}

export default function TeamDetail({ team, games, isAdmin, updateMatch }: Props) {
  // ✅ hooks only here (top-level of component)
  const { upcoming, previous } = useMemo(() => splitMatchesByToday(games), [games]);
  const months = useMemo(() => buildMonthsFromMatches(games, 2), [games]);

  return (
    <div className={styles.layout}>
      {/* Left column */}
      <aside className={styles.sideColumn}>
        <div className={styles.infoCard}>
          <div className={styles.teamTitleBlock}>
            <div className={styles.teamName}>{team.name}</div>

            {team.division && (
              <div className={styles.badge}>Division {team.division}</div>
            )}

            {typeof team.currentRanking === "number" && (
              <div className={styles.badge}>
                Current Rank #{team.currentRanking}
              </div>
            )}
          </div>

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <div className={styles.label}>Captain</div>
              <div className={styles.valueGroup}>
                <div className={styles.value}>{team.captainName}</div>
                {isAdmin && (
                  <div className={styles.email}>{team.captainEmail}</div>
                )}
              </div>
            </div>

            <div className={styles.grayBar} />

            <div className={styles.infoRow}>
              <div className={styles.label}>Co-Captain</div>
              <div className={styles.valueGroup}>
                <div className={styles.value}>{team.coCaptainName}</div>
                {isAdmin && (
                  <div className={styles.email}>{team.coCaptainEmail}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right column */}
      <aside className={styles.rightColumn}>
        <div className={styles.calendarCard}>
          <Calendar months={months} />
        </div>
      </aside>

      {/* Main column */}
      <div className={`${styles.mainColumn} ${styles.columnDivider}`}>
        <MatchesSection
          upcoming={upcoming}
          previous={previous}
          isAdmin={isAdmin}
          updateMatch={updateMatch ?? (async () => {})}
        />
      </div>
    </div>
  );
}
