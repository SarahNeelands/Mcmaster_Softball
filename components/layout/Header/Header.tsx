import React from "react";
import Logo from "../Logo/Logo";
import NavBar from "../NavBar/NavBar";
import styles from "./Header.module.css";
import SeasonDropdownButton from "../../dropDowns/SeasonDropdownButton";
import { Season } from "@/types/season_mod";

interface HeaderProps {
  isAdmin: boolean;
  onPublish: () => void;
  onToggleAdmin: () => void;
  seasons: Season[];
  selectedSeason?: Season;
  onSelect: (season: Season) => void;
  onOpenCreateSeason: () => void;
  onOpenEditSeason: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  onPublish,
  onToggleAdmin,
  seasons,
  selectedSeason,
  onSelect,
  onOpenCreateSeason,
  onOpenEditSeason,
}) => {
  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <Logo />
        <NavBar />
      </div>

      <div className={styles.actions}>
        {isAdmin && (
          <>
            <SeasonDropdownButton
              seasons={seasons}
              selectedSeason={selectedSeason}
              onSelect={onSelect}
              onOpenCreateSeason={onOpenCreateSeason}
            />
            {isAdmin && selectedSeason && (
              <button type="button" onClick={onOpenEditSeason}>
                Edit
              </button>
            )}

            <button
              type="button"
              className={styles.publishButton}
              onClick={onPublish}
            >
              Publish
            </button>

          </>
        )}
        <button
          type="button"
          className={styles.toggleButton}
          onClick={onToggleAdmin}
        >
          {isAdmin ? "Log out" : "Log in"}
        </button>
      </div>
    </header>
  );
};

export default Header;