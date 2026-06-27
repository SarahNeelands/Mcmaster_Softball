"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const season_selection_1 = require("../../backend/services/season_selection");
const testCases = [
    {
        name: "returns current season when one contains today",
        run: () => {
            const selected = (0, season_selection_1.selectCurrentOrMostRecentSeason)([
                { id: "2025", start_date: "2025-03-01", end_date: "2025-09-01" },
                { id: "2026", start_date: "2026-03-15T04:00:00.000Z", end_date: "2027-03-15T04:00:00.000Z" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "2026");
        },
    },
    {
        name: "returns most recent finished season when no current season exists",
        run: () => {
            const selected = (0, season_selection_1.selectCurrentOrMostRecentSeason)([
                { id: "2026", start_date: "2026-03-01", end_date: "2026-05-31" },
                { id: "2025", start_date: "2025-03-01", end_date: "2025-09-01" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "2026");
        },
    },
    {
        name: "returns first season when all seasons are in the future",
        run: () => {
            const selected = (0, season_selection_1.selectCurrentOrMostRecentSeason)([
                { id: "2027", start_date: "2027-03-01", end_date: "2027-09-01" },
                { id: "2028", start_date: "2028-03-01", end_date: "2028-09-01" },
            ], "2026-06-26");
            strict_1.default.equal(selected?.id, "2027");
        },
    },
    {
        name: "returns null when there are no seasons",
        run: () => {
            const selected = (0, season_selection_1.selectCurrentOrMostRecentSeason)([], "2026-06-26");
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
console.log(`\n${passed}/${testCases.length} season-selection tests passed.`);
