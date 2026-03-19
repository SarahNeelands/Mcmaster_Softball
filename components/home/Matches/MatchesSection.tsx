/**
 * MatchesSection.tsx
 * -------------------
 * Container component for the matches column, orchestrating upcoming schedule
 * and previous results subcomponents within a shared layout.
 */

import React from "react";
import UpcomingMatches from "./UpcomingMatches";
import PreviousResults from "./PreviousResults";
import styles from "./MatchesSection.module.css";
import { Match } from "@/types/match_mod";

interface MatchesSectionProps {
  upcoming: Match[];
  previous: Match[];
  teamNamesById?: Record<string, string>;
  teamSlugsById?: Record<string, string>;
  teamOptions?: { id: string; name: string; division_id?: string }[];
  isAdmin: boolean;
  updateMatch: (updated: Match) => Promise<unknown>;
  deleteMatch?: (match: Match) => Promise<unknown>;
}


const MatchesSection: React.FC<MatchesSectionProps> = ({
  upcoming,
  previous,
  teamNamesById = {},
  teamSlugsById = {},
  teamOptions = [],
  isAdmin,
  updateMatch,
  deleteMatch,
}) => {
  return (
    <section className={styles.section} aria-labelledby="matches-heading">
      <h2 id="matches-heading" className={styles.heading}>
        Matches
      </h2>
      <div className={styles.column}>
        <UpcomingMatches
          matches={upcoming}
          isAdmin={isAdmin}
          teamNamesById={teamNamesById}
          teamOptions={teamOptions}
          updateMatch={updateMatch}
          deleteMatch={deleteMatch}
        />
        <PreviousResults
          matches={previous}
          teamNamesById={teamNamesById}
          teamSlugsById={teamSlugsById}
          isAdmin={isAdmin}
          updateMatch={updateMatch}
          deleteMatch={deleteMatch}
        />
      </div>
      <div className={styles.footerCta}>
        <button type="button" className={styles.viewScheduleButton}>
          View Full Schedule
        </button>
      </div>
    </section>
  );
};

export default MatchesSection;
