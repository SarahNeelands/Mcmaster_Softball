"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SeasonEditor from "@/components/editors/SeasonEditor";
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
import {
  resolveSelectedSeason,
  setStoredSelectedSeason,
} from "@/lib/seasons/selection";
import { isEmptySlotTeam, isOpenSlotMatch } from "@/lib/teams/specialTeams";

function buildTeamSeasonStats(matches: Match[], teamId: string) {
  return matches.reduce(
    (totals, match) => {
      if (match.home_score === null || match.away_score === null) {
        return totals;
      }

      const isHomeTeam = match.home_team_id === teamId;
      const teamScore = isHomeTeam ? match.home_score : match.away_score;
      const opponentScore = isHomeTeam ? match.away_score : match.home_score;

      totals.runs_for += teamScore;
      totals.runs_against += opponentScore;

      if (teamScore > opponentScore) {
        totals.season_wins += 1;
      } else if (teamScore < opponentScore) {
        totals.season_losses += 1;
      }

      return totals;
    },
    {
      season_wins: 0,
      season_losses: 0,
      runs_for: 0,
      runs_against: 0,
    }
  );
}

export default function TeamDetailPage() {
  const params = useParams<{ slug: string }>();

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSessionChecked, setAdminSessionChecked] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [team, setTeam] = useState<Team>();
  const [upcomingGames, setUpcomingGames] = useState<Match[]>([]);
  const [previousGames, setPreviousGames] = useState<Match[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [testerNotificationsBusy, setTesterNotificationsBusy] = useState(false);

  const {
    isSeasonEditorOpen,
    seasonToEdit,
    openCreateSeason,
    openEditSeason,
    closeSeasonEditor,
    handleSaveSeason,
  } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleUpcomingGames = useMemo(
    () => {
      const emptySlotTeamIds = new Set(
        seasonTeams.filter((currentTeam) => isEmptySlotTeam(currentTeam)).map((currentTeam) => currentTeam.id)
      );

      return filterVisibleByEditingStatus(upcomingGames, canManageContent).filter(
        (match) => !isOpenSlotMatch(match, emptySlotTeamIds)
      );
    },
    [upcomingGames, seasonTeams, canManageContent]
  );

  const visiblePreviousGames = useMemo(() => {
    const emptySlotTeamIds = new Set(
      seasonTeams.filter((currentTeam) => isEmptySlotTeam(currentTeam)).map((currentTeam) => currentTeam.id)
    );

    return filterVisibleByEditingStatus(previousGames, canManageContent).filter(
      (match) => !isOpenSlotMatch(match, emptySlotTeamIds)
    );
  }, [previousGames, seasonTeams, canManageContent]);

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleTeam = useMemo(() => {
    return isVisibleByEditingStatus(team, canManageContent) && !isEmptySlotTeam(team) ? team : undefined;
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
    const parts = splitMatches(matches, new Date());
    const stats = buildTeamSeasonStats(matches, teamId);
    setSeasonTeams(teams);
    setUpcomingGames(parts.upcoming);
    setPreviousGames(parts.previous);

    if (!currentSeries) {
      setTeam((previous) =>
        previous
          ? {
              ...previous,
              ...stats,
              division: undefined,
              current_ranking: undefined,
            }
          : previous
      );
      return;
    }

    const standing = await apiStanding.GetTeamStanding(teamId, currentSeries.id);

    if (!standing) {
      setTeam((previous) =>
        previous
          ? {
              ...previous,
              ...stats,
              division: undefined,
              current_ranking: undefined,
            }
          : previous
      );
      return;
    }

    const divisionData = await apiD.GetDivisions(standing.division_id, "", "specific");
    const division = (Array.isArray(divisionData) ? divisionData[0] : divisionData) as Division;
    const sortedStandings = [...division.standings].sort(
      (a, b) =>
        b.points - a.points ||
        b.wins - a.wins ||
        a.losses - b.losses ||
        b.ties - a.ties ||
        a.team.name.localeCompare(b.team.name)
    );
    const ranking = sortedStandings.findIndex((item) => item.team.id === teamId) + 1;

    setTeam((previous) =>
      previous
        ? {
            ...previous,
            ...stats,
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

  const handleUpdateMatch = async (updated: Match) => {
    await apiM.UpdateMatch(updated);
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
            season_wins: previous.season_wins,
            season_losses: previous.season_losses,
            runs_for: previous.runs_for,
            runs_against: previous.runs_against,
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

  useEffect(() => {
    const load = async () => {
      try {
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

        const all = await apiS.GetSeasons("", "all");
        const seasons = Array.isArray(all) ? all : [all];
        setAllSeasons(seasons);
        setSelectedSeason(
          resolveSelectedSeason({
            currentSeason,
            seasons,
            isAdmin: session.isAdmin,
          })
        );
        setLoading(false);
      } finally {
        setAdminSessionChecked(true);
      }
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
    if (!adminSessionChecked || isAdmin) return;

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
  }, [adminSessionChecked, isAdmin]);

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
        onSelect={(season) => {
          setStoredSelectedSeason(season);
          setSelectedSeason(season);
        }}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
        onToggleTesterNotifications={handleToggleTesterNotifications}
        testerNotificationsBusy={testerNotificationsBusy}
      />

      <main className={styles.main}>
        {loading && <p>Loading team...</p>}
        {!loading && visibleTeam && (
        <TeamDetail
          team={visibleTeam}
          upcomingGames={visibleUpcomingGames}
          previousGames={visiblePreviousGames}
          isAdmin={canManageContent}
          updateTeam={handleUpdateTeam}
          updateMatch={handleUpdateMatch}
          teamNamesById={teamNamesById}
          teamSlugsById={teamSlugsById}
          teamOptions={seasonTeams.map((currentTeam) => ({
            id: currentTeam.id,
            name: currentTeam.name,
          }))}
          deleteMatch={handleDeleteMatch}
        />
        )}
        {!loading && !visibleTeam && <p>Team not found.</p>}
      </main>
      {isSeasonEditorOpen && (
        <SeasonEditor
          initialSeason={seasonToEdit}
          onCancel={closeSeasonEditor}
          onSave={handleSaveSeason}
        />
      )}

      <Footer />
    </div>
  );
}
