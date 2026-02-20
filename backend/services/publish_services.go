package services

import (
	"backend/repo"
)

func Publish() error {
	matches, err := repo.GetAllMatches()
	if err != nil {
		return err
	}

	for _, match := range matches {
		switch match.EditingStatus {
		case "draft":
			match.EditingStatus = "published"
			repo.UpdateMatch(match)

		case "deleted":
			repo.DeleteMatch(match.ID)
		}
	}

	return nil
}
