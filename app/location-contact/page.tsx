/**
 * Location & contact page for league logistics and directions.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import SeasonEditor from "@/components/editors/SeasonEditor";
import type { Season } from "@/types/season_mod";
import styles from "./page.module.css";
import * as apiP from "@/lib/api/publish_api";
import * as apiS from "@/lib/api/season_api";
import * as apiAdmin from "@/lib/api/admin_api";
import { useSeasonEditor } from "@/components/layout/Header/header_functions";
import { filterVisibleByEditingStatus } from "@/lib/data/editing_status";
import {
  resolveSelectedSeason,
  setStoredSelectedSeason,
} from "@/lib/seasons/selection";

export default function LocationContactPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season>();
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);
  const [captainContactsHref, setCaptainContactsHref] = useState<string | null>(null);
  const [captainContactsBusy, setCaptainContactsBusy] = useState(false);

  const {
    isSeasonEditorOpen,
    seasonToEdit,
    openCreateSeason,
    openEditSeason,
    closeSeasonEditor,
    handleSaveSeason,
  } = useSeasonEditor({
    selectedSeason,
    setSelectedSeason,
    setAllSeasons,
  });

  const canManageContent = isAdmin && !isPreviewing;

  const visibleSeasons = useMemo(
    () => filterVisibleByEditingStatus(allSeasons, canManageContent),
    [allSeasons, canManageContent]
  );

  const loadCaptainContacts = async () => {
    const res = await fetch("/api/captain-contacts", { cache: "no-store" });
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const body = await res.json();
    setCaptainContactsHref(body.available ? body.href : null);
  };

  const handlePublish = async () => {
    try {
      await apiP.Publish();
      alert("Changes published");
    } catch (err) {
      console.error(err);
      alert("Failed to publish changes");
    }
  };

  const handleRevert = async () => {
    try {
      await apiP.Revert();
      alert("Unpublished draft and deleted changes reverted.");
    } catch (err) {
      console.error(err);
      alert("Failed to revert unpublished changes");
    }
  };

  useEffect(() => {
    const load = async () => {
      const session = await apiAdmin.GetAdminSession();
      setIsAdmin(session.isAdmin);

      const currentData = await apiS.GetSeasons("", "current");
      const currentSeason = Array.isArray(currentData) ? currentData[0] : currentData;

      const all = await apiS.GetSeasons("", "all");
      const seasons = Array.isArray(all) ? all : [all];
      setAllSeasons(seasons);
      setSelectedSeason(
        resolveSelectedSeason({
          currentSeason: currentSeason ?? undefined,
          seasons,
          isAdmin: session.isAdmin,
        })
      );
      await loadCaptainContacts();
    };

    load().catch((err) => {
      console.error("Error fetching location/contact page data:", err);
    });
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

  return (
    <div className={styles.page}>
      <Header
        isAdmin={isAdmin}
        isPreviewing={isPreviewing}
        onToggleAdmin={handleAdminToggle}
        onTogglePreview={() => setIsPreviewing((prev) => !prev)}
        onPublish={handlePublish}
        onRevert={canManageContent ? handleRevert : undefined}
        seasons={visibleSeasons}
        selectedSeason={selectedSeason}
        onSelect={(season) => {
          setStoredSelectedSeason(season);
          setSelectedSeason(season);
        }}
        onOpenCreateSeason={openCreateSeason}
        onOpenEditSeason={openEditSeason}
      />

      <main className={styles.main}>
        <section className={styles.intro} aria-labelledby="location-contact-title">
          <p className={styles.eyebrow}>League Information</p>
          <h1 id="location-contact-title" className={styles.title}>
            Location &amp; Contact
          </h1>
          <p className={styles.subtitle}>
            McMaster GSA Softball League games take place by Lot P on campus. Use the map
            below for reference and reach out directly if you need help before game day.
          </p>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.infoStack}>
            <article className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <p className={styles.text}>McMaster GSA Softball League</p>
              <p className={styles.text}>
                Email:{" "}
                <a href="mailto:softballgsa@gmail.com" className={styles.link}>
                  softballgsa@gmail.com
                </a>
              </p>
              <p className={styles.text}>
                Instagram:{" "}
                <a
                  href="https://www.instagram.com/softballgsa/"
                  className={styles.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  @softballgsa
                </a>
              </p>
              <div className={styles.locationNote}>
                <h3 className={styles.noteTitle}>Game Location</h3>
                <p className={styles.noteText}>
                  All league games take place by Lot P at McMaster University.
                </p>
              </div>
            </article>

            <article className={styles.infoCard}>
              <h2 className={styles.sectionTitle}>Captain Contacts</h2>
              <p className={styles.text}>
                Download the current captain contact sheet for the league.
              </p>
              {captainContactsHref ? (
                <a
                  href={captainContactsHref}
                  download="captain-contacts.pdf"
                  className={styles.downloadButton}
                >
                  Captain Contacts
                </a>
              ) : (
                <p className={styles.noteText}>No captain contact PDF is available right now.</p>
              )}

              {canManageContent && (
                <div className={styles.adminFileTools}>
                  <label className={styles.uploadLabel}>
                    <span className={styles.uploadTitle}>Upload PDF</span>
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className={styles.fileInput}
                      disabled={captainContactsBusy}
                      onChange={async (event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;

                        const formData = new FormData();
                        formData.append("file", file);
                        setCaptainContactsBusy(true);

                        try {
                          const res = await fetch("/api/captain-contacts", {
                            method: "POST",
                            body: formData,
                          });

                          if (!res.ok) {
                            throw new Error(await res.text());
                          }

                          await loadCaptainContacts();
                          event.target.value = "";
                        } catch (err) {
                          alert(err instanceof Error ? err.message : "Failed to upload captain contacts PDF.");
                        } finally {
                          setCaptainContactsBusy(false);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    className={styles.removeButton}
                    disabled={captainContactsBusy || !captainContactsHref}
                    onClick={async () => {
                      setCaptainContactsBusy(true);
                      try {
                        const res = await fetch("/api/captain-contacts", {
                          method: "DELETE",
                        });

                        if (!res.ok) {
                          throw new Error(await res.text());
                        }

                        await loadCaptainContacts();
                      } catch (err) {
                        alert(err instanceof Error ? err.message : "Failed to remove captain contacts PDF.");
                      } finally {
                        setCaptainContactsBusy(false);
                      }
                    }}
                  >
                    {captainContactsBusy ? "Working..." : "Remove PDF"}
                  </button>
                </div>
              )}
            </article>
          </div>

          <article className={styles.mapCard}>
            <h2 className={styles.sectionTitle}>Campus Map</h2>
            <div className={styles.mapFrame}>
              <Image
                src="/Campus-Map-Lot-P.jpg"
                alt="Campus map showing the McMaster softball game location by Lot P."
                width={1600}
                height={1200}
                className={styles.mapImage}
                priority
              />
            </div>
          </article>
        </section>
      </main>
      {isSeasonEditorOpen && (
        <SeasonEditor
          initialSeason={seasonToEdit}
          onCancel={closeSeasonEditor}
          onSave={handleSaveSeason}
        />
      )}

      <Footer />
    </div>
  );
}
