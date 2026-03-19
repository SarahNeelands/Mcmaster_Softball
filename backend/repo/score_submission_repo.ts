import { pool } from "../database/db";
import { Match } from "../../types/match_mod";
import { ScoreSubmissionLink, ScoreSubmissionSide } from "../../types/score_submission_mod";

export type MatchWithTeams = Match & {
  home_team_name: string;
  away_team_name: string;
  home_captain_email: string;
  away_captain_email: string;
};

export async function getMatchById(matchId: string) {
  const { rows } = await pool.query<Match>(
    `SELECT *
     FROM matches
     WHERE id = $1`,
    [matchId]
  );

  return rows[0] ?? null;
}

export async function getMatchWithTeamsById(matchId: string) {
  const { rows } = await pool.query<MatchWithTeams>(
    `SELECT
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM matches m
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE m.id = $1`,
    [matchId]
  );

  return rows[0] ?? null;
}

export async function getMatchByTokenHash(tokenHash: string) {
  const { rows } = await pool.query<{
    link_id: string;
    link_match_id: string;
    link_side: ScoreSubmissionSide;
    link_token_hash: string;
    link_email_sent_at: string | null;
    link_expires_at: string;
    link_submitted_home_score: number | null;
    link_submitted_away_score: number | null;
    link_submitted_at: string | null;
    link_used_at: string | null;
    link_created_at: string;
  } & MatchWithTeams>(
    `SELECT
       l.id AS link_id,
       l.match_id AS link_match_id,
       l.side AS link_side,
       l.token_hash AS link_token_hash,
       l.email_sent_at AS link_email_sent_at,
       l.expires_at AS link_expires_at,
       l.submitted_home_score AS link_submitted_home_score,
       l.submitted_away_score AS link_submitted_away_score,
       l.submitted_at AS link_submitted_at,
       l.used_at AS link_used_at,
       l.created_at AS link_created_at,
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM score_submission_links l
     JOIN matches m ON m.id = l.match_id
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE l.token_hash = $1`,
    [tokenHash]
  );

  return rows[0] ?? null;
}

export async function getLinksForMatch(matchId: string) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `SELECT *
     FROM score_submission_links
     WHERE match_id = $1
     ORDER BY side ASC`,
    [matchId]
  );

  return rows;
}

export async function getLinkByMatchAndSide(matchId: string, side: ScoreSubmissionSide) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `SELECT *
     FROM score_submission_links
     WHERE match_id = $1 AND side = $2`,
    [matchId, side]
  );

  return rows[0] ?? null;
}

export async function insertLink(input: {
  matchId: string;
  side: ScoreSubmissionSide;
  tokenHash: string;
  expiresAt: string;
}) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `INSERT INTO score_submission_links (match_id, side, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (match_id, side) DO NOTHING
     RETURNING *`,
    [input.matchId, input.side, input.tokenHash, input.expiresAt]
  );

  return rows[0] ?? null;
}

export async function markEmailSent(linkId: string) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `UPDATE score_submission_links
     SET email_sent_at = COALESCE(email_sent_at, NOW())
     WHERE id = $1
     RETURNING *`,
    [linkId]
  );

  return rows[0] ?? null;
}

export async function rotatePendingLinkToken(input: {
  linkId: string;
  tokenHash: string;
  expiresAt: string;
}) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `UPDATE score_submission_links
     SET token_hash = $2,
         expires_at = $3
     WHERE id = $1
       AND email_sent_at IS NULL
       AND submitted_at IS NULL
       AND used_at IS NULL
     RETURNING *`,
    [input.linkId, input.tokenHash, input.expiresAt]
  );

  return rows[0] ?? null;
}

export async function submitLinkScores(input: {
  linkId: string;
  homeScore: number;
  awayScore: number;
}) {
  const { rows } = await pool.query<ScoreSubmissionLink>(
    `UPDATE score_submission_links
     SET submitted_home_score = $2,
         submitted_away_score = $3,
         submitted_at = COALESCE(submitted_at, NOW()),
         used_at = COALESCE(used_at, NOW())
     WHERE id = $1
       AND submitted_at IS NULL
       AND used_at IS NULL
     RETURNING *`,
    [input.linkId, input.homeScore, input.awayScore]
  );

  return rows[0] ?? null;
}

