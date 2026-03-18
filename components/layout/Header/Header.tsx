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
  onToggleAdmin: () => void;
  onTogglePreview?: () => void;
  seasons: Season[];
  selectedSeason?: Season;
  onSelect: (season: Season) => void;
  onOpenCreateSeason: () => void;
  onOpenEditSeason: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isAdmin,
  isPreviewing = false,
  onPublish,
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
            {!isPreviewing && (
              <>
                <SeasonDropdownButton
                  seasons={seasons}
                  selectedSeason={selectedSeason}
                  onSelect={onSelect}
                  onOpenCreateSeason={onOpenCreateSeason}
                />
                {selectedSeason && (
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

            {onTogglePreview && (
              <button
                type="button"
                className={styles.previewButton}
                onClick={onTogglePreview}
              >
                {isPreviewing ? "Exit Preview" : "Preview"}
              </button>
            )}

          </>
        )}
        {isAdmin && (
          <button
            type="button"
            className={styles.toggleButton}
            onClick={onToggleAdmin}
          >
            Log out
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
