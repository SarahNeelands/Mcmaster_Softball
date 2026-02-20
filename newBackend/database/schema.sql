CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    field TEXT NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    editing_status TEXT NOT NULL CHECK("deleted" | "draft" | "published")
)
