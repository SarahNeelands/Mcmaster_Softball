import { Match } from "../../types/match_mod";
import { ScoreSubmissionLink } from "../../types/score_submission_mod";
import * as repo from "../repo/score_submission_repo";
import { generateScoreSubmissionToken, getMatchScheduledAt, hashScoreSubmissionToken } from "../../lib/server/scoreSubmission";
import { getAppUrl, getFounderEmail, sendEmail } from "../../lib/server/email";
import { RecalculateDivisionStandings } from "./standing_service";

type SubmissionLookup = {
  link: ScoreSubmissionLink;
  match: repo.MatchWithTeams;
};

type ScoreRequestEmailRecord = {
  matchId: string;
  side: "home" | "away";
  teamName: string;
  email: string;
  opponentName: string;
  matchLabel: string;
  scheduledFor: string;
  requestedDeliveryAt: string | null;
};

function normalizeAndValidateEmail(email: string, label: string) {
  const normalized = email.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    throw new Error(`Invalid captain email for ${label}: "${email}"`);
  }

  return normalized;
}

function isMatchClosed(match: Match) {
  return match.score_status === "finalized" || match.score_status === "published_single_submission";
}

function isMatchInSchedulingWindow(match: Match, now: Date, windowEnd: Date) {
  const scheduledAt = getMatchScheduledAt(match.date, match.time);
  return scheduledAt > now && scheduledAt <= windowEnd;
}

function assertSubmissionAllowed(entry: SubmissionLookup) {
  if (!entry) {
    throw new Error("Invalid submission link.");
  }

  if (entry.link.used_at || entry.link.submitted_at) {
    throw new Error("This submission link has already been used.");
  }

  if (new Date(entry.link.expires_at) < new Date()) {
    throw new Error("This submission link has expired.");
  }

  if (isMatchClosed(entry.match)) {
    throw new Error("This match already has a finalized public result.");
  }
}

async function loadLookupByToken(token: string) {
  const tokenHash = hashScoreSubmissionToken(token);
  const row = await repo.getMatchByTokenHash(tokenHash);

  if (!row) {
    return null;
  }

  const {
    home_team_name,
    away_team_name,
    home_captain_email,
    away_captain_email,
    link_id,
    link_match_id,
    link_side,
    link_token_hash,
    link_email_sent_at,
    link_expires_at,
    link_submitted_home_score,
    link_submitted_away_score,
    link_submitted_at,
    link_used_at,
    link_created_at,
    ...matchFields
  } = row;

  return {
    link: {
      id: link_id,
      match_id: link_match_id,
      side: link_side,
      token_hash: link_token_hash,
      email_sent_at: link_email_sent_at,
      expires_at: link_expires_at,
      submitted_home_score: link_submitted_home_score,
      submitted_away_score: link_submitted_away_score,
      submitted_at: link_submitted_at,
      used_at: link_used_at,
      created_at: link_created_at,
    } satisfies ScoreSubmissionLink,
    match: {
      ...(matchFields as Match),
      home_team_name,
      away_team_name,
      home_captain_email,
      away_captain_email,
    },
  };
}

export async function getSubmissionPageData(token: string) {
  const entry = await loadLookupByToken(token);

  if (!entry) {
    throw new Error("Invalid submission link.");
  }

  assertSubmissionAllowed(entry);

  return {
    matchId: entry.match.id,
    homeTeamName: entry.match.home_team_name,
    awayTeamName: entry.match.away_team_name,
    date: entry.match.date,
    time: entry.match.time,
    side: entry.link.side,
    expiresAt: entry.link.expires_at,
  };
}

