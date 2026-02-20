/**
 * NavBar.tsx
 * -----------
 * Primary navigation component listing major sections of the league site.
 * Provides semantic navigation links for accessibility.
 */

import React from "react";
import styles from "./NavBar.module.css";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Teams", href: "/teams" },
  { label: "Schedule", href: "/schedule" },
  { label: "Standings", href: "/standings" },
  { label: "Playoffs", href: "#playoffs" },
  { label: "Rules", href: "/rules" },
  { label: "Contact Us", href: "#contact" },
];

const NavBar: React.FC = () => {
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.label} className={styles.navItem}>
            <a href={item.href}>{item.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;
