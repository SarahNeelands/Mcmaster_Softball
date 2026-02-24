import { Series } from "./series_mod";
export type Season = {
  id: string,
  name: string,
  series_ids: string[],
  is_active: boolean,
  editing_status: string
}