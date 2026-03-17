import {Team} from "@/types/team_mod"

export type Standing = {
  id: string,
  division_id: string,
  team: Team,
  wins: number,
  losses: number,
  ties: number,
  points: number,
  series_id: string,
  editing_status: string
}

