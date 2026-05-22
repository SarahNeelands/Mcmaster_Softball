"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const series_rollover_1 = require("../../backend/services/series_rollover");
const series_seed_1 = require("../../backend/services/series_seed");
const testCases = [
    {
        name: "creates next-day rollover date",
        run: () => {
            strict_1.default.equal((0, series_rollover_1.addDaysToIsoDate)("2026-06-15", 1), "2026-06-16");
        },
    },
    {
        name: "creates month-boundary rollover date",
        run: () => {
            strict_1.default.equal((0, series_rollover_1.addDaysToIsoDate)("2026-06-30", 1), "2026-07-01");
        },
    },
    {
        name: "creates leap-safe rollover date",
        run: () => {
            strict_1.default.equal((0, series_rollover_1.addDaysToIsoDate)("2028-02-28", 1), "2028-02-29");
        },
    },
    {
        name: "builds next numbered series name",
        run: () => {
            strict_1.default.equal((0, series_rollover_1.buildNextSeriesName)([
                {
                    id: "1",
                    name: "Series 1",
                    season_id: "season-1",
                    start_date: "2026-05-01",
                    end_date: "2026-05-31",
                    advance_amount: 1,
                    demote_amount: 1,
                    editing_status: "published",
                },
                {
                    id: "2",
                    name: "Series 2",
                    season_id: "season-1",
                    start_date: "2026-06-01",
                    end_date: "2026-06-30",
                    advance_amount: 1,
                    demote_amount: 1,
                    editing_status: "published",
                },
            ]), "Series 3");
        },
    },
    {
        name: "creates follow-up only when season has remaining time",
        run: () => {
            strict_1.default.equal((0, series_rollover_1.shouldCreateFollowupSeries)({ end_date: "2026-06-15" }, { end_date: "2026-08-31" }), true);
            strict_1.default.equal((0, series_rollover_1.shouldCreateFollowupSeries)({ end_date: "2026-06-15" }, { end_date: "2026-06-15" }), false);
        },
    },
    {
        name: "finds existing follow-up by next-day start date",
        run: () => {
            const existing = (0, series_rollover_1.findExistingFollowupSeries)([{ start_date: "2026-06-16" }, { start_date: "2026-07-01" }], "2026-06-15");
            strict_1.default.deepEqual(existing, { start_date: "2026-06-16" });
        },
    },
    {
        name: "builds follow-up series payload from previous series and season",
        run: () => {
            const payload = (0, series_rollover_1.buildFollowupSeriesPayload)({
                name: "Series 1",
                end_date: "2026-06-15",
                advance_amount: 2,
                demote_amount: 1,
            }, {
                id: "season-1",
                end_date: "2026-08-31",
            }, [
                {
                    id: "series-1",
                    name: "Series 1",
                    season_id: "season-1",
                    start_date: "2026-05-01",
                    end_date: "2026-06-15",
                    advance_amount: 2,
                    demote_amount: 1,
                    editing_status: "published",
                },
            ]);
            strict_1.default.deepEqual(payload, {
                id: "",
                name: "Series 2",
                divisions_ids: [],
                start_date: "2026-06-16",
                end_date: "2026-08-31",
                advance_amount: 2,
                demote_amount: 1,
                editing_status: "draft",
            });
        },
    },
    {
        name: "promotes top lower-division team and demotes bottom upper-division team",
        run: () => {
            const assignments = (0, series_seed_1.computeSeededAssignments)([
                { id: "div-1", name: "Division 1", teamIds: ["A", "B", "C"], sortKey: 2 },
                { id: "div-2", name: "Division 2", teamIds: ["D", "E", "F"], sortKey: 1 },
            ], 1, 1);
            strict_1.default.equal(assignments.get("D"), "div-1");
            strict_1.default.equal(assignments.get("C"), "div-2");
            strict_1.default.equal(assignments.get("A"), "div-1");
            strict_1.default.equal(assignments.get("E"), "div-2");
        },
    },
    {
        name: "zero advance and demote preserves original divisions",
        run: () => {
            const assignments = (0, series_seed_1.computeSeededAssignments)([
                { id: "div-1", name: "Division 1", teamIds: ["A", "B"], sortKey: 2 },
                { id: "div-2", name: "Division 2", teamIds: ["C", "D"], sortKey: 1 },
            ], 0, 0);
            strict_1.default.equal(assignments.get("A"), "div-1");
            strict_1.default.equal(assignments.get("B"), "div-1");
            strict_1.default.equal(assignments.get("C"), "div-2");
            strict_1.default.equal(assignments.get("D"), "div-2");
        },
    },
    {
        name: "single-division setup does not move teams",
        run: () => {
            const assignments = (0, series_seed_1.computeSeededAssignments)([{ id: "div-1", name: "Division 1", teamIds: ["A", "B", "C"], sortKey: 1 }], 1, 1);
            strict_1.default.equal(assignments.get("A"), "div-1");
            strict_1.default.equal(assignments.get("B"), "div-1");
            strict_1.default.equal(assignments.get("C"), "div-1");
        },
    },
    {
        name: "promotion and demotion use previous-series ranking order only",
        run: () => {
            const assignments = (0, series_seed_1.computeSeededAssignments)([
                { id: "div-1", name: "Division 1", teamIds: ["A", "B", "C"], sortKey: 3 },
                { id: "div-2", name: "Division 2", teamIds: ["D", "E", "F"], sortKey: 2 },
                { id: "div-3", name: "Division 3", teamIds: ["G", "H", "I"], sortKey: 1 },
            ], 1, 1);
            strict_1.default.equal(assignments.get("D"), "div-1");
            strict_1.default.equal(assignments.get("C"), "div-2");
            strict_1.default.equal(assignments.get("G"), "div-2");
            strict_1.default.equal(assignments.get("F"), "div-3");
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
console.log(`\n${passed}/${testCases.length} rollover tests passed.`);
