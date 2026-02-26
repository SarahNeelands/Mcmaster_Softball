import { Division } from "./division_mod";

export type Series = {
  id: string,
  name: string,
  start_date: string,
  end_date: string,
  divisions_ids: string[],
  advance_amount: number,
  demote_amount: number,
  is_active: boolean,
  editing_status: string
}