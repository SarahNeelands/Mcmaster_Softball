/**
 * TeamTable.tsx
 * -------------
 * Shared teams list table. Shows public view by default and exposes email
 * columns + actions when isAdmin is true.
 */

import React, { useMemo, useState } from "react";
import styles from "./TeamTable.module.css";
import type { Team } from "@/types/teams";

interface Props {
  teams: Team[];
  isAdmin: boolean;
  onTeamUpdate?: (updatedTeam: Team) => Promise<void>;
  onTeamDelete?: (id: string) => Promise<void>;
}

const TeamTable: React.FC<Props> = ({ teams, isAdmin, onTeamUpdate, onTeamDelete }) => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      teams.filter((team) =>
        team.name.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [teams, query]
  );

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h1 className={styles.title}>Teams</h1>
        <div className={styles.controls}>
          <input
            className={styles.searchBar}
            type="search"
            placeholder="Search teams"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isAdmin && <span className={styles.badge}>Admin view</span>}
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Captain</th>
            <th>Co-Captain</th>
            <th>Ranking</th>
            {isAdmin && <th>Captain Email</th>}
            {isAdmin && <th>Co-Captain Email</th>}
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filtered.map((team) => (
            <tr key={team.id}>
              <td data-label="Team">
                <a className={styles.teamLink} href={`/teams/${team.slug}`}>
                  {team.name}
                </a>
              </td>
              <td data-label="Captain">{team.captainName}</td>
              <td data-label="Co-Captain">{team.coCaptainName}</td>
              <td data-label="Ranking">
                {team.currentRanking ? `#${team.currentRanking}` : "—"}
              </td>
              {isAdmin && (
                <td data-label="Captain Email" className={styles.muted}>
                  {team.captainEmail}
                </td>
              )}
              {isAdmin && (
                <td data-label="Co-Captain Email" className={styles.muted}>
                  {team.coCaptainEmail}
                </td>
              )}
              {isAdmin && (
                <td data-label="Actions">
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => 
                        window.location.href = `/teams/${team.slug}/edit`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.actionButton}
                      onClick={() => {
                        if (confirm(`Delete ${team.name}? This can't be undone.`)) {
                          onTeamDelete?.(team.id);
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td className={styles.emptyState} colSpan={isAdmin ? 7 : 4}>
                No teams match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TeamTable;
