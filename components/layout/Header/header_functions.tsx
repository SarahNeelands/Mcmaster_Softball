"use client";

import { useState } from "react";
import * as apiS from "@/lib/api/season_api";
import type { Season } from "@/types/season_mod";

type Screen = "home" | "seasonEditor";

type UseSeasonEditorProps = {
  selectedSeason?: Season;
  setSelectedSeason: React.Dispatch<React.SetStateAction<Season | undefined>>;
  setAllSeasons: React.Dispatch<React.SetStateAction<Season[]>>;
  setScreen: React.Dispatch<React.SetStateAction<Screen>>;
};

export function useSeasonEditor({
  selectedSeason,
  setSelectedSeason,
  setAllSeasons,
  setScreen,
}: UseSeasonEditorProps) {
  const [seasonToEdit, setSeasonToEdit] = useState<Season | undefined>(undefined);

  const openCreateSeason = () => {
    setSeasonToEdit(undefined);
    setScreen("seasonEditor");
  };

  const openEditSeason = () => {
    if (!selectedSeason) return;
    setSeasonToEdit(selectedSeason);
    setScreen("seasonEditor");
  };

  const closeSeasonEditor = () => {
    setSeasonToEdit(undefined);
    setScreen("home");
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

    const all = await apiS.GetSeasons("", "all");
    setAllSeasons(Array.isArray(all) ? all : [all]);

    closeSeasonEditor();
  };

  return {
    seasonToEdit,
    openCreateSeason,
    openEditSeason,
    closeSeasonEditor,
    handleSaveSeason,
  };
}