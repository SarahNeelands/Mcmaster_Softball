type SeasonWindow = {
  start_date: string;
  end_date: string;
};

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

export function selectCurrentOrMostRecentSeason<T extends SeasonWindow>(
  seasons: T[],
  today: string
): T | null {
  const normalizedToday = toDateOnly(today);

  const current = seasons.find((season) => {
    const start = toDateOnly(season.start_date);
    const end = toDateOnly(season.end_date);
    return start <= normalizedToday && end >= normalizedToday;
  });

  if (current) {
    return current;
  }

  const previous = [...seasons]
    .filter((season) => toDateOnly(season.end_date) < normalizedToday)
    .sort((a, b) => toDateOnly(b.end_date).localeCompare(toDateOnly(a.end_date)))[0];

  if (previous) {
    return previous;
  }

  return seasons[0] ?? null;
}
