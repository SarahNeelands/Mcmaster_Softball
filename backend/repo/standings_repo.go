package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
)

func GetDivisionByID(divisionID string) (models.Division, error) {
	for _, season := range mock.Seasons {
		for _, series := range season.Series {
			for _, division := range series.Divisions {
				if division.ID == divisionID {
					return division, nil
				}
			}
		}
	}
	return models.Division{}, errors.New("division not found")
}
