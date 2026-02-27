/**
 * AnnouncementsSection.tsx
 * ------------------------
 * High-level container for the Announcements column on the home page.
 * Responsible for rendering section controls, managing edit/create state, and
 * mapping announcement data into AnnouncementCard components.
 */



import React, { useMemo, useState } from "react";
import AnnouncementCard from "./AnnouncementCard";
import Card from "../../common/Card/Card";
import styles from "./AnnouncementsSection.module.css";
import { Announcement } from "@/backend/models/announcement_mod";
import { Season } from "@/backend/models/season_mod";
const DEFAULT_ANNOUNCEMENT_VISIBLE_COUNT = 4;

interface AnnouncementsSectionProps {
  activeAnnouncements: Announcement[];
  archivedAnnouncements: Announcement[];
  currentSeason: Season,
  isAdmin: boolean;
  onAnnouncementChange:(announcement: Announcement, change: string) => Promise<void>
}

const emptyDraft: Announcement = {
  id: "",
  title: "",
  content: "",
  date: "", // ISO string
  archived: false,
  season_id: "",
  editing_status: "draft",
};

const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  activeAnnouncements,
  archivedAnnouncements,
  isAdmin,
  onAnnouncementChange,
  currentSeason
}) => {

  const [draft, setDraft] = useState<Announcement | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [showAllActive, setShowAllActive] = useState<boolean>(false);

  const visibleActiveAnnouncements = showAllActive
  ? activeAnnouncements
  : activeAnnouncements.slice(0, DEFAULT_ANNOUNCEMENT_VISIBLE_COUNT);

  const finalAnnouncements = showAllActive && isAdmin
  ? [...visibleActiveAnnouncements, ...archivedAnnouncements]
  : visibleActiveAnnouncements;

  const closeEditor = () => {
    setDraft(null);
    setIsCreating(false);
  };

  const handleDraftChange = (field: keyof Announcement, value: string | boolean) => {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleSave = async() => {
    if (!draft) return;
    if (!draft.date || !draft.title || !draft.content) {
      alert("Please complete all fields before saving.");
      return;
    }
    if (isCreating) {
      draft.season_id = currentSeason.id
      onAnnouncementChange(draft, "add");
    }else {
      onAnnouncementChange(draft, "edit");
    }
    closeEditor();
  };

  const openEditorFor = (announcement: Announcement) => {
    setDraft({ ...announcement });
    setIsCreating(false);
  };

  const openCreate = () => {
    setDraft({ ...emptyDraft });
    setIsCreating(true);
  };

  return (
    <section className={styles.section} aria-labelledby="announcements-heading">
      <div className={styles.sectionHeader}>
        <h2 id="announcements-heading">Announcements</h2>
        {isAdmin && (
          <button type="button" className={styles.actionButton} onClick={openCreate}>
            New Announcement
          </button>
        )}
      </div>
      <div className={styles.listContainer}>
        <div className={styles.list}>
          {finalAnnouncements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isAdmin={isAdmin}
              onEdit={openEditorFor}
            />
          ))}
        </div>
      </div>
      <div className={styles.ctaRow}>
        <button type="button" className={styles.secondaryButton} onClick ={() => setShowAllActive((prev) => !prev)}>
           {showAllActive ? "Show less" : "View All Announcements"}
        </button>

      </div>

      {draft && (
        <div className={styles.editorOverlay} role="dialog" aria-modal="true">
          <Card className={styles.editorCard}>
            <div className={styles.editorHeader}>
              <h3>{isCreating ? "Create Announcement" : "Edit Announcement"}</h3>
              <button type="button" className={styles.closeButton} onClick={closeEditor}>
                Close
              </button>
            </div>
            <div className={styles.editorBody}>
              <label className={styles.field}>
                <span>Date</span>
                <input
                  type="date"
                  value={draft.date}
                  onChange={(event) => handleDraftChange("date", event.target.value)}
                  placeholder={new Date().toISOString().split('T')[0]}
                />
              </label>

              <label className={styles.field}>
                <span>Title</span>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(event) => handleDraftChange("title", event.target.value)}
                  placeholder="Announcement Title"
                />
              </label>

              <label className={styles.field}>
                <span>Body</span>
                <textarea
                  value={draft.content}
                  onChange={(event) => handleDraftChange("content", event.target.value)}
                  placeholder="Share announcement details..."
                />
              </label>
              {!isCreating && (
              <label>
                <input
                  type="checkbox"
                  checked={draft.archived}
                  onChange={(event) =>
                    handleDraftChange("archived", event.target.checked)
                  }
                />
                Archived
              </label>)}
            </div>
            <div className={styles.editorFooter}>
              <button type="button" className={styles.secondaryButton} onClick={closeEditor}>
                Cancel
              </button>
              <button type="button" className={styles.actionButton} onClick={handleSave}>
                {isCreating ? "Add" : "Save"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

export default AnnouncementsSection;
