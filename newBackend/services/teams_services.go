package services

import (
	"backend/models"
	"backend/repo"
	"errors"

	"github.com/google/uuid"
)

func GetAllTeams() ([]models.Team, error) {
	return repo.GetAllTeams()
}

func GetTeamByID(id string) (models.Team, error) {
	return repo.GetTeamByID(id)
}

func UpdateTeam(updatedTeam models.Team) (models.Team, error) {
	if updatedTeam.ID == "" {
		return models.Team{}, errors.New("team must have an ID")
	}
	team, err := repo.GetTeamByID(updatedTeam.ID)
	if err != nil {
		return models.Team{}, err
	}
	if updatedTeam.Name != "" {
		team.Name = updatedTeam.Name
	}
	if updatedTeam.CaptainName != "" {
		team.CaptainName = updatedTeam.CaptainName
	}
	if updatedTeam.CaptainEmail != "" {
		team.CaptainEmail = updatedTeam.CaptainEmail
	}
	if updatedTeam.CoCaptainName != "" {
		team.CoCaptainName = updatedTeam.CoCaptainName
	}
	if updatedTeam.CoCaptainEmail != "" {
		team.CoCaptainEmail = updatedTeam.CoCaptainEmail
	}
	return repo.UpdateTeam(team)

}

func AddNewTeam(team models.Team) (models.Team, error) {
	team.ID = uuid.NewString()
	return repo.AddNewTeam(team)
}

func DeleteTeam(id string) (models.Team, error) {
	return repo.DeleteTeamByID(id)
}
func GetTeamBySlug(slug string) (models.Team, error) {
	return repo.GetTeamBySlug(slug)
}
