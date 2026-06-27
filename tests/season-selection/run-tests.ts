import assert from "node:assert/strict";
import { selectCurrentOrMostRecentSeason } from "../../backend/services/season_selection";

type SeasonCase = {
  id: string;
  start_date: string | Date | number;
  end_date: string | Date | number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const testCases: TestCase[] = [
  {
    name: "returns current season when one contains today",
    run: () => {
      const selected = selectCurrentOrMostRecentSeason(
        [
          { id: "2025", start_date: "2025-03-01", end_date: "2025-09-01" },
          { id: "2026", start_date: "2026-03-15T04:00:00.000Z", end_date: "2027-03-15T04:00:00.000Z" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "2026");
    },
  },
  {
    name: "returns most recent finished season when no current season exists",
    run: () => {
      const selected = selectCurrentOrMostRecentSeason(
        [
          { id: "2026", start_date: "2026-03-01", end_date: "2026-05-31" },
          { id: "2025", start_date: "2025-03-01", end_date: "2025-09-01" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "2026");
    },
  },
  {
    name: "returns first season when all seasons are in the future",
    run: () => {
      const selected = selectCurrentOrMostRecentSeason(
        [
          { id: "2027", start_date: "2027-03-01", end_date: "2027-09-01" },
          { id: "2028", start_date: "2028-03-01", end_date: "2028-09-01" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "2027");
    },
  },
  {
    name: "returns null when there are no seasons",
    run: () => {
      const selected = selectCurrentOrMostRecentSeason<SeasonCase>([], "2026-06-26");
      assert.equal(selected, null);
    },
  },
  {
    name: "accepts Date values from the database driver",
    run: () => {
      const selected = selectCurrentOrMostRecentSeason(
        [
          {
            id: "2026",
            start_date: new Date("2026-03-15T04:00:00.000Z"),
            end_date: new Date("2027-03-15T04:00:00.000Z"),
          },
        ],
        new Date("2026-06-26T12:00:00.000Z")
      );

      assert.equal(selected?.id, "2026");
    },
  },
];

let passed = 0;

for (const testCase of testCases) {
  try {
    testCase.run();
    passed += 1;
    console.log(`PASS ${testCase.name}`);
  } catch (error) {
    console.error(`FAIL ${testCase.name}`);
    console.error(error);
    process.exit(1);
  }
}

console.log(`\n${passed}/${testCases.length} season-selection tests passed.`);
