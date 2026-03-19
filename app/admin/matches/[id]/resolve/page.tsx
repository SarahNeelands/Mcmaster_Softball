"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./page.module.css";
import { formatDateTimeLabel } from "@/lib/matches/visibilityFunctions";

type ResolveData = {
  match: {
    id: string;
    date: string;
    time: string;
    score_status: string;
    home_team_name: string;
    away_team_name: string;
    home_score: number | null;
    away_score: number | null;
  };
  links: Array<{
    side: "home" | "away";
    submitted_home_score: number | null;
    submitted_away_score: number | null;
    submitted_at: string | null;
  }>;
};

export default function ResolveConflictPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [matchId, setMatchId] = useState("");
  const [data, setData] = useState<ResolveData | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const id = params.id;
      setMatchId(id);

      const res = await fetch(`/api/admin/matches/${id}/resolve`, {
        cache: "no-store",
      });
      const body = await res.json();

      if (!active) return;

      if (res.status === 401) {
        router.replace("/msadmin");
        return;
      }

      if (!res.ok) {
        setError(body.error ?? "Failed to load match.");
        return;
      }

      setData(body);
      setHomeScore(String(body.match.home_score ?? 0));
      setAwayScore(String(body.match.away_score ?? 0));
    };

    load().catch((err) => {
      if (active) setError(err instanceof Error ? err.message : "Failed to load match.");
    });

    return () => {
      active = false;
    };
  }, [params, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/admin/matches/${matchId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      }),
    });

    const body = await res.json();
    setSaving(false);

    if (res.status === 401) {
      router.replace("/msadmin");
      return;
    }

    if (!res.ok) {
      setError(body.error ?? "Failed to save final score.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const homeLink = data?.links.find((link) => link.side === "home");
  const awayLink = data?.links.find((link) => link.side === "away");

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Resolve Match Score</h1>

        {error && <p className={styles.error}>{error}</p>}

        {data && (
          <>
            <dl className={styles.meta}>
              <div>
                <dt>Match</dt>
                <dd>{data.match.home_team_name} vs {data.match.away_team_name}</dd>
              </div>
              <div>
                <dt>Scheduled</dt>
                <dd>{formatDateTimeLabel(data.match.date, data.match.time)}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{data.match.score_status}</dd>
              </div>
              <div>
                <dt>Home link submission</dt>
                <dd>
                  {homeLink?.submitted_at
                    ? `${homeLink.submitted_home_score}-${homeLink.submitted_away_score}`
                    : "No submission"}
                </dd>
              </div>
              <div>
                <dt>Away link submission</dt>
                <dd>
                  {awayLink?.submitted_at
                    ? `${awayLink.submitted_home_score}-${awayLink.submitted_away_score}`
                    : "No submission"}
                </dd>
              </div>
            </dl>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>{data.match.home_team_name} final score</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>{data.match.away_team_name} final score</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  required
                />
              </label>

              <button className={styles.button} type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save final score"}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
