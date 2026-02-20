# Teams & Games - Supabase Schema Guide

This mirrors the mock data used in the Next.js pages so you can swap the mock provider for live Supabase queries with minimal code changes.

## Tables

### teams
| column | type | notes |
| --- | --- | --- |
| id | uuid (pk) | use gen_random_uuid() |
| slug | text (unique) | url-safe version of name |
| name | text | |
| captainName | text | |
| captainEmail | text | admin-only |
| coCaptainName | text | |
| coCaptainEmail | text | admin-only |
| division | text | optional |
| currentRanking | int | denormalized convenience |
| inserted_at / updated_at | timestamptz | defaults |

### standings
| column | type | notes |
| --- | --- | --- |
| id | uuid (pk) | |
| seasonId | uuid | fk -> seasons.id |
| teamId | uuid | fk -> teams.id |
| wins | int | |
| losses | int | |
| ties | int | |
| points | int | |
| pod | text | optional (division/pod) |
| ranking | int | optional |

### games
| column | type | notes |
| --- | --- | --- |
| id | uuid (pk) | |
| seasonId | uuid | fk -> seasons.id |
| date | date | |
| time | time | |
| field | text | |
| teamAId | uuid | fk -> teams.id |
| teamBId | uuid | fk -> teams.id |
| scoreA | int | nullable |
| scoreB | int | nullable |
| status | text | enum: upcoming, final, cancelled, postponed |
| isPlayoff | boolean | optional |

### players (optional roster)
| column | type | notes |
| --- | --- | --- |
| id | uuid (pk) | |
| teamId | uuid | fk -> teams.id |
| name | text | |
| genderIdentity | text | optional |

## How the mock data maps
- data/mockTeams.ts exports arrays shaped exactly like the tables above (teams, standings, games, players).
- data/teamsClient.ts is the only access point the UI uses. Swap its functions for Supabase queries and keep the same return types.

## Replacing the mock client with Supabase
Pseudo-code for each function in data/teamsClient.ts:

```ts
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function listTeams() {
  const { data, error } = await supabase.from("teams").select("*").order("name", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getTeamDetailBySlug(slug: string) {
  const { data: team } = await supabase.from("teams").select("*").eq("slug", slug).single();
  if (!team) return { team: undefined, roster: [], games: [] };

  const [{ data: standing }, { data: roster }, { data: games }] = await Promise.all([
    supabase.from("standings").select("*").eq("teamId", team.id).maybeSingle(),
    supabase.from("players").select("*").eq("teamId", team.id),
    supabase.from("games").select("*").or(`teamAId.eq.${team.id},teamBId.eq.${team.id}`),
  ]);

  return { team, standing, roster: roster ?? [], games: games ?? [] };
}
```

Admin-only data (emails) stays server-side; keep Row Level Security to allow only admins to read those columns. In the UI, admin mode currently toggles via isAdmin state; wire that to your auth context/session and conditionally omit email fields from queries for non-admins.
