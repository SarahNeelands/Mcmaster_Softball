package services

import (
	"backend/models"
	"backend/repo"

	"github.com/google/uuid"
)

func GetAllAnnouncements() ([]models.Announcement, error) {
	return repo.GetAnnouncements()
}

func GetArchivedAnnouncements() ([]models.Announcement, error) {
	allAnnouncements, err := repo.GetAnnouncements()
	if err != nil {
		return nil, err
	}
	var archived []models.Announcement
	for _, a := range allAnnouncements {
		if a.Archived {
			archived = append(archived, a)
		}
	}
	return archived, nil
}

func GetActiveAnnouncements() ([]models.Announcement, error) {
	allAnnouncements, err := repo.GetAnnouncements()
	if err != nil {
		return nil, err
	}

	var active []models.Announcement
	for _, a := range allAnnouncements {
		if !a.Archived {
			active = append(active, a)
		}
	}
	return active, nil
}

func CreateAnnouncement(title, content string, date string) (models.Announcement, error) {
	id := uuid.NewString()
	announcement := models.Announcement{
		ID:       id,
		Title:    title,
		Content:  content,
		Archived: false,
		Date:     date,
	}
	announcement, err := repo.AddNewAnnouncement(announcement)
	if err != nil {
		return models.Announcement{}, err
	}
	return announcement, nil
}

func EditAnnouncement(id string, title string, content string, date string, archived bool) (models.Announcement, error) {
	announcement, err := repo.GetAnnouncementByID(id)
	if err != nil {
		return models.Announcement{}, err
	}
	if title != "" {
		announcement.Title = title
	}

	if content != "" {
		announcement.Content = content
	}

	if date != "" {
		announcement.Date = date
	}

	announcement.Archived = archived
	result, err := repo.UpdateAnnouncement(announcement)
	return result, err
}
