"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import DivisionStandingsCard from "@/components/standings/DivisionStandingsCard";
import SeriesDropdownButton from "@/components/dropDowns/SeriesDropdownButton";
import SeriesEditor from "@/components/editors/SeriesEditor";
import styles from "./page.module.css";
import type { Season } from "@/types/season_mod";
import type { Series } from "@/types/series_mod";
import type { Division } from "@/types/division_mod";
import type { Standing } from "@/types/standing_mod";
import type { Team } from "@/types/team_mod";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiAdmin from "@/lib/api/admin_api";
import * as apiSeries from "@/lib/api/series_api";
import * as apiD from "@/lib/api/division_api";
import * as apiT from "@/lib/api/team_api";
import * as apiM from "@/lib/api/match_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";
import { filterOutEmptySlotTeams } from "@/lib/teams/specialTeams";

export default function StandingsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
  const [seasonRankings, setSeasonRankings] = useState<Standing[]>([]);
  const [creatingDivision, setCreatingDivision] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series>();
  const [creatingSeries, setCreatingSeries] = useState(false);
  const [testerNotificationsBusy, setTesterNotificationsBusy] = useState(false);
  const [draggingTeam, setDraggingTeam] = useState<{
    team_id: string;
    source_division_id: string;
  } | null>(null);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleSeries = useMemo(
    () => filterVisibleByEditingStatus(allSeries, canManageContent),
    [allSeries, canManageContent]
  );

  const visibleDivisions = useMemo(
    () => filterVisibleByEditingStatus(divisions, canManageContent),
    [divisions, canManageContent]
  );

  const visibleSeasonTeams = useMemo(
    () => filterOutEmptySlotTeams(filterVisibleByEditingStatus(seasonTeams, canManageContent)),
    [seasonTeams, canManageContent]
  );

  const unassignedTeams = useMemo(() => {
    const assignedTeamIds = new Set(
      divisions.flatMap((division) =>
        division.teamIDs.length > 0
          ? division.teamIDs
          : division.standings.map((standing) => standing.team.id)
      )
    );

    return visibleSeasonTeams.filter((team) => !assignedTeamIds.has(team.id));
  }, [divisions, visibleSeasonTeams]);

  const reloadDivisions = async (series?: Series) => {
    if (!series) return;
    const data = await apiD.GetDivisions("", series.id, "all");
    setDivisions(Array.isArray(data) ? data : [data]);
  };

  const reloadSeries = async (season?: Season) => {
    if (!season) return;

    const [currentData, allData] = await Promise.all([
      apiSeries.GetSeries("", season.id, "current"),
      apiSeries.GetSeries("", season.id, "all"),
    ]);

    const currentSeries = Array.isArray(currentData) ? currentData[0] : currentData;
    const seasonSeries = Array.isArray(allData) ? allData : [allData];
    const filteredSeries = seasonSeries.filter(Boolean);
    const nextSelectedSeries =
      filteredSeries.find((series) => series.id === selectedSeries?.id) ?? currentSeries;

    setAllSeries(filteredSeries);
    setSelectedSeries(nextSelectedSeries);
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

      setSelectedSeason(currentSeason);

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);
      const teams = await apiT.GetSeasonTeams(currentSeason.id);
      setSeasonTeams(teams);
    };

    load().catch((err) => console.error("Error fetching seasons:", err));
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
          setSelectedSeason(currentSeason);
        }
      } catch (err) {
        console.error("Error resetting standings season:", err);
      }
    };

    resetToPublicSeason();
  }, [canManageContent]);

  useEffect(() => {
    if (!selectedSeason) return;

    const load = async () => {
      try {
        const teams = await apiT.GetSeasonTeams(selectedSeason.id);
        const [currentData, allData] = await Promise.all([
          apiSeries.GetSeries("", selectedSeason.id, "current"),
          apiSeries.GetSeries("", selectedSeason.id, "all"),
        ]);

        setSeasonTeams(teams);
        const currentSeries = Array.isArray(currentData) ? currentData[0] : currentData;
        const seasonSeries = Array.isArray(allData) ? allData : [allData];

        setSelectedSeries(currentSeries);
        setAllSeries(seasonSeries.filter(Boolean));
      } catch (err) {
        console.error("Error fetching series:", err);
      }
    };

    load();
  }, [selectedSeason]);

  useEffect(() => {
    if (!selectedSeries) return;

    const loadSeriesDivisions = async () => {
      await reloadDivisions(selectedSeries);
    };

    loadSeriesDivisions().catch((err) =>
      console.error("Error fetching divisions:", err)
    );
  }, [selectedSeries]);

  useEffect(() => {
    let cancelled = false;

    const loadSeasonRankings = async () => {
      if (!selectedSeason || visibleSeries.length === 0) {
        setSeasonRankings([]);
        return;
      }

      try {
        const divisionGroups = await Promise.all(
          visibleSeries.map(async (series) => {
            const data = await apiD.GetDivisions("", series.id, "all");
            return (Array.isArray(data) ? data : [data]).filter(Boolean);
          })
        );

        const visibleTeamIds = new Set(visibleSeasonTeams.map((team) => team.id));
        const totals = new Map<string, Standing>();

        divisionGroups.flat().forEach((division) => {
          division.standings.forEach((standing) => {
            if (!visibleTeamIds.has(standing.team.id)) {
              return;
            }

            const existing = totals.get(standing.team.id);
            if (existing) {
              existing.wins += standing.wins;
              existing.losses += standing.losses;
              existing.ties += standing.ties;
              existing.points += standing.points;
              return;
            }

            totals.set(standing.team.id, {
              ...standing,
              id: `season-ranking-${standing.team.id}`,
              division_id: "season-rankings",
              series_id: "season-rankings",
            });
          });
        });

        const aggregated = [...totals.values()].sort(
          (a, b) =>
            b.points - a.points ||
            b.wins - a.wins ||
            a.losses - b.losses ||
            b.ties - a.ties ||
            a.team.name.localeCompare(b.team.name)
        );

        if (!cancelled) {
          setSeasonRankings(aggregated);
        }
      } catch (err) {
        console.error("Error fetching season rankings:", err);
        if (!cancelled) {
          setSeasonRankings([]);
        }
      }
    };

    loadSeasonRankings();

    return () => {
      cancelled = true;
    };
  }, [selectedSeason, visibleSeries, visibleSeasonTeams]);

  const handlePublish = async () => {
    try {
      await apiP.Publish();
      await reloadDivisions(selectedSeries);
      alert("Standings published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish standings");
    }
  };

  const handleRevert = async () => {
    try {
      await apiP.Revert();
      await reloadSeries(selectedSeason);
      await reloadDivisions(selectedSeries);
      alert("Unpublished draft and deleted changes reverted.");
    } catch (err) {
      console.error(err);
      alert("Failed to revert unpublished changes");
    }
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

  const handleCreateDivision = async (division: Division) => {
    if (!selectedSeries) return;
    await apiD.CreateDivision(division, selectedSeries.id);
    setCreatingDivision(false);
    await reloadDivisions(selectedSeries);
  };

  const handleUpdateDivision = async (division: Division) => {
    await apiD.UpdateDivision(division);
    await reloadDivisions(selectedSeries);
  };

  const handleDeleteDivision = async (division: Division) => {
    await apiD.DeleteDivision(division);
    await reloadDivisions(selectedSeries);
  };

  const handleDropTeam = async (target_division_id: string) => {
    if (!draggingTeam || !selectedSeason) return;

    const teamMatches = await apiM.GetTeamsSeasonMatches(draggingTeam.team_id, selectedSeason.id);
    const scheduledMatches = teamMatches.filter(
      (match) =>
        match.division_id === draggingTeam.source_division_id &&
        match.editing_status !== "deleted" &&
        match.home_score === null &&
        match.away_score === null
    );

    if (scheduledMatches.length > 0) {
      const shouldContinue = window.confirm(
        `This team has ${scheduledMatches.length} scheduled game(s) in its current division. Press OK to continue and delete those games, or Cancel to keep the team where it is.`
      );

      if (!shouldContinue) {
        setDraggingTeam(null);
        return;
      }

      for (const match of scheduledMatches) {
        await apiM.DeleteMatch(match);
      }
    }

    await apiD.MoveDivisionTeam(
      draggingTeam.team_id,
      draggingTeam.source_division_id,
      target_division_id,
      selectedSeries?.id
    );

    setDraggingTeam(null);
    await reloadDivisions(selectedSeries);
  };

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
        onPublish={handlePublish}
        onRevert={canManageContent ? handleRevert : undefined}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(season) => setSelectedSeason(season)}
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

      <main className={styles.main}>
        <div className={styles.toolbar}>
          {canManageContent && (
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
          )}
          {canManageContent && (
            <button
              type="button"
              className={styles.createButton}
              onClick={() => setCreatingDivision(true)}
            >
              Add Division
            </button>
          )}
        </div>

        <div className={styles.contentGrid}>
          {canManageContent && creatingDivision && (
            <DivisionStandingsCard
              key="new-division"
              division={{
                id: "",
                name: "",
                win_points: 2,
                loss_points: 0,
                tie_points: 1,
                teamIDs: [],
                standings: [],
                editing_status: "draft",
              }}
              isAdmin={canManageContent}
              startInEditMode
              onSaveDivision={handleCreateDivision}
              onCancelCreate={() => setCreatingDivision(false)}
            />
          )}

          {canManageContent && unassignedTeams.length > 0 && (
            <DivisionStandingsCard
              key="unassigned-teams"
              division={{
                id: "",
                name: "Unassigned Teams",
                win_points: 0,
                loss_points: 0,
                tie_points: 0,
                teamIDs: [],
                standings: [],
                editing_status: "draft",
              }}
              teamRows={unassignedTeams}
              isHoldingArea
              hideScores
              isAdmin={canManageContent}
              onDragTeam={(team_id, source_division_id) =>
                setDraggingTeam({ team_id, source_division_id })
              }
            />
          )}

          {visibleDivisions.map((division) => (
            <DivisionStandingsCard
              key={division.id}
              division={division}
              advanceAmount={selectedSeries?.advance_amount}
              demoteAmount={selectedSeries?.demote_amount}
              isAdmin={canManageContent}
              onSaveDivision={handleUpdateDivision}
              onDeleteDivision={handleDeleteDivision}
              onDragTeam={(team_id, source_division_id) =>
                setDraggingTeam({ team_id, source_division_id })
              }
              onDropTeam={handleDropTeam}
            />
          ))}
        </div>

        {seasonRankings.length > 0 && (
          <div className={styles.seasonRankingsSection}>
            <DivisionStandingsCard
              division={{
                id: "season-rankings",
                name: "Season Rankings",
                win_points: 0,
                loss_points: 0,
                tie_points: 0,
                teamIDs: seasonRankings.map((standing) => standing.team.id),
                standings: seasonRankings,
                editing_status: "published",
              }}
              isAdmin={false}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
