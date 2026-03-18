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

  const [isAdmin, setIsAdmin] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [team, setTeam] = useState<Team>();
  const [upcomingGames, setUpcomingGames] = useState<Match[]>([]);
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

  const loadTeamSeasonData = async (season: Season, currentTeam: Team) => {
    const [matches, currentSeriesData] = await Promise.all([
      apiM.GetTeamsSeasonMatches(currentTeam.id, season.id),
      apiSeries.GetSeries("", season.id, "current"),
    ]);

    const currentSeries = Array.isArray(currentSeriesData)
      ? currentSeriesData[0]
      : currentSeriesData;
    const parts = splitMatches(matches);
    setUpcomingGames(parts.upcoming);

    if (!currentSeries) {
      return;
    }

    const standing = await apiStanding.GetTeamStanding(currentTeam.id, currentSeries.id);

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
    const ranking = sortedStandings.findIndex((item) => item.team.id === currentTeam.id) + 1;

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
        await loadTeamSeasonData(selectedSeason, team);
      }
      alert("Teams published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish teams");
    }
  };

  useEffect(() => {
    const load = async () => {
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
    if (!selectedSeason || !team) return;

    const load = async () => {
      try {
        await loadTeamSeasonData(selectedSeason, team);
      } catch (err) {
        console.error("Error fetching season data:", err);
      }
    };

    load();
  }, [selectedSeason, team]);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={handlePublish}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(season) => setSelectedSeason(season)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      <main className={styles.main}>
        {loading && <p>Loading team...</p>}
        {!loading && visibleTeam && (
          <TeamDetail team={visibleTeam} games={visibleUpcomingGames} isAdmin={canManageContent} />
        )}
        {!loading && !visibleTeam && <p>Team not found.</p>}
      </main>

      <Footer />
    </div>
  );
}
