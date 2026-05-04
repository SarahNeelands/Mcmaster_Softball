"use client";

import React, { useState } from "react";
import styles from "./UpcomingMatches.module.css";
import { Match } from "@/types/match_mod";
import { formatDateLabel, formatTimeLabel } from "@/lib/matches/visibilityFunctions";
import {
  compareFieldNames,
  compareTimes,
} from "@/lib/matches/sortingFunctions";

function isUnassignedTeam(
  team: { id: string; division_id?: string } | undefined,
  emptySlotTeamId: string
) {
  if (!team) return true;
  if (team.id === emptySlotTeamId) return true;
  return !team.division_id;
}

function getSelectableTeamsForDivision(
  teams: { id: string; name: string; division_id?: string }[],
  divisionId: string
) {
  if (!divisionId) return teams;
  return teams.filter((team) => !team.division_id || team.division_id === divisionId);
}

interface UpcomingMatchesProps {
  matches: Match[];
  isAdmin: boolean;
  teamNamesById?: Record<string, string>;
  teamOptions?: { id: string; name: string; division_id?: string }[];
  updateMatch?: (updated: Match) => Promise<unknown>;
  deleteMatch?: (match: Match) => Promise<unknown>;
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
  teamNamesById = {},
  teamOptions = [],
  updateMatch,
  deleteMatch,
  onAddGames,
  useCardGroups = false,
}: UpcomingMatchesProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<Record<string, Match>>({});
  const emptySlotTeam = teamOptions.find((team) => team.name === "Empty");
  const emptySlotTeamId = emptySlotTeam?.id ?? "";

  function getTeamName(teamId: string) {
    return teamNamesById[teamId] ?? teamId;
  }

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

  grouped.sort((a, b) => a.date.localeCompare(b.date));
  grouped.forEach((day) => {
    day.blocks.sort((a, b) => compareTimes(a.time, b.time));
    day.blocks.forEach((block) => {
      block.games.sort((a, b) => {
        const fieldComparison = compareFieldNames(a.field, b.field);
        if (fieldComparison !== 0) return fieldComparison;

        const homeComparison = getTeamName(a.home_team_id).localeCompare(getTeamName(b.home_team_id));
        if (homeComparison !== 0) return homeComparison;

        return getTeamName(a.away_team_id).localeCompare(getTeamName(b.away_team_id));
      });
    });
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

    const normalizedMatches = Object.values(formState).map((match) => {
      const homeTeamId = match.home_team_id || emptySlotTeamId;
      const awayTeamId = match.away_team_id || emptySlotTeamId;
      const homeTeam = selectableTeams.find((team) => team.id === homeTeamId);
      const awayTeam = selectableTeams.find((team) => team.id === awayTeamId);
      const divisionId =
        homeTeam?.division_id ||
        awayTeam?.division_id ||
        (isUnassignedTeam(homeTeam, emptySlotTeamId) && isUnassignedTeam(awayTeam, emptySlotTeamId)
          ? ""
          : match.division_id);

      return {
        ...match,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        division_id: divisionId,
      };
    });

    await Promise.all(
      normalizedMatches.map((match) => updateMatch(match))
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

  const updateTeamsForMatch = (
    matchId: string,
    side: "home" | "away",
    nextTeamId: string
  ) => {
    setFormState((prev) => {
      const current = prev[matchId];
      if (!current) return prev;

      const homeTeamId = side === "home" ? nextTeamId : current.home_team_id;
      const awayTeamId = side === "away" ? nextTeamId : current.away_team_id;
      const homeTeam = selectableTeams.find((team) => team.id === homeTeamId);
      const awayTeam = selectableTeams.find((team) => team.id === awayTeamId);
      const nextDivisionId =
        homeTeam?.division_id ||
        awayTeam?.division_id ||
        (isUnassignedTeam(homeTeam, emptySlotTeamId) && isUnassignedTeam(awayTeam, emptySlotTeamId)
          ? ""
          : current.division_id);

      return {
        ...prev,
        [matchId]: {
          ...current,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          division_id: nextDivisionId,
        },
      };
    });
  };

  const isPastMatch = (match: Match) => {
    const scheduledAt = new Date(`${match.date}T${match.time || "00:00"}`);
    return scheduledAt.getTime() <= Date.now();
  };

  /* ---------------- formatting ---------------- */

  const selectableTeams: { id: string; name: string; division_id?: string }[] = (
    teamOptions.length > 0
      ? teamOptions
      : Object.entries(teamNamesById).map(([id, name]) => ({ id, name }))
  ).sort((a, b) => a.name.localeCompare(b.name));

  const getTeamsForMatch = (match: Match) => {
    const currentMatch = formState[match.id] ?? match;
    const homeTeam = selectableTeams.find((team) => team.id === currentMatch.home_team_id);
    const awayTeam = selectableTeams.find((team) => team.id === currentMatch.away_team_id);
    const effectiveDivisionId =
      homeTeam?.division_id ||
      awayTeam?.division_id ||
      currentMatch.division_id ||
      "";

    const divisionTeams =
      isUnassignedTeam(homeTeam, emptySlotTeamId) && isUnassignedTeam(awayTeam, emptySlotTeamId)
        ? selectableTeams
        : getSelectableTeamsForDivision(selectableTeams, effectiveDivisionId);

    const currentTeams = [currentMatch.home_team_id, currentMatch.away_team_id]
      .map((teamId) => selectableTeams.find((team) => team.id === teamId))
      .filter((team): team is { id: string; name: string; division_id?: string } => Boolean(team));

    return [...divisionTeams, ...currentTeams].filter(
      (team, index, allTeams) =>
        allTeams.findIndex((candidate) => candidate.id === team.id) === index
    );
  };

  /* ---------------- render ---------------- */

  return (
    <section className={styles.panel}>
      {!useCardGroups && (
        <>
          <div className={styles.header}>
            <h3>Upcoming Matches</h3>
          </div>
          <div className={styles.headerDivider} aria-hidden="true" />
        </>
      )}

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
        className={useCardGroups ? styles.cardGrid : styles.groupList}
      >
        {grouped.map((day) => (
          <article
            key={day.date}
            className={useCardGroups ? styles.groupCard : styles.group}
          >
            {/* DATE */}
            <div className={useCardGroups ? undefined : styles.dateHeader}>
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
              {!useCardGroups && !isEditing && (
                <div className={styles.teamColumnLabels} aria-hidden="true">
                  <span className={styles.homeLabel}>Home</span>
                  <span className={styles.awayLabel}>Away</span>
                </div>
              )}
            </div>

            {day.blocks.map((block) => (
              <div
                key={block.time}
                className={useCardGroups ? styles.timeBlock : styles.listTimeBlock}
              >
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
                    <span className={styles.time}>{formatTimeLabel(block.time)}</span>
                  )}
                </div>

                {/* GAMES */}
                <div className={styles.games}>
                  {block.games.map((g) => (
                    <div
                      key={g.id}
                      className={useCardGroups ? styles.gameRow : styles.listGameRow}
                    >
                      {isEditing ? (
                        <>
                          {(() => {
                            const teamChoices = getTeamsForMatch(formState[g.id] ?? g);
                            return (
                              <>
                          <select
                            className={styles.inlineSelect}
                            value={formState[g.id]?.home_team_id ?? ""}
                            onChange={(e) => updateTeamsForMatch(g.id, "home", e.target.value)}
                          >
                            <option value="">Select team</option>
                            {teamChoices.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                          <span className={styles.fieldInfo}>
                            <input
                              className={styles.inlineInput}
                              value={formState[g.id]?.field ?? ""}
                              onChange={(e) =>
                                updateField(g.id, { field: e.target.value })
                              }
                            />
                          </span>
                          <select
                            className={styles.inlineSelect}
                            value={formState[g.id]?.away_team_id ?? ""}
                            onChange={(e) => updateTeamsForMatch(g.id, "away", e.target.value)}
                          >
                            <option value="">Select team</option>
                            {teamChoices.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>
                          {isPastMatch(formState[g.id] ?? g) && (
                            <span className={styles.scoreGroup}>
                              <input
                                className={styles.scoreInput}
                                type="number"
                                value={formState[g.id]?.home_score ?? g.home_score ?? 0}
                                onChange={(e) =>
                                  updateField(g.id, {
                                    home_score: Number(e.target.value),
                                  })
                                }
                              />
                              <span className={styles.scoreSeparator}>-</span>
                              <input
                                className={styles.scoreInput}
                                type="number"
                                value={formState[g.id]?.away_score ?? g.away_score ?? 0}
                                onChange={(e) =>
                                  updateField(g.id, {
                                    away_score: Number(e.target.value),
                                  })
                                }
                              />
                            </span>
                          )}
                              </>
                            );
                          })()}
                        </>
                      ) : (
                        <>
                          <span className={`${styles.team} ${styles.homeTeam}`}>
                            {getTeamName(g.home_team_id)}
                          </span>
                          <span className={styles.fieldInfo}>{g.field}</span>
                          <span className={`${styles.team} ${styles.awayTeam}`}>
                            {getTeamName(g.away_team_id)}
                          </span>
                          {isAdmin && deleteMatch && (
                            <button
                              type="button"
                              className={styles.miniAction}
                              onClick={() => {
                                if (confirm("Delete this match?")) {
                                  void deleteMatch(g);
                                }
                              }}
                            >
                              Delete
                            </button>
                          )}
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
