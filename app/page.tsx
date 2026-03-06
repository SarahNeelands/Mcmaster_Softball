"use client";

import { useEffect, useState } from "react";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";

import type { Announcement } from "@/types/announcement_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";

import { splitMatches } from "@/lib/matches/sortingFunctions";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroBanner from "@/components/home/HeroBanner/HeroBanner";
import AnnouncementsSection from "@/components/home/Announcements/AnnouncementsSection";
import MatchesSection from "@/components/home/Matches/MatchesSection";
import SeasonEditor from "@/components/editors/SeasonEditor";

import * as apiA from "@/lib/api/announcement_api";
import * as apiS from "@/lib/api/season_api";
import * as apiM from "@/lib/api/match_api";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(true);

  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [previous, setPrevious] = useState<Match[]>([]);

  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);

  const [screen, setScreen] = useState<"home" | "seasonEditor">("home");
  const [seasonToEdit, setSeasonToEdit] = useState<Season | undefined>(undefined);

  const handlePublish = () => {
    alert("Changes published for public view.");
  };

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

  const handleSaveSeason = async (payload: Omit<Season, "id" | "series_ids">, id?: string) => {
    let saved: Season;

    if (id) {
      if (!seasonToEdit) throw new Error("No season loaded to edit.");
      saved = await apiS.UpdateSeason({
        ...seasonToEdit,
        ...payload,
        id,
      });
        console.log("handleSaveSeason payload:", payload);
        console.log("handleSaveSeason id:", id);
        console.log("seasonToEdit:", seasonToEdit);
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

  const visibleUpcoming = getVisibleMatches(upcoming, 2, "upcoming");
  const visiblePrevious = getVisibleMatches(previous, 2, "previous");

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
    if (!selectedSeason) return;

    const loadSeasonData = async () => {
      const [active, archived, matches] = await Promise.all([
        apiA.GetAnnouncements(selectedSeason.id, "active"),
        apiA.GetAnnouncements(selectedSeason.id, "archived"),
        apiM.GetSeasonMatches(selectedSeason.id),
      ]);

      setActiveAnnouncements(active);
      setArchivedAnnouncements(archived);

      const parts = splitMatches(matches);
      setUpcoming(parts.upcoming);
      setPrevious(parts.previous);
    };

    loadSeasonData().catch((err) => console.error("Error fetching season data:", err));
  }, [selectedSeason?.id]);

  return (
    <div id="page-top" className="page">
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

      <HeroBanner />

      {screen === "home" && selectedSeason && (
        <main className="main">
          <div className="layout-grid">
            <AnnouncementsSection
              activeAnnouncements={activeAnnouncements}
              archivedAnnouncements={archivedAnnouncements}
              isAdmin={isAdmin}
              currentSeason={selectedSeason}
              onAnnouncementChange={handleAnnouncementChange}
            />
            <MatchesSection
              upcoming={visibleUpcoming}
              previous={visiblePrevious}
              isAdmin={isAdmin}
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
            onSave={handleSaveSeason} />
        </main>
      )}

      <Footer />
    </div>
  );
}