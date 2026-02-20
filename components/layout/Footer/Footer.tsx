/**
 * Footer.tsx
 * -----------
 * Site footer component presenting contact information for league leadership.
 * Provides semantic footer structure and accessible contact links.
 */

import React from "react";
import styles from "./Footer.module.css";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} id="contact">
      <div className={styles.content}>
        <h3 className={styles.heading}>Contact Us</h3>
        <div className={styles.contacts}>
          <div>
            <p className={styles.role}>Director</p>
            <a href="mailto:director@softballleague.edu" className={styles.link}>
              Jamie Collins - director@softballleague.edu
            </a>
          </div>
          <div>
            <p className={styles.role}>Co-ordinator</p>
            <a href="mailto:coordinator@softballleague.edu" className={styles.link}>
              Morgan Patel - coordinator@softballleague.edu
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
