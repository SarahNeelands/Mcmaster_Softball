/**
 * Logo.tsx
 * ---------
 * Simple branded logo component used within the header navigation.
 * Responsible for rendering the league wordmark in a consistent style.
 */

import React from "react";
import styles from "./Logo.module.css";

const Logo: React.FC = () => {
  return (
    <div className={styles.logo}>
      <span className={styles.acronym}>SL</span>
      <span className={styles.text}>Mac/GSA Summer Softball League</span>
    </div>
  );
};

export default Logo;
