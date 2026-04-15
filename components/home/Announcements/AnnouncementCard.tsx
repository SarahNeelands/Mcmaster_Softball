/**
 * AnnouncementCard.tsx
 * ---------------------
 * Presentational component for an announcement preview card, including date,
 * title, summary, and optional admin edit control.
 */

import React from "react";
import styles from "./AnnouncementCard.module.css";
import { Announcement } from "@/types/announcement_mod";
import MarkdownContent from "@/components/common/MarkdownContent/MarkdownContent";

interface AnnouncementCardProps {
  announcement: Announcement;
  isAdmin: boolean;
  onEdit: (announcement: Announcement) => void;
}

const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  isAdmin,
  onEdit,
}) => {
  const formattedDate = (() => {
    const dateMatch = announcement.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const safeDate = new Date(Number(year), Number(month) - 1, Number(day));

      return safeDate.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });
    }

    const dateObject = new Date(announcement.date);

    return Number.isNaN(dateObject.getTime())
      ? announcement.date
      : dateObject.toLocaleDateString(undefined, {
          month: "long",
          day: "numeric",
        });
  })();

  return (
    <article className={styles.card}>
      <div className={styles.dateCell}>
        <span className={styles.date}>{formattedDate}</span>
      </div>
      <div className={styles.titleCell}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>{announcement.title}</h3>
          {isAdmin && (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => onEdit(announcement)}
            >
              Edit
            </button>
          )}
        </div>
      </div>
      <MarkdownContent className={styles.body} content={announcement.content} />
    </article>
  );
};

export default AnnouncementCard;
