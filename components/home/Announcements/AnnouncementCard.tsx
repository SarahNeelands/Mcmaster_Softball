/**
 * AnnouncementCard.tsx
 * ---------------------
 * Presentational component for an announcement preview card, including date,
 * title, summary, and optional admin edit control.
 */

import React from "react";
import styles from "./AnnouncementCard.module.css";
import { Announcement } from "@/backend/models/announcement_mod";

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
  const dateObject = new Date(announcement.date);
  const formattedDate = Number.isNaN(dateObject.getTime())
    ? announcement.date
    : dateObject.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      });

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
      <p className={styles.body}>{announcement.content}</p>
    </article>
  );
};

export default AnnouncementCard;
