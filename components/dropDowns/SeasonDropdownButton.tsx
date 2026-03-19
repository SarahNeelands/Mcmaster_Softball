"use client";

import { useEffect, useRef, useState } from "react";
import type { Season } from "@/types/season_mod";
import "./SeasonDropdownButton.css";

type Props = {
  seasons: Season[];
  selectedSeason?: Season;
  onSelect: (season: Season) => void;
  onOpenCreateSeason: () => void;
  onOpenEditSeason?: (season: Season) => void;
};

export default function SeasonDropdownButton({
  seasons,
  selectedSeason,
  onSelect,
  onOpenCreateSeason,
  onOpenEditSeason,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const safeSeasons = (seasons ?? []).filter(
    (s) => typeof s?.name === "string" && s.name.trim().length > 0
  );

  const label = selectedSeason?.name?.trim()
    ? `Season: ${selectedSeason.name}`
    : "Season: Select";

  return (
    <div ref={wrapperRef} className="seasonDropdown">
      <button
        type="button"
        className="seasonDropdownButton"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="seasonDropdownLabel">{label}</span>
        <span className="seasonDropdownCaret" aria-hidden="true">▼</span>
      </button>

      {open && (
        <div className="seasonDropdownMenu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="seasonDropdownCreate"
            onClick={() => {
              setOpen(false);
              onOpenCreateSeason();
            }}
          >
            + Create new season
          </button>

          <div className="seasonDropdownDivider" />

          {safeSeasons.length === 0 ? (
            <div className="seasonDropdownEmpty">No seasons yet</div>
          ) : (
            safeSeasons.map((season) => {
              const isSelected = selectedSeason?.id === season.id;
              return (
                <div
                  key={season.id}
                  className={`seasonDropdownRow ${isSelected ? "isSelected" : ""}`}
                >
                  <button
                    type="button"
                    role="menuitem"
                    className={`seasonDropdownItem ${isSelected ? "isSelected" : ""}`}
                    onClick={() => {
                      onSelect(season);
                      setOpen(false);
                    }}
                  >
                    {season.name}
                  </button>
                  {onOpenEditSeason && isSelected && (
                    <button
                      type="button"
                      className="seasonDropdownInlineEdit"
                      onClick={() => {
                        onOpenEditSeason(season);
                        setOpen(false);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
