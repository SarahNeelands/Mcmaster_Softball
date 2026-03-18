/**
 * Rules page: dedicated handbook view backed by the current rules API.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import RulesSection from "@/components/Rules/RulesSection";
import type { Rule } from "@/types/rule_mod";
import type { Season } from "@/types/season_mod";
import styles from "./page.module.css";
import * as apiP from "@/lib/api/publish_api";
import * as apiR from "@/lib/api/rule_api";
import * as apiS from "@/lib/api/season_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";

export default function RulesPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [, setScreen] = useState<"home" | "seasonEditor">("home");

  const { openCreateSeason, openEditSeason } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
    setScreen,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleRules = useMemo(
    () => filterVisibleByEditingStatus(rules, canManageContent),
    [rules, canManageContent]
  );

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const loadRules = async () => {
    const latest = await apiR.GetRules();
    setRules(latest);
  };

  const handleCreateRule = async (rule: Rule): Promise<Rule> => {
    const created = await apiR.CreateRule(rule);
    await loadRules();
    return created;
  };

  const handleUpdateRule = async (rule: Rule): Promise<Rule> => {
    const updated = await apiR.UpdateRule(rule);
    await loadRules();
    return updated;
  };

  const handleDeleteRule = async (rule: Rule): Promise<void> => {
    await apiR.DeleteRule(rule);
    await loadRules();
  };

  const handleUploadRuleImage = async (file: File): Promise<{ src: string; alt: string }> => {
    return apiR.UploadRuleImage(file);
  };

  const publishHandler = async () => {
    try {
      await apiP.Publish();
      await loadRules();
      alert("Rules published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish rules");
    }
  };

  useEffect(() => {
    const load = async () => {
      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;

      if (currentSeason) {
        setSelectedSeason(currentSeason);
      }

      const all = await apiS.GetSeasons("", "all");
      setAllSeasons(Array.isArray(all) ? all : [all]);

      await loadRules();
    };

    load().catch((err) => {
      console.error("Error fetching rules:", err);
    });
  }, []);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={publishHandler}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(season) => setSelectedSeason(season)}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="rules-title">
          <p className={styles.eyebrow}>League Handbook</p>
          <h1 id="rules-title" className={styles.title}>
            Rules &amp; Policies
          </h1>
          <p className={styles.subtitle}>
            Everything captains and players need for the current season, including eligibility,
            gameplay, and sportsmanship in one place.
          </p>
          <div className={styles.meta}>
            <span className={styles.badge}>{selectedSeason?.name ?? "Current Season"}</span>
            <span className={styles.badge}>Updated weekly</span>
          </div>
        </section>
        <RulesSection
          rules={visibleRules}
          isAdmin={canManageContent}
          onCreateRule={handleCreateRule}
          onUpdateRule={handleUpdateRule}
          onDeleteRule={handleDeleteRule}
          onUploadImage={handleUploadRuleImage}
        />
      </main>
      <Footer />
    </div>
  );
}
