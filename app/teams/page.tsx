/**
 * Teams listing page: renders the teams table with roster data fetched via the current API.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SeriesEditor from "@/components/editors/SeriesEditor";
import TeamTable from "@/components/teams/TeamTable";
import SeriesDropdownButton from "@/components/dropDowns/SeriesDropdownButton";
import type { Team } from "@/types/team_mod";
import type { Season } from "@/types/season_mod";
import type { Series } from "@/types/series_mod";
import styles from "./page.module.css";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiAdmin from "@/lib/api/admin_api";
import * as apiT from "@/lib/api/team_api";
import * as apiSeries from "@/lib/api/series_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";

export default function TeamsPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series>();
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [editingSeries, setEditingSeries] = useState<Series>();
  const [creatingSeries, setCreatingSeries] = useState(false);

  const canManageContent = isAdmin && !isPreviewing;

  const visibleTeams = useMemo(
    () => filterVisibleByEditingStatus(teams, canManageContent),
    [teams, canManageContent]
  );

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const visibleSeries = useMemo(
    () => filterVisibleByEditingStatus(allSeries, canManageContent),
    [allSeries, canManageContent]
  );

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

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
    if (!selectedSeason) return;
    const latest = await apiT.GetSeasonTeams(selectedSeason.id);
    setTeams(latest);
  };

  const reloadSeries = async (season?: Season) => {
    if (!season) return;

    const [currentSeriesData, allSeriesData] = await Promise.all([
      apiSeries.GetSeries("", season.id, "current"),
      apiSeries.GetSeries("", season.id, "all"),
    ]);

    const currentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
    const seasonSeries = Array.isArray(allSeriesData) ? allSeriesData : [allSeriesData];
    const filteredSeries = seasonSeries.filter(Boolean);
    const nextSelectedSeries =
      filteredSeries.find((series) => series.id === selectedSeries?.id) ?? currentSeries;

    setSelectedSeries(nextSelectedSeries);
    setAllSeries(filteredSeries);
  };

  const handleUpdateTeam = async (updatedTeam: Team) => {
    await apiT.UpdateTeam(updatedTeam);
    await refreshTeams();
  };

  const handleDeleteTeam = async (team: Team) => {
    await apiT.DeleteTeam(team);
    await refreshTeams();
  };

  const handleAddNewTeam = async () => {
    if (!newTeam.name.trim()) {
      alert("Team name are required.");
      return;
    }
    if (!selectedSeason) return;

    await apiT.CreateTeam(newTeam, selectedSeason.id);
    await refreshTeams();

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
      await refreshTeams();
      alert("Teams published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish teams");
    }
  };

  useEffect(() => {
    const load = async () => {
      const session = await apiAdmin.GetAdminSession();
      setIsAdmin(session.isAdmin);

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

  const handleAdminToggle = async () => {
    if (isAdmin) {
      await apiAdmin.LogoutAdmin();
      setIsAdmin(false);
      setIsPreviewing(false);
      return;
    }

    window.location.href = "/msadmin";
  };

  useEffect(() => {
    if (canManageContent) return;

    const resetToPublicSeason = async () => {
      try {
        const currentData = await apiS.GetSeasons("", "current");
        const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;
        if (currentSeason) {
          setSelectedSeason(currentSeason);
        }
      } catch (err) {
        console.error("Error resetting teams season:", err);
      }
    };

    resetToPublicSeason();
  }, [canManageContent]);

  useEffect(() => {
    if (!selectedSeason) return;

    const loadSeasonData = async () => {
      const [teamsData, currentSeriesData, allSeriesData] = await Promise.all([
        apiT.GetSeasonTeams(selectedSeason.id),
        apiSeries.GetSeries("", selectedSeason.id, "current"),
        apiSeries.GetSeries("", selectedSeason.id, "all"),
      ]);

      setTeams(teamsData);
      const currentSeries = Array.isArray(currentSeriesData) ? currentSeriesData[0] : currentSeriesData;
      const seasonSeries = Array.isArray(allSeriesData) ? allSeriesData : [allSeriesData];
      setSelectedSeries(currentSeries);
      setAllSeries(seasonSeries.filter(Boolean));
    };

    loadSeasonData().catch((err) => console.error("Error fetching season data:", err));
  }, [selectedSeason]);

  const handleSaveSeries = async (
    payload: Omit<Series, "id" | "divisions_ids">,
    id?: string
  ) => {
    if (!id || !editingSeries || !selectedSeason) return;

    await apiSeries.UpdateSeries({
      ...editingSeries,
      ...payload,
      id,
    });

    setEditingSeries(undefined);
    await reloadSeries(selectedSeason);
  };

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={handleAdminToggle}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={handlePublish}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(s) => setSelectedSeason(s)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      {canManageContent && (creatingSeries || editingSeries) && (
        <SeriesEditor
          initialSeries={editingSeries}
          onCancel={() => {
            setEditingSeries(undefined);
            setCreatingSeries(false);
          }}
          onSave={async (payload, id) => {
            if (creatingSeries && selectedSeason) {
              await apiSeries.CreateSeries(
                {
                  id: "",
                  divisions_ids: [],
                  ...payload,
                },
                selectedSeason.id
              );
              setCreatingSeries(false);
              await reloadSeries(selectedSeason);
              return;
            }

            await handleSaveSeries(payload, id);
          }}
        />
      )}

      <main className={styles.main}>
        {canManageContent && (
          <div className={styles.seriesBar}>
            <SeriesDropdownButton
              series={visibleSeries}
              selectedSeries={selectedSeries}
              onSelect={(series) => setSelectedSeries(series)}
              onOpenCreateSeries={() => {
                setEditingSeries(undefined);
                setCreatingSeries(true);
              }}
              onOpenEditSeries={() => setEditingSeries(selectedSeries)}
              isAdmin={canManageContent}
            />
          </div>
        )}

        {canManageContent && (
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
          teams={visibleTeams}
          isAdmin={canManageContent}
          onTeamUpdate={handleUpdateTeam}
          onTeamDelete={handleDeleteTeam}
        />
      </main>

      <Footer />
    </div>
  );
}
