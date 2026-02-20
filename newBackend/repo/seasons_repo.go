package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
)

func GetAllSeasons() ([]models.Season, error) {
	return mock.Seasons, nil
}

func GetCurrentSeason() (models.Season, error) {
	for _, s := range mock.Seasons {
		if s.IsActive {
			return s, nil
		}
	}
	return models.Season{}, errors.New("no active season")
}
