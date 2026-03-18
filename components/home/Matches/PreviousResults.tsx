/**
 * PreviousResults.tsx
 * --------------------
 * Presentational component displaying completed match results grouped by date
 * with a table layout that highlights winners and losers.
 */

import React, { useMemo, useState } from "react";
import styles from "./PreviousResults.module.css";
import { Match } from "@/types/match_mod";
import { formatDateLabel } from "@/lib/matches/visibilityFunctions";

interface PreviousResultsProps {
  matches: Match[];
  teamNamesById?: Record<string, string>;
  teamSlugsById?: Record<string, string>;
  updateMatch: (updated: Match) => Promise<void>;
}

interface GroupedResults {
  date: string;
  timeBlock: {
    time: string;
    games: Match[];
  }[];
}

const PreviousResults: React.FC<PreviousResultsProps> = ({
  matches,
  teamNamesById = {},
  teamSlugsById = {},
  updateMatch,
}) => {
  const getTeamName = (teamId: string) => teamNamesById[teamId] ?? teamId;
  const getTeamSlug = (teamId: string) => teamSlugsById[teamId] ?? "tbd";

  // Tracks which match row is currently being edited
  const [editingId, setEditingId] = useState<string | null>(null);

  // Holds temporary score edits before saving
  const [form, setForm] = useState<Partial<Match>>({});

  // Determines win / loss / tie styling for a team
  const assignTeamStyling = (game: Match, team: "home" | "away") => {
    if (game.home_score == null || game.away_score == null) {
      return "";
    }

    if (game.home_score === game.away_score) {
      return styles.neutral;
    }

    const isHomeWinner = game.home_score > game.away_score;
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
  const formattedGames = useMemo(() => formatGames(matches), [matches]);

  // shows - instead of null / undefined scores
  const formatScore = (score: number | undefined | null) =>
    typeof score === "number" ? score.toString() : "-";
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
              <div key={times.time} className={styles.timeBlock}>
                <span className={styles.time}>{times.time}</span>
                <div className={styles.table} role="table">
                  {times.games.map((game) => (
                    <div key={game.id} className={styles.row} role="row">
                      <span className={styles.score} role="cell">
                        {editingId === game.id ? (
                          <input
                            className={styles.inlineInput}
                            type="number"
                            value={form.home_score ?? game.home_score ?? 0}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, home_score: Number(e.target.value) }))
                            }
                          />
                        ) : (
                          formatScore(game.home_score)
                        )}
                      </span>
                      <a
                        href={`/teams/${getTeamSlug(game.home_team_id)}`}
                        className={`${styles.team} ${assignTeamStyling(game, "home")}`}
                        role="cell"
                      >
                        {getTeamName(game.home_team_id)}
                      </a>
                      <span className={styles.vs} role="cell">
                        vs
                      </span>
                      <a
                        href={`/teams/${getTeamSlug(game.away_team_id)}`}
                        className={`${styles.team} ${assignTeamStyling(game, "away")}`}
                        role="cell"
                      >
                        {getTeamName(game.away_team_id)}
                      </a>
                      <span className={styles.score} role="cell">
                        {editingId === game.id ? (
                          <input
                            className={styles.inlineInput}
                            type="number"
                            value={form.away_score ?? game.away_score ?? 0}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, away_score: Number(e.target.value) }))
                            }
                          />
                        ) : (
                          formatScore(game.away_score)
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
