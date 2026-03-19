export type ScoreSubmissionSide = "home" | "away";

export type ScoreSubmissionLink = {
  id: string;
  match_id: string;
  side: ScoreSubmissionSide;
  token_hash: string;
  email_sent_at: string | null;
  expires_at: string;
  submitted_home_score: number | null;
  submitted_away_score: number | null;
  submitted_at: string | null;
  used_at: string | null;
  created_at: string;
};
