package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
	"strings"
)

func GetAllMatches() ([]models.Match, error) {
	return mock.Matches, nil
}

func GetMatchByID(id string) (models.Match, error) {
	for _, match := range mock.Matches {
		if match.ID == id {
			return match, nil
		}
	}
	return models.Match{}, errors.New("match not found")
}
func UpdateMatch(update models.Match) (models.Match, error) {
	for i, match := range mock.Matches {
		if match.ID == update.ID {
			mock.Matches[i] = update
			return update, nil
		}
	}
	return models.Match{}, errors.New("match not updated")
}
func normalizeTeam(s string) string {
	return strings.ToLower(strings.TrimSpace(s))
}

func GetAllMatchesByTeam(team string) ([]models.Match, error) {
	matches := make([]models.Match, 0)

	target := normalizeTeam(team)

	for _, match := range mock.Matches {
		home := normalizeTeam(match.HomeTeam)
		away := normalizeTeam(match.AwayTeam)

		if home == target || away == target {
			matches = append(matches, match)
		}
	}
	return matches, nil
}
func DeleteMatch(id string) (models.Match, error) {
	for i, match := range mock.Matches {
		if match.ID == id {
			mock.Matches = append(mock.Matches[:i], mock.Matches[i+1:]...)
			return match, nil
		}
	}
	return models.Match{}, errors.New("match not found")
}

func AddNewMatch(match models.Match) (models.Match, error) {
	mock.Matches = append(mock.Matches, match)
	return match, nil
}

func GetMatchesByDate(date string) ([]models.Match, error) {
	var matches []models.Match
	for _, match := range mock.Matches {
		if match.Date == date {
			matches = append(matches, match)
		}
	}
	return matches, nil
}
