package services

import (
	"backend/models"
	"backend/repo"
	"time"

	"github.com/google/uuid"
)

func GetUpcomingMatches() ([]models.Match, error) {
	date := time.Now().Format("2006-01-02")

	allMatches, err := repo.GetAllMatches()
	if err != nil {
		return nil, err
	}
	var upcoming []models.Match
	for _, match := range allMatches {
		if match.Date >= date {
			upcoming = append(upcoming, match)
		}
	}
	return upcoming, nil
}

func GetPreviousMatches() ([]models.Match, error) {
	date := time.Now().Format("2006-01-02")
	allMatches, err := repo.GetAllMatches()
	if err != nil {
		return nil, err
	}
	var previous []models.Match
	for _, match := range allMatches {
		if match.Date < date {
			previous = append(previous, match)
		}
	}
	return previous, nil
}

func GetMatchesByTeam(team string) ([]models.Match, error) {
	matches, err := repo.GetAllMatchesByTeam(team)
	if err != nil {
		return nil, err
	}
	return matches, nil
}

func UpdateMatch(updated models.Match) (models.Match, error) {
	existing, err := repo.GetMatchByID(updated.ID)
	if err != nil {
		return models.Match{}, err
	}

	if updated.Date != "" {
		existing.Date = updated.Date
	}
	if updated.Time != "" {
		existing.Time = updated.Time
	}
	if updated.HomeTeam != "" {
		existing.HomeTeam = updated.HomeTeam
	}
	if updated.AwayTeam != "" {
		existing.AwayTeam = updated.AwayTeam
	}

	// Scores should always overwrite
	existing.HomeScore = updated.HomeScore
	existing.AwayScore = updated.AwayScore
	existing.EditingStatus = "draft"

	return repo.UpdateMatch(existing)
}

func DeleteMatch(id string) (models.Match, error) {
	existing, err := repo.GetMatchByID(id)
	if err != nil {
		return models.Match{}, err
	}
	existing.EditingStatus = "deleted"
	return repo.UpdateMatch(existing)
}

func CreateNewMatch(match models.Match) (models.Match, error) {
	match.ID = uuid.NewString()
	match.EditingStatus = "draft"
	return repo.AddNewMatch(match)
}

func ChangeDaySchedule(schedule models.ScheduleDay) error {
	for _, block := range schedule.TimeBlocks {
		for _, game := range block.Games {

			if game.ID != "" {
				_, err := UpdateMatch(models.Match{
					ID:       game.ID,
					Date:     schedule.Date,
					Time:     block.Time,
					HomeTeam: game.HomeTeam,
					AwayTeam: game.AwayTeam,
					Field:    game.Field,
				})
				if err != nil {
					return err
				}
			} else {
				// create new
				_, err := CreateNewMatch(models.Match{
					Date:     schedule.Date,
					Time:     block.Time,
					HomeTeam: game.HomeTeam,
					AwayTeam: game.AwayTeam,
					Field:    game.Field,
				})
				if err != nil {
					return err
				}
			}
		}
	}
	return nil
}
