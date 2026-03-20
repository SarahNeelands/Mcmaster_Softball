"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { formatDateTimeLabel } from "@/lib/matches/visibilityFunctions";

type SubmissionPageData = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  time: string;
  side: "home" | "away";
  expiresAt: string;
};

function SubmitScoreForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [data, setData] = useState<SubmissionPageData | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const nextToken = searchParams.get("token") ?? "";
      setToken(nextToken);

      if (!nextToken) {
        if (active) setError("Missing score submission token.");
        return;
      }

      const res = await fetch(`/api/score-submissions?token=${encodeURIComponent(nextToken)}`, {
        cache: "no-store",
      });
      const body = await res.json();

      if (!active) return;

      if (!res.ok) {
        setError(body.error ?? "Invalid submission link.");
        return;
      }

      setData(body);
      setError(null);
    };

    load().catch((err) => {
      if (active) {
        setError(err instanceof Error ? err.message : "Failed to load score form.");
      }
    });

    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const res = await fetch("/api/score-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
      }),
    });

    const body = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(body.error ?? "Failed to submit score.");
      return;
    }

    setMessage(
      body.status === "finalized"
        ? "Score submitted and published."
        : body.status === "conflict"
          ? "Score submitted. A founder will resolve the conflict before anything is published."
          : "Score submitted. Waiting for the other side."
    );
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Submit Score</h1>

        {error && <p className={styles.error}>{error}</p>}

        {data && (
          <>
            <dl className={styles.meta}>
              <div>
                <dt>Match</dt>
                <dd>{data.homeTeamName} vs {data.awayTeamName}</dd>
              </div>
              <div>
                <dt>Scheduled</dt>
                <dd>{formatDateTimeLabel(data.date, data.time)}</dd>
              </div>
              <div>
                <dt>Link</dt>
                <dd>{data.side === "home" ? "Home team" : "Away team"}</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>
                  {new Date(data.expiresAt).toLocaleString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </dd>
              </div>
            </dl>

            <form className={styles.form} onSubmit={handleSubmit}>
              <label className={styles.field}>
                <span>{data.homeTeamName} score</span>
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
                <span>{data.awayTeamName} score</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  required
                />
              </label>

              <button className={styles.button} type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit score"}
              </button>
            </form>
          </>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </section>
    </main>
  );
}

export default function SubmitScorePage() {
  return (
    <Suspense fallback={<main className={styles.page}><section className={styles.card}><h1 className={styles.title}>Submit Score</h1><p>Loading score form...</p></section></main>}>
      <SubmitScoreForm />
    </Suspense>
  );
}
