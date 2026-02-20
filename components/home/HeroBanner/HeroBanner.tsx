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
      <h1 className={styles.title}>University Softball League</h1>
      <p className={styles.subtitle}>Welcome to the league!</p>
    </section>
  );
};

export default HeroBanner;
