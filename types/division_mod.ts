import { Standing } from "./standing_mod";

export type Division ={
  id: string,
  name: string,
  win_points: number,
  loss_points: number,
  tie_points: number,
  teamIDs: string[],
  standings: Standing[],
  editing_status: string

}