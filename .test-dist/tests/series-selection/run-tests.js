"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const series_selection_1 = require("../../backend/services/series_selection");
const testCases = [
    {
        name: "returns current series when one contains today",
        run: () => {
            const selected = (0, series_selection_1.selectCurrentOrMostRecentSeries)([
                { id: "series-1", start_date: "2026-03-01", end_date: "2026-05-31" },
                { id: "series-2", start_date: "2026-06-01", end_date: "2026-08-31" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "series-2");
        },
    },
    {
        name: "returns most recent finished series when no current series exists",
        run: () => {
            const selected = (0, series_selection_1.selectCurrentOrMostRecentSeries)([
                { id: "series-1", start_date: "2026-03-01", end_date: "2026-05-31" },
                { id: "series-0", start_date: "2026-01-01", end_date: "2026-02-15" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "series-1");
        },
    },
    {
        name: "returns first series when all series are in the future",
        run: () => {
            const selected = (0, series_selection_1.selectCurrentOrMostRecentSeries)([
                { id: "series-2", start_date: "2026-09-01", end_date: "2026-10-01" },
                { id: "series-3", start_date: "2026-10-02", end_date: "2026-11-01" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "series-2");
        },
    },
    {
        name: "returns null when there are no series",
        run: () => {
            const selected = (0, series_selection_1.selectCurrentOrMostRecentSeries)([], "2026-06-26");
            strict_1.default.equal(selected, null);
        },
    },
];
let passed = 0;
for (const testCase of testCases) {
    try {
        testCase.run();
        passed += 1;
        console.log(`PASS ${testCase.name}`);
    }
    catch (error) {
        console.error(`FAIL ${testCase.name}`);
        console.error(error);
        process.exit(1);
    }
}
console.log(`\n${passed}/${testCases.length} series-selection tests passed.`);
