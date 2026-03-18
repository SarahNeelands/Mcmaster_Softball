/**
 * Schedule page
 * - Displays season matches
 * - Allows admins to add games one day at a time
 * - All edits save immediately as drafts
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { groupMatchesByMonth } from "@/lib/matches/sortingFunctions";
import { Calendar } from "@/components/common/calendar/calendar";
import SeriesEditor from "@/components/editors/SeriesEditor";
import UpcomingMatches from "@/components/home/Matches/UpcomingMatches";
import ScheduleEditor, {
  ScheduleDay,
  ScheduleTeamOption,
} from "@/components/home/Matches/ScheduleEditor";
import SeriesDropdownButton from "@/components/dropDowns/SeriesDropdownButton";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";
import type { Series } from "@/types/series_mod";
import type { Division } from "@/types/division_mod";
import type { Team } from "@/types/team_mod";
import styles from "./page.module.css";
import * as apiP from "@/lib/api/publish_api";
import * as apiM from "@/lib/api/match_api";
import * as apiS from "@/lib/api/season_api";
import * as apiSeries from "@/lib/api/series_api";
import * as apiD from "@/lib/api/division_api";
import * as apiT from "@/lib/api/team_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";

export default function SchedulePage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [editingSeries, setEditingSeries] = useState<Series>();
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [teamOptions, setTeamOptions] = useState<ScheduleTeamOption[]>([]);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleMatches = useMemo(() => {
    return filterVisibleByEditingStatus(upcomingMatches, canManageContent);
  }, [upcomingMatches, canManageContent]);

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleSeries = useMemo(
    () => filterVisibleByEditingStatus(allSeries, canManageContent),
    [allSeries, canManageContent]
  );

  const months = useMemo(
    () => groupMatchesByMonth(visibleMatches),
    [visibleMatches]
  );

  const teamNamesById = useMemo(
    () =>
      Object.fromEntries(
        teamOptions.map((team) => [team.id, team.name])
      ) as Record<string, string>,
    [teamOptions]
  );

  const fetchMatches = async (season?: Season) => {
    if (!season) return;
    const matches = await apiM.GetSeasonMatches(season.id);
    setUpcomingMatches(matches);
    setFieldOptions(
      Array.from(
        new Set(
          matches
            .map((match) => match.field.trim())
            .filter((field) => field.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b))
    );
  };

  const reloadSeries = async (season?: Season) => {
    if (!season) return;

    const [currentSeriesData, allSeriesData] = await Promise.all([
      apiSeries.GetSeries("", season.id, "current"),
      apiSeries.GetSeries("", season.id, "all"),
    ]);

    const currentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
    const seasonSeries = Array.isArray(allSeriesData) ? allSeriesData : [allSeriesData];
    const filteredSeries = seasonSeries.filter(Boolean);
    const nextSelectedSeries =
      filteredSeries.find((series) => series.id === selectedSeries?.id) ?? currentSeries;

    setSelectedSeries(nextSelectedSeries);
    setAllSeries(filteredSeries);
  };

  const publishHandler = async () => {
    try {
      await apiP.Publish();
      await fetchMatches(selectedSeason);
      alert("Schedule published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish schedule");
    }
  };

  const handleUpdateMatch = async (updated: Match): Promise<Match> => {
    const saved = await apiM.UpdateMatch(updated);
    await fetchMatches(selectedSeason);
    return saved;
  };

  const handleEditorClose = async (day: ScheduleDay | null) => {
    setIsEditing(false);

    if (!day) return;

    for (const block of day.timeBlocks) {
      for (const game of block.games) {
        await apiM.CreateMatch({
          id: "",
          date: day.date,
          time: block.time,
          home_team_id: game.home_team_id,
          away_team_id: game.away_team_id,
          field: game.field,
          division_id: game.division_id,
          home_score: 0,
          away_score: 0,
          editing_status: "draft",
        });
      }
    }

    await fetchMatches(selectedSeason);
  };

  useEffect(() => {
    const load = async () => {
      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;

      if (!currentSeason) {
        console.error("No current season returned.");
        return;
      }

      setSelectedSeason(currentSeason);

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);

      await fetchMatches(currentSeason);
    };

    load().catch((err) => console.error("Error fetching schedule:", err));
  }, []);

  useEffect(() => {
    if (canManageContent) return;

    const resetToPublicSeason = async () => {
      try {
        const currentData = await apiS.GetSeasons("", "current");
        const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;
        if (currentSeason) {
          setSelectedSeason(currentSeason);
        }
      } catch (err) {
        console.error("Error resetting schedule season:", err);
      }
    };

    resetToPublicSeason();
  }, [canManageContent]);

  useEffect(() => {
    if (!selectedSeason) return;

    const loadSeasonData = async () => {
      const [teams, currentSeriesData, allSeriesData] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
        apiSeries.GetSeries("", selectedSeason.id, "current"),
        apiSeries.GetSeries("", selectedSeason.id, "all"),
      ]);

      const currentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
      const seasonSeries = Array.isArray(allSeriesData) ? allSeriesData : [allSeriesData];
      setSelectedSeries(currentSeries);
      setAllSeries(seasonSeries.filter(Boolean));

      const divisionsData = currentSeries
        ? await apiD.GetDivisions("", currentSeries.id, "all")
        : [];
      const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];

      const teamsById = new Map<string, Team>(teams.map((team) => [team.id, team]));
      const nextTeamOptions = new Map<string, ScheduleTeamOption>();

      for (const division of divisions) {
        const divisionTeamIds = division.teamIDs.length > 0
          ? division.teamIDs
          : division.standings.map((standing) => standing.team.id);

        for (const teamId of divisionTeamIds) {
          const team = teamsById.get(teamId);
          if (!team) continue;

          nextTeamOptions.set(team.id, {
            id: team.id,
            name: team.name,
            division_id: division.id,
            division_name: division.name,
          });
        }
      }

      setTeamOptions(
        Array.from(nextTeamOptions.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );

      await fetchMatches(selectedSeason);
    };

    loadSeasonData().catch((err) =>
      console.error("Error fetching schedule data:", err)
    );
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedSeason || !selectedSeries) return;

    const loadSeriesTeams = async () => {
      const [teams, divisionsData] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
        apiD.GetDivisions("", selectedSeries.id, "all"),
      ]);
      const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];
      const teamsById = new Map<string, Team>(teams.map((team) => [team.id, team]));
      const nextTeamOptions = new Map<string, ScheduleTeamOption>();

      for (const division of divisions) {
        const divisionTeamIds = division.teamIDs.length > 0
          ? division.teamIDs
          : division.standings.map((standing) => standing.team.id);

        for (const teamId of divisionTeamIds) {
          const team = teamsById.get(teamId);
          if (!team) continue;

          nextTeamOptions.set(team.id, {
            id: team.id,
            name: team.name,
            division_id: division.id,
            division_name: division.name,
          });
        }
      }

      setTeamOptions(
        Array.from(nextTeamOptions.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      );
    };

    loadSeriesTeams().catch((err) => console.error("Error fetching series teams:", err));
  }, [selectedSeason, selectedSeries]);

  const handleSaveSeries = async (
    payload: Omit<Series, "id" | "divisions_ids">,
    id?: string
  ) => {
    if (!id || !editingSeries || !selectedSeason) return;

    await apiSeries.UpdateSeries({
      ...editingSeries,
      ...payload,
      id,
    });

    setEditingSeries(undefined);
    await reloadSeries(selectedSeason);
  };

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={publishHandler}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(season) => setSelectedSeason(season)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      {canManageContent && (creatingSeries || editingSeries) && (
        <SeriesEditor
          initialSeries={editingSeries}
          onCancel={() => {
            setEditingSeries(undefined);
            setCreatingSeries(false);
          }}
          onSave={async (payload, id) => {
            if (creatingSeries && selectedSeason) {
              await apiSeries.CreateSeries(
                {
                  id: "",
                  divisions_ids: [],
                  ...payload,
                },
                selectedSeason.id
              );
              setCreatingSeries(false);
              await reloadSeries(selectedSeason);
              return;
            }

            await handleSaveSeries(payload, id);
          }}
        />
      )}

      {canManageContent && isEditing && (
        <ScheduleEditor
          teamOptions={teamOptions}
          fieldOptions={fieldOptions}
          onClose={handleEditorClose}
        />
      )}

      <main className={styles.main}>
        {canManageContent && (
          <div className={styles.filterBar}>
            <SeriesDropdownButton
              series={visibleSeries}
              selectedSeries={selectedSeries}
              onSelect={(series) => setSelectedSeries(series)}
              onOpenCreateSeries={() => {
                setEditingSeries(undefined);
                setCreatingSeries(true);
              }}
              onOpenEditSeries={() => setEditingSeries(selectedSeries)}
              isAdmin={canManageContent}
            />
          </div>
        )}

        <div className={styles.contentGrid}>
          <div className={styles.scheduleColumn}>
            <UpcomingMatches
              matches={visibleMatches}
              isAdmin={canManageContent}
              teamNamesById={teamNamesById}
              updateMatch={handleUpdateMatch}
              onAddGames={() => setIsEditing(true)}
              useCardGroups
            />
          </div>

          <aside className={styles.calendarStack}>
            <Calendar months={months} />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
