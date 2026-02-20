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
import { Match } from "../../../types/matches";

interface MatchesSectionProps {
  upcoming: Match[];
  previous: Match[];
  isAdmin: boolean;
  updateMatch: (updated: Match) => Promise<void>;
}


const MatchesSection: React.FC<MatchesSectionProps> = ({
  upcoming,
  previous,
  isAdmin,
  updateMatch
}) => {
  return (
    <section className={styles.section} aria-labelledby="matches-heading">
      <h2 id="matches-heading" className={styles.heading}>
        Matches
      </h2>
      <div className={styles.column}>
        <UpcomingMatches matches={upcoming} isAdmin={isAdmin} updateMatch={updateMatch} />
        <PreviousResults matches={previous} updateMatch={updateMatch} />
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
