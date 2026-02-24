

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
    editing_status TEXT NOT NULL CHECK (editing_status IN ('deleted','draft','published'))
);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  home_team_id TEXT NOT NULL,
  away_team_id TEXT NOT NULL,
  field TEXT NOT NULL,
  home_score INT DEFAULT NULL,
  away_score INT DEFAULT NULL,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('deleted','draft','published')),
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE
);

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

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  advance_amount INT NOT NULL DEFAULT 1,
  demote_amount INT NOT NULL DEFAULT 1
);

CREATE TABLE divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  edit_status TEXT NOT NULL CHECK (edit_status IN ('draft','published','deleted')),
  win_points INT NOT NULL DEFAULT 2,
  loss_points INT NOT NULL DEFAULT 0,
  tie_points INT NOT NULL DEFAULT 1,


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
  season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
);

CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  ties INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  PRIMARY KEY (division_id, team_id),
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  editing_status TEXT NOT NULL CHECK (editing_status IN ('draft','published','deleted'))

);

CREATE TABLE division_teams (
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  PRIMARY KEY (division_id, team_id)
);