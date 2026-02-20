"use client";

import { useState } from "react";
import styles from "./ScheduleEditor.module.css";

import { ScheduleDay, Game } from "@/types/matches";

interface ScheduleEditorProps {
  onClose: (day: ScheduleDay | null) => void;
}

export default function ScheduleEditor({ onClose }: ScheduleEditorProps) {
  const [day, setDay] = useState<ScheduleDay>({
    date: "",
    timeBlocks: [],
  });

  /* ---------- Date ---------- */

  const updateDate = (date: string) => {
    setDay((prev) => ({ ...prev, date }));
  };

  /* ---------- Time Blocks ---------- */

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

  /* ---------- Games ---------- */

  const addGame = (timeBlockIndex: number) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === timeBlockIndex
          ? {
              ...tb,
              games: [
                ...tb.games,
                { homeTeam: "", awayTeam: "", field: "" },
              ],
            }
          : tb
      ),
    }));
  };

  const updateGame = (
    timeBlockIndex: number,
    gameIndex: number,
    game: Game
  ) => {
    setDay((prev) => ({
      ...prev,
      timeBlocks: prev.timeBlocks.map((tb, i) =>
        i === timeBlockIndex
          ? {
              ...tb,
              games: tb.games.map((g, gi) =>
                gi === gameIndex ? game : g
              ),
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

  /* ---------- Close ---------- */

  const handleDone = () => {
    if (!day.date) return; // optional guard
    onClose(day);
  };

  const handleCancel = () => {
    onClose(null);
  };

  return (
    <section className={styles.editor}>
      <header className={styles.header}>
        <h3>Add Games</h3>
        <button onClick={handleCancel}>Cancel</button>
      </header>

      <div className={styles.content}>
        {/* Date */}
        <label>
          Date:
          <input
            type="date"
            value={day.date}
            onChange={(e) => updateDate(e.target.value)}
          />
        </label>

        {/* Time Blocks */}
        {day.timeBlocks.map((block, blockIndex) => (
          <div key={blockIndex} className={styles.timeBlock}>
            <input
              type="time"
              value={block.time}
              onChange={(e) =>
                updateTimeBlockTime(blockIndex, e.target.value)
              }
            />

            <button onClick={() => removeTimeBlock(blockIndex)}>
              Remove Time
            </button>

            {block.games.map((game, gameIndex) => (
              <div key={gameIndex} className={styles.gameRow}>
                <input
                  placeholder="Home team"
                  value={game.homeTeam}
                  onChange={(e) =>
                    updateGame(blockIndex, gameIndex, {
                      ...game,
                      homeTeam: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Away team"
                  value={game.awayTeam}
                  onChange={(e) =>
                    updateGame(blockIndex, gameIndex, {
                      ...game,
                      awayTeam: e.target.value,
                    })
                  }
                />
                <input
                  placeholder="Field"
                  value={game.field}
                  onChange={(e) =>
                    updateGame(blockIndex, gameIndex, {
                      ...game,
                      field: e.target.value,
                    })
                  }
                />
                <button
                  onClick={() => removeGame(blockIndex, gameIndex)}
                >
                  ✕
                </button>
              </div>
            ))}

            <button onClick={() => addGame(blockIndex)}>
              + Add Game
            </button>
          </div>
        ))}

        <button onClick={addTimeBlock}>+ Add Time Block</button>
      </div>

      <footer className={styles.footer}>
        <button onClick={handleDone} className={styles.save}>
          Done
        </button>
      </footer>
    </section>
  );
}
