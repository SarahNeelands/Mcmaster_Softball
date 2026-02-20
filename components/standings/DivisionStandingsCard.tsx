"use client";

import Link from "next/link";
import styles from "./DivisionStandingsCard.module.css";
import type { Division } from "@/types/seasons";
import type { Team } from "@/types/teams";

type Row = {
  teamID: string;
  name: string;
  slug: string;
  points: number;
};

type Props = {
  division: Division;

  /** Teams that belong to THIS division (already filtered by the page) */
  teams: Team[];

  /** From Series */
  moveUpAmount?: number;
  moveDownAmount?: number;

  /** Team page base path (default: "/teams") */
  teamBasePath?: string;

  /** If a team is missing a standing entry, keep it with 0 points (default true) */
  includeTeamsMissingStandings?: boolean;
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
  teams,
  moveUpAmount = 0,
  moveDownAmount = 0,
  teamBasePath = "/teams",
  includeTeamsMissingStandings = true,
}: Props) {
  const standingByTeamID = new Map<string, number>();
  for (const s of division.standings) {
    standingByTeamID.set(s.teamID, s.points ?? 0);
  }

  const rows: Row[] = teams
    .map((t) => {
      const points = standingByTeamID.get(t.id);

      if (points === undefined && !includeTeamsMissingStandings) {
        return null;
      }

      return {
        teamID: t.id,
        name: t.name,
        slug: t.slug,
        points: points ?? 0,
      };
    })
    .filter((x): x is Row => x !== null)
    .sort((a, b) => b.points - a.points);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{division.name}</h3>
        <span className={styles.scoreLabel}>Score</span>
      </div>

      <ul className={styles.list}>
        {rows.map((t, idx) => {
          const rank = idx + 1;

          const isPromoted = moveUpAmount > 0 && idx < moveUpAmount;
          const isRelegated =
            moveDownAmount > 0 && idx >= Math.max(0, rows.length - moveDownAmount);

          return (
            <li key={`${division.id}-${t.teamID}`} className={styles.row}>
              <div className={styles.left}>
                <div className={styles.rank}>
                  <span className={styles.rankText}>{ordinal(rank)}</span>
                  {rank === 1 && <span className={styles.medal}>🥇</span>}
                  {rank === 2 && <span className={styles.medal}>🥈</span>}
                </div>

                <Link
                  href={hrefForTeam(teamBasePath, t.slug)}
                  className={styles.teamLink}
                  title={t.name}
                >
                  {t.name}
                </Link>

                {isPromoted && <span className={`${styles.arrow} ${styles.up}`}>▲</span>}
                {isRelegated && <span className={`${styles.arrow} ${styles.down}`}>▼</span>}
              </div>

              <div className={styles.points}>{t.points}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
