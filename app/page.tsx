"use client";

import { useEffect, useMemo, useState } from "react";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";

import type { Announcement } from "@/types/announcement_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";
import type { Team } from "@/types/team_mod";

import { splitMatches } from "@/lib/matches/sortingFunctions";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroBanner from "@/components/home/HeroBanner/HeroBanner";
import AnnouncementsSection from "@/components/home/Announcements/AnnouncementsSection";
import MatchesSection from "@/components/home/Matches/MatchesSection";
import SeasonEditor from "@/components/editors/SeasonEditor";

import * as apiA from "@/lib/api/announcement_api";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiM from "@/lib/api/match_api";
import * as apiT from "@/lib/api/team_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [previous, setPrevious] = useState<Match[]>([]);

  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [seasonTeams, setSeasonTeams] = useState<Team[]>([]);

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
    const [teams, active, archived, matches] = await Promise.all([
      apiT.GetSeasonTeams(season.id),
      apiA.GetAnnouncements(season.id, "active"),
      apiA.GetAnnouncements(season.id, "archived"),
      apiM.GetSeasonMatches(season.id),
    ]);

    setSeasonTeams(teams);
    setActiveAnnouncements(active);
    setArchivedAnnouncements(archived);

    const parts = splitMatches(matches);
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
    const parts = splitMatches(allmatches);
    setUpcoming(parts.upcoming);
    setPrevious(parts.previous);
  };

  const visibleAnnouncements = useMemo(
    () => ({
      active: filterVisibleByEditingStatus(activeAnnouncements, canManageContent),
      archived: filterVisibleByEditingStatus(archivedAnnouncements, canManageContent),
    }),
    [activeAnnouncements, archivedAnnouncements, canManageContent]
  );

  const visibleMatches = useMemo(
    () => ({
      upcoming: filterVisibleByEditingStatus(upcoming, canManageContent),
      previous: filterVisibleByEditingStatus(previous, canManageContent),
    }),
    [upcoming, previous, canManageContent]
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
        seasonTeams.map((team) => [team.id, team.name])
      ) as Record<string, string>,
    [seasonTeams]
  );

  const teamSlugsById = useMemo(
    () =>
      Object.fromEntries(
        seasonTeams.map((team) => [team.id, team.slug])
      ) as Record<string, string>,
    [seasonTeams]
  );

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
    };

    load().catch((err) => console.error("Error fetching seasons:", err));
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
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={handlePublish}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(s) => setSelectedSeason(s)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
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
              isAdmin={canManageContent}
              updateMatch={handleUpdateMatch}
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
