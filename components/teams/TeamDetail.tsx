import { useMemo, useState } from "react";
import styles from "./TeamDetail.module.css";
import type { Team } from "@/types/team_mod";
import type { Match } from "@/types/match_mod";
import { Calendar } from "@/components/common/calendar/calendar";
import MatchesSection from "../home/Matches/MatchesSection";

interface Props {
  team: Team;
  upcomingGames: Match[];
  previousGames: Match[];
  isAdmin: boolean;
  updateTeam?: (updatedTeam: Team) => Promise<unknown>;
  updateMatch?: (updated: Match) => Promise<unknown>;
  deleteMatch?: (match: Match) => Promise<unknown>;
  teamNamesById?: Record<string, string>;
  teamSlugsById?: Record<string, string>;
}

function buildCalendarMonths(matches: Match[]) {
  const monthMap = new Map<string, { month: number; year: number; matches: Match[] }>();

  for (const match of matches) {
    const date = new Date(`${match.date}T00:00:00`);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, { month, year, matches: [] });
    }

    monthMap.get(key)!.matches.push(match);
  }

  return Array.from(monthMap.values()).sort(
    (a, b) => a.year - b.year || a.month - b.month
  );
}

export default function TeamDetail({
  team,
  upcomingGames,
  previousGames,
  isAdmin,
  updateTeam,
  updateMatch,
  deleteMatch,
  teamNamesById = {},
  teamSlugsById = {},
}: Props) {
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [draftTeam, setDraftTeam] = useState<Team>(team);

  const months = useMemo(
    () => buildCalendarMonths([...upcomingGames, ...previousGames]),
    [upcomingGames, previousGames]
  );

  return (
    <div className={styles.layout}>
      <aside className={styles.sideColumn}>
        <div className={styles.infoCard}>
          <div className={styles.teamTitleBlock}>
            {isEditingTeam ? (
              <input
                className={styles.textInput}
                value={draftTeam.name}
                onChange={(e) => setDraftTeam((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Team name"
              />
            ) : (
              <div className={styles.teamName}>{team.name}</div>
            )}

            {team.division && (
              <div className={styles.badge}> {team.division}</div>
            )}

            {typeof team.current_ranking === "number" && (
              <div className={styles.badge}>
                Current Rank #{team.current_ranking}
              </div>
            )}
          </div>

          {isAdmin && updateTeam && (
            <div className={styles.teamActions}>
              {isEditingTeam ? (
                <>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={async () => {
                      await updateTeam(draftTeam);
                      setIsEditingTeam(false);
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => {
                      setDraftTeam(team);
                      setIsEditingTeam(false);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => {
                    setDraftTeam(team);
                    setIsEditingTeam(true);
                  }}
                >
                  Edit Team
                </button>
              )}
            </div>
          )}

          <div className={styles.infoRows}>
            <div className={styles.infoRow}>
              <div className={styles.label}>Captain</div>
              <div className={styles.valueGroup}>
                {isEditingTeam ? (
                  <>
                    <label className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Captain Name</span>
                      <input
                        className={styles.textInput}
                        value={draftTeam.captain_name}
                        onChange={(e) => setDraftTeam((prev) => ({ ...prev, captain_name: e.target.value }))}
                        placeholder="Captain name"
                      />
                    </label>
                    <label className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Captain Email</span>
                      <input
                        className={styles.textInput}
                        value={draftTeam.captain_email}
                        onChange={(e) => setDraftTeam((prev) => ({ ...prev, captain_email: e.target.value }))}
                        placeholder="Captain email"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <div className={styles.value}>{team.captain_name}</div>
                    {isAdmin && (
                      <div className={styles.email}>{team.captain_email}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={styles.grayBar} />

            <div className={styles.infoRow}>
              <div className={styles.label}>Co-Captain</div>
              <div className={styles.valueGroup}>
                {isEditingTeam ? (
                  <>
                    <label className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Co-Captain Name</span>
                      <input
                        className={styles.textInput}
                        value={draftTeam.co_captain_name}
                        onChange={(e) => setDraftTeam((prev) => ({ ...prev, co_captain_name: e.target.value }))}
                        placeholder="Co-captain name"
                      />
                    </label>
                    <label className={styles.inputGroup}>
                      <span className={styles.inputLabel}>Co-Captain Email</span>
                      <input
                        className={styles.textInput}
                        value={draftTeam.co_captain_email}
                        onChange={(e) => setDraftTeam((prev) => ({ ...prev, co_captain_email: e.target.value }))}
                        placeholder="Co-captain email"
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <div className={styles.value}>{team.co_captain_name}</div>
                    {isAdmin && (
                      <div className={styles.email}>{team.co_captain_email}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <aside className={styles.rightColumn}>
        <div className={styles.calendarCard}>
          <Calendar months={months} />
        </div>
      </aside>

      <div className={`${styles.mainColumn} ${styles.columnDivider}`}>
        <MatchesSection
          upcoming={upcomingGames}
          previous={previousGames}
          teamNamesById={teamNamesById}
          teamSlugsById={teamSlugsById}
          isAdmin={isAdmin}
          updateMatch={updateMatch ?? (async () => {})}
          deleteMatch={deleteMatch}
        />
      </div>
    </div>
  );
}
