import React from "react";
import Logo from "../Logo/Logo";
import NavBar from "../NavBar/NavBar";
import styles from "./Header.module.css";
import SeasonDropdownButton from "../../dropDowns/SeasonDropdownButton";
import { Season } from "@/types/season_mod";

interface HeaderProps {
  isAdmin: boolean;
  isPreviewing?: boolean;
  onPublish: () => void;
  onRevert?: () => void;
  onToggleAdmin: () => void;
  onTogglePreview?: () => void;
  seasons: Season[];
  selectedSeason?: Season;
  onSelect: (season: Season) => void;
  onOpenCreateSeason: () => void;
  onOpenEditSeason: (season?: Season) => void;
}

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  isPreviewing = false,
  onPublish,
  onRevert,
  onToggleAdmin,
  onTogglePreview,
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
              onOpenEditSeason={onOpenEditSeason}
            />

            <div className={styles.controlColumns}>
              <div className={styles.controlColumn}>
                {!isPreviewing && (
                  <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={onToggleAdmin}
                  >
                    Log out
                  </button>
                )}
                {!isPreviewing && (
                  <button
                    type="button"
                    className={styles.publishButton}
                    onClick={onPublish}
                  >
                    Publish
                  </button>
                )}
              </div>

              <div className={styles.controlColumn}>
                {onTogglePreview && (
                  <button
                    type="button"
                    className={styles.previewButton}
                    onClick={onTogglePreview}
                  >
                    {isPreviewing ? "Exit Preview" : "Preview"}
                  </button>
                )}
                {!isPreviewing && onRevert && (
                  <button
                    type="button"
                    className={styles.undoButton}
                    onClick={onRevert}
                  >
                    Undo
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
