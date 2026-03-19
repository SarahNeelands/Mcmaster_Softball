ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS score_status TEXT NOT NULL DEFAULT 'unrequested';

ALTER TABLE matches
  DROP CONSTRAINT IF EXISTS matches_score_status_check;

ALTER TABLE matches
  ADD CONSTRAINT matches_score_status_check CHECK (
    score_status IN (
      'unrequested',
      'awaiting_scores',
      'conflict_pending_founder',
      'published_single_submission',
      'finalized',
      'expired_no_submission'
    )
  );

ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS score_request_sent_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS first_submitted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS founder_notified_conflict_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS founder_notified_single_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS founder_notified_no_submission_at TIMESTAMPTZ DEFAULT NULL;

CREATE TABLE IF NOT EXISTS score_submission_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('home', 'away')),
  token_hash TEXT NOT NULL UNIQUE,
  email_sent_at TIMESTAMPTZ DEFAULT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  submitted_home_score INT DEFAULT NULL,
  submitted_away_score INT DEFAULT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NULL,
  used_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (match_id, side)
);
