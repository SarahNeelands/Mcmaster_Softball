"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import TeamDetail from "@/components/teams/TeamDetail";
import { fetchTeamBySlug } from "@/lib/api/public/p_teams";
import { fetchUpcomingMatchesByTeam } from "@/lib/api/public/p_matches";
import type { Team } from "@/types/teams";
import type { Match } from "@/types/matches";
import { publish } from "@/lib/api/admin/publish";

import styles from "./page.module.css";

export default function TeamDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(true);
  const [team, setTeam] = useState<Team | null>(null);
  const [games, setGames] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const teamData = await fetchTeamBySlug(params.slug);
        if (!teamData) {
          if (!cancelled) router.replace("/teams");
          return;
        }
        if (cancelled) return;
        console.log("teamData from API:", teamData);
        setTeam(teamData);
        console.log("team id:", teamData.id);
        const matches = await fetchUpcomingMatchesByTeam(teamData.name);
        console.log("matches from API:", matches);
        if (cancelled) return;
        setGames(matches ?? []);
      } catch (e) {
        console.error("TeamDetailPage load failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params?.slug, router]);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={() => publish()}
      />

      <main className={styles.main}>
        {loading && <p>Loading team...</p>}
        {!loading && team && <TeamDetail team={team} games={games} isAdmin={isAdmin} />}
        {!loading && !team && <p>Team not found.</p>}
      </main>

      <Footer />
    </div>
  );
}
