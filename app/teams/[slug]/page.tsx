"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import TeamDetail from "@/components/teams/TeamDetail";
import type { Team } from "@/types/team_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";

import styles from "./page.module.css";
import { splitMatches } from "@/lib/matches/sortingFunctions";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiT from "@/lib/api/team_api";
import * as apiM from "@/lib/api/match_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";

export default function TeamDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(true);
  const [team, setTeam] = useState<Team>();
  const [upcomingGames, setUpcomingGames] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState<"home" | "seasonEditor">("home");
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const {seasonToEdit, openCreateSeason, openEditSeason, closeSeasonEditor, handleSaveSeason,} = useSeasonEditor(
    {selectedSeason, setSelectedSeason, setAllSeasons, setScreen,});

  const handlePublish = async () => {
    try {
      await apiP.Publish();
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
    if (!teamData || !teamData[0]) {
      console.error("No team by slug returned.");
      return;
    }

    setTeam(teamData[0]);

    if (!currentSeason) {
      console.error("No current season returned.");
      return;
    }

    setSelectedSeason(currentSeason);

    const all = await apiS.GetSeasons("", "all");
    setAllSeasons(Array.isArray(all) ? all : [all]);
  };

  load().catch((err) => console.error("Error fetching seasons:", err));
}, [params.slug]);

useEffect(() => {
  if (!selectedSeason || !team) return;

  const loadSeasonData = async () => {
    const matches = await apiM.GetTeamsSeasonMatches(team.id, selectedSeason.id);
    const parts = splitMatches(matches);
    setUpcomingGames(parts.upcoming);
  };

  loadSeasonData().catch((err) =>
    console.error("Error fetching season data:", err)
  );
}, [selectedSeason?.id, team?.id]);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={handlePublish}
        seasons={allSeasons}
        selectedSeason={selectedSeason}
        onSelect={(s) => setSelectedSeason(s)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      <main className={styles.main}>
        {loading && <p>Loading team...</p>}
        {!loading && team && <TeamDetail team={team} games={upcomingGames} isAdmin={isAdmin} />}
        {!loading && !team && <p>Team not found.</p>}
      </main>

      <Footer />
    </div>
  );
}
