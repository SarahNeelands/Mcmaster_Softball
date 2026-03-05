  /**
 * Home page: assembles hero, announcements, and match summaries for the dashboard.
 * Uses mock announcements/matches data with local state and `updateMatch` client updates.
 * Inputs: admin toggle, announcement edits, and match updates; no direct DB calls yet.
 */
"use client";

import {  useEffect, useState } from "react";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";

import type { Announcement } from "@/types/announcement_mod";
import type { Match } from "@/types/match_mod";
import type { Season } from "@/types/season_mod";

import {splitMatches} from "@/lib/matches/sortingFunctions";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroBanner from "@/components/home/HeroBanner/HeroBanner";
import AnnouncementsSection from "@/components/home/Announcements/AnnouncementsSection";
import MatchesSection from "@/components/home/Matches/MatchesSection";

import * as apiA from "@/lib/api/announcement_api";
import * as apiS from "@/lib/api/season_api";
import * as apiM from "@/lib/api/match_api";

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [previous, setPrevious] = useState<Match[]>([]);
  const [selectedSeason, setSelectedSeason]= useState<Season>();


  const handleAnnouncementChange = async (announcement: Announcement, change: string) => {
    if (!selectedSeason) return;
    if (change === "edit"){await apiA.UpdateAnnouncement(announcement);}
    else if(change === "delete"){await apiA.DeleteAnnouncement(announcement);}
    else if(change === "add"){await apiA.CreateAnnouncement(announcement);}
    const [active, archived] = await Promise.all([
      apiA.GetAnnouncements(selectedSeason.id, "active"),
      apiA.GetAnnouncements(selectedSeason.id, "archived"),
    ]);
    setActiveAnnouncements(active);
    setArchivedAnnouncements(archived);
  };



  const handleUpdateMatch = async (updated: Match) => {
    apiM.UpdateMatch(updated);
    if (!selectedSeason){return;}
    const allmatches = await apiM.GetSeasonMatches(selectedSeason?.id);
    const { upcoming, previous } = splitMatches(allmatches);
    setUpcoming(upcoming);
    setPrevious(previous);
  }
  const handlePublish = () => {alert("Changes published for public view.");};
  
  const visibleUpcoming = getVisibleMatches(upcoming, 2, "upcoming");
  const visiblePrevious = getVisibleMatches(previous, 2, "previous");

  const today = new Date().toISOString().split("T")[0];
  
  useEffect(() => {
  const load = async () => {
    // 1) get current season
    const data = await apiS.GetSeasons("", "current"); // might be Season OR Season[]
    const season = Array.isArray(data) ? data[0] : data;

    if (!season) {
      console.error("No current season returned.");
      return;
    }

    setSelectedSeason(season);

    const [active, archived, matches] = await Promise.all([
      apiA.GetAnnouncements(season.id, "active"),
      apiA.GetAnnouncements(season.id, "archived"),
      apiM.GetSeasonMatches(season.id),
    ]);

    setActiveAnnouncements(active);
    setArchivedAnnouncements(archived);

    const { upcoming, previous } = splitMatches(matches);
    setUpcoming(upcoming);
    setPrevious(previous);
  };

  load().catch((err) => console.error("Error fetching data:", err));
}, []);
  return (
    <div id="page-top" className="page">
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={handlePublish}
      />
      <HeroBanner />

      {selectedSeason && (
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

      <Footer />
    </div>
  );
}