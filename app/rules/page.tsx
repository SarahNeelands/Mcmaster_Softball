/**
 * Rules page: dedicated handbook view that moves rules off the home page.
 * Data uses mock rules for now with client-side editing hooks for admins.
 */
"use client";

import { useEffect,useState } from "react";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import RulesSection from "@/components/Rules/RulesSection";

import type { Rule, RuleImage } from "@/types/rules";
import styles from "./page.module.css";

import { publish } from "@/lib/api/admin/publish";

import {
  fetchAllRules,
} from "@/lib/api/public/p_rules";
import {
  addNewRule,
  deleteRule,
  editRule,
} from "@/lib/api/admin/a_rules"
export default function RulesPage() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [rules, setRules] = useState<Rule[]>([]);

  const handleAddRule = async (
    title: string,
    description: string,
    images: RuleImage[]
  ) => {
    const created = await addNewRule(title, description, images);
    setRules((prev) => [...prev, created]);
    return created;
  };

  const publishHandler = async () => {
    try {
      await publish();
      const lastest =await fetchAllRules();
      setRules(lastest);
      alert("Rules published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish rules");
    }
  };




  useEffect(() => {
    fetchAllRules().then((fetchedRules) => {setRules(fetchedRules);})
  
      .catch((err) => {
        console.error("Error fetching announcements:", err);
      });
    }, []);

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        onToggleAdmin={() => setIsAdmin((prev) => !prev)}
        onPublish={publishHandler}
      />
      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="rules-title">
          <p className={styles.eyebrow}>League Handbook</p>
          <h1 id="rules-title" className={styles.title}>
            Rules &amp; Policies
          </h1>
          <p className={styles.subtitle}>
            Everything captains and players need for the 2025 season&mdash;eligibility, gameplay, and
            sportsmanship in one place. Admins can edit and attach references before publishing.
          </p>
          <div className={styles.meta}>
            <span className={styles.badge}>2025 Season</span>
            <span className={styles.badge}>Updated weekly</span>
          </div>
        </section>
        <RulesSection rules={rules} isAdmin={isAdmin} onRulesChange={setRules} />
      </main>
      <Footer />
    </div>
  );
}