export async function updateMatchScoreState(input: {
  matchId: string;
  homeScore?: number | null;
  awayScore?: number | null;
  scoreStatus?: Match["score_status"];
  scoreRequestSentAt?: "now" | null;
  firstSubmittedAt?: "now-if-null" | null;
  finalizedAt?: "now" | null;
  founderNotifiedConflictAt?: "now-if-null" | null;
  founderNotifiedSingleAt?: "now-if-null" | null;
  founderNotifiedNoSubmissionAt?: "now-if-null" | null;
}) {
  const fields: string[] = [];
  const values: Array<string | number | null> = [input.matchId];

  const push = (sql: string, value?: string | number | null) => {
    values.push(value ?? null);
    fields.push(`${sql} = $${values.length}`);
  };

  if (input.homeScore !== undefined) push("home_score", input.homeScore);
  if (input.awayScore !== undefined) push("away_score", input.awayScore);
  if (input.scoreStatus !== undefined) push("score_status", input.scoreStatus);
  if (input.scoreRequestSentAt === "now") fields.push("score_request_sent_at = COALESCE(score_request_sent_at, NOW())");
  if (input.firstSubmittedAt === "now-if-null") fields.push("first_submitted_at = COALESCE(first_submitted_at, NOW())");
  if (input.finalizedAt === "now") fields.push("finalized_at = NOW()");
  if (input.founderNotifiedConflictAt === "now-if-null") {
    fields.push("founder_notified_conflict_at = COALESCE(founder_notified_conflict_at, NOW())");
  }
  if (input.founderNotifiedSingleAt === "now-if-null") {
    fields.push("founder_notified_single_at = COALESCE(founder_notified_single_at, NOW())");
  }
  if (input.founderNotifiedNoSubmissionAt === "now-if-null") {
    fields.push("founder_notified_no_submission_at = COALESCE(founder_notified_no_submission_at, NOW())");
  }

  if (fields.length === 0) {
    return getMatchById(input.matchId);
  }

  const { rows } = await pool.query<Match>(
    `UPDATE matches
     SET ${fields.join(", ")}
     WHERE id = $1
     RETURNING *`,
    values
  );

  return rows[0] ?? null;
}

export async function getMatchesNeedingScoreRequests(windowEndIso: string) {
  const { rows } = await pool.query<MatchWithTeams>(
    `SELECT
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM matches m
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE m.editing_status <> 'deleted'
       AND m.home_score IS NULL
       AND m.away_score IS NULL
       AND (m.score_status = 'unrequested' OR m.score_status = 'awaiting_scores')
       AND (
         (
           m.score_request_sent_at IS NULL
           AND (
             CASE
               WHEN m.time ~* '^[0-9]{1,2}:[0-9]{2}\\s*(AM|PM)$'
                 THEN TO_TIMESTAMP(m.date || ' ' || m.time, 'YYYY-MM-DD HH12:MI AM')
               ELSE TO_TIMESTAMP(m.date || ' ' || m.time, 'YYYY-MM-DD HH24:MI')
             END
           ) <= $1::timestamptz
           AND (
             CASE
               WHEN m.time ~* '^[0-9]{1,2}:[0-9]{2}\\s*(AM|PM)$'
                 THEN TO_TIMESTAMP(m.date || ' ' || m.time, 'YYYY-MM-DD HH12:MI AM')
               ELSE TO_TIMESTAMP(m.date || ' ' || m.time, 'YYYY-MM-DD HH24:MI')
             END
           ) > NOW()
         )
         OR EXISTS (
           SELECT 1
           FROM score_submission_links l
           WHERE l.match_id = m.id
             AND l.email_sent_at IS NULL
             AND l.submitted_at IS NULL
             AND l.used_at IS NULL
         )
       )
     ORDER BY m.date, m.time`,
    [windowEndIso]
  );

  return rows;
}

export async function getMatchesReadyForSingleSidePublish() {
  const { rows } = await pool.query<MatchWithTeams>(
    `SELECT
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM matches m
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE m.score_status IN ('awaiting_scores', 'published_single_submission')
       AND m.first_submitted_at IS NOT NULL
       AND m.first_submitted_at <= NOW() - INTERVAL '24 hours'
       AND m.founder_notified_single_at IS NULL`
  );

  return rows;
}

export async function getMatchesReadyForNoSubmissionNotice() {
  const { rows } = await pool.query<MatchWithTeams>(
    `SELECT
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM matches m
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE m.score_request_sent_at IS NOT NULL
       AND m.score_request_sent_at <= NOW() - INTERVAL '24 hours'
       AND m.home_score IS NULL
       AND m.away_score IS NULL
       AND m.first_submitted_at IS NULL
       AND m.founder_notified_no_submission_at IS NULL
       AND m.score_status IN ('awaiting_scores', 'unrequested', 'expired_no_submission')`
  );

  return rows;
}

export async function getMatchesNeedingConflictNotice() {
  const { rows } = await pool.query<MatchWithTeams>(
    `SELECT
       m.*,
       ht.name AS home_team_name,
       at.name AS away_team_name,
       ht.captain_email AS home_captain_email,
       at.captain_email AS away_captain_email
     FROM matches m
     JOIN teams ht ON ht.id = m.home_team_id
     JOIN teams at ON at.id = m.away_team_id
     WHERE m.score_status = 'conflict_pending_founder'
       AND m.founder_notified_conflict_at IS NULL`
  );

  return rows;
}
