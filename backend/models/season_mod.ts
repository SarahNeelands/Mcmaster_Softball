import { Series } from "./series_mod";
export type Season = {
  id: string,
  name: string,
  series_ids: string[],
  editing_status: string,
  start_date: string,
  end_date: string
}