CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) independent tables first

CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted'))
);

CREATE TABLE rule_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES rules(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  alt TEXT NOT NULL
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  captain_name TEXT NOT NULL,
  captain_email TEXT NOT NULL,
  co_captain_name TEXT NOT NULL,
  co_captain_email TEXT NOT NULL,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted'))
);

-- 2) season hierarchy
CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted'))
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('deleted','draft','published'))
);


CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  advance_amount INT NOT NULL DEFAULT 1,
  demote_amount INT NOT NULL DEFAULT 1,
  editing_status TEXT NOT NULL DEFAULT 'draft' CHECK (editing_status IN ('draft','published','deleted'))
);

CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted')),
  win_points INT NOT NULL DEFAULT 2,
  loss_points INT NOT NULL DEFAULT 0,
  tie_points INT NOT NULL DEFAULT 1
);

-- 3) tables that depend on divisions / teams
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  field TEXT NOT NULL,
  home_score INT DEFAULT NULL,
  away_score INT DEFAULT NULL,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('deleted','draft','published')),
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE
);

CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  ties INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted')),
  UNIQUE (division_id, team_id)
);

-- 4) join tables
CREATE TABLE season_teams (
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (season_id, team_id)
);

CREATE TABLE series_team_divisions (
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  PRIMARY KEY (series_id, team_id)
);

create table admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);
