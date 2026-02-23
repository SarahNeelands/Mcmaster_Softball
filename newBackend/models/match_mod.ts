import { team } from "./teams_mod";
export type Match ={
  id: string;
  date: string;
  time: string;
  home_team: team;
  away_team: team;
  field: string;
  division_id: string;
  home_score: number;
  away_score: number;
  editing_status: string;
}