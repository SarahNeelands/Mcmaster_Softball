export type RankedDivision = {
  id: string;
  name: string;
  teamIds: string[];
  sortKey?: number;
};

export function orderDivisionsForSeeding<T extends RankedDivision>(
  divisions: T[]
): T[] {
  return [...divisions].sort(
    (a, b) => (b.sortKey ?? 0) - (a.sortKey ?? 0) || a.name.localeCompare(b.name)
  );
}

export function computeSeededAssignments(
  rawDivisions: RankedDivision[],
  advanceAmount: number,
  demoteAmount: number
): Map<string, string> {
  const orderedDivisions = orderDivisionsForSeeding(rawDivisions);
  const teamAssignments = new Map<string, string>();

  for (const division of orderedDivisions) {
    for (const teamId of division.teamIds) {
      teamAssignments.set(teamId, division.id);
    }
  }

  for (let index = 0; index < orderedDivisions.length; index += 1) {
    const division = orderedDivisions[index];
    const rankedTeamIds = division.teamIds;

    const promotedTeamIds =
      index > 0
        ? rankedTeamIds.slice(0, Math.min(advanceAmount, rankedTeamIds.length))
        : [];

    for (const teamId of promotedTeamIds) {
      teamAssignments.set(teamId, orderedDivisions[index - 1].id);
    }

    const demotionPool = rankedTeamIds.filter((teamId) => !promotedTeamIds.includes(teamId));
    const demotedTeamIds =
      index < orderedDivisions.length - 1
        ? demotionPool.slice(Math.max(0, demotionPool.length - demoteAmount))
        : [];

    for (const teamId of demotedTeamIds) {
      teamAssignments.set(teamId, orderedDivisions[index + 1].id);
    }
  }

  return teamAssignments;
}
