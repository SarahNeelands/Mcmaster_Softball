package services

import (
	"backend/models"
	"backend/repo"
	"errors"
)

func GetAllSeasons() ([]models.Season, error) {
	return repo.GetAllSeasons()
}

func GetCurrentSeason() (models.Season, error) {
	return repo.GetCurrentSeason()
}

func GetCurrentSeasonSeries() (models.Series, error) {
	season, err := repo.GetCurrentSeason()
	if err != nil {
		return models.Series{}, err
	}

	for _, s := range season.Series {
		if s.IsActive {
			return s, nil
		}
	}

	return models.Series{}, errors.New("no active series found for current season")
}

func GetTeamsByDivisionID(divisionId string) ([]models.Team, error) {
	var teams []models.Team
	division, err := repo.GetDivisionByID(divisionId)
	if err != nil {
		return teams, err
	}

	for _, team := range division.TeamIDs {
		t, err := repo.GetTeamByID(team)
		if err != nil {
			return teams, err
		}
		teams = append(teams, t)
	}
	return teams, nil
}
