import { Match } from "@/types/match_mod";
import { compareByDateThenTime } from "./sortingFunctions";


export function getVisibleMatches(
  matches: Match[],
  days = 2,
  direction: "upcoming" | "previous" = "upcoming"
) {
  const sorted = [...matches].sort((a, b) => {
    const cmp = compareByDateThenTime(a, b);
    return direction === "previous" ? -cmp : cmp;
  });

  const dates: string[] = [];
  for (const match of sorted) {
    if (!dates.includes(match.date)) {
      dates.push(match.date);
    }
    if (dates.length === days) break;
  }

  return sorted.filter(m => dates.includes(m.date));
}

export function formatDateLabel(date: string): string {
    const [year, month, day] = date.split("-").map(Number);

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    return `${monthNames[month - 1]} ${day}`;
  };

export function formatTimeLabel(time: string): string {
  const normalized = time.trim();
  const amPmMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);

  if (amPmMatch) {
    const [, hours, minutes, meridiem] = amPmMatch;
    return `${Number(hours)}:${minutes} ${meridiem.toUpperCase()}`;
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})$/);
  if (!twentyFourHourMatch) {
    return normalized;
  }

  const [, rawHours, minutes] = twentyFourHourMatch;
  const hours = Number(rawHours);
  const meridiem = hours >= 12 ? "PM" : "AM";
  const twelveHour = hours % 12 || 12;
  return `${twelveHour}:${minutes} ${meridiem}`;
}

export function formatDateTimeLabel(date: string, time: string): string {
  return `${formatDateLabel(date)} ${formatTimeLabel(time)}`;
}

export function formatScore(score: number | undefined | null): string {
  return typeof score === "number" ? score.toString() : "-";
}
