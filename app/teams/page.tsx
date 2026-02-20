/**
 * Teams listing page: renders the teams table with roster/record data fetched via `fetchAllTeams`.
 * Interactions: admin toggle, add team (admin), update team (admin), delete team (admin), publish (admin).
 */
"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import TeamTable from "@/components/teams/TeamTable";
import type { Team } from "@/types/teams";
import styles from "./page.module.css";

import { fetchAllTeams } from "@/lib/api/public/p_teams";
import { updateTeam, addNewTeam, deleteTeam } from "@/lib/api/admin/a_teams";
import { publish } from "@/lib/api/admin/publish";

type NewTeamForm = {
  name: string;
  slug: string;
  captainName: string;
  coCaptainName: string;
  captainEmail: string;
  coCaptainEmail: string;
};

export default function TeamsPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);

  // Add-team form state (main page)
  const [newTeam, setNewTeam] = useState<NewTeamForm>({
    name: "",
    slug: "",
    captainName: "",
    coCaptainName: "",
    captainEmail: "",
    coCaptainEmail: "",
  });

  const refreshTeams = async () => {
    const latest = await fetchAllTeams();
    setTeams(latest);
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    const savedTeam = await updateTeam(updatedTeam);
    setTeams((prev) =>
      prev.map((team) => (team.id === savedTeam.id ? savedTeam : team))
    );
  };

  const handleDeleteTeam = async (id: string) => {
    await deleteTeam(id);
    setTeams((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddNewTeam = async () => {
    if (!newTeam.name.trim() || !newTeam.slug.trim()) {
      alert("Team name and slug are required.");
      return;
    }

    // If your backend generates id, it should return the created Team.
    // We cast here because we don't know your exact Team shape.
    const created = await addNewTeam(newTeam as unknown as Team);

    setTeams((prev) => prev.concat(created));

    // reset form
    setNewTeam({
      name: "",
      slug: "",
      captainName: "",
      coCaptainName: "",
      captainEmail: "",
      coCaptainEmail: "",
    });
  };

  const publishHandler = async () => {
    try {
      await publish();
      await refreshTeams();
      alert("Teams published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish teams");
    }
  };

  useEffect(() => {
    refreshTeams().catch(console.error);
  }, []);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={publishHandler}
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
              <input
                className={styles.input}
                placeholder="Slug (e.g. red-dragons) *"
                value={newTeam.slug}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, slug: e.target.value }))
                }
              />
            </div>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Captain name"
                value={newTeam.captainName}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, captainName: e.target.value }))
                }
              />
              <input
                className={styles.input}
                placeholder="Co-captain name"
                value={newTeam.coCaptainName}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, coCaptainName: e.target.value }))
                }
              />
            </div>

            <div className={styles.formRow}>
              <input
                className={styles.input}
                placeholder="Captain email"
                value={newTeam.captainEmail}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, captainEmail: e.target.value }))
                }
              />
              <input
                className={styles.input}
                placeholder="Co-captain email"
                value={newTeam.coCaptainEmail}
                onChange={(e) =>
                  setNewTeam((p) => ({ ...p, coCaptainEmail: e.target.value }))
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
