import crypto from "crypto";

export function generateScoreSubmissionToken() {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashScoreSubmissionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function parseScoreValue(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error("Scores must be non-negative integers.");
  }

  return parsed;
}

export function getMatchScheduledAt(date: string, time: string) {
  return getZonedDateTime(date, normalizeTimeString(time), "America/Toronto");
}

function normalizeTimeString(time: string) {
  const twentyFourHourMatch = time.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return time;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const modifier = match[3].toUpperCase();

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function getZonedDateTime(date: string, time: string, timeZone: string) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
    return new Date(`${date}T${time}:00`);
  }

  let candidate = new Date(Date.UTC(year, month - 1, day, hour, minute));

  for (let i = 0; i < 2; i += 1) {
    const zonedParts = getZonedParts(candidate, timeZone);
    const desiredWallTime = Date.UTC(year, month - 1, day, hour, minute);
    const actualWallTime = Date.UTC(
      zonedParts.year,
      zonedParts.month - 1,
      zonedParts.day,
      zonedParts.hour,
      zonedParts.minute
    );

    candidate = new Date(candidate.getTime() + desiredWallTime - actualWallTime);
  }

  return candidate;
}

function getZonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value])
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}
