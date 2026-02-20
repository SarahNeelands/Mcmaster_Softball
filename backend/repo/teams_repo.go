package repo

import (
	"backend/database/mock"
	"backend/models"
	"errors"
)

func GetAllTeams() ([]models.Team, error) {
	return mock.Teams, nil
}

func GetTeamByID(id string) (models.Team, error) {
	for _, team := range mock.Teams {
		if team.ID == id {
			return team, nil
		}
	}
	return models.Team{}, errors.New("team not found")
}

func UpdateTeam(update models.Team) (models.Team, error) {
	for i, team := range mock.Teams {
		if team.ID == update.ID {
			mock.Teams[i] = update
			return update, nil
		}
	}
	return models.Team{}, errors.New("team not updated")
}

func AddNewTeam(team models.Team) (models.Team, error) {
	mock.Teams = append(mock.Teams, team)
	return team, nil
}

func DeleteTeamByID(id string) (models.Team, error) {
	for i, team := range mock.Teams {
		if team.ID == id {
			mock.Teams = append(mock.Teams[:i], mock.Teams[i+1:]...)
			return team, nil
		}
	}
	return models.Team{}, errors.New("team not found")
}

func GetTeamBySlug(slug string) (models.Team, error) {
	for _, team := range mock.Teams {
		if team.Slug == slug {
			return team, nil
		}
	}
	return models.Team{}, nil
}
