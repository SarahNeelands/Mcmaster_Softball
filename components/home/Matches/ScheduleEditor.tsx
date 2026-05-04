"use client";

import React, { useMemo, useRef, useState } from "react";
import styles from "./ScheduleEditor.module.css";

export type ScheduleGame = {
  home_team_id: string;
  away_team_id: string;
  division_id: string;
  field: string;
};

export type ScheduleTimeBlock = {
  time: string;
  games: ScheduleGame[];
};

export type ScheduleDay = {
  date: string;
  timeBlocks: ScheduleTimeBlock[];
};

export type ScheduleTeamOption = {
  id: string;
  name: string;
  slug: string;
  division_id: string;
  division_name: string;
};

type DivisionOption = {
  id: string;
  name: string;
};

function isUnassignedTeam(team?: ScheduleTeamOption, emptySlotTeamId?: string) {
  if (!team) return true;
  if (emptySlotTeamId && team.id === emptySlotTeamId) return true;
  return !team.division_id;
}

interface ScheduleEditorProps {
  teamOptions: ScheduleTeamOption[];
  fieldOptions: string[];
  onClose: (day: ScheduleDay | null) => void;
}

type FilterableSelectProps = {
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  allowCustom?: boolean;
  customLabel?: (value: string) => string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
};

function FilterableSelect({
  value,
  options,
  placeholder,
  onChange,
  onSelect,
  allowCustom = false,
  customLabel,
  onKeyDown,
}: FilterableSelectProps) {
  const [open, setOpen] = useState(false);
  const uniqueOptions = useMemo(
    () => Array.from(new Set(options)),
    [options]
  );

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return uniqueOptions;
    }

    return uniqueOptions.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }, [uniqueOptions, value]);

  const hasExactMatch = uniqueOptions.some(
    (option) => option.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div className={styles.selectWrap}>
      <input
        value={value}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />

      {open && (
        <div className={styles.selectMenu}>
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              className={styles.selectOption}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}

          {allowCustom && value.trim() && !hasExactMatch && (
            <button
              type="button"
              className={styles.selectCreate}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(value.trim());
                setOpen(false);
              }}
            >
              {customLabel ? customLabel(value.trim()) : value.trim()}
            </button>
          )}

          {filtered.length === 0 && (!allowCustom || hasExactMatch || !value.trim()) && (
            <div className={styles.selectEmpty}>No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScheduleEditor({
  teamOptions,
  fieldOptions,
  onClose,
}: ScheduleEditorProps) {
  const editorRef = useRef<HTMLElement | null>(null);
  const [day, setDay] = useState<ScheduleDay>({
    date: "",
    timeBlocks: [],
  });
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  const teamById = useMemo(
    () => new Map(teamOptions.map((team) => [team.id, team])),
    [teamOptions]
  );

  const teamByName = useMemo(
    () => new Map(teamOptions.map((team) => [team.name.toLowerCase(), team])),
    [teamOptions]
  );
  const divisionOptions = useMemo<DivisionOption[]>(() => {
    const uniqueDivisions = new Map<string, string>();

    for (const team of teamOptions) {
      if (!team.division_id || !team.division_name || team.name === "Empty") continue;
      uniqueDivisions.set(team.division_id, team.division_name);
    }

    return Array.from(uniqueDivisions.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [teamOptions]);
  const divisionById = useMemo(
    () => new Map(divisionOptions.map((division) => [division.id, division])),
    [divisionOptions]
  );

  const emptySlotTeam = useMemo(
    () => teamOptions.find((team) => team.name === "Empty"),
    [teamOptions]
  );
  const emptySlotTeamId = emptySlotTeam?.id ?? "";

  const setDraftValue = (key: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [key]: value }));
  };

  const getDraftKey = (blockIndex: number, gameIndex: number, field: string) =>
    `${blockIndex}-${gameIndex}-${field}`;

  const focusNextField = (currentField: HTMLElement) => {
    const root = editorRef.current;
    if (!root) return false;

    const fillableFields = Array.from(
      root.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([readonly]):not(:disabled), textarea:not(:disabled), select:not(:disabled)'
      )
    );

    const currentIndex = fillableFields.indexOf(currentField);
    if (currentIndex === -1) {
      return false;
    }

    const nextField = fillableFields[currentIndex + 1];
    if (!nextField) {
      return false;
    }

    nextField.focus();
    if (nextField instanceof HTMLInputElement || nextField instanceof HTMLTextAreaElement) {
      nextField.select?.();
    }
    return true;
  };

  const handleFieldEnter: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const moved = focusNextField(event.currentTarget);
    if (!moved) {
      handleDone();
    }
  };

  const handleTeamInputChange = (
    blockIndex: number,
    gameIndex: number,
    side: "home" | "away",
    value: string
  ) => {
    const draftKey = getDraftKey(blockIndex, gameIndex, side);
    setDraftValue(draftKey, value);

    const selectedTeam = teamByName.get(value.trim().toLowerCase());
    const game = day.timeBlocks[blockIndex]?.games[gameIndex];
    if (!game) return;

    if (side === "home") {
      const nextHomeTeamId = selectedTeam?.id ?? "";
      const awayTeam = game.away_team_id ? teamById.get(game.away_team_id) : undefined;
      const nextDivisionId =
        selectedTeam?.division_id ||
        awayTeam?.division_id ||
        (isUnassignedTeam(selectedTeam, emptySlotTeamId) && isUnassignedTeam(awayTeam, emptySlotTeamId)
          ? ""
          : game.division_id);

      if (game.home_team_id !== nextHomeTeamId || game.division_id !== nextDivisionId) {
        updateGame(blockIndex, gameIndex, {
          ...game,
          home_team_id: nextHomeTeamId,
          division_id: nextDivisionId,
        });
      }
      return;
    }

    const nextAwayTeamId = selectedTeam?.id ?? "";
    const homeTeam = game.home_team_id ? teamById.get(game.home_team_id) : undefined;
    const nextDivisionId =
      selectedTeam?.division_id ||
      homeTeam?.division_id ||
      (isUnassignedTeam(selectedTeam, emptySlotTeamId) && isUnassignedTeam(homeTeam, emptySlotTeamId)
        ? ""
        : game.division_id);

    if (game.away_team_id !== nextAwayTeamId || game.division_id !== nextDivisionId) {
      updateGame(blockIndex, gameIndex, {
        ...game,
        away_team_id: nextAwayTeamId,
        division_id: nextDivisionId,
      });
    }
  };

  const updateDate = (date: string) => {
    setDay((prev) => ({ ...prev, date }));
  };

  const addTimeBlock = () => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: [...prev.timeBlocks, { time: "", games: [] }],
    }));
  };

  const updateTimeBlockTime = (index: number, time: string) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === index ? { ...tb, time } : tb
      ),
    }));
  };

  const removeTimeBlock = (index: number) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((_, i) => i !== index),
    }));
  };

  const addGame = (timeBlockIndex: number) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === timeBlockIndex
          ? {
              ...tb,
              games: [
                ...tb.games,
                {
                  home_team_id: "",
                  away_team_id: "",
                  division_id: "",
                  field: "",
                },
              ],
            }
          : tb
      ),
    }));
  };

  const updateGame = (
    timeBlockIndex: number,
    gameIndex: number,
    game: ScheduleGame
  ) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === timeBlockIndex
          ? {
              ...tb,
              games: tb.games.map((g, gi) => (gi === gameIndex ? game : g)),
            }
          : tb
      ),
    }));
  };

  const removeGame = (timeBlockIndex: number, gameIndex: number) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === timeBlockIndex
          ? {
              ...tb,
              games: tb.games.filter((_, gi) => gi !== gameIndex),
            }
          : tb
      ),
    }));
  };

  const selectTeam = (
    blockIndex: number,
    gameIndex: number,
    side: "home" | "away",
    teamName: string
  ) => {
    const selectedTeam = teamByName.get(teamName.toLowerCase());
    if (!selectedTeam) return;

    const game = day.timeBlocks[blockIndex].games[gameIndex];
    const opposingTeam =
      side === "home"
        ? teamById.get(game.away_team_id)
        : teamById.get(game.home_team_id);
    const nextDivisionId =
      selectedTeam.division_id ||
      opposingTeam?.division_id ||
      (isUnassignedTeam(selectedTeam, emptySlotTeamId) &&
      isUnassignedTeam(opposingTeam, emptySlotTeamId)
        ? ""
        : game.division_id) ||
      "";
    const nextGame: ScheduleGame =
      side === "home"
        ? {
            ...game,
            home_team_id: selectedTeam.id,
            division_id: nextDivisionId,
          }
        : {
            ...game,
            away_team_id: selectedTeam.id,
            division_id: nextDivisionId,
          };

    updateGame(blockIndex, gameIndex, nextGame);
    setDraftValue(getDraftKey(blockIndex, gameIndex, side), selectedTeam.name);
  };

  const selectField = (
    blockIndex: number,
    gameIndex: number,
    fieldName: string
  ) => {
    const game = day.timeBlocks[blockIndex].games[gameIndex];
    updateGame(blockIndex, gameIndex, { ...game, field: fieldName });
    setDraftValue(getDraftKey(blockIndex, gameIndex, "field"), fieldName);
  };

  const selectDivision = (
    blockIndex: number,
    gameIndex: number,
    divisionId: string
  ) => {
    const game = day.timeBlocks[blockIndex].games[gameIndex];
    updateGame(blockIndex, gameIndex, { ...game, division_id: divisionId });
  };

  const getEffectiveDivision = (game: ScheduleGame) => {
    const homeTeam = game.home_team_id ? teamById.get(game.home_team_id) : undefined;
    const awayTeam = game.away_team_id ? teamById.get(game.away_team_id) : undefined;

    const homeIsEmpty = homeTeam?.id === emptySlotTeamId;
    const awayIsEmpty = awayTeam?.id === emptySlotTeamId;

    if ((!homeTeam || homeIsEmpty) && (!awayTeam || awayIsEmpty)) {
      return {
        id: "",
        name: "Open Slot",
      };
    }

    if (homeTeam && !homeIsEmpty && homeTeam.division_id) {
      return {
        id: homeTeam.division_id,
        name: homeTeam.division_name,
      };
    }

    if (awayTeam && !awayIsEmpty && awayTeam.division_id) {
      return {
        id: awayTeam.division_id,
        name: awayTeam.division_name,
      };
    }

    return {
      id: game.division_id,
      name: game.division_id ? divisionById.get(game.division_id)?.name ?? "Empty" : "Empty",
    };
  };

  const handleDone = () => {
    if (!day.date) {
      alert("Please select a date.");
      return;
    }

    const resolvedDay: ScheduleDay = {
      date: day.date,
      timeBlocks: day.timeBlocks.map((block, blockIndex) => ({
        ...block,
        games: block.games.map((game, gameIndex) => {
          const homeDraft = draftValues[getDraftKey(blockIndex, gameIndex, "home")]?.trim() ?? "";
          const awayDraft = draftValues[getDraftKey(blockIndex, gameIndex, "away")]?.trim() ?? "";
          const fieldDraft = draftValues[getDraftKey(blockIndex, gameIndex, "field")]?.trim() ?? "";

          const homeTeam = game.home_team_id
            ? teamById.get(game.home_team_id)
            : teamByName.get(homeDraft.toLowerCase()) ?? emptySlotTeam;
          const awayTeam = game.away_team_id
            ? teamById.get(game.away_team_id)
            : teamByName.get(awayDraft.toLowerCase()) ?? emptySlotTeam;
          const resolvedDivisionId =
            isUnassignedTeam(homeTeam, emptySlotTeamId) &&
            isUnassignedTeam(awayTeam, emptySlotTeamId)
              ? ""
              : homeTeam?.division_id ||
                awayTeam?.division_id ||
                game.division_id ||
                divisionOptions[0]?.id ||
                "";

          return {
            ...game,
            home_team_id: homeTeam?.id ?? "",
            away_team_id: awayTeam?.id ?? "",
            division_id: resolvedDivisionId,
            field: fieldDraft || game.field.trim(),
          };
        }),
      })),
    };

    for (const block of resolvedDay.timeBlocks) {
      if (!block.time) {
        alert("Each time block needs a time.");
        return;
      }

      for (const game of block.games) {
        const homeIsEmptySlot = game.home_team_id === emptySlotTeamId;
        const awayIsEmptySlot = game.away_team_id === emptySlotTeamId;
        const homeTeam = game.home_team_id ? teamById.get(game.home_team_id) : undefined;
        const awayTeam = game.away_team_id ? teamById.get(game.away_team_id) : undefined;
        const canLeaveWithoutDivision =
          isUnassignedTeam(homeTeam, emptySlotTeamId) &&
          isUnassignedTeam(awayTeam, emptySlotTeamId);

        if (
          game.home_team_id &&
          game.away_team_id &&
          game.home_team_id === game.away_team_id &&
          !homeIsEmptySlot
        ) {
          alert("Home team and away team must be different.");
          return;
        }

        if (!game.home_team_id && !game.away_team_id) {
          alert("Each game needs at least one assigned team.");
          return;
        }

        if (
          !game.field ||
          (!game.division_id && !canLeaveWithoutDivision && !homeIsEmptySlot && !awayIsEmptySlot)
        ) {
          alert("Each game needs a division and field, plus at least one assigned team.");
          return;
        }
      }
    }

    onClose(resolvedDay);
  };

  const handleCancel = () => {
    onClose(null);
  };

  return (
    <section className={styles.editor} ref={editorRef}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Schedule Builder</p>
          <h3 className={styles.title}>Create Schedule</h3>
        </div>
        <button type="button" className={styles.secondaryButton} onClick={handleCancel}>
          Cancel
        </button>
      </header>

      <div className={styles.content}>
        <label className={styles.dateField}>
          <span>Date</span>
          <input
            type="date"
            value={day.date}
            onChange={(e) => updateDate(e.target.value)}
            onKeyDown={handleFieldEnter}
          />
        </label>

        {day.timeBlocks.map((block, blockIndex) => (
          <div key={blockIndex} className={styles.timeBlock}>
            <div className={styles.timeHeader}>
              <label className={styles.timeField}>
                <span>Time Block</span>
                <input
                  type="time"
                  value={block.time}
                  onChange={(e) => updateTimeBlockTime(blockIndex, e.target.value)}
                  onKeyDown={handleFieldEnter}
                />
              </label>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => removeTimeBlock(blockIndex)}
              >
                Remove Time
              </button>
            </div>

            {block.games.map((game, gameIndex) => {
              const homeTeam = teamById.get(game.home_team_id);
              const awayTeam = teamById.get(game.away_team_id);
              const effectiveDivision = getEffectiveDivision(game);
              const divisionId = effectiveDivision.id;
              const divisionName = effectiveDivision.name;
              const hasRealTeamDivision =
                Boolean(homeTeam?.division_id && homeTeam.id !== emptySlotTeamId) ||
                Boolean(awayTeam?.division_id && awayTeam.id !== emptySlotTeamId);

              const teamPool = divisionId
                ? teamOptions.filter(
                    (team) => team.division_id === divisionId || team.id === emptySlotTeam?.id
                  )
                : teamOptions;

              const homeOptions = teamPool
                .filter((team) => team.id === emptySlotTeamId || team.id !== game.away_team_id)
                .map((team) => team.name);

              const awayOptions = teamPool
                .filter((team) => team.id === emptySlotTeamId || team.id !== game.home_team_id)
                .map((team) => team.name);

              const homeValue =
                draftValues[getDraftKey(blockIndex, gameIndex, "home")] ??
                homeTeam?.name ??
                "";
              const awayValue =
                draftValues[getDraftKey(blockIndex, gameIndex, "away")] ??
                awayTeam?.name ??
                "";
              const fieldValue =
                draftValues[getDraftKey(blockIndex, gameIndex, "field")] ??
                game.field;

              return (
                <div key={gameIndex} className={styles.gameCard}>
                  <div className={styles.gameRow}>
                    <label className={styles.fieldBlock}>
                      <span>Home Team</span>
                      <FilterableSelect
                        value={homeValue}
                        options={homeOptions}
                        placeholder="Start typing a team name or choose Empty"
                        onChange={(value) =>
                          handleTeamInputChange(blockIndex, gameIndex, "home", value)
                        }
                        onSelect={(value) => selectTeam(blockIndex, gameIndex, "home", value)}
                        onKeyDown={handleFieldEnter}
                      />
                    </label>

                    <label className={styles.fieldBlock}>
                      <span>Away Team</span>
                      <FilterableSelect
                        value={awayValue}
                        options={awayOptions}
                        placeholder={
                          divisionId
                            ? "Choose a team or choose Empty"
                            : "Pick one team first, or choose Empty for the other side"
                        }
                        onChange={(value) =>
                          handleTeamInputChange(blockIndex, gameIndex, "away", value)
                        }
                        onSelect={(value) => selectTeam(blockIndex, gameIndex, "away", value)}
                        onKeyDown={handleFieldEnter}
                      />
                    </label>

                    <label className={styles.fieldBlock}>
                      <span>Division</span>
                      <select
                        value={divisionId}
                        disabled={hasRealTeamDivision}
                        onChange={(e) => selectDivision(blockIndex, gameIndex, e.target.value)}
                      >
                        <option value="">{divisionName || "Empty"}</option>
                        {divisionOptions.map((division) => (
                          <option key={division.id} value={division.id}>
                            {division.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.fieldBlock}>
                      <span>Field</span>
                      <FilterableSelect
                        value={fieldValue}
                        options={fieldOptions}
                        placeholder="Start typing a field name"
                        onChange={(value) =>
                          setDraftValue(getDraftKey(blockIndex, gameIndex, "field"), value)
                        }
                        onSelect={(value) => selectField(blockIndex, gameIndex, value)}
                        allowCustom
                        customLabel={(value) => `Add "${value}" as a field`}
                        onKeyDown={handleFieldEnter}
                      />
                    </label>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeGame(blockIndex, gameIndex)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => addGame(blockIndex)}
            >
              + Add Game
            </button>
          </div>
        ))}

        <button type="button" className={styles.primaryButton} onClick={addTimeBlock}>
          + Add Time Block
        </button>
      </div>

      <footer className={styles.footer}>
        <button type="button" onClick={handleDone} className={styles.save}>
          Save Schedule Day
        </button>
      </footer>
    </section>
  );
}
