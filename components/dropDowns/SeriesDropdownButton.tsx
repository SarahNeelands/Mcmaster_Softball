"use client";

import { useEffect, useRef, useState } from "react";
import type { Series } from "@/types/series_mod";
import "./SeasonDropdownButton.css";

type Props = {
  series: Series[];
  selectedSeries?: Series;
  onSelect: (series: Series) => void;
  onOpenCreateSeries?: () => void;
  onOpenEditSeries?: () => void;
  isAdmin?: boolean;
};

export default function SeriesDropdownButton({
  series,
  selectedSeries,
  onSelect,
  onOpenCreateSeries,
  onOpenEditSeries,
  isAdmin = false,
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

  const safeSeries = (series ?? []).filter(
    (s) => typeof s?.name === "string" && s.name.trim().length > 0
  );

  const label = selectedSeries?.name?.trim()
    ? `Series: ${selectedSeries.name}`
    : "Series: Select";

  return (
    <div ref={wrapperRef} className="seasonDropdown seasonDropdownWide">
      <div className="seasonDropdownTriggerRow">
        <button
          type="button"
          className="seasonDropdownButton"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <span className="seasonDropdownLabel">{label}</span>
          <span className="seasonDropdownCaret" aria-hidden="true">v</span>
        </button>
        {isAdmin && selectedSeries && onOpenEditSeries && (
          <button
            type="button"
            className="seasonDropdownEditButton"
            onClick={onOpenEditSeries}
          >
            Edit
          </button>
        )}
      </div>

      {open && (
        <div className="seasonDropdownMenu seasonDropdownMenuClamp" role="menu">
          {isAdmin && onOpenCreateSeries && (
            <>
              <button
                type="button"
                role="menuitem"
                className="seasonDropdownCreate"
                onClick={() => {
                  setOpen(false);
                  onOpenCreateSeries();
                }}
              >
                + Create new series
              </button>
              <div className="seasonDropdownDivider" />
            </>
          )}

          {isAdmin && selectedSeries && onOpenEditSeries && (
            <>
              <button
                type="button"
                role="menuitem"
                className="seasonDropdownCreate"
                onClick={() => {
                  setOpen(false);
                  onOpenEditSeries();
                }}
              >
                Edit selected series
              </button>
              <div className="seasonDropdownDivider" />
            </>
          )}

          {safeSeries.length === 0 ? (
            <div className="seasonDropdownEmpty">No series yet</div>
          ) : (
            safeSeries.map((item) => {
              const isSelected = selectedSeries?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className={`seasonDropdownItem ${isSelected ? "isSelected" : ""}`}
                  onClick={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  {item.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
