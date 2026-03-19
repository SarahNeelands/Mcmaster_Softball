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
  return new Date(`${date}T${normalizeTimeString(time)}:00`);
}

function normalizeTimeString(time: string) {
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
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
