"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import TeamDetail from "@/components/teams/TeamDetail";
import type { Team } from "@/types/team_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";
import type { Division } from "@/types/division_mod";
import styles from "./page.module.css";
import { splitMatches } from "@/lib/matches/sortingFunctions";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiAdmin from "@/lib/api/admin_api";
import * as apiT from "@/lib/api/team_api";
import * as apiM from "@/lib/api/match_api";
import * as apiSeries from "@/lib/api/series_api";
import * as apiStanding from "@/lib/api/standing_api";
import * as apiD from "@/lib/api/division_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import {
  filterVisibleByEditingStatus,
  isVisibleByEditingStatus,
} from "@/lib/data/editing_status";

export default function TeamDetailPage() {
  const params = useParams<{ slug: string }>();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [team, setTeam] = useState<Team>();
  const [upcomingGames, setUpcomingGames] = useState<Match[]>([]);
  const [previousGames, setPreviousGames] = useState<Match[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleUpcomingGames = useMemo(
    () => filterVisibleByEditingStatus(upcomingGames, canManageContent),
    [upcomingGames, canManageContent]
  );

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleTeam = useMemo(() => {
    return isVisibleByEditingStatus(team, canManageContent) ? team : undefined;
  }, [team, canManageContent]);
  const teamId = team?.id;

  const teamNamesById = useMemo(
    () =>
      Object.fromEntries(seasonTeams.map((currentTeam) => [currentTeam.id, currentTeam.name])) as Record<string, string>,
    [seasonTeams]
  );

  const teamSlugsById = useMemo(
    () =>
      Object.fromEntries(seasonTeams.map((currentTeam) => [currentTeam.id, currentTeam.slug])) as Record<string, string>,
    [seasonTeams]
  );

  const loadTeamSeasonData = async (season: Season, teamId: string) => {
    const [matches, currentSeriesData, teams] = await Promise.all([
      apiM.GetTeamsSeasonMatches(teamId, season.id),
      apiSeries.GetSeries("", season.id, "current"),
      apiT.GetSeasonTeams(season.id),
    ]);

    const currentSeries = Array.isArray(currentSeriesData)
      ? currentSeriesData[0]
      : currentSeriesData;
    const parts = splitMatches(matches);
    setSeasonTeams(teams);
    setUpcomingGames(parts.upcoming);
    setPreviousGames(parts.previous);

    if (!currentSeries) {
      return;
    }

    const standing = await apiStanding.GetTeamStanding(teamId, currentSeries.id);

    if (!standing) {
      setTeam((previous) =>
        previous
          ? { ...previous, division: undefined, current_ranking: undefined }
          : previous
      );
      return;
    }

    const divisionData = await apiD.GetDivisions(standing.division_id, "", "specific");
    const division = (Array.isArray(divisionData) ? divisionData[0] : divisionData) as Division;
    const sortedStandings = [...division.standings].sort((a, b) => b.points - a.points);
    const ranking = sortedStandings.findIndex((item) => item.team.id === teamId) + 1;

    setTeam((previous) =>
      previous
        ? {
            ...previous,
            division: division.name,
            current_ranking: ranking > 0 ? ranking : undefined,
          }
        : previous
    );
  };

  const handlePublish = async () => {
    try {
      await apiP.Publish();
      if (selectedSeason && team) {
        await loadTeamSeasonData(selectedSeason, team.id);
      }
      alert("Teams published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish teams");
    }
  };

  const handleRevert = async () => {
    try {
      await apiP.Revert();
      if (selectedSeason && team) {
        await loadTeamSeasonData(selectedSeason, team.id);
      }
      alert("Unpublished draft and deleted changes reverted.");
    } catch (err) {
      console.error(err);
      alert("Failed to revert unpublished changes");
    }
  };

  const handleDeleteMatch = async (match: Match) => {
    await apiM.DeleteMatch(match);
    if (selectedSeason && team) {
      await loadTeamSeasonData(selectedSeason, team.id);
    }
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    await apiT.UpdateTeam(updatedTeam);
    const refreshedTeam = await apiT.GetTeam(updatedTeam.id);
    setTeam((previous) =>
      previous
        ? {
            ...refreshedTeam,
            division: previous.division,
            current_ranking: previous.current_ranking,
          }
        : refreshedTeam
    );

    if (selectedSeason) {
      const teams = await apiT.GetSeasonTeams(selectedSeason.id);
      setSeasonTeams(teams);
    }
  };

  useEffect(() => {
    const load = async () => {
      const session = await apiAdmin.GetAdminSession();
      setIsAdmin(session.isAdmin);

      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;
      const teamData = await apiT.GetTeamBySlug(params.slug);

      if (!teamData) {
        console.error("No team by slug returned.");
        setLoading(false);
        return;
      }

      setTeam(teamData);

      if (!currentSeason) {
        console.error("No current season returned.");
        setLoading(false);
        return;
      }

      setSelectedSeason(currentSeason);

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);
      setLoading(false);
    };

    load().catch((err) => {
      console.error("Error fetching seasons:", err);
      setLoading(false);
    });
  }, [params.slug]);

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
        console.error("Error resetting team detail season:", err);
      }
    };

    resetToPublicSeason();
  }, [canManageContent]);

  useEffect(() => {
    if (!selectedSeason || !teamId) return;

    const load = async () => {
      try {
        await loadTeamSeasonData(selectedSeason, teamId);
      } catch (err) {
        console.error("Error fetching season data:", err);
      }
    };

    load();
  }, [selectedSeason, teamId]);

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
      />

      <main className={styles.main}>
        {loading && <p>Loading team...</p>}
        {!loading && visibleTeam && (
          <TeamDetail
            team={visibleTeam}
            upcomingGames={visibleUpcomingGames}
            previousGames={previousGames}
            isAdmin={canManageContent}
            updateTeam={handleUpdateTeam}
            teamNamesById={teamNamesById}
            teamSlugsById={teamSlugsById}
            deleteMatch={handleDeleteMatch}
          />
        )}
        {!loading && !visibleTeam && <p>Team not found.</p>}
      </main>

      <Footer />
    </div>
  );
}
