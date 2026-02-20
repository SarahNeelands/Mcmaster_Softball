"use client";

import { useEffect, useState } from "react";

import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

import styles from "./page.module.css";
import { publish } from "@/lib/api/admin/publish";

import DivisionStandingsCard from "@/components/standings/DivisionStandingsCard";
import type { Series } from "@/types/seasons";
import type { Team } from "@/types/teams";

import {
  GetCurrentSeasonSeries,
  GetTeamsByDivisionID,
} from "@/lib/api/public/p_seasons";

export default function SchedulePage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [series, setSeries] = useState<Series | null>(null);

  // divisionID -> teams[]
  const [teamsByDivisionId, setTeamsByDivisionId] = useState<Record<string, Team[]>>({});

  // 1) Load the current series
  useEffect(() => {
    let cancelled = false;

    GetCurrentSeasonSeries()
      .then((seriesRes) => {
        if (cancelled) return;
        setSeries(seriesRes);
      })
      .catch((err) => console.error("Error fetching series:", err));

    return () => {
      cancelled = true;
    };
  }, []);

  // 2) Once we have the series, fetch teams for ALL divisions
  useEffect(() => {
    if (!series?.divisions?.length) return;

    let cancelled = false;

    Promise.all(
      series.divisions.map(async (div) => {
        const teams = await GetTeamsByDivisionID(div.id);
        return [div.id, teams] as const;
      })
    )
      .then((pairs) => {
        if (cancelled) return;

        const next: Record<string, Team[]> = {};
        for (const [divisionId, teams] of pairs) {
          next[divisionId] = teams;
        }
        setTeamsByDivisionId(next);
      })
      .catch((err) => console.error("Error fetching teams by division:", err));

    return () => {
      cancelled = true;
    };
  }, [series?.id]); // series changes => refetch division teams

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={() => publish()}
      />

      <main className={styles.main}>
        <div className={styles.contentGrid}>
          {series?.divisions?.map((division) => (
            <DivisionStandingsCard
              key={division.id}
              division={division}
              teams={teamsByDivisionId[division.id] ?? []}
              moveUpAmount={series.moveUpAmount}
              moveDownAmount={series.moveDownAmount}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
