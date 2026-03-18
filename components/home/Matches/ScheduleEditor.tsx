"use client";

import { useMemo, useState } from "react";
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
  division_id: string;
  division_name: string;
};

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
};

function FilterableSelect({
  value,
  options,
  placeholder,
  onChange,
  onSelect,
  allowCustom = false,
  customLabel,
}: FilterableSelectProps) {
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return options;
    }

    return options.filter((option) =>
      option.toLowerCase().includes(query)
    );
  }, [options, value]);

  const hasExactMatch = options.some(
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

  const setDraftValue = (key: string, value: string) => {
    setDraftValues((prev) => ({ ...prev, [key]: value }));
  };

  const getDraftKey = (blockIndex: number, gameIndex: number, field: string) =>
    `${blockIndex}-${gameIndex}-${field}`;

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
    const nextGame: ScheduleGame =
      side === "home"
        ? {
            ...game,
            home_team_id: selectedTeam.id,
            division_id: selectedTeam.division_id,
          }
        : {
            ...game,
            away_team_id: selectedTeam.id,
            division_id: selectedTeam.division_id,
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
            : teamByName.get(homeDraft.toLowerCase());
          const awayTeam = game.away_team_id
            ? teamById.get(game.away_team_id)
            : teamByName.get(awayDraft.toLowerCase());

          return {
            ...game,
            home_team_id: homeTeam?.id ?? "",
            away_team_id: awayTeam?.id ?? "",
            division_id: homeTeam?.division_id ?? awayTeam?.division_id ?? game.division_id,
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
        if (game.home_team_id && game.away_team_id && game.home_team_id === game.away_team_id) {
          alert("Home team and away team must be different.");
          return;
        }

        if (
          !game.home_team_id ||
          !game.away_team_id ||
          !game.division_id ||
          !game.field
        ) {
          alert("Each game needs home team, away team, division, and field.");
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
    <section className={styles.editor}>
      <header className={styles.header}>
        <h3>Add Games</h3>
        <button type="button" onClick={handleCancel}>Cancel</button>
      </header>

      <div className={styles.content}>
        <label>
          Date:
          <input
            type="date"
            value={day.date}
            onChange={(e) => updateDate(e.target.value)}
          />
        </label>

        {day.timeBlocks.map((block, blockIndex) => (
          <div key={blockIndex} className={styles.timeBlock}>
            <div className={styles.timeHeader}>
              <input
                type="time"
                value={block.time}
                onChange={(e) => updateTimeBlockTime(blockIndex, e.target.value)}
              />

              <button type="button" onClick={() => removeTimeBlock(blockIndex)}>
                Remove Time
              </button>
            </div>

            {block.games.map((game, gameIndex) => {
              const homeTeam = teamById.get(game.home_team_id);
              const awayTeam = teamById.get(game.away_team_id);
              const divisionId = homeTeam?.division_id ?? awayTeam?.division_id ?? game.division_id;
              const divisionName = homeTeam?.division_name ?? awayTeam?.division_name ?? "";

              const teamPool = divisionId
                ? teamOptions.filter((team) => team.division_id === divisionId)
                : teamOptions;

              const homeOptions = teamPool
                .filter((team) => team.id !== game.away_team_id)
                .map((team) => team.name);

              const awayOptions = teamPool
                .filter((team) => team.id !== game.home_team_id)
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
                        placeholder="Start typing a team name"
                        onChange={(value) =>
                          setDraftValue(getDraftKey(blockIndex, gameIndex, "home"), value)
                        }
                        onSelect={(value) => selectTeam(blockIndex, gameIndex, "home", value)}
                      />
                    </label>

                    <label className={styles.fieldBlock}>
                      <span>Away Team</span>
                      <FilterableSelect
                        value={awayValue}
                        options={awayOptions}
                        placeholder={
                          divisionId
                            ? "Choose a team from the same division"
                            : "Pick a home or away team first"
                        }
                        onChange={(value) =>
                          setDraftValue(getDraftKey(blockIndex, gameIndex, "away"), value)
                        }
                        onSelect={(value) => selectTeam(blockIndex, gameIndex, "away", value)}
                      />
                    </label>

                    <label className={styles.fieldBlock}>
                      <span>Division</span>
                      <input value={divisionName} readOnly placeholder="Auto-filled" />
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
                      />
                    </label>

                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => removeGame(blockIndex, gameIndex)}
                    >
                      x
                    </button>
                  </div>
                </div>
              );
            })}

            <button type="button" onClick={() => addGame(blockIndex)}>
              + Add Game
            </button>
          </div>
        ))}

        <button type="button" onClick={addTimeBlock}>+ Add Time Block</button>
      </div>

      <footer className={styles.footer}>
        <button type="button" onClick={handleDone} className={styles.save}>
          Done
        </button>
      </footer>
    </section>
  );
}
