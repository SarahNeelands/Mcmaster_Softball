import {Division} from "../../types/division_mod"
import * as repo from "../repo/divisions_repo"
import { GetAllDivisionRankings } from "./standing_service";
import * as seriesRepo from "../repo/series_repo";
import { AddDivisionTeamStanding, MoveTeamStandingToDivision } from "../repo/standings_repo";
import { GetAllTeamsOfSeason } from "./team_services";


//==============================================================================
// Season GET functions
//==============================================================================

export async function GetAllSeriesDivisions(series_id: string): Promise<Division[]> {
    await EnsureSeriesHasDivision(series_id);
    const data = await repo.GetAllSeriesDivisions(series_id);
    if (data && data.length > 0) {
        return await Promise.all(data.map((division) => FormatDivision(division)));
    }
    return [];
}

export async function GetSeriesDivisionIds(series_id: string): Promise<string[]> {
    await EnsureSeriesHasDivision(series_id);
    return await repo.GetSeriesDivisionIds(series_id);
}

export async function GetDivisionById(id: string): Promise<Division> {
    const rows = await repo.GetDivisionsById(id);

    if (!rows || rows.length === 0) {
        throw new Error(`Division not found: ${id}`);
    }

    return await FormatDivision(rows[0]);
}

export async function CreateDivision(division: Division, series_id: string): Promise<Division> {
    const created = await repo.AddNewDivisions(division, series_id);
    return await FormatDivision(created);
}

export async function CreateDefaultDivision(series_id: string): Promise<Division> {
    const series = await seriesRepo.GetSeriesById(series_id);

    if (!series) {
        throw new Error(`Series not found: ${series_id}`);
    }

    const created = await repo.AddNewDivisions(
        {
            id: "",
            name: "Division 1",
            win_points: 2,
            loss_points: 0,
            tie_points: 1,
            teamIDs: [],
            standings: [],
            editing_status: "draft",
        },
        series_id
    );

    const teams = await GetAllTeamsOfSeason(series.season_id);

    await Promise.all(
        teams.map(async (team) => {
            await repo.AddTeamToDivision(series_id, team.id, created.id);
            await AddDivisionTeamStanding(created.id, series_id, team.id);
        })
    );

    return await FormatDivision(created);
}

export async function UpdateDivision(division: Division): Promise<Division> {
    const rows = await repo.UpdateDivisionsById(division);

    if (!rows || rows.length === 0) {
        throw new Error(`Failed to update division: ${division.id}`);
    }

    return await FormatDivision(rows[0]);
}

export async function DeleteDivision(division: Division): Promise<Division> {
    division.editing_status = "deleted";
    return await UpdateDivision(division);
}

export async function MoveTeamToDivision(
    team_id: string,
    source_division_id: string,
    target_division_id: string
): Promise<void> {
    if (source_division_id === target_division_id) {
        return;
    }

    const [sourceRows, targetRows] = await Promise.all([
        repo.GetDivisionsById(source_division_id),
        repo.GetDivisionsById(target_division_id),
    ]);

    if (sourceRows.length === 0 || targetRows.length === 0) {
        throw new Error("Source or target division not found");
    }

    const source = sourceRows[0];
    const target = targetRows[0];

    if (source.series_id !== target.series_id) {
        throw new Error("Teams can only be moved within the same series");
    }

    await repo.AddTeamToDivision(target.series_id, team_id, target.id);

    const moved = await MoveTeamStandingToDivision(team_id, target.series_id, target.id);
    if (!moved) {
        await AddDivisionTeamStanding(target.id, target.series_id, team_id);
    }
}

export async function AssignTeamToDivision(
    team_id: string,
    series_id: string,
    target_division_id: string
): Promise<void> {
    const targetRows = await repo.GetDivisionsById(target_division_id);

    if (targetRows.length === 0) {
        throw new Error("Target division not found");
    }

    const target = targetRows[0];

    if (target.series_id !== series_id) {
        throw new Error("Teams can only be assigned within the same series");
    }

    await repo.AddTeamToDivision(series_id, team_id, target.id);

    const moved = await MoveTeamStandingToDivision(team_id, series_id, target.id);
    if (!moved) {
        await AddDivisionTeamStanding(target.id, series_id, team_id);
    }
}

