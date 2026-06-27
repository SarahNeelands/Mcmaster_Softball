import assert from "node:assert/strict";
import { selectCurrentOrMostRecentSeries } from "../../backend/services/series_selection";

type SeriesCase = {
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
    name: "returns current series when one contains today",
    run: () => {
      const selected = selectCurrentOrMostRecentSeries(
        [
          { id: "series-1", start_date: "2026-03-01", end_date: "2026-05-31" },
          { id: "series-2", start_date: "2026-06-01", end_date: "2026-08-31" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "series-2");
    },
  },
  {
    name: "returns most recent finished series when no current series exists",
    run: () => {
      const selected = selectCurrentOrMostRecentSeries(
        [
          { id: "series-1", start_date: "2026-03-01", end_date: "2026-05-31" },
          { id: "series-0", start_date: "2026-01-01", end_date: "2026-02-15" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "series-1");
    },
  },
  {
    name: "returns first series when all series are in the future",
    run: () => {
      const selected = selectCurrentOrMostRecentSeries(
        [
          { id: "series-2", start_date: "2026-09-01", end_date: "2026-10-01" },
          { id: "series-3", start_date: "2026-10-02", end_date: "2026-11-01" },
        ],
        "2026-06-26"
      );

      assert.equal(selected?.id, "series-2");
    },
  },
  {
    name: "returns null when there are no series",
    run: () => {
      const selected = selectCurrentOrMostRecentSeries<SeriesCase>([], "2026-06-26");
      assert.equal(selected, null);
    },
  },
  {
    name: "accepts Date values from the database driver",
    run: () => {
      const selected = selectCurrentOrMostRecentSeries(
        [
          {
            id: "series-1",
            start_date: new Date("2026-03-15T04:00:00.000Z"),
            end_date: new Date("2027-03-15T04:00:00.000Z"),
          },
        ],
        new Date("2026-06-26T12:00:00.000Z")
      );

      assert.equal(selected?.id, "series-1");
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

console.log(`\n${passed}/${testCases.length} series-selection tests passed.`);
