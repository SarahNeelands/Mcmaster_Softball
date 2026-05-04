"use client";

import { useEffect, useMemo, useState } from "react";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";

import type { Announcement } from "@/types/announcement_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";
import type { Team } from "@/types/team_mod";
import type { Division } from "@/types/division_mod";

import { splitMatches } from "@/lib/matches/sortingFunctions";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroBanner from "@/components/home/HeroBanner/HeroBanner";
import AnnouncementsSection from "@/components/home/Announcements/AnnouncementsSection";
import MatchesSection from "@/components/home/Matches/MatchesSection";
import SeasonEditor from "@/components/editors/SeasonEditor";

import * as apiA from "@/lib/api/announcement_api";
import * as apiAdmin from "@/lib/api/admin_api";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiM from "@/lib/api/match_api";
import * as apiT from "@/lib/api/team_api";
import * as apiSeries from "@/lib/api/series_api";
import * as apiD from "@/lib/api/division_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";
import {
  filterOutEmptySlotTeams,
  getEmptySlotTeam,
  isEmptySlotTeam,
  isOpenSlotMatch,
} from "@/lib/teams/specialTeams";

function buildHomeMatchTeamOptions(
  teams: Team[],
  divisions: Division[]
): { id: string; name: string; division_id?: string }[] {
  const teamsById = new Map<string, Team>(teams.map((team) => [team.id, team]));
  const nextTeamOptions = new Map<string, { id: string; name: string; division_id?: string }>();

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
        division_id: division.id,
      });
    }
  }

  for (const team of teams) {
    if (nextTeamOptions.has(team.id)) continue;
    nextTeamOptions.set(team.id, { id: team.id, name: team.name });
  }

  const emptySlotTeam = getEmptySlotTeam(teams);
  if (emptySlotTeam) {
    nextTeamOptions.set(emptySlotTeam.id, {
      id: emptySlotTeam.id,
      name: emptySlotTeam.name,
    });
  }

  return Array.from(nextTeamOptions.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [previous, setPrevious] = useState<Match[]>([]);

  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
  const [matchTeamOptions, setMatchTeamOptions] = useState<
    { id: string; name: string; division_id?: string }[]
  >([]);
  const [testerNotificationsBusy, setTesterNotificationsBusy] = useState(false);

  const [screen, setScreen] = useState<"home" | "seasonEditor">("home");

  const {
    seasonToEdit,
    openCreateSeason,
    openEditSeason,
    closeSeasonEditor,
    handleSaveSeason,
  } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const loadSeasonData = async (season: Season) => {
    const [teams, active, archived, matches, currentSeriesData] = await Promise.all([
      apiT.GetSeasonTeams(season.id),
      apiA.GetAnnouncements(season.id, "active"),
      apiA.GetAnnouncements(season.id, "archived"),
      apiM.GetSeasonMatches(season.id),
      apiSeries.GetSeries("", season.id, "current"),
    ]);
    const nextCurrentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
    const divisionsData = nextCurrentSeries
      ? await apiD.GetDivisions("", nextCurrentSeries.id, "all")
      : [];
    const divisions = (Array.isArray(divisionsData) ? divisionsData : [divisionsData]) as Division[];

    setSeasonTeams(teams);
    setMatchTeamOptions(buildHomeMatchTeamOptions(teams, divisions));
    setActiveAnnouncements(active);
    setArchivedAnnouncements(archived);

    const parts = splitMatches(matches, new Date());
    setUpcoming(parts.upcoming);
    setPrevious(parts.previous);
  };

  const handlePublish = async () => {
    try {
      await apiP.Publish();
      if (selectedSeason) {
        await loadSeasonData(selectedSeason);
      }
      alert("Changes published for public view.");
    } catch (err) {
      console.error(err);
      alert("Failed to publish changes");
    }
  };

  const handleRevert = async () => {
    try {
      await apiP.Revert();
      if (selectedSeason) {
        await loadSeasonData(selectedSeason);
      }
      alert("Unpublished draft and deleted changes reverted.");
    } catch (err) {
      console.error(err);
      alert("Failed to revert unpublished changes");
    }
  };

  const handleAnnouncementChange = async (announcement: Announcement, change: string) => {
    if (!selectedSeason) return;

    if (change === "edit") await apiA.UpdateAnnouncement(announcement);
    else if (change === "delete") await apiA.DeleteAnnouncement(announcement);
    else if (change === "add") await apiA.CreateAnnouncement(announcement);

    const [active, archived] = await Promise.all([
      apiA.GetAnnouncements(selectedSeason.id, "active"),
      apiA.GetAnnouncements(selectedSeason.id, "archived"),
    ]);

    setActiveAnnouncements(active);
    setArchivedAnnouncements(archived);
  };

  const handleUpdateMatch = async (updated: Match) => {
    await apiM.UpdateMatch(updated);

    if (!selectedSeason) return;

    const allmatches = await apiM.GetSeasonMatches(selectedSeason.id);
    const parts = splitMatches(allmatches, new Date());
    setUpcoming(parts.upcoming);
    setPrevious(parts.previous);
  };

  const handleDeleteMatch = async (match: Match) => {
    await apiM.DeleteMatch(match);

    if (!selectedSeason) return;

    const allmatches = await apiM.GetSeasonMatches(selectedSeason.id);
    const parts = splitMatches(allmatches, new Date());
    setUpcoming(parts.upcoming);
    setPrevious(parts.previous);
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

  const visibleAnnouncements = useMemo(
    () => ({
      active: filterVisibleByEditingStatus(activeAnnouncements, canManageContent),
      archived: filterVisibleByEditingStatus(archivedAnnouncements, canManageContent),
    }),
    [activeAnnouncements, archivedAnnouncements, canManageContent]
  );

  const visibleMatches = useMemo(
    () => {
      const emptySlotTeamIds = new Set(
        seasonTeams.filter((team) => isEmptySlotTeam(team)).map((team) => team.id)
      );

      return {
        upcoming: filterVisibleByEditingStatus(upcoming, canManageContent).filter(
          (match) => !isOpenSlotMatch(match, emptySlotTeamIds)
        ),
        previous: filterVisibleByEditingStatus(previous, canManageContent).filter(
          (match) => !isOpenSlotMatch(match, emptySlotTeamIds)
        ),
      };
    },
    [upcoming, previous, seasonTeams, canManageContent]
  );

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleUpcoming = getVisibleMatches(visibleMatches.upcoming, 2, "upcoming");
  const visiblePrevious = getVisibleMatches(visibleMatches.previous, 2, "previous");

  const teamNamesById = useMemo(
    () =>
      Object.fromEntries(
        filterOutEmptySlotTeams(seasonTeams).map((team) => [team.id, team.name])
      ) as Record<string, string>,
    [seasonTeams]
  );

  const teamSlugsById = useMemo(
    () =>
      Object.fromEntries(
        filterOutEmptySlotTeams(seasonTeams).map((team) => [team.id, team.slug])
      ) as Record<string, string>,
    [seasonTeams]
  );

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
        console.error("Error resetting to current season:", err);
      }
    };

    resetToPublicSeason();
  }, [canManageContent]);

  useEffect(() => {
    if (!selectedSeason) return;

    const load = async () => {
      try {
        await loadSeasonData(selectedSeason);
      } catch (err) {
        console.error("Error fetching season data:", err);
      }
    };

    load();
  }, [selectedSeason]);

  return (
    <div id="page-top" className="page">
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={handleAdminToggle}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={handlePublish}
        onRevert={canManageContent ? handleRevert : undefined}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(s) => setSelectedSeason(s)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
        onToggleTesterNotifications={handleToggleTesterNotifications}
        testerNotificationsBusy={testerNotificationsBusy}
      />

      <HeroBanner />

      {screen === "home" && selectedSeason && (
        <main className="main">
          <div className="layout-grid">
            <AnnouncementsSection
              activeAnnouncements={visibleAnnouncements.active}
              archivedAnnouncements={visibleAnnouncements.archived}
              isAdmin={canManageContent}
              currentSeason={selectedSeason}
              onAnnouncementChange={handleAnnouncementChange}
            />
            <MatchesSection
              upcoming={visibleUpcoming}
              previous={visiblePrevious}
              teamNamesById={teamNamesById}
              teamSlugsById={teamSlugsById}
              teamOptions={matchTeamOptions}
              isAdmin={canManageContent}
              updateMatch={handleUpdateMatch}
              deleteMatch={handleDeleteMatch}
            />
          </div>
        </main>
      )}

      {screen === "seasonEditor" && (
        <main className="main">
          <SeasonEditor
            initialSeason={seasonToEdit}
            onCancel={closeSeasonEditor}
            onSave={handleSaveSeason}
          />
        </main>
      )}

      <Footer />
    </div>
  );
}
