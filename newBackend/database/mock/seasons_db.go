package mock

import "backend/models"

var Seasons = []models.Season{
	{
		ID:       "season-2026",
		Name:     "2026 Season",
		IsActive: true,
		Series: []models.Series{
			{
				ID:             "series-2026-a",
				Name:           "A Series",
				StartDate:      "2026-05-01",
				EndDate:        "2026-08-31",
				MoveUpAmount:   1,
				MoveDownAmount: 1,
				IsActive:       true,
				Divisions: []models.Division{
					{
						ID:         "division-a1-2026",
						Name:       "A1 Division",
						Slug:       "a1-division",
						WinPoints:  2,
						LossPoints: 0,
						TiePoints:  1,
						TeamIDs: []string{
							"team-engineering-eagles",
							"team-science-sluggers",
							"team-medical-mustangs",
						},
						Standings: []models.Standing{
							{TeamID: "team-engineering-eagles", Wins: 4, Losses: 0, Ties: 0, Points: 8},
							{TeamID: "team-science-sluggers", Wins: 3, Losses: 1, Ties: 0, Points: 6},
							{TeamID: "team-medical-mustangs", Wins: 2, Losses: 2, Ties: 0, Points: 4},
						},
					},
					{
						ID:         "division-B-2026",
						Name:       "B Division",
						Slug:       "b-division",
						WinPoints:  2,
						LossPoints: 0,
						TiePoints:  1,
						TeamIDs: []string{
							"team-business-bears",
							"team-arts-aces",
							"team-health-hawks",
						},
						Standings: []models.Standing{
							{TeamID: "team-business-bears", Wins: 2, Losses: 1, Ties: 0, Points: 4},
							{TeamID: "team-arts-aces", Wins: 1, Losses: 2, Ties: 0, Points: 2},
							{TeamID: "team-health-hawks", Wins: 0, Losses: 3, Ties: 0, Points: 0},
						},
					},
				},
			},

			// Keep B Series as future/inactive (optional)
			{
				ID:             "series-2026-b",
				Name:           "B Series",
				StartDate:      "2026-05-01",
				EndDate:        "2026-08-31",
				MoveUpAmount:   2,
				MoveDownAmount: 2,
				IsActive:       false,
				Divisions:      []models.Division{},
			},
		},
	},
}
