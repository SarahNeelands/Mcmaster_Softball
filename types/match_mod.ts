export type Match ={
  id: string;
  date: string;
  time: string;
  home_team_id: string;
  away_team_id: string;
  field: string;
  division_id: string;
  home_score: number | null;
  away_score: number | null;
  score_status:
    | "unrequested"
    | "awaiting_scores"
    | "conflict_pending_founder"
    | "published_single_submission"
    | "finalized"
    | "expired_no_submission";
  score_request_sent_at: string | null;
  first_submitted_at: string | null;
  finalized_at: string | null;
  founder_notified_conflict_at: string | null;
  founder_notified_single_at: string | null;
  founder_notified_no_submission_at: string | null;
  editing_status: string;
}
