import { Series } from "./series_mod";
export type Season = {
  id: string,
  name: string,
  series: Series[],
  is_active: boolean,
  editing_status: string
}