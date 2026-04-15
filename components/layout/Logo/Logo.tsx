/**
 * Logo.tsx
 * ---------
 * Simple branded logo component used within the header navigation.
 * Responsible for rendering the league wordmark in a consistent style.
 */

import React from "react";
import Image from "next/image";
import styles from "./Logo.module.css";

const Logo: React.FC = () => {
  return (
    <div className={styles.logo}>
      <Image
        src="/msl-logo.png"
        alt="McMaster GSA Softball League logo"
        width={44}
        height={44}
        className={styles.mark}
        priority
      />
      <span className={styles.text}>McMaster GSA Softball League</span>
    </div>
  );
};

export default Logo;
