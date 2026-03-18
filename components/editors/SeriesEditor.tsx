"use client";

import { useEffect, useMemo, useState } from "react";
import type { Series } from "@/types/series_mod";
import "./SeriesEditor.css";

type SeriesPayload = Omit<Series, "id" | "divisions_ids">;

type Props = {
  initialSeries?: Series;
  onCancel: () => void;
  onSave: (payload: SeriesPayload, id?: string) => Promise<void>;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function toDateInputValue(v?: string) {
  if (!v) return "";
  return v.includes("T") ? v.slice(0, 10) : v;
}

export default function SeriesEditor({ initialSeries, onCancel, onSave }: Props) {
  const isEdit = Boolean(initialSeries?.id);

  const today = useMemo(() => isoDate(new Date()), []);
  const defaultEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return isoDate(d);
  }, []);

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [advanceAmount, setAdvanceAmount] = useState(1);
  const [demoteAmount, setDemoteAmount] = useState(1);
  const [editingStatus, setEditingStatus] = useState<Series["editing_status"]>("draft");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(initialSeries?.name ?? "");
    setStartDate(toDateInputValue(initialSeries?.start_date) || today);
    setEndDate(toDateInputValue(initialSeries?.end_date) || defaultEnd);
    setAdvanceAmount(initialSeries?.advance_amount ?? 1);
    setDemoteAmount(initialSeries?.demote_amount ?? 1);
    setEditingStatus(initialSeries?.editing_status ?? "draft");
    setError(null);
  }, [defaultEnd, initialSeries, today]);

  const validate = () => {
    if (!name.trim()) return "Series name is required.";
    if (!startDate) return "Start date is required.";
    if (!endDate) return "End date is required.";
    if (endDate < startDate) return "End date must be on or after start date.";
    if (advanceAmount < 0) return "Advance amount must be 0 or greater.";
    if (demoteAmount < 0) return "Demote amount must be 0 or greater.";
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
          advance_amount: advanceAmount,
          demote_amount: demoteAmount,
          editing_status: editingStatus,
        },
        initialSeries?.id
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save series.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="seriesEditor">
      <div className="seriesEditorCard">
        <div className="seriesEditorHeader">
          <h2 className="seriesEditorTitle">{isEdit ? "Edit Series" : "Create Series"}</h2>
        </div>

        <div className="seriesEditorBody">
          <label className="seriesEditorLabel">
            Name
            <input
              className="seriesEditorInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Series 1"
            />
          </label>

          <div className="seriesEditorRow">
            <label className="seriesEditorLabel">
              Start date
              <input
                className="seriesEditorInput"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="seriesEditorLabel">
              End date
              <input
                className="seriesEditorInput"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>

          <div className="seriesEditorRow">
            <label className="seriesEditorLabel">
              Advance amount
              <input
                className="seriesEditorInput"
                type="number"
                min={0}
                value={advanceAmount}
                onChange={(e) => setAdvanceAmount(Number(e.target.value))}
              />
            </label>

            <label className="seriesEditorLabel">
              Demote amount
              <input
                className="seriesEditorInput"
                type="number"
                min={0}
                value={demoteAmount}
                onChange={(e) => setDemoteAmount(Number(e.target.value))}
              />
            </label>
          </div>

          <label className="seriesEditorLabel">
            Status
            <select
              className="seriesEditorSelect"
              value={editingStatus}
              onChange={(e) => setEditingStatus(e.target.value as Series["editing_status"])}
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
              <option value="deleted">deleted</option>
            </select>
          </label>

          {error && <div className="seriesEditorError">{error}</div>}
        </div>

        <div className="seriesEditorActions">
          <button type="button" className="seriesEditorBtnSecondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="seriesEditorBtnPrimary" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Save" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
