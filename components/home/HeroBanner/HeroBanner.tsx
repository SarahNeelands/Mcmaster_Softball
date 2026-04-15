/**
 * HeroBanner.tsx
 * ---------------
 * Hero section highlighting the league title and welcome message with rich
 * maroon styling for immediate brand recognition.
 */

import React from "react";
import styles from "./HeroBanner.module.css";

const HeroBanner: React.FC = () => {
  return (
    <section className={styles.hero} id="home">
      <div className={styles.content}>
        <h1 className={styles.title}>McMaster GSA Softball League</h1>
        <p className={styles.subtitle}>Welcome to the league!</p>
      </div>
    </section>
  );
};

export default HeroBanner;
