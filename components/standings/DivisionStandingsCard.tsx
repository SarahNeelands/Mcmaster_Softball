"use client";

import Link from "next/link";
import { DragEvent, useEffect, useState } from "react";
import styles from "./DivisionStandingsCard.module.css";
import type { Division } from "@/types/division_mod";
import type { Standing } from "@/types/standing_mod";
import type { Team } from "@/types/team_mod";

type Props = {
  division: Division;
  advanceAmount?: number;
  demoteAmount?: number;
  teamBasePath?: string;
  isAdmin?: boolean;
  startInEditMode?: boolean;
  onSaveDivision?: (division: Division) => Promise<void>;
  onDeleteDivision?: (division: Division) => Promise<void>;
  onCancelCreate?: () => void;
  onDragTeam?: (team_id: string, division_id: string) => void;
  onDropTeam?: (target_division_id: string) => Promise<void>;
  teamRows?: Team[];
  hideScores?: boolean;
  isHoldingArea?: boolean;
};

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function hrefForTeam(teamBasePath: string, teamSlug: string) {
  if (!teamSlug) return teamBasePath;
  if (teamSlug.startsWith("/")) return teamSlug;
  return `${teamBasePath.replace(/\/$/, "")}/${teamSlug}`;
}

export default function DivisionStandingsCard({
  division,
  advanceAmount = 0,
  demoteAmount = 0,
  teamBasePath = "/teams",
  isAdmin = false,
  startInEditMode = false,
  onSaveDivision,
  onDeleteDivision,
  onCancelCreate,
  onDragTeam,
  onDropTeam,
  teamRows = [],
  hideScores = false,
  isHoldingArea = false,
}: Props) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [draft, setDraft] = useState<Division>(division);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    setDraft(division);
  }, [division]);

  useEffect(() => {
    setIsEditing(startInEditMode);
  }, [startInEditMode]);

  const rows: Standing[] = [...division.standings].sort((a, b) => b.points - a.points);
  const showingTeamRows = isHoldingArea;

  const handleSave = async () => {
    if (!onSaveDivision) return;
    await onSaveDivision(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft(division);
    setIsEditing(false);
    if (!division.id && onCancelCreate) {
      onCancelCreate();
    }
  };

  const handleDragStart = (team_id: string) => {
    if (!onDragTeam) return;
    onDragTeam(team_id, division.id);
  };

  const handleDragOver = (event: DragEvent<HTMLElement>) => {
    if (!isAdmin || !onDropTeam || isEditing) return;
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (event: DragEvent<HTMLElement>) => {
    if (!isAdmin || !onDropTeam || isEditing || !division.id) return;
    event.preventDefault();
    setIsDragOver(false);
    await onDropTeam(division.id);
  };

  return (
    <section
      className={`${styles.card} ${isDragOver ? styles.dragOver : ""}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.header}>
        {isEditing ? (
          <input
            className={styles.titleInput}
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Division name"
          />
        ) : (
          <h3 className={styles.title}>{division.name}</h3>
        )}
        {!hideScores && <span className={styles.scoreLabel}>Score</span>}
      </div>

      {isEditing && !isHoldingArea && (
        <div className={styles.editorGrid}>
          <label className={styles.editorField}>
            <span>Win Points</span>
            <input
              type="number"
              value={draft.win_points}
              onChange={(e) => setDraft((prev) => ({ ...prev, win_points: Number(e.target.value) }))}
            />
          </label>
          <label className={styles.editorField}>
            <span>Loss Points</span>
            <input
              type="number"
              value={draft.loss_points}
              onChange={(e) => setDraft((prev) => ({ ...prev, loss_points: Number(e.target.value) }))}
            />
          </label>
          <label className={styles.editorField}>
            <span>Tie Points</span>
            <input
              type="number"
              value={draft.tie_points}
              onChange={(e) => setDraft((prev) => ({ ...prev, tie_points: Number(e.target.value) }))}
            />
          </label>
        </div>
      )}

      <ul className={styles.list}>
        {showingTeamRows &&
          teamRows.map((team) => (
            <li
              key={`${division.id || "unassigned"}-${team.id}`}
              className={`${styles.row} ${isAdmin && !isEditing ? styles.draggableRow : ""}`}
              draggable={isAdmin && !isEditing}
              onDragStart={() => handleDragStart(team.id)}
            >
              <div className={styles.left}>
                <span className={styles.unassignedLabel}>Unassigned</span>
                <Link
                  href={hrefForTeam(teamBasePath, team.slug)}
                  className={styles.teamLink}
                  title={team.name}
                >
                  {team.name}
                </Link>
              </div>
            </li>
          ))}

        {!showingTeamRows && rows.map((standing, idx) => {
          const rank = idx + 1;
          const isPromoted = advanceAmount > 0 && idx < advanceAmount;
          const isRelegated =
            demoteAmount > 0 && idx >= Math.max(0, rows.length - demoteAmount);

          return (
            <li
              key={`${division.id}-${standing.team.id}`}
              className={`${styles.row} ${isAdmin && !isEditing ? styles.draggableRow : ""}`}
              draggable={isAdmin && !isEditing}
              onDragStart={() => handleDragStart(standing.team.id)}
            >
              <div className={styles.left}>
                <div className={styles.rank}>
                  <span className={styles.rankText}>{ordinal(rank)}</span>
                </div>

                <Link
                  href={hrefForTeam(teamBasePath, standing.team.slug)}
                  className={styles.teamLink}
                  title={standing.team.name}
                >
                  {standing.team.name}
                </Link>

                {isPromoted && <span className={`${styles.arrow} ${styles.up}`}>^</span>}
                {isRelegated && <span className={`${styles.arrow} ${styles.down}`}>v</span>}
              </div>

              <div className={styles.points}>{standing.points}</div>
            </li>
          );
        })}
      </ul>

      {showingTeamRows && teamRows.length === 0 && (
        <div className={styles.emptyState}>No unassigned teams.</div>
      )}

      {isAdmin && !isHoldingArea && (
        <div className={styles.actions}>
          {isEditing ? (
            <>
              <button type="button" className={styles.actionButton} onClick={handleSave}>
                Save
              </button>
              <button type="button" className={styles.secondaryButton} onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" className={styles.actionButton} onClick={() => setIsEditing(true)}>
                Edit
              </button>
              {onDeleteDivision && (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => onDeleteDivision(division)}
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
