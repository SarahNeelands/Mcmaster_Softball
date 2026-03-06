/**
 * Teams listing page: renders the teams table with roster/record data fetched via `fetchAllTeams`.
 * Interactions: admin toggle, add team (admin), update team (admin), delete team (admin), publish (admin).
 */
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import TeamTable from "@/components/teams/TeamTable";
import type { Team } from "@/types/team_mod";
import type { Season } from "@/types/season_mod";
import styles from "./page.module.css";

import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiT from "@/lib/api/team_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";



export default function TeamsPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  const [screen, setScreen] = useState<"home" | "seasonEditor">("home");
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const {seasonToEdit, openCreateSeason, openEditSeason, closeSeasonEditor, handleSaveSeason,} = useSeasonEditor(
    {selectedSeason, setSelectedSeason, setAllSeasons, setScreen,});
  
  


  // Add-team form state (main page)
  const [newTeam, setNewTeam] = useState<Team>({
    id: "",
    name: "",
    slug: "",
    captain_name: "",
    co_captain_name: "",
    captain_email: "",
    co_captain_email: "",
    editing_status: "draft"
  });

  const refreshTeams = async () => {
    if (!selectedSeason) {return;}
    const latest = await  apiT.GetSeasonTeams(selectedSeason.id);
    setTeams(latest);
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    await apiT.UpdateTeam(updatedTeam);
    refreshTeams();
  };

  const handleDeleteTeam = async (team: Team) => {
    await apiT.DeleteTeam(team);
    refreshTeams();
  };

  const handleAddNewTeam = async () => {
    if (!newTeam.name.trim()) {
      alert("Team name are required.");
      return;
    }
    if (!selectedSeason) {return;}
    await apiT.CreateTeam(newTeam, selectedSeason.id);
    refreshTeams();

    // reset form
    setNewTeam({
      id: "",
      name: "",
      slug: "",
      captain_name: "",
      co_captain_name: "",
      captain_email: "",
      co_captain_email: "",
      editing_status: "draft"
    });
  };

  const handlePublish = async () => {
    try {
      await apiP.Publish();
      alert("Teams published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish teams");
    }
  };

  useEffect(() => {
    const load = async () => {
      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;

      if (!currentSeason) {
        console.error("No current season returned.");
        return;
      }

      setSelectedSeason(currentSeason);

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);
    };

    load().catch((err) => console.error("Error fetching seasons:", err));
  }, []);
  useEffect(() => {
    if (!selectedSeason) return;
    const loadSeasonData = async () => {
      const [teams] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
      ]);
      setTeams(teams);
    };

    loadSeasonData().catch((err) => console.error("Error fetching season data:", err));
  }, [selectedSeason?.id]);
  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={handlePublish}
        seasons={allSeasons}
        selectedSeason={selectedSeason}
        onSelect={(s) => setSelectedSeason(s)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      <main className={styles.main}>
        {/* Add team form on main page (admin only) */}
        {isAdmin && (
          <section className={styles.adminPanel}>
            <h2 className={styles.adminTitle}>Add Team</h2>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Team name *"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Captain name"
                value={newTeam.captain_name}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, captain_name: e.target.value }))
                }
              />
              <input
                className={styles.input}
                placeholder="Co-captain name"
                value={newTeam.co_captain_name}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, co_captain_name: e.target.value }))
                }
              />
            </div>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Captain email"
                value={newTeam.captain_email}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, captain_email: e.target.value }))
                }
              />
              <input
                className={styles.input}
                placeholder="Co-captain email"
                value={newTeam.co_captain_email}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, co_captain_email: e.target.value }))
                }
              />
            </div>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={handleAddNewTeam}
            >
              Add Team
            </button>
          </section>
        )}

        <TeamTable
          teams={teams}
          isAdmin={isAdmin}
          onTeamUpdate={handleUpdateTeam}
          onTeamDelete={handleDeleteTeam}
        />
      </main>

      <Footer />
    </div>
  );
}
