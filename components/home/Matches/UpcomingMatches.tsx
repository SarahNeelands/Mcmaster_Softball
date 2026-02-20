"use client";

import React, { useState } from "react";
import styles from "./UpcomingMatches.module.css";
import { Match } from "../../../types/matches";

interface UpcomingMatchesProps {
  matches: Match[];
  isAdmin: boolean;
  updateMatch?: (updated: Match) => Promise<Match>;
  onAddGames?: () => void;
  useCardGroups?: boolean;
}

interface GroupedDay {
  date: string;
  blocks: {
    time: string;
    games: Match[];
  }[];
}

export default function UpcomingMatches({
  matches,
  isAdmin,
  updateMatch,
  onAddGames,
  useCardGroups = false,
}: UpcomingMatchesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Record<string, Match>>({});

  /* ---------------- grouping ---------------- */

  const grouped: GroupedDay[] = [];

  const source = isEditing ? Object.values(formState) : matches;

  source.forEach((m) => {
    let day = grouped.find((d) => d.date === m.date);
    if (!day) {
      day = { date: m.date, blocks: [] };
      grouped.push(day);
    }

    let block = day.blocks.find((b) => b.time === m.time);
    if (!block) {
      block = { time: m.time, games: [] };
      day.blocks.push(block);
    }

    block.games.push(m);
  });

  /* ---------------- editing ---------------- */

  const startEdit = () => {
    if (!updateMatch) return;

    const next: Record<string, Match> = {};
    matches.forEach((m) => (next[m.id] = { ...m }));
    setFormState(next);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormState({});
  };

  const saveEdit = async () => {
    if (!updateMatch) return;

    await Promise.all(
      Object.values(formState).map((m) => updateMatch(m))
    );

    setIsEditing(false);
    setFormState({});
  };

  const updateField = (id: string, patch: Partial<Match>) => {
    setFormState((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...patch },
    }));
  };

  /* ---------------- formatting ---------------- */

  const formatDateLabel = (date: string) => {
    const [, month, day] = date.split("-").map(Number);
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ];
    return `${months[month - 1]} ${day}`;
  };

  /* ---------------- render ---------------- */

  return (
    <section className={styles.panel}>
      {isAdmin && (
        <div className={styles.actions}>
          {!isEditing && (
            <>
              {onAddGames && (
                <button className={styles.editButton} onClick={onAddGames}>
                  + Add Games
                </button>
              )}
              {updateMatch && (
                <button className={styles.editButton} onClick={startEdit}>
                  Edit
                </button>
              )}
            </>
          )}

          {isEditing && (
            <>
              <button className={styles.editButton} onClick={saveEdit}>
                Save
              </button>
              <button className={styles.editButton} onClick={cancelEdit}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      <div
        className={`${useCardGroups ? styles.cardGrid : styles.groupList} ${
          !isEditing ? styles.readOnly : ""
        }`}
      >
        {grouped.map((day) => (
          <article key={day.date} className={styles.groupCard}>
            {/* DATE */}
            <h4 className={styles.date}>
              {isEditing ? (
                <input
                  type="date"
                  value={day.date}
                  onChange={(e) =>
                    day.blocks.forEach((b) =>
                      b.games.forEach((g) =>
                        updateField(g.id, { date: e.target.value })
                      )
                    )
                  }
                />
              ) : (
                formatDateLabel(day.date)
              )}
            </h4>

            {day.blocks.map((block) => (
              <div key={block.time} className={styles.timeBlock}>
                {/* TIME */}
                <div className={styles.timeRow}>
                  {isEditing ? (
                    <input
                      type="time"
                      value={block.time}
                      onChange={(e) =>
                        block.games.forEach((g) =>
                          updateField(g.id, { time: e.target.value })
                        )
                      }
                    />
                  ) : (
                    <span className={styles.time}>{block.time}</span>
                  )}
                </div>

                {/* GAMES */}
                <div className={styles.games}>
                  {block.games.map((g) => (
                    <div key={g.id} className={styles.gameRow}>
                      {isEditing ? (
                        <>
                          <input
                            value={formState[g.id]?.homeTeam ?? ""}
                            onChange={(e) =>
                              updateField(g.id, { homeTeam: e.target.value })
                            }
                          />
                          <span className={styles.fieldInfo}>
                            <input
                              value={formState[g.id]?.field ?? ""}
                              onChange={(e) =>
                                updateField(g.id, { field: e.target.value })
                              }
                            />
                          </span>
                          <input
                            value={formState[g.id]?.awayTeam ?? ""}
                            onChange={(e) =>
                              updateField(g.id, { awayTeam: e.target.value })
                            }
                          />
                        </>
                      ) : (
                        <>
                          <span className={styles.team}>{g.homeTeam}</span>
                          <span className={styles.fieldInfo}>{g.field}</span>
                          <span className={styles.team}>{g.awayTeam}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
