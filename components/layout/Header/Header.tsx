/**
 * Header.tsx
 * -----------
 * Top-level header component containing the logo, primary navigation, and
 * contextual admin actions (publish button and admin toggle for demo).
 */

import React from "react";
import Logo from "../Logo/Logo";
import NavBar from "../NavBar/NavBar";
import styles from "./Header.module.css";

interface HeaderProps {
  isAdmin: boolean;
  onPublish: () => void;
  onToggleAdmin: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAdmin, onPublish, onToggleAdmin }) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <Logo />
        <NavBar />
      </div>
      <div className={styles.actions}>
        {isAdmin && (
          <button type="button" className={styles.publishButton} onClick={onPublish}>
            Publish
          </button>
        )}
        <button type="button" className={styles.toggleButton} onClick={onToggleAdmin}>
          {isAdmin ? "Log out" : "Log in"}
        </button>
      </div>
    </header>
  );
};

export default Header;
