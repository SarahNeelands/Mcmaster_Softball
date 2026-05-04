/**
 * Schedule page
 * - Displays season matches
 * - Allows admins to add games one day at a time
 * - All edits save immediately as drafts
 */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import {
  compareFieldNames,
  groupMatchesByMonth,
  splitMatches,
} from "@/lib/matches/sortingFunctions";
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
import * as apiAdmin from "@/lib/api/admin_api";
import * as apiSeries from "@/lib/api/series_api";
import * as apiD from "@/lib/api/division_api";
import * as apiT from "@/lib/api/team_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";
import {
  buildEmptySlotSlug,
  EMPTY_SLOT_TEAM_NAME,
  getEmptySlotTeam,
  isEmptySlotMatch,
  isEmptySlotTeam,
} from "@/lib/teams/specialTeams";

function buildScheduleTeamOptions(
  teams: Team[],
  divisions: Division[]
): ScheduleTeamOption[] {
  const teamsById = new Map<string, Team>(teams.map((team) => [team.id, team]));
  const nextTeamOptions = new Map<string, ScheduleTeamOption>();

  for (const division of divisions) {
    const divisionTeamIds = Array.isArray(division.teamIDs) && division.teamIDs.length > 0
      ? division.teamIDs
      : (division.standings ?? []).map((standing) => standing.team.id);

    for (const teamId of divisionTeamIds) {
      const team = teamsById.get(teamId);
      if (!team) continue;

      nextTeamOptions.set(team.id, {
        id: team.id,
        name: team.name,
        slug: team.slug,
        division_id: division.id,
        division_name: division.name,
      });
    }
  }

  for (const team of teams) {
    if (nextTeamOptions.has(team.id)) continue;

    nextTeamOptions.set(team.id, {
      id: team.id,
      name: team.name,
      slug: team.slug,
      division_id: "",
      division_name: "",
    });
  }

  const emptySlotTeam = getEmptySlotTeam(teams);
  if (emptySlotTeam) {
    nextTeamOptions.set(emptySlotTeam.id, {
      id: emptySlotTeam.id,
      name: emptySlotTeam.name,
      slug: emptySlotTeam.slug,
      division_id: "",
      division_name: "Open Slot",
    });
  }

  return Array.from(nextTeamOptions.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

export default function SchedulePage() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [seasonMatches, setSeasonMatches] = useState<Match[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showPastGames, setShowPastGames] = useState(false);
  const [showOpenSlots, setShowOpenSlots] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [editingSeries, setEditingSeries] = useState<Series>();
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [teamOptions, setTeamOptions] = useState<ScheduleTeamOption[]>([]);
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  const [comparisonNow] = useState(() => new Date());
  const [testerNotificationsBusy, setTesterNotificationsBusy] = useState(false);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleSeasonMatches = useMemo(() => {
    return filterVisibleByEditingStatus(seasonMatches, canManageContent);
  }, [seasonMatches, canManageContent]);

  const emptySlotTeamIds = useMemo(
    () =>
      new Set(
        teamOptions
          .filter((team) => isEmptySlotTeam(team))
          .map((team) => team.id)
      ),
    [teamOptions]
  );

  const visibleSeriesMatches = useMemo(() => {
    if (!selectedSeries) return [];

    const divisionIds = new Set([
      ...(selectedSeries.divisions_ids ?? []),
      ...teamOptions
        .map((team) => team.division_id)
        .filter((divisionId): divisionId is string => Boolean(divisionId)),
    ]);
    if (divisionIds.size === 0) return visibleSeasonMatches;

    return visibleSeasonMatches.filter(
      (match) => !match.division_id || divisionIds.has(match.division_id)
    );
  }, [visibleSeasonMatches, selectedSeries, teamOptions]);

  const normalizedTeamSearch = teamSearch.trim().toLowerCase();
  const searchableTeamOptions = useMemo(
    () => teamOptions.filter((team) => !isEmptySlotTeam(team)),
    [teamOptions]
  );

  const filteredTeamOptions = useMemo(() => {
    if (!normalizedTeamSearch) return searchableTeamOptions;

    return searchableTeamOptions.filter((team) =>
      team.name.toLowerCase().includes(normalizedTeamSearch)
    );
  }, [searchableTeamOptions, normalizedTeamSearch]);

  const selectedTeam = useMemo(() => {
    if (!normalizedTeamSearch) return undefined;

    return searchableTeamOptions.find(
      (team) => team.name.toLowerCase() === normalizedTeamSearch
    );
  }, [searchableTeamOptions, normalizedTeamSearch]);

  const visibleMatches = useMemo(() => {
    const openSlotFilteredMatches = visibleSeriesMatches.filter((match) =>
      canManageContent && showOpenSlots
        ? true
        : !isEmptySlotMatch(match, emptySlotTeamIds)
    );

    const teamFilteredMatches = selectedTeam
      ? openSlotFilteredMatches.filter(
          (match) =>
            match.home_team_id === selectedTeam.id || match.away_team_id === selectedTeam.id
        )
      : openSlotFilteredMatches;

    const { upcoming, previous } = splitMatches(teamFilteredMatches, comparisonNow);
    return showPastGames
      ? [...upcoming, ...previous]
      : upcoming;
  }, [visibleSeriesMatches, canManageContent, showOpenSlots, emptySlotTeamIds, selectedTeam, showPastGames, comparisonNow]);

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

  const scheduleMatchesReady = useMemo(
    () =>
      visibleMatches.every(
        (match) => Boolean(teamNamesById[match.home_team_id]) && Boolean(teamNamesById[match.away_team_id])
      ),
    [visibleMatches, teamNamesById]
  );

  const fetchMatches = async (season?: Season) => {
    if (!season) return;
    const matches = await apiM.GetSeasonMatches(season.id);
    setSeasonMatches(matches);
    setFieldOptions(
      Array.from(
        new Set(
          matches
            .map((match) => match.field.trim())
            .filter((field) => field.length > 0)
        )
      ).sort(compareFieldNames)
    );
  };

  const ensureEmptySlotTeamForSeason = useCallback(
    async (seasonId: string, teams: Team[]): Promise<Team[]> => {
      if (!canManageContent) return teams;

      const existing = getEmptySlotTeam(teams);
      if (existing) return teams;

      const created = await apiT.CreateTeam(
        {
          id: "",
          slug: buildEmptySlotSlug(seasonId),
          name: EMPTY_SLOT_TEAM_NAME,
          captain_name: "",
          co_captain_name: "",
          captain_email: "",
          co_captain_email: "",
          editing_status: "published",
        },
        seasonId
      );

      return [...teams, created].sort((a, b) => a.name.localeCompare(b.name));
    },
    [canManageContent]
  );

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

    setTeamSearch("");
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

  const handleRevert = async () => {
    try {
      await apiP.Revert();
      await fetchMatches(selectedSeason);
      alert("Unpublished draft and deleted changes reverted.");
    } catch (err) {
      console.error(err);
      alert("Failed to revert unpublished changes");
    }
  };

  const handleUpdateMatch = async (updated: Match): Promise<Match> => {
    const saved = await apiM.UpdateMatch(updated);
    await fetchMatches(selectedSeason);
    return saved;
  };

  const handleDeleteMatch = async (match: Match) => {
    await apiM.DeleteMatch(match);
    await fetchMatches(selectedSeason);
  };

  const handleSeasonSelect = (season: Season) => {
    setTeamSearch("");
    setShowOpenSlots(false);
    setSelectedSeason(season);
  };

  const handleSeriesSelect = (series: Series) => {
    setTeamSearch("");
    setShowOpenSlots(false);
    setSelectedSeries(series);
  };

  const handleToggleTesterNotifications = async (enabled: boolean) => {
    if (!selectedSeason) return;

    const previousSeason = selectedSeason;
    const nextSeason = { ...selectedSeason, score_notifications_enabled: enabled };
    setSelectedSeason(nextSeason);
    setAllSeasons((prev) => prev.map((season) => (season.id === nextSeason.id ? nextSeason : season)));
    setTesterNotificationsBusy(true);

    try {
      const saved = await apiS.UpdateSeason(nextSeason);
      setSelectedSeason(saved);
      setAllSeasons((prev) => prev.map((season) => (season.id === saved.id ? saved : season)));

      if (enabled) {
        const result = await apiS.PrepareSeasonScoreRequests(saved.id);
        const prepared = Array.isArray(result.preparedMatchIds) ? result.preparedMatchIds.length : 0;
        alert(prepared > 0 ? `Prepared score request emails for ${prepared} match(es).` : "Notifications enabled. No eligible matches were found in the next 24 hours.");
      }
    } catch (err) {
      setSelectedSeason(previousSeason);
      setAllSeasons((prev) => prev.map((season) => (season.id === previousSeason.id ? previousSeason : season)));
      alert(err instanceof Error ? err.message : "Failed to update Tester Season notifications.");
    } finally {
      setTesterNotificationsBusy(false);
    }
  };

  const handleEditorClose = async (day: ScheduleDay | null) => {
    setIsEditing(false);

    if (!day) return;

    if (!selectedSeason || !selectedSeries) {
      alert("Select a season and series before adding games.");
      return;
    }

    const teams = await ensureEmptySlotTeamForSeason(
      selectedSeason.id,
      await apiT.GetSeasonTeams(selectedSeason.id)
    );
    const emptySlotTeam = getEmptySlotTeam(teams);

    if (!emptySlotTeam) {
      alert("Failed to prepare the Empty team for open slots.");
      return;
    }

    const fallbackDivisionId = selectedSeries.divisions_ids?.[0] ?? "";

    for (const block of day.timeBlocks) {
      for (const game of block.games) {
        const homeTeamId = game.home_team_id || emptySlotTeam.id;
        const awayTeamId = game.away_team_id || emptySlotTeam.id;
        const persistedDivisionId = game.division_id || fallbackDivisionId;

        if (!persistedDivisionId) {
          alert("Open-slot games still need at least one real division in the selected series before they can be saved.");
          return;
        }

        await apiM.CreateMatch({
          id: "",
          date: day.date,
          time: block.time,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          field: game.field,
          division_id: persistedDivisionId,
          home_score: null,
          away_score: null,
          score_status: "unrequested",
          score_request_sent_at: null,
          first_submitted_at: null,
          finalized_at: null,
          founder_notified_conflict_at: null,
          founder_notified_single_at: null,
          founder_notified_no_submission_at: null,
          editing_status: "draft",
        });
      }
    }

    const divisionsData = await apiD.GetDivisions("", selectedSeries.id, "all");
    const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];
    setTeamOptions(buildScheduleTeamOptions(teams, divisions));
    await fetchMatches(selectedSeason);
  };

  useEffect(() => {
    const load = async () => {
      const session = await apiAdmin.GetAdminSession();
      setIsAdmin(session.isAdmin);

      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;

      if (!currentSeason) {
        console.error("No current season returned.");
        return;
      }

      setTeamSearch("");
      setShowOpenSlots(false);
      setSelectedSeason(currentSeason);

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);
    };

    load().catch((err) => console.error("Error fetching schedule:", err));
  }, []);

  const handleAdminToggle = async () => {
    if (isAdmin) {
      await apiAdmin.LogoutAdmin();
      setIsAdmin(false);
      setIsPreviewing(false);
      return;
    }

    window.location.href = "/msadmin";
  };

  useEffect(() => {
    if (canManageContent) return;

    const resetToPublicSeason = async () => {
      try {
        const currentData = await apiS.GetSeasons("", "current");
        const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;
        if (currentSeason) {
          setTeamSearch("");
          setShowOpenSlots(false);
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
      const [teamsData, currentSeriesData, allSeriesData] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
        apiSeries.GetSeries("", selectedSeason.id, "current"),
        apiSeries.GetSeries("", selectedSeason.id, "all"),
      ]);
      const teams = await ensureEmptySlotTeamForSeason(selectedSeason.id, teamsData);

      const currentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
      const seasonSeries = Array.isArray(allSeriesData) ? allSeriesData : [allSeriesData];
      setTeamSearch("");
      setShowOpenSlots(false);
      setSelectedSeries(currentSeries);
      setAllSeries(seasonSeries.filter(Boolean));

      const divisionsData = currentSeries
        ? await apiD.GetDivisions("", currentSeries.id, "all")
        : [];
      const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];

      setTeamOptions(buildScheduleTeamOptions(teams, divisions));

      await fetchMatches(selectedSeason);
    };

    loadSeasonData().catch((err) =>
      console.error("Error fetching schedule data:", err)
    );
  }, [selectedSeason, ensureEmptySlotTeamForSeason]);

  useEffect(() => {
    if (!selectedSeason || !selectedSeries) return;

    const loadSeriesTeams = async () => {
      const [teams, divisionsData] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
        apiD.GetDivisions("", selectedSeries.id, "all"),
      ]);
      const seasonTeams = await ensureEmptySlotTeamForSeason(selectedSeason.id, teams);
      const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];
      setTeamOptions(buildScheduleTeamOptions(seasonTeams, divisions));
    };

    loadSeriesTeams().catch((err) => console.error("Error fetching series teams:", err));
  }, [selectedSeason, selectedSeries, ensureEmptySlotTeamForSeason]);

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
        onToggleAdmin={handleAdminToggle}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={publishHandler}
        onRevert={canManageContent ? handleRevert : undefined}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={handleSeasonSelect}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
        onToggleTesterNotifications={handleToggleTesterNotifications}
        testerNotificationsBusy={testerNotificationsBusy}
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
        <div className={styles.filterBar}>
          {canManageContent && (
            <SeriesDropdownButton
              series={visibleSeries}
              selectedSeries={selectedSeries}
              onSelect={handleSeriesSelect}
              onOpenCreateSeries={() => {
                setEditingSeries(undefined);
                setCreatingSeries(true);
              }}
              onOpenEditSeries={() => setEditingSeries(selectedSeries)}
              isAdmin={canManageContent}
              showCaret={false}
            />
          )}
          <div className={styles.teamFilter}>
            <label htmlFor="schedule-team-filter" className={styles.teamFilterLabel}>
              Team
            </label>
            <input
              id="schedule-team-filter"
              type="text"
              list="schedule-team-filter-options"
              className={styles.teamFilterInput}
              placeholder="Type a team name"
              value={teamSearch}
              onChange={(e) => setTeamSearch(e.target.value)}
            />
            <datalist id="schedule-team-filter-options">
              {filteredTeamOptions.map((team) => (
                <option key={team.id} value={team.name} />
              ))}
            </datalist>
          </div>
          {canManageContent && (
            <button
              type="button"
              className={styles.togglePastButton}
              onClick={() => setShowOpenSlots((prev) => !prev)}
            >
              {showOpenSlots ? "Hide Open Slots" : "Show Open Slots"}
            </button>
          )}
          <button
            type="button"
            className={styles.togglePastButton}
            onClick={() => setShowPastGames((prev) => !prev)}
          >
            {showPastGames ? "Hide Past Games" : "Show Past Games"}
          </button>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.scheduleColumn}>
            <UpcomingMatches
              matches={scheduleMatchesReady ? visibleMatches : []}
              isAdmin={canManageContent}
              teamNamesById={teamNamesById}
              teamOptions={teamOptions.map((team) => ({
                id: team.id,
                name: team.name,
                slug: team.slug,
                division_id: team.division_id,
              }))}
              updateMatch={handleUpdateMatch}
              deleteMatch={handleDeleteMatch}
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
