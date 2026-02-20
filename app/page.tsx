  /**
 * Home page: assembles hero, announcements, and match summaries for the dashboard.
 * Uses mock announcements/matches data with local state and `updateMatch` client updates.
 * Inputs: admin toggle, announcement edits, and match updates; no direct DB calls yet.
 */
"use client";

import {  useEffect, useState } from "react";
import {fetchActiveAnnouncements, fetchArchivedAnnouncements} from "@/lib/api/public/p_announcements";
import {fetchUpcomingMatches, fetchPreviousMatches} from "@/lib/api/public/p_matches";
import {updateMatch,} from "@/lib/api/admin/a_matches";
import { getVisibleMatches } from "@/lib/matches/visibilityFunctions";
import { updateMatchWithSync } from "@/lib/matches/updateFunctions";

import type { Announcement } from "@/types/announcements";
import type { Match } from "@/types/matches";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import HeroBanner from "@/components/home/HeroBanner/HeroBanner";
import AnnouncementsSection from "@/components/home/Announcements/AnnouncementsSection";
import MatchesSection from "@/components/home/Matches/MatchesSection";



export default function Home() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [activeAnnouncements, setActiveAnnouncements] = useState<Announcement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<Announcement[]>([]);

  const [upcoming, setUpcoming] = useState<Match[]>([]);
  const [previous, setPrevious] = useState<Match[]>([]);

  
  // when admin adds or edits announcements, update state
  const handleAnnouncementsUpdate = (active: Announcement[], archived: Announcement[]) => {setActiveAnnouncements(active);setArchivedAnnouncements(archived);};
  const handleUpdateMatch = (updated: Match) => updateMatchWithSync(updated, today, setUpcoming, setPrevious);
  const handlePublish = () => {alert("Changes published for public view.");};
  
  const visibleUpcoming = getVisibleMatches(upcoming, 2, "upcoming");
  const visiblePrevious = getVisibleMatches(previous, 2, "previous");

  const today = new Date().toISOString().split("T")[0];
  
  useEffect(() => {
    Promise.all([
      fetchActiveAnnouncements(),
      fetchArchivedAnnouncements(),
      fetchUpcomingMatches(),
      fetchPreviousMatches(),
    ])
    .then(([active, archived, upcoming, previous]) => {
      setActiveAnnouncements(active);
      setArchivedAnnouncements(archived);
      setUpcoming(upcoming);
      setPrevious(previous);
    })

    .catch((err) => {
      console.error("Error fetching announcements:", err);
    });
  }, []);
  return (
    <div id="page-top">
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={handlePublish}
      />
      <HeroBanner />
      <main>
        <div className="layout-grid">
          <AnnouncementsSection
            activeAnnouncements={activeAnnouncements}
            archivedAnnouncements={archivedAnnouncements}
            isAdmin={isAdmin}
            onAnnouncementsChange={handleAnnouncementsUpdate}
          />
          <MatchesSection
            upcoming={visibleUpcoming}
            previous={visiblePrevious}
            isAdmin={isAdmin}
            updateMatch={handleUpdateMatch}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
