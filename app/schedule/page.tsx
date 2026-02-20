/**
 * Schedule page
 * - Displays published schedule to public users
 * - Allows admins to add games one day at a time
 * - All edits save immediately as drafts
 * - Publish finalizes all draft changes
 */
"use client";

import { useEffect, useMemo, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

import {
  fetchUpcomingMatches,
  fetchUpcomingMatchesByTeam,
} from "@/lib/api/public/p_matches";

import { publish } from "@/lib/api/admin/publish";
import { createNewMatch } from "@/lib/api/admin/a_matches";

import { groupMatchesByMonth } from "@/lib/matches/sortingFunctions";
import { Calendar } from "@/components/common/calendar/calendar";

import UpcomingMatches from "@/components/home/Matches/UpcomingMatches";
import ScheduleEditor from "@/components/home/Matches/ScheduleEditor";

import type { Match, ScheduleDay } from "@/types/matches";
import styles from "./page.module.css";
import { updateMatch } from "@/lib/api/admin/a_matches";


export default function SchedulePage() {
  /** Admin + filtering */
  const [isAdmin, setIsAdmin] = useState<boolean>(true); // dev default
  const [teamFilter, setTeamFilter] = useState<string>("all");

  /** Data */
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);

  /** Editor */
  const [isEditing, setIsEditing] = useState<boolean>(false);


    const visibleMatches = useMemo(() => {
    if (isAdmin) {
      return upcomingMatches.filter(
        (m) => m.editingStatus !== "deleted"
      );
    }

    return upcomingMatches.filter(
      (m) => m.editingStatus === "published"
    );
  }, [upcomingMatches, isAdmin]);

  /** Calendar grouping */
  const months = useMemo(
    () => groupMatchesByMonth(visibleMatches),
    [visibleMatches]
  );
  /** Fetch matches */
  const fetchMatches = async () => {
    const matches =
      teamFilter === "all"
        ? await fetchUpcomingMatches()
        : await fetchUpcomingMatchesByTeam(teamFilter);

    setUpcomingMatches(matches);
  };

  /** Publish drafts */
  const publishHandler = async () => {
    try {
      await publish();
      await fetchMatches();
      alert("Schedule published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish schedule");
    }
  };

  /** Handle editor close */
  const handleEditorClose = async (day: ScheduleDay | null) => {
    setIsEditing(false);

    if (!day) return; // cancelled

    for (const block of day.timeBlocks) {
      for (const game of block.games) {
        await createNewMatch({
          id: "",
          date: day.date,
          time: block.time,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          field: game.field,
          homeScore: 0,
          awayScore: 0,
        });
      }
    }

    await fetchMatches();
  };




  useEffect(() => {
    fetchMatches();
  }, [teamFilter]);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={publishHandler}
      />

      {/* Editor */}
      {isAdmin && isEditing && (
        <ScheduleEditor onClose={handleEditorClose} />
      )}

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.contentGrid}>
          <div className={styles.scheduleColumn}>
            <UpcomingMatches
              matches={visibleMatches}
              isAdmin={isAdmin}
              updateMatch={updateMatch}
              onAddGames={() => setIsEditing(true)}
              useCardGroups
            />
          </div>

          <aside className={styles.calendarStack}>
            <Calendar months={months} />
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
