  /**
 * Home page: assembles hero, announcements, and match summaries for the dashboard.
 * Uses mock announcements/matches data with local state and `updateMatch` client updates.
 * Inputs: admin toggle, announcement edits, and match updates; no direct DB calls yet.
 */
"use client";

import {  useEffect, useState } from "react";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";

import type { Announcement } from "@/backend/models/announcement_mod";
import type { Match } from "@/backend/models/match_mod";
import type { Season } from "@/backend/models/season_mod";

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



  const handleUpdateMatch = (updated: Match) => updateMatchWithSync(updated, today, setUpcoming, setPrevious);
  const handlePublish = () => {alert("Changes published for public view.");};
  
  const visibleUpcoming = getVisibleMatches(upcoming, 2, "upcoming");
  const visiblePrevious = getVisibleMatches(previous, 2, "previous");

  const today = new Date().toISOString().split("T")[0];
  
  useEffect(() => {
    const load = async () => {
      // 1) get current season
      const seasons = await apiS.GetSeasons("", "current"); // Season[]
      let season = seasons[0];

      // 2) if none, create an empty one
      if (!season) {
        const today = new Date().toISOString().split("T")[0];

        const empty: Season = {
          id: "temp",
          name: "empty",
          series_ids: [""],
          editing_status: "draft",
          start_date: today,
          end_date: today,
        };

        season = await apiS.CreateSeason(empty); // ideally returns Season
      }

      setSelectedSeason(season);

      // 3) fetch everything for that season
      const [active, archived, matches] = await Promise.all([
        apiA.GetAnnouncements(season.id, "active"),
        apiA.GetAnnouncements(season.id, "archived"),
        apiM.GetSeasonMatches(season.id),
      ]);

      // 4) set state
      setActiveAnnouncements(active);
      setArchivedAnnouncements(archived);

      const { upcoming, previous } = splitMatches(matches);
      setUpcoming(upcoming);
      setPrevious(previous);
    };

    load().catch(err => console.error("Error fetching data:", err));
  }, []);
  return (
    <div id="page-top">
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={handlePublish}
      />
      <HeroBanner />
      {selectedSeason && (
      <main>
        
        <div className="layout-grid">
          <AnnouncementsSection
            activeAnnouncements={activeAnnouncements}
            archivedAnnouncements={archivedAnnouncements}
            isAdmin={isAdmin}
            currentSeason= {selectedSeason}
            onAnnouncementChange={handleAnnouncementChange}
          />
          <MatchesSection
            upcoming={visibleUpcoming}
            previous={visiblePrevious}
            isAdmin={isAdmin}
            updateMatch={handleUpdateMatch}
          />
        </div>
      </main>)}
      <Footer />
    </div>
  );
}