export async function SeedSeriesDivisionsFromPreviousSeries(
    previous_series_id: string,
    next_series_id: string,
    advance_amount: number,
    demote_amount: number
): Promise<void> {
    const previousDivisions = await GetAllSeriesDivisions(previous_series_id);

    if (previousDivisions.length === 0) {
        return;
    }

    const orderedPreviousDivisions = [...previousDivisions].sort(
        (a, b) => b.win_points - a.win_points || a.name.localeCompare(b.name)
    );

    const createdDivisions = await Promise.all(
        orderedPreviousDivisions.map((division) =>
            repo.AddNewDivisions(
                {
                    id: "",
                    name: division.name,
                    win_points: division.win_points,
                    loss_points: division.loss_points,
                    tie_points: division.tie_points,
                    teamIDs: [],
                    standings: [],
                    editing_status: "draft",
                },
                next_series_id
            )
        )
    );

    const nextDivisionIdByPreviousDivisionId = new Map<string, string>();
    orderedPreviousDivisions.forEach((division, index) => {
        nextDivisionIdByPreviousDivisionId.set(division.id, createdDivisions[index].id);
    });

    const teamAssignments = new Map<string, string>();

    for (const division of orderedPreviousDivisions) {
        const sourceTeamIds = getOrderedDivisionTeamIds(division);
        for (const teamId of sourceTeamIds) {
            teamAssignments.set(teamId, division.id);
        }
    }

    for (let index = 0; index < orderedPreviousDivisions.length; index += 1) {
        const division = orderedPreviousDivisions[index];
        const rankedTeamIds = getOrderedDivisionTeamIds(division);

        const promotedTeamIds =
            index > 0
                ? rankedTeamIds.slice(0, Math.min(advance_amount, rankedTeamIds.length))
                : [];

        for (const teamId of promotedTeamIds) {
            teamAssignments.set(teamId, orderedPreviousDivisions[index - 1].id);
        }

        const demotionPool = rankedTeamIds.filter((teamId) => !promotedTeamIds.includes(teamId));
        const demotedTeamIds =
            index < orderedPreviousDivisions.length - 1
                ? demotionPool.slice(Math.max(0, demotionPool.length - demote_amount))
                : [];

        for (const teamId of demotedTeamIds) {
            teamAssignments.set(teamId, orderedPreviousDivisions[index + 1].id);
        }
    }

    await Promise.all(
        Array.from(teamAssignments.entries()).map(async ([teamId, previousDivisionId]) => {
            const nextDivisionId = nextDivisionIdByPreviousDivisionId.get(previousDivisionId);
            if (!nextDivisionId) {
                return;
            }

            await repo.AddTeamToDivision(next_series_id, teamId, nextDivisionId);
            await AddDivisionTeamStanding(nextDivisionId, next_series_id, teamId);
        })
    );
}

async function EnsureSeriesHasDivision(series_id: string): Promise<void> {
    const data = await repo.GetAllSeriesDivisions(series_id);

    if (data.length > 0) {
        return;
    }

    await CreateDefaultDivision(series_id);
}

function getOrderedDivisionTeamIds(division: Division): string[] {
    if (division.standings.length > 0) {
        return [...division.standings]
            .sort(
                (a, b) =>
                    b.points - a.points ||
                    b.wins - a.wins ||
                    a.losses - b.losses ||
                    a.team.name.localeCompare(b.team.name)
            )
            .map((standing) => standing.team.id);
    }

    return division.teamIDs;
}

//==============================================================================
// Division FORMATTING functions
//==============================================================================

export async function FormatDivision(division: repo.DivisionRow): Promise<Division> {
    const standings = await GetAllDivisionRankings(division.id);
    const teamIDs = await repo.GetDivisionTeamIds(division.id);

    return {
        id: division.id,
        name: division.name,
        win_points: division.win_points,
        loss_points: division.loss_points,
        tie_points: division.tie_points,
        teamIDs: teamIDs ?? standings.map((standing) => standing.team.id),
        standings,
        editing_status: division.editing_status,
    };
}

