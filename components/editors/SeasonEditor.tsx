"use client";

import { useEffect, useMemo, useState } from "react";
import type { Season } from "@/types/season_mod";
import "./SeasonEditor.css";

type SeasonPayload = Omit<Season, "id" | "series_ids">;

type Props = {
  initialSeason?: Season; // if present => edit, else => create
  onCancel: () => void;
  onSave: (payload: SeasonPayload, id?: string) => Promise<void>;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function SeasonEditor({ initialSeason, onCancel, onSave }: Props) {
  const isEdit = Boolean(initialSeason?.id);

  const today = useMemo(() => isoDate(new Date()), []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return isoDate(d);
  }, []);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [editingStatus, setEditingStatus] = useState<Season["editing_status"]>("draft");

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Sync fields when a different season is passed in (or editor opens for create)
    useEffect(() => {
    setName(initialSeason?.name ?? "");
    setStartDate(toDateInputValue(initialSeason?.start_date) || today);
    setEndDate(toDateInputValue(initialSeason?.end_date) || defaultEnd);
    setEditingStatus(initialSeason?.editing_status ?? "draft");
    setError(null);
    }, [initialSeason, today, defaultEnd]);

  const validate = () => {
    if (!name.trim()) return "Season name is required.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (endDate < startDate) return "End date must be on or after start date.";
    return null;
  };

  const handleSubmit = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setError(null);
    setSaving(true);

    try {
      await onSave(
        {
          name: name.trim(),
          start_date: startDate,
          end_date: endDate,
          editing_status: editingStatus,
        },
        initialSeason?.id
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save season.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seasonEditor">
      <div className="seasonEditorCard">
        <div className="seasonEditorHeader">
          <h2 className="seasonEditorTitle">{isEdit ? "Edit Season" : "Create Season"}</h2>
        </div>

        <div className="seasonEditorBody">
          <label className="seasonEditorLabel">
            Name
            <input
              className="seasonEditorInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="2026"
            />
          </label>

          <div className="seasonEditorRow">
            <label className="seasonEditorLabel">
              Start date
              <input
                className="seasonEditorInput"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="seasonEditorLabel">
              End date
              <input
                className="seasonEditorInput"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <label className="seasonEditorLabel">
            Status
            <select
              className="seasonEditorSelect"
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value as Season["editing_status"])}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="archived">archived</option>
              <option value="deleted">deleted</option>
            </select>
          </label>

          {error && <div className="seasonEditorError">{error}</div>}
        </div>

        <div className="seasonEditorActions">
          <button type="button" className="seasonEditorBtnSecondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="seasonEditorBtnPrimary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

function toDateInputValue(v?: string) {
  if (!v) return "";
  return v.includes("T") ? v.slice(0, 10) : v;
}