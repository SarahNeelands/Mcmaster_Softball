"use client";

import { useState } from "react";
import * as apiS from "@/lib/api/season_api";
import { setStoredSelectedSeason } from "@/lib/seasons/selection";
import type { Season } from "@/types/season_mod";

type UseSeasonEditorProps = {
  selectedSeason?: Season;
  setSelectedSeason: React.Dispatch<React.SetStateAction<Season | undefined>>;
  setAllSeasons: React.Dispatch<React.SetStateAction<Season[]>>;
};

export function useSeasonEditor({
  selectedSeason,
  setSelectedSeason,
  setAllSeasons,
}: UseSeasonEditorProps) {
  const [seasonToEdit, setSeasonToEdit] = useState<Season | undefined>(undefined);
  const [isSeasonEditorOpen, setIsSeasonEditorOpen] = useState(false);

  const openCreateSeason = () => {
    setSeasonToEdit(undefined);
    setIsSeasonEditorOpen(true);
  };

  const openEditSeason = (season?: Season) => {
    const nextSeason = season ?? selectedSeason;
    if (!nextSeason) return;
    setSelectedSeason(nextSeason);
    setSeasonToEdit(nextSeason);
    setIsSeasonEditorOpen(true);
  };

  const closeSeasonEditor = () => {
    setSeasonToEdit(undefined);
    setIsSeasonEditorOpen(false);
  };

  const handleSaveSeason = async (
    payload: Omit<Season, "id" | "series_ids">,
    id?: string
  ) => {
    let saved: Season;

    if (id) {
      if (!seasonToEdit) throw new Error("No season loaded to edit.");

      saved = await apiS.UpdateSeason({
        ...seasonToEdit,
        ...payload,
        id,
      });
    } else {
      saved = await apiS.CreateSeason({
        id: "",
        series_ids: [],
        ...payload,
      } as Season);
    }

    setSelectedSeason(saved);
    setStoredSelectedSeason(saved);

    const all = await apiS.GetSeasons("", "all");
    setAllSeasons(Array.isArray(all) ? all : [all]);

    closeSeasonEditor();
  };

  return {
    isSeasonEditorOpen,
    seasonToEdit,
    openCreateSeason,
    openEditSeason,
    closeSeasonEditor,
    handleSaveSeason,
  };
}
