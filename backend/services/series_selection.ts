type SeriesWindow = {
  start_date: string;
  end_date: string;
};

function toDateOnly(value: string): string {
  return value.slice(0, 10);
}

export function selectCurrentOrMostRecentSeries<T extends SeriesWindow>(
  series: T[],
  today: string
): T | null {
  const normalizedToday = toDateOnly(today);

  const current = series.find((item) => {
    const start = toDateOnly(item.start_date);
    const end = toDateOnly(item.end_date);
    return start <= normalizedToday && end >= normalizedToday;
  });

  if (current) {
    return current;
  }

  const previous = [...series]
    .filter((item) => toDateOnly(item.end_date) < normalizedToday)
    .sort((a, b) => toDateOnly(b.end_date).localeCompare(toDateOnly(a.end_date)))[0];

  if (previous) {
    return previous;
  }

  return series[0] ?? null;
}
