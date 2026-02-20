import { Match } from "@/types/matches";
import { updateMatch } from "@/lib/api/admin/a_matches";

export async function updateMatchWithSync(
  updated: Match,
  today: string,
  setUpcoming: React.Dispatch<React.SetStateAction<Match[]>>,
  setPrevious: React.Dispatch<React.SetStateAction<Match[]>>
) {
  if (updated.date >= today) {
    setUpcoming(curr => curr.map(m => m.id === updated.id ? updated : m));
  }

  setPrevious(curr => curr.map(m => m.id === updated.id ? updated : m));

  await updateMatch(updated);
}