import { Team } from "./team_mod";
export type Match ={
  id: string;
  date: string;
  time: string;
  home_team_id: string;
  away_team_id: string;
  field: string;
  division_id: string;
  home_score: number;
  away_score: number;
  editing_status: string;
}