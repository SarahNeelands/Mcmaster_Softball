export type Season = {
  id: string,
  name: string,
  series_ids: string[],
  editing_status: string,
  admin_only?: boolean,
  score_notifications_enabled?: boolean,
  start_date: string,
  end_date: string
}
