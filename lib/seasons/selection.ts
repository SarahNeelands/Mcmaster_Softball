"use client";

import type { Season } from "@/types/season_mod";

const SELECTED_SEASON_STORAGE_KEY = "mcmaster:selected-season-id";

export function getStoredSelectedSeasonId(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const seasonId = window.localStorage.getItem(SELECTED_SEASON_STORAGE_KEY);
  return seasonId?.trim() || undefined;
}

export function setStoredSelectedSeason(season?: Pick<Season, "id"> | null): void {
  if (typeof window === "undefined") return;

  if (!season?.id) {
    window.localStorage.removeItem(SELECTED_SEASON_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SELECTED_SEASON_STORAGE_KEY, season.id);
}

export function resolveSelectedSeason(params: {
  currentSeason?: Season;
  seasons: Season[];
  isAdmin: boolean;
}): Season | undefined {
  const { currentSeason, seasons, isAdmin } = params;

  if (!currentSeason) return undefined;
  if (!isAdmin) return currentSeason;

  const storedSeasonId = getStoredSelectedSeasonId();
  if (!storedSeasonId) return currentSeason;

  return seasons.find((season) => season.id === storedSeasonId) ?? currentSeason;
}