export async function ensureScoreRequestLinks(matchId: string) {
  const match = await repo.getMatchWithTeamsById(matchId);

  if (!match) {
    throw new Error("Match not found.");
  }

  const appUrl = getAppUrl();
  const scheduledAt = getMatchScheduledAt(match.date, match.time);
  const expiresAt = new Date(scheduledAt.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const result: Array<{ side: "home" | "away"; linkId: string; token?: string; email: string }> = [];

  for (const side of ["home", "away"] as const) {
    const existing = await repo.getLinkByMatchAndSide(match.id, side);
    if (existing) {
      let token: string | undefined;

      if (!existing.email_sent_at) {
        token = generateScoreSubmissionToken();
        await repo.rotatePendingLinkToken({
          linkId: existing.id,
          tokenHash: hashScoreSubmissionToken(token),
          expiresAt,
        });
      }

      result.push({
        side,
        linkId: existing.id,
        token,
        email: side === "home" ? match.home_captain_email : match.away_captain_email,
      });
      continue;
    }

    const token = generateScoreSubmissionToken();
    const created = await repo.insertLink({
      matchId: match.id,
      side,
      tokenHash: hashScoreSubmissionToken(token),
      expiresAt,
    });

    const link = created ?? (await repo.getLinkByMatchAndSide(match.id, side));
    if (!link) {
      throw new Error(`Failed to create ${side} submission link.`);
    }

    result.push({
      side,
      linkId: link.id,
      token,
      email: side === "home" ? match.home_captain_email : match.away_captain_email,
    });
  }

  return {
    appUrl,
    match,
    links: result,
  };
}

export async function sendScoreRequestEmails(matchId: string) {
  const { appUrl, match, links } = await ensureScoreRequestLinks(matchId);
  const scheduledAt = getMatchScheduledAt(match.date, match.time);
  const desiredSendAt = new Date(scheduledAt.getTime() - 60 * 60 * 1000);
  const sendAt = desiredSendAt > new Date() ? desiredSendAt.toISOString() : undefined;
  const failedEmails: Array<{ side: "home" | "away"; email: string; error: string }> = [];
  const scheduledSides: Array<"home" | "away"> = [];
  const sentEmails: ScoreRequestEmailRecord[] = [];

  for (const item of links) {
    const stored = await repo.getLinkByMatchAndSide(match.id, item.side);

    if (!stored) {
      throw new Error(`Missing stored ${item.side} score link.`);
    }

    if (stored.email_sent_at) {
      continue;
    }

    if (!item.token) {
      throw new Error(`Missing raw token for unsent ${item.side} link.`);
    }

    try {
      const recipientEmail = normalizeAndValidateEmail(
        item.email,
        `${item.side === "home" ? match.home_team_name : match.away_team_name} (${item.side})`
      );

      const submitUrl = `${appUrl}/submit-score?token=${encodeURIComponent(item.token)}`;
      const subject = `Submit score: ${match.home_team_name} vs ${match.away_team_name}`;
      const text =
        `Score submission link for ${match.home_team_name} vs ${match.away_team_name}\n\n` +
        `Scheduled: ${match.date} ${match.time}\n` +
        `Link type: ${item.side}\n` +
        `Submit here: ${submitUrl}\n\n` +
        `This link can be forwarded, but it can only be used once.\n` +
        `It expires 24 hours after the scheduled match time.`;

      await sendEmail({
        to: recipientEmail,
        subject,
        text,
        scheduledAt: sendAt,
        idempotencyKey: `score-request-${stored.id}`,
      });

      await repo.markEmailSent(stored.id);
      scheduledSides.push(item.side);
      sentEmails.push({
        matchId: match.id,
        side: item.side,
        teamName: item.side === "home" ? match.home_team_name : match.away_team_name,
        email: recipientEmail,
        opponentName: item.side === "home" ? match.away_team_name : match.home_team_name,
        matchLabel: `${match.home_team_name} vs ${match.away_team_name}`,
        scheduledFor: `${match.date} ${match.time}`,
        requestedDeliveryAt: sendAt ?? null,
      });
    } catch (error) {
      failedEmails.push({
        side: item.side,
        email: item.email,
        error: error instanceof Error ? error.message : "Unknown email error.",
      });
    }
  }

  if (scheduledSides.length > 0) {
    await repo.updateMatchScoreState({
      matchId: match.id,
      scoreStatus: "awaiting_scores",
      scoreRequestSentAt: "now",
    });
  }

  if (failedEmails.length > 0) {
    return {
      ok: scheduledSides.length > 0,
      scheduledSides,
      sentEmails,
      failedEmails,
    };
  }

  return { ok: true, scheduledSides, sentEmails, failedEmails };
}

export async function runDailyScoreCron() {
  const singleSubmissionResult = await publishSingleSideSubmissions();
  const noSubmissionResult = await notifyFounderOfNoSubmissionExpirations();

  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const matches = await repo.getMatchesNeedingScoreRequests(windowEnd.toISOString());
  const preparedMatchIds: string[] = [];
  const sentEmails: ScoreRequestEmailRecord[] = [];
  const failedMatches: Array<{ matchId: string; errors: string[] }> = [];

  // Daily preparation widens the window to 24 hours and relies on the provider
  // to honor a future send time 1 hour before first pitch.
  for (const match of matches) {
    if (!isMatchInSchedulingWindow(match, now, windowEnd)) {
      continue;
    }

    try {
      const result = await sendScoreRequestEmails(match.id);
      if (result.sentEmails.length > 0) {
        preparedMatchIds.push(match.id);
        sentEmails.push(...result.sentEmails);
      }
      if (result.failedEmails.length > 0) {
        failedMatches.push({
          matchId: match.id,
          errors: result.failedEmails.map((failure) => `${failure.side}: ${failure.error}`),
        });
      }
    } catch (error) {
      failedMatches.push({
        matchId: match.id,
        errors: [error instanceof Error ? error.message : "Unknown score request error."],
      });
    }
  }

  const result = {
    publishedMatchIds: singleSubmissionResult.publishedMatchIds,
    notifiedMatchIds: noSubmissionResult.notifiedMatchIds,
    preparedMatchIds,
    sentEmails,
    failedMatches,
  };

  await sendDailyScoreEmailSummary(result);

  return result;
}

export async function prepareScoreRequestsForSeason(seasonId: string) {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const matches = await repo.getMatchesNeedingScoreRequests(windowEnd.toISOString(), seasonId);
  const preparedMatchIds: string[] = [];
  const failedMatches: Array<{ matchId: string; errors: string[] }> = [];

  for (const match of matches) {
    if (!isMatchInSchedulingWindow(match, now, windowEnd)) {
      continue;
    }

    try {
      const result = await sendScoreRequestEmails(match.id);
      if (result.sentEmails.length > 0) {
        preparedMatchIds.push(match.id);
      }
      if (result.failedEmails.length > 0) {
        failedMatches.push({
          matchId: match.id,
          errors: result.failedEmails.map((failure) => `${failure.side}: ${failure.error}`),
        });
      }
    } catch (error) {
      failedMatches.push({
        matchId: match.id,
        errors: [error instanceof Error ? error.message : "Unknown score request error."],
      });
    }
  }

  return { preparedMatchIds, failedMatches };
}

async function sendDailyScoreEmailSummary(result: {
  publishedMatchIds: string[];
  notifiedMatchIds: string[];
  preparedMatchIds: string[];
  sentEmails: ScoreRequestEmailRecord[];
  failedMatches: Array<{ matchId: string; errors: string[] }>;
}) {
  const reportTo = process.env.DAILY_EMAIL_REPORT_TO || getFounderEmail();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const sentLines =
    result.sentEmails.length > 0
      ? result.sentEmails.map((email) => {
          const delivery = email.requestedDeliveryAt
            ? `queued for ${email.requestedDeliveryAt}`
            : "sent immediately";
          return `- ${email.email} (${email.teamName}, ${email.side}) for ${email.matchLabel} on ${email.scheduledFor}; ${delivery}`;
        })
      : ["- None"];

  const failureLines =
    result.failedMatches.length > 0
      ? result.failedMatches.flatMap((match) => [
          `- Match ${match.matchId}`,
          ...match.errors.map((error) => `  - ${error}`),
        ])
      : ["- None"];

  await sendEmail({
    to: reportTo,
    subject: `Daily score email report: ${today}`,
    text:
      `Daily score email report for ${today} (America/Toronto)\n\n` +
      `Score request emails queued/sent: ${result.sentEmails.length}\n` +
      `${sentLines.join("\n")}\n\n` +
      `Matches with score requests prepared: ${result.preparedMatchIds.length}\n` +
      `Single-sided scores published: ${result.publishedMatchIds.length}\n` +
      `No-submission notices sent: ${result.notifiedMatchIds.length}\n\n` +
      `Failures:\n${failureLines.join("\n")}`,
    idempotencyKey: `daily-score-email-report-${today}`,
  });
}

async function notifyFounderConflict(match: repo.MatchWithTeams, links: ScoreSubmissionLink[]) {
  if (match.founder_notified_conflict_at) {
    return;
  }

  const homeLink = links.find((link) => link.side === "home");
  const awayLink = links.find((link) => link.side === "away");

  await sendEmail({
    to: getFounderEmail(),
    subject: `Score conflict: ${match.home_team_name} vs ${match.away_team_name}`,
    text:
      `Conflict detected for match ${match.id}\n\n` +
      `${match.home_team_name} vs ${match.away_team_name}\n` +
      `Scheduled: ${match.date} ${match.time}\n` +
      `Home team link submitted: ${homeLink?.submitted_home_score}-${homeLink?.submitted_away_score}\n` +
      `Away team link submitted: ${awayLink?.submitted_home_score}-${awayLink?.submitted_away_score}\n\n` +
      `No score was published. Founder resolution is required.`,
  });

  await repo.updateMatchScoreState({
    matchId: match.id,
    founderNotifiedConflictAt: "now-if-null",
  });
}

export async function submitScore(input: {
  token: string;
  homeScore: number;
  awayScore: number;
}) {
  const entry = await loadLookupByToken(input.token);

  if (!entry) {
    throw new Error("Invalid submission link.");
  }

  assertSubmissionAllowed(entry);

  const saved = await repo.submitLinkScores({
    linkId: entry.link.id,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
  });

  if (!saved) {
    throw new Error("This submission link has already been used.");
  }

  await repo.updateMatchScoreState({
    matchId: entry.match.id,
    firstSubmittedAt: "now-if-null",
    scoreStatus: "awaiting_scores",
  });

  const links = await repo.getLinksForMatch(entry.match.id);
  const submittedLinks = links.filter((link) => link.submitted_at);

  if (submittedLinks.length === 2) {
    const [first, second] = submittedLinks;
    const sameScore =
      first.submitted_home_score === second.submitted_home_score &&
      first.submitted_away_score === second.submitted_away_score;

    if (sameScore) {
      await repo.updateMatchScoreState({
        matchId: entry.match.id,
        homeScore: first.submitted_home_score,
        awayScore: first.submitted_away_score,
        scoreStatus: "finalized",
        finalizedAt: "now",
      });
      await RecalculateDivisionStandings(entry.match.division_id);

      return { status: "finalized" as const };
    }

    await repo.updateMatchScoreState({
      matchId: entry.match.id,
      scoreStatus: "conflict_pending_founder",
    });

    const freshMatch = await repo.getMatchWithTeamsById(entry.match.id);
    if (!freshMatch) {
      throw new Error("Match not found after score submission.");
    }

    await notifyFounderConflict(freshMatch, links);
    return { status: "conflict" as const };
  }

  return { status: "awaiting_scores" as const };
}

export async function publishSingleSideSubmissions() {
  const matches = await repo.getMatchesReadyForSingleSidePublish();
  const published: string[] = [];

  for (const match of matches) {
    const links = await repo.getLinksForMatch(match.id);
    const submittedLinks = links.filter((link) => link.submitted_at);

    if (submittedLinks.length !== 1) {
      continue;
    }

    const submitted = submittedLinks[0];

    if (match.home_score === null || match.away_score === null || match.score_status !== "published_single_submission") {
      await repo.updateMatchScoreState({
        matchId: match.id,
        homeScore: submitted.submitted_home_score,
        awayScore: submitted.submitted_away_score,
        scoreStatus: "published_single_submission",
      });
      await RecalculateDivisionStandings(match.division_id);
    }

    await sendEmail({
      to: getFounderEmail(),
      subject: `Single-sided score published: ${match.home_team_name} vs ${match.away_team_name}`,
      text:
        `Only one side submitted within 24 hours.\n\n` +
        `${match.home_team_name} vs ${match.away_team_name}\n` +
        `Scheduled: ${match.date} ${match.time}\n` +
        `Submitted side: ${submitted.side}\n` +
        `Published score: ${submitted.submitted_home_score}-${submitted.submitted_away_score}`,
    });

    await repo.updateMatchScoreState({
      matchId: match.id,
      founderNotifiedSingleAt: "now-if-null",
    });

    published.push(match.id);
  }

  return { publishedMatchIds: published };
}

export async function notifyFounderOfNoSubmissionExpirations() {
  const matches = await repo.getMatchesReadyForNoSubmissionNotice();
  const notified: string[] = [];

  for (const match of matches) {
    const links = await repo.getLinksForMatch(match.id);
    const submittedLinks = links.filter((link) => link.submitted_at);

    if (submittedLinks.length > 0) {
      continue;
    }

    if (match.score_status !== "expired_no_submission") {
      await repo.updateMatchScoreState({
        matchId: match.id,
        scoreStatus: "expired_no_submission",
      });
    }

    await sendEmail({
      to: getFounderEmail(),
      subject: `No score submitted: ${match.home_team_name} vs ${match.away_team_name}`,
      text:
        `No team submitted a score within 24 hours.\n\n` +
        `${match.home_team_name} vs ${match.away_team_name}\n` +
        `Scheduled: ${match.date} ${match.time}\n` +
        `No score was published.`,
    });

    await repo.updateMatchScoreState({
      matchId: match.id,
      founderNotifiedNoSubmissionAt: "now-if-null",
    });

    notified.push(match.id);
  }

  return { notifiedMatchIds: notified };
}

export async function sendPendingConflictNotifications() {
  const matches = await repo.getMatchesNeedingConflictNotice();
  const notified: string[] = [];

  for (const match of matches) {
    const links = await repo.getLinksForMatch(match.id);
    const submittedLinks = links.filter((link) => link.submitted_at);

    if (submittedLinks.length === 2) {
      await notifyFounderConflict(match, links);
      notified.push(match.id);
    }
  }

  return { notifiedMatchIds: notified };
}

export async function resolveConflict(matchId: string, homeScore: number, awayScore: number) {
  const match = await repo.getMatchById(matchId);

  if (!match) {
    throw new Error("Match not found.");
  }

  await repo.updateMatchScoreState({
    matchId,
    homeScore,
    awayScore,
    scoreStatus: "finalized",
    finalizedAt: "now",
  });
  await RecalculateDivisionStandings(match.division_id);

  return { ok: true };
}

export async function getConflictResolutionData(matchId: string) {
  const match = await repo.getMatchWithTeamsById(matchId);

  if (!match) {
    throw new Error("Match not found.");
  }

  const links = await repo.getLinksForMatch(match.id);

  return {
    match,
    links,
  };
}
