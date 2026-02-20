/**
 * PreviousResults.tsx
 * --------------------
 * Presentational component displaying completed match results grouped by date
 * with a table layout that highlights winners and losers.
 */

import React, { useMemo, useState } from "react";
import styles from "./PreviousResults.module.css";
import { Match } from "../../../types/matches";
import { formatDateLabel } from "@/lib/matches/visibilityFunctions";

interface PreviousResultsProps {
  matches: Match[];
  updateMatch: (updated: Match) => Promise<void>;
}

interface GroupedResults {
  date: string;
  timeBlock: {
    time: string;
    games: Match[];
  }[];
}

const PreviousResults: React.FC<PreviousResultsProps> = ({ matches, updateMatch }) => {
  
  // creates team urls
  const slugify = (name?: string) =>
    typeof name === "string"
      ? name.toLowerCase().replace(/\s+/g, "-")
      : "tbd";

  // Tracks which match row is currently being edited
  const [editingId, setEditingId] = useState<string | null>(null);

  // Holds temporary score edits before saving
  const [form, setForm] = useState<Partial<Match>>({});

  // Determines win / loss / tie styling for a team
  const assignTeamStyling = (game: Match, team: "home" | "away") => {
    if (game.homeScore == null || game.awayScore == null) {
      return "";
    }

    if (game.homeScore === game.awayScore) {
      return styles.neutral;
    }

    const isHomeWinner = game.homeScore > game.awayScore;
    if (team === "home") {
      return isHomeWinner ? styles.win : styles.loss;
    }
    return isHomeWinner ? styles.loss : styles.win;
  };

  // Groups completed matches by date → time
  const formatGames = (matches: Match[]): GroupedResults[] => {
    const grouped: GroupedResults[] = [];
    matches.forEach((match) => {
      const date = match.date;
      let group = grouped.find((g) => g.date === date);
      if (!group) {
        group = { date, timeBlock: [] };
        grouped.push(group);
      }
      let timeBlock = group.timeBlock.find((t) => t.time === match.time);
      if (!timeBlock) {
        timeBlock = { time: match.time, games: [] };
        group.timeBlock.push(timeBlock);
      }
      timeBlock.games.push(match);
    });
    return grouped;
  };
  const formattedGames = formatGames(matches);

  // shows - instead of null / undefined scores
  const formatScore = (score: number | undefined | null) =>
    typeof score === "number" ? score.toString() : "-";
  console.log("PREVIOUS MATCHES PROP:", matches);
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h3>Previous Results</h3>

        
        {editingId && (
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.editButton}
              onClick={async () => {
                await updateMatch({ ...(form as Match), id: editingId});
                setEditingId(null);
                setForm({});
              }}
            >
              Save
            </button>
            <button
              type="button"
              className={styles.editButton}
              onClick={() => {
                setEditingId(null);
                setForm({});
              }}
            >
              Cancel
            </button>
          </div>
        )}


      </div>
      <div className={styles.headerDivider} aria-hidden="true" />
      <div className={styles.groupList}>
        {formattedGames.map((group) => (
          <article key={group.date} className={styles.group}>
            <h4 className={styles.date}>
              {formatDateLabel(group.date)}
            </h4>
            {group.timeBlock.map((times) => (

              <div key={times.time} className={styles.times}>
                
                <span className={styles.time}>{times.time}</span>
                <div className={styles.table} role="table">
                  {times.games.map((game) => (

                    <div key={game.id} className={styles.row} role="row">
                  <span className={styles.score} role="cell">
                    {editingId === game.id ? (
                      <input
                        className={styles.inlineInput}
                        type="number"
                        value={form.homeScore ?? game.homeScore ?? 0}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, homeScore: Number(e.target.value) }))
                        }
                      />
                    ) : (
                      formatScore(game.homeScore)
                    )}
                  </span>
                  <a
                    href={`/teams/${slugify(game.homeTeam)}`}
                    className={`${styles.team} ${assignTeamStyling(game, "home")}`}
                    role="cell"
                      >
                        {game.homeTeam}
                      </a>
                      <span className={styles.vs} role="cell">
                        vs
                      </span>
                      <a
                        href={`/teams/${slugify(game.awayTeam)}`}
                        className={`${styles.team} ${assignTeamStyling(game, "away")}`}
                        role="cell"
                      >
                        {game.awayTeam}
                      </a>
                  <span className={styles.score} role="cell">
                    {editingId === game.id ? (
                      <input
                        className={styles.inlineInput}
                        type="number"
                        value={form.awayScore ?? game.awayScore ?? 0}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, awayScore: Number(e.target.value) }))
                        }
                      />
                    ) : (
                      formatScore(game.awayScore)
                    )}
                  </span>
                  {editingId !== game.id && (
                    <button
                      type="button"
                      className={styles.rowEdit}
                      onClick={() => {
                        setEditingId(game.id);
                        setForm(game);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
            </div>
              </div>
            ))}
          </article>
        ))}
        {formattedGames.length === 0 && (
          <p className={styles.emptyState}>No results to display yet.</p>
        )}
      </div>
    </section>
  );
};

export default PreviousResults;
